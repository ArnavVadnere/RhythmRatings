import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
  Alert,
} from "react-native";
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
import firebase from "../services/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";

const FriendProfile = ({ route }) => {
  const { friend } = route.params;
  const db = getFirestore();
  const [userId, setUserId] = useState("");
  const [requestStatus, setRequestStatus] = useState("");
  const [mutualFriends, setMutualFriends] = useState("");

  const auth = getAuth();
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  const calculateMutualFriends = (list1, list2) => {
    const set1 = new Set(list1);
    return list2.filter((friend) => set1.has(friend));
  };

  const fetchFriendsList = async (userId) => {
    const db = getFirestore();
    const friendsRef = collection(db, "users", userId, "friends");
    const querySnapshot = await getDocs(friendsRef);
    return querySnapshot.docs.map((doc) => doc.id);
  };

  useEffect(() => {
    const checkFriendshipStatus = async () => {
      if (userId && friend.id) {
        // Check if there's a pending friend request
        const friendRequestRef = doc(
          db,
          "users",
          userId,
          "friendRequests",
          friend.id
        );
        const friendRequestSnap = await getDoc(friendRequestRef);

        if (friendRequestSnap.exists()) {
          setRequestStatus(friendRequestSnap.data().status);
        } else {
          // Check if they are already friends
          const friendsRef = doc(db, "users", userId, "friends", friend.id);
          const friendsSnap = await getDoc(friendsRef);

          if (friendsSnap.exists()) {
            setRequestStatus("already_friends");
          } else {
            setRequestStatus("not_friends");
          }
        }
      }
    };

    const getMutualFriends = async () => {
      try {
        const currentUserFriends = await fetchFriendsList(userId);
        const otherUserFriends = await fetchFriendsList(friend.id);

        const mutualFriends = calculateMutualFriends(
          currentUserFriends,
          otherUserFriends
        );
        setMutualFriends(mutualFriends);
      } catch (error) {
        console.error("Error fetching mutual friends: ", error);
      }
    };

    if (userId && friend.id) {
      getMutualFriends();
    }

    checkFriendshipStatus();
  }, [userId, friend.id]);

  const handleSendFriendRequest = async () => {
    try {
      await setDoc(doc(db, "users", friend.id, "friendRequests", userId), {
        senderId: userId,
        status: "pending",
      });

      Alert.alert("Success", "Friend request sent!");
      setRequestStatus("pending");
    } catch (error) {
      console.error("Error sending friend request: ", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <SafeAreaView>
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: friend.photoURL }}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>{friend.displayName}</Text>
        </View>

        <View style={styles.infoSection}>
          {/* Replace these with actual friend information */}
          <View style={styles.infoItem}>
            <Text style={styles.infoText}>
              Mutual Friends: {mutualFriends.length}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoText}>
              Similarity Score: {friend.similarityScore}/100
            </Text>
          </View>
          {/* Add more info items as needed */}
        </View>

        {requestStatus === "not_friends" && (
          <TouchableOpacity
            style={styles.button}
            onPress={handleSendFriendRequest}
          >
            <Text style={styles.buttonText}>Send Friend Request</Text>
          </TouchableOpacity>
        )}
        {requestStatus === "pending" && (
          <TouchableOpacity
            style={[styles.button, styles.disabledButton]}
            disabled
          >
            <Text style={styles.buttonText}>Request Pending</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  profileHeader: {
    alignItems: "center",
    padding: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  infoSection: {
    padding: 20,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  infoText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  infoDescription: {
    fontSize: 14,
    color: "gray",
  },
  button: {
    backgroundColor: "#4A90E2",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "gray",
  },
});

export default FriendProfile;
