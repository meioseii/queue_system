import { StyleSheet, View, Pressable } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import {
  NavigationIndependentTree,
  useNavigation,
} from "@react-navigation/native";
import Home from "./Home";
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import Orders from "./Orders";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Menu from "./Menu";
import Profile from "./Profile";
import MenuItems from "./screens/MenuItems";
import { AppStackParamList } from "../app-types";
import CreateReservation from "./screens/CreateReservation";
import SuccessReservation from "./screens/SuccessReservation";
import ChangePassword from "./screens/ChangePassword";
import EditProfile from "./screens/EditProfile";
import QRScanner from "./QRScanner";
import CreateQueue from "./screens/CreateQueue";
import RunningBill from "./screens/RunningBill";
import RunningBillDetail from "./screens/RunningBillDetail";
import OrderHistory from "./screens/OrderHistory";
import OrderHistoryById from "./screens/OrderHistoryById";

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
          height: 65,
          position: "absolute",
          bottom: 20,
          paddingBottom: 10,
          paddingTop: 5,
        },
        tabBarItemStyle: {
          height: 55,
          paddingBottom: 5,
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
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          headerShown: false,
          title: "Reservation",
          tabBarLabelStyle: {
            fontFamily: "Poppins_400Regular",
            fontSize: 10,
            lineHeight: 14,
          },
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="calendar-clock"
              size={22}
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
            fontSize: 10,
            lineHeight: 14,
          },
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="fastfood" size={22} color={color} />
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
            fontSize: 10,
            lineHeight: 14,
          },
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="concierge-bell" size={22} color={color} />
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
            fontSize: 10,
            lineHeight: 14,
          },
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="manage-accounts" size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const Stack = createNativeStackNavigator();

type MenuItemsParams = {
  category: string;
};

export default function AppLayout() {
  type Navigation = NativeStackNavigationProp<AppStackParamList>;
  const navigation = useNavigation<Navigation>();
  return (
    <NavigationIndependentTree>
      <Stack.Navigator>
        <Stack.Screen
          name="Tabs"
          component={Tabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MenuItems"
          component={MenuItems}
          options={({ route }) => {
            const params = route.params as MenuItemsParams;
            return {
              title:
                params?.category
                  .toLowerCase()
                  .split("_")
                  .map(
                    (word: string) =>
                      word.charAt(0).toUpperCase() + word.slice(1)
                  )
                  .join(" ") || "Menu Items",
              headerShown: true,
              headerStyle: {
                backgroundColor: "#FF9500",
              },
              headerTitleStyle: {
                fontFamily: "Poppins_400Regular",
                fontSize: 16,
                color: "#FFF",
              },
              headerTintColor: "#FFF",
            };
          }}
        />
        <Stack.Screen
          name="ChangePassword"
          component={ChangePassword}
          options={{
            title: "Change Password",
            headerShown: true,
            headerStyle: {
              backgroundColor: "#FF9500",
            },
            headerTitleStyle: {
              fontFamily: "Poppins_400Regular",
              fontSize: 16,
              color: "#FFF",
            },
            headerTintColor: "#FFF",
          }}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfile}
          options={{
            title: "Edit Profile",
            headerShown: true,
            headerStyle: {
              backgroundColor: "#FF9500",
            },
            headerTitleStyle: {
              fontFamily: "Poppins_400Regular",
              fontSize: 16,
              color: "#FFF",
            },
            headerTintColor: "#FFF",
          }}
        />
        <Stack.Screen
          name="SuccessReservation"
          component={SuccessReservation}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateReservation"
          component={CreateReservation}
          options={{
            title: "Create Reservation",
            headerShown: true,
            headerStyle: {
              backgroundColor: "#FF9500",
            },
            headerTitleStyle: {
              fontFamily: "Poppins_400Regular",
              fontSize: 16,
              color: "#FFF",
            },
            headerTintColor: "#FFF",
          }}
        />
        <Stack.Screen
          name="QRScanner"
          component={QRScanner}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateQueue"
          component={CreateQueue}
          options={{
            title: "Start Queue",
            headerShown: true,
            headerStyle: {
              backgroundColor: "#FF9500",
            },
            headerTitleStyle: {
              fontFamily: "Poppins_400Regular",
              fontSize: 16,
              color: "#FFF",
            },
            headerTintColor: "#FFF",
          }}
        />
        <Stack.Screen
          name="RunningBill"
          component={RunningBill}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RunningBillDetail"
          component={RunningBillDetail}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OrderHistory"
          component={OrderHistory}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OrderHistoryById"
          component={OrderHistoryById}
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
