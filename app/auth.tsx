import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../src/lib/supabase";

// Outline text field with floating label (matches screenshot)
function OutlineField({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "sentences";
}) {
  return (
    <View className="mt-6">
      <View
        className="rounded-2xl border border-gray-300 px-4 pt-5 pb-3"
        style={{ position: "relative" }}
      >
        <Text
          className="text-caption text-xs"
          style={{
            position: "absolute",
            top: -9,
            left: 14,
            backgroundColor: "#FFFFFF",
            paddingHorizontal: 4,
          }}
        >
          {label}
        </Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType ?? "default"}
          autoCapitalize={autoCapitalize ?? "sentences"}
          autoCorrect={false}
          className="text-base text-primary"
          style={{ paddingVertical: 0 }}
        />
      </View>
    </View>
  );
}

type Mode = "login" | "register";

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Virhe", "Täytä kaikki kentät.");
      return;
    }
    if (isLogin && !agreed) {
      Alert.alert("Virhe", "Hyväksy tietosuojaseloste jatkaaksesi.");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) Alert.alert("Kirjautuminen epäonnistui", error.message);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          Alert.alert("Rekisteröinti epäonnistui", error.message);
        } else {
          Alert.alert(
            "Tili luotu",
            "Tarkista sähköpostisi ja vahvista tili."
          );
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(isLogin ? "register" : "login");
    setEmail("");
    setPassword("");
    setAgreed(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 pt-16 pb-10">
            {/* Logo placeholder */}
            <View className="items-center mb-10">
              <View className="h-20 w-20 rounded-2xl bg-background-card items-center justify-center">
                <Text className="text-caption text-xs">Logo</Text>
              </View>
            </View>

            {/* Title */}
            <Text className="text-labels-primary text-4xl font-bold text-center">
              {isLogin ? "Kirjaudu sisään" : "Luo tili"}
            </Text>

            {/* Fields */}
            <OutlineField
              label="Sähköposti"
              placeholder="Syötä sähköpostiosoitteesi"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <OutlineField
              label="Salasana"
              placeholder="Syötä salasanasi"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            {/* Login-only row: checkbox + forgot password */}
            {isLogin && (
              <View className="mt-5 flex-row items-center justify-between">
                <TouchableOpacity
                  onPress={() => setAgreed(!agreed)}
                  activeOpacity={0.7}
                  className="flex-row items-center gap-2"
                >
                  <View
                    className="h-5 w-5 items-center justify-center rounded border border-gray-400"
                    style={{
                      backgroundColor: agreed ? "#27272A" : "#FFFFFF",
                    }}
                  >
                    {agreed && (
                      <Text className="text-white text-xs font-bold">✓</Text>
                    )}
                  </View>
                  <Text className="text-sm text-primary">
                    Hyväksyn{" "}
                    <Text className="underline">tietosuojaselosteen</Text>
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.7}>
                  <Text className="text-sm text-primary">
                    Unohdin Salasanan
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Submit button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
              className="mt-10 h-14 items-center justify-center rounded-button bg-status-button"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-base font-medium text-white">
                  {isLogin ? "Kirjaudu" : "Luo tili"}
                </Text>
              )}
            </TouchableOpacity>

            {/* Mode switch */}
            <View className="mt-6 flex-row items-center justify-center gap-1">
              <Text className="text-sm text-caption">
                {isLogin
                  ? "Eikö sinulla ole tiliä?"
                  : "Onko sinulla jo tili?"}
              </Text>
              <Pressable onPress={switchMode}>
                <Text className="text-sm font-medium text-labels-primary underline">
                  {isLogin ? "Luo tili" : "Kirjaudu sisään"}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
