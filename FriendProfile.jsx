import { React, useState, useEffect } from "react";
import { View, Button } from "react-native";
import { doc, setDoc, getFirestore } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const FriendProfile = ({ route }) => {
  const { friend } = route.params;
  const db = getFirestore();
  const [userId, setUserId] = useState("");
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  const handleSendFriendRequest = async () => {
    try {
      await setDoc(doc(db, "users", friend.id, "friendRequests", userId), {
        senderId: userId,
        status: "pending",
      });

      alert("Friend request sent!");
    } catch (error) {
      console.error("Error sending friend request: ", error);
    }
  };

  return (
    <View>
      <Button title="Send Friend Request" onPress={handleSendFriendRequest} />
      {/* Other friend profile details go here */}
    </View>
  );
};

export default FriendProfile;
