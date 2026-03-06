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
import {
  IconAlert,
  IconBell,
  IconCloud,
  IconLocationPin,
  IconSun,
} from "../../src/components/icons";

/** Shift-end reminder duration in ACTIVE before showing modal (test: 5s). */
const SHIFT_END_DELAY_MS = 5000;
/** Grace period duration before auto emergency alert (test: 5s). */
const GRACE_PERIOD_MS = 5000;
/** Long-press duration in ALERT_SENT to clear and return to IDLE (3s). */
const LONG_PRESS_ALERT_CLEAR_MS = 3000;

const CARD_TITLES: Record<string, string> = {
  IDLE: SESSION_STATUS_CONFIG.IDLE.label,
  ACTIVE: "Työjakso käynnissä",
  GRACE_PERIOD: "Työaika ylitetty",
  ALERT_SENT: "Vastausta ei havaittu",
};

const CARD_SUBTITLES: Record<string, string> = {
  IDLE: SESSION_STATUS_CONFIG.IDLE.subLabel,
  ACTIVE: "Turvaseuranta ei ole käytössä",
  GRACE_PERIOD: "Kuittaa ulos vahvistaaksesi, että olet turvassa.",
  ALERT_SENT: "Hätäilmoitus on lähetetty\nturvakontaktillesi.",
};

function StateButtonGlow({
  status,
  children,
}: {
  status: "ACTIVE" | "GRACE_PERIOD" | "ALERT_SENT";
  children: React.ReactNode;
}) {
  const bgToken =
    status === "ACTIVE"
      ? "bg-state-active"
      : status === "GRACE_PERIOD"
        ? "bg-state-grace"
        : "bg-state-critical";
  const borderToken =
    status === "ACTIVE"
      ? "border-state-active"
      : status === "GRACE_PERIOD"
        ? "border-state-grace"
        : "border-state-critical";
  const shadowToken =
    status === "ACTIVE"
      ? "shadow-state-active"
      : status === "GRACE_PERIOD"
        ? "shadow-state-grace"
        : "shadow-state-critical";

  return (
    <View className="h-60 w-36 items-center justify-center">
      <View className="absolute left-0 top-0 h-60 w-36 items-center justify-center">
        <View
          className={`absolute -left-6 -top-6 h-[72px] w-48 rounded-button ${bgToken}/5`}
        />
        <View
          className={`absolute -left-4 -top-4 h-[72px] w-44 rounded-button ${bgToken}/5`}
        />
        <View
          className={`absolute -left-2 -top-2 h-64 w-40 rounded-button ${bgToken}/20`}
        />
      </View>
      <View
        className={`h-60 w-36 items-center justify-center rounded-button border-[1.5px] ${borderToken} ${bgToken} ${shadowToken}`}
      >
        {children}
      </View>
    </View>
  );
}

export default function WorkScreen() {
  const {
    status,
    startSession,
    stopSession,
    transitionToGracePeriod,
    transitionToAlertSent,
  } = useSessionStore();
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

  const cardBg =
    status === "ACTIVE"
      ? "bg-tint-active"
      : status === "GRACE_PERIOD"
        ? "bg-tint-grace"
        : status === "ALERT_SENT"
          ? "bg-tint-critical"
          : "bg-background-card";

  const titleColor =
    status === "ACTIVE"
      ? "text-state-active"
      : status === "GRACE_PERIOD"
        ? "text-state-grace"
        : status === "ALERT_SENT"
          ? "text-state-critical"
          : "text-labels-primary";

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={["top"]}>
      <View className="flex-1 px-6">
        {/* Row: Kello (left) / Sää (right) */}
        <View className="flex-row justify-between">
          <View className="gap-2">
            <Text className="text-caption text-xs">Kello</Text>
            <Text className="text-primary text-4xl font-bold tracking-wide">
              07:56
            </Text>
          </View>
          <View className="gap-2">
            <Text className="text-caption text-xs">Sää</Text>
            <View className="gap-1">
              <View className="flex-row items-center gap-1">
                <IconSun color="#EDA36E" />
                <Text className="text-primary text-base">-20°C</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <IconCloud color="#8AA2D7" />
                <Text className="text-primary text-base">18 km/h NW</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Card */}
        <View className={`mt-6 overflow-hidden rounded-card p-6 ${cardBg}`}>
          <Text className={`text-center text-xl font-bold ${titleColor}`}>
            {CARD_TITLES[status]}
          </Text>
          <Text className="mt-2 text-center text-base text-primary">
            {CARD_SUBTITLES[status]}
          </Text>

          {/* Location row (above button for ACTIVE/GRACE/ALERT per design) */}
          <View className="mt-6 flex-row items-center justify-center gap-1">
            <IconLocationPin color="#333333" />
            <Text className="text-base text-primary">Kuhasalo</Text>
          </View>

          {/* Button area */}
          <View className="mt-8 items-center">
            {status === "IDLE" && (
              <TouchableOpacity
                onPress={startSession}
                activeOpacity={0.8}
                className="h-60 w-36 flex items-center justify-center rounded-button bg-zinc-800 shadow-[0px_4px_8px_1px_rgba(56,91,61,0.25)]"
                accessibilityRole="button"
                accessibilityLabel="Aloita"
              >
                <Text className="text-base font-medium text-white">Aloita</Text>
              </TouchableOpacity>
            )}

            {status === "ACTIVE" && (
              <StateButtonGlow status="ACTIVE">
                <Text className="text-center text-base text-white">
                  Kuittaa Ulos
                </Text>
              </StateButtonGlow>
            )}

            {status === "GRACE_PERIOD" && (
              <TouchableOpacity
                onPress={handleGracePeriodSignOut}
                activeOpacity={0.8}
                className="w-full items-center justify-center"
                accessibilityRole="button"
                accessibilityLabel="Kuittaa ulos"
              >
                <StateButtonGlow status="GRACE_PERIOD">
                  <Text className="text-center text-base text-white">
                    Kuittaa Ulos
                  </Text>
                </StateButtonGlow>
              </TouchableOpacity>
            )}

            {status === "ALERT_SENT" && (
              <TouchableOpacity
                onLongPress={handleAlertClearedLongPress}
                delayLongPress={LONG_PRESS_ALERT_CLEAR_MS}
                activeOpacity={0.8}
                className="w-full items-center justify-center"
                accessibilityRole="button"
                accessibilityLabel="Pidä pitkään nollataksesi"
              >
                <StateButtonGlow status="ALERT_SENT">
                  <Text className="text-center text-base text-white">
                    Kuittaa Ulos
                  </Text>
                </StateButtonGlow>
              </TouchableOpacity>
            )}
          </View>

          {/* Grace period footnote */}
          {status === "GRACE_PERIOD" && (
            <Text className="mt-8 text-center text-xs text-state-grace">
              Hälytys lähetetään 15 minuutin kuluttua.
            </Text>
          )}

          {/* Alert-sent footnote */}
          {status === "ALERT_SENT" && (
            <Text className="mt-8 text-center text-xs text-state-critical">
              Peruuta painamalla painiketta pitkään
            </Text>
          )}
        </View>

        {/* Bottom row: Turvakontakti | Suunniteltu työaika */}
        <View className="mt-8 flex-row justify-between gap-4">
          <View className="flex-1 gap-2">
            <Text className="text-caption text-xs">Turvakontakti</Text>
            <View className="flex-row items-center gap-1">
              <View className="h-7 w-7 rounded-full bg-primary" />
              <Text className="text-base text-primary">Anna Svensson</Text>
              <IconBell bg="#333333" fg="white" />
            </View>
          </View>
          <View className="flex-1 gap-2 items-end">
            <Text className="text-caption text-xs">Suunniteltu työaika</Text>
            <Text className="text-xl text-primary">8:00 - 17:00</Text>
          </View>
        </View>
      </View>

      {/* Shift-end modal: black overlay + white card */}
      <Modal
        visible={showShiftEndModal}
        transparent
        animationType="fade"
        onRequestClose={handleModalSignOut}
      >
        <View className="flex-1 bg-overlay justify-center items-center px-6">
          <View className="w-80 overflow-hidden rounded-modal bg-white">
            <View className="items-center pt-9">
              <IconAlert color="#FA8B46" width={40} height={40} />
            </View>
            <Text className="mt-4 text-center text-xl font-bold text-alert px-8">
              Työjakso päättyi
            </Text>
            <Text className="mt-3 text-center text-base text-primary px-8">
              Vahvista, että olet turvassa
            </Text>
            <Text className="mt-2 text-center text-caption text-xs px-8">
              Hälytys lähetetään, jos et vastaa
            </Text>
            <View className="px-10 pt-8 pb-10 gap-4">
              <TouchableOpacity
                onPress={handleModalSignOut}
                activeOpacity={0.8}
                className="h-14 w-60 items-center justify-center self-center rounded-button bg-black"
                accessibilityRole="button"
                accessibilityLabel="Kuittaa ulos"
              >
                <Text className="text-base text-white">Kuittaa Ulos</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleModalContinue}
                activeOpacity={0.8}
                className="h-14 w-60 items-center justify-center self-center rounded-button border border-black bg-white"
                accessibilityRole="button"
                accessibilityLabel="Työ jatkuu"
              >
                <Text className="text-base text-primary">Työ Jatkuu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
