import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#000000",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarLabelStyle: { fontSize: 12, fontWeight: "500" },
        tabBarStyle: { borderTopColor: "#E5E7EB", backgroundColor: "#FFFFFF" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Työ" }} />
      <Tabs.Screen name="dashboard" options={{ title: "Hallintapaneeli" }} />
      <Tabs.Screen name="history" options={{ title: "Historia" }} />
      <Tabs.Screen name="profile" options={{ title: "Profiili" }} />
    </Tabs>
  );
}
