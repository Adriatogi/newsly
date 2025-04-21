import { Slot, router } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
  useEffect(() => {
    router.replace("/tabs/feed");
  }, []);

  return <Slot />;
}