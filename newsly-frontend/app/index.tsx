import React, { useState } from "react";
import { Text, View, TextInput, StyleSheet, Button, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AnalysisData {
  source: string;
  bias: string;
  fallacies: string[];
  misinformation: string[];
  contextSummary: string;
}

export default function App() {
  // State for the URL input
  const [url, setUrl] = useState("");
  // Holds the dummy analysis results for multiple sources
  const [analysisData, setAnalysisData] = useState<AnalysisData[] | null>(null);
  // Loading indicator state for simulating fetch
  const [loading, setLoading] = useState(false);

  // Simulated handleSubmit function that "analyzes" the news article
  const handleAnalyzeArticle = () => {
    setLoading(true);
    setAnalysisData(null);
    
    // Simulate fetching and analyzing the article
    setTimeout(() => {
      const dummyData: AnalysisData[] = [
        {
          source: "Global Times",
          bias: "Left-leaning",
          fallacies: ["Straw man", "False analogy"],
          misinformation: ["Unverified claim"],
          contextSummary: "Highlights the economic implications and policy debates surrounding the article topic.",
        },
        {
          source: "Daily News",
          bias: "Right-leaning",
          fallacies: ["Slippery slope"],
          misinformation: [],
          contextSummary: "Focuses on contrasting political perspectives and historical context relevant to the issue.",
        },
      ];
      setAnalysisData(dummyData);
      setLoading(false);
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>NEWSLY</Text>
      <Text style={styles.subheadingBold}>Analyze News Articles</Text> 
      <Text style={styles.subheading}>Enter the URL of a news article:</Text>
      <TextInput
        style={styles.input}
        placeholder="https://example.com/news-article"
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
      />
      <View style={styles.buttonContainer}>
        <Button title="Analyze Article" onPress={handleAnalyzeArticle} disabled={!url || loading} />
      </View>
      {loading && <Text style={styles.loadingText}>Analyzing article...</Text>}
      {analysisData && (
        <View style={styles.dashboard}>
          <Text style={styles.dashboardHeading}>Article Analysis Dashboard</Text>
          {analysisData.map((item, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.sourceName}>{item.source}</Text>
              <Text>Political Bias: {item.bias}</Text>
              <Text>Logical Fallacies: {item.fallacies.join(", ")}</Text>
              <Text>Misinformation Flags: {item.misinformation.length > 0 ? item.misinformation.join(", ") : "None"}</Text>
              <Text>Context Summary: {item.contextSummary}</Text>
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
    backgroundColor: "#FFFFF4",
  },
  container: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: "#FFFFF4"
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
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  subheadingBold: {
    fontSize: 28,
    marginBottom: 20,
    fontWeight: "bold",
    color: "#152B3F",
  },
  buttonContainer: {
    width: "90%",
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 20,
    fontStyle: "italic",
    fontSize: 16,
  },
  dashboard: {
    marginTop: 30,
    width: "100%",
  },
  dashboardHeading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 20,
  },
  sourceName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
});