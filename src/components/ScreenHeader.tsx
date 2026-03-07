import { Text, TouchableOpacity, View } from "react-native";
import { IconClose, IconChevronRight } from "./icons";

type ScreenHeaderProps = {
  title: string;
  onClose?: () => void;
  onBack?: () => void;
};

export function ScreenHeader({ title, onClose, onBack }: ScreenHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-4 py-1 border-b border-gray-200">
      <TouchableOpacity
        onPress={onClose ?? onBack}
        className="p-2"
        hitSlop={8}
      >
        {onClose ? (
          <IconClose width={36} height={36} color="#404040" />
        ) : (
          <View style={{ transform: [{ rotate: "180deg" }] }}>
            <IconChevronRight width={36} height={36} color="#404040" />
          </View>
        )}
      </TouchableOpacity>
      <Text className="text-xl font-bold text-primary">{title}</Text>
      <View style={{ width: 40 }} />
    </View>
  );
}
