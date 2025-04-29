import { Slot, router } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from 'expo-status-bar';


export default function RootLayout() {
  useEffect(() => {
    router.replace("/tabs/feed");
  }, []);

  return (
    <>
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <Slot />
    </>
  );
}