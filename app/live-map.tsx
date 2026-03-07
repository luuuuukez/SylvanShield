import React, { useCallback, useState } from "react";
import {
  Image,
  Linking,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker } from "react-native-maps";
import Svg, { Path } from "react-native-svg";
import { IconBell, IconChevronRight, IconClose, IconPhone } from "../src/components/icons";

export type WorkerMapStatus = "normal" | "warning" | "alert";

/** 底部卡片对应的类别 key */
export type LiveMapCategory = "alert" | "delayed" | "active";

export type WorkerOnMap = {
  id: string;
  name: string;
  workerId: string;
  status: WorkerMapStatus;
  latitude: number;
  longitude: number;
  avatar?: string;
  team?: string;
  /** 安全联系人，用于 focus 卡片 */
  safetyContact?: { name: string; avatar?: string };
  /** 迟到分钟数，仅 delayed/alert 可能显示 */
  lateMinutes?: number;
};

/** 按类别分组的工人列表，用于点击底部卡片后展示与切换 */
const WORKERS_BY_CATEGORY: Record<LiveMapCategory, WorkerOnMap[]> = {
  alert: [
    {
      id: "3",
      name: "Peter Laitio",
      workerId: "120932",
      team: "Team A",
      status: "alert",
      latitude: 60.168,
      longitude: 24.935,
      avatar: "https://placehold.co/72x72",
      safetyContact: { name: "Anna Svensson", avatar: "https://placehold.co/72x72" },
      lateMinutes: 30,
    },
    {
      id: "5",
      name: "Cody Fisher",
      workerId: "A3123",
      team: "Team A",
      status: "alert",
      latitude: 60.167,
      longitude: 24.934,
      avatar: "https://placehold.co/72x72",
      safetyContact: { name: "Anna Svensson", avatar: "https://placehold.co/72x72" },
      lateMinutes: 15,
    },
  ],
  delayed: [
    {
      id: "2",
      name: "Eleanor Pena",
      workerId: "A3122",
      team: "Team A",
      status: "warning",
      latitude: 60.171,
      longitude: 24.94,
      avatar: "https://placehold.co/72x72",
      safetyContact: { name: "Anna Svensson", avatar: "https://placehold.co/72x72" },
      lateMinutes: 20,
    },
  ],
  active: [
    {
      id: "1",
      name: "Albert Flores",
      workerId: "A3121",
      team: "Team A",
      status: "normal",
      latitude: 60.1699,
      longitude: 24.9384,
      avatar: "https://placehold.co/72x72",
      safetyContact: { name: "Anna Svensson", avatar: "https://placehold.co/72x72" },
    },
    {
      id: "4",
      name: "Kathryn Murphy",
      workerId: "A3124",
      team: "Team A",
      status: "normal",
      latitude: 60.172,
      longitude: 24.942,
      avatar: "https://placehold.co/72x72",
      safetyContact: { name: "Anna Svensson", avatar: "https://placehold.co/72x72" },
    },
  ],
};

const STATUS_PIN_COLOR: Record<WorkerMapStatus, string> = {
  normal: "#10B981",
  warning: "#FB923C",
  alert: "#EF4444",
};

const STATUS_LABEL: Record<WorkerMapStatus, string> = {
  normal: "Normaali",
  warning: "Myöhässä – varoitus",
  alert: "Hälytystila",
};

const STATUS_TEXT_CLASS: Record<WorkerMapStatus, string> = {
  normal: "text-status-safe",
  warning: "text-alert",
  alert: "text-status-warning",
};

/** 地图上的所有工人（从分类合并），用于打点 */
const MOCK_WORKERS_MAP: WorkerOnMap[] = [
  ...WORKERS_BY_CATEGORY.alert,
  ...WORKERS_BY_CATEGORY.delayed,
  ...WORKERS_BY_CATEGORY.active,
];

/** 地图上的工人标记：大头针形状 + 内嵌头像，颜色按状态 */
function WorkerPinMarker({ worker }: { worker: WorkerOnMap }) {
  const pinColor = STATUS_PIN_COLOR[worker.status];
  const avatarUri = worker.avatar || "https://placehold.co/72x72";
  return (
    <View style={{ width: 44, height: 50 }}>
      <Svg width={44} height={50} viewBox="0 0 44 50" fill="none" style={{ position: "absolute" }}>
        <Path
          d="M7.15076 6.15076C15.3518 -2.05025 28.6482 -2.05025 36.8492 6.15076C45.0502 14.3518 45.0503 27.6482 36.8492 35.8492L23.1423 49.5562C22.5114 50.1871 21.4886 50.1871 20.8577 49.5562L7.15076 35.8492C-1.05025 27.6482 -1.05025 14.3518 7.15076 6.15076Z"
          fill={pinColor}
        />
      </Svg>
      <View
        style={{
          position: "absolute",
          left: 5,
          top: 4,
          width: 34,
          height: 34,
          borderRadius: 17,
          overflow: "hidden",
          backgroundColor: "#E5E5E5",
        }}
      >
        <Image
          source={{ uri: avatarUri }}
          style={{ width: 34, height: 34 }}
          resizeMode="cover"
        />
      </View>
    </View>
  );
}

const INITIAL_REGION = {
  latitude: 60.17,
  longitude: 24.938,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

/** Live Map 底部悬浮三张统计卡片：Hälytystilassa(红) / Myöhästyneitä(橙) / Aktiivisena nyt(绿) */
const LIVE_MAP_STATS: { key: LiveMapCategory; label: string; value: number; valueClass: string }[] = [
  { key: "alert", label: "Hälytystilassa", value: 2, valueClass: "text-state-critical" },
  { key: "delayed", label: "Myöhästyneitä", value: 1, valueClass: "text-alert" },
  { key: "active", label: "Aktiivisena nyt", value: 12, valueClass: "text-status-safe" },
];

const CATEGORY_NAV_LABEL: Record<LiveMapCategory, string> = {
  alert: "Hälytys",
  delayed: "Myöhästyneitä",
  active: "Aktiivisena",
};

/** 电话按钮按类别着色：警告=红，Grace/延迟=橙，活跃=绿 */
const PHONE_BUTTON_BG_CLASS: Record<LiveMapCategory, string> = {
  alert: "bg-state-critical",
  delayed: "bg-state-grace",
  active: "bg-state-active",
};

/** worker.status → 用于电话按钮颜色的类别 */
function statusToCategory(status: WorkerMapStatus): LiveMapCategory {
  if (status === "alert") return "alert";
  if (status === "warning") return "delayed";
  return "active";
}

/** Focus 模式工人卡片：头像、姓名、工号|团队、电话按钮(按类别着色)、Turvakontakti、Myöhässä；可选底部左右切换栏；hideNavBar 时可传 onClose 显示关闭 */
function FocusWorkerCard({
  worker,
  category,
  index,
  total,
  onCall,
  onPrev,
  onNext,
  hideNavBar = false,
  onClose,
}: {
  worker: WorkerOnMap;
  category: LiveMapCategory;
  index: number;
  total: number;
  onCall: () => void;
  onPrev: () => void;
  onNext: () => void;
  hideNavBar?: boolean;
  onClose?: () => void;
}) {
  const navLabel = CATEGORY_NAV_LABEL[category];
  const phoneBgClass = PHONE_BUTTON_BG_CLASS[category];
  return (
    <View
      className="rounded-xl bg-background-primary p-4 border border-gray-200/80"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <View className="flex-row items-center mb-3">
        <Image
          source={{ uri: worker.avatar || "https://placehold.co/72x72" }}
          className="w-14 h-14 rounded-full bg-background-card"
          resizeMode="cover"
        />
        <View className="flex-1 ml-3">
          <Text className="text-base font-semibold text-labels-primary">{worker.name}</Text>
          <Text className="text-xs text-caption mt-0.5">
            {worker.workerId} | {worker.team || "Team A"}
          </Text>
        </View>
        {hideNavBar && onClose && (
          <TouchableOpacity onPress={onClose} className="p-2 mr-1" hitSlop={8}>
            <IconClose width={28} height={28} color="#404040" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={onCall}
          className={`w-12 h-12 rounded-full items-center justify-center ${phoneBgClass}`}
          activeOpacity={0.8}
        >
          <IconPhone width={30} height={30} color="white" />
        </TouchableOpacity>
      </View>
      <View className="h-px bg-gray-300/50 my-2" />
      <View className="flex-row items-start">
        <View className="flex-1">
          <Text className="text-xs text-caption mb-1">Turvakontakti</Text>
          <View className="flex-row items-center gap-1">
            <Image
              source={{ uri: worker.safetyContact?.avatar || "https://placehold.co/48x48" }}
              className="w-6 h-6 rounded-full bg-background-card"
              resizeMode="cover"
            />
            <Text className="text-base text-primary">{worker.safetyContact?.name || "—"}</Text>
            <IconBell width={16} height={16} bg="#333333" fg="white" />
          </View>
        </View>
        <View className="flex-1 items-end">
          <Text className="text-xs text-caption mb-1">Myöhässä</Text>
          {worker.lateMinutes != null ? (
            <Text className="text-base font-medium text-state-critical">{worker.lateMinutes} min</Text>
          ) : (
            <Text className="text-base text-caption">—</Text>
          )}
        </View>
      </View>
      {!hideNavBar && (
        <View className="flex-row items-center justify-between mt-4 min-h-12 py-2 bg-background-card rounded-lg px-2 -mx-1">
          <TouchableOpacity onPress={onPrev} className="p-2" hitSlop={8}>
            <View style={{ transform: [{ rotate: "180deg" }] }}>
              <IconChevronRight width={24} height={24} color="#333333" />
            </View>
          </TouchableOpacity>
          <Text className="text-xs text-labels-primary flex-1 text-center">
            {navLabel}: {index + 1}/{total}
          </Text>
          <TouchableOpacity onPress={onNext} className="p-2" hitSlop={8}>
            <IconChevronRight width={24} height={24} color="#333333" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function WorkerInfoCard({
  worker,
  onContact,
  onClose,
}: {
  worker: WorkerOnMap;
  onContact: () => void;
  onClose: () => void;
}) {
  const statusClass = STATUS_TEXT_CLASS[worker.status];
  return (
    <View className="rounded-card bg-background-primary border border-gray-200 p-4 shadow-sm">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-semibold text-primary">{worker.name}</Text>
        <TouchableOpacity
          onPress={onClose}
          hitSlop={12}
          className="px-2 py-1"
        >
          <Text className="text-caption text-base">✕</Text>
        </TouchableOpacity>
      </View>
      <Text className="text-caption text-sm mb-1">Työntekijänumero</Text>
      <Text className="text-base text-primary mb-3">{worker.workerId}</Text>
      <Text className="text-caption text-sm mb-1">Tila</Text>
      <Text className={`text-base font-medium mb-4 ${statusClass}`}>
        {STATUS_LABEL[worker.status]}
      </Text>
      <TouchableOpacity
        onPress={onContact}
        activeOpacity={0.8}
        className="rounded-button bg-status-button py-3 items-center"
      >
        <Text className="text-base font-medium text-white">Ota yhteyttä</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function LiveMapScreen() {
  const router = useRouter();
  const [selectedWorker, setSelectedWorker] = useState<WorkerOnMap | null>(null);
  /** 点击底部卡片选中的类别；null = 未选 */
  const [selectedCategory, setSelectedCategory] = useState<LiveMapCategory | null>(null);
  /** 当前在该类别中展示的工人下标 */
  const [categoryWorkerIndex, setCategoryWorkerIndex] = useState(0);

  const categoryWorkers = selectedCategory ? WORKERS_BY_CATEGORY[selectedCategory] : [];
  const currentFocusWorker =
    categoryWorkers.length > 0 ? categoryWorkers[categoryWorkerIndex % categoryWorkers.length] : null;

  const handleContact = useCallback(() => {
    if (!selectedWorker) return;
    Linking.openURL(`tel:+358401234567`);
  }, [selectedWorker]);

  const handleCategoryCall = useCallback(() => {
    Linking.openURL(`tel:+358401234567`);
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleStatCardPress = useCallback((key: LiveMapCategory) => {
    setSelectedCategory((prev) => (prev === key ? null : key));
    setCategoryWorkerIndex(0);
  }, []);

  const handlePrevWorker = useCallback(() => {
    if (categoryWorkers.length === 0) return;
    setCategoryWorkerIndex((i) => (i - 1 + categoryWorkers.length) % categoryWorkers.length);
  }, [categoryWorkers.length]);

  const handleNextWorker = useCallback(() => {
    if (categoryWorkers.length === 0) return;
    setCategoryWorkerIndex((i) => (i + 1) % categoryWorkers.length);
  }, [categoryWorkers.length]);

  if (Platform.OS === "web") {
    return (
      <SafeAreaView className="flex-1 bg-background-primary" edges={["top"]}>
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
          <TouchableOpacity onPress={handleBack} className="p-2" hitSlop={8}>
            <IconClose width={36} height={36} color="#404040" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-primary">Live Kartta</Text>
          <View style={{ width: 40 }} />
        </View>
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-caption text-center">
            Kartta on käytettävissä vain sovellusversiossa (iOS/Android).
          </Text>
        </View>
        {selectedCategory && currentFocusWorker && (
          <View className="absolute left-4 right-4 bottom-28">
            <FocusWorkerCard
              worker={currentFocusWorker}
              category={selectedCategory}
              index={categoryWorkerIndex}
              total={LIVE_MAP_STATS.find((s) => s.key === selectedCategory)?.value ?? categoryWorkers.length}
              onCall={handleCategoryCall}
              onPrev={handlePrevWorker}
              onNext={handleNextWorker}
            />
          </View>
        )}
        <View className="absolute left-6 right-6 bottom-6 flex-row gap-4">
          {LIVE_MAP_STATS.map((stat) => (
            <TouchableOpacity
              key={stat.key}
              activeOpacity={0.8}
              onPress={() => handleStatCardPress(stat.key)}
              className="flex-1 min-h-16 rounded-xl overflow-hidden justify-center items-center p-3"
              style={{
                backgroundColor: selectedCategory === stat.key ? "#FFFFFF" : "#F5F5F5",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <Text
                className={`text-3xl font-bold tracking-tight ${stat.valueClass}`}
              >
                {stat.value}
              </Text>
              <Text className="text-xs font-normal leading-4 text-labels-primary text-center mt-0.5">
                {stat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={handleBack} className="p-2" hitSlop={8}>
          <IconClose width={36} height={36} color="#404040" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-primary">Live Kartta</Text>
        <View style={{ width: 40 }} />
      </View>

      <View className="flex-1">
        <MapView
          style={{ flex: 1, width: "100%" }}
          initialRegion={INITIAL_REGION}
          showsUserLocation
        >
          {MOCK_WORKERS_MAP.map((worker) => (
            <Marker
              key={worker.id}
              coordinate={{
                latitude: worker.latitude,
                longitude: worker.longitude,
              }}
              anchor={{ x: 0.5, y: 1 }}
              title={worker.name}
              description={STATUS_LABEL[worker.status]}
              onPress={() => setSelectedWorker(worker)}
            >
              <WorkerPinMarker worker={worker} />
            </Marker>
          ))}
        </MapView>
      </View>

      {/* 点击底部卡片后：上方显示该类别下的 focus 工人卡片 + 左右切换；total 用该类目统计数（如 Aktiivisena 为 12） */}
      {selectedCategory && currentFocusWorker && (
        <View className="absolute left-4 right-4 bottom-28" pointerEvents="box-none">
          <FocusWorkerCard
            worker={currentFocusWorker}
            category={selectedCategory}
            index={categoryWorkerIndex}
            total={LIVE_MAP_STATS.find((s) => s.key === selectedCategory)?.value ?? categoryWorkers.length}
            onCall={handleCategoryCall}
            onPrev={handlePrevWorker}
            onNext={handleNextWorker}
          />
        </View>
      )}

      {/* 底部悬浮三张统计卡片：点击选中（白底 #ffffff）、切换上方 focus 卡片 */}
      <View
        className="absolute left-6 right-6 bottom-6 flex-row gap-4"
        pointerEvents="box-none"
      >
        {LIVE_MAP_STATS.map((stat) => (
          <TouchableOpacity
            key={stat.key}
            activeOpacity={0.8}
            onPress={() => handleStatCardPress(stat.key)}
            className="flex-1 min-h-16 rounded-xl overflow-hidden justify-center items-center p-3"
            style={{
              backgroundColor: selectedCategory === stat.key ? "#FFFFFF" : "#F5F5F5",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text
              className={`text-3xl font-bold tracking-tight ${stat.valueClass}`}
            >
              {stat.value}
            </Text>
            <Text className="text-xs font-normal leading-4 text-labels-primary text-center mt-0.5">
              {stat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 点击地图 marker：沿用 Focus 卡片样式，无底部左右切换栏；电话按钮颜色按该员工状态 */}
      {selectedWorker && !selectedCategory && (
        <View className="absolute left-4 right-4 bottom-28" pointerEvents="box-none">
          <FocusWorkerCard
            worker={selectedWorker}
            category={statusToCategory(selectedWorker.status)}
            index={0}
            total={1}
            onCall={handleContact}
            onPrev={() => {}}
            onNext={() => {}}
            hideNavBar
            onClose={() => setSelectedWorker(null)}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
