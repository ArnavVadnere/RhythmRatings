// BottomTabNavigator.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomePage from "./HomePage";
import ProfileScreen from "./ProfileScreen";
import TopTracks from "./TopTracks";

const Tab = createBottomTabNavigator();

const BottomTabNavigator = ({ route }) => {
  const { token, refreshToken } = route.params;
  console.log("token in bt", token);

  return (
    <Tab.Navigator>
      <Tab.Screen name="Home">
        {(props) => (
          <HomePage {...props} token={token} refreshToken={refreshToken} />
        )}
      </Tab.Screen>

      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="TopTracks">
        {(props) => (
          <TopTracks {...props} token={token} refreshToken={refreshToken} />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
