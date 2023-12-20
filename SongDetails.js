import React from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
} from "react-native";

const SongDetails = ({ route, navigation }) => {
  const item = route.params?.song; // Use optional chaining
  const isSong = item?.album ? true : false; // Use optional chaining

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: isSong ? item?.album?.images[0]?.url : item?.images[0]?.url,
            }}
            style={styles.image}
          />
        </View>
        <Text style={styles.title}>{item?.name}</Text>
        {isSong ? (
          <View style={styles.statsContainer}>
            <Text style={styles.detail}>Album: {item?.album?.name}</Text>
            <Text style={styles.detail}>
              Artists: {item?.artists?.map((artist) => artist.name).join(", ")}
            </Text>
            <Text style={styles.detail}>
              Release Date: {item?.album?.release_date}
            </Text>
            <Text style={styles.detail}>
              Total Tracks: {item?.album?.total_tracks}
            </Text>
          </View>
        ) : (
          <View style={styles.statsContainer}>
            <Text style={styles.detail}>
              Genres: {item?.genres?.join(", ")}
            </Text>
            <Text style={styles.detail}>Popularity: {item?.popularity}</Text>
            {/* You can add more artist-specific details if available */}
          </View>
        )}
        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
          color="#1DB954"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollViewContent: {
    padding: 20,
    alignItems: "center",
  },
  imageContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  statsContainer: {
    width: "100%",
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  detail: {
    fontSize: 18,
    marginBottom: 5,
    color: "#333",
  },
  // Add additional styles for your song stats
});

export default SongDetails;
