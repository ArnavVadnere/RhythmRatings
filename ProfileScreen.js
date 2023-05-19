// ProfileScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const ProfileScreen = () => {
  const [profilePic, setProfilePic] = useState("");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setProfilePic(user.photoURL);
      }
    });

    return () => unsubscribe();
  }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profile Screen</Text>
      <Image source={{ uri: profilePic }} style={styles.image} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
  image: {
    width: 100, // Or whatever dimensions you want
    height: 100,
  },
});

export default ProfileScreen;
