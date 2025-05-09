import React, { useCallback, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { useAppStore } from "@/app/store/app-store";
import Toast from "react-native-toast-message";
import { AppStackParamList } from "@/app/app-types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

type FormData = {
  email: string;
  first_Name: string;
  last_Name: string;
  username: string;
};

function EditProfile() {
  const { userInfo, fetchUserProfile, editUserProfile, loading } =
    useAppStore();

  type Navigation = NativeStackNavigationProp<
    AppStackParamList,
    "ChangePassword"
  >;
  const navigation = useNavigation<Navigation>();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      email: "",
      first_Name: "",
      last_Name: "",
      username: "",
    },
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (userInfo) {
      reset({
        email: userInfo.email || "",
        first_Name: userInfo.first_Name || "",
        last_Name: userInfo.last_Name || "",
        username: userInfo.username || "",
      });
    }
  }, [userInfo, reset]);

  const handleReset = () => {
    if (userInfo) {
      reset({
        email: userInfo.email || "",
        first_Name: userInfo.first_Name || "",
        last_Name: userInfo.last_Name || "",
        username: userInfo.username || "",
      });
      Toast.show({
        type: "info",
        text1: "FORM RESET",
        text2: "PROFILE FORM HAS BEEN RESET TO ORIGINAL VALUES",
        visibilityTime: 3000,
        autoHide: true,
        position: "bottom",
      });
    }
  };

  const handleChangeProfile = useCallback(
    async (data: FormData) => {
      try {
        await editUserProfile(data);
        Toast.show({
          type: "success",
          text1: "PROFILE UPDATE",
          text2: "YOUR PROFILE HAS BEEN SUCCESSFULLY UPDATED",
          visibilityTime: 3000,
          autoHide: true,
          position: "bottom",
        });
        setTimeout(() => {
          fetchUserProfile();
          navigation.navigate("Tabs");
        }, 2000);
      } catch (err: any) {
        Toast.show({
          type: "error",
          text1: `FAILED TO UPDATE YOUR INFORMATION`,
          text2: err.message,
          visibilityTime: 3000,
          autoHide: true,
          position: "top",
        });
      }
    },
    [editUserProfile, userInfo]
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Email"
            value={value}
            onChangeText={onChange}
            mode="outlined"
            style={styles.input}
            disabled
            outlineColor="#000"
            activeOutlineColor="#FF9500"
            textColor="#000"
          />
        )}
      />
      <Controller
        control={control}
        name="first_Name"
        rules={{ required: "First name is required" }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="First Name"
            value={value}
            onChangeText={onChange}
            mode="outlined"
            style={styles.input}
            error={!!errors.first_Name}
            outlineColor="#000"
            activeOutlineColor="#FF9500"
            textColor="#000"
          />
        )}
      />
      {errors.first_Name && (
        <Text style={styles.errorText}>{errors.first_Name.message}</Text>
      )}
      <Controller
        control={control}
        name="last_Name"
        rules={{ required: "Last name is required" }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Last Name"
            value={value}
            onChangeText={onChange}
            mode="outlined"
            style={styles.input}
            error={!!errors.last_Name}
            outlineColor="#000"
            activeOutlineColor="#FF9500"
            textColor="#000"
          />
        )}
      />
      {errors.last_Name && (
        <Text style={styles.errorText}>{errors.last_Name.message}</Text>
      )}
      <Controller
        control={control}
        name="username"
        rules={{ required: "Username is required" }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Username"
            value={value}
            onChangeText={onChange}
            mode="outlined"
            style={styles.input}
            error={!!errors.username}
            outlineColor="#000"
            activeOutlineColor="#FF9500"
            textColor="#000"
          />
        )}
      />
      {errors.username && (
        <Text style={styles.errorText}>{errors.username.message}</Text>
      )}
      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={handleReset}
          style={styles.button}
          textColor="#FF9500"
        >
          <Text
            style={{
              fontFamily: "Poppins_700Bold",
              color: "#FF9500",
              fontSize: 12,
            }}
          >
            RESET
          </Text>
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit(handleChangeProfile)}
          style={styles.button}
          buttonColor="#FF9500"
          disabled={loading}
          loading={loading}
        >
          <Text
            style={{
              fontFamily: "Poppins_700Bold",
              color: "white",
              fontSize: 12,
            }}
          >
            SAVE CHANGES
          </Text>
        </Button>
      </View>
      <Toast />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#FAF9F6",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#FF9500",
    textAlign: "center",
  },
  input: {
    marginBottom: 15,
    backgroundColor: "transparent",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    flex: 0.48,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default EditProfile;
