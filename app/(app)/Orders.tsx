import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { TextInput, Button, Text, IconButton } from "react-native-paper";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../app-types";
import { useAuthStore } from "../store/auth-store";
import { FlashList } from "@shopify/flash-list";
import { useAppStore } from "../store/app-store";

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

interface CartItem {
  id: string;
  name: string;
  imageURL: string;
  price: number;
  quantity: number;
}

const mockCartItems: CartItem[] = [
  {
    id: "1",
    name: "Chicken Burger",
    imageURL:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500",
    price: 9.99,
    quantity: 0,
  },
  {
    id: "2",
    name: "Pizza Margherita",
    imageURL:
      "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?q=80&w=500",
    price: 12.99,
    quantity: 0,
  },
  {
    id: "3",
    name: "French Fries Chocolate Milkshake",
    imageURL:
      "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?q=80&w=500",
    price: 4.99,
    quantity: 0,
  },
  {
    id: "4",
    name: "Chocolate Milkshake Chocolate Milkshake Chocolate Milkshake",
    imageURL:
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=500",
    price: 5.99,
    quantity: 0,
  },
  {
    id: "5",
    name: "Chocolate Milkshake Chocolate Milkshake Chocolate Milkshake",
    imageURL:
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=500",
    price: 5.99,
    quantity: 0,
  },
  {
    id: "6",
    name: "Chocolate Milkshake Chocolate Milkshake Chocolate Milkshake",
    imageURL:
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=500",
    price: 5.99,
    quantity: 0,
  },
];

export default function Orders() {
  type Navigation = NativeStackNavigationProp<AppStackParamList, "Orders">;
  const navigation = useNavigation<Navigation>();
  const { logout } = useAuthStore();
  const { categories, fetchCategories } = useAppStore();

  // Initialize cart items with mock data
  const [cartItems, setCartItems] = useState<CartItem[]>(mockCartItems);

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
    fetchCategories();
  }, []);

  if (!loaded && !error) {
    return null;
  }

  const updateQuantity = (id: string, increment: boolean) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const newQuantity = increment
            ? item.quantity + 1
            : Math.max(0, item.quantity - 1);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const calculateItemTotal = (price: number, quantity: number) => {
    return (price * quantity).toFixed(2);
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Cart</Text>
        </View>
        <StatusBar hidden={false} backgroundColor="#FF9500"></StatusBar>

        <FlashList
          data={cartItems}
          renderItem={({ item }) => (
            <View style={styles.cartItem}>
              <Image
                source={{ uri: item.imageURL }}
                style={styles.cartImage}
                placeholder={blurhash}
              />
              <View style={styles.cartItemDetails}>
                <Text style={styles.productName}>{item.name}</Text>
                <View style={styles.quantityContainer}>
                  <IconButton
                    icon="minus"
                    size={20}
                    onPress={() => updateQuantity(item.id, false)}
                    style={styles.quantityButton}
                  />
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <IconButton
                    icon="plus"
                    size={20}
                    onPress={() => updateQuantity(item.id, true)}
                    style={styles.quantityButton}
                  />
                </View>
                <Text style={styles.price}>
                  ${calculateItemTotal(item.price, item.quantity)}
                </Text>
              </View>
            </View>
          )}
          estimatedItemSize={200}
          contentContainerStyle={styles.flashListContent}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: "#FAF9F6",
    marginTop: 35,
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
  flashListContent: {
    paddingTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 120,
  },
  cartItem: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#fff",
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
    elevation: 2,
  },
  cartImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  cartItemDetails: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "space-between",
  },
  productName: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    marginBottom: 5,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
    width: 120,
    justifyContent: "space-between",
  },
  quantityButton: {
    margin: 0,
    width: 36,
  },
  quantity: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    width: 30,
    textAlign: "center",
  },
  price: {
    fontFamily: "Poppins_700Bold",
    fontSize: 16,
    color: "#FF9500",
  },
});
