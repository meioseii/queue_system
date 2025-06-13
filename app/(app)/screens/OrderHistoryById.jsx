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
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import { useAppStore } from "../../store/app-store";

export default function OrderHistoryById() {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params;
  const [refreshing, setRefreshing] = useState(false);

  const { orderHistoryDetail, loadingStates, fetchOrderHistoryById } =
    useAppStore();

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchOrderHistoryById(orderId);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load order details",
        visibilityTime: 3000,
        autoHide: true,
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const loadOrderDetail = async () => {
      try {
        await fetchOrderHistoryById(orderId);
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to load order details",
          visibilityTime: 3000,
          autoHide: true,
        });
      }
    };
    loadOrderDetail();
  }, [orderId]);

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <View style={styles.orderInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>₱{item.price.toFixed(2)}</Text>
      </View>
      <View style={styles.quantityContainer}>
        <Text style={styles.quantityText}>Qty: {item.quantity}</Text>
        <Text style={styles.subtotalText}>
          ₱{(item.price * item.quantity).toFixed(2)}
        </Text>
      </View>
    </View>
  );

  if (loadingStates.fetchOrderHistoryById && !orderHistoryDetail) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9500" />
        <Text style={styles.loadingText}>Loading order details...</Text>
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

      {orderHistoryDetail ? (
        <FlatList
          data={orderHistoryDetail.orders}
          keyExtractor={(item, index) => `${item.product_id}-${index}`}
          renderItem={renderOrderItem}
          style={styles.ordersList}
          contentContainerStyle={styles.ordersListContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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
                    {new Date(
                      orderHistoryDetail.orderDate
                    ).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.billInfoRow}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={20}
                    color="#666"
                  />
                  <Text style={styles.billDetailText}>
                    {new Date(orderHistoryDetail.orderDate).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </Text>
                </View>
                {orderHistoryDetail.tableNumber > 0 && (
                  <View style={styles.billInfoRow}>
                    <MaterialCommunityIcons
                      name="table-furniture"
                      size={20}
                      color="#666"
                    />
                    <Text style={styles.billDetailText}>
                      Table {orderHistoryDetail.tableNumber}
                    </Text>
                  </View>
                )}
                <View style={styles.statusBadge}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={16}
                    color="#4CAF50"
                  />
                  <Text style={styles.statusText}>Paid</Text>
                </View>
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
                    ₱{orderHistoryDetail.total.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="receipt-outline"
            size={64}
            color="#CCC"
          />
          <Text style={styles.emptyText}>No order details available</Text>
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
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  statusText: {
    marginLeft: 6,
    fontSize: 12,
    color: "#4CAF50",
    fontFamily: "Poppins_600SemiBold",
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
