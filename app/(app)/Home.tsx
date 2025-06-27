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

              console.log("Reservation cancelled, refreshing data...");
              // Force refresh the reservations data

              console.log("New reservations data:", reservations);

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
    await fetchReservations();
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

  const getReservationStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "#4CAF50";
      case "pending":
        return "#FF9500";
      case "cancelled":
        return "#F44336";
      default:
        return "#666";
    }
  };

  const getReservationStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "check-circle";
      case "pending":
        return "clock-outline";
      case "cancelled":
        return "close-circle";
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
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modernModalContainer}>
              {/* Header with close button */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderContent}>
                  <View style={styles.modalIconContainer}>
                    <MaterialCommunityIcons
                      name="calendar-check"
                      size={24}
                      color="#FF9500"
                    />
                  </View>
                  <Text style={styles.modernModalTitle}>
                    Reservation Details
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeIconButton}
                  onPress={() => setModalVisible(false)}
                  disabled={loadingStates.cancelReservation}
                >
                  <MaterialCommunityIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <View style={styles.modalBody}>
                {selectedReservation ? (
                  <View style={styles.modernModalDetails}>
                    {/* Date & Time Card */}
                    <View style={styles.detailCard}>
                      <View style={styles.detailIconContainer}>
                        <MaterialCommunityIcons
                          name="clock-outline"
                          size={20}
                          color="#FF9500"
                        />
                      </View>
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>Date & Time</Text>
                        <Text style={styles.detailValue}>
                          {new Date(
                            selectedReservation.reservation_date
                          ).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </Text>
                        <Text style={styles.detailSubValue}>
                          {new Date(
                            selectedReservation.reservation_date
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true, // Add this to show AM/PM
                          })}
                        </Text>
                      </View>
                    </View>

                    {/* Guests Card */}
                    <View style={styles.detailCard}>
                      <View style={styles.detailIconContainer}>
                        <MaterialCommunityIcons
                          name="account-group"
                          size={20}
                          color="#FF9500"
                        />
                      </View>
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>Number of Guests</Text>
                        <Text style={styles.detailValue}>
                          {selectedReservation.num_people}{" "}
                          {selectedReservation.num_people === 1
                            ? "Guest"
                            : "Guests"}
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <MaterialCommunityIcons
                      name="calendar-remove"
                      size={48}
                      color="#CCC"
                    />
                    <Text style={styles.emptyStateText}>
                      No reservation details available
                    </Text>
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[
                    styles.modernCancelButton,
                    loadingStates.cancelReservation && styles.disabledButton,
                  ]}
                  onPress={() =>
                    selectedReservation &&
                    handleCancelReservation(selectedReservation.reservation_id)
                  }
                  disabled={loadingStates.cancelReservation}
                >
                  {loadingStates.cancelReservation ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <MaterialCommunityIcons
                        name="cancel"
                        size={18}
                        color="#FFF"
                      />
                      <Text style={styles.modernCancelButtonText}>
                        Cancel Reservation
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modernCloseButton,
                    loadingStates.cancelReservation && styles.disabledButton,
                  ]}
                  onPress={() => setModalVisible(false)}
                  disabled={loadingStates.cancelReservation}
                >
                  <Text style={styles.modernCloseButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
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
  // Modern Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end", // Changed to slide from bottom
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modernModalContainer: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34, // Safe area padding
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF5E6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  modernModalTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 20,
    color: "#333",
    flex: 1,
  },
  closeIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBody: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  modernModalDetails: {
    gap: 16,
  },
  detailCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9500",
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF5E6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  statusIconContainer: {
    backgroundColor: "#4CAF50", // Will be overridden by dynamic color
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
  },
  detailSubValue: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: "#FF9500",
    marginTop: 2,
  },
  statusText: {
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    color: "#999",
    marginTop: 16,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "column",
    paddingHorizontal: 24,
    gap: 12,
  },
  modernCancelButton: {
    backgroundColor: "#F44336",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#F44336",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modernCancelButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "#FFF",
    marginLeft: 8,
  },
  modernCloseButton: {
    backgroundColor: "#F5F5F5",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  modernCloseButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "#666",
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
