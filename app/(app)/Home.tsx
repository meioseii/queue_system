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
  RefreshControl,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { useAppStore } from "../store/app-store";
import { AppStackParamList } from "../app-types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "expo-router";
import Toast from "react-native-toast-message";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ConfirmationModal from "./components/ConfirmationModal";
import { LinearGradient } from "expo-linear-gradient";

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
  const [refreshing, setRefreshing] = useState(false);

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
    doneQueue,
  } = useAppStore();

  // Refresh function
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      // Check for existing queue
      await checkQueueStatus();
      // Fetch reservations
      await fetchReservations();
      // If there's a current queue with tier, check last seated
      if (currentQueue && currentQueue.tier) {
        await checkLastSeated(currentQueue.tier);
      }
    } catch (error) {
      console.log("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  }, [currentQueue]);

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
      setSelectedReservation(reservations[day.dateString][0] as Reservation);
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
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            const payload = { reservation_id };
            try {
              await useAppStore.getState().cancelReservation(payload);
              setModalVisible(false);
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

  const handleDoneQueue = async () => {
    try {
      await doneQueue();
      Toast.show({
        type: "success",
        text1: "Queue completed successfully",
        text2: "Thank you for dining with us!",
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SEATED":
        return "#4CAF50";
      case "WAITING":
        return "#FF9500";
      default:
        return "#666";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SEATED":
        return "check-circle";
      case "WAITING":
        return "clock-outline";
      default:
        return "help-circle";
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FAF9F6" }}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Home</Text>
      </View>
      <StatusBar hidden={false} backgroundColor="#FFF" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {currentQueue && (
          <View style={styles.queueCard}>
            <LinearGradient
              colors={["#FF9500", "#FFB84D"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.queueGradient}
            >
              <View style={styles.queueHeader}>
                <MaterialCommunityIcons
                  name="ticket-confirmation"
                  size={28}
                  color="#FFF"
                />
                <Text style={styles.queueTitle}>Queue Status</Text>
                <View style={styles.statusBadge}>
                  <MaterialCommunityIcons
                    name={getStatusIcon(currentQueue.status)}
                    size={16}
                    color="#FFF"
                  />
                  <Text style={styles.statusBadgeText}>
                    {currentQueue.status}
                  </Text>
                </View>
              </View>
            </LinearGradient>

            <View style={styles.queueContent}>
              <View style={styles.queueInfo}>
                <View style={styles.queueNumberContainer}>
                  <Text style={styles.queueNumberLabel}>Your Number</Text>
                  <View style={styles.numberCircle}>
                    <Text style={styles.queueNumber}>
                      {currentQueue.queueing_number}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.queueNumberContainer}>
                  <Text style={styles.queueNumberLabel}>Now Serving</Text>
                  <View
                    style={[
                      styles.numberCircle,
                      styles.servingNumberCircle,
                      lastSeatedQueue?.queueingNumber ===
                        currentQueue.queueing_number &&
                        styles.activeNumberCircle,
                    ]}
                  >
                    <Text
                      style={[
                        styles.queueNumber,
                        styles.servingNumber,
                        lastSeatedQueue?.queueingNumber ===
                          currentQueue.queueing_number && styles.activeNumber,
                      ]}
                    >
                      {lastSeatedQueue?.queueingNumber || "-"}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardActions}>
                {currentQueue.status === "SEATED" ? (
                  <View style={styles.seatedActions}>
                    <View style={styles.seatedIndicator}>
                      <MaterialCommunityIcons
                        name="chair-school"
                        size={20}
                        color="#4CAF50"
                      />
                      <Text style={[styles.statusText, styles.activeStatus]}>
                        You're Seated!
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.viewBillButton,
                        loadingStates.doneQueue && styles.disabledButton,
                      ]}
                      onPress={() => navigation.navigate("RunningBill")}
                      disabled={loadingStates.doneQueue}
                    >
                      <MaterialCommunityIcons
                        name="receipt"
                        size={18}
                        color="#FFF"
                      />
                      <Text style={styles.viewBillButtonText}>See Bill</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.cancelQueueButton}
                    onPress={() => setShowCancelQueueModal(true)}
                  >
                    <MaterialCommunityIcons
                      name="close-circle"
                      size={18}
                      color="#FF4B4B"
                    />
                    <Text style={styles.cancelQueueText}>Cancel Queue</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
  // Modern Queue Card Styles
  queueCard: {
    margin: 20,
    marginBottom: 0,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 8,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  queueGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  queueHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  queueTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 20,
    color: "#FFF",
    flex: 1,
    marginLeft: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    color: "#FFF",
    marginLeft: 4,
  },
  queueContent: {
    backgroundColor: "#FFF",
  },
  queueInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  queueNumberContainer: {
    alignItems: "center",
    flex: 1,
  },
  queueNumberLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  numberCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FF9500",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#FF9500",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  servingNumberCircle: {
    backgroundColor: "#F5F5F5",
  },
  activeNumberCircle: {
    backgroundColor: "#4CAF50",
    shadowColor: "#4CAF50",
  },
  queueNumber: {
    fontFamily: "Poppins_700Bold",
    fontSize: 24,
    color: "#FFF",
  },
  servingNumber: {
    color: "#666",
  },
  activeNumber: {
    color: "#FFF",
  },
  divider: {
    width: 2,
    height: 60,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 20,
    borderRadius: 1,
  },
  cardActions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  seatedActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  seatedIndicator: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  statusText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    marginLeft: 8,
  },
  activeStatus: {
    color: "#4CAF50",
  },
  doneButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
  },
  doneButtonText: {
    color: "#FFF",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
  },
  cancelQueueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#FF4B4B",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelQueueText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: "#FF4B4B",
    marginLeft: 6,
  },
  disabledButton: {
    opacity: 0.6,
  },
  viewBillButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  viewBillButtonText: {
    color: "#FFF",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    marginLeft: 6,
  },
});
