import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import {
  IconButton,
  Text,
  Button,
  Divider,
  Snackbar,
} from "react-native-paper";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../app-types";
import { useAppStore } from "../store/app-store";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { MenuItem } from "../store/app-store";
import { ConfirmationModal } from "./components";

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

const DEFAULT_IMAGE =
  "https://via.placeholder.com/300x200/FFEAD7/666666.png?text=No+Image";

type CartItem = {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  img_url?: string;
};

type Cart = {
  orders: CartItem[];
  price: number;
};

type CartContentProps = {
  cartItems: Cart;
  allMenuItems: MenuItem[];
  updatingItemId: string | null;
  deletingItemId: string | null;
  handleQuantityUpdate: (
    productId: string,
    action: "add" | "deduct"
  ) => Promise<void>;
  handleDelete: (item: CartItem) => void;
  checkout: () => Promise<void>;
  loadingStates: {
    checkout: boolean;
    [key: string]: boolean;
  };
};

export default function Orders() {
  type Navigation = NativeStackNavigationProp<AppStackParamList, "Orders">;
  const navigation = useNavigation<Navigation>();
  const {
    cartItems,
    fetchCart,
    loadingStates,
    allMenuItems,
    fetchAllMenuItems,
    updateCartItem,
    deleteCartItem,
    checkout,
  } = useAppStore();

  const cart = cartItems as unknown as Cart;
  const orders = cart?.orders || [];
  const totalPrice = cart?.price || 0;

  const [refreshing, setRefreshing] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const [loaded, error] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchAllMenuItems(), fetchCart()]);
        console.log("Cart Items:", JSON.stringify(cartItems, null, 2));
      } finally {
        setIsInitialLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    console.log("Cart Items Updated:", JSON.stringify(cartItems, null, 2));
  }, [cartItems]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchAllMenuItems(), fetchCart()]);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleQuantityUpdate = async (
    productId: string,
    action: "add" | "deduct"
  ) => {
    if (updatingItemId) return; // Prevent multiple simultaneous updates
    setUpdatingItemId(productId);
    try {
      await updateCartItem(productId, action);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleDeletePress = (item: CartItem) => {
    setSelectedItem(item);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    try {
      setDeletingItemId(selectedItem.product_id);
      await deleteCartItem(selectedItem.product_id);
    } finally {
      setDeletingItemId(null);
      setDeleteModalVisible(false);
      setSelectedItem(null);
    }
  };

  const handleCheckout = async () => {
    try {
      await checkout();
      setShowSuccessMessage(true);
      // Navigate to Menu after 2 seconds
      setTimeout(() => {
        navigation.navigate("Menu");
      }, 2000);
    } catch (error) {
      // Error is already handled by the store
    }
  };

  const getMenuItemImage = (productId: string): string => {
    const menuItem = allMenuItems.find((item) => item.menu_id === productId);
    return menuItem?.img_url || DEFAULT_IMAGE;
  };

  if (!loaded && !error) {
    return null;
  }

  const totalItems = orders.reduce(
    (sum: number, item: CartItem) => sum + item.quantity,
    0
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Cart</Text>
      </View>
      <StatusBar hidden={false} backgroundColor="#FFF" />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isInitialLoading ? (
          <View style={[styles.loadingContainer, { marginTop: 100 }]}>
            <ActivityIndicator size="large" color="#FF9500" />
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="cart-off" size={64} color="#666" />
            <Text style={styles.emptyText}>Your cart is empty</Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate("Menu")}
              style={styles.browseButton}
              labelStyle={styles.browseButtonLabel}
            >
              Browse Menu
            </Button>
          </View>
        ) : (
          <>
            <View style={styles.cartList}>
              {orders.map((item: CartItem) => {
                const isUpdating = updatingItemId === item.product_id;
                const isDeleting = deletingItemId === item.product_id;
                const imageUrl = getMenuItemImage(item.product_id);

                return (
                  <View key={item.product_id} style={styles.cartItem}>
                    <Image
                      source={{ uri: imageUrl }}
                      style={[
                        styles.itemImage,
                        isDeleting && styles.disabledImage,
                      ]}
                      placeholder={blurhash}
                      contentFit="cover"
                      transition={200}
                    />
                    <View style={styles.cartItemDetails}>
                      <Text
                        style={[
                          styles.productName,
                          isDeleting && styles.disabledText,
                        ]}
                        numberOfLines={2}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={[
                          styles.itemPrice,
                          isDeleting && styles.disabledText,
                        ]}
                      >
                        ₱{item.price.toFixed(2)}
                      </Text>
                      <View style={styles.bottomRow}>
                        <View style={styles.quantityContainer}>
                          <IconButton
                            icon="minus"
                            size={12}
                            mode="contained"
                            containerColor="#FF9500"
                            iconColor="#FFF"
                            style={[
                              styles.quantityButton,
                              (isUpdating || isDeleting) &&
                                styles.disabledButton,
                            ]}
                            onPress={() =>
                              handleQuantityUpdate(item.product_id, "deduct")
                            }
                            disabled={isUpdating || isDeleting}
                          />
                          <View style={styles.quantityWrapper}>
                            {isUpdating ? (
                              <ActivityIndicator size={16} color="#FF9500" />
                            ) : (
                              <Text
                                style={[
                                  styles.quantity,
                                  isDeleting && styles.disabledText,
                                ]}
                              >
                                {item.quantity}
                              </Text>
                            )}
                          </View>
                          <IconButton
                            icon="plus"
                            size={12}
                            mode="contained"
                            containerColor="#FF9500"
                            iconColor="#FFF"
                            style={[
                              styles.quantityButton,
                              (isUpdating || isDeleting) &&
                                styles.disabledButton,
                            ]}
                            onPress={() =>
                              handleQuantityUpdate(item.product_id, "add")
                            }
                            disabled={isUpdating || isDeleting}
                          />
                        </View>
                        {isDeleting ? (
                          <ActivityIndicator size={16} color="#FF4B4B" />
                        ) : (
                          <IconButton
                            icon="delete-outline"
                            size={14}
                            iconColor="#FF4B4B"
                            style={styles.deleteButton}
                            onPress={() => handleDeletePress(item)}
                          />
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
            <View style={styles.cartSummary}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              <View style={styles.summaryContent}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>
                    ₱{totalPrice.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Items</Text>
                  <Text style={styles.summaryValue}>{totalItems}</Text>
                </View>
                <Divider style={styles.divider} />
                <View style={[styles.summaryRow, styles.total]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>
                    ₱{totalPrice.toFixed(2)}
                  </Text>
                </View>
              </View>
              <Button
                mode="contained"
                style={styles.checkoutButton}
                labelStyle={styles.checkoutButtonLabel}
                onPress={handleCheckout}
                loading={loadingStates.checkout}
                disabled={loadingStates.checkout || orders.length === 0}
              >
                Place Order
              </Button>
            </View>
          </>
        )}
      </ScrollView>

      <ConfirmationModal
        visible={deleteModalVisible}
        title="Remove Item"
        message={`Remove ${selectedItem?.name || ""} from your cart?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedItem(null);
        }}
        confirmText="Remove"
        confirmColor="#FF4B4B"
        isLoading={loadingStates.deleteCart}
      />

      <Snackbar
        visible={showSuccessMessage}
        onDismiss={() => setShowSuccessMessage(false)}
        duration={2000}
        style={styles.snackbar}
        theme={{ colors: { surface: "#fff" } }}
      >
        <View style={styles.snackbarContent}>
          <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />
          <Text style={styles.snackbarText}>Order placed successfully!</Text>
        </View>
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F8",
    marginTop: 35,
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
  headerSubText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#fff",
    opacity: 0.8,
  },
  scrollView: {
    flexGrow: 1,
  },
  cartList: {
    padding: 10,
  },
  cartItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 8,
    overflow: "hidden",
    elevation: 2,
    flexDirection: "row",
    padding: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemImage: {
    width: 65,
    height: 65,
    borderRadius: 6,
    backgroundColor: "#f0f0f0",
  },
  cartItemDetails: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "space-between",
  },
  productName: {
    fontFamily: "Poppins_700Bold",
    fontSize: 13,
    color: "#1A1A1A",
    lineHeight: 18,
    marginBottom: 4,
  },
  itemPrice: {
    fontFamily: "Poppins_700Bold",
    fontSize: 13,
    color: "#FF9500",
    marginBottom: 4,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F8",
    borderRadius: 5,
    padding: 2,
    height: 26,
  },
  quantityButton: {
    margin: 0,
    width: 22,
    height: 22,
  },
  quantity: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    marginHorizontal: 6,
    minWidth: 18,
    textAlign: "center",
    color: "#1A1A1A",
  },
  deleteButton: {
    backgroundColor: "#FFF0F0",
    borderRadius: 5,
    width: 24,
    height: 24,
    margin: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAF9F6",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAF9F6",
    minHeight: "100%",
    paddingBottom: 100,
  },
  emptyText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    color: "#666",
    marginTop: 20,
    marginBottom: 20,
  },
  browseButton: {
    backgroundColor: "#FF9500",
    borderRadius: 12,
    paddingHorizontal: 24,
  },
  browseButtonLabel: {
    fontFamily: "Poppins_700Bold",
  },
  cartSummary: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 100,
  },
  summaryTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 16,
    color: "#1A1A1A",
    marginBottom: 12,
  },
  summaryContent: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#666",
  },
  summaryValue: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#1A1A1A",
  },
  divider: {
    marginVertical: 12,
    height: 1,
    backgroundColor: "#F0F0F0",
  },
  total: {
    marginTop: 6,
  },
  totalLabel: {
    fontFamily: "Poppins_700Bold",
    fontSize: 15,
    color: "#1A1A1A",
  },
  totalValue: {
    fontFamily: "Poppins_700Bold",
    fontSize: 15,
    color: "#FF9500",
  },
  checkoutButton: {
    backgroundColor: "#FF9500",
    paddingVertical: 2,
    borderRadius: 12,
  },
  checkoutButtonLabel: {
    fontFamily: "Poppins_700Bold",
    fontSize: 16,
  },
  quantityWrapper: {
    minWidth: 24,
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledImage: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
  disabledButton: {
    opacity: 0.5,
  },
  snackbar: {
    backgroundColor: "#FF9500",
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 100,
  },
  snackbarContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  snackbarText: {
    color: "#fff",
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
  },
});
