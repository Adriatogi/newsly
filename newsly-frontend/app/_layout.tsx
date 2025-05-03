import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Slot, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const router = useRouter();

  // Delay redirection slightly to let navigation initialize
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/tabs/feed');
    }, 100); // 100ms delay helps prevent navigation context errors

    return () => clearTimeout(timeout);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <Slot />
    </GestureHandlerRootView>
  );
}