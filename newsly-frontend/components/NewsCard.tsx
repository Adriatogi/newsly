import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  useColorScheme,
  Pressable,
  Linking,
} from "react-native";

export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
};

const getDomainFromUrl = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    // Remove 'www.' if present
    return domain.replace(/^www\./, "");
  } catch (error) {
    return url; // Return original string if URL parsing fails
  }
};

interface NewsCardProps {
  title: string;
  imageUrl: string;
  reads: number;
  publishDate: string;
  shadowColor?: string;
  shadowOpacity?: number;
  biasScore?: string;
  category: string;
  author: string;
  newsSource: string;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  title,
  imageUrl,
  reads,
  publishDate,
  shadowColor = "#000",
  shadowOpacity = 0.1,
  biasScore = "center",
  category,
  author,
  newsSource,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const cardTheme = isDark ? darkCardStyles : lightCardStyles;

  return (
    <View style={[cardTheme.card, { shadowColor, shadowOpacity }]}>
      <View style={cardTheme.imageWrapper}>
        <Image
          source={{ uri: imageUrl }}
          style={cardTheme.image}
          resizeMode="cover"
        />
        <View style={cardTheme.categoryTag}>
          <Text style={cardTheme.categoryText}>{category}</Text>
        </View>
      </View>
      <View style={cardTheme.textWrapper}>
        <Text style={cardTheme.cardTitle}>{title}</Text>
        <View style={cardTheme.metaContainer}>
          <View style={cardTheme.metaContent}>
            <View>
              <Text style={cardTheme.authorText}>By {author}</Text>
              <Text style={cardTheme.cardMeta}>
                {formatDate(publishDate)} • {reads} reads
              </Text>
              <Pressable
                onPress={() => Linking.openURL(newsSource)}
                style={({ pressed }) => [
                  cardTheme.sourceContainer,
                  pressed && cardTheme.sourcePressed,
                ]}
              >
                <Text style={cardTheme.sourceText}>
                  {getDomainFromUrl(newsSource)}
                </Text>
              </Pressable>
            </View>
            <View style={cardTheme.biasIndicatorContainer}>
              <View
                style={[
                  cardTheme.biasSquare,
                  biasScore === "left" && cardTheme.activeLeftBias,
                ]}
              >
                <Text
                  style={[
                    cardTheme.biasText,
                    biasScore === "left" && cardTheme.activeLeftText,
                  ]}
                >
                  L
                </Text>
              </View>
              <View
                style={[
                  cardTheme.biasSquare,
                  biasScore === "center" && cardTheme.activeCenterBias,
                ]}
              >
                <Text
                  style={[
                    cardTheme.biasText,
                    biasScore === "center" && cardTheme.activeCenterText,
                  ]}
                >
                  C
                </Text>
              </View>
              <View
                style={[
                  cardTheme.biasSquare,
                  biasScore === "right" && cardTheme.activeRightBias,
                ]}
              >
                <Text
                  style={[
                    cardTheme.biasText,
                    biasScore === "right" && cardTheme.activeRightText,
                  ]}
                >
                  R
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const lightCardStyles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  imageWrapper: {
    width: "100%",
    height: 180,
    position: "relative",
  },
  image: {
    borderTopEndRadius: 12,
    borderTopStartRadius: 12,
    width: "100%",
    height: "100%",
  },
  categoryTag: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(21, 43, 63, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  textWrapper: { padding: 16 },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#152B3F",
    marginBottom: 6,
  },
  metaContainer: {
    marginBottom: 6,
  },
  metaContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  authorText: {
    fontSize: 14,
    color: "#152B3F",
    fontWeight: "500",
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 14,
    color: "#888",
    marginBottom: 2,
  },
  sourceContainer: {
    alignSelf: "flex-start",
  },
  sourcePressed: {
    opacity: 0.7,
  },
  sourceText: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "500",
  },
  biasIndicatorContainer: {
    marginRight: 12,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    marginBottom: 2,
  },
  biasSquare: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  activeLeftBias: {
    backgroundColor: "#3b82f6",
  },
  activeCenterBias: {
    backgroundColor: "#6b7280",
  },
  activeRightBias: {
    backgroundColor: "#ef4444",
  },
  biasText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#152B3F",
  },
  activeLeftText: {
    color: "#ffffff",
  },
  activeCenterText: {
    color: "#ffffff",
  },
  activeRightText: {
    color: "#ffffff",
  },
});

const darkCardStyles = StyleSheet.create({
  ...lightCardStyles,
  card: {
    ...lightCardStyles.card,
    backgroundColor: "#0B1724",
  },
  cardTitle: { ...lightCardStyles.cardTitle, color: "#EDEDED" },
  cardMeta: { ...lightCardStyles.cardMeta, color: "#bbb" },
  categoryTag: {
    ...lightCardStyles.categoryTag,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  categoryText: {
    ...lightCardStyles.categoryText,
    color: "#152B3F",
  },
  biasSquare: {
    ...lightCardStyles.biasSquare,
    backgroundColor: "#1e2b3f",
  },
  activeLeftBias: {
    backgroundColor: "#3b82f6",
  },
  activeCenterBias: {
    backgroundColor: "#6b7280",
  },
  activeRightBias: {
    backgroundColor: "#ef4444",
  },
  biasText: {
    ...lightCardStyles.biasText,
    color: "#EDEDED",
  },
  activeLeftText: {
    color: "#ffffff",
  },
  activeCenterText: {
    color: "#ffffff",
  },
  activeRightText: {
    color: "#ffffff",
  },
  authorText: {
    ...lightCardStyles.authorText,
    color: "#EDEDED",
  },
  sourceText: {
    ...lightCardStyles.sourceText,
    color: "#60a5fa",
  },
});
