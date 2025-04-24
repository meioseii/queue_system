import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { TextInput, Button, Text } from "react-native-paper";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../auth-types";
import { useForm, Controller } from "react-hook-form";
import { useAuthStore } from "../store/auth-store";
import Toast from "react-native-toast-message";

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

type FormData = {
  username: string;
  password: string;
};

export default function Login() {
  type Navigation = NativeStackNavigationProp<AuthStackParamList, "Login">;
  const navigation = useNavigation<Navigation>();

  const [loaded, error] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });
  const [seePass, setSeePass] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const { login, loading, message } = useAuthStore();

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        await login(data);
      } catch (err: any) {
        Toast.show({
          type: "error",
          text1: `LOGIN FAILED`,
          text2: err.message,
          visibilityTime: 3000,
          autoHide: true,

          position: "top",
        });
      }
    },
    [login]
  );

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
          source={require("../../assets/images/iQueueImage.svg")}
          placeholder={{ blurhash }}
          contentFit="cover"
        />
        <Text style={styles.iconText}>iQUEUE</Text>
      </View>
      <View style={styles.formContainer}>
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
              fontSize: 12,
              paddingHorizontal: 10,
            }}
          >
            {errors.username.message}
          </Text>
        )}

        <Controller
          control={control}
          name="password"
          rules={{ required: "Password is required" }}
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
              fontSize: 12,
              paddingHorizontal: 10,
            }}
          >
            {errors.password.message}
          </Text>
        )}
        <View
          style={{
            flexDirection: "row-reverse",
            marginHorizontal: 40,
            marginTop: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate("SendOTP")}
            disabled={loading}
          >
            <Text style={[{ fontSize: 16 }, styles.pressableText]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View>
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          style={[styles.input, { marginTop: 10, bottom: 50 }]}
          buttonColor="#FF9500"
          loading={loading}
          disabled={loading}
        >
          <Text style={{ fontFamily: "Poppins_700Bold", color: "white" }}>
            LOGIN
          </Text>
        </Button>
        <View style={styles.forgotPasswordContainer}>
          <Text
            style={{ fontFamily: "Poppins_400Regular", fontWeight: "light" }}
          >
            Don't have an account?{" "}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Register")}
            disabled={loading}
          >
            <Text style={[{ fontSize: 16 }, styles.pressableText]}>
              Register
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Toast />
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
  formContainer: {
    bottom: 50,
  },
  input: {
    marginTop: 10,
    height: 40,
    marginHorizontal: 40,
    padding: 0,
  },
  forgotPasswordText: {
    textDecorationLine: "underline",
    color: "#FF9500",
  },
  forgotPasswordContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    marginTop: 10,
    bottom: 50,
  },
  pressableText: {
    color: "#FF9500",
    fontSize: 14,
    textDecorationLine: "underline",
    fontFamily: "Poppins_400Regular",
  },
});
