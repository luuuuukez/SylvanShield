import { create } from "zustand";
import { supabase } from "../lib/supabase";

/**
 * Session state machine:
 * IDLE → ACTIVE (startSession)
 * ACTIVE → GRACE_PERIOD (transitionToGracePeriod, after shift-end modal)
 * ACTIVE → IDLE (stopSession, user signs out from modal)
 * GRACE_PERIOD → IDLE (stopSession, user signs out safely)
 * GRACE_PERIOD → ALERT_SENT (transitionToAlertSent, grace period timeout)
 * ALERT_SENT → IDLE (stopSession, user completes 3s long-press)
 */

export type SessionStatus = "IDLE" | "ACTIVE" | "GRACE_PERIOD" | "ALERT_SENT";

export const SESSION_STATUS_CONFIG: Record<
  SessionStatus,
  { label: string; subLabel: string; color: string }
> = {
  IDLE: {
    label: "Ei työjaksoa käynnissä",
    subLabel: "Turvaseuranta ei ole käytössä",
    color: "#000000",
  },
  ACTIVE: {
    label: "Työjakso käynnissä",
    subLabel: "Turvaseuranta käytössä",
    color: "#16A34A",
  },
  GRACE_PERIOD: {
    label: "Työaika ylitetty",
    subLabel: "Kuittaa ulos tai odota hälytystä",
    color: "#F97316",
  },
  ALERT_SENT: {
    label: "Vastausta ei havaittu",
    subLabel: "Pidä painiketta 3 s peruuttaaksesi",
    color: "#DC2626",
  },
};

// DB status strings (lowercase) → store status
export const DB_TO_STORE: Record<string, SessionStatus> = {
  active: "ACTIVE",
  grace_period: "GRACE_PERIOD",
  alert_sent: "ALERT_SENT",
};

export interface SessionState {
  status: SessionStatus;
  sessionId: string | null;
  startSession: () => void;
  stopSession: () => void;
  transitionToGracePeriod: () => void;
  transitionToAlertSent: () => void;
  restoreSession: (id: string, status: SessionStatus) => void;
}

export const useSessionStore = create<SessionState>()((set, get) => ({
  status: "IDLE",
  sessionId: null,

  restoreSession: (id, status) => set({ sessionId: id, status }),

  startSession: () => {
    set({ status: "ACTIVE" });
    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: contact } = await supabase
        .from("safety_contacts")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

      const { data: session } = await supabase
        .from("work_sessions")
        .insert({
          user_id: user.id,
          safety_contact_id: contact?.id ?? null,
          start_time: new Date().toISOString(),
          status: "active",
        })
        .select("id")
        .single();

      if (session) set({ sessionId: session.id });
    })();
  },

  transitionToGracePeriod: () => {
    set({ status: "GRACE_PERIOD" });
    const { sessionId } = get();
    if (!sessionId) return;
    void supabase
      .from("work_sessions")
      .update({ status: "grace_period" })
      .eq("id", sessionId);
  },

  transitionToAlertSent: () => {
    set({ status: "ALERT_SENT" });
    const { sessionId } = get();
    if (!sessionId) return;
    void (async () => {
      await supabase
        .from("work_sessions")
        .update({ status: "alert_sent" })
        .eq("id", sessionId);
      await supabase
        .from("alerts")
        .insert({ session_id: sessionId, reason: "grace_period_expired", status: "sent" });
    })();
  },

  stopSession: () => {
    const { sessionId } = get();
    set({ status: "IDLE", sessionId: null });
    if (!sessionId) return;
    void supabase
      .from("work_sessions")
      .update({ status: "completed", actual_end_time: new Date().toISOString() })
      .eq("id", sessionId);
  },
}));

/**
 * Calls the send-alert Edge Function for the given session.
 * Invoked when grace period expires or the user manually triggers an alert.
 */
export async function sendEmergencyAlert(sessionId: string): Promise<void> {
  await supabase.functions.invoke("send-alert", {
    body: { session_id: sessionId },
  });
}

/**
 * Called when the user signs out safely during grace period.
 */
export function sendSafeSignOutNotification(): void {
  if (__DEV__) {
    console.log("[Safety] sendSafeSignOutNotification() invoked");
  }
}

/**
 * Called when the user completes the 3s long-press in ALERT_SENT to cancel the alert.
 */
export function sendAlertClearedNotification(): void {
  if (__DEV__) {
    console.log("[Safety] sendAlertClearedNotification() invoked");
  }
}
