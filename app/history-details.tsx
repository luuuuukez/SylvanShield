import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { IconLocationPin } from "../src/components/icons";
import { ScreenHeader } from "../src/components/ScreenHeader";
import { supabase } from "../src/lib/supabase";

// ── Types ──────────────────────────────────────────────────────────────────────

type DotColor = "black" | "orange" | "red";

type TimelineEvent = {
  time: string;
  label: string;
  subtitle?: string;
  dotColor: DotColor;
};

type AlertRow = {
  id: string;
  triggered_at: string | null;
  reason: string | null;
  status: string | null;
};

type SafetyContact = {
  name: string | null;
  phone: string | null;
  avatar_url: string | null;
};

type SessionDetail = {
  id: string;
  status: string;
  start_time: string | null;
  expected_end_time: string | null;
  actual_end_time: string | null;
  last_known_latitude: number | null;
  last_known_longitude: number | null;
  safety_contact_id: string | null;
  alerts: AlertRow[];
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatHM(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function formatFullDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fi-FI", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDuration(startIso: string, endIso: string): string {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  const totalMin = Math.round(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

function getStatusInfo(session: SessionDetail): { label: string; colorClass: string } {
  if (session.status === "completed") {
    if (session.alerts.length > 0) {
      return { label: "Myöhässä – ratkaistu", colorClass: "text-labels-primary" };
    }
    return { label: "Kuitannut ulos turvallisesti", colorClass: "text-labels-primary" };
  }
  if (session.status === "alert_sent") {
    return { label: "Hälytys lähetetty", colorClass: "text-state-critical" };
  }
  if (session.status === "grace_period") {
    return { label: "Myöhässä – kesken", colorClass: "text-state-grace" };
  }
  return { label: "Käynnissä", colorClass: "text-state-active" };
}

function buildTimeline(session: SessionDetail): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  if (session.start_time) {
    events.push({ time: formatHM(session.start_time), label: "Työvuoro aloitettu", dotColor: "black" });
  }

  if (session.expected_end_time) {
    events.push({ time: formatHM(session.expected_end_time), label: "Suunniteltu lopetusaika", dotColor: "black" });
  }

  if (session.alerts.length > 0) {
    if (session.expected_end_time) {
      events.push({ time: formatHM(session.expected_end_time), label: "Armonaikajakso alkanut", dotColor: "orange" });
    }
    const alert = session.alerts[0];
    if (alert.triggered_at) {
      events.push({ time: formatHM(alert.triggered_at), label: "Hätäilmoitus lähetetty", dotColor: "red" });
    }
  }

  if (session.actual_end_time) {
    const hadAlert = session.alerts.length > 0;
    events.push({
      time: formatHM(session.actual_end_time),
      label: hadAlert ? "Hälytys kumottu" : "Kuittaus ulos",
      subtitle: hadAlert
        ? "Työntekijä vahvisti turvallisuuden peruuttamalla hälytyksen"
        : undefined,
      dotColor: "black",
    });
  }

  return events;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const DOT_BG: Record<DotColor, string> = {
  black: "#333333",
  orange: "#FA8B46",
  red: "#EF4444",
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

// ── Screen ─────────────────────────────────────────────────────────────────────

export default function HistoryDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [session, setSession] = useState<SessionDetail | null>(null);
  const [contact, setContact] = useState<SafetyContact | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState<string>("Tuntematon sijainti");

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    async function fetchSession() {
      const { data, error } = await supabase
        .from("work_sessions")
        .select(`
          *,
          alerts(id, triggered_at, reason, status),
          safety_contacts!safety_contact_id(name, phone, avatar_url)
        `)
        .eq("id", id)
        .single();

      console.log("[history-details] error:", error);
      console.log("[history-details] safety_contact_id:", (data as any)?.safety_contact_id);
      console.log("[history-details] safety_contacts key:", JSON.stringify((data as any)?.safety_contacts));
      console.log("[history-details] all keys:", data ? Object.keys(data) : null);

      if (data) {
        type RawSession = SessionDetail & { safety_contacts?: SafetyContact | SafetyContact[] | null };
        const raw = data as unknown as RawSession;
        setSession(raw);

        const contactRaw = raw.safety_contacts;
        const joined = Array.isArray(contactRaw) ? contactRaw[0] : contactRaw;
        console.log("[history-details] joined (after array unwrap):", joined);

        if (joined?.name) {
          setContact(joined);
        } else if (raw.safety_contact_id) {
          // Join returned null — fall back to a direct fetch (e.g. RLS blocked the join)
          console.log("[history-details] join empty, falling back to direct fetch for id:", raw.safety_contact_id);
          const { data: fallback, error: fbErr } = await supabase
            .from("safety_contacts")
            .select("name, phone, avatar_url")
            .eq("id", raw.safety_contact_id)
            .single();
          console.log("[history-details] fallback result:", fallback, "error:", fbErr);
          if (fallback) setContact(fallback as SafetyContact);
        }

        const { last_known_latitude: lat, last_known_longitude: lon } = raw;
        if (lat != null && lon != null) {
          try {
            const [result] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
            setLocationName(result?.district ?? "Tuntematon sijainti");
          } catch {
            setLocationName("Tuntematon sijainti");
          }
        }
      }
      setLoading(false);
    }
    fetchSession();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background-primary" edges={["top"]}>
        <ScreenHeader title="Historia" onClose={() => router.back()} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView className="flex-1 bg-background-primary" edges={["top"]}>
        <ScreenHeader title="Historia" onClose={() => router.back()} />
        <View className="flex-1 items-center justify-center">
          <Text className="text-caption text-base">Työvuoroa ei löydy</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { label: statusLabel, colorClass: statusClass } = getStatusInfo(session);
  const timeline = buildTimeline(session);

  const estimatedHours =
    session.start_time && session.expected_end_time
      ? formatDuration(session.start_time, session.expected_end_time)
      : "—";
  const actualHours =
    session.start_time && session.actual_end_time
      ? formatDuration(session.start_time, session.actual_end_time)
      : "—";
  const hoursChanged = actualHours !== estimatedHours && actualHours !== "—";

  const dateStr = session.start_time ? formatFullDate(session.start_time) : "—";

  const hasLocation =
    session.last_known_latitude != null && session.last_known_longitude != null;
  const mapRegion = hasLocation
    ? {
        latitude: session.last_known_latitude!,
        longitude: session.last_known_longitude!,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }
    : null;

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={["top"]}>
      <ScreenHeader title="Tiedot" onClose={() => router.back()} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Status */}
        <Text className={`text-xl font-normal leading-6 mb-3 ${statusClass}`}>
          {statusLabel}
        </Text>

        {/* Location + date row */}
        <View className="flex-row items-center gap-3 mb-6">
          {hasLocation && (
            <>
              <View className="flex-row items-center gap-1">
                <IconLocationPin width={16} height={16} color="#333333" />
                <Text className="text-base text-primary">{locationName}</Text>
              </View>
              <View style={{ width: 1, height: 14, backgroundColor: "#B0B3BA" }} />
            </>
          )}
          <Text className="text-base text-primary">{dateStr}</Text>
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
            <Text className="text-base text-labels-primary">{estimatedHours}</Text>
            <View style={{ width: 1, height: 14, backgroundColor: "#B0B3BA", transform: [{ rotate: "15deg" }] }} />
            <Text className={`text-base ${hoursChanged ? "text-alert" : "text-labels-primary"}`}>
              {actualHours}
            </Text>
          </View>

          {/* Timeline */}
          <Timeline events={timeline} />
        </View>

        {/* Safety contact */}
        <Text className="text-xs text-caption leading-4 mb-2">Nykyinen Turvakontakti</Text>
        <View className="rounded-2xl bg-background-card overflow-hidden" style={{ height: 64 }}>
          {contact?.avatar_url ? (
            <Image
              source={{ uri: contact.avatar_url }}
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
          ) : (
            <View
              style={{
                position: "absolute",
                left: 16,
                top: 10,
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "#E5E5E5",
              }}
            />
          )}
          <View style={{ position: "absolute", left: 72, top: 12 }}>
            <Text style={{ fontSize: 16, lineHeight: 20, color: "#27272A" }}>
              {contact?.name ?? "—"}
            </Text>
            <Text style={{ fontSize: 12, lineHeight: 16, color: "#9CA3AF", marginTop: 2 }}>
              {contact?.phone ?? ""}
            </Text>
          </View>
        </View>

        {/* Last location snapshot */}
        <Text className="text-xs text-caption leading-4 mt-6 mb-2">Lopullinen sijainti</Text>
        {mapRegion ? (
          <>
            <View className="rounded-card overflow-hidden" style={{ height: 112 }}>
              <MapView
                style={{ flex: 1 }}
                initialRegion={mapRegion}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
                pointerEvents="none"
              >
                <Marker
                  coordinate={{
                    latitude: session.last_known_latitude!,
                    longitude: session.last_known_longitude!,
                  }}
                  anchor={{ x: 0.5, y: 1 }}
                />
              </MapView>
            </View>
          </>
        ) : (
          <View className="rounded-card bg-background-card items-center justify-center" style={{ height: 112 }}>
            <Text className="text-caption text-sm">Sijaintitietoja ei saatavilla</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
