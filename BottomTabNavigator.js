import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import HomePage from "./HomePage";
import ProfileScreen from "./ProfileScreen";
import MusicInsights from "./MusicInsights";
import FriendsPage from "./FriendsPage";

const Tab = createBottomTabNavigator();

const BottomTabNavigator = ({ route }) => {
  const { token, refreshToken } = route.params;

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
          headerShown: false,
        }}
      >
        {(props) => (
          <HomePage {...props} token={token} refreshToken={refreshToken} />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Profile"
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
          headerShown: false,
        }}
      >
        {(props) => (
          <ProfileScreen {...props} token={token} refreshToken={refreshToken} />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="MusicInsights"
        options={{
          tabBarLabel: "Music Insights",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="music" color={color} size={size} />
          ),
          headerShown: false,
        }}
      >
        {(props) => (
          <MusicInsights {...props} token={token} refreshToken={refreshToken} />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Friends"
        component={FriendsPage}
        options={{
          tabBarLabel: "Friends",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-multiple"
              color={color}
              size={size}
            />
          ),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
