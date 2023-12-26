import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  Button,
  TouchableOpacity,
} from "react-native";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const ProfileScreen = ({ token, refreshToken, navigation }) => {
  const [user, setUser] = useState(null);
  const [recentTracks, setRecentTracks] = useState([]);
  const [displayLimit, setDisplayLimit] = useState(3);
  const [mostPlayedGenre, setMostPlayedGenre] = useState("");
  const [averageListeningTime, setAverageListeningTime] = useState(0);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [topUserPlaylists, setTopUserPlaylists] = useState([]);
  const [playlistDisplayLimit, setPlaylistDisplayLimit] = useState(3);
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchRecentTracks();
        fetchTopTracksOrArtists();
        fetchAverageListeningTime();
        fetchUserPlaylists();
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userPlaylists.length > 0 && recentTracks.length > 0) {
      const topPlaylists = findTopPlaylists(userPlaylists, recentTracks);
      setTopUserPlaylists(topPlaylists);
    }
  }, [userPlaylists, recentTracks]);

  const onSongPress = (item) => {
    navigation.navigate("SongDetails", { song: item, token });
  };

  const handleShowMore = () => {
    setDisplayLimit(recentTracks.length); // show all tracks
  };

  const handleShowLess = () => {
    setDisplayLimit(3); // show only 3 tracks
  };

  const handlePlaylistShowMore = () => {
    setPlaylistDisplayLimit(topUserPlaylists.length); // Show all playlists
  };

  const handlePlaylistShowLess = () => {
    setPlaylistDisplayLimit(3); // Show only 3 playlists
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

        const earliestPlayTime = new Date(
          data.items[data.items.length - 1].played_at
        );
        const latestPlayTime = new Date(data.items[0].played_at);
        const daysCovered =
          (latestPlayTime - earliestPlayTime) / (1000 * 60 * 60 * 24);

        const averageTime = totalDuration / (daysCovered || 1) / 1000 / 60; // Convert to minutes
        setAverageListeningTime(averageTime);
      }
    } catch (error) {
      console.error("Error fetching average listening time:", error);
    }
  };

  const fetchUserPlaylists = async () => {
    try {
      const response = await fetch("https://api.spotify.com/v1/me/playlists", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setUserPlaylists(data.items);
      } else {
        console.error("Failed to fetch playlists:", data.error);
      }
    } catch (error) {
      console.error("Error fetching user playlists:", error);
    }
  };

  const findTopPlaylists = (userPlaylists, recentTracks) => {
    let countsMap = {};

    const playlistIdsFromRecentTracks = recentTracks.map(
      (track) => track.context?.uri.split(":")[2]
    );

    // Initialize countsmap
    userPlaylists.forEach((playlist) => {
      countsMap[playlist.id] = 0;
    });

    playlistIdsFromRecentTracks.forEach((id) => {
      if (countsMap[id] !== undefined) {
        countsMap[id]++;
      }
    });

    //sort playlists in amount listened too
    let topPlaylists = Object.keys(countsMap)
      .sort((a, b) => countsMap[b] - countsMap[a])
      .slice(0, playlistIdsFromRecentTracks.length)
      .map((playlistId) =>
        userPlaylists.find((playlist) => playlist.id === playlistId)
      );

    return topPlaylists;
  };

  return (
    <ScrollView style={styles.container}>
      <SafeAreaView>
        <View style={styles.profileHeader}>
          <Image source={{ uri: user?.photoURL }} style={styles.profileImage} />
          <Text style={styles.profileName}>{user?.displayName}</Text>
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
        </View>

        <View style={styles.musicSection}>
          <Text style={styles.sectionTitle}>Recently Played</Text>
          {recentTracks.slice(0, displayLimit).map((track, index) => (
            <TouchableOpacity
              key={index}
              style={styles.trackItem}
              onPress={() => onSongPress(track.track)}
            >
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
            </TouchableOpacity>
          ))}
          {recentTracks.length > 3 && displayLimit < recentTracks.length && (
            <Button title="Show More" onPress={handleShowMore} />
          )}
          {displayLimit === recentTracks.length && (
            <Button title="Hide" onPress={handleShowLess} />
          )}
        </View>

        <View style={styles.musicSection}>
          <Text style={styles.sectionTitle}>Favorite Playlists</Text>
          {topUserPlaylists
            .slice(0, playlistDisplayLimit)
            .map((playlist, index) => (
              <View key={index} style={styles.playlistItem}>
                <Image
                  source={{ uri: playlist.images[0].url }}
                  style={styles.playlistImage}
                />
                <View style={styles.playlistInfo}>
                  <Text style={styles.playlistName}>{playlist.name}</Text>
                </View>
              </View>
            ))}
          {topUserPlaylists.length > 3 &&
            playlistDisplayLimit < topUserPlaylists.length && (
              <Button title="Show More" onPress={handlePlaylistShowMore} />
            )}
          {playlistDisplayLimit === topUserPlaylists.length && (
            <Button title="Show Less" onPress={handlePlaylistShowLess} />
          )}
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
    width: "100%",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statData: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4A90E2",
  },
  statDescription: {
    fontSize: 16,
    alignItems: "center",
  },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  playlistImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  playlistInfo: {
    marginLeft: 10,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfileScreen;
