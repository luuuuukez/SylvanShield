import { Tabs } from "expo-router";
import {
  IconWork,
  IconLayers,
  IconHistory,
  IconProfile,
} from "../../src/components/icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#000000",
        tabBarInactiveTintColor: "#999999",
        tabBarLabelStyle: { fontSize: 12, fontWeight: "500" },
        tabBarStyle: { borderTopColor: "#E5E7EB", backgroundColor: "#FFFFFF" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Työ",
          tabBarIcon: ({ focused }) => <IconWork focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Hallintapaneeli",
          tabBarIcon: ({ focused }) => <IconLayers focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Historia",
          tabBarIcon: ({ focused }) => <IconHistory focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profiili",
          tabBarIcon: ({ focused }) => <IconProfile focused={focused} />,
        }}
      />
    </Tabs>
  );
}
