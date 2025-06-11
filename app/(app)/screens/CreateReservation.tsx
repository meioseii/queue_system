import { StatusBar } from "expo-status-bar";
import { TextInput, Button, Text } from "react-native-paper";
import { View, StyleSheet, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useAppStore } from "@/app/store/app-store";
import { Image } from "expo-image";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../app-types";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import * as SplashScreen from "expo-splash-screen";

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

type FormData = {
  guests: string;
  date: Date | null;
  time: Date | null;
};

export default function CreateReservation() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  type Navigation = NativeStackNavigationProp<
    AppStackParamList,
    "CreateReservation"
  >;
  const navigation = useNavigation<Navigation>();
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const { loadingStates } = useAppStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  const onSubmit = async (data: FormData) => {
    if (data.date && data.time) {
      const reservationDate = new Date(data.date);
      reservationDate.setHours(
        data.time.getHours(),
        data.time.getMinutes(),
        0,
        0
      );

      const formattedDate = `${reservationDate.getFullYear()}-${String(
        reservationDate.getMonth() + 1
      ).padStart(2, "0")}-${String(reservationDate.getDate()).padStart(
        2,
        "0"
      )}T${String(reservationDate.getHours()).padStart(2, "0")}:${String(
        reservationDate.getMinutes()
      ).padStart(2, "0")}:00`;

      const payload = {
        num_people: parseInt(data.guests, 10),
        table_number: 1,
        reservation_date: formattedDate,
      };

      try {
        await useAppStore.getState().createReservation(payload);
        navigation.navigate("SuccessReservation");
      } catch (err: any) {
        Toast.show({
          type: "error",
          text1: `Failed to Create Reservation`,
          text2: err.message,
          visibilityTime: 3000,
          autoHide: true,
          position: "bottom",
        });
      }
    }
  };

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
          <Text style={styles.headerText}>Book Your Table</Text>
          <Text style={styles.subHeaderText}>
            Reserve your perfect dining experience
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
                  placeholder="Up to 6 people"
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Date</Text>
            <Controller
              name="date"
              control={control}
              defaultValue={null}
              rules={{ required: "Date is required" }}
              render={({ field: { onChange, value } }) => (
                <>
                  <Button
                    mode="outlined"
                    onPress={() => setDatePickerVisibility(true)}
                    style={styles.dateTimeButton}
                    contentStyle={styles.dateTimeButtonContent}
                    icon={() => (
                      <MaterialIcons name="event" size={24} color="#FF9500" />
                    )}
                    textColor="#333"
                    labelStyle={styles.buttonText}
                  >
                    {value ? value.toDateString() : "Choose a date"}
                  </Button>
                  <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    minimumDate={
                      new Date(new Date().setDate(new Date().getDate() + 1))
                    }
                    onConfirm={(selectedDate) => {
                      onChange(selectedDate);
                      setDatePickerVisibility(false);
                    }}
                    onCancel={() => setDatePickerVisibility(false)}
                  />
                </>
              )}
            />
            {errors.date && (
              <Text style={styles.errorText}>{errors.date.message}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Time</Text>
            <Controller
              name="time"
              control={control}
              defaultValue={null}
              rules={{ required: "Time is required" }}
              render={({ field: { onChange, value } }) => (
                <>
                  <Button
                    mode="outlined"
                    onPress={() => setTimePickerVisibility(true)}
                    style={styles.dateTimeButton}
                    contentStyle={styles.dateTimeButtonContent}
                    icon={() => (
                      <MaterialIcons
                        name="access-time"
                        size={24}
                        color="#FF9500"
                      />
                    )}
                    textColor="#333"
                    labelStyle={styles.buttonText}
                  >
                    {value
                      ? value.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                      : "Choose a time"}
                  </Button>
                  <DateTimePickerModal
                    isVisible={isTimePickerVisible}
                    mode="time"
                    is24Hour={false}
                    onConfirm={(selectedTime) => {
                      const hours = selectedTime.getHours();
                      const minutes = selectedTime.getMinutes();

                      if (
                        hours < 10 ||
                        (hours === 22 && minutes > 0) ||
                        hours > 22
                      ) {
                        Toast.show({
                          type: "error",
                          text1: "Invalid Time",
                          text2:
                            "Please select a time between 10:00 AM and 10:00 PM.",
                          visibilityTime: 3000,
                          autoHide: true,
                          position: "bottom",
                        });
                        setTimePickerVisibility(false);
                        return;
                      }

                      onChange(selectedTime);
                      setTimePickerVisibility(false);
                    }}
                    onCancel={() => setTimePickerVisibility(false)}
                  />
                </>
              )}
            />
            {errors.time && (
              <Text style={styles.errorText}>{errors.time.message}</Text>
            )}
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            style={styles.submitButton}
            contentStyle={styles.submitButtonContent}
            buttonColor="#FF9500"
            loading={loadingStates.createReservation}
            disabled={loadingStates.createReservation}
            labelStyle={styles.submitButtonText}
          >
            Confirm Reservation
          </Button>
        </View>
        <Toast />
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
    padding: 16,
    backgroundColor: "#FAF9F6",
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  headerText: {
    fontSize: 24,
    fontFamily: "Poppins_600SemiBold",
    color: "#333",
    marginBottom: 4,
    letterSpacing: 0.25,
  },
  subHeaderText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#666",
    textAlign: "center",
    letterSpacing: 0.15,
    lineHeight: 20,
  },
  formSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
    fontFamily: "Poppins_500Medium",
    letterSpacing: 0.1,
  },
  input: {
    backgroundColor: "#FFF",
    height: 44,
  },
  inputText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
  },
  inputOutline: {
    borderRadius: 8,
    borderColor: "#E0E0E0",
  },
  inputContent: {
    paddingLeft: 8,
    height: 44,
  },
  dateTimeButton: {
    borderColor: "#E0E0E0",
    borderRadius: 8,
    borderWidth: 1,
    height: 44,
  },
  dateTimeButtonContent: {
    height: 44,
    justifyContent: "flex-start",
    paddingLeft: 12,
  },
  buttonText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    letterSpacing: 0.1,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 11,
    marginTop: 2,
    fontFamily: "Poppins_400Regular",
    letterSpacing: 0.2,
  },
  submitButton: {
    marginTop: 12,
    borderRadius: 8,
  },
  submitButtonContent: {
    height: 48,
  },
  submitButtonText: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  inputIcon: {
    marginLeft: 32,
  },
});
