import React, { useState, useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import { Button, Text } from "react-native-paper";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useAppStore } from "../store/app-store";
import { AppStackParamList } from "../app-types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "expo-router";
import Toast from "react-native-toast-message";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function Home() {
  type Navigation = NativeStackNavigationProp<AppStackParamList, "Home">;
  const navigation = useNavigation<Navigation>();
  const [refreshing, setRefreshing] = useState(false);

  const {
    reservations, // This should be a single reservation object, not an array
    fetchReservations,
    loadingStates,
    currentQueue,
    checkQueueStatus,
    checkLastSeated,
    cancelQueue,
    lastSeatedQueue,
    cancelReservation,
  } = useAppStore();

  // Simplified - just use the reservation directly since it's a single object
  const currentReservation = React.useMemo(() => {
    // If reservations is null/undefined or cancelled, return null
    if (!reservations || reservations.status?.toLowerCase() === "cancelled") {
      return null;
    }
    return reservations;
  }, [reservations]);

  // Refresh function
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await checkQueueStatus();
      await fetchReservations();
      if (currentQueue?.tier) {
        await checkLastSeated(currentQueue.tier);
      }
    } catch (error) {
      console.log("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  }, [currentQueue]);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      try {
        await checkQueueStatus();
      } catch (error) {
        console.log("No active queue found");
      }
      await fetchReservations();
    };
    initializeData();
  }, []);

  console.log(reservations);

  const handleCancelReservation = async () => {
    if (!currentReservation) return;

    Alert.alert(
      "Cancel Reservation",
      "Are you sure you want to cancel this reservation?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              // Pass just the reservation_id string
              await cancelReservation(currentReservation.reservation_id);

              await fetchReservations();

              Toast.show({
                type: "success",
                text1: "Reservation cancelled successfully",
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
          },
        },
      ]
    );
  };

  const handleCancelQueue = async () => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Home</Text>
      </View>
      <StatusBar hidden={false} backgroundColor="#FFF" />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Queue Card */}
        {currentQueue && (
          <View style={styles.queueCard}>
            <LinearGradient
              colors={["#FF9500", "#FFB84D"]}
              style={styles.queueGradient}
            >
              <Text style={styles.queueTitle}>
                Queue #{currentQueue.queueing_number}
              </Text>
              <Text style={styles.queueStatus}>{currentQueue.status}</Text>
            </LinearGradient>

            <View style={styles.queueContent}>
              <Text style={styles.servingLabel}>
                Now Serving: #{lastSeatedQueue?.queueingNumber || "-"}
              </Text>

              {currentQueue.status === "SEATED" ? (
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate("RunningBill")}
                  style={styles.billButton}
                >
                  View Bill
                </Button>
              ) : (
                <Button
                  mode="outlined"
                  onPress={handleCancelQueue}
                  style={styles.cancelButton}
                  textColor="#F44336"
                >
                  Cancel Queue
                </Button>
              )}
            </View>
          </View>
        )}

        {/* Reservation Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reservation</Text>

          {loadingStates.fetchReservations ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF9500" />
            </View>
          ) : currentReservation ? (
            <View style={styles.reservationCard}>
              <View style={styles.reservationInfo}>
                <Text style={styles.dateText}>
                  {formatDate(currentReservation.reservation_date)}
                </Text>
                <Text style={styles.timeText}>
                  {new Date(
                    currentReservation.reservation_date
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </Text>
                <Text style={styles.guestText}>
                  {currentReservation.num_people}{" "}
                  {currentReservation.num_people === 1 ? "Guest" : "Guests"}
                </Text>
              </View>

              {new Date(currentReservation.reservation_date) > new Date() &&
                currentReservation.status.toLowerCase() !== "cancelled" && (
                  <TouchableOpacity
                    style={styles.cancelIcon}
                    onPress={handleCancelReservation}
                  >
                    <MaterialCommunityIcons
                      name="close"
                      size={20}
                      color="#F44336"
                    />
                  </TouchableOpacity>
                )}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons
                name="calendar-plus"
                size={48}
                color="#CCC"
              />
              <Text style={styles.emptyText}>No reservation found</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate("CreateReservation")}
            style={styles.actionButton}
          >
            {currentReservation ? "Make New Reservation" : "Reserve a Table"}
          </Button>

          {!currentQueue && (
            <Button
              mode="contained"
              onPress={() => navigation.navigate("QRScanner")}
              style={styles.actionButton}
            >
              Start Queueing
            </Button>
          )}
        </View>

        <Toast />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
  },
  header: {
    backgroundColor: "#FF9500",
    paddingLeft: 15,
    paddingVertical: 10,
    marginTop: 35,
  },
  headerText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },

  // Queue Card
  queueCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 4,
  },
  queueGradient: {
    padding: 20,
    alignItems: "center",
  },
  queueTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
  },
  queueStatus: {
    fontSize: 14,
    color: "#FFF",
    opacity: 0.9,
  },
  queueContent: {
    padding: 20,
    alignItems: "center",
  },
  servingLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  billButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButton: {
    borderColor: "#F44336",
  },

  // Reservation Section
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  reservationCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
  },
  reservationInfo: {
    flex: 1,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  timeText: {
    fontSize: 16,
    color: "#FF9500",
    marginBottom: 4,
  },
  guestText: {
    fontSize: 14,
    color: "#666",
  },
  cancelIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFF0F0",
    justifyContent: "center",
    alignItems: "center",
  },

  // Empty State
  emptyCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#F0F0F0",
    borderStyle: "dashed",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 12,
  },

  // Loading
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },

  // Buttons
  buttonContainer: {
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: "#FF9500",
  },
});
