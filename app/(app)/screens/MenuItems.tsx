import { StatusBar } from "expo-status-bar";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  FlatList,
  Image,
} from "react-native";
import { useEffect } from "react";
import { useRoute } from "@react-navigation/native";
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
      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.menu_id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.img_url }} style={styles.cardImage} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
              <Text style={styles.cardPrice}>${item.price.toFixed(2)}</Text>
            </View>
          </View>
        )}
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
  cardPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF9500",
  },
});
