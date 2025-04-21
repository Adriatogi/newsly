import { Tabs } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

export default function tabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "grey",
        tabBarStyle: {
          backgroundColor: "#152B3F",
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
    </Tabs>
  );
}