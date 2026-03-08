import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import Svg, { Path } from "react-native-svg";
import { ScreenHeader } from "../src/components/ScreenHeader";

function TrashIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M3 5H17"
        stroke="#EF4444"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 5V3H12V5"
        stroke="#EF4444"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5 5L6 17H14L15 5"
        stroke="#EF4444"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10 9V14"
        stroke="#EF4444"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path
        d="M7.5 9L7.5 14"
        stroke="#EF4444"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path
        d="M12.5 9L12.5 14"
        stroke="#EF4444"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}
import { supabase } from "../src/lib/supabase";

function CameraIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Path
        d="M13 13H3C2.73478 13 2.48043 12.8946 2.29289 12.7071C2.10536 12.5196 2 12.2652 2 12V5C2 4.73478 2.10536 4.48043 2.29289 4.29289C2.48043 4.10536 2.73478 4 3 4H4.99963L5.99963 2.5H9.99963L10.9996 4H13C13.2652 4 13.5196 4.10536 13.7071 4.29289C13.8946 4.48043 14 4.73478 14 5V12C14 12.2652 13.8946 12.5196 13.7071 12.7071C13.5196 12.8946 13.2652 13 13 13Z"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 10.5C9.24264 10.5 10.25 9.49264 10.25 8.25C10.25 7.00736 9.24264 6 8 6C6.75736 6 5.75 7.00736 5.75 8.25C5.75 9.49264 6.75736 10.5 8 10.5Z"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function FormField({
  label,
  value,
  onChangeText,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: TextInput["props"]["keyboardType"];
  autoCapitalize?: TextInput["props"]["autoCapitalize"];
}) {
  return (
    <View className="gap-2">
      <Text className="text-xs text-caption leading-4">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        className="bg-background-card rounded-lg px-4 text-base text-primary"
        style={{ height: 56 }}
      />
    </View>
  );
}

const FALLBACK_AVATAR = "https://placehold.co/112x112";

export default function SafeContactEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [avatarUri, setAvatarUri] = useState(FALLBACK_AVATAR);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      if (!isEditing) { setLoading(false); return; }

      const { data } = await supabase
        .from("safety_contacts")
        .select("name, phone, email, avatar_url, is_active")
        .eq("id", id)
        .single();

      if (data) {
        setName(data.name ?? "");
        setPhone(data.phone ?? "");
        setEmail(data.email ?? "");
        setIsPrimary(data.is_active ?? false);
        if (data.avatar_url) setAvatarUri(data.avatar_url);
      }
      setLoading(false);
    }
    init();
  }, [id, isEditing]);

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

  const handleDelete = () => {
    Alert.alert(
      "Poista turvakontakti",
      `Haluatko varmasti poistaa kontaktin "${name || "—"}"?`,
      [
        { text: "Peruuta", style: "cancel" },
        {
          text: "Poista",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("safety_contacts")
              .delete()
              .eq("id", id);

            if (error) {
              Alert.alert("Virhe", "Poistaminen epäonnistui. Yritä uudelleen.");
            } else {
              router.back();
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      avatar_url: avatarUri !== FALLBACK_AVATAR ? avatarUri : null,
      is_active: isPrimary,
    };

    let error;

    if (isEditing) {
      ({ error } = await supabase
        .from("safety_contacts")
        .update(payload)
        .eq("id", id));
    } else {
      ({ error } = await supabase
        .from("safety_contacts")
        .insert({ ...payload, user_id: userId }));
    }

    setSaving(false);

    if (error) {
      Alert.alert("Virhe", "Tietojen tallentaminen epäonnistui. Yritä uudelleen.");
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={["top"]}>
      <ScreenHeader
        title="Turvakontakti"
        onBack={() => router.back()}
        rightAction={
          isEditing ? (
            <TouchableOpacity onPress={handleDelete} hitSlop={8}>
              <TrashIcon />
            </TouchableOpacity>
          ) : undefined
        }
      />

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
            <View className="items-center justify-center py-20">
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
                    <CameraIcon />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Form fields */}
              <View className="gap-6">
                <FormField label="Koko nimi" value={name} onChangeText={setName} />
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
                />
              </View>

              {/* Primary toggle */}
              <View className="flex-row items-center justify-between mt-8">
                <Text className="text-base text-primary flex-1 mr-3">
                  Aseta nykyiseksi turvakontaktiksi:
                </Text>
                <Switch
                  value={isPrimary}
                  onValueChange={setIsPrimary}
                  trackColor={{ false: "#E5E5E5", true: "#FFAE23" }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Save button */}
              <View className="items-center mt-10">
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
