import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
} from "react-native";

const HomePage = (props) => {
  const { token, refreshToken } = props;
  const [topTracks, setTopTracks] = useState([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [topArtists, setTopArtists] = useState([]);
  const [displayName, setDisplayName] = useState("");

  console.log("IM INSIDE THE HOMEPAGE");
  const fetchAndSetCurrentlyPlayingSong = async () => {
    const songData = await fetchCurrentlyPlayingSong(token);
    setCurrentlyPlaying(songData);
  };

  useEffect(() => {
    if (token) {
      fetchTopArtists();
      fetchDisplayName();
    }
  }, [token]);

  const fetchDisplayName = async () => {
    const response = await fetch("https://api.spotify.com/v1/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    setDisplayName(data.display_name);
  };

  const fetchTopArtists = async () => {
    const response = await fetch(
      "https://api.spotify.com/v1/me/top/artists?limit=3",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    setTopArtists(data.items);
  };

  useEffect(() => {
    fetchAndSetCurrentlyPlayingSong();
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchTopTracks();
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      const intervalId = setInterval(() => {
        fetchAndSetCurrentlyPlayingSong();
      }, 5000); // 5000ms (5 seconds) interval to update the song information

      // Cleanup function to clear the interval when the component is unmounted
      return () => {
        clearInterval(intervalId);
      };
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
    // console.log("Top Tracks", data);
    setTopTracks(data.items);
  };

  const fetchCurrentlyPlayingSong = async (accessToken) => {
    const response = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();
    return data;
  };

  return (
    <ScrollView>
      <SafeAreaView style={styles.container}>
        <Text style={styles.welcomeText}>Welcome, {displayName}!</Text>
        {currentlyPlaying &&
          currentlyPlaying.item &&
          currentlyPlaying.item.album && (
            <View style={styles.currentlyPlaying}>
              <Text style={styles.currentlyPlayingTitle}>Now Playing:</Text>
              <Image
                source={{ uri: currentlyPlaying.item.album.images[0].url }}
                style={styles.trackImage}
                resizeMode="cover"
              />
              <Text style={styles.songTitle}>{currentlyPlaying.item.name}</Text>
              <Text style={styles.artistName}>
                {currentlyPlaying.item.artists
                  .map((artist) => artist.name)
                  .join(", ")}
              </Text>
            </View>
          )}
        <View style={styles.topContent}>
          {/* View for top 3 songs */}
          <View style={styles.tracksView}>
            <Text style={styles.subtitle}>Top Tracks:</Text>
            <ScrollView horizontal={true}>
              {topTracks.slice(0, 3).map((track, index) => (
                <View key={track.id} style={styles.trackContainer}>
                  <View style={styles.textContainer}>
                    <Text
                      style={styles.trackName}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {index + 1}. {track.name}
                    </Text>
                    <Text
                      style={styles.trackArtist}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {track.artists.map((artist) => artist.name).join(", ")}
                    </Text>
                  </View>
                  <Image
                    source={{ uri: track.album.images[0].url }}
                    style={styles.trackImage}
                  />
                </View>
              ))}
            </ScrollView>
          </View>

          {/* View for top 3 artists */}
          <View style={styles.artistsView}>
            <Text style={styles.subtitle}>Top Artists:</Text>
            <ScrollView horizontal={true}>
              {topArtists.slice(0, 3).map((artist, index) => (
                <View key={artist.id} style={styles.artistContainer}>
                  <View style={styles.textContainer}>
                    <Text
                      style={styles.artistName}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {index + 1}. {artist.name}
                    </Text>
                  </View>
                  <Image
                    source={{ uri: artist.images[0]?.url }}
                    style={styles.artistImage}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
      {/* <CustomBottomNavBar /> */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  topContent: {
    marginTop: 20,
    paddingLeft: 15,
    paddingRight: 15,
    width: "100%",

    borderWidth: 1,
    borderColor: "black",
    borderStyle: "dashed",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  trackContainer: {
    flex: 1,
    marginBottom: 10,
    alignItems: "center",
    marginRight: 20, // Add marginRight to space out track containers
  },
  artistContainer: {
    flex: 1,
    marginBottom: 10,
    alignItems: "center",
    marginRight: 20, // Add marginRight to space out artist containers
  },
  trackName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  trackArtist: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  trackImage: {
    width: 120, // Increase width
    height: 120, // Increase height
    borderRadius: 4,
    marginTop: 8,
  },
  artistName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  artistImage: {
    width: 120, // Increase width
    height: 120, // Increase height
    borderRadius: 4,
    marginTop: 8,
  },

  tracksView: {
    marginBottom: 20,
  },
  artistsView: {
    marginBottom: 20,
  },
  textContainer: {
    width: 100,
    marginBottom: 8,
  },
  currentlyPlaying: {
    alignItems: "center",
    marginTop: 30, // Add marginTop to create space between the "Welcome" text and the "Now Playing" section
    marginBottom: 10, // Add marginBottom to create space between the elements
  },

  currentlyPlayingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10, // Add marginBottom to create space between the title and the content
  },

  songTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center", // Add this to center the text
  },
  artistName: {
    fontSize: 14,
    color: "#666",
    textAlign: "center", // Add this to center the text
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    position: "absolute",
    top: 30,
    left: 0,
    right: 0,
    marginTop: 20,
  },
});

export default HomePage;
