import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, useColorScheme } from 'react-native';
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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const normalizedScore = Math.max(-1, Math.min(1, biasScore));
  const cardTheme = isDark ? darkCardStyles : lightCardStyles;

  return (
    <View style={[cardTheme.card, { shadowColor, shadowOpacity }]}>
      <View style={cardTheme.imageWrapper}>
        <Image source={image} style={cardTheme.image} resizeMode="cover" />
      </View>
      <View style={cardTheme.textWrapper}>
        <Text style={cardTheme.cardTitle}>{title}</Text>
        <Text style={cardTheme.cardMeta}>
          {articles} articles • {reads} reads
        </Text>

        <View style={cardTheme.biasBarContainer}>
          <View style={cardTheme.biasBarBackground}>
            <View style={cardTheme.biasBarUnified}>
              <View style={[cardTheme.leftBias, { flex: (1 - normalizedScore) / 2 }]} />
              <View style={[cardTheme.rightBias, { flex: (1 + normalizedScore) / 2 }]} />
            </View>
          </View>
          <View style={[cardTheme.triangle, {
            left: `${((1 - normalizedScore) / 2) * 100}%`,
          }]} />
        </View>
      </View>
    </View>
  );
};

const baseTriangle = {
  position: 'absolute',
  bottom: -6,
  width: 0,
  height: 0,
  borderLeftWidth: 5,
  borderRightWidth: 5,
  borderBottomWidth: 6,
  borderLeftColor: 'transparent',
  borderRightColor: 'transparent',
  transform: [{ translateX: -5 }],
};

const lightCardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  imageWrapper: { width: '100%', height: 180 },
  image: {
    borderTopEndRadius: 12,
    borderTopStartRadius: 12,
    width: '100%', height: '100%',
  },
  textWrapper: { padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#152B3F', marginBottom: 6 },
  cardMeta: { fontSize: 14, color: '#888' },
  biasBarContainer: {
    marginTop: 12,
    paddingHorizontal: 0,  // optional
    paddingVertical: 0,    // optional
    borderRadius: 8,
    position: 'relative',
  },
  biasBarBackground: {
    flexDirection: 'row', height: 10, borderRadius: 5,
    backgroundColor: '#e5e7eb', overflow: 'hidden',
  },
  biasBarUnified: {
    flexDirection: 'row', height: 6, borderRadius: 3,
    overflow: 'hidden', position: 'absolute', top: 2, left: 2, right: 2,
  },
  leftBias: { height: '100%', backgroundColor: '#3b82f6' },
  rightBias: { height: '100%', backgroundColor: '#ef4444' },
  triangle: {
    position: 'absolute', bottom: -6, width: 0, height: 0,
    borderLeftWidth: 5, borderRightWidth: 5, borderBottomWidth: 6,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderTopColor: '#152B3F', transform: [{ translateX: -5 }],
  },
});

const darkCardStyles = StyleSheet.create({
  ...lightCardStyles,
  card: {
    ...lightCardStyles.card,
    backgroundColor: '#0B1724',
  },
  cardTitle: { ...lightCardStyles.cardTitle, color: '#EDEDED' },
  cardMeta: { ...lightCardStyles.cardMeta, color: '#bbb' },
  biasBarContainer: {
    ...lightCardStyles.biasBarContainer,
    backgroundColor: '#1e2b3f',
  },
  triangle: {
    ...lightCardStyles.triangle,
    borderTopColor: '#FFFFF4',
  },
});

const Feed: React.FC = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#152B3F' : '#FFFFF4' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{
          fontSize: 40,
          fontWeight: 'bold',
          marginBottom: 20,
          color: isDark ? '#FFFFF4' : '#152B3F',
        }}>
          NEWSLY
        </Text>

        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: '/tabs/feed/ArticleView',
              params: {
                title: "Astronauts Stuck on ISS 'Confident' Starliner Will Get Them Home",
                summary: `NASA astronauts remain aboard the International Space Station (ISS) following a delay in the planned return of the Starliner spacecraft. Originally scheduled to depart last week, the Starliner encountered technical issues, including a malfunctioning propulsion system and unexpected telemetry readings, prompting mission controllers to postpone its return for safety evaluations.

NASA and Boeing have assured the public that the astronauts are safe and in good health, continuing scientific research while awaiting further instructions. Engineers are working around the clock to diagnose and resolve the issues, with updates expected in the coming days. The agency emphasized its commitment to safety and thorough testing before proceeding with any reentry attempts.`,
                biasScore: '-0.6',
              }
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
              }
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

export default Feed;