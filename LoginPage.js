import React, { useState } from "react";
import { SafeAreaView, Button, Text } from "react-native";
import { WebView } from "react-native-webview";
import { CLIENT_ID, REDIRECT_URI } from "./config";
import { encode } from "base-64";

const LoginPage = () => {
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [authCode, setAuthCode] = useState(null);
  const [username, setUsername] = useState("");

  const handleLoginPress = () => {
    setWebViewVisible(true);
  };

  // useEffect(() => {
  //   if (code) {
  //     fetch("https://api.spotify.com/v1/me", {
  //       headers: {
  //         Authorization: `Bearer ${code}`,
  //       },
  //     })
  //       .then((response) => response.json())
  //       .then((data) => setUsername(data.display_name));
  //   }
  // }, [code]);

  const handleWebViewNavigationStateChange = (navState) => {
    const url = navState.url;
    if (url.startsWith(REDIRECT_URI)) {
      const match = url.match(/\?code=([^&]*)/);
      const code = match ? match[1] : null;
      setAuthCode(code);
      setWebViewVisible(false);
      console.log("CODE RECIEVED: " + code);

      // Do something with the authorization code, like exchange it for an access token
      fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${encode(
            `${CLIENT_ID}:edf1707c83b04e40958e5625b4864dee`
          )}`,
        },
        body: `grant_type=authorization_code&code=${authCode}&redirect_uri=${REDIRECT_URI}`,
      })
        .then((response) => response.json())
        .then((data) => console.log(data))
        .catch((error) => console.error(error));
    }
  };
  if (!authCode) {
    return (
      <SafeAreaView>
        <Button title="Log in with Spotify" onPress={handleLoginPress} />
        {webViewVisible && (
          <WebView
            source={{
              uri: `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=user-read-email`,
            }}
            onNavigationStateChange={handleWebViewNavigationStateChange}
          />
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView>
      <Text>Welcome {username}</Text>
    </SafeAreaView>
  );
};

export default LoginPage;
