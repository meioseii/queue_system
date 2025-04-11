import React, { useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { TextInput, Button, Text, Icon } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../types";
import { useForm, Controller } from "react-hook-form";
import { StatusBar } from "expo-status-bar";
import { SplashScreen } from "expo-router";

type FormData = {
  email: string;
};

export default function SendOTP() {
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

      <View style={{ bottom: 177 }}>
        <View style={styles.headerContainer}>
          <Icon source="lock-open" size={24} color="#000" />
          <Text style={styles.title}>Forgot Password?</Text>
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
          Enter your registered email to receive a one time password.
        </Text>
        <Controller
          control={control}
          name="email"
          rules={{ required: "Email is required" }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Email Address"
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
        <Button
          mode="contained"
          onPress={() => {}}
          style={[styles.input, { marginTop: 10 }]}
          buttonColor="#FF9500"
        >
          <Text style={{ fontFamily: "Poppins_700Bold", color: "white" }}>
            RESET PASSWORD
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
  input: {
    height: 40,
    marginBottom: 10,
  },
});
