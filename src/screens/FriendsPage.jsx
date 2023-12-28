import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
} from "react-native";
import { SearchBar } from "react-native-elements";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import firebase from "../services/firebase";
import {
  collection,
  getDocs,
  getFirestore,
  doc,
  getDoc,
  query,
  where,
  updateDoc,
  arrayUnion,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const FriendsPage = () => {
  const [friends, setFriends] = useState(null);
  const navigation = useNavigation();
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const db = getFirestore();
  const [displayName, setDisplayName] = useState("");
  const [friendRequests, setfriendRequests] = useState(null);
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);

  const auth = getAuth();

  //set userId

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const uid = user ? user.uid : null;
      setUserId(uid);
      setUser(user);
      if (uid) {
        console.log("User ID Set: ", uid);
        getFriends(uid);
      } else {
        console.log("User not logged in");
      }
    });
    return () => unsubscribe();
  }, []);

  //calls friend requests only when userId has a value
  useEffect(() => {
    if (userId !== null) {
      incomingRequests();
    }
  }, [userId]);

  //sets displayName
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setDisplayName(user ? user.displayName : null);
    });
    return () => unsubscribe();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      const filteredUsers = allUsers.filter(
        (user) =>
          user.displayName.toLowerCase().includes(query.toLowerCase()) &&
          user.displayName !== displayName
      );
      setSearchResults(filteredUsers);
    } else {
      setSearchResults([]);
    }
  };

  const getFriends = async (uid) => {
    try {
      if (!uid) {
        console.log("User ID is null in getFriends"); // Debugging log
        return;
      }
      const friendsRef = collection(db, "users", uid, "friends");
      const querySnapshot = await getDocs(friendsRef);
      const friendsList = querySnapshot.docs.map((doc) => doc.data());
      setFriends(friendsList);
    } catch (error) {
      console.error("Error fetching friends: ", error);
    }
  };

  const incomingRequests = async () => {
    const requestsRef = collection(db, "users", userId, "friendRequests");
    const q = query(requestsRef, where("status", "==", "pending"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error("No pending friend requests found.");
      return;
    }

    let pendingRequests = querySnapshot.docs.map((doc) => doc.data());

    // If you want to get sender IDs only
    let senderIds = pendingRequests.map((request) => request.senderId);
    getDisplayName(senderIds);
  };

  const getDisplayName = async (senderIds) => {
    let friendRequests = [];
    for (let i = 0; i < senderIds.length; i++) {
      const docRef = doc(db, "users", senderIds[i]);
      const docSnap = await getDoc(docRef);
      const data = docSnap.data();
      if (docSnap.exists()) {
        friendRequests.push({
          displayName: data.displayName,
          photoURL: data.photoURL,
          id: senderIds[i],
        });
      } else {
        console.error("No such document!");
      }
    }
    setfriendRequests(friendRequests);
  };

  const acceptRequest = async (friend) => {
    try {
      // Get the request document
      const requestRef = doc(db, "users", userId, "friendRequests", friend.id);

      // Update the request's status to 'accepted'
      await updateDoc(requestRef, { status: "accepted" });

      // Add the friend to the user's `friends` subcollection
      const userFriendsRef = collection(db, "users", userId, "friends");
      await setDoc(doc(userFriendsRef, friend.id), {
        displayName: friend.displayName,
        photoURL: friend.photoURL,
        id: friend.id,
      });

      // Add the user to the friend's `friends` subcollection
      console.log("added", userId, "to", friend.id);
      const friendFriendsRef = collection(db, "users", friend.id, "friends");
      await setDoc(doc(friendFriendsRef, userId), {
        displayName: user.displayName,
        photoURL: user.photoURL,
        id: userId,
      });

      // Remove the request from the `friendRequests` subcollection
      await deleteDoc(requestRef);

      // update local state
      setfriendRequests((prevRequests) =>
        prevRequests.filter((request) => request.id !== friend.id)
      );

      // Refresh the friends list
      await getFriends();
    } catch (error) {
      console.error("Error accepting friend request: ", error);
    }
  };

  const declineRequest = async (friend) => {
    const requestRef = doc(db, "users", userId, "friendRequests", friend.id);

    // remove friend request from Firestore
    await deleteDoc(requestRef);

    // update local state
    setfriendRequests(
      friendRequests.filter((request) => request.id !== friend.id)
    );
  };

  const toggleSearchBar = () => {
    setSearchVisible(!searchVisible);
    setSearchQuery("");
  };

  useEffect(() => {
    const fetchAllUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAllUsers(users);
    };

    fetchAllUsers();
  }, []);

  return (
    <ScrollView>
      <SafeAreaView>
        {/* view for search bar */}
        <View>
          <View style={styles.header}>
            <TouchableOpacity onPress={toggleSearchBar}>
              <Icon name={searchVisible ? "close" : "search"} size={30} />
            </TouchableOpacity>
          </View>

          {searchVisible && (
            <SearchBar
              placeholder="Search"
              onChangeText={handleSearch}
              value={searchQuery}
              containerStyle={styles.searchContainer}
              inputContainerStyle={styles.inputContainer}
              inputStyle={styles.inputText}
            />
          )}

          {searchVisible &&
            searchQuery &&
            searchResults.map((user, i) => (
              <TouchableOpacity
                key={i}
                style={styles.resultContainer}
                onPress={() =>
                  navigation.navigate("FriendProfile", { friend: user })
                }
              >
                <Image
                  source={{ uri: user.photoURL }}
                  style={styles.resultImage}
                />
                <Text style={styles.resultText}>{user.displayName}</Text>
              </TouchableOpacity>
            ))}
        </View>
        <View>
          {/* Friends List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Friends</Text>
            {friends &&
              friends.map((friend, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.friendItem}
                  onPress={() =>
                    navigation.navigate("FriendProfile", {
                      friend: friend, // Corrected key
                    })
                  }
                >
                  <Image
                    source={{ uri: friend.photoURL }}
                    style={styles.friendImage}
                  />
                  <Text style={styles.friendName}>{friend.displayName}</Text>
                </TouchableOpacity>
              ))}
          </View>

          <Text
            style={{ fontSize: 24, fontWeight: "bold", textAlign: "center" }}
          >
            Incoming Friend Requests
          </Text>
          {friendRequests &&
            friendRequests.length > 0 &&
            friendRequests.map((friend, i) => (
              <View key={i} style={styles.resultContainer}>
                <TouchableOpacity
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <Image
                    source={{ uri: friend.photoURL }}
                    style={styles.requestImage}
                  />
                  <Text style={styles.requestText}>{friend.displayName}</Text>
                </TouchableOpacity>
                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity onPress={() => acceptRequest(friend)}>
                    <Text style={styles.acceptButton}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => declineRequest(friend)}>
                    <Text style={styles.declineButton}>Decline</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 10,
  },
  searchContainer: {
    backgroundColor: "transparent",
    borderBottomColor: "transparent",
    borderTopColor: "transparent",
  },
  inputContainer: {
    backgroundColor: "lightgrey",
    borderRadius: 20,
  },
  inputText: {
    color: "black",
  },
  resultContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
  },
  resultImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  resultText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  requestContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#FFF",
  },
  requestImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  requestText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  acceptButton: {
    backgroundColor: "#4A90E2",
    color: "white",
    padding: 10,
    borderRadius: 5,
  },
  declineButton: {
    backgroundColor: "red",
    color: "white",
    padding: 10,
    borderRadius: 5,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#FFF",
  },
  friendImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  section: {
    padding: 10,
    backgroundColor: "#F5F5F5",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
  },
});

export default FriendsPage;
