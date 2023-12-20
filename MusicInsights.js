import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";

const ModeButton = ({ title, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.modeButton, active ? styles.modeButtonActive : {}]}
  >
    <Text
      style={[styles.modeButtonText, active ? styles.modeButtonTextActive : {}]}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

const MusicInsights = (props) => {
  const { token, navigation } = props; // Destructure navigation from props
  const [data, setData] = useState([]);
  const [mode, setMode] = useState("tracks"); // 'tracks' or 'artists'
  const [timeRange, setTimeRange] = useState("medium_term"); // 'short_term', 'medium_term', 'long_term'

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, mode, timeRange]);

  const fetchData = async () => {
    const endpoint = mode === "tracks" ? "top/tracks" : "top/artists";
    const response = await fetch(
      `https://api.spotify.com/v1/me/${endpoint}?time_range=${timeRange}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    setData(data.items);
  };

  const renderData = () => {
    return data.map((item, index) => (
      <TouchableOpacity
        key={item.id}
        style={styles.card}
        onPress={() => onSongPress(item)}
      >
        <Image
          source={{
            uri:
              mode === "tracks" &&
              item.album &&
              item.album.images &&
              item.album.images.length > 0
                ? item.album.images[0].url
                : mode === "artists" && item.images && item.images.length > 0
                ? item.images[0].url
                : "default_image_url_here", // replace with your default image URL
          }}
          style={styles.albumArt}
        />
        <View style={styles.infoContainer}>
          <Text style={styles.trackName}>{item.name}</Text>
          {mode === "tracks" && item.artists && (
            <Text style={styles.artistName}>
              {item.artists.map((artist) => artist.name).join(", ")}
            </Text>
          )}
          <Text style={styles.index}>{index + 1}</Text>
        </View>
      </TouchableOpacity>
    ));
  };

  const onSongPress = (song) => {
    navigation.navigate("SongDetails", { song });
  };

  const TimeRangeButton = ({ title, active, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.timeRangeButton,
        active ? styles.timeRangeButtonActive : {},
      ]}
    >
      <Text
        style={[
          styles.timeRangeButtonText,
          active ? styles.timeRangeButtonTextActive : {},
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderModeButtons = () => {
    return (
      <View style={styles.modeButtonContainer}>
        <ModeButton
          title="Top Tracks"
          active={mode === "tracks"}
          onPress={() => setMode("tracks")}
        />
        <ModeButton
          title="Top Artists"
          active={mode === "artists"}
          onPress={() => setMode("artists")}
        />
      </View>
    );
  };

  const renderTimeRangeButtons = () => {
    return (
      <View style={styles.timeRangeButtonContainer}>
        <TimeRangeButton
          title="Last 4 weeks"
          active={timeRange === "short_term"}
          onPress={() => setTimeRange("short_term")}
        />
        <TimeRangeButton
          title="Last 6 months"
          active={timeRange === "medium_term"}
          onPress={() => setTimeRange("medium_term")}
        />
        <TimeRangeButton
          title="All time"
          active={timeRange === "long_term"}
          onPress={() => setTimeRange("long_term")}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Music Insights</Text>
      </View>
      {renderModeButtons()}
      {renderTimeRangeButtons()}
      <ScrollView style={styles.scrollView}>{renderData()}</ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerContainer: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E2E2E",
    textAlign: "center",
  },
  modeButtonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  modeButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: "#EAEAEA",
    borderRadius: 20,
    marginHorizontal: 5,
  },
  modeButtonActive: {
    backgroundColor: "#5C5C5C",
  },
  modeButtonText: {
    fontSize: 16,
    color: "#2E2E2E",
  },
  modeButtonTextActive: {
    color: "#FFFFFF",
  },
  timeRangeButtonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  timeRangeButton: {
    padding: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    marginHorizontal: 5,
  },
  timeRangeButtonActive: {
    backgroundColor: "#000",
  },
  timeRangeButtonText: {
    color: "#000",
  },
  timeRangeButtonTextActive: {
    color: "#fff",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // for Android
  },
  albumArt: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  trackName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  artistName: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  index: {
    fontSize: 12,
    color: "#999",
    position: "absolute",
    right: 16,
    top: 16,
  },
  scrollView: {
    marginBottom: 10,
  },
});

export default MusicInsights;
