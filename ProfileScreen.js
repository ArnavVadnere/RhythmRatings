import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  Button,
} from "react-native";
import { getAuth, onAuthStateChanged } from "firebase/auth";
// Additional imports may be required for fetching music data and user info

const ProfileScreen = ({ token, refreshToken }) => {
  const [user, setUser] = useState(null);
  const [recentTracks, setRecentTracks] = useState([]);
  const [displayLimit, setDisplayLimit] = useState(3); // State to control display limit
  const [mostPlayedGenre, setMostPlayedGenre] = useState("");
  const [averageListeningTime, setAverageListeningTime] = useState(0);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchRecentTracks();
        fetchTopTracksOrArtists();
        fetchAverageListeningTime();
      }
    });

    return () => unsubscribe();
  }, []);

  const handleShowMore = () => {
    setDisplayLimit(recentTracks.length); // Update the display limit to show all tracks
  };

  const handleShowLess = () => {
    setDisplayLimit(3); // Revert to showing only 3 tracks
  };

  const fetchRecentTracks = async () => {
    try {
      const response = await fetch(
        "https://api.spotify.com/v1/me/player/recently-played",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setRecentTracks(data.items);
        return data.items;
      } else {
        // Handle errors, e.g., invalid token, no internet connection
        console.error("Error fetching recent tracks:", data);
      }
    } catch (error) {
      console.error("Error in fetchRecentTracks:", error);
    }
  };

  const fetchTopTracksOrArtists = async () => {
    try {
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
      if (response.ok) {
        const genres = {};
        data.items.forEach((artist) => {
          artist.genres.forEach((genre) => {
            genres[genre] = (genres[genre] || 0) + 1;
          });
        });
        console.log("genre", genres);
        setMostPlayedGenre(
          Object.keys(genres).reduce((a, b) => (genres[a] > genres[b] ? a : b))
        );
      }
    } catch (error) {
      console.error("Error fetching top artists/genres:", error);
    }
  };

  const fetchAverageListeningTime = async () => {
    try {
      const response = await fetch(
        "https://api.spotify.com/v1/me/player/recently-played?limit=50",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        const totalDuration = data.items.reduce(
          (acc, cur) => acc + cur.track.duration_ms,
          0
        );

        // Finding the time span of these tracks
        const earliestPlayTime = new Date(
          data.items[data.items.length - 1].played_at
        );
        const latestPlayTime = new Date(data.items[0].played_at);
        const daysCovered =
          (latestPlayTime - earliestPlayTime) / (1000 * 60 * 60 * 24);
        console.log("DAYS COVERED", daysCovered);

        const averageTime = totalDuration / (daysCovered || 1) / 1000 / 60; // Convert to minutes
        setAverageListeningTime(averageTime);
      }
    } catch (error) {
      console.error("Error fetching average listening time:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <SafeAreaView>
        <View style={styles.profileHeader}>
          <Image source={{ uri: user?.photoURL }} style={styles.profileImage} />
          <Text style={styles.profileName}>{user?.displayName}</Text>
          {/* Include additional user info like followers/following count, bio, etc. */}
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.statTitle}>Musical Stats</Text>

          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statData}>{mostPlayedGenre}</Text>
              <Text style={styles.statDescription}>Most Played Genre</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statData}>
                {averageListeningTime.toFixed(2)} minutes
              </Text>
              <Text style={styles.statDescription}>
                Average Daily Listening Time
              </Text>
            </View>
          </View>

          {/* ... rest of your JSX */}
        </View>

        <View style={styles.musicSection}>
          <Text style={styles.sectionTitle}>Recently Played</Text>
          {recentTracks.slice(0, displayLimit).map((track, index) => (
            <View key={index} style={styles.trackItem}>
              <Image
                source={{ uri: track.track.album.images[0].url }}
                style={styles.albumArt}
              />
              <View style={styles.trackInfo}>
                <Text style={styles.trackName}>{track.track.name}</Text>
                <Text style={styles.artistName}>
                  {track.track.artists.map((artist) => artist.name).join(", ")}
                </Text>
              </View>
            </View>
          ))}
          {recentTracks.length > 3 && displayLimit < recentTracks.length && (
            <Button title="Show More" onPress={handleShowMore} />
          )}
          {displayLimit === recentTracks.length && (
            <Button title="Hide" onPress={handleShowLess} />
          )}
        </View>
        {/* Repeat for other sections like top artists, playlists, etc. */}

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {/* Include settings options */}
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  musicSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  settingsSection: {
    padding: 20,
  },
  trackItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  albumArt: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  trackInfo: {
    marginLeft: 10,
  },
  trackName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  artistName: {
    fontSize: 14,
    color: "gray",
  },
  statsSection: {
    padding: 20,
    alignItems: "center",
  },
  statTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%", // Adjust as per your layout
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statData: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4A90E2", // Example color, adjust as needed
  },
  statDescription: {
    fontSize: 16,
  },
  // Add more styles as needed
});

export default ProfileScreen;
