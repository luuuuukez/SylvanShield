import "./global.css";
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 bg-red-500 items-center justify-center">
      <Text className="text-white text-3xl font-bold">Hello MotoSafe!</Text>
    </View>
  );
}