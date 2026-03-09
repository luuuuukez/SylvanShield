/**
 * scripts/seed-users.ts
 *
 * Creates 10 test users in Supabase Auth and inserts matching profiles rows.
 *
 * Usage:
 *   npx ts-node --project tsconfig.json scripts/seed-users.ts
 *   (or: npx tsx scripts/seed-users.ts)
 *
 * Requires EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env"
  );
  process.exit(1);
}

// Admin client — bypasses RLS and can create auth users
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEST_PASSWORD = "SylvanShield2025!";

// 10 realistic Finnish test users
const SEED_USERS = [
  {
    name: "Mikael Lindqvist",
    email: "mikael.lindqvist@sylvanshield.test",
    phone: "+358401234001",
    role: "worker" as const,
    avatar_url: "https://randomuser.me/api/portraits/men/11.jpg",
  },
  {
    name: "Antti Mäkinen",
    email: "antti.makinen@sylvanshield.test",
    phone: "+358401234002",
    role: "worker" as const,
    avatar_url: "https://randomuser.me/api/portraits/men/22.jpg",
  },
  {
    name: "Sanna Korhonen",
    email: "sanna.korhonen@sylvanshield.test",
    phone: "+358401234003",
    role: "worker" as const,
    avatar_url: "https://randomuser.me/api/portraits/women/33.jpg",
  },
  {
    name: "Juhani Virtanen",
    email: "juhani.virtanen@sylvanshield.test",
    phone: "+358401234004",
    role: "worker" as const,
    avatar_url: "https://randomuser.me/api/portraits/men/44.jpg",
  },
  {
    name: "Päivi Leinonen",
    email: "paivi.leinonen@sylvanshield.test",
    phone: "+358401234005",
    role: "worker" as const,
    avatar_url: "https://randomuser.me/api/portraits/women/55.jpg",
  },
  {
    name: "Tero Hämäläinen",
    email: "tero.hamalainen@sylvanshield.test",
    phone: "+358401234006",
    role: "worker" as const,
    avatar_url: "https://randomuser.me/api/portraits/men/66.jpg",
  },
  {
    name: "Minna Saarinen",
    email: "minna.saarinen@sylvanshield.test",
    phone: "+358401234007",
    role: "worker" as const,
    avatar_url: "https://randomuser.me/api/portraits/women/77.jpg",
  },
  {
    name: "Petri Nieminen",
    email: "petri.nieminen@sylvanshield.test",
    phone: "+358401234008",
    role: "worker" as const,
    avatar_url: "https://randomuser.me/api/portraits/men/88.jpg",
  },
  {
    name: "Laura Heikkinen",
    email: "laura.heikkinen@sylvanshield.test",
    phone: "+358401234009",
    role: "worker" as const,
    avatar_url: "https://randomuser.me/api/portraits/women/9.jpg",
  },
  {
    name: "Markus Selin",
    email: "markus.selin@sylvanshield.test",
    phone: "+358401234010",
    role: "supervisor" as const,
    avatar_url: "https://randomuser.me/api/portraits/men/10.jpg",
  },
];

async function seedUsers() {
  console.log(`Seeding ${SEED_USERS.length} users into ${SUPABASE_URL}\n`);

  for (const user of SEED_USERS) {
    // 1. Create auth user
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: user.email,
        password: TEST_PASSWORD,
        email_confirm: true, // skip confirmation email for test users
      });

    if (authError) {
      // Skip if user already exists (idempotent re-run)
      if (authError.message.includes("already been registered")) {
        console.log(`  [skip] ${user.email} — already exists`);
        continue;
      }
      console.error(`  [error] ${user.email}:`, authError.message);
      continue;
    }

    const userId = authData.user.id;

    // 2. Upsert profile row (the DB trigger also creates one, but this adds
    //    the extra fields that the trigger doesn't populate)
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: userId,
          name: user.name,
          phone: user.phone,
          avatar_url: user.avatar_url,
          role: user.role,
        },
        { onConflict: "id" }
      );

    if (profileError) {
      console.error(`  [error] profile for ${user.email}:`, profileError.message);
    } else {
      console.log(`  [ok] ${user.name} <${user.email}> (${user.role}) — ${userId}`);
    }
  }

  console.log("\nDone.");
}

seedUsers().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
