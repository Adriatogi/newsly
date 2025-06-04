import React, { useState } from "react";
import { useColorScheme } from "react-native";
import {
  Alert,
  StyleSheet,
  View,
  AppState,
  Animated,
} from "react-native";
import { supabase } from "../lib/supabase";
import { Button, Input, Text } from "@rneui/themed";
import { usePostHog } from "posthog-react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface AuthProps {
  onAuthSuccess?: () => void;
}

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
export default function Auth({ onAuthSuccess }: AuthProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const isDark = useColorScheme() === "dark";
  const posthog = usePostHog();
  const fadeAnim = new Animated.Value(0);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  async function signInWithEmail() {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) Alert.alert(error.message);
    if (data?.user?.id) {
      posthog.identify(data.user.id);
    }
    setLoading(false);
    if (!error && onAuthSuccess) onAuthSuccess();
  }
  async function signUpWithEmail() {
    setLoading(true);

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: email.split("@")[0],
          full_name: email.split("@")[0],
          avatar_url: null,
        },
      },
    });

    if (error) {
      Alert.alert(error.message);
      setLoading(false);
      return;
    }

    if (data?.user?.id) {
      posthog.identify(data.user.id);
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        username: email.split("@")[0],
        full_name: email.split("@")[0],
        avatar_url: null,
      });

      if (profileError) {
        Alert.alert("Profile creation failed", profileError.message);
        setLoading(false);
        return;
      }

      Alert.alert("Please check your inbox for email verification!");
      setLoading(false);
      if (onAuthSuccess) onAuthSuccess();
      return;
    }

    setLoading(false);
  }

  const inputStyle = (isFocused: boolean) => ({
    backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: isFocused
      ? isDark
        ? "#2A4B6F"
        : "#152B3F"
      : isDark
      ? "rgba(255,255,255,0.1)"
      : "rgba(0,0,0,0.1)",
    color: isDark ? "#fff" : "#000",
    fontSize: 16,
    marginTop: 8,
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="newspaper-variant"
            size={48}
            color={isDark ? "#2A4B6F" : "#152B3F"}
          />
          <Text h3 style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
            Welcome
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? "#aaa" : "#666" }]}>
            Sign in to continue
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
              Email
            </Text>
            <Input
              leftIcon={
                <MaterialCommunityIcons
                  name="email-outline"
                  size={24}
                  color={
                    focusedInput === "email"
                      ? isDark
                        ? "#2A4B6F"
                        : "#152B3F"
                      : isDark
                      ? "#ccc"
                      : "#666"
                  }
                />
              }
              onChangeText={(text) => setEmail(text)}
              value={email}
              placeholder="email@address.com"
              autoCapitalize="none"
              onFocus={() => setFocusedInput("email")}
              onBlur={() => setFocusedInput(null)}
              inputStyle={inputStyle(focusedInput === "email")}
              containerStyle={styles.inputWrapper}
              placeholderTextColor={isDark ? "#666" : "#999"}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
              Password
            </Text>
            <Input
              leftIcon={
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={24}
                  color={
                    focusedInput === "password"
                      ? isDark
                        ? "#2A4B6F"
                        : "#152B3F"
                      : isDark
                      ? "#ccc"
                      : "#666"
                  }
                />
              }
              onChangeText={(text) => setPassword(text)}
              value={password}
              secureTextEntry={true}
              placeholder="Password"
              autoCapitalize="none"
              onFocus={() => setFocusedInput("password")}
              onBlur={() => setFocusedInput(null)}
              inputStyle={inputStyle(focusedInput === "password")}
              containerStyle={styles.inputWrapper}
              placeholderTextColor={isDark ? "#666" : "#999"}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Sign in"
              disabled={loading}
              onPress={() => signInWithEmail()}
              buttonStyle={[
                styles.signInButton,
                { backgroundColor: isDark ? "#2A4B6F" : "#152B3F" },
              ]}
              titleStyle={styles.buttonText}
              loading={loading}
            />
            <Button
              title="Create account"
              disabled={loading}
              onPress={() => signUpWithEmail()}
              buttonStyle={[
                styles.signUpButton,
                { borderColor: isDark ? "#2A4B6F" : "#152B3F" },
              ]}
              titleStyle={[
                styles.buttonText,
                { color: isDark ? "#2A4B6F" : "#152B3F" },
              ]}
              type="outline"
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 400,
    alignSelf: "center",
    width: "100%",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    marginTop: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    paddingHorizontal: 0,
  },
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
  signInButton: {
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 0,
  },
  signUpButton: {
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 0,
    borderWidth: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
