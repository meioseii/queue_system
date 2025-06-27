import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import { useAppStore } from "../../store/app-store";

export default function RunningBillDetail() {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params;

  const { runningBillData } = useAppStore();

  // Find the specific order by ID
  const orderDetail = runningBillData?.find(order => order.id === orderId);

  // Helper function to safely format numbers
  const formatPrice = (price) => {
    return typeof price === "number" && !isNaN(price)
      ? price.toFixed(2)
      : "0.00";
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <View style={styles.orderInfo}>
        <Text style={styles.itemName}>{item.name || "Unknown Item"}</Text>
        <Text style={styles.itemPrice}>₱{formatPrice(item.price)}</Text>
      </View>
      <View style={styles.quantityContainer}>
        <Text style={styles.quantityText}>Qty: {item.quantity || 0}</Text>
        <Text style={styles.subtotalText}>
          ₱{formatPrice((item.price || 0) * (item.quantity || 0))}
        </Text>
      </View>
    </View>
  );

  if (!orderDetail) {
    return (
      <View style={styles.container}>
        <StatusBar hidden={false} backgroundColor="#FF9500" />
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
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={styles.headerRight} />
        </LinearGradient>

        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={64}
            color="#CCC"
          />
          <Text style={styles.emptyText}>Order not found</Text>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.refreshButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
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
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.headerRight} />
      </LinearGradient>

      <FlatList
        data={orderDetail.orders || []}
        keyExtractor={(item, index) => `${item.product_id || index}-${index}`}
        renderItem={renderOrderItem}
        style={styles.ordersList}
        contentContainerStyle={styles.ordersListContent}
        ListHeaderComponent={
          <View style={styles.billHeader}>
            <View style={styles.billInfo}>
              <View style={styles.billInfoRow}>
                <MaterialCommunityIcons
                  name="calendar"
                  size={20}
                  color="#666"
                />
                <Text style={styles.billDetailText}>
                  {orderDetail.orderDate
                    ? new Date(orderDetail.orderDate).toLocaleDateString()
                    : "N/A"}
                </Text>
              </View>
              <View style={styles.billInfoRow}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={20}
                  color="#666"
                />
                <Text style={styles.billDetailText}>
                  {orderDetail.orderDate
                    ? new Date(orderDetail.orderDate).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "N/A"}
                </Text>
              </View>
              {orderDetail.tableNumber > 0 && (
                <View style={styles.billInfoRow}>
                  <MaterialCommunityIcons
                    name="table-furniture"
                    size={20}
                    color="#666"
                  />
                  <Text style={styles.billDetailText}>
                    Table {orderDetail.tableNumber}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.ordersTitle}>Order Items</Text>
          </View>
        }
        ListFooterComponent={
          <View style={styles.billFooter}>
            <View style={styles.totalContainer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalAmount}>
                  ₱{formatPrice(orderDetail.total)}
                </Text>
              </View>
            </View>
          </View>
        }
      />

      <Toast />
    </View>
  );
}

// Use the same styles as RunningBill but add these specific ones
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
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
  billHeader: {
    backgroundColor: "#FFF",
    margin: 15,
    marginBottom: 10,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
  },
  billInfo: {
    marginBottom: 20,
  },
  billInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  billDetailText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins_400Regular",
  },
  ordersTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "Poppins_700Bold",
  },
  ordersList: {
    flex: 1,
  },
  ordersListContent: {
    paddingBottom: 20,
  },
  orderItem: {
    backgroundColor: "#FFF",
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 10,
    padding: 15,
    elevation: 2,
  },
  orderInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "Poppins_600SemiBold",
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    color: "#FF9500",
    fontFamily: "Poppins_500Medium",
  },
  quantityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins_400Regular",
  },
  subtotalText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "Poppins_600SemiBold",
  },
  billFooter: {
    backgroundColor: "#FFF",
    margin: 15,
    marginTop: 10,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
  },
  totalContainer: {
    borderTopWidth: 2,
    borderTopColor: "#E0E0E0",
    paddingTop: 15,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "Poppins_700Bold",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF9500",
    fontFamily: "Poppins_700Bold",
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