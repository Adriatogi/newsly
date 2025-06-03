import { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  useColorScheme,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
  Easing,
  Linking,
  ViewStyle,
  TextStyle,
} from "react-native";
import {
  Feather,
  MaterialCommunityIcons,
  FontAwesome,
} from "@expo/vector-icons";
import { useAnalytics } from '../../../lib/analytics';

if (Platform.OS === "android")
  UIManager.setLayoutAnimationEnabledExperimental?.(true);

const getBiasPos = (bias: string) => {
  switch (bias.toLowerCase()) {
    case "left":
      return "10%";
    case "right":
      return "90%";
    case "center":
      return "50%";
    default:
      return "50%";
  }
};

const formatDate = (isoString: string) =>
  new Date(isoString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

interface AnalysisData {
  source: string;
  title: string;
  authors: string[];
  pubDate: string;
  lean: string;
  lean_explanation: string;
  logical_fallacies: {
    [key: string]: {
      error: string | null;
      logical_fallacies: Array<{
        quote: string;
        rating: number;
        reason: string;
        explanation: string;
      }>;
    };
  };
  contextualization: string;
  summary: string;
  source_url: string;
}

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

interface DynamicStyles {
  fallacySection: ViewStyle;
  fallacyHeader: ViewStyle;
  fallacyHeaderContent: ViewStyle;
  fallacyIconWrapper: ViewStyle;
  fallacyTitle: TextStyle;
  fallacyContent: ViewStyle;
  fallacyItem: ViewStyle;
  quoteContainer: ViewStyle;
  quoteLabel: TextStyle;
  quoteText: TextStyle;
  ratingContainer: ViewStyle;
  ratingLabel: TextStyle;
  ratingStars: ViewStyle;
  reasonContainer: ViewStyle;
  reasonLabel: TextStyle;
  reasonText: TextStyle;
  explanationContainer: ViewStyle;
  explanationLabel: TextStyle;
  explanationText: TextStyle;
  sourceContainer: ViewStyle;
  sourceContainerPressed: ViewStyle;
  sourceContent: ViewStyle;
  sourceIconContainer: ViewStyle;
  sourceText: TextStyle;
  sourceChevronContainer: ViewStyle;
  fallaciesContainer: ViewStyle;
  featureCard: ViewStyle;
  featureIconCircle: ViewStyle;
  featureCardTitle: TextStyle;
  featureCardSubtitle: TextStyle;
  featuresGrid: ViewStyle;
  loadingOverlay: ViewStyle;
  splashContainer: ViewStyle;
  splashTitle: TextStyle;
  splashSubtitle: TextStyle;
}

export default function App() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [sections, setSections] = useState<{ [k: string]: boolean }>({});

  const [url, setUrl] = useState("");
  const [analysisData, setAnalysisData] = useState<AnalysisData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
        
  const { trackArticleRead } = useAnalytics();
  // Animated rotation for magnifying glass
  const rotateAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let looping: Animated.CompositeAnimation | null = null;
    if (loading) {
      rotateAnim.setValue(0);
      looping = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.linear,
        })
      );
      looping.start();
    } else {
      rotateAnim.stopAnimation();
      rotateAnim.setValue(0);
    }
    return () => {
      if (looping) looping.stop();
    };
  }, [loading]);
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });


  const toggleSection = (k: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSections((p) => ({ ...p, [k]: !p[k] }));
  };

  useEffect(() => {
    if (loading) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  const [expandedFallacies, setExpandedFallacies] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleFallacy = (fallacyType: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedFallacies((prev) => ({
      ...prev,
      [fallacyType]: !prev[fallacyType],
    }));
  };

  const getStyles = (isDark: boolean): DynamicStyles => ({
    fallacySection: {
      marginBottom: 12,
      backgroundColor: isDark ? "#1A2B3F" : "#FFFFFF",
      borderRadius: 12,
      overflow: "hidden" as const,
    },
    fallacyHeader: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "center" as const,
      padding: 16,
      backgroundColor: isDark ? "#2A3B55" : "#F5F5F5",
    },
    fallacyHeaderContent: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
    },
    fallacyIconWrapper: {
      backgroundColor: isDark ? "#152B3F" : "#FFFFFF",
      borderRadius: 16,
      padding: 4,
      marginRight: 8,
    },
    fallacyTitle: {
      fontSize: 16,
      fontWeight: "600" as const,
      color: isDark ? "#FFFFFF" : "#152B3F",
    },
    fallacyContent: {
      padding: 16,
    },
    fallacyItem: {
      marginBottom: 16,
      padding: 12,
      backgroundColor: isDark ? "#152B3F" : "#F8F8F8",
      borderRadius: 8,
    },
    quoteContainer: {
      marginBottom: 12,
    },
    quoteLabel: {
      fontSize: 14,
      fontWeight: "600" as const,
      color: "#888",
      marginBottom: 4,
    },
    quoteText: {
      fontSize: 15,
      color: isDark ? "#EDEDED" : "#152B3F",
      fontStyle: "italic" as const,
    },
    ratingContainer: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      marginBottom: 12,
    },
    ratingLabel: {
      fontSize: 14,
      fontWeight: "600" as const,
      color: "#888",
      marginRight: 8,
    },
    ratingStars: {
      flexDirection: "row" as const,
    },
    reasonContainer: {
      marginBottom: 12,
    },
    reasonLabel: {
      fontSize: 14,
      fontWeight: "600" as const,
      color: "#888",
      marginBottom: 4,
    },
    reasonText: {
      fontSize: 14,
      color: isDark ? "#EDEDED" : "#152B3F",
    },
    explanationContainer: {
      marginBottom: 8,
    },
    explanationLabel: {
      fontSize: 14,
      fontWeight: "600" as const,
      color: "#888",
      marginBottom: 4,
    },
    explanationText: {
      fontSize: 14,
      color: isDark ? "#EDEDED" : "#152B3F",
    },
    sourceContainer: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "space-between" as const,
      backgroundColor: isDark ? "#1A2B3F" : "#F5F5F5",
      padding: 10,
      borderRadius: 8,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
    },
    sourceContainerPressed: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }],
    },
    sourceContent: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      flex: 1,
      marginRight: 8,
    },
    sourceIconContainer: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
      alignItems: "center" as const,
      justifyContent: "center" as const,
      marginRight: 8,
    },
    sourceText: {
      fontSize: 14,
      fontWeight: "500" as const,
      color: isDark ? "#EDEDED" : "#152B3F",
      flex: 1,
    },
    sourceChevronContainer: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },
    fallaciesContainer: {
      marginTop: 16,
    },
    featureCard: {
      flex: 1,
      minWidth: 150,
      maxWidth: "48%",
      margin: "1%",
      borderRadius: 18,
      paddingVertical: 24,
      paddingHorizontal: 12,
      alignItems: "center",
      backgroundColor: isDark ? "#1A2533" : "#FFFFFF",
      shadowColor: isDark ? "#000" : "#ccc",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: isDark ? 0.3 : 0.2,
      shadowRadius: 10,
      elevation: 8,
    },
    featureIconCircle: {
      width: 54,
      height: 54,
      borderRadius: 27,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    featureCardTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 6,
      textAlign: "center",
      color: isDark ? "#FFFFFF" : "#152B3F",
    },
    featureCardSubtitle: {
      fontSize: 13,
      textAlign: "center",
      fontWeight: "400",
      color: isDark ? "#B0B8C1" : "#666666",
    },
    featuresGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      width: "100%",
      marginTop: 10,
      marginBottom: 10,
      paddingHorizontal: 2,
    },
    loadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isDark
        ? "rgba(21, 43, 63, 0.94)"
        : "rgba(255, 255, 255, 0.94)",
      zIndex: 1000,
    },
    splashContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      height: "100%",
    },
    splashTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: isDark ? "#FFFFFF" : "#152B3F",
      marginBottom: 8,
      textAlign: "center",
    },
    splashSubtitle: {
      fontSize: 15,
      color: isDark ? "#B0B8C1" : "#4B5563",
      textAlign: "center",
      marginBottom: 4,
    },
  });

  const FeatureCard = ({
    icon,
    iconBg,
    iconColor,
    title,
    subtitle,
    isDark,
  }: {
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    title: string;
    subtitle: string;
    isDark: boolean;
  }) => {
    const dynamicStyles = getStyles(isDark);
    return (
      <View style={dynamicStyles.featureCard}>
        <View
          style={[dynamicStyles.featureIconCircle, { backgroundColor: iconBg }]}
        >
          {icon}
        </View>
        <Text style={dynamicStyles.featureCardTitle}>{title}</Text>
        <Text style={dynamicStyles.featureCardSubtitle}>{subtitle}</Text>
      </View>
    );
  };

  const renderFallacySection = (
    fallacyType: string,
    category: {
      error: string | null;
      logical_fallacies: Array<{
        quote: string;
        rating: number;
        reason: string;
        explanation: string;
      }>;
    }
  ) => {
    // Filter fallacies to only include those with rating 4 or 5
    const highConfidenceFallacies = category.logical_fallacies.filter(
      (fallacy) => fallacy.rating >= 4
    );

    // Only render the section if there are high confidence fallacies
    if (!highConfidenceFallacies.length) return null;

    const isExpanded = expandedFallacies[fallacyType];
    const displayName = FALLACY_NAMES[fallacyType] || fallacyType;
    const dynamicStyles = getStyles(isDark);

    return (
      <View key={fallacyType} style={dynamicStyles.fallacySection}>
        <Pressable
          style={dynamicStyles.fallacyHeader}
          onPress={() => toggleFallacy(fallacyType)}
        >
          <View style={dynamicStyles.fallacyHeaderContent}>
            <View style={dynamicStyles.fallacyIconWrapper}>
              {fallacyType === "good_sources" ? (
                <Feather name="check-circle" size={18} color="#22C55E" />
              ) : (
                <Feather name="alert-circle" size={18} color="#D74D41" />
              )}
            </View>
            <Text style={dynamicStyles.fallacyTitle}>{displayName}</Text>
          </View>
          <Text style={styles.caret}>{isExpanded ? "˄" : "˅"}</Text>
        </Pressable>

        {isExpanded && (
          <View style={dynamicStyles.fallacyContent}>
            {highConfidenceFallacies.map((fallacy, index) => (
              <View key={index} style={dynamicStyles.fallacyItem}>
                <View style={dynamicStyles.quoteContainer}>
                  <Text style={dynamicStyles.quoteLabel}>Quote:</Text>
                  <Text style={dynamicStyles.quoteText}>{fallacy.quote}</Text>
                </View>

                <View style={dynamicStyles.ratingContainer}>
                  <Text style={dynamicStyles.ratingLabel}>
                    Confidence Rating:
                  </Text>
                  <View style={dynamicStyles.ratingStars}>
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

                <View style={dynamicStyles.reasonContainer}>
                  <Text style={dynamicStyles.reasonLabel}>Reason:</Text>
                  <Text style={dynamicStyles.reasonText}>{fallacy.reason}</Text>
                </View>

                <View style={dynamicStyles.explanationContainer}>
                  <Text style={dynamicStyles.explanationLabel}>
                    Explanation:
                  </Text>
                  <Text style={dynamicStyles.explanationText}>
                    {fallacy.explanation}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const handleSourcePress = async () => {
    if (analysisData?.[0]?.source_url) {
      try {
        await Linking.openURL(analysisData[0].source_url);
      } catch (err) {
        console.error("Error opening URL:", err);
      }
    }
  };
    
      useEffect(() => {
    if (analysisData && analysisData.length > 0) {
      analysisData.forEach((item) => {
        console.log('[PostHog] Sending article_read event (url_query)', item.title);
        trackArticleRead(item.title, 'url_query');
      });
    }
  }, [analysisData]);

  const handleAnalyzeArticle = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "https://78r8cpg45j.us-east-2.awsapprunner.com/articles/analyze",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(
          `Server error (${response.status}): ${errorText || "Unknown error"}`
        );
      }
      const result = await response.json();
      const parsed: AnalysisData[] = [
        {
          source: result.source || "Unknown Source",
          title: result.title || "Unknown Title",
          authors: result.authors || ["Unknown Author"],
          pubDate: result.published_date || "Unknown Date",
          lean: result.lean || "center",
          lean_explanation: result.lean_explanation || "",
          logical_fallacies: result.logical_fallacies || {},
          contextualization: result.contextualization || "",
          summary: result.summary || "",
          source_url: result.source_url || "",
        },
      ];
      setAnalysisData(parsed);
    } catch (error) {
      console.error("Error fetching from root endpoint:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        setError(error.message);
      }
      setAnalysisData(null);
    } finally {
      setLoading(false);
    }
  };

  const renderBiasBar = (lean: string) => {
    let biasColor = "#6b7280"; // Default gray for center
    if (lean === "left") {
      biasColor = "#3b82f6"; // Blue for left
    } else if (lean === "right") {
      biasColor = "#ef4444"; // Red for right
    }

    return (
      <Pressable onPress={() => toggleSection("Political Bias Analysis")}>
        <View
          style={{
            ...styles.biasBar,
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
          <View style={styles.biasOverlay}>
            <View style={styles.iconRow}>
              <View style={styles.biasIconWrapper}>
                <MaterialCommunityIcons
                  name="scale-balance"
                  size={18}
                  color="#D74D41"
                />
              </View>
              <Text style={styles.label}>Political Bias Analysis</Text>
            </View>
            <Text style={styles.caret}>
              {sections["Political Bias Analysis"] ? "˄" : "˅"}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? "#152B3F" : "#FFFFFF" },
      ]}
    >
      <Animated.View
        style={[
          getStyles(isDark).loadingOverlay,
          { opacity: fadeAnim, zIndex: loading ? 1000 : -1 },
        ]}
      >
        <View style={getStyles(isDark).splashContainer}>
          <Animated.View
            style={{
              marginBottom: 24,
              transform: [{ rotate: spin }],
            }}
          >
            <Feather name="search" size={54} color="#3B5FFF" />
          </Animated.View>
          <Text style={getStyles(isDark).splashTitle}>
            Analyzing Article...
          </Text>
          <Text style={getStyles(isDark).splashSubtitle}>
            Please wait while we break down your article.
          </Text>
        </View>
      </Animated.View>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.subheadingBold,
            { color: isDark ? "#FFFFF4" : "#152B3F" },
          ]}
        >
          Let's Break Down Your Article
        </Text>
        <Text
          style={[
            styles.subheading,
            { color: isDark ? "#B0B8C1" : "#4B5563", marginBottom: 18 },
          ]}
        >
          Paste a news article URL below to begin analyzing
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? "#2a3b55" : "#FBFBFC",
              color: isDark ? "#EDEDED" : "#152B3F",
              borderColor: isDark ? "#3a4b65" : "#ccc",
            },
          ]}
          placeholder="https://example.com/news-article"
          value={url}
          placeholderTextColor={isDark ? "#888" : "#a9a9a9"}
          onChangeText={setUrl}
          autoCapitalize="none"
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleAnalyzeArticle}
            disabled={!url || loading}
            style={[
              styles.analyzeButton,
              {
                backgroundColor: isDark ? "#FFFFF4" : "#152B3F",
                opacity: !url || loading ? 0.5 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.analyzeButtonText,
                { color: isDark ? "#152B3F" : "#FFFFF4" },
              ]}
            >
              Analyze Article
            </Text>
          </TouchableOpacity>
        </View>
        {!analysisData && !error && (
          <View style={getStyles(isDark).featuresGrid}>
            <FeatureCard
              icon={<Feather name="smile" size={32} color="#3B5FFF" />}
              iconBg={isDark ? "#223366" : "#E8EDFF"}
              iconColor="#3B5FFF"
              title="Sentiment"
              subtitle="How positive or negative is the tone?"
              isDark={isDark}
            />
            <FeatureCard
              icon={
                <MaterialCommunityIcons
                  name="scale-balance"
                  size={32}
                  color="#A259E6"
                />
              }
              iconBg={isDark ? "#2D2346" : "#F3E8FF"}
              iconColor="#A259E6"
              title="Bias Check"
              subtitle="Detect political or ideological lean."
              isDark={isDark}
            />
            <FeatureCard
              icon={
                <MaterialCommunityIcons
                  name="shield-check"
                  size={32}
                  color="#22B573"
                />
              }
              iconBg={isDark ? "#1B3A2B" : "#E6F7EF"}
              iconColor="#22B573"
              title="Credibility"
              subtitle="Evaluate source trustworthiness."
              isDark={isDark}
            />
            <FeatureCard
              icon={<Feather name="divide" size={30} color="#D74D41" />}
              iconBg={isDark ? "#3A2323" : "#FFEAEA"}
              iconColor="#D74D41"
              title="Logical Fallacies"
              subtitle="Spot logical errors in your article."
              isDark={isDark}
            />
          </View>
        )}
        {error && (
          <View
            style={[
              styles.errorContainer,
              {
                backgroundColor: isDark ? "#2a2323" : "#FFF6F6",
                borderColor: isDark ? "#D74D41" : "#FFD6D6",
                shadowColor: isDark ? "#000" : "#D74D41",
              },
            ]}
          >
            <View style={styles.errorIconCircle}>
              <Feather name="alert-circle" size={32} color="#D74D41" />
            </View>
            <Text
              style={[
                styles.errorText,
                { color: isDark ? "#FFD6D6" : "#D74D41", textAlign: "center" },
              ]}
            >
              Oops! Something went wrong
            </Text>
            <Text
              style={[
                styles.errorMessage,
                { color: isDark ? "#FFD6D6" : "#D74D41", textAlign: "center" },
              ]}
            >
              {error}
            </Text>
            <Text
              style={[
                styles.errorSubtext,
                { color: isDark ? "#ffbdbd" : "#b71c1c", textAlign: "center" },
              ]}
            >
              Please try again with a different URL or check if the article is
              accessible.
            </Text>
          </View>
        )}

        {analysisData && (
          <View style={styles.dashboard}>
            {analysisData.map((item, index) => {
              const dynamicStyles = getStyles(isDark);
              return (
                <View
                  key={index}
                  style={[
                    styles.box,
                    {
                      backgroundColor: isDark ? "#0B1724" : "#FFFFFF",
                      shadowColor: isDark ? "#000" : "#ccc",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.title,
                      { color: isDark ? "#fff" : "#152B3F" },
                    ]}
                  >
                    {item.title}
                  </Text>

                  {/* Source URL Section */}
                  <Pressable
                    style={({ pressed }) => [
                      dynamicStyles.sourceContainer,
                      pressed && dynamicStyles.sourceContainerPressed,
                    ]}
                    onPress={handleSourcePress}
                  >
                    <View style={dynamicStyles.sourceContent}>
                      <View style={dynamicStyles.sourceIconContainer}>
                        <Feather
                          name="external-link"
                          size={18}
                          color={isDark ? "#EDEDED" : "#152B3F"}
                        />
                      </View>
                      <Text style={dynamicStyles.sourceText} numberOfLines={1}>
                        Read Article
                      </Text>
                    </View>
                    <View style={dynamicStyles.sourceChevronContainer}>
                      <Feather
                        name="chevron-right"
                        size={18}
                        color={isDark ? "#EDEDED" : "#152B3F"}
                      />
                    </View>
                  </Pressable>

                  <Text style={styles.sectionLabel}>Summary</Text>
                  <Text
                    style={[
                      styles.summary,
                      { color: isDark ? "#EDEDED" : "#152B3F" },
                    ]}
                  >
                    {item.summary}
                  </Text>

                  <View style={styles.sections}>
                    {/* Political Bias Analysis */}
                    <View style={styles.section}>
                      {renderBiasBar(item.lean)}
                      {sections["Political Bias Analysis"] && (
                        <View style={styles.highlights}>
                          {item.lean_explanation && (
                            <Text
                              style={[
                                styles.body,
                                { color: isDark ? "#ddd" : "#444" },
                              ]}
                            >
                              {item.lean_explanation}
                            </Text>
                          )}
                        </View>
                      )}
                    </View>

                    {/* Historical Context */}
                    <View style={styles.section}>
                      <Pressable
                        onPress={() => toggleSection("Historical Context")}
                        style={[
                          styles.button,
                          { backgroundColor: isDark ? "#2a3b55" : "#eee" },
                        ]}
                      >
                        <View style={styles.row}>
                          <View style={styles.iconRow}>
                            <View style={styles.biasIconWrapper}>
                              <Feather
                                name="book-open"
                                size={18}
                                color="#D74D41"
                              />
                            </View>
                            <Text
                              style={[
                                styles.label,
                                { color: isDark ? "#fff" : "#152B3F" },
                              ]}
                            >
                              Historical Context
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.caret,
                              { color: isDark ? "#fff" : "#000" },
                            ]}
                          >
                            {sections["Historical Context"] ? "˄" : "˅"}
                          </Text>
                        </View>
                      </Pressable>
                      {sections["Historical Context"] && (
                        <Text
                          style={[
                            styles.body,
                            { color: isDark ? "#ddd" : "#444" },
                          ]}
                        >
                          {item.contextualization}
                        </Text>
                      )}
                    </View>

                    {/* Logical Fallacies */}
                    {item.logical_fallacies && (
                      <View style={dynamicStyles.fallaciesContainer}>
                        <Text style={styles.sectionLabel}>
                          Logical Fallacies Analysis
                        </Text>
                        {Object.entries(item.logical_fallacies).map(
                          ([type, category]) =>
                            renderFallacySection(type, category)
                        )}
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingVertical: 18,
    paddingHorizontal: 30,
    flexGrow: 1,
    alignItems: "center",
  },
  subheadingBold: {
    fontSize: 32,
    marginBottom: 20,
    marginLeft: 13,
    marginRight: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  subheading: {
    fontSize: 16,
    textAlign: "center",
    marginLeft: 13,
    marginRight: 13,
    fontWeight: "400",
    paddingHorizontal: 8,
  },
  input: {
    height: 40,
    width: "90%",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  buttonContainer: {
    width: "90%",
    marginBottom: 10,
  },
  analyzeButton: {
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  analyzeButtonText: {
    fontWeight: "bold",
    fontSize: 22,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "500",
  },
  dashboard: {
    marginTop: 30,
    width: "100%",
  },
  box: {
    borderRadius: 16,
    padding: 10,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  summary: {
    fontSize: 16,
    lineHeight: 24,
  },
  sections: {
    marginTop: 24,
  },
  section: {
    marginBottom: 12,
  },
  button: {
    height: 50,
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
    fontWeight: "500",
  },
  caret: {
    fontSize: 22,
    fontWeight: "600",
  },
  body: {
    paddingTop: 8,
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
  highlights: {
    gap: 10,
    marginTop: 10,
  },
  blue: {
    backgroundColor: "rgba(59,130,246,0.15)",
    padding: 10,
    borderRadius: 6,
    fontSize: 14,
  },
  red: {
    backgroundColor: "rgba(239,68,68,0.15)",
    padding: 10,
    borderRadius: 6,
    fontSize: 14,
  },
  errorContainer: {
    padding: 22,
    borderRadius: 18,
    marginTop: 28,
    width: "92%",
    borderWidth: 1.5,
    alignSelf: "center",
    alignItems: "center",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  errorIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#FFEAEA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    alignSelf: "center",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 6,
    marginTop: 2,
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: 14,
  },
  content: {
    paddingTop: 8,
  },
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  splashTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#152B3F",
    marginBottom: 8,
    textAlign: "center",
  },
  splashSubtitle: {
    fontSize: 15,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 4,
  },
});
