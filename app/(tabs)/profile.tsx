import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { IconChevronRight } from "../../src/components/icons";
import { supabase } from "../../src/lib/supabase";

type Profile = {
  name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: string;
};

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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("name, phone, avatar_url, role")
        .eq("id", user.id)
        .single();

      if (data) setProfile(data);
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const avatarUri = profile?.avatar_url ?? "https://placehold.co/72x72";
  const displayName = profile?.name ?? "—";
  const displayRole = profile?.role === "supervisor" ? "Valvoja" : "Työntekijä";

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
        {loading ? (
          <View className="w-16 h-16 rounded-full bg-background-card items-center justify-center">
            <ActivityIndicator size="small" color="#9CA3AF" />
          </View>
        ) : (
          <Image
            source={{ uri: avatarUri }}
            className="w-16 h-16 rounded-full bg-background-card"
            resizeMode="cover"
          />
        )}
        <View className="flex-1 gap-1">
          <Text className="text-xl font-normal leading-6 text-primary">
            {loading ? "Ladataan..." : displayName}
          </Text>
          <Text className="text-base font-normal leading-5 text-tertiary">
            {loading ? "" : displayRole}
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
                if (item.id === "asetukset") router.push("/settings");
              }}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
