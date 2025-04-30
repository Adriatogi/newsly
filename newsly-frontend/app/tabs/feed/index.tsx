import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const NewsCard: React.FC<{
  title: string;
  image: any;
  reads: number;
  articles: number;
  shadowColor?: string;
  shadowOpacity?: number;
  biasScore?: number;
}> = ({
  title,
  image,
  reads,
  articles,
  shadowColor = "#000",
  shadowOpacity = 0.1,
  biasScore = 0,
}) => {
  const normalizedScore = Math.max(-1, Math.min(1, biasScore));
  const pointerLeftPercent = `${((normalizedScore + 1) / 2) * 100}%`;

  return (
    <View
      style={{
        ...cardStyles.card,
        shadowColor,
        shadowOpacity,
      }}
    >
      <View style={cardStyles.imageWrapper}>
        <Image source={image} style={cardStyles.image} resizeMode="cover" />
      </View>
      <View style={cardStyles.textWrapper}>
        <Text style={cardStyles.cardTitle}>{title}</Text>
        <Text style={cardStyles.cardMeta}>
          {articles} articles • {reads} reads
        </Text>

        <View style={cardStyles.biasBarContainer}>
          <View style={cardStyles.biasBarBackground}>
            <View style={cardStyles.biasBarUnified}>
              <View style={[cardStyles.leftBias, { flex: (1 - normalizedScore) / 2 }]} />
              <View style={[cardStyles.rightBias, { flex: (1 + normalizedScore) / 2 }]} />
            </View>
          </View>
          <View style={[cardStyles.triangle, {
            left: `${((1 - normalizedScore) / 2) * 100}%`,
          }]} />
        </View>
      </View>
    </View>
  );
};

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  imageWrapper: {
    width: '100%',
    height: 180,
  },
  image: {
    borderTopEndRadius: 12,
    borderTopStartRadius: 12,
    width: '100%',
    height: '100%',
  },
  textWrapper: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#152B3F',
    marginBottom: 6,
  },
  cardMeta: {
    fontSize: 14,
    color: '#888',
  },
  biasBarContainer: {
    marginTop: 12,
    paddingHorizontal: 2,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
    position: 'relative',
  },
  biasBarBackground: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  biasBarUnified: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
  },
  leftBias: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  rightBias: {
    height: '100%',
    backgroundColor: '#ef4444',
  },
  triangle: {
    position: 'absolute',
    bottom: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#152B3F',
    transform: [{ translateX: -5 }],
  },
});

const Feed: React.FC = () => {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>NEWSLY</Text>

        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: '/tabs/feed/ArticleView',
              params: {
                title: "Astronauts Stuck on ISS 'Confident' Starliner Will Get Them Home",
                summary: "NASA astronauts remain stranded on the ISS, awaiting updates on the Starliner's return capabilities...",
                biasScore: '-0.6',
              },
            })
          }
        >
          <NewsCard
            title="Astronauts Stuck on ISS 'Confident' Starliner Will Get Them Home"
            image={require('../../../assets/images/stanfordS.png')}
            reads={2435}
            articles={18}
            shadowColor="#000"
            shadowOpacity={0.3}
            biasScore={-0.6}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: '/tabs/feed/ArticleView',
              params: {
                title: "NASA's Artemis II Moon Mission: What You Need to Know",
                summary: "NASA's next moon mission is preparing to launch with four astronauts onboard...",
                biasScore: '0.4',
              },
            })
          }
        >
          <NewsCard
            title="NASA's Artemis II Moon Mission: What You Need to Know"
            image={require('../../../assets/images/space.jpg')}
            reads={1234}
            articles={10}
            shadowColor="#000"
            shadowOpacity={0.3}
            biasScore={0.4}
          />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFF4",
  },
  container: {
    padding: 20,
  },
  heading: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#152B3F",
  },
  postContainer: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  postTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  postContent: {
    fontSize: 16,
  },
});

export default Feed;