import { Session } from "@supabase/supabase-js";
import { useEffect, useState, Fragment } from "react";
import { supabase } from "@/lib/supabase";
import NewslyIcon from "@/assets/images/newsly_icon_final.png";
import Auth from "@/components/Auth";
import {
  Alert,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Modal,
  useColorScheme,
  TextInput,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { Alert as RNAlert } from "react-native";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        setSession(session);
        if (session) setAuthModalVisible(false);
      }
    );
  }, []);

  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [editing, setEditing] = useState(false);

  // Temporary states for editing
  const [editUsername, setEditUsername] = useState("");
  const [editFullName, setEditFullName] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  useEffect(() => {
    if (session?.user) {
      fetchBookmarks();
    }
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");
      const { data, error, status } = await supabase
        .from("profiles")
        .select(`username, full_name, avatar_url`)
        .eq("id", session?.user.id)
        .single();
      if (error && status !== 406) {
        throw error;
      }
      if (data) {
        setUsername(data.username);
        setFullName(data.full_name);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function fetchBookmarks() {
    setBookmarksLoading(true);
    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("id, link, created_at")
        .eq("user_id", session?.user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      setBookmarks([]);
    } finally {
      setBookmarksLoading(false);
    }
  }

  const handleEditProfile = () => {
    // Initialize edit form with current values
    setEditUsername(username);
    setEditFullName(fullName);
    setEditAvatarUrl(avatarUrl);
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
  };

  const handleSaveProfile = async () => {
    if (!session?.user) return;

    try {
      setIsSaving(true);

      const updates = {
        id: session.user.id,
        username: editUsername,
        full_name: editFullName,
        avatar_url: editAvatarUrl,
      };

      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) throw error;

      // Update local state with new values
      setUsername(editUsername);
      setFullName(editFullName);
      setAvatarUrl(editAvatarUrl);

      Alert.alert("Profile updated successfully!");
      setEditing(false);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Error updating profile", error.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  async function handleRemoveBookmark(id: number) {
    try {
      const { error } = await supabase.from("bookmarks").delete().eq("id", id);
      if (error) throw error;
      setBookmarks((prev) => prev.filter((bm) => bm.id !== id));
    } catch (error) {
      RNAlert.alert("Error", "Failed to remove bookmark.");
    }
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([getProfile(), fetchBookmarks()]);
    setRefreshing(false);
  };

  return (
    <SafeAreaView
      style={{ backgroundColor: isDark ? "#0B1724" : "#f7fafd", flex: 1 }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles(isDark).container,
          { backgroundColor: isDark ? "#0B1724" : "#f7fafd" },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[isDark ? "#60A5FA" : "#3B82F6"]}
            tintColor={isDark ? "#60A5FA" : "#3B82F6"}
          />
        }
      >
        {session ? (
          <View style={styles(isDark).profileContainerModern}>
            <View style={styles(isDark).profileCard}>
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles(isDark).avatarModern}
                />
              ) : (
                <View style={styles(isDark).avatarPlaceholderModern}>
                  <FontAwesome name="user-circle" size={100} color="#ccc" />
                </View>
              )}
              <Text
                style={[
                  styles(isDark).emailModern,
                  { color: isDark ? "#ccc" : "#222" },
                ]}
              >
                {session.user.email}
              </Text>
              <Text
                style={[
                  styles(isDark).nameModern,
                  { color: isDark ? "#fff" : "#222" },
                ]}
              >
                {fullName || username}
              </Text>
              <TouchableOpacity
                style={styles(isDark).editButtonModern}
                onPress={handleEditProfile}
              >
                <FontAwesome
                  name="edit"
                  size={16}
                  color="#fff"
                  style={styles(isDark).editIcon}
                />
                <Text style={styles(isDark).editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles(isDark).signOutButtonModern}
                onPress={() => supabase.auth.signOut()}
              >
                <Text style={styles(isDark).signOutButtonText}>Sign Out</Text>
              </TouchableOpacity>
            </View>

            {/* Saved Articles Section */}
            <View style={styles(isDark).savedSection}>
              <Text style={styles(isDark).savedTitle}>Saved Articles</Text>
              {bookmarksLoading && bookmarks.length === 0 ? (
                <ActivityIndicator
                  size="large"
                  color={isDark ? "#60A5FA" : "#3B82F6"}
                  style={{ marginTop: 24 }}
                />
              ) : bookmarks.length === 0 ? (
                <Text style={styles(isDark).emptySavedText}>
                  You haven't saved any articles yet.
                </Text>
              ) : (
                <View style={styles(isDark).savedList}>
                  {bookmarks.map((bm) => (
                    <View key={bm.id} style={styles(isDark).savedCardRow}>
                      <TouchableOpacity
                        style={[styles(isDark).savedCard, { flex: 1 }]}
                        onPress={() => Linking.openURL(bm.link)}
                      >
                        <Text
                          style={styles(isDark).savedLink}
                          numberOfLines={2}
                        >
                          {bm.link}
                        </Text>
                        <FontAwesome
                          name="external-link"
                          size={16}
                          color={isDark ? "#60A5FA" : "#3B82F6"}
                          style={{ marginLeft: 8 }}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles(isDark).removeBookmarkBtn}
                        onPress={() => handleRemoveBookmark(bm.id)}
                      >
                        <FontAwesome name="trash" size={18} color="#ff6347" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        ) : (
          <Fragment>
            <View style={styles.welcomeContainer}>
              <Image
                source={NewslyIcon}
                style={styles.welcomeLogo}
                resizeMode="contain"
              />
              <Text
                style={[
                  styles.welcomeTitle,
                  { color: isDark ? "#fff" : "#000" },
                ]}
              >
                Welcome to Newsly
              </Text>
              <Text
                style={[
                  styles.welcomeSubtitle,
                  { color: isDark ? "#ccc" : "#444" },
                ]}
              >
                Compare, contrast, and contextualize related news articles from
                across the political spectrum.
              </Text>

              <TouchableOpacity
                onPress={() => setAuthModalVisible(true)}
                style={{
                  backgroundColor: isDark ? "#60A5FA" : "#3B82F6",
                  paddingVertical: 12,
                  paddingHorizontal: 32,
                  borderRadius: 8,
                  marginBottom: 24,
                }}

              >
                <Text style={styles.signUpButtonText}>Sign Up</Text>
              </TouchableOpacity>
              <View style={styles.featuresContainer}>
                <View style={styles.featureItem}>
                  <FontAwesome
                    name="newspaper-o"
                    size={20}
                    color={isDark ? "#60A5FA" : "#3B82F6"}
                    style={styles.featureIcon}
                  />
                  <Text
                    style={[
                      styles.featureText,
                      { color: isDark ? "#ddd" : "#000" },
                    ]}
                  >
                    See multiple perspectives on current stories
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <FontAwesome
                    name="balance-scale"
                    size={20}
                    color={isDark ? "#60A5FA" : "#3B82F6"}
                    style={styles.featureIcon}
                  />
                  <Text
                    style={[
                      styles.featureText,
                      { color: isDark ? "#ddd" : "#000" },
                    ]}
                  >
                    Uncover political bias and misinformation
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <FontAwesome
                    name="book"
                    size={20}
                    color={isDark ? "#60A5FA" : "#3B82F6"}
                    style={styles.featureIcon}
                  />
                  <Text
                    style={[
                      styles.featureText,
                      { color: isDark ? "#ddd" : "#000" },
                    ]}
                  >
                    Explore contextual summaries of issues
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <FontAwesome
                    name="bookmark"
                    size={20}
                    color={isDark ? "#60A5FA" : "#3B82F6"}
                    style={styles.featureIcon}
                  />
                  <Text
                    style={[
                      styles.featureText,
                      { color: isDark ? "#ddd" : "#000" },
                    ]}
                  >
                    Save articles to read or analyze later
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setAuthModalVisible(true)}
                style={styles.signInLink}
              >
                <Text
                  style={[
                    styles.signInText,
                    { color: isDark ? "#60A5FA" : "#3B82F6" },
                  ]}
                >
                  Already have an account? Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </Fragment>
        )}

        {/* Edit Profile Modal */}
        <Modal
          visible={editing}
          animationType="slide"
          transparent={true}
          onRequestClose={handleCancelEdit}
        >
          <View style={styles(isDark).modalOverlay}>
            <View style={styles(isDark).modalContent}>
              <Text style={styles(isDark).modalTitle}>Edit Profile</Text>

              <View style={styles(isDark).inputContainer}>
                <Text style={styles(isDark).inputLabel}>Username</Text>
                <TextInput
                  style={styles(isDark).input}
                  value={editUsername}
                  onChangeText={setEditUsername}
                  placeholder="Enter username"
                />
              </View>

              <View style={styles(isDark).inputContainer}>
                <Text style={styles(isDark).inputLabel}>Full Name</Text>
                <TextInput
                  style={styles(isDark).input}
                  value={editFullName}
                  onChangeText={setEditFullName}
                  placeholder="Enter full name"
                />
              </View>

              <View style={styles(isDark).inputContainer}>
                <Text style={styles(isDark).inputLabel}>Avatar URL</Text>
                <TextInput
                  style={styles(isDark).input}
                  value={editAvatarUrl}
                  onChangeText={setEditAvatarUrl}
                  placeholder="Enter avatar URL"
                />
              </View>

              <View style={styles(isDark).modalButtons}>
                <TouchableOpacity
                  style={styles(isDark).cancelButton}
                  onPress={handleCancelEdit}
                  disabled={isSaving}
                >
                  <Text style={styles(isDark).cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles(isDark).saveButton}
                  onPress={handleSaveProfile}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles(isDark).saveButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={authModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setAuthModalVisible(false)}
        >
          <SafeAreaView
            style={{ flex: 1, backgroundColor: isDark ? "#0B1724" : "#fff" }}
          >
            <Auth onAuthSuccess={() => setAuthModalVisible(false)} />
            <TouchableOpacity
              onPress={() => setAuthModalVisible(false)}
              style={{ padding: 20 }}
            >
              <Text style={{ textAlign: "center", color: "#888" }}>Close</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      padding: 0,
      paddingBottom: 40,
    },
    profileContainerModern: {
      alignItems: "center",
      marginTop: 24,
      width: "100%",
    },
    profileCard: {
      backgroundColor: isDark ? "#182B42" : "#fff",
      borderRadius: 18,
      padding: 28,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
      marginBottom: 32,
      width: "90%",
      alignSelf: "center",
    },
    avatarModern: {
      width: 110,
      height: 110,
      borderRadius: 55,
      marginBottom: 18,
      backgroundColor: "#e5e7eb",
      borderWidth: 2,
      borderColor: isDark ? "#60A5FA" : "#3B82F6",
    },
    avatarPlaceholderModern: {
      marginBottom: 18,
    },
    emailModern: {
      fontSize: 17,
      fontWeight: "600",
      marginBottom: 6,
    },
    nameModern: {
      fontSize: 22,
      fontWeight: "bold",
      marginBottom: 18,
    },
    editButtonModern: {
      flexDirection: "row",
      backgroundColor: isDark ? "#60A5FA" : "#3B82F6",
      paddingVertical: 10,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 8,
      marginBottom: 8,
    },
    signOutButtonModern: {
      marginTop: 12,
      paddingVertical: 10,
      paddingHorizontal: 24,
      borderRadius: 8,
      backgroundColor: isDark ? "#1e293b" : "#f3f4f6",
    },
    editIcon: {
      marginRight: 8,
    },
    editButtonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 14,
    },
    signOutButtonText: {
      color: "#ff6347",
      fontSize: 14,
      fontWeight: "bold",
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
      backgroundColor: "white",
      borderRadius: 10,
      padding: 20,
      width: "80%",
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 20,
      textAlign: "center",
    },
    inputContainer: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 14,
      marginBottom: 4,
      color: "#555",
    },
    input: {
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 5,
      padding: 10,
      fontSize: 16,
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 20,
    },
    cancelButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: "#ddd",
    },
    cancelButtonText: {
      color: "#555",
      fontSize: 14,
    },
    saveButton: {
      backgroundColor: "#4a90e2",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
    },
    saveButtonText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "bold",
    },
    savedSection: {
      width: "90%",
      alignSelf: "center",
      marginTop: 8,
      marginBottom: 24,
    },
    savedTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 16,
      color: isDark ? "#fff" : "#222",
    },
    savedList: {
      gap: 12,
    },
    savedCard: {
      backgroundColor: isDark ? "#22334a" : "#f1f5f9",
      borderRadius: 10,
      padding: 16,
      marginBottom: 10,
      flexDirection: "row",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    savedLink: {
      color: isDark ? "#60A5FA" : "#2563eb",
      fontWeight: "500",
      fontSize: 15,
      flex: 1,
    },
    emptySavedText: {
      color: isDark ? "#aaa" : "#888",
      fontSize: 16,
      textAlign: "center",
      marginTop: 24,
    },
    savedCardRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    removeBookmarkBtn: {
      marginLeft: 8,
      padding: 8,
      borderRadius: 8,
      backgroundColor: "transparent",
    },
     welcomeContainer: {
      alignItems: "center",
      padding: 24,
      paddingTop: 10,
    },
    welcomeLogo: {
      width: 96,
      height: 96,
      marginBottom: 24,
    },
    welcomeTitle: {
      fontSize: 32,
      fontWeight: "700",
      marginBottom: 12,
      textAlign: "center",
    },
    welcomeSubtitle: {
      fontSize: 16,
      textAlign: "center",
      marginBottom: 32,
      lineHeight: 24,
      paddingHorizontal: 16,
    },
    signUpButton: {
      paddingVertical: 14,
      paddingHorizontal: 40,
      borderRadius: 12,
      marginBottom: 32,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    signUpButtonText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 16,
    },
    featuresContainer: {
      width: "100%",
      paddingHorizontal: 16,
      marginBottom: 32,
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      paddingHorizontal: 8,
    },
    featureIcon: {
      marginRight: 12,
    },
    featureText: {
      fontSize: 15,
      flex: 1,
      lineHeight: 22,
    },
    signInLink: {
      marginTop: 8,
      paddingVertical: 8,
    },
    signInText: {
      fontWeight: "600",
      fontSize: 15,
    },     
  });
