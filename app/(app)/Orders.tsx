import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { TextInput, Button, Text } from "react-native-paper";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../app-types";
import { useAuthStore } from "../store/auth-store";

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export default function Orders() {
  type Navigation = NativeStackNavigationProp<AppStackParamList, "Login">;
  const navigation = useNavigation<Navigation>();
  const { logout } = useAuthStore();

  const [loaded, error] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  const onLogout = () => {
    logout();
  };

  return (
    <View>
      <StatusBar hidden={true}></StatusBar>
      <TouchableOpacity onPress={() => onLogout()}>
        <Text>Orders</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: "#FAF9F6",
  },
  iconContainer: {
    backgroundColor: "#FAF9F6",
    height: "40%",
    padding: "10%",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: 120,
    height: 120,
  },
  iconText: {
    color: "#FF9500",
    fontSize: 30,
    fontFamily: "Poppins_700Bold",
  },
  checkMessage: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    bottom: 50,
  },
  successMessage: {
    fontFamily: "Poppins_400Regular",
    letterSpacing: 0,
    bottom: 10,
  },
});
