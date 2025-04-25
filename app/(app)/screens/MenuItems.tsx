import { StatusBar } from "expo-status-bar";
import { View, StyleSheet, Text, ActivityIndicator, Image } from "react-native";
import { useEffect } from "react";
import { useRoute } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { useAppStore } from "@/app/store/app-store";

export default function MenuItems() {
  const route = useRoute();
  const { category } = route.params as { category: string };

  const { menuItems, fetchMenuItems, loading, error } = useAppStore();

  useEffect(() => {
    fetchMenuItems(category);
  }, [category]);

  if (loading) {
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
      <FlashList
        data={menuItems}
        numColumns={2}
        keyExtractor={(item) => item.menu_id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.img_url }} style={styles.cardImage} />
            <View>
              <Text style={styles.cardTitle}>{item.name}</Text>
            </View>
            <View style={styles.cardPriceContainer}>
              <Text style={styles.cardPrice}>₱{item.price.toFixed(2)}</Text>
            </View>
          </View>
        )}
        estimatedItemSize={200}
        contentContainerStyle={styles.listContent}
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
    flex: 1,
    margin: 10,
    backgroundColor: "#FFF",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    height: 150,
  },
  cardTitle: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: "#FFF",
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    textAlign: "center",
    paddingVertical: 5,
  },
  cardPriceContainer: {
    backgroundColor: "#FF9500",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardPrice: {
    fontFamily: "Poppins_700Bold",
    fontSize: 14,
    color: "#FFF",
  },
});
