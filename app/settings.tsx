import { useState } from "react";
import { Modal, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ScreenHeader } from "../src/components/ScreenHeader";
import { supabase } from "../src/lib/supabase";

// TODO: implement i18n
type Language = "fi" | "en";

const BRAND_PRIMARY = "#FFAE23";

function RadioButton({
  selected,
  onPress,
  label,
}: {
  selected: boolean;
  onPress: () => void;
  label: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center gap-[5px]"
    >
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: selected ? BRAND_PRIMARY : "#B0B3BA",
          backgroundColor: "#FFFFFF",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {selected && (
          <View
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: BRAND_PRIMARY,
            }}
          />
        )}
      </View>
      <Text className="text-base text-labels-primary">{label}</Text>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [language, setLanguage] = useState<Language>("fi");
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const handleSignOut = async () => {
    setShowSignOutModal(false);
    await supabase.auth.signOut();
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={["top"]}>
      <ScreenHeader title="Asetukset" onClose={() => router.back()} />

      <View className="flex-1 px-6 pt-6">
        {/* Settings card */}
        <View className="rounded-card bg-background-card overflow-hidden px-5 py-2">
          {/* Ilmoitukset row */}
          <View className="flex-row items-center justify-between min-h-16 py-4">
            <Text className="text-base text-labels-primary">Ilmoitukset</Text>
            <Switch
              value={notificationsOn}
              onValueChange={setNotificationsOn}
              trackColor={{ false: "#E5E5E5", true: BRAND_PRIMARY }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Separator */}
          <View className="h-px bg-separator" />

          {/* Kieli row */}
          <View className="flex-row items-center justify-between min-h-16 py-4">
            <Text className="text-base text-labels-primary">Kieli</Text>
            <View className="flex-row items-center gap-6">
              <RadioButton
                selected={language === "en"}
                onPress={() => setLanguage("en")}
                label="Englanti"
              />
              <RadioButton
                selected={language === "fi"}
                onPress={() => setLanguage("fi")}
                label="Suomi"
              />
            </View>
          </View>
        </View>

        {/* Spacer */}
        <View className="flex-1" />

        {/* Version */}
        <Text className="text-center text-xs text-secondary mb-6">
          Sovelluksen versio v1.0.0
        </Text>

        {/* Tallenna button */}
        <View className="items-center mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.85}
            className="rounded-button bg-status-button items-center justify-center"
            style={{ width: 240, height: 56 }}
          >
            <Text className="text-base text-white">Tallenna</Text>
          </TouchableOpacity>
        </View>

        {/* Kirjaudu ulos */}
        <TouchableOpacity
          onPress={() => setShowSignOutModal(true)}
          activeOpacity={0.7}
          className="items-center pb-8"
        >
          <Text className="text-base text-secondary">Kirjaudu ulos</Text>
        </TouchableOpacity>
      </View>

      {/* Sign-out confirmation modal */}
      <Modal
        visible={showSignOutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSignOutModal(false)}
      >
        <View className="flex-1 bg-overlay justify-center items-center px-6">
          <View className="w-80 overflow-hidden rounded-modal bg-white">
            <Text className="mt-8 text-center text-xl font-bold text-labels-primary px-8">
              Kirjaudu ulos?
            </Text>
            <Text className="mt-3 text-center text-base text-primary px-8">
              Haluatko varmasti kirjautua ulos?
            </Text>
            <View className="px-10 pt-8 pb-10 gap-4">
              <TouchableOpacity
                onPress={() => setShowSignOutModal(false)}
                activeOpacity={0.8}
                className="h-14 w-60 items-center justify-center self-center rounded-button bg-status-button"
                accessibilityRole="button"
                accessibilityLabel="Peruuta"
              >
                <Text className="text-base text-white">Peruuta</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSignOut}
                activeOpacity={0.8}
                className="h-14 w-60 items-center justify-center self-center rounded-button border border-gray-300 bg-transparent"
                accessibilityRole="button"
                accessibilityLabel="Kirjaudu ulos"
              >
                <Text className="text-base text-primary">Kirjaudu ulos</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
