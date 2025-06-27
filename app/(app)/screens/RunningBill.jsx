import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import { useAppStore } from "../../store/app-store";

export default function RunningBill() {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [description, setDescription] = useState("");

  const {
    runningBillData,
    loadingStates,
    fetchRunningBill,
    completeOrder,
    returnOrder,
  } = useAppStore();

  // Helper function to safely format numbers
  const formatPrice = (price) => {
    return typeof price === "number" && !isNaN(price)
      ? price.toFixed(2)
      : "0.00";
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchRunningBill();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load running bill",
        visibilityTime: 3000,
        autoHide: true,
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleOrderPress = (order) => {
    setSelectedOrder(order);
    setDescription("");
    setModalVisible(true);
  };

  const handleReturnOrder = async () => {
    if (!description.trim()) {
      Toast.show({
        type: "error",
        text1: "Description Required",
        text2: "Please provide a description for the return",
        visibilityTime: 3000,
        autoHide: true,
      });
      return;
    }

    Alert.alert("Return Order", "Are you sure you want to return this order?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Return",
        onPress: async () => {
          try {
            await returnOrder({
              id: selectedOrder.id,
              description: description.trim(),
            });

            Toast.show({
              type: "success",
              text1: "Order Returned",
              text2: "Your order return request has been submitted",
              visibilityTime: 3000,
              autoHide: true,
            });

            setModalVisible(false);
            setSelectedOrder(null);
            setDescription("");
          } catch (error) {
            Toast.show({
              type: "error",
              text1: "Return Failed",
              text2: error.message || "Failed to return order",
              visibilityTime: 3000,
              autoHide: true,
            });
          }
        },
      },
    ]);
  };

  const handleCompleteOrder = async () => {
    try {
      await completeOrder();
      Toast.show({
        type: "success",
        text1: "Order Completed",
        text2: "Thank you for dining with us!",
        visibilityTime: 3000,
        autoHide: true,
      });
      // Navigate back to Home after completion
      setTimeout(() => {
        navigation.navigate("Tabs");
      }, 2000);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to complete order",
        visibilityTime: 3000,
        autoHide: true,
      });
    }
  };

  useEffect(() => {
    const loadBill = async () => {
      try {
        await fetchRunningBill();
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to load running bill",
          visibilityTime: 3000,
          autoHide: true,
        });
      }
    };
    loadBill();
  }, []);

  const renderOrderCard = ({ item }) => {
    const orderDate = new Date(item.orderDate);
    const dateString = orderDate.toLocaleDateString();
    const timeString = orderDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => handleOrderPress(item)}
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
            <Text style={styles.totalAmount}>₱{formatPrice(item.total)}</Text>
          </View>
        </View>

        {/* Preview of first few items */}
        <View style={styles.itemsPreview}>
          {item.orders.slice(0, 2).map((order, index) => (
            <View key={index} style={styles.previewItem}>
              <Text style={styles.previewItemName}>{order.name}</Text>
              <Text style={styles.previewItemDetails}>
                Qty: {order.quantity} × ₱{formatPrice(order.price)}
              </Text>
            </View>
          ))}
          {item.orders.length > 2 && (
            <Text style={styles.moreItemsText}>
              +{item.orders.length - 2} more item
              {item.orders.length - 2 > 1 ? "s" : ""}
            </Text>
          )}
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.itemCount}>
            {item.orders.length} item{item.orders.length > 1 ? "s" : ""}
          </Text>
          <View style={styles.returnIconContainer}>
            <MaterialCommunityIcons
              name="keyboard-return"
              size={18}
              color="#FF9500"
            />
            <Text style={styles.returnText}>Return</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Calculate total amount for all orders
  const grandTotal =
    runningBillData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

  if (loadingStates.fetchRunningBill && !runningBillData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9500" />
        <Text style={styles.loadingText}>Loading your bill...</Text>
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
        <Text style={styles.headerTitle}>Running Bill</Text>
        <View style={styles.headerRight} />
      </LinearGradient>

      {runningBillData && runningBillData.length > 0 ? (
        <>
          <FlatList
            data={runningBillData}
            keyExtractor={(item) => item.id}
            renderItem={renderOrderCard}
            style={styles.ordersList}
            contentContainerStyle={styles.ordersListContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListHeaderComponent={
              <View style={styles.billSummary}>
                <Text style={styles.summaryTitle}>Current Orders</Text>
                <Text style={styles.summaryText}>
                  {runningBillData.length} order
                  {runningBillData.length > 1 ? "s" : ""} • Grand Total: ₱
                  {formatPrice(grandTotal)}
                </Text>
              </View>
            }
          />

          {/* Bottom Action Buttons */}
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={[
                styles.completeButton,
                loadingStates.doneQueue && styles.disabledButton,
              ]}
              onPress={handleCompleteOrder}
              disabled={loadingStates.doneQueue}
            >
              {loadingStates.doneQueue ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={20}
                    color="#FFF"
                  />
                  <Text style={styles.completeButtonText}>
                    Complete All Orders
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="receipt" size={64} color="#CCC" />
          <Text style={styles.emptyText}>No active orders</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Return Order Modal - Fixed spacing */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header - Fixed */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Return Order</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Scrollable Content - Fixed spacing */}
            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="always"
              removeClippedSubviews={false}
              scrollEventThrottle={16}
            >
              {/* Order Details */}
              {selectedOrder && (
                <View>
                  <Text style={styles.orderDetailsTitle}>Order Details:</Text>
                  <View style={styles.orderSummary}>
                    <Text style={styles.orderDate}>
                      {new Date(selectedOrder.orderDate).toLocaleDateString()} •{" "}
                      {new Date(selectedOrder.orderDate).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }
                      )}
                    </Text>
                    <Text style={styles.orderTotal}>
                      Total: ₱{formatPrice(selectedOrder.total)}
                    </Text>
                    <Text style={styles.itemCount}>
                      {selectedOrder.orders.length} item
                      {selectedOrder.orders.length > 1 ? "s" : ""}
                    </Text>
                  </View>

                  {/* Items List */}
                  <Text style={styles.itemsListTitle}>Items:</Text>
                  <View style={styles.itemsList}>
                    {selectedOrder.orders.map((order, index) => (
                      <View key={index} style={styles.modalOrderItem}>
                        <View style={styles.itemRow}>
                          <Text style={styles.modalItemName} numberOfLines={2}>
                            {order.name}
                          </Text>
                          <Text style={styles.itemPrice}>
                            ₱{formatPrice(order.price)}
                          </Text>
                        </View>
                        <Text style={styles.modalItemDetails}>
                          Quantity: {order.quantity} × ₱
                          {formatPrice(order.price)} = ₱
                          {formatPrice(order.quantity * order.price)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Description Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Reason for return <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Please describe the reason for returning this order..."
                  placeholderTextColor="#999"
                  multiline={true}
                  numberOfLines={4}
                  value={description}
                  onChangeText={setDescription}
                  textAlignVertical="top"
                  blurOnSubmit={false}
                  maxLength={500}
                />
                <Text style={styles.helperText}>
                  {description.length}/500 characters
                </Text>
              </View>
            </ScrollView>

            {/* Action Buttons - Fixed at bottom */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!description.trim() || loadingStates.returnOrder) &&
                    styles.disabledButton,
                ]}
                onPress={handleReturnOrder}
                disabled={!description.trim() || loadingStates.returnOrder}
              >
                {loadingStates.returnOrder ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="keyboard-return"
                      size={18}
                      color="#FFF"
                    />
                    <Text style={styles.submitButtonText}>Return Order</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  billSummary: {
    backgroundColor: "#FFF",
    margin: 15,
    marginBottom: 10,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    alignItems: "center",
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "Poppins_700Bold",
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins_400Regular",
  },
  ordersList: {
    flex: 1,
  },
  ordersListContent: {
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 15,
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
  itemsPreview: {
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  previewItem: {
    marginBottom: 6,
  },
  previewItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    fontFamily: "Poppins_600SemiBold",
  },
  previewItemDetails: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Poppins_400Regular",
  },
  moreItemsText: {
    fontSize: 12,
    color: "#FF9500",
    fontFamily: "Poppins_500Medium",
    fontStyle: "italic",
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
  returnIconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  returnText: {
    fontSize: 14,
    color: "#FF9500",
    fontFamily: "Poppins_500Medium",
    marginLeft: 4,
  },
  bottomActions: {
    backgroundColor: "#FFF",
    paddingHorizontal: 15,
    paddingVertical: 20,
    paddingBottom: 35,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  completeButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 12,
  },
  completeButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
    fontFamily: "Poppins_600SemiBold",
  },
  disabledButton: {
    opacity: 0.6,
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
  // Modal Styles - Simplified and fixed
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    height: "85%", // Fixed height
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "Poppins_700Bold",
  },
  closeButton: {
    padding: 5,
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    paddingBottom: 0, // Removed excessive padding
    flexGrow: 1,
  },
  orderDetailsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 12,
  },
  orderSummary: {
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
    padding: 15,
    marginBottom: 16, // Reduced margin
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins_400Regular",
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF9500",
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 4,
  },
  itemCount: {
    fontSize: 12,
    color: "#999",
    fontFamily: "Poppins_400Regular",
  },
  itemsListTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 8,
  },
  itemsList: {
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16, // Reduced margin
  },
  modalOrderItem: {
    paddingVertical: 8, // Reduced padding
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  modalItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    fontFamily: "Poppins_600SemiBold",
    flex: 1,
    marginRight: 10,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF9500",
    fontFamily: "Poppins_600SemiBold",
  },
  modalItemDetails: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Poppins_400Regular",
  },
  inputContainer: {
    marginBottom: 0, // Removed bottom margin - last element
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 8,
  },
  required: {
    color: "#FF4B4B",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    minHeight: 100, // Reduced height
    textAlignVertical: "top",
    backgroundColor: "#FFF",
  },
  helperText: {
    fontSize: 12,
    color: "#999",
    fontFamily: "Poppins_400Regular",
    marginTop: 4,
    textAlign: "right",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    backgroundColor: "#FFF",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F0F0F0",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    fontFamily: "Poppins_600SemiBold",
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#FF4B4B",
    paddingVertical: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
    fontFamily: "Poppins_600SemiBold",
    marginLeft: 6,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
