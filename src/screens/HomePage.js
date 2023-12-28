import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
} from "react-native";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const HomePage = ({ token, refreshToken }) => {
  const [topTracks, setTopTracks] = useState([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [topArtists, setTopArtists] = useState([]);
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const db = getFirestore();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setDisplayName(user.displayName);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchAndSetCurrentlyPlayingSong();
  }, [token]);

  useEffect(() => {
    let unsubscribe;

    const fetchTopArtists = async () => {
      const response = await fetch(
        "https://api.spotify.com/v1/me/top/artists",
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
      return data.items;
    };

    const fetchTopTracks = async () => {
      const response = await fetch("https://api.spotify.com/v1/me/top/tracks", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setTopTracks(data.items);
      return data.items;
    };

    const auth = getAuth();
    if (token) {
      unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          console.log("User is signed in");
          setIsLoading(false);
          fetchTopTracks().then((tracks) => {
            saveTopTracks(tracks, user.uid);
          });
          fetchTopArtists().then((artists) => {
            saveTopArtists(artists, user.uid);
          });
        } else {
          console.error("User is not signed in", user);
        }
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [token]);

  useEffect(() => {
    if (token) {
      const intervalId = setInterval(() => {
        fetchAndSetCurrentlyPlayingSong();
      }, 5000);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [token]);

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

  const saveTopTracks = async (tracks, uid) => {
    try {
      const docRef = doc(db, "topTracks", uid);
      await setDoc(docRef, { tracks });
    } catch (error) {
      console.error("Error writing document: ", error);
    }
  };

  const saveTopArtists = async (artists, uid) => {
    try {
      const docRef = doc(db, "topArtists", uid);
      await setDoc(docRef, { artists });
    } catch (error) {
      console.error("Error writing document: ", error);
    }
  };

  const fetchAndSetCurrentlyPlayingSong = async () => {
    const songData = await fetchCurrentlyPlayingSong(token);
    setCurrentlyPlaying(songData);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

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
    // paddingLeft: 15,
    paddingRight: 15,
    width: "100%",
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
    marginTop: 15, // Add marginTop to create space from the top of the container
    marginBottom: 15, // Add marginBottom to create space from the next element
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HomePage;
