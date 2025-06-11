import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  ToastAndroid,
  Platform,
} from "react-native";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { Text, TextInput, Button } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../app-types";
import { Controller, useForm } from "react-hook-form";
import { useAppStore } from "../../store/app-store";

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

type FormData = {
  guests: string;
};

type RouteParams = {
  accessCode: string;
};

export default function CreateQueue() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute();
  const { accessCode } = route.params as RouteParams;
  const { createQueue, loadingStates } = useAppStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  const showToast = (message: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      await createQueue({
        num_people: parseInt(data.guests),
        accessCode: accessCode,
      });
      navigation.navigate("Tabs");
      showToast("Queue created successfully!");
    } catch (error) {
      console.error("Error creating queue:", error);
      showToast("Failed to create queue. Please try again.");
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <StatusBar style="light" />

        <View style={styles.headerSection}>
          <Image
            style={styles.icon}
            source={require("../../../assets/images/table.svg")}
            placeholder={{ blurhash }}
            contentFit="cover"
          />
          <Text style={styles.headerText}>Start Queue</Text>
          <Text style={styles.subHeaderText}>
            Enter the number of people in your group
          </Text>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Number of Guests</Text>
            <Controller
              name="guests"
              control={control}
              defaultValue=""
              rules={{
                required: "Number of guests is required",
                pattern: {
                  value: /^[1-9][0-9]*$/,
                  message: "Please enter a valid number",
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  keyboardType="numeric"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={!!errors.guests}
                  style={styles.input}
                  outlineStyle={styles.inputOutline}
                  contentStyle={[styles.inputContent, styles.inputText]}
                  theme={{
                    colors: { primary: "#FF9500" },
                    fonts: {
                      bodyLarge: { fontFamily: "Poppins_400Regular" },
                    },
                  }}
                  left={
                    <TextInput.Icon
                      icon="account-group"
                      style={styles.inputIcon}
                    />
                  }
                />
              )}
            />
            {errors.guests && (
              <Text style={styles.errorText}>{errors.guests.message}</Text>
            )}
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            style={styles.submitButton}
            labelStyle={styles.submitButtonLabel}
            loading={loadingStates.createQueue}
            disabled={loadingStates.createQueue}
          >
            Start Queue
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#FAF9F6",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  icon: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  headerText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 24,
    color: "#1A1A1A",
    marginBottom: 8,
  },
  subHeaderText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
  },
  formSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
  },
  inputOutline: {
    borderRadius: 8,
  },
  inputContent: {
    paddingLeft: 12,
  },
  inputText: {
    fontFamily: "Poppins_400Regular",
  },
  inputIcon: {
    marginRight: 8,
  },
  errorText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#FF3B30",
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: "#FF9500",
    borderRadius: 8,
    marginTop: 10,
  },
  submitButtonLabel: {
    fontFamily: "Poppins_700Bold",
    fontSize: 16,
    paddingVertical: 2,
  },
});
