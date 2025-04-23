import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Button, Text } from "react-native-paper";
import { View, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { Calendar } from "react-native-calendars";
import { useAppStore } from "../store/app-store";
import { AppStackParamList } from "../app-types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "expo-router";

type Reservation = {
  table_number: number;
  reservation_date: string;
  reservation_id: string;
  num_people: number;
  status: string;
};

export default function Home() {
  type Navigation = NativeStackNavigationProp<AppStackParamList, "Home">;
  const navigation = useNavigation<Navigation>();
  const [selectedDate, setSelectedDate] = useState<string>(""); // Selected date
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);

  const { reservations, fetchReservations, loading } = useAppStore(); // Use app-store for reservations

  // Fetch reservations on component mount
  useEffect(() => {
    fetchReservations();
  }, []);

  const handleDayPress = (day: any) => {
    setSelectedDate(day.dateString);
    if (reservations[day.dateString]?.length) {
      setSelectedReservation(reservations[day.dateString][0]); // Select the first reservation for simplicity
      setModalVisible(true);
    }
  };

  const handleCancelReservation = async (reservation_id: string) => {
    console.log("Attempting to cancel reservation with ID:", reservation_id);
    const payload = { reservation_id }; // Wrap reservation_id in an objectconst payload = { reservation_id }; // Wrap reservation_id in an object
    try {
      await useAppStore.getState().cancelReservation(payload);
      console.log(`Reservation ${reservation_id} canceled successfully.`);
      setModalVisible(false); // Close the modal after canceling
      Toast.show({
        type: "error",
        text1: "RESERVATION CANCELLATION SUCCESSFUL",
        visibilityTime: 3000,
        autoHide: true,
      });
    } catch (error: any) {
      console.log(payload);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message.includes("404")
          ? "Reservation not found."
          : error.message,
        visibilityTime: 3000,
        autoHide: true,
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Reservation</Text>
      </View>
      <StatusBar hidden={false} backgroundColor="#FF9500" />

      {/* Calendar Section */}
      <View style={styles.calendarContainer}>
        <Calendar
          onDayPress={handleDayPress}
          markedDates={{
            ...Object.keys(reservations).reduce((acc, date) => {
              acc[date] = { marked: true, dotColor: "#FF9500" };
              return acc;
            }, {} as Record<string, { marked: boolean; dotColor: string }>),
            [selectedDate]: { selected: true, selectedColor: "#FF9500" },
          }}
          theme={{
            selectedDayBackgroundColor: "#FF9500",
            todayTextColor: "#FF9500",
            arrowColor: "#FF9500",
          }}
        />
      </View>

      {/* Reservation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Your Reserved Table</Text>
            {selectedReservation ? (
              <View style={styles.modalDetails}>
                <Text style={styles.modalText}>
                  Time:{" "}
                  {new Date(
                    selectedReservation.reservation_date
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
                <Text style={styles.modalText}>
                  Guests: {selectedReservation.num_people}
                </Text>
                <Text style={styles.modalText}>
                  Status: {selectedReservation.status}
                </Text>
              </View>
            ) : (
              <Text style={styles.modalText}>
                No reservation details available.
              </Text>
            )}

            {/* Cancel Button */}
            <TouchableOpacity
              style={[styles.cancelButton, { marginBottom: 10 }]}
              onPress={() =>
                selectedReservation &&
                handleCancelReservation(selectedReservation.reservation_id)
              }
              loading={loading}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel Reservation</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
              disabled={loading}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate("CreateReservation")}
          style={styles.button}
          labelStyle={styles.buttonText}
        >
          Reserve a Table
        </Button>
        <Button
          mode="contained"
          onPress={() => console.log("Start queueing")}
          style={styles.button}
          labelStyle={styles.buttonText}
        >
          Start Queueing
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: "#FAF9F6",
    marginTop: 36,
    display: "flex",
  },
  header: {
    backgroundColor: "#FF9500",
    elevation: 5,
    paddingLeft: 15,
    paddingVertical: 10,
    borderRadius: 0,
  },
  headerText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    color: "#fff",
  },
  calendarContainer: {
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#FFF",
    elevation: 3,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 18,
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  modalDetails: {
    marginBottom: 20,
  },
  modalText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: "#FF9500",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 14,
    color: "#FFF",
  },
  buttonContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  button: {
    marginBottom: 10,
    backgroundColor: "#FF9500",
    width: "80%",
  },
  buttonText: {
    color: "#fff",
    fontFamily: "Poppins_700Bold",
  },
  cancelButton: {
    backgroundColor: "#FF0000",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  cancelButtonText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 14,
    color: "#FFF",
  },
});
