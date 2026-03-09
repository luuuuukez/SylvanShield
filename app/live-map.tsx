import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { ScreenHeader } from "../src/components/ScreenHeader";
import { supabase } from "../src/lib/supabase";

export type WorkerMapStatus = "normal" | "warning" | "alert";
export type LiveMapCategory = "alert" | "delayed" | "active";

export type WorkerOnMap = {
  id: string;
  sessionId: string;
  name: string;
  workerId: string;
  employeeId?: string;
  team?: string;
  status: WorkerMapStatus;
  latitude: number;
  longitude: number;
  avatar?: string;
  safetyContact?: { name: string; avatar?: string };
  lateMinutes?: number;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function dbStatusToMapStatus(status: string): WorkerMapStatus {
  if (status === "alert_sent") return "alert";
  if (status === "grace_period") return "warning";
  return "normal";
}

function dbStatusToCategory(status: string): LiveMapCategory {
  if (status === "alert_sent") return "alert";
  if (status === "grace_period") return "delayed";
  return "active";
}

function statusToCategory(status: WorkerMapStatus): LiveMapCategory {
  if (status === "alert") return "alert";
  if (status === "warning") return "delayed";
  return "active";
}

// ── Constants ─────────────────────────────────────────────────────────────────

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

const CATEGORY_NAV_LABEL: Record<LiveMapCategory, string> = {
  alert: "Hälytys",
  delayed: "Myöhästyneitä",
  active: "Aktiivisena",
};

const PHONE_BUTTON_BG_CLASS: Record<LiveMapCategory, string> = {
  alert: "bg-state-critical",
  delayed: "bg-state-grace",
  active: "bg-state-active",
};

const INITIAL_REGION = {
  latitude: 60.17,
  longitude: 24.938,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

const STAT_CARDS: { key: LiveMapCategory; label: string; valueClass: string }[] = [
  { key: "alert",   label: "Hälytystilassa", valueClass: "text-state-critical" },
  { key: "delayed", label: "Myöhästyneitä",  valueClass: "text-alert" },
  { key: "active",  label: "Aktiivisena nyt", valueClass: "text-status-safe" },
];

// ── Sub-components ────────────────────────────────────────────────────────────

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
  onInfo,
  onPress,
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
  onInfo?: () => void;
  onPress?: () => void;
}) {
  const navLabel = CATEGORY_NAV_LABEL[category];
  const phoneBgClass = PHONE_BUTTON_BG_CLASS[category];
  const subtitle = [worker.employeeId, worker.team].filter(Boolean).join(" | ") || worker.workerId;
  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={onPress}
      disabled={!onPress}
      className="rounded-inner-card bg-background-primary p-4 border border-gray-200/80"
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
          <Text className="text-xs text-secondary mt-0.5">{subtitle}</Text>
        </View>
        {hideNavBar && onClose && (
          <TouchableOpacity onPress={onClose} className="p-2 mr-1" hitSlop={8}>
            <IconClose width={28} height={28} color="#333333" />
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
          <Text className="text-xs text-secondary mb-1">Turvakontakti</Text>
          <View className="flex-row items-center gap-1">
            {worker.safetyContact?.avatar ? (
              <Image
                source={{ uri: worker.safetyContact.avatar }}
                className="w-6 h-6 rounded-full bg-background-card"
                resizeMode="cover"
              />
            ) : (
              <View className="w-6 h-6 rounded-full bg-background-card" />
            )}
            <Text className="text-base text-primary">{worker.safetyContact?.name || "—"}</Text>
            <IconBell width={16} height={16} bg="#333333" fg="white" />
          </View>
        </View>
        <View className="items-end">
          <Text className="text-xs text-secondary mb-1">Myöhässä</Text>
          <View className="flex-row items-center gap-1">
            {worker.lateMinutes != null ? (
              <Text className="text-base font-medium text-state-critical">{worker.lateMinutes} min</Text>
            ) : (
              <Text className="text-base text-secondary">—</Text>
            )}
            {onInfo && (
              <TouchableOpacity onPress={onInfo} hitSlop={8} style={{ marginLeft: 4 }}>
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"
                    fill="#333333"
                  />
                  <Path
                    d="M12 11v6"
                    stroke="white"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M12 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
                    fill="white"
                  />
                </Svg>
              </TouchableOpacity>
            )}
          </View>
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
    </TouchableOpacity>
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
        <TouchableOpacity onPress={onClose} hitSlop={12} className="px-2 py-1">
          <Text className="text-secondary text-base">✕</Text>
        </TouchableOpacity>
      </View>
      <Text className="text-secondary text-sm mb-1">Työntekijänumero</Text>
      <Text className="text-base text-primary mb-3">{worker.workerId}</Text>
      <Text className="text-secondary text-sm mb-1">Tila</Text>
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

// ── Screen ────────────────────────────────────────────────────────────────────

const EMPTY_CATEGORIES: Record<LiveMapCategory, WorkerOnMap[]> = {
  alert: [], delayed: [], active: [],
};

export default function LiveMapScreen() {
  const router = useRouter();
  const [selectedWorker, setSelectedWorker] = useState<WorkerOnMap | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<LiveMapCategory | null>(null);
  const [categoryWorkerIndex, setCategoryWorkerIndex] = useState(0);
  const [workersByCategory, setWorkersByCategory] = useState<Record<LiveMapCategory, WorkerOnMap[]>>(EMPTY_CATEGORIES);
  const markerPressedRef = useRef(false);
  const mapRef = useRef<MapView>(null);

  const focusOnWorker = useCallback((worker: WorkerOnMap) => {
    mapRef.current?.animateToRegion(
      { latitude: worker.latitude, longitude: worker.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      500,
    );
  }, []);

  const fetchWorkers = useCallback(async () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const { data, error } = await supabase
      .from("work_sessions")
      .select(`
        *,
        profiles!user_id(id, name, avatar_url, role, employee_id, team),
        safety_contacts!safety_contact_id(name, avatar_url, phone)
      `)
      .in("status", ["active", "grace_period", "alert_sent"])
      .gte("start_time", todayStart.toISOString())
      .lt("start_time", todayEnd.toISOString());

    console.log("[live-map] raw data:", JSON.stringify(data, null, 2));
    console.log("[live-map] error:", error);

    if (!data) return;

    type ProfileShape = { id: string; name: string | null; avatar_url: string | null; role: string | null; employee_id: string | null; team: string | null } | null;
    type ContactShape = { name: string | null; avatar_url: string | null } | null;

    const categories: Record<LiveMapCategory, WorkerOnMap[]> = { alert: [], delayed: [], active: [] };

    for (const s of data) {
      const profileRaw = s.profiles as unknown;
      const profile = (Array.isArray(profileRaw) ? profileRaw[0] : profileRaw) as ProfileShape;

      const contactRaw = s.safety_contacts as unknown;
      const contact = (Array.isArray(contactRaw) ? contactRaw[0] : contactRaw) as ContactShape;

      console.log(`[live-map] session ${s.id} → role=${profile?.role} contact=${contact?.name}`);

      if (profile?.role !== "worker") continue;
      if (s.last_known_latitude == null || s.last_known_longitude == null) continue;
      const mapStatus = dbStatusToMapStatus(s.status);
      const category = dbStatusToCategory(s.status);

      let lateMinutes: number | undefined;
      if (s.expected_end_time && (s.status === "grace_period" || s.status === "alert_sent")) {
        const diff = Math.round((Date.now() - new Date(s.expected_end_time).getTime()) / 60000);
        if (diff > 0) lateMinutes = diff;
      }

      categories[category].push({
        id: profile.id ?? s.id,
        sessionId: s.id,
        name: profile.name ?? "—",
        workerId: s.id.slice(0, 8).toUpperCase(),
        employeeId: profile.employee_id ?? undefined,
        team: profile.team ?? undefined,
        status: mapStatus,
        latitude: s.last_known_latitude,
        longitude: s.last_known_longitude,
        avatar: profile.avatar_url ?? undefined,
        safetyContact: contact?.name ? { name: contact.name, avatar: contact.avatar_url ?? undefined } : undefined,
        lateMinutes,
      });
    }

    setWorkersByCategory(categories);
  }, []);

  useEffect(() => {
    fetchWorkers();
    const interval = setInterval(fetchWorkers, 30_000);
    return () => clearInterval(interval);
  }, [fetchWorkers]);

  const allMapWorkers = [
    ...workersByCategory.alert,
    ...workersByCategory.delayed,
    ...workersByCategory.active,
  ];

  const categoryWorkers = React.useMemo(
    () => (selectedCategory ? workersByCategory[selectedCategory] : []),
    [selectedCategory, workersByCategory],
  );
  const currentFocusWorker =
    categoryWorkers.length > 0 ? categoryWorkers[categoryWorkerIndex % categoryWorkers.length] : null;

  const handleContact = useCallback(() => {
    Linking.openURL("tel:+358401234567");
  }, []);

  const handleCategoryCall = useCallback(() => {
    Linking.openURL("tel:+358401234567");
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
    const next = (categoryWorkerIndex - 1 + categoryWorkers.length) % categoryWorkers.length;
    setCategoryWorkerIndex(next);
    focusOnWorker(categoryWorkers[next]);
  }, [categoryWorkers, categoryWorkerIndex, focusOnWorker]);

  const handleNextWorker = useCallback(() => {
    if (categoryWorkers.length === 0) return;
    const next = (categoryWorkerIndex + 1) % categoryWorkers.length;
    setCategoryWorkerIndex(next);
    focusOnWorker(categoryWorkers[next]);
  }, [categoryWorkers, categoryWorkerIndex, focusOnWorker]);

  if (Platform.OS === "web") {
    return (
      <SafeAreaView className="flex-1 bg-background-primary" edges={["top"]}>
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
          <TouchableOpacity onPress={handleBack} className="p-2" hitSlop={8}>
            <IconClose width={36} height={36} color="#333333" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-primary">Live Kartta</Text>
          <View style={{ width: 40 }} />
        </View>
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-secondary text-center">
            Kartta on käytettävissä vain sovellusversiossa (iOS/Android).
          </Text>
        </View>
        {selectedCategory && currentFocusWorker && (
          <View className="absolute left-4 right-4 bottom-28">
            <FocusWorkerCard
              worker={currentFocusWorker}
              category={selectedCategory}
              index={categoryWorkerIndex}
              total={categoryWorkers.length}
              onCall={handleCategoryCall}
              onPrev={handlePrevWorker}
              onNext={handleNextWorker}
              onInfo={() => router.push(`/history-details?id=${currentFocusWorker.sessionId}`)}
            />
          </View>
        )}
        <View className="absolute left-6 right-6 bottom-6 flex-row gap-4">
          {STAT_CARDS.map((stat) => (
            <TouchableOpacity
              key={stat.key}
              activeOpacity={0.8}
              onPress={() => handleStatCardPress(stat.key)}
              className="flex-1 min-h-16 rounded-inner-card overflow-hidden justify-center items-center p-3"
              style={{
                backgroundColor: selectedCategory === stat.key ? "#FFFFFF" : "#F5F5F5",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <Text className={`text-3xl font-bold tracking-tight ${stat.valueClass}`}>
                {workersByCategory[stat.key].length}
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
      <ScreenHeader title="Live Kartta" onClose={handleBack} />

      <View className="flex-1">
        <MapView
          ref={mapRef}
          style={{ flex: 1, width: "100%" }}
          initialRegion={INITIAL_REGION}
          showsUserLocation
          scrollEnabled
          zoomEnabled
          pitchEnabled
          onPress={() => {
            if (markerPressedRef.current) return;
            setSelectedWorker(null);
            setSelectedCategory(null);
          }}
        >
          {allMapWorkers.map((worker) => (
            <Marker
              key={worker.id}
              coordinate={{ latitude: worker.latitude, longitude: worker.longitude }}
              anchor={{ x: 0.5, y: 1 }}
              onPress={() => {
                markerPressedRef.current = true;
                setSelectedCategory(null);
                setSelectedWorker(worker);
                focusOnWorker(worker);
                setTimeout(() => { markerPressedRef.current = false; }, 100);
              }}
            >
              <WorkerPinMarker worker={worker} />
            </Marker>
          ))}
        </MapView>
      </View>

      {selectedCategory && currentFocusWorker && (
        <View className="absolute left-4 right-4 bottom-28" pointerEvents="box-none">
          <FocusWorkerCard
            worker={currentFocusWorker}
            category={selectedCategory}
            index={categoryWorkerIndex}
            total={categoryWorkers.length}
            onCall={handleCategoryCall}
            onPrev={handlePrevWorker}
            onNext={handleNextWorker}
            onInfo={() => router.push(`/history-details?id=${currentFocusWorker.sessionId}`)}
            onPress={() => focusOnWorker(currentFocusWorker)}
          />
        </View>
      )}

      <View
        className="absolute left-6 right-6 bottom-6 flex-row gap-4"
        pointerEvents="box-none"
      >
        {STAT_CARDS.map((stat) => (
          <TouchableOpacity
            key={stat.key}
            activeOpacity={0.8}
            onPress={() => handleStatCardPress(stat.key)}
            className="flex-1 min-h-16 rounded-inner-card overflow-hidden justify-center items-center p-3"
            style={{
              backgroundColor: selectedCategory === stat.key ? "#FFFFFF" : "#F5F5F5",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text className={`text-3xl font-bold tracking-tight ${stat.valueClass}`}>
              {workersByCategory[stat.key].length}
            </Text>
            <Text className="text-xs font-normal leading-4 text-labels-primary text-center mt-0.5">
              {stat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
            onInfo={() => router.push(`/history-details?id=${selectedWorker.sessionId}`)}
            onPress={() => focusOnWorker(selectedWorker)}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
