import { create } from "zustand";

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

export interface SessionState {
  status: SessionStatus;
  startSession: () => void;
  stopSession: () => void;
  transitionToGracePeriod: () => void;
  transitionToAlertSent: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  status: "IDLE",
  startSession: () => set({ status: "ACTIVE" }),
  stopSession: () => set({ status: "IDLE" }),
  transitionToGracePeriod: () => set({ status: "GRACE_PERIOD" }),
  transitionToAlertSent: () => set({ status: "ALERT_SENT" }),
}));

/**
 * Called when grace period expires; triggers transition to ALERT_SENT.
 * Replace with real API/notification implementation.
 */
export function sendEmergencyAlert(): void {
  if (__DEV__) {
    console.log("[Safety] sendEmergencyAlert() invoked");
  }
}

/**
 * Called when user taps to sign out safely during grace period.
 * Replace with real API/notification implementation.
 */
export function sendSafeSignOutNotification(): void {
  if (__DEV__) {
    console.log("[Safety] sendSafeSignOutNotification() invoked");
  }
}

/**
 * Called when user completes 3s long-press in ALERT_SENT to clear and return to IDLE.
 * Replace with real API/notification implementation.
 */
export function sendAlertClearedNotification(): void {
  if (__DEV__) {
    console.log("[Safety] sendAlertClearedNotification() invoked");
  }
}
