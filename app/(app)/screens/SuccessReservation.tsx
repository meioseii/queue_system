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
import { AuthStackParamList } from "../auth-types";
import { useForm, Controller } from "react-hook-form";

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export default function SuccessReservation() {
  type Navigation = NativeStackNavigationProp<AuthStackParamList, "Login">;
  const navigation = useNavigation<Navigation>();

  const [loaded, error] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  const [timer, setTimer] = useState<number>(5);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval); // cleanup
    } else {
      navigation.navigate("Tabs");
    }
  }, [timer]);
  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden={true}></StatusBar>
      <View style={styles.iconContainer}>
        <Image
          style={styles.icon}
          source={require("../../../assets/images/iQueueImage.svg")}
          placeholder={{ blurhash }}
          contentFit="cover"
        />
        <Text style={styles.iconText}>iQUEUE</Text>
      </View>
      <View style={styles.checkMessage}>
        <Image
          style={[styles.icon, { height: 65, width: 65 }]}
          source={require("../../../assets/images/Check.svg")}
          placeholder={{ blurhash }}
          contentFit="cover"
        />
        <Text style={{ fontFamily: "Poppins_700Bold", textAlign: "center" }}>
          Your table has been successfully reserved.
        </Text>
        <Text style={styles.successMessage}>
          Thank you for choosing iQUEUE!
        </Text>
        <Text style={{ bottom: 20, fontFamily: "Poppins_400Regular" }}>
          Less waiting, more eating.
        </Text>
        <Text style={{ fontFamily: "Poppins_400Regular" }}>
          Redirecting in {timer}
        </Text>
      </View>
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
