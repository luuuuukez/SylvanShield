import { useSessionStore, DB_TO_STORE, SessionStatus } from "../src/store/useSessionStore";

// Mock Supabase to prevent real network calls
jest.mock("../src/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    }),
    functions: {
      invoke: jest.fn().mockResolvedValue({ data: null, error: null }),
    },
  },
}));

// jest-expo provides this global, define it as a fallback
(global as Record<string, unknown>).__DEV__ = true;

beforeEach(() => {
  useSessionStore.setState({ status: "IDLE", sessionId: null });
});

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------
describe("Initial state", () => {
  it("is IDLE with no sessionId", () => {
    const { status, sessionId } = useSessionStore.getState();
    expect(status).toBe("IDLE");
    expect(sessionId).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// State transitions
// ---------------------------------------------------------------------------
describe("State transitions", () => {
  it("startSession() → ACTIVE", () => {
    useSessionStore.getState().startSession();
    expect(useSessionStore.getState().status).toBe("ACTIVE");
  });

  it("transitionToGracePeriod() from ACTIVE → GRACE_PERIOD", () => {
    useSessionStore.setState({ status: "ACTIVE", sessionId: "sess-1" });
    useSessionStore.getState().transitionToGracePeriod();
    expect(useSessionStore.getState().status).toBe("GRACE_PERIOD");
  });

  it("transitionToAlertSent() from GRACE_PERIOD → ALERT_SENT", () => {
    useSessionStore.setState({ status: "GRACE_PERIOD", sessionId: "sess-1" });
    useSessionStore.getState().transitionToAlertSent();
    expect(useSessionStore.getState().status).toBe("ALERT_SENT");
  });

  it("stopSession() → IDLE with null sessionId", () => {
    useSessionStore.setState({ status: "ACTIVE", sessionId: "sess-1" });
    useSessionStore.getState().stopSession();
    const { status, sessionId } = useSessionStore.getState();
    expect(status).toBe("IDLE");
    expect(sessionId).toBeNull();
  });

  it("restoreSession(id, status) restores both fields", () => {
    useSessionStore.getState().restoreSession("restored-id", "GRACE_PERIOD");
    const { status, sessionId } = useSessionStore.getState();
    expect(status).toBe("GRACE_PERIOD");
    expect(sessionId).toBe("restored-id");
  });

  it("restoreSession() works for every valid SessionStatus", () => {
    const validStatuses: SessionStatus[] = ["ACTIVE", "GRACE_PERIOD", "ALERT_SENT", "IDLE"];
    for (const s of validStatuses) {
      useSessionStore.getState().restoreSession("test-id", s);
      expect(useSessionStore.getState().status).toBe(s);
      expect(useSessionStore.getState().sessionId).toBe("test-id");
    }
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------
describe("Edge cases", () => {
  it("stopSession() when already IDLE keeps status IDLE and sessionId null", () => {
    useSessionStore.getState().stopSession();
    const { status, sessionId } = useSessionStore.getState();
    expect(status).toBe("IDLE");
    expect(sessionId).toBeNull();
  });

  it("transitionToGracePeriod() when not ACTIVE does nothing", () => {
    // Called from IDLE — should be a no-op
    useSessionStore.getState().transitionToGracePeriod();
    expect(useSessionStore.getState().status).toBe("IDLE");

    // Called from ALERT_SENT — should also be a no-op
    useSessionStore.setState({ status: "ALERT_SENT", sessionId: "sess-1" });
    useSessionStore.getState().transitionToGracePeriod();
    expect(useSessionStore.getState().status).toBe("ALERT_SENT");
  });

  it("restoreSession() with an unknown DB status string is handled by caller using DB_TO_STORE", () => {
    // DB_TO_STORE returns undefined for unknown keys, so the caller's `if (mapped)` guard
    // prevents restoreSession from ever being called with an invalid value.
    const mapped = DB_TO_STORE["completely_unknown_status"];
    expect(mapped).toBeUndefined();
    // State remains IDLE because restoreSession was never called
    expect(useSessionStore.getState().status).toBe("IDLE");
  });
});

// ---------------------------------------------------------------------------
// DB_TO_STORE mapping
// ---------------------------------------------------------------------------
describe("DB_TO_STORE mapping", () => {
  it("maps active → ACTIVE", () => {
    expect(DB_TO_STORE["active"]).toBe("ACTIVE");
  });

  it("maps grace_period → GRACE_PERIOD", () => {
    expect(DB_TO_STORE["grace_period"]).toBe("GRACE_PERIOD");
  });

  it("maps alert_sent → ALERT_SENT", () => {
    expect(DB_TO_STORE["alert_sent"]).toBe("ALERT_SENT");
  });

  it("returns undefined for unknown DB status", () => {
    expect(DB_TO_STORE["completed"]).toBeUndefined();
    expect(DB_TO_STORE["unknown"]).toBeUndefined();
  });
});
