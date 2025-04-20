import { StyleSheet, View, TouchableWithoutFeedback } from "react-native";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import {
  NavigationContainer,
  NavigationIndependentTree,
} from "@react-navigation/native";
import Home from "./Home";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Orders from "./Orders";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Menu from "./Menu";
import Profile from "./Profile";

const Tab = createBottomTabNavigator();

export function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#FAF9F6",
        tabBarInactiveTintColor: "#FFFFFF",
        tabBarStyle: {
          backgroundColor: "#FF9500",
          borderColor: "transparent",
          borderTopEndRadius: 20,
          borderTopStartRadius: 20,
          borderRadius: 0,
        },
        freezeOnBlur: true,
      }}
      backBehavior="history"
      detachInactiveScreens={false}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          headerShown: false,
          title: "Reservation",
          tabBarLabelStyle: {
            fontFamily: "Poppins_400Regular",
          },
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="calendar-clock"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Menu"
        component={Menu}
        options={{
          headerShown: false,
          title: "Menu",
          tabBarLabelStyle: {
            fontFamily: "Poppins_400Regular",
          },
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="fastfood" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={Orders}
        options={{
          headerShown: false,
          title: "Orders",
          tabBarLabelStyle: {
            fontFamily: "Poppins_400Regular",
          },
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="concierge-bell" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          headerShown: false,
          title: "Profile",
          tabBarLabelStyle: {
            fontFamily: "Poppins_400Regular",
          },
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="manage-accounts" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const Stack = createNativeStackNavigator();

export default function AppLayout() {
  return (
    <NavigationIndependentTree>
      <Stack.Navigator>
        <Stack.Screen
          name="Tabs"
          component={Tabs}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationIndependentTree>
  );
}

const styles = StyleSheet.create({
  absoluteFill: {
    backgroundColor: "#00563B",
  },
});
