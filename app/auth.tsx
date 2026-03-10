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
import Svg, { Path } from "react-native-svg";
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
          placeholderTextColor="#B0B3BA"
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
          <View className="flex-1 px-6 pt-24 pb-10">
            {/* Logo */}
            <View className="items-center mb-16">
              <Svg width={48} 
                    height={48 * (458.54 / 375.32)}
                    viewBox="0 0 375.32 458.54" 
                  fill="none">
                <Path
                  d="M375.17,137.72c0,24.66,0,49.33-.02,73.99,0,1.29.53,3.02-.7,3.73-1.51.86-2.34-.88-3.11-1.81-16.24-19.75-37.78-31.81-60.69-41.84-10.07-4.41-20.27-8.52-30.54-12.45-4.36-1.67-6.3-4.08-6.13-8.9.73-20.02-9.17-33.7-26.18-43.05-18.92-10.4-39.47-16.9-59.34-25.04-2.72-1.12-6.93-1.43-7.42-4.27-.57-3.27,3.47-4.82,5.93-6.65,7.49-5.55,15.09-10.96,23.28-15.48,2.37-1.31,4.75-2.44,7.58-1.39,19.53,7.24,39.09,14.39,56.77,25.74,17.3,11.12,28.91,26.33,33.87,46.39.98,3.98,3.17,6.15,7.11,7.44,5.85,1.91,11.51,4.4,17.19,6.8,3.7,1.56,5.09.51,5.38-3.47,1.25-17.48-.22-34.94-.05-52.41.03-2.85-1.21-4.69-3.76-5.88-30.94-14.38-61.08-30.64-94.18-39.95-14.37-4.04-27.7-1.31-40.31,5.98-21.22,12.25-39.63,28.03-56.85,45.32-4.11,4.12-8.72,7.76-12.73,11.97-8.93,9.38-6.68,19.09,5.3,23.93,40.94,16.52,82.01,32.71,122.76,49.69,19.52,8.13,39.66,14.84,58.42,24.75,15.11,7.99,29.31,17.02,39.16,31.69,14.44,21.5,17.88,44.41,10.16,69.07-6.86,21.91-19.31,40.5-34.5,57.38-30.83,34.25-68.8,59.13-108.31,81.9-9.95,5.74-20.29,10.8-30.4,16.27-2.86,1.55-5.56,1.92-8.53.42-17.1-8.64-34.12-17.43-50.39-27.59-.84-.53-1.62-1.18-2.4-1.79-2.14-1.67-2.15-3.01.75-3.45,3.62-.55,7.28-.76,10.9-1.29,9.32-1.39,17.97-5.01,26.61-8.49,4.4-1.77,8.28-2.28,12.22.55,4.25,3.05,8.25,2.27,12.53-.23,30.24-17.62,60.18-35.63,86.71-58.77,13.1-11.42,25.61-23.33,35.45-37.73,8.61-12.6,16.34-25.71,16.34-41.65,0-16.01-7.54-28.02-20.85-36.45-10.16-6.43-21.15-11.25-32.3-15.75-52.68-21.26-105.3-42.65-157.99-63.89-9.27-3.74-18.62-7.24-27.57-11.76-21.67-10.96-26.65-30.58-11.92-49.93,8.88-11.68,20.03-21.37,30.58-31.51,13.07-12.57,26.17-25.18,40.8-35.99,15.54-11.48,31.12-22.87,50.21-28.19,18.06-5.03,35.7-2.77,53.19,2.31,21.03,6.1,40.86,15.28,60.63,24.52,17.05,7.97,33.91,16.36,50.96,24.35,4.65,2.18,6.59,5.05,6.53,10.39-.28,24.16-.12,48.33-.12,72.49h-.03Z"
                  fill="#9BDA53"
                />
                <Path
                  d="M.92,238.7c.72-13.8-2.26-27.6-.03-41.41.18-1.11-.27-2.57.96-3.15,1.58-.75,2.41.73,3.24,1.68,15.35,17.62,34.54,29.56,56.07,38.07,11.93,4.71,23.77,9.63,35.75,14.22,4.29,1.64,6.38,3.95,6.16,8.84-.65,14.57,5.68,26.47,15.26,36.83,14.46,15.65,31.7,27.94,49.03,40.1,1.23.86,2.42,1.77,3.68,2.58,2.8,1.81,2.63,3.55-.1,5.21-9.84,5.98-19.96,11.39-30.74,15.5-2.05.78-3.79.38-5.59-.93-20.68-15.06-40.35-31.2-55.12-52.44-4.68-6.73-8.25-14.12-10.35-22.07-1.1-4.15-3.43-6.52-7.43-7.89-5.51-1.88-10.88-4.2-16.34-6.25-4.62-1.73-5.76-1.03-5.19,4.05.88,7.79,2.57,15.5,5.71,22.7,6.93,15.85,16.09,30.23,28.41,42.56,11.31,11.33,22.59,22.59,36.37,31.05,10.67,6.54,21.83,6.88,33.1,2.68,15.17-5.65,29.49-13.09,43.08-21.97,20.5-13.41,41.13-26.63,58.82-43.76,8.44-8.16,7.09-17.64-3.48-23.14-6.92-3.6-14.32-6.33-21.57-9.26-37.06-15-74.26-29.67-111.17-45.03-17.98-7.48-36.48-13.81-53.72-23.06-13.89-7.46-26.96-15.9-36.72-28.67C7.8,161.07,2.6,144.27.99,126.16-.82,105.71.48,85.2.08,64.71c-.08-4.04,1.15-6.96,5.1-8.8C39.9,39.74,73.71,21.52,110.09,9.08,126.88,3.34,144.1-.43,162.01.04c1,.03,2.02-.08,2.99.1,1.7.31,4.24-.3,4.68,1.85.36,1.78-2.03,2.38-3.35,3.25-17.34,11.31-33.42,24.23-48.85,38-6.76,6.03-15.72,7.86-23.67,11.58-17.19,8.04-34.58,15.67-51.52,24.26-2.52,1.28-5.16,2.62-5.09,6.13.24,12.65-.24,25.3.47,37.97,1.31,23.17,13.68,38.25,33.77,48.02,12.89,6.27,26.26,11.41,39.56,16.75,53.96,21.66,107.79,43.65,161.65,65.55,6.66,2.71,12.84,6.31,18.6,10.66,11.4,8.61,13.63,25.35,5.23,39.29-7.33,12.16-17.47,21.86-27.92,31.15-23.24,20.67-49.02,37.88-75.96,53.27-15.44,8.82-31.15,17.49-49,20.78-20.45,3.77-39.5.35-56.56-11.9-29.76-21.37-55.05-46.82-71.25-80.21-8.08-16.66-12.5-34.38-13.79-52.88-.58-8.31-1.44-16.6-1.09-24.95Z"
                  fill="#5FB537"
                />
              </Svg>
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
