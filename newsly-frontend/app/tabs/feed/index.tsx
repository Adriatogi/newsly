import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  useColorScheme,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { NewsArticle, fetchArticles } from "../../../lib/articles";
import { NewsCard } from "../../../components/NewsCard";

const Feed: React.FC = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [activeCategory, setActiveCategory] = useState("All");
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await fetchArticles();
      setArticles(data);
      setError(null);
    } catch (err) {
      setError("Failed to load articles");
      console.error("Error loading articles:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique topics from articles
  const categories = [
    "All",
    ...new Set(articles.flatMap((article) => article.topics)),
  ];

  // Filter articles based on selected category
  const filteredArticles =
    activeCategory === "All"
      ? articles
      : articles.filter((article) => article.topics.includes(activeCategory));

  const handleArticlePress = (article: NewsArticle) => {
    console.log("PRE PRESS LF", article.logical_fallacies);

    router.push({
      pathname: "/tabs/feed/ArticleView",
      params: {
        title: article.title,
        summary: article.summary,
        bias: article.bias.toString(),
        contextualization: article.contextualization,
        logical_fallacies: JSON.stringify(article.logical_fallacies),
        authors: JSON.stringify(article.authors),
        published_date: article.published_date,
        source_url: article.source_url,
        keywords: JSON.stringify(article.keywords),
      },
    });
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: isDark ? "#152B3F" : "#F8FAFC" },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={isDark ? "#FFFFFF" : "#152B3F"}
        />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.errorContainer,
          { backgroundColor: isDark ? "#152B3F" : "#F8FAFC" },
        ]}
      >
        <Text
          style={[styles.errorText, { color: isDark ? "#FFFFFF" : "#152B3F" }]}
        >
          {error}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadArticles}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
                imageUrl={article.image_url}
                reads={article.read_count}
                publishDate={article.published_date}
                shadowColor="#000"
                shadowOpacity={0.15}
                biasScore={article.bias}
                category={article.topics[0] || "Uncategorized"}
                author={article.authors[0] || "Unknown Author"}
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
    fontSize: 17,
    fontWeight: "600",
    color: "#152B3F",
  },
  activeCategoryText: {
    color: "#FFFFFF",
  },
  newsContainer: {
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#152B3F",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Feed;
