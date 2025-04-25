import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { TextInput, Button, Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../app-types";
import { useForm, Controller } from "react-hook-form";
import { StatusBar } from "expo-status-bar";
import { SplashScreen } from "expo-router";
import Toast from "react-native-toast-message";
import { useAuthStore } from "@/app/store/auth-store";
import { useAppStore } from "@/app/store/app-store";

type FormData = {
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

  const { changePassword, loading } = useAuthStore();
  const { userInfo, fetchUserProfile } = useAppStore();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        if (userInfo?.email) {
          await changePassword({
            email: userInfo.email,
            newPassword: data.newPassword,
          });
          Toast.show({
            type: "success",
            text1: "Password Updated",
            text2: "Your password has been successfully updated.",
            visibilityTime: 3000,
            autoHide: true,
            position: "top",
          });
          setTimeout(() => {
            navigation.navigate("Tabs");
          }, 2000);
        }
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
    [changePassword, userInfo, navigation]
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
          <Text style={styles.title}>Create New Password</Text>
        </View>
        <Text style={styles.instructionText}>
          Your new password must be different from previously used passwords.
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
              label="New Password"
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
          <Text style={styles.errorText}>{errors.newPassword.message}</Text>
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
          <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
        )}

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          style={[styles.input, { marginTop: 20 }]}
          buttonColor="#FF9500"
          loading={loading}
          disabled={loading}
        >
          <Text style={styles.buttonText}>SUBMIT</Text>
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
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: "#FF9500",
  },
  instructionText: {
    fontFamily: "Poppins_400Regular",
    marginVertical: 10,
  },
  input: {
    marginTop: 10,
    height: 40,
  },
  errorText: {
    color: "red",
    marginLeft: 10,
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    paddingHorizontal: 10,
  },
  buttonText: {
    fontFamily: "Poppins_700Bold",
    color: "white",
  },
});
