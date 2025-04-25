import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { Text } from "react-native-paper";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../app-types";
import { FlashList } from "@shopify/flash-list";
import { useAppStore } from "../store/app-store";

const toTitleCase = (text: string) => {
  return text
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function Menu() {
  type Navigation = NativeStackNavigationProp<AppStackParamList, "Menu">;
  const navigation = useNavigation<Navigation>();

  const { categories, fetchCategories } = useAppStore();
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

  const handleNavigation = (category: string) => {
    navigation.navigate("MenuItems", { category });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Menu</Text>
      </View>
      <StatusBar hidden={false} backgroundColor="#FF9500"></StatusBar>
      <FlashList
        data={categories}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.imageURL }} style={styles.cardImage} />
            <View>
              <Text style={styles.cardTitle}>{toTitleCase(item.category)}</Text>
            </View>
            <TouchableOpacity style={styles.cardButton}>
              <Text style={styles.cardButtonText}>View More</Text>
            </TouchableOpacity>
          </View>
        )}
        estimatedItemSize={200}
        contentContainerStyle={styles.flashListContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: "#FAF9F6",
    marginTop: 36,
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
    paddingBottom: 120,
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
  cardButton: {
    backgroundColor: "#FF9500",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardButtonText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 14,
    color: "#FFF",
  },
});
