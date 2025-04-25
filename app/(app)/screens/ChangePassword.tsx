import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { TextInput, Button, Text, Icon } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../app-types";
import { useForm, Controller } from "react-hook-form";
import { StatusBar } from "expo-status-bar";
import { SplashScreen } from "expo-router";
import Toast from "react-native-toast-message";
import { useAuthStore } from "@/app/store/auth-store";

type FormData = {
  email: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ChangePassword() {
  type Navigation = NativeStackNavigationProp<
    AppStackParamList,
    "ChangePassword"
  >;
  const navigation = useNavigation<Navigation>();

  const [loaded, error] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });
  const [seePass, setSeePass] = useState(false);
  const [seeConfirmPass, setSeeConfirmPass] = useState(false);
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const { changePassword, loading, email } = useAuthStore();

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        if (email) {
          await changePassword({ email, newPassword: data.newPassword });
        }
        navigation.navigate("Tabs");
      } catch (err: any) {
        Toast.show({
          type: "error",
          text1: `FAILED TO UPDATE PASSWORD`,
          text2: err.message,
          visibilityTime: 3000,
          autoHide: true,
          position: "top",
        });
      }
    },
    [changePassword, email, navigation]
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
      <View style={{ bottom: 135 }}>
        <View style={styles.headerContainer}>
          <Icon source="lock-open" size={24} color="#000" />
          <Text style={styles.title}>Create New Password</Text>
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
          Your new password must be different from previously used password.
        </Text>
        <Controller
          control={control}
          name="newPassword"
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
              error={!!errors.newPassword}
            />
          )}
        />
        {errors.newPassword && (
          <Text
            style={{
              color: "red",
              marginLeft: 10,
              fontFamily: "Poppins_400Regular",
              fontSize: 12,
              paddingHorizontal: 10,
            }}
          >
            {errors.newPassword.message}
          </Text>
        )}

        <Controller
          control={control}
          name="confirmPassword"
          rules={{
            required: "Please confirm your password",
            validate: (value) =>
              value === watch("newPassword") || "Passwords do not match",
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
              marginLeft: 10,
              fontFamily: "Poppins_400Regular",
              fontSize: 12,
              paddingHorizontal: 10,
            }}
          >
            {errors.confirmPassword.message}
          </Text>
        )}
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          style={[styles.input, { marginTop: 20 }]}
          buttonColor="#FF9500"
          loading={loading}
          disabled={loading}
        >
          <Text style={{ fontFamily: "Poppins_700Bold", color: "white" }}>
            SUBMIT
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
    marginTop: 10,
    height: 40,
  },
});
