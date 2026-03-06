import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  IconChevronRight,
  IconClock,
  IconLocationPin,
  IconSliders,
} from "../../src/components/icons";

type HistoryStatus = "safe" | "alert" | "warning";

interface HistoryItem {
  id: string;
  date: string;
  status: string;
  statusType: HistoryStatus;
  location: string;
  time: string;
}

const MOCK_HISTORY: HistoryItem[] = [
  {
    id: "1",
    date: "ma, syyskuu 12",
    status: "Kuitannut ulos turvallisesti",
    statusType: "safe",
    location: "Kuhasalo",
    time: "08:00 - 18:00",
  },
  {
    id: "2",
    date: "pe, syyskuu 9",
    status: "Myöhässä – ratkaistu",
    statusType: "alert",
    location: "Kuhasalo",
    time: "08:00 - 18:00",
  },
  {
    id: "3",
    date: "to, syyskuu 8",
    status: "Hälytys lähetetty",
    statusType: "warning",
    location: "Kuhasalo",
    time: "08:00 - 18:00",
  },
];

const STATUS_COLOR_CLASS: Record<HistoryStatus, string> = {
  safe: "text-status-safe",
  alert: "text-alert",
  warning: "text-status-warning",
};

function HistoryCard({ item }: { item: HistoryItem }) {
  const statusClass = STATUS_COLOR_CLASS[item.statusType];
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className="min-h-28 flex-row rounded-2xl bg-history-card overflow-hidden p-4"
    >
      <View className="flex-1 gap-1 justify-center">
        <Text className="text-xl font-normal leading-6 text-primary">
          {item.date}
        </Text>
        <View className="flex-row items-center gap-1">
          <IconLocationPin width={16} height={16} color="#333333" />
          <Text className="text-base font-normal leading-5 text-primary">
            {item.location}
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <IconClock width={16} height={16} color="#333333" />
          <Text className="text-base font-normal leading-5 text-primary">
            {item.time}
          </Text>
        </View>
      </View>
      <View className="justify-between items-end">
        <IconChevronRight color="#B0B3BA" width={20} height={20} />
        <Text className={`text-xs font-normal leading-4 ${statusClass}`}>
          {item.status}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  return (
    <SafeAreaView
      className="flex-1 bg-background-primary"
      edges={["top"]}
    >
      <View className="px-6 pt-6 flex-row items-center justify-between">
        <Text className="text-4xl font-bold tracking-wide text-primary">
          Historia
        </Text>
        <TouchableOpacity activeOpacity={0.7} hitSlop={12}>
          <IconSliders width={24} height={24} color="#333333" />
        </TouchableOpacity>
      </View>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, gap: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {MOCK_HISTORY.map((item) => (
          <HistoryCard key={item.id} item={item} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
