import React from "react";
import { View, Text, StyleSheet, Image, useColorScheme } from "react-native";

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
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Convert bias string to number for the bar
  const getBiasNumber = (biasStr: string) => {
    switch (biasStr.toLowerCase()) {
      case "left":
        return -0.7;
      case "center":
        return 0;
      case "right":
        return 0.7;
      default:
        return 0;
    }
  };

  const normalizedScore = getBiasNumber(biasScore);
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
          <Text style={cardTheme.authorText}>By {author}</Text>
          <Text style={cardTheme.cardMeta}>
            {formatDate(publishDate)} • {reads} reads
          </Text>
        </View>

        <View style={cardTheme.biasBarContainer}>
          <View style={cardTheme.biasBarBackground}>
            <View style={cardTheme.biasBarUnified}>
              <View
                style={[
                  cardTheme.leftBias,
                  { flex: (1 - normalizedScore) / 2 },
                ]}
              />
              <View
                style={[
                  cardTheme.rightBias,
                  { flex: (1 + normalizedScore) / 2 },
                ]}
              />
            </View>
          </View>
          <View
            style={[
              cardTheme.triangle,
              {
                left: `${((1 - normalizedScore) / 2) * 100}%`,
              },
            ]}
          />
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
  authorText: {
    fontSize: 14,
    color: "#152B3F",
    fontWeight: "500",
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 14,
    color: "#888",
  },
  biasBarContainer: {
    marginTop: 12,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 8,
    position: "relative",
  },
  biasBarBackground: {
    flexDirection: "row",
    height: 10,
    borderRadius: 5,
    backgroundColor: "#e5e7eb",
    overflow: "hidden",
  },
  biasBarUnified: {
    flexDirection: "row",
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    position: "absolute",
    top: 2,
    left: 2,
    right: 2,
  },
  leftBias: { height: "100%", backgroundColor: "#3b82f6" },
  rightBias: { height: "100%", backgroundColor: "#ef4444" },
  triangle: {
    position: "absolute",
    bottom: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#152B3F",
    transform: [{ translateX: -5 }],
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
  biasBarContainer: {
    ...lightCardStyles.biasBarContainer,
    backgroundColor: "#1e2b3f",
  },
  triangle: {
    ...lightCardStyles.triangle,
    borderTopColor: "#FFFFF4",
  },
  authorText: {
    ...lightCardStyles.authorText,
    color: "#EDEDED",
  },
});
