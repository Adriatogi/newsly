import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function FeedLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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
          title: 'Article Details',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: isDark ? '#FFFFF4' : '#152B3F',
          },
          headerTintColor: isDark ? '#152B3F' : '#FFFFF4',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
    </Stack>
  );
}