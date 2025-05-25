import { StatusBar } from "expo-status-bar";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  FlatList,
  Image,
  ToastAndroid,
  Platform,
} from "react-native";
import { useState, useEffect } from "react";
import { useRoute } from "@react-navigation/native";
import { useAppStore } from "@/app/store/app-store";
import { Button } from "react-native-paper";
import ConfirmationModal from "../components/ConfirmationModal";

export default function MenuItems() {
  const route = useRoute();
  const { category } = route.params as { category: string };
  const { menuItems, fetchMenuItems, loadingStates, error, addToCart } =
    useAppStore();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchMenuItems(category);
  }, [category]);

  const showToast = (message: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    }
  };

  const handleAddToCart = async (item: any) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleConfirmAdd = async () => {
    try {
      await addToCart({
        product_id: selectedItem.menu_id,
        name: selectedItem.name,
        quantity: 1,
      });
      showToast(`${selectedItem.name} added to cart`);
    } catch (error) {
      showToast("Failed to add item to cart");
    } finally {
      setModalVisible(false);
      setSelectedItem(null);
    }
  };

  if (loadingStates.fetchMenuItems) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9500" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden={false} backgroundColor="#FF9500" />
      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.menu_id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.img_url }} style={styles.cardImage} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardPrice}>₱{item.price.toFixed(2)}</Text>
                <Button
                  mode="contained"
                  onPress={() => handleAddToCart(item)}
                  style={styles.addButton}
                  loading={
                    loadingStates.addToCart &&
                    selectedItem?.menu_id === item.menu_id
                  }
                  disabled={loadingStates.addToCart}
                >
                  Add to Cart
                </Button>
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />

      <ConfirmationModal
        visible={modalVisible}
        title="Add to Cart"
        message={`Add ${selectedItem?.name || ""} to your cart?`}
        onConfirm={handleConfirmAdd}
        onCancel={() => {
          setModalVisible(false);
          setSelectedItem(null);
        }}
        confirmText="Add"
        isLoading={loadingStates.addToCart}
      />
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAF9F6",
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
  listContent: {
    padding: 10,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    marginBottom: 10,
    overflow: "hidden",
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    height: 150,
  },
  cardContent: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF9500",
  },
  addButton: {
    backgroundColor: "#FF9500",
  },
});
