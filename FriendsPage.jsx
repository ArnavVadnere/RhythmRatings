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
import firebase from "./firebase";
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
  const auth = getAuth();

  //set userId
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
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
      console.log("ASFSAF", filteredUsers);
      setSearchResults(filteredUsers);
    } else {
      setSearchResults([]);
    }
  };

  const incomingRequests = async () => {
    const requestsRef = collection(db, "users", userId, "friendRequests");
    const q = query(requestsRef, where("status", "==", "pending"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("No pending friend requests found.");
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
      console.log("DATA", data);
      if (docSnap.exists()) {
        friendRequests.push({
          displayName: data.displayName,
          photoURL: data.photoURL,
          id: senderIds[i],
        });
      } else {
        console.log("No such document!");
      }
    }
    console.log(friendRequests);
    setfriendRequests(friendRequests);
  };

  const acceptRequest = async (friend) => {
    //change friend request firestone to accepted
    // Get the request document
    const requestRef = doc(db, "users", userId, "friendRequests", friend.id);

    // Update the request's status to 'accepted'
    await updateDoc(requestRef, { status: "accepted" });

    // Add each user to the other's friends list
    const userRef = doc(db, "users", userId);
    const friendRef = doc(db, "users", friend.id);
    await updateDoc(userRef, {
      friends: arrayUnion(friend.id),
    });
    await updateDoc(friendRef, {
      friends: arrayUnion(userId),
    });
    console.log("Friend request accepted!");
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
          <Text
            style={{ fontSize: 24, fontWeight: "bold", textAlign: "center" }}
          >
            Friends
          </Text>
          {/* {friends.map((friend, i) => (
        <ListItem key={i} bottomDivider onPress={() => navigation.navigate('FriendProfile', { friendId: friend.id })}>
          <Avatar source={{ uri: friend.profilePictureUrl }} />
          <ListItem.Content>
            <ListItem.Title>{friend.name}</ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
      ))} */}
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
  },

  requestImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  requestText: {
    fontSize: 18,
  },
  acceptButton: {
    backgroundColor: "green",
    color: "white",
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
  },

  declineButton: {
    backgroundColor: "red",
    color: "white",
    padding: 10,
    borderRadius: 5,
  },
});

export default FriendsPage;
