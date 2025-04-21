import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Feed: React.FC = () => {
  const posts = [
    { id: 1, title: 'Post 1', content: 'This is the content of post 1.' },
    { id: 2, title: 'Post 2', content: 'This is the content of post 2.' },
    { id: 3, title: 'Post 3', content: 'This is the content of post 3.' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>NEWSLY</Text>
      {posts.map((post) => (
        <View key={post.id} style={styles.postContainer}>
          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postContent}>{post.content}</Text>
        </View>
      ))}
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