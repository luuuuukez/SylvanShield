import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import MapView, { Marker } from "react-native-maps";
import { IconLocationPin } from "../src/components/icons";
import { ScreenHeader } from "../src/components/ScreenHeader";

type DotColor = "black" | "orange" | "red";

type TimelineEvent = {
  time: string;
  label: string;
  subtitle?: string;
  dotColor: DotColor;
};

type HistoryDetail = {
  id: string;
  status: string;
  statusType: "safe" | "alert" | "warning";
  location: string;
  date: string;
  estimatedHours: string;
  actualHours: string;
  safetyContact: { name: string; phone: string; avatar?: string };
  timeline: TimelineEvent[];
  lastLocation: { latitude: number; longitude: number };
};

const DOT_BG: Record<DotColor, string> = {
  black: "#333333",
  orange: "#FA8B46",
  red: "#EF4444",
};

const STATUS_TEXT_CLASS: Record<HistoryDetail["statusType"], string> = {
  safe: "text-status-safe",
  alert: "text-alert",
  warning: "text-status-warning",
};

const MOCK_DETAILS: Record<string, HistoryDetail> = {
  "1": {
    id: "1",
    status: "Kuitannut ulos turvallisesti",
    statusType: "safe",
    location: "Kuhasalo",
    date: "ma, syyskuu 12, 2026",
    estimatedHours: "8h",
    actualHours: "8h",
    safetyContact: { name: "Anna Svensson", phone: "+358 451264429", avatar: "https://placehold.co/44x44" },
    timeline: [
      { time: "08:00", label: "Työvuoro aloitettu", dotColor: "black" },
      { time: "16:00", label: "Saavutettu aika", dotColor: "black" },
      { time: "16:00", label: "Kuittaus ulos", dotColor: "black" },
    ],
    lastLocation: { latitude: 60.1699, longitude: 24.9384 },
  },
  "2": {
    id: "2",
    status: "Myöhässä – ratkaistu",
    statusType: "alert",
    location: "Kuhasalo",
    date: "pe, syyskuu 9, 2026",
    estimatedHours: "8h",
    actualHours: "8h 14m",
    safetyContact: { name: "Anna Svensson", phone: "+358 451264429", avatar: "https://placehold.co/44x44" },
    timeline: [
      { time: "07:29", label: "Työvuoro aloitettu", dotColor: "black" },
      { time: "16:00", label: "Saavutettu aika", dotColor: "black" },
      { time: "16:01", label: "Armonaikajakso alkanut", dotColor: "orange" },
      { time: "16:15", label: "Hätäilmoitus lähetetty", dotColor: "red" },
      {
        time: "16:15",
        label: "Hälytys kumottu",
        subtitle: "Työntekijä vahvisti turvallisuuden peruuttamalla hälytyksen",
        dotColor: "black",
      },
    ],
    lastLocation: { latitude: 60.168, longitude: 24.935 },
  },
  "3": {
    id: "3",
    status: "Hälytys lähetetty",
    statusType: "warning",
    location: "Kuhasalo",
    date: "to, syyskuu 8, 2026",
    estimatedHours: "8h",
    actualHours: "9h 02m",
    safetyContact: { name: "Anna Svensson", phone: "+358 451264429", avatar: "https://placehold.co/44x44" },
    timeline: [
      { time: "08:00", label: "Työvuoro aloitettu", dotColor: "black" },
      { time: "16:00", label: "Saavutettu aika", dotColor: "black" },
      { time: "16:01", label: "Armonaikajakso alkanut", dotColor: "orange" },
      { time: "16:15", label: "Hätäilmoitus lähetetty", dotColor: "red" },
    ],
    lastLocation: { latitude: 60.171, longitude: 24.94 },
  },
};

function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <View>
      {events.map((event, i) => {
        const isLast = i === events.length - 1;
        return (
          <View
            key={i}
            style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: isLast ? 0 : 48 }}
          >
            {/* Time */}
            <Text style={{ width: 48, fontSize: 16, lineHeight: 20, color: "#27272A" }}>
              {event.time}
            </Text>

            {/* Dot + connecting line */}
            <View style={{ width: 12, marginHorizontal: 12, alignItems: "center" }}>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: DOT_BG[event.dotColor],
                  borderWidth: 1.5,
                  borderColor: "#F5F5F5",
                  marginTop: 4,
                }}
              />
              {!isLast && (
                <View
                  style={{
                    position: "absolute",
                    left: 5.5,
                    width: 1,
                    top: 18,
                    height: 40,
                    backgroundColor: "#B0B3BA",
                  }}
                />
              )}
            </View>

            {/* Event label + optional subtitle */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, lineHeight: 20, color: "#27272A" }}>{event.label}</Text>
              {event.subtitle && (
                <Text
                  style={{ fontSize: 12, lineHeight: 16, color: "#9CA3AF", marginTop: 4, width: "85%" }}
                >
                  {event.subtitle}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default function HistoryDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const detail = MOCK_DETAILS[id ?? "2"] ?? MOCK_DETAILS["2"];

  const statusClass = STATUS_TEXT_CLASS[detail.statusType];
  const hoursChanged = detail.actualHours !== detail.estimatedHours;

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={["top"]}>
      {/* Header */}
      <ScreenHeader title="Historia" onClose={() => router.back()} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Status */}
        <Text className={`text-xl font-normal leading-6 mb-3 ${statusClass}`}>
          {detail.status}
        </Text>

        {/* Location + date row */}
        <View className="flex-row items-center gap-3 mb-6">
          <View className="flex-row items-center gap-1">
            <IconLocationPin width={16} height={16} color="#333333" />
            <Text className="text-base text-primary">{detail.location}</Text>
          </View>
          <View style={{ width: 1, height: 14, backgroundColor: "#B0B3BA" }} />
          <Text className="text-base text-primary">{detail.date}</Text>
        </View>

        {/* Timeline card */}
        <View
          className="rounded-card bg-background-card p-4 mb-6"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          {/* Estimated / actual hours */}
          <View className="flex-row items-center gap-2 mb-6">
            <Text className="text-base text-labels-primary">Arvioitu / Todellinen työaika:</Text>
            <Text className="text-base text-labels-primary">{detail.estimatedHours}</Text>
            <View style={{ width: 1, height: 14, backgroundColor: "#B0B3BA", transform: [{ rotate: "15deg" }] }} />
            <Text className={`text-base ${hoursChanged ? "text-alert" : "text-labels-primary"}`}>
              {detail.actualHours}
            </Text>
          </View>

          {/* Timeline */}
          <Timeline events={detail.timeline} />
        </View>

        {/* Safety contact */}
        <Text className="text-xs text-caption leading-4 mb-2">Nykyinen Turvakontakti</Text>
        <View
          className="rounded-2xl bg-background-card overflow-hidden"
          style={{ height: 64 }}
        >
          {detail.safetyContact.avatar && (
            <Image
              source={{ uri: detail.safetyContact.avatar }}
              style={{
                position: "absolute",
                left: 16,
                top: 10,
                width: 44,
                height: 44,
                borderRadius: 22,
              }}
              resizeMode="cover"
            />
          )}
          <View style={{ position: "absolute", left: 72, top: 12 }}>
            <Text style={{ fontSize: 16, lineHeight: 20, color: "#27272A" }}>
              {detail.safetyContact.name}
            </Text>
            <Text style={{ fontSize: 12, lineHeight: 16, color: "#9CA3AF", marginTop: 2 }}>
              {detail.safetyContact.phone}
            </Text>
          </View>
        </View>

        {/* Last location snapshot */}
        <Text className="text-xs text-caption leading-4 mt-6 mb-2">Lopullinen sijainti</Text>
        <View
          className="rounded-card overflow-hidden"
          style={{ height: 112 }}
        >
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: detail.lastLocation.latitude,
              longitude: detail.lastLocation.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
            pointerEvents="none"
          >
            <Marker
              coordinate={detail.lastLocation}
              anchor={{ x: 0.5, y: 1 }}
            />
          </MapView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
