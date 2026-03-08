import { create } from "zustand";
import { supabase } from "../lib/supabase";

/**
 * Session state machine:
 * IDLE -> ACTIVE (startSession)
 * ACTIVE -> GRACE_PERIOD (user taps "Continue" in shift-end modal)
 * ACTIVE -> IDLE (user taps "Sign-out" in shift-end modal)
 * GRACE_PERIOD -> IDLE (user taps button to sign out safely)
 * GRACE_PERIOD -> ALERT_SENT (grace period timeout, emergency alert sent)
 * ALERT_SENT -> IDLE (user completes 3s long-press, sendAlertClearedNotification)
 */
export type SessionStatus =
  | "IDLE"
  | "ACTIVE"
  | "GRACE_PERIOD"
  | "ALERT_SENT";

export const SESSION_STATUS_CONFIG: Record<
  SessionStatus,
  { label: string; subLabel: string; color: string }
> = {
  IDLE: {
    label: "No session active",
    subLabel: "Safety tracking is off",
    color: "#000000",
  },
  ACTIVE: {
    label: "Session active",
    subLabel: "Safety tracking on",
    color: "#16A34A",
  },
  GRACE_PERIOD: {
    label: "Grace period",
    subLabel: "Tap to sign out safely, or wait for alert",
    color: "#F97316",
  },
  ALERT_SENT: {
    label: "Emergency alert sent",
    subLabel: "Hold 3s to clear and return to idle",
    color: "#DC2626",
  },
};

// DB status values (lowercase) → store status
const DB_TO_STORE: Record<string, SessionStatus> = {
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
  restoreSession: (sessionId: string, status: SessionStatus) => void;
}

export const useSessionStore = create<SessionState>()((set, get) => ({
  status: "IDLE",
  sessionId: null,

  restoreSession: (sessionId, status) => set({ sessionId, status }),

  startSession: () => {
    set({ status: "ACTIVE" });
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
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
 * Called when grace period expires; triggers transition to ALERT_SENT.
 * Replace with real push/SMS notification implementation.
 */
export function sendEmergencyAlert(): void {
  if (__DEV__) {
    console.log("[Safety] sendEmergencyAlert() invoked");
  }
}

/**
 * Called when user taps to sign out safely during grace period.
 * Replace with real push/SMS notification implementation.
 */
export function sendSafeSignOutNotification(): void {
  if (__DEV__) {
    console.log("[Safety] sendSafeSignOutNotification() invoked");
  }
}

/**
 * Called when user completes 3s long-press in ALERT_SENT to clear and return to IDLE.
 * Replace with real push/SMS notification implementation.
 */
export function sendAlertClearedNotification(): void {
  if (__DEV__) {
    console.log("[Safety] sendAlertClearedNotification() invoked");
  }
}

export { DB_TO_STORE };
