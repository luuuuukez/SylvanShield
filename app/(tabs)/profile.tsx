import {
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { IconChevronRight } from "../../src/components/icons";

const MENU_ITEMS = [
  { id: "omat", label: "Omat tiedot" },
  { id: "turva", label: "Turvakontaktit" },
  { id: "asetukset", label: "Asetukset" },
];

function MenuRow({
  label,
  isFirst,
  onPress,
}: {
  label: string;
  isFirst: boolean;
  onPress: () => void;
}) {
  return (
    <>
      {!isFirst && (
        <View className="self-stretch h-px bg-separator" />
      )}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        className="flex-row items-center justify-between self-stretch min-h-16 py-4"
      >
        <Text className="flex-1 text-base font-normal leading-5 text-labels-primary">
          {label}
        </Text>
        <IconChevronRight color="#B0B3BA" width={20} height={20} />
      </TouchableOpacity>
    </>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  return (
    <SafeAreaView
      className="flex-1 bg-background-primary"
      edges={["top"]}
    >
      <View className="px-6 pt-6">
        <Text className="text-4xl font-bold tracking-wide text-primary">
          Profiili
        </Text>
      </View>

      <View className="px-6 mt-8 flex-row items-center gap-4">
        <Image
          source={{ uri: "https://placehold.co/72x72" }}
          className="w-16 h-16 rounded-full bg-background-card"
          resizeMode="cover"
        />
        <View className="flex-1 gap-1">
          <Text className="text-xl font-normal leading-6 text-primary">
            Markus Selin
          </Text>
          <Text className="text-base font-normal leading-5 text-profile-subtitle">
            A3123 - Rooli
          </Text>
        </View>
      </View>

      <View className="px-6 mt-8">
        <View className="rounded-card bg-background-card overflow-hidden px-5 py-2">
          {MENU_ITEMS.map((item, index) => (
            <MenuRow
              key={item.id}
              label={item.label}
              isFirst={index === 0}
              onPress={() => {
                if (item.id === "omat") router.push("/profile-edit");
                if (item.id === "turva") router.push("/safe-contacts");
              }}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
