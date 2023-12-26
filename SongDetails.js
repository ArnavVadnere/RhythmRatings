import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import * as Progress from "react-native-progress";

const SongDetails = ({ route, navigation }) => {
  // This is mock data. Replace it with your actual song data.
  const { song, token } = route.params;
  const [audioFeatures, setAudioFeatures] = useState(null);
  const [audioAnalysis, setAudioAnalysis] = useState(null);
  const [trackData, setTrackData] = useState(null);
  const [artistData, setArtistData] = useState({});

  useEffect(() => {
    fetchAudioFeatures();
    fetchTrackAnaylsis();
    fetchTrackData();
  }, []);

  const fetchTrackData = async () => {
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/tracks/${song.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTrackData(data);
      } else {
        console.error(
          "Response not ok",
          response.status,
          await response.text()
        );
        throw new Error(`Error fetching track data: ${response.status}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchArtistData = async (artistId) => {
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/artists/${artistId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setArtistData((prev) => ({ ...prev, [artistId]: data }));
    } catch (error) {
      console.error("Error fetching artist data", error);
    }
  };

  useEffect(() => {
    if (trackData && trackData.artists) {
      trackData.artists.forEach((artist) => {
        fetchArtistData(artist.id);
      });
    }
  }, [trackData]);

  const fetchAudioFeatures = async () => {
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/audio-features/${song.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAudioFeatures(data);
      } else {
        console.error(
          "Response not ok",
          response.status,
          await response.text()
        );
        throw new Error(`Error fetching audio features: ${response.status}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTrackAnaylsis = async () => {
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/audio-analysis/${song.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAudioAnalysis(data);
      } else {
        console.error(
          "Response not ok",
          response.status,
          await response.text()
        );
        throw new Error(`Error fetching audio analysis: ${response.status}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  };

  const FeatureBar = ({ label, value }) => {
    return (
      <View style={styles.featureContainer}>
        <Text style={styles.featureLabel}>{label}</Text>
        <Progress.Bar
          progress={value}
          width={null}
          style={styles.progressBar}
          color="#1DB954"
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Image
          source={{ uri: song.album?.images[0]?.url }}
          style={styles.albumImage}
        />
        <Text style={styles.songTitle}>{song.name}</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.artistsScrollView}
        >
          {song.artists &&
            song.artists.length > 0 &&
            song.artists.map((artist, index) => (
              <View key={artist.id} style={styles.artistContainer}>
                <Image
                  source={{
                    uri:
                      artistData[artist.id]?.images[0]?.url ||
                      "default_image_url_here",
                  }}
                  style={styles.artistImageRect}
                />
                <Text style={styles.artistName}>{artist.name}</Text>
              </View>
            ))}
        </ScrollView>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Audio Features</Text>
          <FeatureBar
            label="Acousticness"
            value={audioFeatures?.acousticness || 0}
          />

          <FeatureBar
            label="Danceability"
            value={audioFeatures?.danceability || 0}
          />
          <FeatureBar label="Energy" value={audioFeatures?.energy || 0} />
          <FeatureBar
            label="Instrumentalness"
            value={audioFeatures?.instrumentalness || 0}
          />
          <FeatureBar label="Liveness" value={audioFeatures?.liveness || 0} />
          <FeatureBar label="Valence" value={audioFeatures?.valence || 0} />
          <FeatureBar
            label="Speechiness"
            value={audioFeatures?.speechiness || 0}
          />
        </View>

        <View style={styles.analysisContainer}>
          <Text style={styles.analysisTitle}>Audio Analysis</Text>
          <Text style={styles.analysisItem}>
            Tempo: {audioAnalysis?.track.tempo || "N/A"} BPM
          </Text>
          <Text style={styles.analysisItem}>
            Key: {audioAnalysis?.track.key || "N/A"}
          </Text>
          <Text style={styles.analysisItem}>
            Duration: {formatDuration(song.duration_ms)}
          </Text>
          <Text style={styles.analysisItem}>Popularity: {song.popularity}</Text>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // backgroundColor: "",
  },
  scrollViewContent: {
    padding: 16,
    alignItems: "center",
  },
  albumImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginVertical: 20,
  },
  songTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  artistsScrollView: {
    flexDirection: "row",
    marginTop: 20,
    marginBottom: 20,
  },
  artistContainer: {
    alignItems: "center",
    marginRight: 15, // Add spacing between artist images
  },
  artistImageRect: {
    width: 80, // Adjust size as needed
    height: 80, // Adjust size as needed
  },
  artistName: {
    fontSize: 14,
    marginTop: 5,
    textAlign: "center",
    maxWidth: 80, // Ensure text does not expand beyond image width
  },
  featuresContainer: {
    width: "100%",
    marginTop: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  featureContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  featureLabel: {
    fontSize: 16,
    flex: 1,
  },
  progressBar: {
    flex: 2,
    height: 7,
    borderRadius: 5,
  },
  analysisContainer: {
    width: "100%",
    marginTop: 20,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  analysisItem: {
    fontSize: 16,
    marginBottom: 5,
  },
  backButton: {
    backgroundColor: "#1DB954",
    padding: 10,
    borderRadius: 20,
    alignSelf: "center",
    marginTop: 20,
  },
  backButtonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default SongDetails;
