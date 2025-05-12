import { useMemo, useState, useEffect, useRef } from "react";
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
} from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

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
  misinformation: string[];
  contextSummary: string;
}

export default function App() {
  const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const handleClosePress = () => bottomSheetRef.current?.close();
  const handleOpenPress = () => bottomSheetRef.current?.expand();

  const [url, setUrl] = useState("");
  const [analysisData, setAnalysisData] = useState<AnalysisData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [endpointData, setEndpointData] = useState("");
  const [error, setError] = useState<string | null>(null);

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
          bias: result.bias?.predicted_bias || "center",
          fallacies: result.fallacies || [],
          misinformation: result.misinformation || [],
          contextSummary: result.summary || result.text || "",
        },
      ];
      setEndpointData(JSON.stringify(result, null, 2));
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.loadingOverlay, { opacity: fadeAnim }]}>
        <ActivityIndicator size="large" color="#152B3F" />
        <Text style={styles.loadingText}>Analyzing Article...</Text>
      </Animated.View>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subheadingBold}>Analyze Any News Article</Text>
        <TextInput
          style={styles.input}
          placeholder="https://example.com/news-article"
          value={url}
          placeholderTextColor={"#a9a9a9"}
          onChangeText={setUrl}
          autoCapitalize="none"
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleAnalyzeArticle}
            disabled={!url || loading}
            style={{
              backgroundColor: "#152B3F",
              paddingVertical: 15,
              borderRadius: 15,
              alignItems: "center",
              opacity: !url || loading ? 0.5 : 1,
            }}
          >
            <Text style={{ fontWeight: "bold", fontSize: 22, color: "white" }}>
              Analyze
            </Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorSubtext}>
              Please try again with a different URL or check if the article is
              accessible.
            </Text>
          </View>
        )}
        {analysisData && (
          <View style={styles.dashboard}>
            <Text style={styles.dashboardHeading}>Analysis Dashboard</Text>
            {analysisData.map((item, index) => (
              <View key={index}>
                <View style={styles.mainCard}>
                  <Text style={styles.mainCardContent}>{item.title}</Text>
                  <Text style={{ fontSize: 16, marginTop: 7 }}>
                    {item.authors} • {formatDate(item.pubDate)}
                  </Text>
                </View>
                <View style={styles.mainCard}>
                  <Text style={styles.mainCardContent}>Political Bias</Text>
                  <View style={styles.biasContainer}>
                    <Text style={styles.biasLabel}>L</Text>
                    <View style={styles.biasBar}>
                      <View
                        style={[
                          styles.biasDot,
                          { left: getBiasPos(item.bias) },
                        ]}
                      />
                    </View>
                    <Text style={styles.biasLabel}>R</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.mainCard,
                    {
                      shadowColor: "#ccc",
                      shadowOpacity: 1,
                      shadowRadius: 6,
                      shadowOffset: { width: 4, height: 4 },
                    },
                  ]}
                  onPress={handleOpenPress}
                >
                  <Text style={styles.mainCardContent}>Context Summary</Text>
                  <Text style={{ fontSize: 16, marginTop: 5 }}>
                    {item.contextSummary}
                  </Text>
                </TouchableOpacity>

                <View style={styles.subcardsContainer}>
                  <View style={styles.subCard}>
                    <Text style={[styles.mainCardContent, { fontSize: 16 }]}>
                      Logical Fallacies
                    </Text>
                    {item.fallacies.length > 0 ? (
                      <Text style={{ fontSize: 16, marginTop: 5 }}>
                        {item.fallacies.join("\n")}
                      </Text>
                    ) : (
                      <Text>None</Text>
                    )}
                  </View>
                  <View style={styles.subCard}>
                    <Text style={[styles.mainCardContent, { fontSize: 17 }]}>
                      Misinformation Flags
                    </Text>
                    {item.misinformation.length > 0 ? (
                      <Text style={{ fontSize: 16, marginTop: 5 }}>
                        {item.misinformation.join("\n")}
                      </Text>
                    ) : (
                      <Text>None</Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backgroundStyle={{ backgroundColor: "#f0f0f0" }}
        handleIndicatorStyle={{ backgroundColor: "#888", width: 40 }}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          <Text style={styles.subheadingBold}>Context Summary</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={{ fontSize: 16, marginTop: 5 }}>{endpointData}</Text>
          </ScrollView>
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    paddingVertical: 40,
    paddingHorizontal: 30,
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: "#white",
  },
  heading: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#152B3F",
  },
  subheading: {
    fontSize: 18,
    marginBottom: 10,
    color: "#152B3F",
  },
  input: {
    height: 40,
    width: "90%",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: "#FBFBFC",
    marginBottom: 20,
  },
  subheadingBold: {
    fontSize: 40,
    marginBottom: 20,
    marginLeft: 13,
    marginRight: 13,
    fontWeight: "bold",
    color: "#152B3F",
    textAlign: "center",
  },
  buttonContainer: {
    width: "90%",
    marginBottom: 10,
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
    color: "#152B3F",
    fontWeight: "500",
  },
  dashboard: {
    marginTop: 30,
    width: "100%",
  },
  dashboardHeading: {
    fontSize: 27,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  mainCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
  },
  mainCardContent: {
    fontSize: 20,
    fontWeight: "bold",
  },

  subcardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 12,
  },

  subCard: {
    // half the size of the main card
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    width: "48.5%",
  },

  biasContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  biasLabel: {
    fontSize: 16,
  },
  biasBar: {
    flex: 1,
    height: 4.3,
    backgroundColor: "#ccc",
    marginHorizontal: 5,
    position: "relative",
    borderRadius: 4,
  },
  biasDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#152B3F",
    position: "absolute",
    top: -4,
  },
  bottomSheetContent: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    width: "90%",
    borderWidth: 1,
    borderColor: "#ffcdd2",
  },
  errorText: {
    color: "#c62828",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  errorSubtext: {
    color: "#b71c1c",
    fontSize: 14,
  },
});
