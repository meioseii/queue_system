import {
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  Pressable,
} from "react-native";
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
        tabBarActiveBackgroundColor: "#FF9500",
        tabBarActiveTintColor: "#FF9500",
        tabBarStyle: {
          borderTopEndRadius: 15,
          borderTopStartRadius: 15,
          borderBottomEndRadius: 15,
          borderBottomStartRadius: 15,
          marginHorizontal: 15,
          height: 50,
          position: "absolute",
          bottom: 20,
        },
        tabBarButton: (props) => (
          <View
            style={{
              flex: 1,
              borderRadius: 15,
              overflow: "hidden",
              marginHorizontal: 2,
            }}
          >
            <Pressable
              {...props}
              android_ripple={{
                color: "transparent",
                borderless: false,
                radius: 1,
              }}
              style={({ pressed }) => [
                {
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            />
          </View>
        ),
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
            fontSize: 8,
          },
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="calendar-clock"
              size={18}
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
            fontSize: 8,
          },
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="fastfood" size={18} color={color} />
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
            fontSize: 8,
          },
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="concierge-bell" size={18} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          headerShown: false,
          title: "Account",
          tabBarLabelStyle: {
            fontFamily: "Poppins_400Regular",
            fontSize: 8,
          },
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="manage-accounts" size={18} color={color} />
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
