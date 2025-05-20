import { Tabs } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { useColorScheme } from "react-native";

export default function tabsLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? "#FFFFF4" : "#152B3F",
        tabBarInactiveTintColor: isDark ? "#666" : "grey",
        tabBarStyle: {
          backgroundColor: isDark ? "#0B1724" : "white",
          borderTopColor: isDark ? "#2a3b55" : "#ccc",
        },
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          tabBarLabel: "Feed",
          title: "Feed",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={24} name="newspaper-o" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="urlSearch"
        options={{
          tabBarLabel: "URL Search",
          title: "Url Search",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="search-plus" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: "Profile",
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="user" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
