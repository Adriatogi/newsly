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
  bias: string;
  fallacies: string[];
  context: string[];
  contextSummary: string;
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
      const response = await fetch("https://78r8cpg45j.us-east-2.awsapprunner.com/articles/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

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
          bias: result.bias?.predicted_bias || "center",
          fallacies: result.fallacies || [],
          context: result.contextualization || [],
          contextSummary: result.summary || result.text || "",
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

  const renderBiasBar = (bias: string) => (
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
          style={{ flex: 0.5, backgroundColor: "#3b82f6", height: "100%" }}
        />
        <View
          style={{ flex: 0.5, backgroundColor: "#ef4444", height: "100%" }}
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

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? "#152B3F" : "#FFFFFF" },
      ]}
    >
      <Animated.View style={[styles.loadingOverlay, { opacity: fadeAnim }]}>
        <ActivityIndicator size="large" color="#152B3F" />
        <Text style={[styles.loadingText, { color: "#152B3F" }]}>
          Analyzing Article...
        </Text>
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
          Analyze Any News Article
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
        <View style={styles.featuresRow}>
          <View style={styles.featureItem}>
            <Feather
              name="smile"
              size={28}
              color={isDark ? "#FFFFFF" : "#3B5FFF"}
            />
            <Text
              style={[
                styles.featureLabel,
                { color: isDark ? "#FFFFFF" : "#3B5FFF" },
              ]}
            >
              Sentiment
            </Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons
              name="swap-horizontal"
              size={28}
              color={isDark ? "#FFFFFF" : "#3B5FFF"}
            />
            <Text
              style={[
                styles.featureLabel,
                { color: isDark ? "#FFFFFF" : "#3B5FFF" },
              ]}
            >
              Bias Detection
            </Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons
              name="shield-check"
              size={28}
              color={isDark ? "#FFFFFF" : "#3B5FFF"}
            />
            <Text
              style={[
                styles.featureLabel,
                { color: isDark ? "#FFFFFF" : "#3B5FFF" },
              ]}
            >
              Source Credibility
            </Text>
          </View>
          <View style={styles.featureItem}>
            <FontAwesome
              name="book"
              size={26}
              color={isDark ? "#FFFFFF" : "#3B5FFF"}
            />
            <Text
              style={[
                styles.featureLabel,
                { color: isDark ? "#FFFFFF" : "#3B5FFF" },
              ]}
            >
              Read Time
            </Text>
          </View>
        </View>
        {error && (
          <View
            style={[
              styles.errorContainer,
              {
                backgroundColor: isDark ? "#2a3b55" : "#ffebee",
                borderColor: isDark ? "#3a4b65" : "#ffcdd2",
              },
            ]}
          >
            <Text
              style={[
                styles.errorText,
                { color: isDark ? "#ff6b6b" : "#c62828" },
              ]}
            >
              {error}
            </Text>
            <Text
              style={[
                styles.errorSubtext,
                { color: isDark ? "#ff8f8f" : "#b71c1c" },
              ]}
            >
              Please try again with a different URL or check if the article is
              accessible.
            </Text>
          </View>
        )}

        {analysisData && (
          <View style={styles.dashboard}>
            {analysisData.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.box,
                  {
                    backgroundColor: isDark ? "#0B1724" : "#FDFDF8",
                    shadowColor: isDark ? "#000" : "#ccc",
                  },
                ]}
              >
                <Text
                  style={[styles.title, { color: isDark ? "#fff" : "#152B3F" }]}
                >
                  {item.title}
                </Text>
                <Text
                  style={[
                    styles.sectionLabel,
                    { color: isDark ? "#888" : "#666" },
                  ]}
                >
                  {item.authors.join(", ")} • {formatDate(item.pubDate)}
                </Text>
                <Text
                  style={[
                    styles.summary,
                    { color: isDark ? "#EDEDED" : "#152B3F" },
                  ]}
                >
                  {item.contextSummary}
                </Text>

                <View style={styles.sections}>
                  <View style={styles.section}>
                    {renderBiasBar(item.bias)}
                    {sections["Political Bias Analysis"] && (
                      <View style={styles.highlights}>
                        <Text
                          style={[
                            styles.blue,
                            { color: isDark ? "#fff" : "#152B3F" },
                          ]}
                        >
                          Left-leaning content
                        </Text>
                        <Text
                          style={[
                            styles.red,
                            { color: isDark ? "#fff" : "#152B3F" },
                          ]}
                        >
                          Right-leaning content
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.section}>
                    <Pressable
                      onPress={() => toggleSection("Logical Fallacies")}
                      style={[
                        styles.button,
                        { backgroundColor: isDark ? "#2a3b55" : "#eee" },
                      ]}
                    >
                      <View style={styles.row}>
                        <View style={styles.iconRow}>
                          <View style={styles.biasIconWrapper}>
                            <Feather name="divide" size={18} color="#D74D41" />
                          </View>
                          <Text
                            style={[
                              styles.label,
                              { color: isDark ? "#fff" : "#152B3F" },
                            ]}
                          >
                            Logical Fallacies
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.caret,
                            { color: isDark ? "#fff" : "#000" },
                          ]}
                        >
                          {sections["Logical Fallacies"] ? "˄" : "˅"}
                        </Text>
                      </View>
                    </Pressable>
                    {sections["Logical Fallacies"] && (
                      <View style={styles.content}>
                        {item.fallacies.length > 0 ? (
                          item.fallacies.map((fallacy, i) => (
                            <Text
                              key={i}
                              style={[
                                styles.body,
                                { color: isDark ? "#ddd" : "#444" },
                              ]}
                            >
                              • {fallacy}
                            </Text>
                          ))
                        ) : (
                          <Text
                            style={[
                              styles.body,
                              { color: isDark ? "#ddd" : "#444" },
                            ]}
                          >
                            No logical fallacies detected
                          </Text>
                        )}
                      </View>
                    )}
                  </View>

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
                      <View style={styles.content}>
                        {item.context ? (
                          <Text
                            style={[
                              styles.body,
                              { color: isDark ? "#ddd" : "#444" },
                            ]}
                          >
                            {item.context}
                          </Text>
                        ) : (
                          <Text
                            style={[
                              styles.body,
                              { color: isDark ? "#ddd" : "#444" },
                            ]}
                          >
                            No historical context available
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
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
    paddingVertical: 40,
    paddingHorizontal: 30,
    flexGrow: 1,
    alignItems: "center",
  },
  subheadingBold: {
    fontSize: 28,
    marginBottom: 20,
    marginLeft: 13,
    marginRight: 13,
    fontWeight: "700",
    textAlign: "center",
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
    padding: 20,
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
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    width: "90%",
    borderWidth: 1,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
  },
  content: {
    paddingTop: 8,
  },
  featuresRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 30,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  featureItem: {
    alignItems: "center",
    flex: 1,
  },
  featureLabel: {
    marginTop: 8,
    fontSize: 14,
    color: "#3B5FFF",
    fontWeight: "600",
    textAlign: "center",
  },
});
