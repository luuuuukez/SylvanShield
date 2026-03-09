import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAnimatedReaction, runOnJS } from "react-native-reanimated";
import {
  CartesianChart,
  Line,
  Scatter,
  useChartPressState,
} from "victory-native";
import { Line as SkiaLine } from "@shopify/react-native-skia";
import { IconChevronRight } from "../../src/components/icons";
import { supabase } from "../../src/lib/supabase";

// ── Types ──────────────────────────────────────────────────────────────────────

export type WorkerItem = {
  id: string;             // session id
  userId: string;
  name: string;
  avatar_url: string | null;
  status: string;
  employee_id: string | null;
  team: string | null;
};

export type DashboardCardCategory =
  | "active"
  | "completed"
  | "delayed"
  | "alert"
  | null;

export type ChartDataPoint = { x: number; date: string; workers: number };

const CARD_CATEGORY_TITLES: Record<NonNullable<DashboardCardCategory>, string> = {
  active: "Aktiivisena nyt",
  completed: "Valmiit",
  delayed: "Myöhästyneitä",
  alert: "Hälytystilassa",
};

// ── WorkerRow ──────────────────────────────────────────────────────────────────

function WorkerRow({ item, onPress }: { item: WorkerItem; onPress: () => void }) {
  const subtitle = [item.employee_id, item.team].filter(Boolean).join(" | ") || item.userId.slice(0, 8).toUpperCase();
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="flex-row items-center justify-between border-b border-gray-400/50 py-4"
    >
      <View className="flex-row items-center gap-2 flex-1 min-w-0">
        {item.avatar_url ? (
          <Image
            source={{ uri: item.avatar_url }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
            resizeMode="cover"
          />
        ) : (
          <View className="h-10 w-10 rounded-full bg-background-card overflow-hidden" />
        )}
        <View className="flex-1 min-w-0">
          <Text className="text-base font-medium text-labels-primary" numberOfLines={1}>
            {item.name}
          </Text>
          <Text className="text-secondary text-xs mt-0.5">{subtitle}</Text>
        </View>
      </View>
      <Text className="text-secondary text-lg ml-2">›</Text>
    </TouchableOpacity>
  );
}

// ── WorkerDetailsSheet ─────────────────────────────────────────────────────────

const SHEET_SLIDE_DURATION = 280;

function WorkerDetailsSheet({
  visible,
  title,
  workers,
  onClose,
}: {
  visible: boolean;
  title: string;
  workers: WorkerItem[];
  onClose: () => void;
}) {
  const router = useRouter();
  const slideY = useRef(new Animated.Value(Dimensions.get("window").height)).current;

  const handleWorkerPress = useCallback(
    (item: WorkerItem) => {
      if (!item.id) {
        Alert.alert("Ei aktiivista vuoroa tänään");
        return;
      }
      Animated.timing(slideY, {
        toValue: Dimensions.get("window").height,
        duration: SHEET_SLIDE_DURATION,
        useNativeDriver: true,
      }).start(() => {
        onClose();
        router.push(`/history-details?id=${item.id}`);
      });
    },
    [onClose, router, slideY],
  );

  const renderItem = useCallback(
    ({ item }: { item: WorkerItem }) => (
      <WorkerRow item={item} onPress={() => handleWorkerPress(item)} />
    ),
    [handleWorkerPress],
  );
  const keyExtractor = useCallback((item: WorkerItem) => item.id, []);

  useEffect(() => {
    if (visible) {
      Animated.timing(slideY, {
        toValue: 0,
        duration: SHEET_SLIDE_DURATION,
        useNativeDriver: true,
      }).start();
    } else {
      slideY.setValue(Dimensions.get("window").height);
    }
  }, [visible, slideY]);

  const handleClose = useCallback(() => {
    Animated.timing(slideY, {
      toValue: Dimensions.get("window").height,
      duration: SHEET_SLIDE_DURATION,
      useNativeDriver: true,
    }).start(() => onClose());
  }, [onClose, slideY]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View className="flex-1">
        <Pressable className="absolute inset-0 bg-overlay" onPress={handleClose} />
        <Animated.View
          className="absolute left-0 right-0 bottom-0 rounded-t-card bg-background-primary overflow-hidden"
          style={{
            transform: [{ translateY: slideY }],
            height: Dimensions.get("window").height * (3 / 4),
          }}
        >
          <SafeAreaView edges={["bottom"]} className="pb-0 flex-1">
            <View className="px-6 pt-6">
              <View className="flex-row items-center justify-between">
                <Text className="text-3xl font-bold tracking-tight text-labels-primary">
                  {title}
                </Text>
                <TouchableOpacity
                  onPress={handleClose}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  className="h-8 w-8 items-center justify-center rounded-full"
                >
                  <Text className="text-primary text-xl">✕</Text>
                </TouchableOpacity>
              </View>
            </View>
            <FlatList
              data={workers}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
              showsVerticalScrollIndicator={true}
              ListEmptyComponent={
                <Text className="text-secondary text-base text-center mt-8">Ei työntekijöitä</Text>
              }
            />
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ── Chart ──────────────────────────────────────────────────────────────────────

function ChartPlaceholder({ data }: { data: ChartDataPoint[] }) {
  return (
    <View className="flex-1 items-center justify-center rounded-card bg-background-card px-4 py-6">
      <Text className="text-secondary text-center text-sm">
        Aktiiviset työntekijät – kaavio näkyy sovellusversiossa
      </Text>
      <View className="mt-3 flex-row flex-wrap justify-center gap-2">
        {data.map((d) => (
          <Text key={d.date} className="text-tertiary text-xs">
            {d.date}: {d.workers}
          </Text>
        ))}
      </View>
    </View>
  );
}

const Y_TICKS = 5;
const CHART_H = 220;
const CHART_PAD = { top: 16, bottom: 24, left: 40, right: 20 };
const INNER_H = CHART_H - CHART_PAD.top - CHART_PAD.bottom;

function ActiveWorkersChart({ data }: { data: ChartDataPoint[] }) {
  const safeData = data.length > 0 ? data : [{ x: 0, date: "—", workers: 0 }];

  const maxWorkers = Math.max(0, ...data.map((d) => d.workers));
  const yMax = Math.ceil(maxWorkers * 1.3);

  const { state: pressState } = useChartPressState<{
    x: number;
    y: { workers: number };
  }>({
    x: safeData[0].x,
    y: { workers: safeData[0].workers },
  });

  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    value: number;
  }>({ visible: false, x: 0, y: 0, value: 0 });

  const updateTooltip = useCallback(
    (visible: boolean, x: number, y: number, value: number) => {
      setTooltip({ visible, x, y, value });
    },
    [],
  );

  useAnimatedReaction(
    () => ({
      active: pressState.isActive.value,
      x: pressState.x.position.value,
      y: pressState.y.workers.position.value,
      value: pressState.y.workers.value.value,
    }),
    (curr) => {
      if (curr.active) {
        runOnJS(updateTooltip)(true, curr.x, curr.y, curr.value);
      } else {
        runOnJS(updateTooltip)(false, 0, 0, 0);
      }
    },
  );

  const isWeb = Platform.OS === "web";

  // Y-axis label positions aligned to grid lines
  const yLabels = useMemo(
    () =>
      Array.from({ length: Y_TICKS + 1 }, (_, i) => ({
        index: i,
        value: Math.round((yMax * (Y_TICKS - i)) / Y_TICKS),
        top: CHART_PAD.top + (INNER_H / Y_TICKS) * i - 6,
      })),
    [yMax],
  );

  return (
    <View className="mt-4" style={{ width: "100%" }}>
      {/* Chart canvas + overlaid Y labels + tooltip */}
      <View style={{ height: CHART_H, position: "relative" }}>
        {isWeb ? (
          <ChartPlaceholder data={safeData} />
        ) : (
          <CartesianChart
            data={safeData}
            xKey="x"
            yKeys={["workers"]}
            padding={CHART_PAD}
            domain={{ y: [0, yMax] }}
            domainPadding={{ left: 20, right: 20 }}
            chartPressState={pressState}
            chartPressConfig={{ pan: { activateAfterLongPress: 0 } }}
            axisOptions={{
              formatXLabel: () => "",
              formatYLabel: () => "",
              tickCount: 7,
              lineColor: "transparent",
              lineWidth: 0,
            }}
          >
            {({ points, chartBounds }) => {
              const { top, bottom, left, right } = chartBounds;
              const innerH = bottom - top;
              return (
                <>
                  {Array.from({ length: Y_TICKS + 1 }, (_, i) => (
                    <SkiaLine
                      key={i}
                      p1={{ x: left, y: top + (innerH / Y_TICKS) * i }}
                      p2={{ x: right , y: top + (innerH / Y_TICKS) * i }}
                      color="#E5E5E5"
                      strokeWidth={0.5}
                    />
                  ))}
                  <Line points={points.workers} color="#333333" strokeWidth={1.2} />
                  <Scatter points={points.workers} shape="circle" radius={3.5} color="#71717A" />
                </>
              );
            }}
          </CartesianChart>
        )}

        {/* Y-axis labels (RN Text, no Skia font needed) */}
        {!isWeb &&
          yLabels.map(({ index, value, top }) => (
            <Text
              key={index}
              style={{
                position: "absolute",
                top,
                left: 0,
                width: 34,
                textAlign: "right",
                fontSize: 10,
                lineHeight: 12,
                color: "#71717A",
                pointerEvents: "none",
              }}
            >
              {value}
            </Text>
          ))}

        {/* Press tooltip — black bubble above the data point */}
        {!isWeb && tooltip.visible && (
          <View
            style={{
              position: "absolute",
              left: Math.max(CHART_PAD.left, Math.min(280, tooltip.x - 16)),
              top: Math.max(4, tooltip.y - 28),
              backgroundColor: "#27272A",
              borderRadius: 6,
              paddingHorizontal: 6,
              paddingVertical: 3,
              minWidth: 24,
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
            <Text style={{ fontSize: 11, lineHeight: 14, color: "#FFFFFF", fontWeight: "500" }}>
              {Math.round(tooltip.value)}
            </Text>
          </View>
        )}
        {/* X-axis date labels */}
        {!isWeb && (
          <View
            style={{
              position: "absolute",
              bottom: 4,
              left: CHART_PAD.left,
              right: CHART_PAD.right,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            {data.map((d) => (
              <Text key={d.date} style={{ fontSize: 11, color: "#9CA3AF" }}>{d.date}</Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

// ── Screen ─────────────────────────────────────────────────────────────────────

type Counts = { active: number; completed: number; delayed: number; alert: number };
type WorkersByCategory = Record<NonNullable<DashboardCardCategory>, WorkerItem[]>;

export default function DashboardScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<DashboardCardCategory>(null);

  const [counts, setCounts] = useState<Counts>({ active: 0, completed: 0, delayed: 0, alert: 0 });
  const [workersByCategory, setWorkersByCategory] = useState<WorkersByCategory>({
    active: [], completed: [], delayed: [], alert: [],
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    async function fetchData() {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);

      const { data: sessions } = await supabase
        .from("work_sessions")
        .select("id, user_id, status, start_time, profiles(name, avatar_url, employee_id, team, role)")
        .gte("start_time", sevenDaysAgo.toISOString())
        .order("start_time", { ascending: true });

      if (!sessions) return;

      // Split today's sessions by status
      const todaySessions = sessions.filter((s) => {
        const d = new Date(s.start_time);
        return d >= todayStart && d < todayEnd;
      });

      type ProfileShape = { name: string | null; avatar_url: string | null; employee_id: string | null; team: string | null; role: string | null } | null;
      const toWorkerItem = (s: typeof sessions[number]): WorkerItem => {
        const profile = (s.profiles as unknown) as ProfileShape;
        return {
          id: s.id,
          userId: s.user_id,
          name: profile?.name ?? "—",
          avatar_url: profile?.avatar_url ?? null,
          status: s.status,
          employee_id: profile?.employee_id ?? null,
          team: profile?.team ?? null,
        };
      };

      const workerSessions = todaySessions.filter((s) => {
        const profile = (s.profiles as unknown) as ProfileShape;
        return profile?.role === "worker";
      });

      const active    = workerSessions.filter((s) => s.status === "active").map(toWorkerItem);
      const completed = workerSessions.filter((s) => s.status === "completed").map(toWorkerItem);
      const delayed   = workerSessions.filter((s) => s.status === "grace_period").map(toWorkerItem);
      const alert     = workerSessions.filter((s) => s.status === "alert_sent").map(toWorkerItem);

      setCounts({
        active: active.length,
        completed: completed.length,
        delayed: delayed.length,
        alert: alert.length,
      });
      setWorkersByCategory({ active, completed, delayed, alert });

      // Chart: distinct users per day for last 7 days
      const computed: ChartDataPoint[] = Array.from({ length: 7 }, (_, i) => {
        const day = new Date(sevenDaysAgo);
        day.setDate(day.getDate() + i);
        const nextDay = new Date(day);
        nextDay.setDate(nextDay.getDate() + 1);
        const label = `${String(day.getDate()).padStart(2, "0")}.${String(day.getMonth() + 1).padStart(2, "0")}`;
        const count = new Set(
          sessions
            .filter((s) => {
              const d = new Date(s.start_time);
              return d >= day && d < nextDay;
            })
            .map((s) => s.user_id),
        ).size;
        return { x: i, date: label, workers: count };
      });
      setChartData(computed);
    }
    fetchData();
  }, []);

  const sheetTitle = selectedCategory ? CARD_CATEGORY_TITLES[selectedCategory] : "";
  const showSheet = selectedCategory !== null;
  const sheetWorkers = selectedCategory ? workersByCategory[selectedCategory] : [];

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6">
          <Text className="mt-6 text-4xl font-bold tracking-wide text-primary">
            Hallintapaneeli
          </Text>

          {/* Alert banner — shown only when there are active alerts */}
          {counts.alert > 0 && (
            <View className="mt-6 overflow-hidden rounded-inner-card bg-tint-alert-banner px-4 py-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-1 rounded-xl bg-primary px-2 py-1.5">
                  <Text className="text-base font-medium text-white">Live</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="flex-row items-center opacity-80"
                  onPress={() => setSelectedCategory("alert")}
                >
                  <Text className="text-secondary text-xs">Näytä tiedot</Text>
                  <Text className="text-secondary ml-0.5 text-xs">›</Text>
                </TouchableOpacity>
              </View>
              <Text className="mt-4 text-base text-primary">
                <Text className="font-bold">{counts.alert}</Text>
                <Text className="font-normal">
                  {counts.alert === 1 ? " työntekijä on " : " työntekijää on "}
                </Text>
                <Text className="font-bold">hälytystilassa</Text>
                <Text className="font-normal">{"\n"}Vaatii välitöntä huomiota</Text>
              </Text>
            </View>
          )}

          {/* Tänään + Live kartta */}
          <View className="mt-6 flex-row items-center justify-between">
            <Text className="text-xl text-primary">Tänään</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              className="flex-row items-center"
              onPress={() => router.push("/live-map")}
            >
              <Text className="text-secondary text-xs">Live kartta</Text>
              <Text className="text-secondary ml-0.5 text-xs">›</Text>
            </TouchableOpacity>
          </View>

          {/* Stat cards 2×2 */}
          <View className="mt-4 flex-row flex-wrap gap-3">
            <TouchableOpacity
              activeOpacity={0.7}
              className="overflow-hidden rounded-inner-card bg-background-card p-3 flex-row justify-between items-start"
              style={{ flexBasis: "47%", flexGrow: 1, minWidth: 0 }}
              onPress={() => setSelectedCategory("active")}
            >
              <View>
                <Text className="text-secondary text-xs">Aktiivisena nyt</Text>
                <Text className="mt-1 text-3xl font-bold tracking-tight text-state-active">
                  {counts.active}
                </Text>
              </View>
              <IconChevronRight color="#B0B3BA" width={20} height={20} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              className="overflow-hidden rounded-inner-card bg-background-card p-3 flex-row justify-between items-start"
              style={{ flexBasis: "47%", flexGrow: 1, minWidth: 0 }}
              onPress={() => setSelectedCategory("completed")}
            >
              <View>
                <Text className="text-secondary text-xs">Valmiit</Text>
                <Text className="mt-1 text-3xl font-bold tracking-tight text-primary">
                  {counts.completed}
                </Text>
              </View>
              <IconChevronRight color="#B0B3BA" width={20} height={20} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              className="overflow-hidden rounded-inner-card bg-background-card p-3 flex-row justify-between items-start"
              style={{ flexBasis: "47%", flexGrow: 1, minWidth: 0 }}
              onPress={() => setSelectedCategory("delayed")}
            >
              <View>
                <Text className="text-secondary text-xs">Myöhästyneitä</Text>
                <Text className="mt-1 text-3xl font-bold tracking-tight text-state-grace">
                  {counts.delayed}
                </Text>
              </View>
              <IconChevronRight color="#B0B3BA" width={20} height={20} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              className="overflow-hidden rounded-inner-card bg-background-card p-3 flex-row justify-between items-start"
              style={{ flexBasis: "47%", flexGrow: 1, minWidth: 0 }}
              onPress={() => setSelectedCategory("alert")}
            >
              <View>
                <Text className="text-secondary text-xs">Hälytystilassa</Text>
                <Text className="mt-1 text-3xl font-bold tracking-tight text-state-critical">
                  {counts.alert}
                </Text>
              </View>
              <IconChevronRight color="#B0B3BA" width={20} height={20} />
            </TouchableOpacity>
          </View>

          {/* Chart */}
          <View className="mt-8">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl text-primary">Aktiiviset työntekijät</Text>
              <Text className="text-secondary text-xs">7 Päivää</Text>
            </View>
          </View>
        </View>
        <View style={{ overflow: "hidden" }}>
          <ActiveWorkersChart data={chartData} />
        </View>
      </ScrollView>

      <WorkerDetailsSheet
        visible={showSheet}
        title={sheetTitle}
        workers={sheetWorkers}
        onClose={() => setSelectedCategory(null)}
      />
    </SafeAreaView>
  );
}
