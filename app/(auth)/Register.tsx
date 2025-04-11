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
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../types";
import { useForm, Controller } from "react-hook-form";
import Success from "./Success";

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

type FormData = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function Register() {
  type Navigation = NativeStackNavigationProp<AuthStackParamList, "Register">;
  const navigation = useNavigation<Navigation>();
  const [loaded, error] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });
  const [seePass, setSeePass] = useState(false);
  const [seeConfirmPass, setSeeConfirmPass] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log(data);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      navigation.navigate("Success");
    }, 2000);
  };

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"} // adjust based on header height, etc.
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
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
            <Controller
              control={control}
              name="firstName"
              rules={{ required: "First name is required" }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="First Name"
                  mode="outlined"
                  outlineColor="#000"
                  activeOutlineColor="#FF9500"
                  textColor="#000"
                  style={[styles.input, { backgroundColor: "transparent" }]}
                  contentStyle={{ fontFamily: "Poppins_400Regular" }}
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.firstName}
                />
              )}
            />
            {errors.firstName && (
              <Text
                style={{
                  color: "red",
                  marginLeft: 40,
                  fontFamily: "Poppins_400Regular",
                }}
              >
                {errors.firstName.message}
              </Text>
            )}

            <Controller
              control={control}
              name="lastName"
              rules={{ required: "Last name is required" }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Last Name"
                  mode="outlined"
                  outlineColor="#000"
                  activeOutlineColor="#FF9500"
                  textColor="#000"
                  style={[styles.input, { backgroundColor: "transparent" }]}
                  contentStyle={{ fontFamily: "Poppins_400Regular" }}
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.lastName}
                />
              )}
            />
            {errors.lastName && (
              <Text
                style={{
                  color: "red",
                  marginLeft: 40,
                  fontFamily: "Poppins_400Regular",
                }}
              >
                {errors.lastName.message}
              </Text>
            )}

            <Controller
              control={control}
              name="username"
              rules={{ required: "Username is required" }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Username"
                  mode="outlined"
                  outlineColor="#000"
                  activeOutlineColor="#FF9500"
                  textColor="#000"
                  style={[styles.input, { backgroundColor: "transparent" }]}
                  contentStyle={{ fontFamily: "Poppins_400Regular" }}
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.username}
                />
              )}
            />
            {errors.username && (
              <Text
                style={{
                  color: "red",
                  marginLeft: 40,
                  fontFamily: "Poppins_400Regular",
                }}
              >
                {errors.username.message}
              </Text>
            )}

            <Controller
              control={control}
              name="email"
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
                  message: "Please enter a valid email address",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Email"
                  mode="outlined"
                  outlineColor="#000"
                  activeOutlineColor="#FF9500"
                  textColor="#000"
                  style={[styles.input, { backgroundColor: "transparent" }]}
                  contentStyle={{ fontFamily: "Poppins_400Regular" }}
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.email}
                />
              )}
            />
            {errors.email && (
              <Text
                style={{
                  color: "red",
                  marginLeft: 40,
                  fontFamily: "Poppins_400Regular",
                }}
              >
                {errors.email.message}
              </Text>
            )}

            <Controller
              control={control}
              name="password"
              rules={{
                required: "Password is required",
                pattern: {
                  value:
                    /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/,
                  message:
                    "Password must be 8-16 characters, include uppercase, lowercase, number, and symbol",
                },
              }}
              render={({ field: { onChange, value } }) => (
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
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.password}
                />
              )}
            />
            {errors.password && (
              <Text
                style={{
                  color: "red",
                  marginLeft: 40,
                  fontFamily: "Poppins_400Regular",
                }}
              >
                {errors.password.message}
              </Text>
            )}

            <Controller
              control={control}
              name="confirmPassword"
              rules={{
                required: "Please confirm your password",
                validate: (value) =>
                  value === watch("password") || "Passwords do not match",
              }}
              render={({ field: { onChange, value } }) => (
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
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.confirmPassword}
                />
              )}
            />
            {errors.confirmPassword && (
              <Text
                style={{
                  color: "red",
                  marginLeft: 40,
                  fontFamily: "Poppins_400Regular",
                }}
              >
                {errors.confirmPassword.message}
              </Text>
            )}
          </View>
          <View>
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              style={[styles.input, { bottom: 20 }]}
              buttonColor="#FF9500"
              loading={loading}
              disabled={loading}
            >
              <Text style={{ fontFamily: "Poppins_700Bold", color: "white" }}>
                REGISTER
              </Text>
            </Button>
            <View style={{ height: 100 }}></View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    height: 40,
  },
});
