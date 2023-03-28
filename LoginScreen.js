import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import * as Random from "expo-random";
import * as Crypto from "expo-crypto";

WebBrowser.maybeCompleteAuthSession();

const App = () => {
  React.useEffect(() => {
    console.log("TOKEN REACT ", token);
  }, [token]);

  React.useEffect(() => {
    if (response) {
      console.log("RESPONSE", response);
    }
    // ...
  }, [response]);

  const [token, setToken] = useState(null);

  const discovery = {
    authorizationEndpoint: "https://accounts.spotify.com/authorize",
    tokenEndpoint: "https://accounts.spotify.com/api/token",
  };

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: "14a44a5d38244f49be411a8dec546529",
      scopes: [
        "user-read-email",
        "playlist-modify-public",
        "user-library-read",
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
    console.log("DATA", data);
    setToken(data.access_token);
    console.log("TOKEN", token);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          promptAsync();
        }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Login with Spotify</Text>
      </TouchableOpacity>
      {token && (
        <View>
          <Text style={styles.tokenText}>Access Token:</Text>
          <Text style={styles.token}>{token}</Text>
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
