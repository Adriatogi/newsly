import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Slot, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { PostHogProvider } from 'posthog-react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useSessionTracking } from '../lib/analytics';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    NewslyHeader: require("../assets/fonts/NewslyHeader.ttf"),
    "NewslyHeader-Bold": require("../assets/fonts/NewslyHeader-Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      // Hide splash screen once fonts are loaded
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Delay redirection slightly to let navigation initialize
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace("/tabs/feed");
    }, 100); // 100ms delay helps prevent navigation context errors

    return () => clearTimeout(timeout);
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <PostHogProvider
        apiKey="phc_sUx7Ac14ozlcNQiEBhE2NyjwQE65DbKSJtgLalUL0xB"
        options={{ host: "https://us.i.posthog.com" }}
      >
        <SessionTrackingWrapper />
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style="dark" backgroundColor="#ffffff" />
          <Slot />
        </GestureHandlerRootView>
      </PostHogProvider>
    </NavigationContainer>
  );
}

function SessionTrackingWrapper() {
  useSessionTracking();
  return null;
}
