import { Stack } from "expo-router";
import React, { useState, useRef, createContext, RefObject } from "react";
import {
  View,
  Text,
  useColorScheme,
  TextInput,
  Animated,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

// Create a context for the search query
export const SearchContext = createContext<{
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}>({
  searchQuery: "",
  setSearchQuery: () => {},
});

function CustomHeader({
  isSearchVisible,
  openSearch,
  closeSearch,
  searchBarWidth,
  searchQuery,
  setSearchQuery,
  searchInputRef,
  isDark,
}: {
  isSearchVisible: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  searchBarWidth: Animated.Value;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchInputRef: RefObject<TextInput | null>;
  isDark: boolean;
}) {
  return (
    <SafeAreaView style={{ backgroundColor: isDark ? "#0B1724" : "#fff" }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 8,
          paddingHorizontal: 16,
          backgroundColor: isDark ? "#0B1724" : "#fff",
          borderBottomWidth: 0.5,
          borderBottomColor: isDark ? "#1A2B3F" : "#E5E7EB",
        }}
      >
        {/* Title */}
        {!isSearchVisible && (
          <Text
            style={{
              fontSize: 28,
              color: isDark ? "#EDEDED" : "#152B3F",
              fontFamily: "NewslyHeader-Bold",
              fontWeight: "700",
              letterSpacing: 1,
            }}
          >
            Newsly
          </Text>
        )}
        {/* Search bar or icon */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            minWidth: 32,
            flex: 1,
            justifyContent: "flex-end",
          }}
        >
          {isSearchVisible ? (
            <>
              <Animated.View
                style={{
                  flex: searchBarWidth,
                  backgroundColor: isDark ? "#1A2B3F" : "#F0F0F0",
                  borderRadius: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  overflow: "hidden",
                  marginRight: 8,
                  height: 40,
                  minWidth: 0,
                }}
              >
                <TextInput
                  ref={searchInputRef}
                  style={{
                    height: 36,
                    paddingHorizontal: 10,
                    color: isDark ? "#EDEDED" : "#152B3F",
                    flex: 1,
                    fontSize: 16,
                  }}
                  placeholder="Search articles..."
                  placeholderTextColor={isDark ? "#888" : "#666"}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery("")}
                    style={{ padding: 8}}
                  >
                    <Icon
                      name="close"
                      size={24}
                      color={isDark ? "#EDEDED" : "#152B3F"}
                    />
                  </TouchableOpacity>
                )}
              </Animated.View>
              <TouchableOpacity
                onPress={closeSearch}
                style={{
                  padding: 8,
                  minWidth: 64,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: isDark ? "#EDEDED" : "#152B3F",
                    fontSize: 16,
                    fontWeight: "500",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={openSearch} style={{ padding: 8 }}>
              <Icon
                name="search"
                size={24}
                color={isDark ? "#EDEDED" : "#152B3F"}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function FeedLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchBarWidth = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef<TextInput | null>(null);

  const openSearch = () => {
    setIsSearchVisible(true);
    Animated.timing(searchBarWidth, {
      toValue: 1,
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    });
  };

  const closeSearch = () => {
    Animated.timing(searchBarWidth, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setIsSearchVisible(false);
      setSearchQuery("");
    });
  };

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      <Stack
        screenOptions={{
          header: () => (
            <CustomHeader
              isSearchVisible={isSearchVisible}
              openSearch={openSearch}
              closeSearch={closeSearch}
              searchBarWidth={searchBarWidth}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchInputRef={searchInputRef}
              isDark={isDark}
            />
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
              backgroundColor: isDark ? "#FFFFF4" : "#152B3F",
            },
            headerTintColor: isDark ? "#152B3F" : "#FFFFF4",
            headerLeft: undefined,
            headerRight: undefined,
            headerTitle: () => (
              <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <Text
                  style={{
                    fontSize: 20,
                    color: isDark ? "#152B3F" : "#FFFFF4",
                    fontFamily: "NewslyHeader-Bold",
                    fontWeight: "700",
                    letterSpacing: 0.5,
                  }}
                >
                  Article details
                </Text>
              </View>
            ),
          }}
        />
      </Stack>
    </SearchContext.Provider>
  );
}
