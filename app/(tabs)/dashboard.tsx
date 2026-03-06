import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAnimatedReaction, runOnJS } from "react-native-reanimated";
import {
  CartesianChart,
  Line,
  Scatter,
  useChartPressState,
} from "victory-native";
import { IconChevronRight } from "../../src/components/icons";

/** Worker list item for bottom sheet. Swap with API type. */
export type WorkerItem = {
  id: string;
  name: string;
  team: string;
  avatar: string;
};

/** Category for summary cards; null = sheet closed. */
export type DashboardCardCategory =
  | "active"
  | "completed"
  | "delayed"
  | "alert"
  | null;

/** Mock workers for sheet lists. Replace with API, e.g. per category. */
export const mockWorkers: WorkerItem[] = [
  { id: "120931", name: "Albert Flores", team: "Team A", avatar: "" },
  { id: "120932", name: "Eleanor Pena", team: "Team A", avatar: "" },
  { id: "120933", name: "Cody Fisher", team: "Team A", avatar: "" },
  { id: "120934", name: "Kathryn Murphy", team: "Team A", avatar: "" },
  { id: "120935", name: "Jenny Wilson", team: "Team A", avatar: "" },
  { id: "120936", name: "Jacob Jones", team: "Team A", avatar: "" },
];

const CARD_CATEGORY_TITLES: Record<NonNullable<DashboardCardCategory>, string> = {
  active: "Aktiivisena nyt",
  completed: "Valmiit",
  delayed: "Myöhästyneitä",
  alert: "Hälytystilassa",
};

/** List row: avatar (circular placeholder), name (bold), subtitle (ID | Team), chevron-right. */
function WorkerRow({ item }: { item: WorkerItem }) {
  return (
    <View className="flex-row items-center justify-between border-b border-gray-400/50 py-4">
      <View className="flex-row items-center gap-2 flex-1 min-w-0">
        <View className="h-10 w-10 rounded-full bg-background-card overflow-hidden" />
        <View className="flex-1 min-w-0">
          <Text className="text-base font-medium text-labels-primary" numberOfLines={1}>
            {item.name}
          </Text>
          <Text className="text-caption text-xs mt-0.5">
            {item.id} | {item.team}
          </Text>
        </View>
      </View>
      <Text className="text-caption text-lg ml-2">›</Text>
    </View>
  );
}

const SHEET_SLIDE_DURATION = 280;

/** Bottom sheet: 蒙层无动画即时出现，白色底条用 Animated 从下至上滑入。 */
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
  const slideY = useRef(new Animated.Value(Dimensions.get("window").height)).current;

  const renderItem = useCallback(
    ({ item }: { item: WorkerItem }) => <WorkerRow item={item} />,
    [],
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
        {/* 蒙层：无动画，直接显示 */}
        <Pressable className="absolute inset-0 bg-overlay" onPress={handleClose} />
        {/* 白色底条：Animated 从下至上滑入 */}
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
            />
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

/** Chart data point type – replace with API response type. */
export type ChartDataPoint = { x: number; date: string; workers: number };

/**
 * Chart data for "Aktiiviset työntekijät" (7 days). Swap with API, e.g.:
 *   const data = useChartData(); or const data = await fetchChartData();
 */
export const chartData: ChartDataPoint[] = [
  { x: 0, date: "31.01", workers: 45 },
  { x: 1, date: "01.02", workers: 40 },
  { x: 2, date: "02.02", workers: 35 },
  { x: 3, date: "03.02", workers: 28 },
  { x: 4, date: "04.02", workers: 32 },
  { x: 5, date: "05.02", workers: 25 },
  { x: 6, date: "06.02", workers: 23 },
];

/** Web fallback: victory-native uses Skia, which can crash on web (XYWHRect). */
function ChartPlaceholder({ data }: { data: ChartDataPoint[] }) {
  return (
    <View className="flex-1 items-center justify-center rounded-card bg-background-card px-4 py-6">
      <Text className="text-caption text-center text-sm">
        Aktiiviset työntekijät – kaavio näkyy sovellusversiossa
      </Text>
      <View className="mt-3 flex-row flex-wrap justify-center gap-2">
        {data.map((d) => (
          <Text key={d.x} className="text-chart-axis text-xs">
            {d.date}: {d.workers}
          </Text>
        ))}
      </View>
    </View>
  );
}

/** Chart styling from design: grid/labels #767676 (Grays-Gray-5), line/dots 0.5 stroke, Y 0–50, X 7 dates, tooltip black bubble + white text. */
function ActiveWorkersChart() {
  const data = chartData;
  const { state: pressState } = useChartPressState<{
    x: number;
    y: { workers: number };
  }>({
    x: data[0].x,
    y: { workers: data[0].workers },
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

  return (
    <View className="mt-4" style={{ height: 220, width: "100%" }}>
      <View className="flex-1" style={{ minHeight: 200, width: "100%" }}>
        {isWeb ? (
          <ChartPlaceholder data={data} />
        ) : (
          <CartesianChart
            data={data}
            xKey="x"
            yKeys={["workers"]}
            padding={{ left: 36, right: 16, top: 8, bottom: 32 }}
            domain={{ y: [0, 50] }}
            chartPressState={pressState}
            chartPressConfig={{ pan: { activateAfterLongPress: 0 } }}
            axisOptions={{
              font: null,
              lineColor: "#767676",
              lineWidth: 0.5,
              labelColor: "#767676",
              tickCount: { x: 7, y: 6 },
              formatYLabel: (v) => String(Math.round(Number(v))),
              formatXLabel: (label) =>
                data[Number(label)]?.date ?? String(label),
            }}
          >
            {({ points }) => (
              <>
                <Line
                  points={points.workers}
                  color="#767676"
                  strokeWidth={0.5}
                />
                <Scatter
                  points={points.workers}
                  shape="circle"
                  radius={3}
                  color="#767676"
                />
              </>
            )}
          </CartesianChart>
        )}
      </View>
      {!isWeb && tooltip.visible && (
        <View
          style={{
            position: "absolute",
            left: Math.max(8, Math.min(280, tooltip.x - 12)),
            top: Math.max(4, tooltip.y - 22),
            pointerEvents: "none",
          }}
          className="rounded px-1.5 py-0.5 items-center justify-center min-w-[24px] bg-chart-tooltip"
        >
          <Text className="text-xs font-normal text-chart-tooltip-text">
            {Math.round(tooltip.value)}
          </Text>
        </View>
      )}
      <View className="flex-row justify-between mt-1 px-2">
        {data.map((d) => (
          <Text
            key={d.x}
            className="text-chart-axis text-xs font-normal tracking-tight"
          >
            {d.date}
          </Text>
        ))}
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const [selectedCategory, setSelectedCategory] =
    useState<DashboardCardCategory>(null);

  const sheetTitle = selectedCategory
    ? CARD_CATEGORY_TITLES[selectedCategory]
    : "";
  const showSheet = selectedCategory !== null;

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6">
          {/* Title at top */}
          <Text className="mt-6 text-4xl font-bold tracking-wide text-primary">
            Hallintapaneeli
          </Text>

          {/* Alert banner */}
          <View className="mt-6 overflow-hidden rounded-2xl bg-tint-alert-banner px-4 py-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-1 rounded-xl bg-primary px-2 py-1.5">
                <Text className="text-base font-medium text-white">Live</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                className="flex-row items-center opacity-80"
              >
                <Text className="text-caption text-xs">Näytä tiedot</Text>
                <Text className="text-caption ml-0.5 text-xs">›</Text>
              </TouchableOpacity>
            </View>
            <Text className="mt-4 text-base text-primary">
              <Text className="font-bold">1</Text>
              <Text className="font-normal"> työntekijä on </Text>
              <Text className="font-bold">hälytystilassa</Text>
              <Text className="font-normal">{"\n"}Vaatii välitöntä huomiota</Text>
            </Text>
          </View>

          {/* Tänään + Live kartta */}
          <View className="mt-6 flex-row items-center justify-between">
            <Text className="text-xl text-primary">Tänään</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              className="flex-row items-center"
            >
              <Text className="text-caption text-xs">Live kartta</Text>
              <Text className="text-caption ml-0.5 text-xs">›</Text>
            </TouchableOpacity>
          </View>

          {/* Stat cards 2x2 grid – tap opens WorkerDetailsSheet; Flexbox layout with chevron on right */}
          <View className="mt-4 flex-row flex-wrap gap-3">
            <TouchableOpacity
              activeOpacity={0.7}
              className="overflow-hidden rounded-2xl bg-background-card p-3 flex-row justify-between items-center"
              style={{ flexBasis: "47%", flexGrow: 1, minWidth: 0 }}
              onPress={() => setSelectedCategory("active")}
            >
              <View>
                <Text className="text-caption text-xs">Aktiivisena nyt</Text>
                <Text className="mt-1 text-3xl font-bold tracking-tight text-primary">
                  12
                </Text>
              </View>
              <IconChevronRight color="#8E8E93" width={20} height={20} />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              className="overflow-hidden rounded-2xl bg-background-card p-3 flex-row justify-between items-center"
              style={{ flexBasis: "47%", flexGrow: 1, minWidth: 0 }}
              onPress={() => setSelectedCategory("completed")}
            >
              <View>
                <Text className="text-caption text-xs">Valmiit</Text>
                <Text className="mt-1 text-3xl font-bold tracking-tight text-primary">
                  18
                </Text>
              </View>
              <IconChevronRight color="#8E8E93" width={20} height={20} />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              className="overflow-hidden rounded-2xl bg-background-card p-3 flex-row justify-between items-center"
              style={{ flexBasis: "47%", flexGrow: 1, minWidth: 0 }}
              onPress={() => setSelectedCategory("delayed")}
            >
              <View>
                <Text className="text-caption text-xs">Myöhästyneitä</Text>
                <Text className="mt-1 text-3xl font-bold tracking-tight text-state-critical">
                  1
                </Text>
              </View>
              <IconChevronRight color="#8E8E93" width={20} height={20} />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              className="overflow-hidden rounded-2xl bg-background-card p-3 flex-row justify-between items-center"
              style={{ flexBasis: "47%", flexGrow: 1, minWidth: 0 }}
              onPress={() => setSelectedCategory("alert")}
            >
              <View>
                <Text className="text-caption text-xs">Hälytystilassa</Text>
                <Text className="mt-1 text-3xl font-bold tracking-tight text-state-grace">
                  2
                </Text>
              </View>
              <IconChevronRight color="#8E8E93" width={20} height={20} />
            </TouchableOpacity>
          </View>

          {/* Aktiiviset työntekijät */}
          <View className="mt-8">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl text-primary">
                Aktiiviset työntekijät
              </Text>
              <Text className="text-caption text-xs">7 Päivää</Text>
            </View>
            <ActiveWorkersChart />
          </View>
        </View>
      </ScrollView>

      <WorkerDetailsSheet
        visible={showSheet}
        title={sheetTitle}
        workers={mockWorkers}
        onClose={() => setSelectedCategory(null)}
      />
    </SafeAreaView>
  );
}
