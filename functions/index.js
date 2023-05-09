const admin = require("firebase-admin");
const axios = require("axios");
const functions = require("firebase-functions");

admin.initializeApp();

exports.getFirebaseToken = functions.https.onRequest(async (req, res) => {
  console.log("INSIDE getFirebaseToken");
  try {
    const spotifyAccessToken = req.query.code;
    console.log("Spotify access token:", spotifyAccessToken);

    const spotifyProfileResponse = await axios({
      method: "get",
      url: "https://api.spotify.com/v1/me",
      headers: {
        Authorization: `Bearer ${spotifyAccessToken}`,
      },
    });

    const spotifyUserId = spotifyProfileResponse.data.id;
    console.log("Spotify user ID:", spotifyUserId);

    const firebaseToken = await admin.auth().createCustomToken(spotifyUserId);
    console.log("Firebase token:", firebaseToken);

    res.status(200).send({firebaseToken});
  } catch (error) {
    console.error(
        "Error in getFirebaseToken:",
        error.message,
        error.response && error.response.data,
    );
    if (error.response) {
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", error.response.headers);
      console.error("Error response data:", error.response.data);
    }
    res.status(500).send("Error fetching display name");
  }
});
