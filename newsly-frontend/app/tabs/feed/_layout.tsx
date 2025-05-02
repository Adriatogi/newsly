import { Stack } from "expo-router";
import { Image, TouchableOpacity, View, Text, useColorScheme } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function FeedLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? '#0B1724' : '#fff', // dark mode support
        },
        headerTitleAlign: 'left',
        headerTitle: () => (
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start'}}>
            <Text style={{ fontSize: 30, color: isDark ? '#EDEDED' : '#152B3F', fontWeight: 'bold' }}>
              Newsly
            </Text>
          </View>
        ),
        headerLeft: () => (
          <TouchableOpacity onPress={() => {/* TODO: open menu */}} style={{ marginLeft: 0 }}>
            <Icon name="menu-outline" size={24} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
            <TouchableOpacity onPress={() => {/* TODO: navigate to Search */}}>
              <Icon name="search-outline" size={24} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {/* TODO: open profile */}} style={{ marginLeft: 16 }}>
              <Image
                source={require('../../../assets/images/favicon.png')}
                style={{ width: 30, height: 30, borderRadius: 15 }}
              />
            </TouchableOpacity>
          </View>
        ),
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="ArticleView"
        options={{
          title: "Article Details",
          presentation: "modal",
          headerBackTitle: " ",
          headerStyle: {
            backgroundColor: isDark ? '#FFFFF4' : '#152B3F', // inverse for modal
          },
          headerTintColor: isDark ? '#152B3F' : '#FFFFF4',
          // Remove the feed menu and profile icons for this screen
          headerLeft: undefined,
          headerRight: undefined,
          headerTitle: () => (
            <View style={{ flexDirection: 'row', justifyContent: 'center'}}>
              <Text style={{ fontSize: 23, color: isDark ? '#152B3F' : '#FFFFF4' }}>
                Article details 
              </Text>
            </View>
          ),
        }}
      />
    </Stack>
  );
}
