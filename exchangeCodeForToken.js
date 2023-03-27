import axios from "axios";
import { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } from "./config";

const exchangeCodeForToken = async (code) => {
  const params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", REDIRECT_URI);
  const auth = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      params,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token } = response.data;
    // Do something with the access token
  } catch (error) {
    console.error(error);
  }
};
