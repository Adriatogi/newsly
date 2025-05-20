import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  useColorScheme,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

if (Platform.OS === "android")
  UIManager.setLayoutAnimationEnabledExperimental?.(true);

export default function ArticleView() {
  const {
    title,
    summary,
    biasScore,
    historicalContext,
    logicalFallacies,
    biasAnalysis,
  } = useLocalSearchParams();
  const bias = Math.max(-1, Math.min(1, parseFloat(biasScore as string) || 0));
  const [sections, setSections] = useState<{ [k: string]: boolean }>({});
  const biasAnalysisMap = new Map<string, string>(
    JSON.parse(biasAnalysis as string)
  );

  const toggleSection = (k: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSections((p) => ({ ...p, [k]: !p[k] }));
  };

  const isDark = useColorScheme() === "dark";
  const s = styles(isDark);
  const ICONS: { [k: string]: React.ReactNode | null } = {
    "Political Bias Analysis": null, // handled separately
    "Historical Context": (
      <View style={s.biasIconWrapper}>
        <Feather name="book-open" size={18} color="#D74D41" />
      </View>
    ),
    "Logical Fallacies": (
      <View style={s.biasIconWrapper}>
        <Feather name="divide" size={18} color="#D74D41" />
      </View>
    ),
  };

  const renderBiasBar = () => (
    <Pressable onPress={() => toggleSection("Political Bias Analysis")}>
      <View
        style={{
          ...s.biasBar,
          flexDirection: "row",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            flex: (1 - bias) / 2,
            backgroundColor: "#3b82f6",
            height: "100%",
          }}
        />
        <View
          style={{
            flex: (1 + bias) / 2,
            backgroundColor: "#ef4444",
            height: "100%",
          }}
        />
        <View style={s.biasOverlay}>
          <View style={s.iconRow}>
            <View style={s.biasIconWrapper}>
              <MaterialCommunityIcons
                name="scale-balance"
                size={18}
                color="#D74D41"
              />
            </View>
            <Text style={s.label}>Political Bias Analysis</Text>
          </View>
          <Text style={s.caret}>
            {sections["Political Bias Analysis"] ? "˄" : "˅"}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  const getSectionContent = (label: string) => {
    switch (label) {
      case "Historical Context":
        return historicalContext as string;
      case "Logical Fallacies":
        return logicalFallacies as string;
      case "Political Bias Analysis":
        return Array.from(biasAnalysisMap.entries())
          .map(([quote, color]) => `"${quote}" (${color})`)
          .join("\n\n");
      default:
        return "";
    }
  };

  return (
    <ScrollView contentContainerStyle={s.container}>
      <View style={s.box}>
        <Text style={s.title}>{title}</Text>
        <Text style={s.sectionLabel}>Summary</Text>
        <Text style={s.summary}>{summary}</Text>

        <View style={s.sections}>
          {Object.keys(ICONS).map((label) => (
            <View key={label} style={s.section}>
              {label === "Political Bias Analysis" ? (
                <>
                  {renderBiasBar()}
                  {sections[label] && (
                    <View style={s.highlights}>
                      {Array.from(biasAnalysisMap.entries()).map(
                        ([quote, color]) => (
                          <Text
                            key={quote}
                            style={color === "blue" ? s.blue : s.red}
                          >
                            {`"${quote}"`}
                          </Text>
                        )
                      )}
                    </View>
                  )}
                </>
              ) : (
                <>
                  <Pressable
                    onPress={() => toggleSection(label)}
                    style={s.button}
                  >
                    <View style={s.row}>
                      <View style={s.iconRow}>
                        {ICONS[label as keyof typeof ICONS]}
                        <Text style={s.label}> {label}</Text>
                      </View>
                      <Text style={s.caret}>{sections[label] ? "˄" : "˅"}</Text>
                    </View>
                  </Pressable>
                  {sections[label] && (
                    <Text style={s.body}>{getSectionContent(label)}</Text>
                  )}
                </>
              )}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = (dark: boolean) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: dark ? "#152B3F" : "#F8F6EF",
      padding: 20,
    },
    box: {
      backgroundColor: dark ? "#0B1724" : "#FDFDF8",
      borderRadius: 16,
      padding: 20,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 2,
      position: "relative",
    },
    title: {
      fontSize: 22,
      fontWeight: "bold",
      color: dark ? "#fff" : "#152B3F",
      marginBottom: 12,
    },
    sectionLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: "#888",
      marginBottom: 4,
    },
    summary: { fontSize: 16, color: dark ? "#EDEDED" : "#152B3F" },
    sections: { marginTop: 24 },
    section: { marginBottom: 12 },
    button: {
      height: 50,
      backgroundColor: dark ? "#2a3b55" : "#eee",
      padding: 12,
      borderRadius: 8,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    iconRow: { flexDirection: "row", alignItems: "center" },
    label: {
      fontSize: 15,
      color: dark ? "#fff" : "#152B3F",
      fontWeight: "500",
    },
    caret: { fontSize: 22, fontWeight: "600", color: dark ? "#fff" : "#000" },
    body: {
      paddingTop: 8,
      color: dark ? "#ddd" : "#444",
      fontSize: 14,
      lineHeight: 20,
    },
    biasBar: {
      height: 50,
      borderRadius: 8,
      flexDirection: "row",
      overflow: "hidden",
      position: "relative",
    },
    biasOverlay: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    biasIconWrapper: {
      backgroundColor: "#fff",
      borderRadius: 16,
      padding: 4,
      marginRight: 8,
    },
    highlights: { gap: 10, marginTop: 10 },
    blue: {
      backgroundColor: "rgba(59,130,246,0.15)",
      padding: 10,
      borderRadius: 6,
      fontSize: 14,
      color: dark ? "#fff" : "#152B3F",
    },
    red: {
      backgroundColor: "rgba(239,68,68,0.15)",
      padding: 10,
      borderRadius: 6,
      fontSize: 14,
      color: dark ? "#fff" : "#152B3F",
    },
  });
