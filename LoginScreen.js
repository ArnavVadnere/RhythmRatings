import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import * as Random from "expo-random";
import * as Crypto from "expo-crypto";
import HomePage from "./HomePage";

WebBrowser.maybeCompleteAuthSession();

const App = () => {
  React.useEffect(() => {}, [token]);

  React.useEffect(() => {
    if (response) {
    }
    // ...
  }, [response]);

  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);

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

    setTimeout(() => {
      refreshAccessToken();
    }, refreshTime);
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
    console.log("Refreshed DATA", data);
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
      ) : (
        <View>
          <HomePage token={token} refreshToken={refreshToken} />
        </View>
      )}
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

export default App;
