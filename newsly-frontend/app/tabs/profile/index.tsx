import { Session } from "@supabase/supabase-js";
import { useEffect, useState, Fragment } from "react";
import { useColorScheme } from "react-native";
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
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        setSession(session);
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

  useEffect(() => {
    if (session) getProfile();
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

  return (
    <SafeAreaView
      style={{ backgroundColor: isDark ? "#0B1724" : "#fff", flex: 1 }}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: isDark ? "#0B1724" : "#fff", flex: 1 },
        ]}
      >
        {session ? (
          <View style={styles.profileContainer}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <FontAwesome name="user-circle" size={100} color="#ccc" />
              </View>
            )}
            <Text style={styles.email}>{session.user.email}</Text>
            <Text style={styles.name}>{fullName || username}</Text>

            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditProfile}
            >
              <FontAwesome
                name="edit"
                size={16}
                color="#fff"
                style={styles.editIcon}
              />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signOutButton}
              onPress={() => supabase.auth.signOut()}
            >
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
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
                onPress={() => setSession(null)}
                style={[
                  styles.signUpButton,
                  { backgroundColor: isDark ? "#60A5FA" : "#3B82F6" },
                ]}
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
                onPress={() => setSession(null)}
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
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Profile</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Username</Text>
                <TextInput
                  style={styles.input}
                  value={editUsername}
                  onChangeText={setEditUsername}
                  placeholder="Enter username"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={editFullName}
                  onChangeText={setEditFullName}
                  placeholder="Enter full name"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Avatar URL</Text>
                <TextInput
                  style={styles.input}
                  value={editAvatarUrl}
                  onChangeText={setEditAvatarUrl}
                  placeholder="Enter avatar URL"
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelEdit}
                  disabled={isSaving}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveProfile}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  profileContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    backgroundColor: "#eee",
  },
  avatarPlaceholder: {
    marginBottom: 16,
  },
  email: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    color: "#555",
    marginBottom: 24,
  },
  editButton: {
    flexDirection: "row",
    backgroundColor: "#4a90e2",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 16,
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  editIcon: {
    marginRight: 8,
  },
  signOutButton: {
    marginTop: 24,
    paddingVertical: 10,
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
