import { create } from "zustand";

export type SessionStatus = "IDLE" | "ACTIVE" | "WARNING" | "CRITICAL";

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
  WARNING: {
    label: "Työaika ylitetty",
    subLabel: "Grace period",
    color: "#F97316",
  },
  CRITICAL: {
    label: "Vastausta ei havaittu",
    subLabel: "Timeout",
    color: "#DC2626",
  },
};

export interface SessionState {
  status: SessionStatus;
  startSession: () => void;
  stopSession: () => void;
  setWarning: () => void;
  setCritical: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  status: "IDLE",
  startSession: () => set({ status: "ACTIVE" }),
  stopSession: () => set({ status: "IDLE" }),
  setWarning: () => set({ status: "WARNING" }),
  setCritical: () => set({ status: "CRITICAL" }),
}));
