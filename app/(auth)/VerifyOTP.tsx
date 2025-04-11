import React, { useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { Button, Text, Icon } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../types";
import { useForm, Controller } from "react-hook-form";
import { StatusBar } from "expo-status-bar";
import { SplashScreen } from "expo-router";
import { OtpInput } from "react-native-otp-entry";

type FormData = {
  email: string;
};

export default function VerifyOTP() {
  type Navigation = NativeStackNavigationProp<AuthStackParamList, "SendOTP">;
  const navigation = useNavigation<Navigation>();

  const [loaded, error] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log("Login Form Data:", data);
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
    <View style={styles.container}>
      <StatusBar hidden={true}></StatusBar>
      <TouchableOpacity
        style={styles.backContainer}
        onPress={() => navigation.pop()}
      >
        <Icon source="arrow-left" color="#FF9500" size={16} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={{ bottom: 150 }}>
        <View style={styles.headerContainer}>
          <Icon source="lock-open" size={24} color="#000" />
          <Text style={styles.title}>OTP Verification</Text>
        </View>
        <View
          style={{
            borderBottomColor: "black",
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderTopColor: "black",
            width: "100%",
            marginBottom: 10,
          }}
        />
        <Text style={{ fontFamily: "Poppins_400Regular", marginVertical: 5 }}>
          We’ve sent the OTP code to your email.
        </Text>
        <Text
          style={{
            fontFamily: "Poppins_400Regular",
            marginVertical: 5,
            marginBottom: 15,
          }}
        >
          To complete the verification process, please enter the 6-digit code
          below.
        </Text>
        <Controller
          control={control}
          name="email"
          rules={{ required: "Email is required" }}
          render={({ field: { onChange, value } }) => (
            <OtpInput
              numberOfDigits={6}
              focusColor={"#FF9500"}
              theme={{
                pinCodeContainerStyle: styles.pinCodeContainer,
                pinCodeTextStyle: styles.pinCodeText,
              }}
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
        <Button
          mode="contained"
          onPress={() => {}}
          style={{ marginTop: 25 }}
          buttonColor="#FF9500"
        >
          <Text style={{ fontFamily: "Poppins_700Bold", color: "white" }}>
            VERIFY
          </Text>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 40,
    backgroundColor: "#FAF9F6",
  },
  backContainer: {
    bottom: 225,
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
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    marginLeft: 10,
    color: "#FF9500",
  },
  pinCodeText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 25,
    color: "#000",
  },
  pinCodeContainer: {
    backgroundColor: "transparent",
    width: 42,
    height: 42,
    borderRadius: 10,
  },
});
