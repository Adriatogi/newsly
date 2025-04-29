import React, { useState } from "react";
import { Text, View, TextInput, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from '@rneui/themed';

interface AnalysisData {
  source: string;
  bias: string;
  fallacies: string[];
  misinformation: string[];
  contextSummary: string;
}

export default function App() {

  const [url, setUrl] = useState("");
  const [analysisData, setAnalysisData] = useState<AnalysisData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [endpointData, setEndpointData] = useState("");

  let fetchedData: string = "";

  const handleAnalyzeArticle = async () => {

    setLoading(true);

    try {
      const response = await fetch('https://78r8cpg45j.us-east-2.awsapprunner.com/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();

      fetchedData = JSON.stringify(data, null, 2);
      setEndpointData(fetchedData);
  
    } catch (error) {
      console.error('Error fetching from root endpoint:', error);
    }

    setAnalysisData(null);

    const dummyData: AnalysisData[] = [
      {
        source: "Example News Source",
        bias: "Left",
        fallacies: ["Ad Hominem"],
        misinformation: ["Fact Check 1", "Fact Check 2"],
        contextSummary: fetchedData,
      }
    ];

    setAnalysisData(dummyData);
    setLoading(false); 
    
  };

  return (
    <SafeAreaView style={styles.safeArea}>
    <ScrollView 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      >
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
        <Button 
        title="Analyze Article" 
        titleStyle={{ fontWeight: "bold" }}
        onPress={handleAnalyzeArticle} 
        disabled={!url || loading} 
        radius={15}
        color={"#152B3F"}
        raised={true}
        containerStyle={{ width: "85%", alignSelf: "center", marginTop: 20 }}
        />

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
    backgroundColor: "white",
  },
  container: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: "#white"
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