import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { ScreenHeader } from "../src/components/ScreenHeader";
import { IconCameraOverlay } from "../src/components/icons";
import { supabase } from "../src/lib/supabase";

function FormField({
  label,
  value,
  onChangeText,
  keyboardType,
  autoCapitalize,
  editable,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: TextInput["props"]["keyboardType"];
  autoCapitalize?: TextInput["props"]["autoCapitalize"];
  editable?: boolean;
}) {
  return (
    <View className="gap-2">
      <Text className="text-xs text-secondary leading-4">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable !== false}
        className="bg-background-card rounded-lg h-14 px-4 text-base text-primary"
        style={{
          height: 56,
          opacity: editable === false ? 0.5 : 1,
        }}
      />
    </View>
  );
}

export default function ProfileEditScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [avatarUri, setAvatarUri] = useState<string>("https://placehold.co/112x112");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);
      setEmail(user.email ?? "");

      const { data } = await supabase
        .from("profiles")
        .select("name, phone, avatar_url")
        .eq("id", user.id)
        .single();

      if (data) {
        setName(data.name ?? "");
        setPhone(data.phone ?? "");
        if (data.avatar_url) setAvatarUri(data.avatar_url);
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({ name: name.trim(), phone: phone.trim() })
      .eq("id", userId);

    setSaving(false);

    if (error) {
      Alert.alert("Virhe", "Tietojen tallentaminen epäonnistui. Yritä uudelleen.");
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={["top"]}>
      <ScreenHeader title="Omat tiedot" onClose={() => router.back()} />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {loading ? (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator size="large" color="#9CA3AF" />
            </View>
          ) : (
            <>
              {/* Avatar */}
              <View className="items-center mb-10">
                <View style={{ position: "relative", width: 112, height: 112 }}>
                  <Image
                    source={{ uri: avatarUri }}
                    style={{
                      width: 112,
                      height: 112,
                      borderRadius: 56,
                      borderWidth: 3,
                      borderColor: "#F5F5F5",
                    }}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={pickImage}
                    activeOpacity={0.8}
                    style={{
                      position: "absolute",
                      right: 0,
                      bottom: 0,
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: "#27272A",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconCameraOverlay />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Form fields */}
              <View className="gap-6">
                <FormField
                  label="Koko nimi"
                  value={name}
                  onChangeText={setName}
                />
                <FormField
                  label="Puhelinnumero"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
                <FormField
                  label="Sähköpostiosoite"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={false}
                />
              </View>

              {/* Save button */}
              <View className="items-center mt-12">
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={saving}
                  activeOpacity={0.85}
                  className="rounded-button bg-status-button items-center justify-center"
                  style={{
                    width: 240,
                    height: 56,
                    shadowColor: "rgba(56,91,61,0.25)",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 1,
                    shadowRadius: 8,
                    elevation: 3,
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className="text-base font-normal text-white">Tallenna</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
