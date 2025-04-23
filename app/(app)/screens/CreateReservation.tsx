import { StatusBar } from "expo-status-bar";
import { TextInput, Button, Text } from "react-native-paper";
import { View, StyleSheet } from "react-native";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useAppStore } from "@/app/store/app-store";
import { Image } from "expo-image";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../app-types";

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

type FormData = {
  guests: string;
  date: Date | null;
  time: Date | null;
};

export default function CreateReservation() {
  type Navigation = NativeStackNavigationProp<
    AppStackParamList,
    "CreateReservation"
  >;
  const navigation = useNavigation<Navigation>();
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

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
        table_number: 1, // Hardcoded table number for now
        reservation_date: formattedDate, // Use the formatted date and time
      };

      try {
        await useAppStore.getState().createReservation(payload);
        navigation.navigate("SuccessReservation");
      } catch (err) {
        Toast.show({
          type: "error",
          text1: `ERROR CREATING RESERVATION:`,
          text2: err.message,
          visibilityTime: 3000,
          autoHide: true,
          position: "bottom",
        });
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Image
          style={styles.icon}
          source={require("../../../assets/images/table.svg")}
          placeholder={{ blurhash }}
          contentFit="cover"
        />
      </View>
      {/* Guests Number Input */}
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
            label="Number of Guests"
            mode="outlined"
            keyboardType="numeric"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={!!errors.guests}
            style={[styles.input, { textAlign: "center" }]} // Center text in the input field
            theme={{ colors: { primary: "#FF9500" } }}
          />
        )}
      />
      {errors.guests && (
        <Text style={styles.errorText}>{errors.guests.message}</Text>
      )}

      {/* Date Picker */}
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
              style={styles.input}
              textColor="#FF9500"
            >
              {value ? value.toDateString() : "Select Date"}
            </Button>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
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

      {/* Time Picker */}
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
              style={styles.input}
              textColor="#FF9500"
            >
              {value
                ? value.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true, // Use 12-hour format
                  })
                : "Select Time"}
            </Button>
            <DateTimePickerModal
              isVisible={isTimePickerVisible}
              mode="time"
              is24Hour={false} // Use 12-hour format
              onConfirm={(selectedTime) => {
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

      {/* Submit Button */}
      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        style={styles.submitButton}
        buttonColor="#FF9500"
      >
        Create Reservation
      </Button>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center", // Center vertically
    alignItems: "center", // Center horizontally
    padding: 20,
    backgroundColor: "#FAF9F6",
  },
  iconContainer: {
    backgroundColor: "#FAF9F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  icon: {
    width: 120,
    height: 120,
  },
  input: {
    width: "100%",
    marginBottom: 10,
    borderRadius: 5,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
    textAlign: "center",
  },
  submitButton: {
    marginTop: 20,
    marginBottom: 60,
    width: "100%",
  },
});
