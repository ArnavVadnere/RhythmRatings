// MainStackNavigator.js
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./LoginScreen";
import BottomTabNavigator from "./BottomTabNavigator";
import FriendProfile from "./FriendProfile";

const Stack = createStackNavigator();

const MainStackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BottomTabs"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="FriendProfile" component={FriendProfile} />
    </Stack.Navigator>
  );
};

export default MainStackNavigator;
