import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const NewsCard: React.FC<{ title: string; 
  image: any; 
  reads: number; 
  articles: number;
  shadowColor?: string;
  shadowOpacity?: number;
  biasScore?: number;
  }> = ({ title, image, reads, articles, shadowColor = "#000", shadowOpacity = 0.1, biasScore = 0 }) => {
  return (
    <View style={{
      ...cardStyles.card,
      shadowColor: shadowColor,
      shadowOpacity: shadowOpacity,
    }
    }>
      <View style={cardStyles.imageWrapper}>
        <Image source={image} style={cardStyles.image} resizeMode="cover" />
      </View>
      <View style={cardStyles.textWrapper}>
        <Text style={cardStyles.cardTitle}>{title}</Text>
        <Text style={cardStyles.cardMeta}>{articles} articles • {reads} reads</Text>
        <View style={cardStyles.biasBarContainer}>
          <View style={cardStyles.biasBarBackground}>
            <View style={cardStyles.leftBias} />
            <View style={cardStyles.rightBias} />
          </View>
          <View style={[
            cardStyles.biasMarker,
            {
              left: `${(biasScore + 1) * 50}%`, 
              transform: [{ translateX: -6 }, { translateY: 3.5 }], 
            }
          ]} />
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
    //android
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
    marginTop: 10,
    height: 20,
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  biasBarBackground: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
  },
  leftBias: {
    backgroundColor: '#3b82f6', 
    width: '50%',
    height: '100%',
  },
  rightBias: {
    backgroundColor: '#ef4444', 
    width: '50%',
    height: '100%',
  },
  biasMarker: {
    position: 'absolute',
    top: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#152B3F',
  },
});

const Feed: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>NEWSLY</Text>
      <NewsCard
        title="Astronauts Stuck on ISS 'Confident' Starliner Will Get Them Home"
        image={require('../../../assets/images/stanfordS.png')}
        reads={2435}
        articles={18}
        shadowColor="#000"
        shadowOpacity={0.3}
        biasScore={-0.6}
      />
      <NewsCard
        title="NASA's Artemis II Moon Mission: What You Need to Know"
        image={require('../../../assets/images/space.jpg')}
        reads={1234}
        articles={10}
        shadowColor="#000"
        shadowOpacity={0.3}
        biasScore={0.4}
      />
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