import { Stack } from "expo-router";

export default function urlSearchLayout() {
    return <Stack>
    <Stack.Screen
    name="index"
    options={{
    headerShown: false,
    }}
    />
    </Stack>
}