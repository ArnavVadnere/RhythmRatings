// HomePage.js
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";

const HomePage = (props) => {
  const { token, refreshToken } = props;
  const [topTracks, setTopTracks] = useState([]);

  useEffect(() => {
    if (token) {
      fetchTopTracks();
    }
  }, [token]);

  const fetchTopTracks = async () => {
    const response = await fetch("https://api.spotify.com/v1/me/top/tracks", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("Top Tracks", data);
    setTopTracks(data.items);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Home Page</Text>
      <Text style={styles.subtitle}>Top Tracks:</Text>
      <ScrollView>
        {topTracks.map((track, index) => (
          <View key={track.id} style={styles.trackContainer}>
            <Text style={styles.trackName}>
              {index + 1}. {track.name}
            </Text>
            <Text style={styles.trackArtist}>
              {track.artists.map((artist) => artist.name).join(", ")}
            </Text>
            <Image
              source={{ uri: track.album.images[0].url }}
              style={styles.trackImage}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  trackContainer: {
    marginBottom: 16,
  },
  trackName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  trackArtist: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  trackImage: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
  },
});

export default HomePage;
