import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  IconChevronRight,
  IconClock,
  IconLocationPin,
  IconSliders,
} from "../../src/components/icons";
import { supabase } from "../../src/lib/supabase";

interface HistorySession {
  id: string;
  status: string;
  start_time: string | null;
  expected_end_time: string | null;
  actual_end_time: string | null;
  last_known_latitude: number | null;
  last_known_longitude: number | null;
  safety_contacts: { name: string | null } | null;
  alerts: { id: string }[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fi-FI", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });
}

function formatHM(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function getStatusInfo(session: HistorySession): { label: string; colorClass: string } {
  if (session.status === "completed") {
    if (session.alerts?.length > 0) {
      return { label: "Myöhässä – ratkaistu", colorClass: "text-alert" };
    }
    return { label: "Kuitannut ulos turvallisesti", colorClass: "text-status-safe" };
  }
  if (session.status === "alert_sent") {
    return { label: "Hälytys lähetetty", colorClass: "text-status-warning" };
  }
  if (session.status === "grace_period") {
    return { label: "Myöhässä – kesken", colorClass: "text-state-grace" };
  }
  return { label: "Käynnissä", colorClass: "text-state-active" };
}

function HistoryCard({
  session,
  onPress,
}: {
  session: HistorySession;
  onPress: () => void;
}) {
  const { label, colorClass } = getStatusInfo(session);
  const dateStr = session.start_time ? formatDate(session.start_time) : "—";
  const endTime = session.actual_end_time ?? session.expected_end_time;
  const timeStr =
    session.start_time && endTime
      ? `${formatHM(session.start_time)} - ${formatHM(endTime)}`
      : session.start_time
        ? formatHM(session.start_time)
        : "—";

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="min-h-28 flex-row rounded-inner-card bg-background-card overflow-hidden p-4"
    >
      <View className="flex-1 gap-1 justify-center">
        <Text className="text-xl font-normal leading-6 text-primary">
          {dateStr}
        </Text>
        <View className="flex-row items-center gap-1">
          <IconLocationPin width={16} height={16} color="#333333" />
          <Text className="text-base font-normal leading-5 text-primary">
            {session.last_known_latitude != null ? "Sijainti tallennettu" : "—"}
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <IconClock width={16} height={16} color="#333333" />
          <Text className="text-base font-normal leading-5 text-primary">
            {timeStr}
          </Text>
        </View>
      </View>
      <View className="justify-between items-end">
        <IconChevronRight color="#B0B3BA" width={20} height={20} />
        <Text className={`text-xs font-normal leading-4 ${colorClass}`}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const [sessions, setSessions] = useState<HistorySession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("work_sessions")
        .select(`
          id, status, start_time, expected_end_time, actual_end_time,
          last_known_latitude, last_known_longitude,
          safety_contacts(name),
          alerts(id)
        `)
        .eq("user_id", user.id)
        .order("start_time", { ascending: false });

      if (data) setSessions(data as unknown as HistorySession[]);
      setLoading(false);
    }
    fetchSessions();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={["top"]}>
      <View className="px-6 pt-6 flex-row items-center justify-between">
        <Text className="text-4xl font-bold tracking-wide text-primary">
          Historia
        </Text>
        <TouchableOpacity activeOpacity={0.7} hitSlop={12}>
          <IconSliders width={24} height={24} color="#333333" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : sessions.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-secondary text-base">Ei työvuoroja</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, gap: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {sessions.map((session) => (
            <HistoryCard
              key={session.id}
              session={session}
              onPress={() => router.push(`/history-details?id=${session.id}`)}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
