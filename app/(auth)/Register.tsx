import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { TextInput, Button, Text } from "react-native-paper";
import { Icon } from "react-native-paper";
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
import { useAuthStore } from "../store/auth-store";
import Toast from "react-native-toast-message";

import { useCallback, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../auth-types";
import { useForm, Controller } from "react-hook-form";

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

type FormData = {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  mobileNumber: string; // Add this field
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
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const { register, loading, message } = useAuthStore();

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        await register(data);
        navigation.navigate("Success");
      } catch (err: any) {
        Toast.show({
          type: "error",
          text1: `REGISTRATION FAILED`,
          text2: err.message,
          visibilityTime: 3000,
          autoHide: true,
          position: "top",
        });
      }
    },
    [register]
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
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
            {/* First Name */}
            <Controller
              control={control}
              name="first_name"
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
                  error={!!errors.first_name}
                />
              )}
            />
            {errors.first_name && (
              <Text style={styles.errorText}>{errors.first_name.message}</Text>
            )}

            {/* Last Name */}
            <Controller
              control={control}
              name="last_name"
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
                  error={!!errors.last_name}
                />
              )}
            />
            {errors.last_name && (
              <Text style={styles.errorText}>{errors.last_name.message}</Text>
            )}

            {/* Username */}
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
              <Text style={styles.errorText}>{errors.username.message}</Text>
            )}

            {/* Email */}
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
              <Text style={styles.errorText}>{errors.email.message}</Text>
            )}

            {/* Mobile Number - New Field */}
            <Controller
              control={control}
              name="mobileNumber"
              rules={{
                required: "Mobile number is required",
                pattern: {
                  value: /^(09|\+639)\d{9}$/,
                  message:
                    "Please enter a valid Philippine mobile number (09XXXXXXXXX or +639XXXXXXXXX)",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Mobile Number"
                  mode="outlined"
                  outlineColor="#000"
                  activeOutlineColor="#FF9500"
                  textColor="#000"
                  style={[styles.input, { backgroundColor: "transparent" }]}
                  contentStyle={{ fontFamily: "Poppins_400Regular" }}
                  value={value}
                  onChangeText={onChange}
                  error={!!errors.mobileNumber}
                  keyboardType="phone-pad"
                  placeholder="09123456789"
                />
              )}
            />
            {errors.mobileNumber && (
              <Text style={styles.errorText}>
                {errors.mobileNumber.message}
              </Text>
            )}

            {/* Password */}
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
              <Text style={styles.errorText}>{errors.password.message}</Text>
            )}

            {/* Confirm Password */}
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
              <Text style={styles.errorText}>
                {errors.confirmPassword.message}
              </Text>
            )}
          </View>
          <View>
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              style={[styles.input, { bottom: 30 }]}
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
    backgroundColor: "transparent",
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
    marginTop: 10,
    height: 40,
  },
  errorText: {
    color: "red",
    marginLeft: 40,
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    paddingHorizontal: 10,
  },
});
