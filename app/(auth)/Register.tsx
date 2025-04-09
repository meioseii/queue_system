import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { TextInput, Button, Text } from "react-native-paper";
import { Icon, MD3Colors } from "react-native-paper";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../types";

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export default function Register() {
  type Navigation = NativeStackNavigationProp<AuthStackParamList, "Register">;
  const navigation = useNavigation<Navigation>();
  const [loaded, error] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });
  const [seePass, setSeePass] = useState(false);
  const [seeConfirmPass, setSeeConfirmPass] = useState(false);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <StatusBar hidden={true}></StatusBar>
      <TouchableOpacity
        style={styles.backContainer}
        onPress={() => navigation.pop()}
      >
        <Icon source="arrow-left" color="#FF9500" size={16} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <View style={styles.iconContainer}>
        <Image
          style={styles.icon}
          source={require("../../assets/images/iQueueImage.svg")}
          placeholder={{ blurhash }}
          contentFit="cover"
        />
        <Text style={styles.iconText}>iQUEUE</Text>
      </View>
      <View style={styles.formContainer}>
        <TextInput
          label="First Name"
          mode="outlined"
          outlineColor="#000"
          activeOutlineColor="#FF9500"
          textColor="#000"
          style={[styles.input, { backgroundColor: "transparent" }]}
          contentStyle={{ fontFamily: "Poppins_400Regular" }}
        />
        <TextInput
          label="Last Name"
          mode="outlined"
          outlineColor="#000"
          activeOutlineColor="#FF9500"
          textColor="#000"
          style={[styles.input, { backgroundColor: "transparent" }]}
          contentStyle={{ fontFamily: "Poppins_400Regular" }}
        />
        <TextInput
          label="Username"
          mode="outlined"
          outlineColor="#000"
          activeOutlineColor="#FF9500"
          textColor="#000"
          style={[styles.input, { backgroundColor: "transparent" }]}
          contentStyle={{ fontFamily: "Poppins_400Regular" }}
        />
        <TextInput
          label="Email"
          mode="outlined"
          outlineColor="#000"
          activeOutlineColor="#FF9500"
          textColor="#000"
          style={[styles.input, { backgroundColor: "transparent" }]}
          contentStyle={{ fontFamily: "Poppins_400Regular" }}
        />
        <TextInput
          label="Password"
          secureTextEntry={!seePass}
          mode="outlined"
          right={
            <TextInput.Icon
              icon={seePass ? "eye" : "eye-off"}
              onPress={() => setSeePass(!seePass)}
            />
          }
          outlineColor="#000"
          activeOutlineColor="#FF9500"
          textColor="#000"
          style={[styles.input, { backgroundColor: "transparent" }]}
        />
        <TextInput
          label="Confirm Password"
          secureTextEntry={!seeConfirmPass}
          mode="outlined"
          right={
            <TextInput.Icon
              icon={seeConfirmPass ? "eye" : "eye-off"}
              onPress={() => setSeeConfirmPass(!seeConfirmPass)}
            />
          }
          outlineColor="#000"
          activeOutlineColor="#FF9500"
          textColor="#000"
          style={[styles.input, { backgroundColor: "transparent" }]}
        />
      </View>
      <View>
        <Button
          mode="contained"
          onPress={() => console.log("Pressed")}
          style={[styles.input, { bottom: 20 }]}
          buttonColor="#FF9500"
        >
          <Text style={{ fontFamily: "Poppins_700Bold", color: "white" }}>
            REGISTER
          </Text>
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: "#FAF9F6",
  },
  backContainer: {
    top: 50,
    marginLeft: 40,
    zIndex: 1,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    width: 300,
  },
  backText: {
    fontFamily: "Poppins_700Bold",
    color: "#FF9500",
    textDecorationLine: "underline",
    fontSize: 16,
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
  formContainer: {
    bottom: 40,
    gap: 10,
  },
  headerContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
  },
  input: {
    marginHorizontal: 40,
    padding: 0,
  },
});
