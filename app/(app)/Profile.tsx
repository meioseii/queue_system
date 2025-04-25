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
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export default function Profile() {
  type Navigation = NativeStackNavigationProp<AppStackParamList, "Profile">;
  const navigation = useNavigation<Navigation>();
  const { logout } = useAuthStore();

  const [loaded, error] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  const rewardPoints = 120;

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

  const onClaimRewards = () => {
    console.log("Claiming rewards...");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/profile.svg")}
          style={styles.avatar}
        />
        <Text style={styles.userName}>John Doe</Text>
        <Text style={styles.userEmail}>johndoe@example.com</Text>
        <View style={styles.rewardContainer}>
          <MaterialIcons name="diamond" size={20} color="#fff" />
          <Text style={styles.rewardPoints}>{rewardPoints}</Text>
        </View>
      </View>

      <StatusBar hidden={false} backgroundColor="#FF9500" />

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[styles.option, styles.optionWithBorder]}
          onPress={() => console.log("Edit Profile")}
        >
          <Text style={styles.optionText}>Edit Profile</Text>
          <MaterialIcons name="edit" size={20} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.option, styles.optionWithBorder]}
          onPress={() => navigation.navigate("ChangePassword")}
        >
          <Text style={styles.optionText}>Change Password</Text>
          <MaterialIcons name="lock" size={20} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.option, styles.optionWithBorder]}
          onPress={onClaimRewards}
        >
          <Text style={styles.optionText}>Claim Rewards</Text>
          <MaterialIcons name="redeem" size={20} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.option, styles.logoutOption]}
          onPress={onLogout}
        >
          <Text style={[styles.optionText, { color: "#FF3B30" }]}>Logout</Text>
          <MaterialIcons name="logout" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: "#FAF9F6",
    marginTop: 36,
    display: "flex",
  },
  header: {
    backgroundColor: "#FF9500",
    elevation: 5,
    paddingVertical: 20,
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  userName: {
    fontFamily: "Poppins_700Bold",
    fontSize: 18,
    color: "#fff",
  },
  userEmail: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#fff",
    marginTop: 5,
  },
  rewardContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  rewardPoints: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#fff",
    marginLeft: 5,
  },
  optionsContainer: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  option: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionWithBorder: {
    borderWidth: 1,
    borderColor: "#ddd",
  },
  logoutOption: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  optionText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#333",
  },
});
