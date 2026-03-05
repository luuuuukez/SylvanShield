import { useEffect, useRef, useState } from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useSessionStore,
  SESSION_STATUS_CONFIG,
  sendEmergencyAlert,
  sendSafeSignOutNotification,
  sendAlertClearedNotification,
} from "../../src/store/useSessionStore";

/** Shift-end reminder duration in ACTIVE before showing modal (test: 5s). */
const SHIFT_END_DELAY_MS = 5000;
/** Grace period duration before auto emergency alert (test: 5s). */
const GRACE_PERIOD_MS = 5000;
/** Long-press duration in ALERT_SENT to clear and return to IDLE (3s). */
const LONG_PRESS_ALERT_CLEAR_MS = 3000;

export default function WorkScreen() {
  const {
    status,
    startSession,
    stopSession,
    transitionToGracePeriod,
    transitionToAlertSent,
  } = useSessionStore();
  const config = SESSION_STATUS_CONFIG[status];
  const [showShiftEndModal, setShowShiftEndModal] = useState(false);

  const shiftEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gracePeriodTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearShiftEndTimer = () => {
    if (shiftEndTimerRef.current != null) {
      clearTimeout(shiftEndTimerRef.current);
      shiftEndTimerRef.current = null;
    }
  };

  const clearGracePeriodTimer = () => {
    if (gracePeriodTimerRef.current != null) {
      clearTimeout(gracePeriodTimerRef.current);
      gracePeriodTimerRef.current = null;
    }
  };

  // When ACTIVE, schedule shift-end modal after SHIFT_END_DELAY_MS.
  useEffect(() => {
    if (status !== "ACTIVE") {
      clearShiftEndTimer();
      return;
    }
    shiftEndTimerRef.current = setTimeout(() => {
      shiftEndTimerRef.current = null;
      setShowShiftEndModal(true);
    }, SHIFT_END_DELAY_MS);
    return clearShiftEndTimer;
  }, [status]);

  // When GRACE_PERIOD, schedule emergency alert after GRACE_PERIOD_MS.
  useEffect(() => {
    if (status !== "GRACE_PERIOD") {
      clearGracePeriodTimer();
      return;
    }
    gracePeriodTimerRef.current = setTimeout(() => {
      gracePeriodTimerRef.current = null;
      sendEmergencyAlert();
      transitionToAlertSent();
    }, GRACE_PERIOD_MS);
    return clearGracePeriodTimer;
  }, [status, transitionToAlertSent]);

  const handleModalContinue = () => {
    setShowShiftEndModal(false);
    transitionToGracePeriod();
  };

  const handleModalSignOut = () => {
    setShowShiftEndModal(false);
    stopSession();
  };

  const handleGracePeriodSignOut = () => {
    sendSafeSignOutNotification();
    stopSession();
  };

  const handleAlertClearedLongPress = () => {
    sendAlertClearedNotification();
    stopSession();
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-1 justify-center px-6">
        <Text
          className="text-xl font-bold mb-2"
          style={{ color: config.color }}
        >
          {config.label}
        </Text>
        <Text className="text-sm text-gray-500 mb-6">{config.subLabel}</Text>

        {status === "IDLE" && (
          <TouchableOpacity
            onPress={startSession}
            activeOpacity={0.8}
            className="rounded-full py-4 items-center justify-center"
            style={{ backgroundColor: config.color }}
            accessibilityRole="button"
            accessibilityLabel="Start"
          >
            <Text className="text-white text-lg font-semibold">Start</Text>
          </TouchableOpacity>
        )}

        {status === "ACTIVE" && (
          <View className="rounded-full py-4 items-center justify-center bg-gray-300">
            <Text className="text-gray-600 text-lg font-semibold">
              Shift in progress – modal in {SHIFT_END_DELAY_MS / 1000}s
            </Text>
          </View>
        )}

        {status === "GRACE_PERIOD" && (
          <TouchableOpacity
            onPress={handleGracePeriodSignOut}
            activeOpacity={0.8}
            className="rounded-full py-4 items-center justify-center"
            style={{ backgroundColor: config.color }}
            accessibilityRole="button"
            accessibilityLabel="Sign out safely"
          >
            <Text className="text-white text-lg font-semibold">
              Sign out safely
            </Text>
          </TouchableOpacity>
        )}

        {status === "ALERT_SENT" && (
          <TouchableOpacity
            onLongPress={handleAlertClearedLongPress}
            delayLongPress={LONG_PRESS_ALERT_CLEAR_MS}
            activeOpacity={0.8}
            className="rounded-full py-4 items-center justify-center"
            style={{ backgroundColor: config.color }}
            accessibilityRole="button"
            accessibilityLabel="Hold 3s to clear alert and return to idle"
          >
            <Text className="text-white text-lg font-semibold">
              Hold 3s to clear and return to idle
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={showShiftEndModal}
        transparent
        animationType="fade"
        onRequestClose={handleModalSignOut}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <Text className="text-lg font-bold text-gray-900 mb-2">
              Shift ended
            </Text>
            <Text className="text-gray-600 mb-6">
              Continue working or sign out?
            </Text>
            <TouchableOpacity
              onPress={handleModalContinue}
              activeOpacity={0.8}
              className="rounded-xl py-3.5 items-center justify-center bg-green-600 mb-3"
            >
              <Text className="text-white font-semibold">Continue</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleModalSignOut}
              activeOpacity={0.8}
              className="rounded-xl py-3.5 items-center justify-center border border-gray-300"
            >
              <Text className="text-gray-800 font-semibold">Sign-out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
