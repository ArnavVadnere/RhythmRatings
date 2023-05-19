import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useAuthRequest } from "expo-auth-session";
import firebase from "./firebase";
import {
  getAuth,
  signInWithCustomToken,
  updateProfile,
  updateEmail,
} from "firebase/auth";
import {
  addDoc,
  collection,
  getFirestore,
  doc,
  setDoc,
} from "firebase/firestore";

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = ({ navigation }) => {
  React.useEffect(() => {}, [token]);

  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [userUID, setUID] = useState("");

  //firebase stuff
  const fetchFirebaseToken = async (spotifyAccessToken) => {
    try {
      const response = await fetch(
        `https://us-central1-spotifyapp-22d72.cloudfunctions.net/getFirebaseToken?code=${spotifyAccessToken}`
      );

      const data = await response.json();
      return data.firebaseToken;
    } catch (error) {
      console.error("Error fetching Firebase token:", error);
      console.error(
        "Error in getFirebaseToken:",
        error.message,
        error.response && error.response.data
      );
      return null; // Return null or an appropriate default value in case of an error
    }
  };

  //save user data in firestone
  const saveUserInfo = async (user) => {
    const db = getFirestore();
    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, {
        displayName: user.displayName,
        photoURL: user.photoURL,
        userID: user.uid,
        email: user.email,
      });

      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  //return display name
  const fetchDisplayName = async (accessToken) => {
    const response = await fetch("https://api.spotify.com/v1/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    return data.display_name;
  };
  //return email address
  const fetchEmail = async (accessToken) => {
    const response = await fetch("https://api.spotify.com/v1/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    return data.email;
  };
  //return photo url
  const fetchedPhotoUrl = async (accessToken) => {
    const response = await fetch("https://api.spotify.com/v1/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    // if (data.images[0].url == undefined) {
    if (data.images.length == 0) {
      return "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
    } else {
      return data.images[0].url;
    }
  };

  //show navbar after loggedin
  React.useEffect(() => {
    if (loggedIn) {
      navigation.navigate("BottomTabs", {
        token: token,
        refreshToken: refreshToken,
      });
    }
  }, [loggedIn, navigation]);

  const discovery = {
    authorizationEndpoint: "https://accounts.spotify.com/authorize",
    tokenEndpoint: "https://accounts.spotify.com/api/token",
  };

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: "14a44a5d38244f49be411a8dec546529",
      scopes: [
        "user-top-read",
        "user-read-currently-playing",
        "user-read-playback-state",
        "user-read-private",
        "user-read-email",
      ],
      redirectUri: "exp://172.28.228.16:19000/",
      extraParams: {
        response_type: "code",
        show_dialog: "true",
      },
      usePKCE: false,
    },
    discovery
  );

  React.useEffect(() => {
    if (response?.type === "success") {
      const { code } = response.params;
      fetchAccessToken(code);
    }
  }, [response]);

  const fetchAccessToken = async (authorizationCode) => {
    const params = {
      grant_type: "authorization_code",
      code: authorizationCode,
      redirect_uri: "exp://172.28.228.16:19000/",
      client_id: "14a44a5d38244f49be411a8dec546529",
      client_secret: "edf1707c83b04e40958e5625b4864dee",
    };

    const encodedParams = Object.keys(params)
      .map(
        (key) => encodeURIComponent(key) + "=" + encodeURIComponent(params[key])
      )
      .join("&");

    const response = await fetch(discovery.tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: encodedParams,
    });

    const data = await response.json();

    setToken(data.access_token);
    if (data.access_token) {
      setLoggedIn(true);
    }

    setRefreshToken(data.refresh_token); // Save the refresh token

    // Calculate the token expiration time
    const expiresIn = data.expires_in;
    const expirationTime = new Date().getTime() + expiresIn * 1000;

    // setTimeout(() => {
    //   refreshAccessToken();
    // }, refreshTime);

    //call firebase token function
    const fetchedDisplayName = await fetchDisplayName(data.access_token);
    const fetchedEmail = await fetchEmail(data.access_token);
    const fetchedPhoto = await fetchedPhotoUrl(data.access_token);
    const firebaseToken = await fetchFirebaseToken(data.access_token);
    if (firebaseToken) {
      const auth = getAuth();
      signInWithCustomToken(auth, firebaseToken)
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          // Create an async function to update the user profile
          const updateUserProfile = async (
            displayName,
            emailAddress,
            photoUrl
          ) => {
            // Set the displayName for the user
            await updateProfile(user, {
              displayName: displayName,
              photoURL: photoUrl,
            });

            // Set the email for the user
            try {
              await updateEmail(user, emailAddress);
            } catch (error) {
              console.error("Error updating email:", error);
            }

            // Log the updated user to see the changes
            console.log("User profile updated:", user);
          };

          // Call the async function
          updateUserProfile(fetchedDisplayName, fetchedEmail, fetchedPhoto);
          saveUserInfo(user);
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.error(errorMessage);
        });
    } else {
      console.error("Firebase token is not valid or could not be fetched.");
    }
  };

  const refreshAccessToken = async () => {
    if (!refreshToken) {
      console.log("No refresh token available.");
      return;
    }

    const params = {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: "14a44a5d38244f49be411a8dec546529",
      client_secret: "edf1707c83b04e40958e5625b4864dee",
    };

    const encodedParams = Object.keys(params)
      .map(
        (key) => encodeURIComponent(key) + "=" + encodeURIComponent(params[key])
      )
      .join("&");

    const response = await fetch(discovery.tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: encodedParams,
    });

    const data = await response.json();
    setToken(data.access_token);
  };

  return (
    <View style={styles.container}>
      {!loggedIn ? (
        <TouchableOpacity
          onPress={() => {
            promptAsync();
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Login with Spotify</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#1DB954",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
  tokenText: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
  },
  token: {
    fontSize: 12,
    marginTop: 5,
  },
});

export default LoginScreen;
