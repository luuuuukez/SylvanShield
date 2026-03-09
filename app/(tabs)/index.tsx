import { useEffect, useRef, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import {
  useSessionStore,
  SESSION_STATUS_CONFIG,
  DB_TO_STORE,
  sendEmergencyAlert,
  sendSafeSignOutNotification,
  sendAlertClearedNotification,
} from "../../src/store/useSessionStore";
import { supabase } from "../../src/lib/supabase";
import {
  IconAlert,
  IconBell,
  IconWind,
  IconLocationPin,
  IconSun,
  IconPartlyCloudy,
  IconCloudy,
  IconRain,
  IconThunderstorm,
  IconSnow,
  IconFog,
} from "../../src/components/icons";

/** Shift-end reminder duration in ACTIVE before showing modal (test: 5s). */
const SHIFT_END_DELAY_MS = 5000;
/** Grace period duration before auto emergency alert (test: 5s). */
const GRACE_PERIOD_MS = 5000;
/** Long-press duration in ALERT_SENT to clear and return to IDLE (3s). */
const LONG_PRESS_ALERT_CLEAR_MS = 3000;
/** Button height (h-60 = 240px) used for fill animation. */
const ALERT_BUTTON_HEIGHT = 240;

function getSecondsRemaining(endHour: number, endMin: number): number {
  const now = new Date();
  const end = new Date();
  end.setHours(endHour, endMin, 0, 0);
  return Math.floor((end.getTime() - now.getTime()) / 1000);
}

/** Parse a Postgres time string "HH:MM:SS" → { hour, min, label "HH:MM" } */
function parseTime(t: string): { hour: number; min: number; label: string } {
  const [h, m] = t.split(":").map(Number);
  return { hour: h, min: m, label: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}` };
}

function formatCountdown(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

type WeatherKey = "sunny" | "partly_cloudy" | "cloudy" | "rain" | "thunderstorm" | "snow" | "fog";

type WeatherData = {
  condition: WeatherKey;
  label: string;
  temp: number;
  windSpeed: number;
  windDir: string;
};

function weatherCodeToCondition(code: number): { condition: WeatherKey; label: string } {
  if (code === 0) return { condition: "sunny", label: "Selkeää" };
  if (code === 1 || code === 2) return { condition: "partly_cloudy", label: "Puolipilvistä" };
  if (code === 3) return { condition: "cloudy", label: "Pilvistä" };
  if ([45, 48].includes(code)) return { condition: "fog", label: "Sumuista" };
  if ([51, 53, 55, 61, 63, 65].includes(code)) return { condition: "rain", label: "Sadetta" };
  if ([71, 73, 75, 77].includes(code)) return { condition: "snow", label: "Lumisadetta" };
  if ([95, 96, 99].includes(code)) return { condition: "thunderstorm", label: "Ukkosta" };
  return { condition: "cloudy", label: "Pilvistä" };
}

function degreesToCompass(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

function WeatherIcon({ condition }: { condition: WeatherKey }) {
  switch (condition) {
    case "sunny":         return <IconSun color="#EDA36E" />;
    case "partly_cloudy": return <IconPartlyCloudy />;
    case "cloudy":        return <IconCloudy />;
    case "rain":          return <IconRain />;
    case "thunderstorm":  return <IconThunderstorm />;
    case "snow":          return <IconSnow />;
    case "fog":           return <IconFog />;
  }
}

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
  ALERT_SENT: "Hätäilmoitus on lähetetty turvakontaktillesi.",
};

function StateButtonGlow({
  status,
  children,
  onPress,
  onPressIn,
  onPressOut,
}: {
  status: "ACTIVE" | "GRACE_PERIOD" | "ALERT_SENT";
  children: React.ReactNode;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
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
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        className={`h-60 w-36 items-center justify-center rounded-button border-[1.5px] ${borderToken} ${bgToken} ${shadowToken}`}
        style={{ overflow: "hidden" }}
      >
        {children}
      </Pressable>
    </View>
  );
}

export default function WorkScreen() {
  const {
    status,
    sessionId,
    startSession,
    stopSession,
    transitionToGracePeriod,
    transitionToAlertSent,
    restoreSession,
  } = useSessionStore();
  const [showShiftEndModal, setShowShiftEndModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

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
      if (sessionId) void sendEmergencyAlert(sessionId);
      transitionToAlertSent();
    }, GRACE_PERIOD_MS);
    return clearGracePeriodTimer;
  }, [status, sessionId, transitionToAlertSent]);

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

  type SafeContact = { name: string | null; avatar_url: string | null };
  const [safeContact, setSafeContact] = useState<SafeContact | null>(null);

  type Schedule = { startLabel: string; endLabel: string; endHour: number; endMin: number };
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setScheduleLoading(false); return; }

      const [contactRes, profileRes] = await Promise.all([
        supabase
          .from("safety_contacts")
          .select("name, avatar_url")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .single(),
        supabase
          .from("profiles")
          .select("planned_start, planned_end")
          .eq("id", user.id)
          .single(),
      ]);

      if (contactRes.data) setSafeContact(contactRes.data);

      // Restore any in-progress session started today (e.g. app closed mid-session)
      const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
      const { data: existingSession } = await supabase
        .from("work_sessions")
        .select("id, status")
        .eq("user_id", user.id)
        .in("status", ["active", "grace_period", "alert_sent"])
        .gte("start_time", todayStart)
        .order("start_time", { ascending: false })
        .limit(1)
        .single();

      if (existingSession) {
        const mapped = DB_TO_STORE[existingSession.status];
        if (mapped) restoreSession(existingSession.id, mapped);
      }

      if (profileRes.data?.planned_start && profileRes.data?.planned_end) {
        const start = parseTime(profileRes.data.planned_start);
        const end = parseTime(profileRes.data.planned_end);
        setSchedule({ startLabel: start.label, endLabel: end.label, endHour: end.hour, endMin: end.min });
      }
      setScheduleLoading(false);
    }
    fetchUserData();
  }, [restoreSession]);

  const endHour = schedule?.endHour ?? 17;
  const endMin = schedule?.endMin ?? 0;

  const [secondsLeft, setSecondsLeft] = useState(() => getSecondsRemaining(endHour, endMin));

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const { status: perm } = await Location.requestForegroundPermissionsAsync();
        if (perm !== "granted") { setWeatherLoading(false); return; }
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
        const { latitude: lat, longitude: lon } = pos.coords;
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,windspeed_10m,winddirection_10m,weathercode`
        );
        const json = await res.json();
        const { temperature_2m, windspeed_10m, winddirection_10m, weathercode } = json.current;
        const { condition, label } = weatherCodeToCondition(weathercode);
        setWeather({
          condition,
          label,
          temp: Math.round(temperature_2m),
          windSpeed: Math.round(windspeed_10m),
          windDir: degreesToCompass(winddirection_10m),
        });
      } catch {
        // fail silently, weather stays null
      } finally {
        setWeatherLoading(false);
      }
    }
    fetchWeather();
  }, []);

  const [clockTime, setClockTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  });

  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      setClockTime(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (status === "IDLE") return;
    setSecondsLeft(getSecondsRemaining(endHour, endMin));
    const id = setInterval(() => setSecondsLeft(getSecondsRemaining(endHour, endMin)), 1000);
    return () => clearInterval(id);
  }, [status, endHour, endMin]);

  const fillProgress = useSharedValue(0);
  const fillAnimStyle = useAnimatedStyle(() => ({
    height: fillProgress.value,
  }));

  const handleAlertPressIn = () => {
    fillProgress.value = 0;
    fillProgress.value = withTiming(
      ALERT_BUTTON_HEIGHT,
      { duration: LONG_PRESS_ALERT_CLEAR_MS },
      (finished) => {
        if (finished) runOnJS(handleAlertClearedLongPress)();
      }
    );
  };

  const handleAlertPressOut = () => {
    fillProgress.value = withTiming(0, { duration: 200 });
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
      <View className="flex-1 px-6 pt-[60px]">
        {/* Row: Kello (left) / Sää (right) */}
        <View className="flex-row justify-between items-center">
          <View className="gap-2">
            <Text className="text-secondary text-xs">Kello</Text>
            <Text className="text-primary text-4xl font-bold tracking-wide">
              {clockTime}
            </Text>
          </View>
          <View className="gap-2">
            <Text className="text-secondary text-xs">Sää</Text>
            {weatherLoading ? (
              <Text className="text-primary text-base">Ladataan...</Text>
            ) : weather ? (
              <View className="gap-1">
                <View className="flex-row items-center gap-1">
                  <WeatherIcon condition={weather.condition} />
                  <Text className="text-primary text-base">{weather.temp}°C</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <IconWind color="#8AA2D7" />
                  <Text className="text-primary text-base">{weather.windSpeed} km/h {weather.windDir}</Text>
                </View>
              </View>
            ) : null}
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
              <StateButtonGlow
                status="GRACE_PERIOD"
                onPress={handleGracePeriodSignOut}
              >
                <Text className="text-center text-base text-white">
                  Kuittaa Ulos
                </Text>
              </StateButtonGlow>
            )}

            {status === "ALERT_SENT" && (
              <StateButtonGlow
                status="ALERT_SENT"
                onPressIn={handleAlertPressIn}
                onPressOut={handleAlertPressOut}
              >
                <Animated.View
                  style={[
                    {
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      backgroundColor: "#EF4444",
                    },
                    fillAnimStyle,
                  ]}
                />
                <Text
                  className="text-center text-base text-white"
                  style={{ zIndex: 1 }}
                >
                  Kuittaa Ulos
                </Text>
              </StateButtonGlow>
            )}
          </View>

          <View className="mt-8 h-8 items-center justify-center">
            {status === "GRACE_PERIOD" && (
              <Text className="text-center text-xs text-state-grace">
                Hälytys lähetetään 15 minuutin kuluttua.
              </Text>
            )}
            {status === "ALERT_SENT" && (
              <Text className="text-center text-xs text-state-critical">
                Peruuta painamalla painiketta pitkään
              </Text>
            )}
          </View>
        </View>

        {/* Bottom row: Turvakontakti | Suunniteltu työaika */}
        <View className="mt-8 flex-row justify-between gap-4">
          <View className="flex-1 gap-2">
            <Text className="text-secondary text-xs">Turvahenkilö</Text>
            <View className="flex-row items-center gap-1">
              {safeContact?.avatar_url ? (
                <Image
                  source={{ uri: safeContact.avatar_url }}
                  style={{ width: 28, height: 28, borderRadius: 14 }}
                  resizeMode="cover"
                />
              ) : (
                <View className="h-7 w-7 rounded-full bg-background-card" />
              )}
              <Text className="text-base text-primary">
                {safeContact?.name ?? "Ei asetettu"}
              </Text>
              <TouchableOpacity onPress={() => setShowEmergencyModal(true)} activeOpacity={0.7}>
                <IconBell bg="#333333" fg="white" />
              </TouchableOpacity>
            </View>
          </View>
          <View className="flex-1 gap-2 items-end">
            {status === "IDLE" ? (
              <>
                <Text className="text-secondary text-xs">Suunniteltu työaika</Text>
                <Text className="text-xl text-primary">
                  {scheduleLoading
                    ? "Ladataan..."
                    : schedule
                      ? `${schedule.startLabel} - ${schedule.endLabel}`
                      : "—"}
                </Text>
              </>
            ) : (
              <>
                <Text className="text-secondary text-xs">Aikaa jäljellä</Text>
                {secondsLeft > 0 ? (
                  <Text
                    className={`text-xl font-bold ${
                      status === "ACTIVE"
                        ? "text-state-active"
                        : status === "GRACE_PERIOD"
                          ? "text-state-grace"
                          : "text-state-critical"
                    }`}
                    style={{ fontVariant: ["tabular-nums"] }}
                  >
                    {formatCountdown(secondsLeft)}
                  </Text>
                ) : (
                  <Text
                    className={`text-xl font-bold ${
                      status === "ACTIVE"
                        ? "text-state-active"
                        : status === "GRACE_PERIOD"
                          ? "text-state-grace"
                          : "text-state-critical"
                    }`}
                  >
                    Aika ylitetty
                  </Text>
                )}
              </>
            )}
          </View>
        </View>
      </View>

      {/* Emergency alert confirmation modal */}
      <Modal
        visible={showEmergencyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEmergencyModal(false)}
      >
        <View className="flex-1 bg-overlay justify-center items-center px-6">
          <View className="w-80 overflow-hidden rounded-modal bg-white">
            <View className="items-center pt-9">
              <IconAlert color="#EF4444" width={40} height={40} />
            </View>
            <Text className="mt-4 text-center text-xl font-bold text-state-critical px-8">
              Lähetä hätäilmoitus?
            </Text>
            <Text className="mt-3 text-center text-base text-primary px-8">
              Hätäilmoitus lähetetään turvakontaktillesi välittömästi.
            </Text>
            <View className="px-10 pt-8 pb-10 gap-4">
              <TouchableOpacity
                onPress={() => {
                  setShowEmergencyModal(false);
                  if (sessionId) void sendEmergencyAlert(sessionId);
                }}
                activeOpacity={0.8}
                className="h-14 w-60 items-center justify-center self-center rounded-button bg-black"
                accessibilityRole="button"
                accessibilityLabel="Lähetä"
              >
                <Text className="text-base text-white">Lähetä</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowEmergencyModal(false)}
                activeOpacity={0.8}
                className="h-14 w-60 items-center justify-center self-center rounded-button border border-black bg-white"
                accessibilityRole="button"
                accessibilityLabel="Peruuta"
              >
                <Text className="text-base text-primary">Peruuta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
            <Text className="mt-2 text-center text-secondary text-xs px-8">
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
