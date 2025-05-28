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
  Linking,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  LogicalFallacy,
  FallacyCategory,
  LogicalFallacies,
} from "../../../lib/articles";

if (Platform.OS === "android")
  UIManager.setLayoutAnimationEnabledExperimental?.(true);

const FALLACY_NAMES: { [key: string]: string } = {
  ad_hominem: "Ad Hominem",
  good_sources: "Good Sources",
  non_sequitur: "Non Sequitur",
  scapegoating: "Scapegoating",
  fear_mongering: "Fear Mongering",
  emotion_fallacy: "Emotion Fallacy",
  false_dichotomy: "False Dichotomy",
  discrediting_sources: "Discrediting Sources",
  presenting_other_side: "Presenting Other Side",
};

export default function ArticleView() {
  const {
    title,
    summary,
    biasScore,
    contextualization,
    bias_explanation,
    logical_fallacies,
    authors,
    published_date,
    source_url,
  } = useLocalSearchParams();

  const parsedLogicalFallacies = logical_fallacies
    ? (JSON.parse(logical_fallacies as string) as LogicalFallacies)
    : null;
  const [expandedFallacies, setExpandedFallacies] = useState<{
    [key: string]: boolean;
  }>({});
  const [sections, setSections] = useState<{ [k: string]: boolean }>({});
  const biasAnalysisMap = new Map<string, string>();

  const isDark = useColorScheme() === "dark";
  const s = styles(isDark);

  const toggleFallacy = (fallacyType: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedFallacies((prev) => ({
      ...prev,
      [fallacyType]: !prev[fallacyType],
    }));
  };

  const toggleSection = (k: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSections((p) => ({ ...p, [k]: !p[k] }));
  };

  const renderBiasBar = () => {
    let biasColor = "#6b7280"; // Default gray for center
    if (biasScore === "left") {
      biasColor = "#3b82f6"; // Blue for left
    } else if (biasScore === "right") {
      biasColor = "#ef4444"; // Red for right
    }

    return (
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
              flex: 1,
              backgroundColor: biasColor,
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
  };

  const renderFallacySection = (
    fallacyType: string,
    category: FallacyCategory
  ) => {
    if (!category.logical_fallacies.length) return null;

    const isExpanded = expandedFallacies[fallacyType];
    const displayName = FALLACY_NAMES[fallacyType] || fallacyType;

    return (
      <View key={fallacyType} style={s.fallacySection}>
        <Pressable
          style={s.fallacyHeader}
          onPress={() => toggleFallacy(fallacyType)}
        >
          <View style={s.fallacyHeaderContent}>
            <View style={s.fallacyIconWrapper}>
              {fallacyType === "good_sources" ? (
                <Feather name="check-circle" size={18} color="#22C55E" />
              ) : (
                <Feather name="alert-circle" size={18} color="#D74D41" />
              )}
            </View>
            <Text style={s.fallacyTitle}>{displayName}</Text>
          </View>
          <Text style={s.caret}>{isExpanded ? "˄" : "˅"}</Text>
        </Pressable>

        {isExpanded && (
          <View style={s.fallacyContent}>
            {category.logical_fallacies.map((fallacy, index) => (
              <View key={index} style={s.fallacyItem}>
                <View style={s.quoteContainer}>
                  <Text style={s.quoteLabel}>Quote:</Text>
                  <Text style={s.quoteText}>{fallacy.quote}</Text>
                </View>

                <View style={s.ratingContainer}>
                  <Text style={s.ratingLabel}>Confidence Rating:</Text>
                  <View style={s.ratingStars}>
                    {[...Array(5)].map((_, i) => (
                      <MaterialCommunityIcons
                        key={i}
                        name={i < fallacy.rating ? "star" : "star-outline"}
                        size={16}
                        color="#D74D41"
                      />
                    ))}
                  </View>
                </View>

                <View style={s.reasonContainer}>
                  <Text style={s.reasonLabel}>Reason:</Text>
                  <Text style={s.reasonText}>{fallacy.reason}</Text>
                </View>

                <View style={s.explanationContainer}>
                  <Text style={s.explanationLabel}>Explanation:</Text>
                  <Text style={s.explanationText}>{fallacy.explanation}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const handleSourcePress = async () => {
    if (source_url) {
      try {
        await Linking.openURL(source_url as string);
      } catch (err) {
        console.error("Error opening URL:", err);
      }
    }
  };

  const hasAnyFallacies =
    parsedLogicalFallacies &&
    Object.values(parsedLogicalFallacies).some(
      (category) =>
        category.logical_fallacies && category.logical_fallacies.length > 0
    );

  return (
    <ScrollView contentContainerStyle={s.container}>
      <View style={s.box}>
        <Text style={s.title}>{title}</Text>

        {/* Source URL Section */}
        <Pressable
          style={({ pressed }) => [
            s.sourceContainer,
            pressed && s.sourceContainerPressed,
          ]}
          onPress={handleSourcePress}
        >
          <View style={s.sourceContent}>
            <View style={s.sourceIconContainer}>
              <Feather
                name="external-link"
                size={18}
                color={isDark ? "#EDEDED" : "#152B3F"}
              />
            </View>
            <Text style={s.sourceText} numberOfLines={1}>
              Read Article
            </Text>
          </View>
          <View style={s.sourceChevronContainer}>
            <Feather
              name="chevron-right"
              size={18}
              color={isDark ? "#EDEDED" : "#152B3F"}
            />
          </View>
        </Pressable>

        <Text style={s.sectionLabel}>Summary</Text>
        <Text style={s.summary}>{summary}</Text>

        <View style={s.sections}>
          {/* Political Bias Analysis */}
          <View style={s.section}>
            {renderBiasBar()}
            {sections["Political Bias Analysis"] && (
              <View style={s.highlights}>
                {bias_explanation && (
                  <Text style={s.body}>{bias_explanation as string}</Text>
                )}
                {Array.from(biasAnalysisMap.entries()).map(([quote, color]) => (
                  <Text key={quote} style={color === "blue" ? s.blue : s.red}>
                    {`"${quote}"`}
                  </Text>
                ))}
              </View>
            )}
          </View>

          {/* Historical Context */}
          <View style={s.section}>
            <Pressable
              onPress={() => toggleSection("Historical Context")}
              style={s.button}
            >
              <View style={s.row}>
                <View style={s.iconRow}>
                  <View style={s.biasIconWrapper}>
                    <Feather name="book-open" size={18} color="#D74D41" />
                  </View>
                  <Text style={s.label}>Historical Context</Text>
                </View>
                <Text style={s.caret}>
                  {sections["Historical Context"] ? "˄" : "˅"}
                </Text>
              </View>
            </Pressable>
            {sections["Historical Context"] && (
              <Text style={s.body}>{contextualization as string}</Text>
            )}
          </View>

          {/* Logical Fallacies */}
          {parsedLogicalFallacies && (
            <View style={s.fallaciesContainer}>
              <Text style={s.sectionLabel}>Logical Fallacies Analysis</Text>
              {hasAnyFallacies ? (
                <>
                  {/* Render Good Sources first if it exists */}
                  {parsedLogicalFallacies.good_sources &&
                    renderFallacySection(
                      "good_sources",
                      parsedLogicalFallacies.good_sources
                    )}
                  {/* Render other fallacies */}
                  {Object.entries(parsedLogicalFallacies)
                    .filter(([type]) => type !== "good_sources")
                    .map(([type, category]) =>
                      renderFallacySection(type, category)
                    )}
                </>
              ) : (
                <View style={s.noFallaciesContainer}>
                  <Feather
                    name="info"
                    size={32}
                    color={isDark ? "#EDEDED" : "#152B3F"}
                    style={{ marginBottom: 8 }}
                  />
                  <Text style={s.noFallaciesText}>
                    No substantial analysis to show for this article.
                  </Text>
                </View>
              )}
            </View>
          )}
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
      padding: 10,
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
    summary: {
      fontSize: 16,
      color: dark ? "#EDEDED" : "#152B3F",
      marginBottom: 24,
    },
    sections: {
      marginTop: 24,
    },
    section: {
      marginBottom: 12,
    },
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
    iconRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    label: {
      fontSize: 15,
      color: dark ? "#fff" : "#152B3F",
      fontWeight: "500",
    },
    caret: {
      fontSize: 22,
      fontWeight: "600",
      color: dark ? "#fff" : "#000",
    },
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
      backgroundColor: dark ? "#152B3F" : "#FFFFFF",
      borderRadius: 16,
      padding: 4,
      marginRight: 8,
    },
    highlights: {
      gap: 10,
      marginTop: 10,
    },
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
    fallaciesContainer: {
      marginTop: 16,
    },
    fallacySection: {
      marginBottom: 12,
      backgroundColor: dark ? "#1A2B3F" : "#FFFFFF",
      borderRadius: 12,
      overflow: "hidden",
    },
    fallacyHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      backgroundColor: dark ? "#2A3B55" : "#F5F5F5",
    },
    fallacyHeaderContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    fallacyIconWrapper: {
      backgroundColor: dark ? "#152B3F" : "#FFFFFF",
      borderRadius: 16,
      padding: 4,
      marginRight: 8,
    },
    fallacyTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: dark ? "#FFFFFF" : "#152B3F",
    },
    fallacyContent: {
      padding: 16,
    },
    fallacyItem: {
      marginBottom: 16,
      padding: 12,
      backgroundColor: dark ? "#152B3F" : "#F8F8F8",
      borderRadius: 8,
    },
    quoteContainer: {
      marginBottom: 12,
    },
    quoteLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: "#888",
      marginBottom: 4,
    },
    quoteText: {
      fontSize: 15,
      color: dark ? "#EDEDED" : "#152B3F",
      fontStyle: "italic",
    },
    ratingContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    ratingLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: "#888",
      marginRight: 8,
    },
    ratingStars: {
      flexDirection: "row",
    },
    reasonContainer: {
      marginBottom: 12,
    },
    reasonLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: "#888",
      marginBottom: 4,
    },
    reasonText: {
      fontSize: 14,
      color: dark ? "#EDEDED" : "#152B3F",
    },
    explanationContainer: {
      marginBottom: 8,
    },
    explanationLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: "#888",
      marginBottom: 4,
    },
    explanationText: {
      fontSize: 14,
      color: dark ? "#EDEDED" : "#152B3F",
    },
    sourceContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: dark ? "#1A2B3F" : "#F5F5F5",
      padding: 10,
      borderRadius: 8,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
    },
    sourceContainerPressed: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }],
    },
    sourceContent: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      marginRight: 8,
    },
    sourceIconContainer: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
    },
    sourceText: {
      fontSize: 14,
      fontWeight: "500",
      color: dark ? "#EDEDED" : "#152B3F",
      flex: 1,
    },
    sourceChevronContainer: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
      alignItems: "center",
      justifyContent: "center",
    },
    noFallaciesContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 32,
    },
    noFallaciesText: {
      fontSize: 16,
      color: dark ? "#EDEDED" : "#152B3F",
      textAlign: "center",
      marginTop: 4,
    },
  });
