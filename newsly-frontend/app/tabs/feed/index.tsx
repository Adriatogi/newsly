import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  useColorScheme,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import {
  mockArticles,
  NewsArticle,
} from "../../../components/homeFeedTestData";
import { NewsCard } from "../../../components/NewsCard";

const Feed: React.FC = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [activeCategory, setActiveCategory] = useState("All");

  // Get unique categories from mock data
  const categories = [
    "All",
    ...new Set(mockArticles.map((article) => article.category)),
  ];

  // Filter articles based on selected category
  const filteredArticles =
    activeCategory === "All"
      ? mockArticles
      : mockArticles.filter((article) => article.category === activeCategory);

  const handleArticlePress = (article: NewsArticle) => {
    router.push({
      pathname: "/tabs/feed/ArticleView",
      params: {
        title: article.title,
        summary: article.summary,
        biasScore: article.biasScore.toString(),
        historicalContext: article.historicalContext,
        logicalFallacies: article.logicalFallacies,
        biasAnalysis: JSON.stringify(
          Array.from(article.biasAnalysis.entries())
        ),
      },
    });
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? "#152B3F" : "#F8FAFC" },
      ]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.categoriesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  activeCategory === category && styles.activeCategory,
                ]}
                onPress={() => setActiveCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    activeCategory === category && styles.activeCategoryText,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.newsContainer}>
          {filteredArticles.map((article) => (
            <TouchableOpacity
              key={article.id}
              onPress={() => handleArticlePress(article)}
            >
              <NewsCard
                title={article.title}
                imageUrl={article.imageUrl}
                reads={article.reads}
                publishDate={article.publishDate}
                shadowColor="#000"
                shadowOpacity={0.15}
                biasScore={article.biasScore}
                category={article.category}
                author={article.author}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesScroll: {
    paddingRight: 20,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    marginRight: 10,
  },
  activeCategory: {
    backgroundColor: "#152B3F",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#152B3F",
  },
  activeCategoryText: {
    color: "#FFFFFF",
  },
  newsContainer: {
    gap: 16,
  },
});

export default Feed;
