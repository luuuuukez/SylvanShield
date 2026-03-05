import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DashboardScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-1 items-center justify-center px-5">
        <Text className="text-xl font-semibold text-gray-800">
          Hallintapaneeli
        </Text>
        <Text className="text-gray-500 mt-2">System overview</Text>
      </View>
    </SafeAreaView>
  );
}
