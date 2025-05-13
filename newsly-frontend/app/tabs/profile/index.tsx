import { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Auth from "@/components/Auth";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <>
      {session ? (
        <SafeAreaView>
          <Text>Welcome, {session.user.email}</Text>
        </SafeAreaView>
      ) : (
        <SafeAreaView>
          <Text>Please log in</Text>
        </SafeAreaView>
      )}
    </>
  );
}
