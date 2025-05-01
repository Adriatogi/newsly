import { Stack } from "expo-router";
import { Image, TouchableOpacity, View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function feedLayout() {
    return (
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTitleAlign: 'left',
          headerTitle: () => (
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start'}}>
              <Text style={{ fontSize: 30, color: '#152B3F', fontWeight: 'bold' }}>
                Newsly
              </Text>
            </View>
          ),
          headerLeft: () => (
            <TouchableOpacity onPress={() => {/* TODO: open menu */}} style={{ marginLeft: 0 }}>
              <Icon name="menu-outline" size={24} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
              <TouchableOpacity onPress={() => {/* TODO: navigate to Search */}}>
                <Icon name="search-outline" size={24} />
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
            headerStyle: { backgroundColor: '#fff' },
            headerTitleAlign: 'center',
            // Remove the feed menu and profile icons for this screen
            headerLeft: undefined,
            headerRight: undefined,
            headerTitle: () => (
              <View style={{ flexDirection: 'row', justifyContent: 'center'}}>
                <Text style={{ fontSize: 23, color: '#152B3F' }}>
                  Article details 
                </Text>
              </View>
            ),
          }}
        />
      </Stack>
    );
  }