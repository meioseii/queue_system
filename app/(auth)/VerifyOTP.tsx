import React, { useEffect, useState } from "react";
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
import { StatusBar } from "expo-status-bar";
import { SplashScreen } from "expo-router";
import { OtpInput } from "react-native-otp-entry";
import { useAuthStore } from "../store/auth-store";
import Toast from "react-native-toast-message";

type FormData = {
  email: string;
  otp: string;
};

export default function VerifyOTP() {
  type Navigation = NativeStackNavigationProp<AuthStackParamList, "SendOTP">;
  const navigation = useNavigation<Navigation>();

  const [countdown, setCountdown] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  const [loaded, error] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  const { email, sendOtp, verifyOtp, loading } = useAuthStore();

  const [otpPayload, setOtpPayload] = useState({
    email: email,
    otp: "",
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setIsResendDisabled(false);
    }

    return () => clearTimeout(timer);
  }, [countdown]);

  const resendCode = () => {
    setCountdown(30);
    setIsResendDisabled(true);

    if (email) {
      sendOtp({ email });
    }
  };

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  const handleOnFilled = (otp: string) => {
    setOtpPayload({ ...otpPayload, otp });
  };

  const submit = async (otpPayload: FormData) => {
    try {
      if (email) {
        const token = await verifyOtp(otpPayload);
        if (token) {
          navigation.navigate("ChangePassword");
        }
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: `INVALID OTP`,
        text2: err.message,
        visibilityTime: 3000,
        autoHide: true,

        position: "top",
      });
    }
  };

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
          We’ve sent the OTP code to {email}.
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
        <OtpInput
          numberOfDigits={6}
          onFilled={(otp) => handleOnFilled(otp)}
          focusColor={"#FF9500"}
          theme={{
            pinCodeContainerStyle: styles.pinCodeContainer,
            pinCodeTextStyle: styles.pinCodeText,
          }}
        />
        <View style={styles.forgotPasswordContainer}>
          <Text style={{ fontFamily: "Poppins_400Regular" }}>
            {isResendDisabled
              ? `Resend code in ${countdown}s`
              : "Didn't receive code? "}
          </Text>
          <TouchableOpacity onPress={() => resendCode()}>
            <Text style={[{ fontSize: 16 }, styles.pressableText]}>
              {isResendDisabled ? null : "Resend"}
            </Text>
          </TouchableOpacity>
        </View>
        <Button
          mode="contained"
          onPress={() => submit(otpPayload as FormData)}
          style={{ marginTop: 10 }}
          buttonColor="#FF9500"
          disabled={loading}
          loading={loading}
        >
          <Text style={{ fontFamily: "Poppins_700Bold", color: "white" }}>
            VERIFY
          </Text>
        </Button>
      </View>
      <Toast />
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
    bottom: 186,
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
  forgotPasswordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },
  pressableText: {
    color: "#FF9500",
    textDecorationLine: "underline",
    fontFamily: "Poppins_400Regular",
  },
});
