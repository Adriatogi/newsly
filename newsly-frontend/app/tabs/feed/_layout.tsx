import { Stack } from "expo-router";

export default function feedLayout() {
    return (
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ArticleView"
          options={{
            title: "Article Details",
            presentation: "modal", // gives it a nice zoom/fade effect
          }}
        />
      </Stack>
    );
  }