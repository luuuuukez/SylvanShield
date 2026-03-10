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
import { ScreenHeader } from "../src/components/ScreenHeader";
import { IconTrash, IconCameraOverlay } from "../src/components/icons";
import { supabase } from "../src/lib/supabase";

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
      <Text className="text-xs text-secondary leading-4">{label}</Text>
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
              <IconTrash />
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
              <ActivityIndicator size="large" color="#B0B3BA" />
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
                  trackColor={{ false: "#E5E5E5", true: "#9BDA53" }}
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
