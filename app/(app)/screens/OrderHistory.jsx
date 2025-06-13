import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import { useAppStore } from "../../store/app-store";

export default function OrderHistory() {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const { orderHistory, loadingStates, fetchOrderHistory } = useAppStore();

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchOrderHistory();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load order history",
        visibilityTime: 3000,
        autoHide: true,
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const loadOrderHistory = async () => {
      try {
        await fetchOrderHistory();
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to load order history",
          visibilityTime: 3000,
          autoHide: true,
        });
      }
    };
    loadOrderHistory();
  }, []);

  const handleOrderPress = (orderId) => {
    navigation.navigate("OrderHistoryById", { orderId });
  };

  const renderOrderItem = ({ item }) => {
    const orderDate = new Date(item.orderDate);
    const dateString = orderDate.toLocaleDateString();
    const timeString = orderDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => handleOrderPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <View style={styles.dateTimeContainer}>
              <MaterialCommunityIcons name="calendar" size={16} color="#666" />
              <Text style={styles.dateText}>{dateString}</Text>
            </View>
            <View style={styles.dateTimeContainer}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={16}
                color="#666"
              />
              <Text style={styles.timeText}>{timeString}</Text>
            </View>
            {item.tableNumber > 0 && (
              <View style={styles.dateTimeContainer}>
                <MaterialCommunityIcons
                  name="table-furniture"
                  size={16}
                  color="#666"
                />
                <Text style={styles.tableText}>Table {item.tableNumber}</Text>
              </View>
            )}
          </View>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>₱{item.total.toFixed(2)}</Text>
          </View>
        </View>
        <View style={styles.orderFooter}>
          <Text style={styles.itemCount}>
            {item.orders.length} item{item.orders.length > 1 ? "s" : ""}
          </Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color="#FF9500"
          />
        </View>
      </TouchableOpacity>
    );
  };

  if (loadingStates.fetchOrderHistory && orderHistory.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9500" />
        <Text style={styles.loadingText}>Loading order history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden={false} backgroundColor="#FF9500" />

      {/* Header */}
      <LinearGradient
        colors={["#FF9500", "#FF9500"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
        <View style={styles.headerRight} />
      </LinearGradient>

      {orderHistory.length > 0 ? (
        <FlatList
          data={orderHistory}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          style={styles.ordersList}
          contentContainerStyle={styles.ordersListContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="history" size={64} color="#CCC" />
          <Text style={styles.emptyText}>No order history available</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      )}

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAF9F6",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
    fontFamily: "Poppins_400Regular",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingTop: 50,
    elevation: 4,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    fontFamily: "Poppins_700Bold",
  },
  headerRight: {
    width: 34,
  },
  ordersList: {
    flex: 1,
  },
  ordersListContent: {
    padding: 15,
    paddingBottom: 100,
  },
  orderCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  dateTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Poppins_500Medium",
    marginLeft: 6,
  },
  timeText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins_400Regular",
    marginLeft: 6,
  },
  tableText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins_400Regular",
    marginLeft: 6,
  },
  totalContainer: {
    alignItems: "flex-end",
  },
  totalLabel: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Poppins_400Regular",
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF9500",
    fontFamily: "Poppins_700Bold",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  itemCount: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins_400Regular",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 15,
    marginBottom: 20,
    fontFamily: "Poppins_400Regular",
  },
  refreshButton: {
    backgroundColor: "#FF9500",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontFamily: "Poppins_600SemiBold",
  },
});
