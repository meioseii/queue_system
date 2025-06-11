import React, { useState, useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import { Button, Text, Card } from "react-native-paper";
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { useAppStore } from "../store/app-store";
import { AppStackParamList } from "../app-types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "expo-router";
import Toast from "react-native-toast-message";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ConfirmationModal from "./components/ConfirmationModal";

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
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const [showCancelQueueModal, setShowCancelQueueModal] = useState(false);

  const {
    reservations,
    fetchReservations,
    loadingStates,
    currentQueue,
    clearQueue,
    checkQueueStatus,
    checkLastSeated,
    cancelQueue,
    lastSeatedQueue,
  } = useAppStore();

  // Check for existing queue and fetch reservations on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Check for existing queue
        await checkQueueStatus();
      } catch (error) {
        // If there's no active queue, the error is expected
        console.log("No active queue found");
      }
      // Fetch reservations
      await fetchReservations();
    };

    initializeData();
  }, []);

  // Set up polling for queue status and last seated
  useEffect(() => {
    const startPolling = () => {
      // Clear any existing interval
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }

      // Only start polling if we have an active queue
      if (currentQueue && currentQueue.status !== "SEATED") {
        const pollQueue = async () => {
          try {
            const data = await checkQueueStatus();
            // Check last seated queue using the tier from current queue
            if (currentQueue.tier) {
              await checkLastSeated(currentQueue.tier);
            }
            // If status is SEATED, stop polling
            if (data.status === "SEATED") {
              if (pollingInterval.current) {
                clearInterval(pollingInterval.current);
                pollingInterval.current = null;
              }
            }
          } catch (error) {
            console.error("Error checking queue status:", error);
            // If there's an error, stop polling
            if (pollingInterval.current) {
              clearInterval(pollingInterval.current);
              pollingInterval.current = null;
            }
          }
        };

        // Initial check
        pollQueue();
        // Set up interval for subsequent checks
        pollingInterval.current = setInterval(pollQueue, 10000); // 10 seconds
      }
    };

    startPolling();

    // Cleanup function
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
    };
  }, [currentQueue?.queue_id]);

  const handleDayPress = (day: any) => {
    setSelectedDate(day.dateString);
    if (reservations[day.dateString]?.length) {
      setSelectedReservation(reservations[day.dateString][0] as Reservation); // Add type assertion
      setModalVisible(true);
    }
  };

  const handleCancelReservation = async (reservation_id: string) => {
    Alert.alert(
      "Cancel Reservation",
      "Are you sure you want to cancel this reservation?",
      [
        {
          text: "No",
          style: "cancel", // Dismiss the alert
        },
        {
          text: "Yes",
          onPress: async () => {
            const payload = { reservation_id }; // Wrap reservation_id in an object
            try {
              await useAppStore.getState().cancelReservation(payload);
              setModalVisible(false); // Close the modal after canceling
              Toast.show({
                type: "success",
                text1: "Your reservation has been successfully cancelled.",
                visibilityTime: 3000,
                autoHide: true,
              });
            } catch (error: any) {
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
          },
        },
      ]
    );
  };

  const handleClearQueue = async () => {
    try {
      await cancelQueue();
      Toast.show({
        type: "success",
        text1: "Queue cancelled successfully",
        visibilityTime: 3000,
        autoHide: true,
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
        visibilityTime: 3000,
        autoHide: true,
      });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FAF9F6" }}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Home</Text>
      </View>
      <StatusBar hidden={false} backgroundColor="#FF9500" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        {currentQueue && (
          <Card style={styles.queueCard}>
            <Card.Content>
              <View style={styles.queueHeader}>
                <MaterialCommunityIcons
                  name="ticket-confirmation"
                  size={24}
                  color="#FF9500"
                />
                <Text style={styles.queueTitle}>Queue Status</Text>
              </View>
              <View style={styles.queueInfo}>
                <View style={styles.queueNumberContainer}>
                  <Text style={styles.queueNumberLabel}>Your Number</Text>
                  <Text style={styles.queueNumber}>
                    {currentQueue.queueing_number}
                  </Text>
                </View>
                <View style={styles.queueNumberContainer}>
                  <Text style={styles.queueNumberLabel}>Now Serving</Text>
                  <Text
                    style={[
                      styles.queueNumber,
                      lastSeatedQueue?.queueingNumber ===
                        currentQueue.queueing_number && styles.activeNumber,
                    ]}
                  >
                    {lastSeatedQueue?.queueingNumber || "-"}
                  </Text>
                </View>
              </View>
            </Card.Content>
            <Card.Actions style={styles.cardActions}>
              {currentQueue.status === "SEATED" ? (
                <Text style={[styles.statusText, styles.activeStatus]}>
                  SEATED
                </Text>
              ) : (
                <Button
                  mode="text"
                  onPress={() => setShowCancelQueueModal(true)}
                  textColor="#FF4B4B"
                  style={styles.clearButton}
                >
                  Cancel Queue
                </Button>
              )}
            </Card.Actions>
          </Card>
        )}

        {loadingStates.fetchReservations ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF9500" />
          </View>
        ) : (
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
        )}

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
                disabled={loadingStates.cancelReservation}
              >
                <Text style={styles.cancelButtonText}>Cancel Reservation</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
                disabled={loadingStates.cancelReservation}
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
          {!currentQueue && (
            <Button
              mode="contained"
              onPress={() => navigation.navigate("QRScanner")}
              style={styles.button}
              labelStyle={styles.buttonText}
            >
              Start Queueing
            </Button>
          )}
        </View>
        <ConfirmationModal
          visible={showCancelQueueModal}
          title="Cancel Queue"
          message="Are you sure you want to cancel your queue number?"
          onConfirm={handleClearQueue}
          onCancel={() => setShowCancelQueueModal(false)}
          cancelText="No"
          confirmText="Yes"
          confirmColor="#FF4B4B"
          isLoading={loadingStates.cancelQueue}
        />
        <Toast />
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "#FF9500",
    elevation: 5,
    paddingLeft: 15,
    paddingVertical: 10,
    borderRadius: 0,
    marginTop: 35,
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
    width: "100%",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  queueCard: {
    margin: 20,
    marginBottom: 0,
    elevation: 4,
    backgroundColor: "#FFF",
  },
  queueHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  queueTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 18,
    color: "#1A1A1A",
    marginLeft: 10,
  },
  queueInfo: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
  },
  queueNumberContainer: {
    alignItems: "center",
    flex: 1,
  },
  queueNumberLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  queueNumber: {
    fontFamily: "Poppins_700Bold",
    fontSize: 28,
    color: "#FF9500",
  },
  activeNumber: {
    color: "#4CAF50",
  },
  clearButton: {
    marginLeft: "auto",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  statusText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 16,
    color: "#666",
  },
  activeStatus: {
    color: "#4CAF50",
  },
});
