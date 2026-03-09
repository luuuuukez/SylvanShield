

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  try {
    const { session_id } = await req.json();
    if (!session_id) {
      return new Response(JSON.stringify({ error: "session_id required" }), { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch session + worker + safety contact
    const { data: session, error } = await supabase
      .from("work_sessions")
      .select(`
        id,
        expected_end_time,
        profiles!user_id(name),
        safety_contacts!safety_contact_id(name, email, phone)
      `)
      .eq("id", session_id)
      .single();

    if (error || !session) {
      return new Response(JSON.stringify({ error: "Session not found" }), { status: 404 });
    }

    const profileRaw = session.profiles as any;
    const contactRaw = session.safety_contacts as any;
    const workerName = (Array.isArray(profileRaw) ? profileRaw[0] : profileRaw)?.name ?? "Tuntematon";
    const contact = Array.isArray(contactRaw) ? contactRaw[0] : contactRaw;

    if (!contact?.email) {
      return new Response(JSON.stringify({ error: "No email for safety contact" }), { status: 400 });
    }

    // Send email via Resend
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "SylvanShield <onboarding@resend.dev>",
        to: [contact.email],
        subject: `🚨 Hätäilmoitus – ${workerName}`,
        html: `
          <h2>Hätäilmoitus lähetetty</h2>
          <p>Työntekijä <strong>${workerName}</strong> ei ole kirjautunut ulos ajoissa.</p>
          <p>Turvajärjestelmä on lähettänyt tämän ilmoituksen automaattisesti.</p>
          <p>Ota yhteyttä työntekijään välittömästi.</p>
          <hr/>
          <p style="color: #999; font-size: 12px;">SylvanShield – Metsätyöntekijöiden turvavalvonta</p>
        `,
      }),
    });

    const emailData = await emailRes.json();
    console.log("[send-alert] Resend response:", emailData);

    return new Response(JSON.stringify({ success: true, email: emailData }), { status: 200 });
  } catch (err) {
    console.error("[send-alert] error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});