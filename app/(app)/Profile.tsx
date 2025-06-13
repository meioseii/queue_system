import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { TextInput, Button, Text } from "react-native-paper";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  SafeAreaView,
} from "react-native";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../app-types";
import { useAuthStore } from "../store/auth-store";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAppStore } from "../store/app-store";
import { LinearGradient } from "expo-linear-gradient";
import { ConfirmationModal } from "./components";

const { width } = Dimensions.get("window");

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

interface ProfileOptionProps {
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  isLogout?: boolean;
}

export default function Profile() {
  type Navigation = NativeStackNavigationProp<AppStackParamList, "Profile">;
  const navigation = useNavigation<Navigation>();
  const { logout } = useAuthStore();
  const { userInfo, fetchUserProfile, loadingStates } = useAppStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const [loaded, error] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  if (loadingStates.fetchUserProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9500" />
      </View>
    );
  }

  const handleLogoutPress = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  const ProfileOption = ({
    title,
    icon,
    onPress,
    isLogout = false,
  }: ProfileOptionProps) => (
    <TouchableOpacity
      style={[
        styles.option,
        isLogout ? styles.logoutOption : styles.optionWithBorder,
      ]}
      onPress={onPress}
    >
      <View style={styles.optionContent}>
        <MaterialIcons
          name={icon}
          size={24}
          color={isLogout ? "#FF3B30" : "#FF9500"}
          style={styles.optionIcon}
        />
        <Text style={[styles.optionText, isLogout && styles.logoutText]}>
          {title}
        </Text>
      </View>
      <MaterialIcons
        name="chevron-right"
        size={24}
        color={isLogout ? "#FF3B30" : "#666"}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Profile</Text>
      </View>

      <StatusBar hidden={false} backgroundColor="#FFF" />

      <View style={styles.userInfoContainer}>
        <Text style={styles.userName}>
          {userInfo?.first_Name} {userInfo?.last_Name}
        </Text>
        <Text style={styles.userEmail}>{userInfo?.email}</Text>
      </View>

      <View style={styles.optionsContainer}>
        <ProfileOption
          title="Edit Profile"
          icon="person"
          onPress={() => navigation.navigate("EditProfile")}
        />
        <ProfileOption
          title="Change Password"
          icon="lock"
          onPress={() => navigation.navigate("ChangePassword")}
        />
        <ProfileOption
          title="Order History"
          icon="receipt-long"
          onPress={() => navigation.navigate("OrderHistory")}
        />
        <ProfileOption
          title="Logout"
          icon="logout"
          onPress={handleLogoutPress}
          isLogout
        />
      </View>

      <ConfirmationModal
        visible={showLogoutModal}
        title="Logout"
        message="Are you sure you want to logout?"
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutModal(false)}
        confirmText="Logout"
        isLoading={false}
      />
    </SafeAreaView>
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
  userInfoContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  userName: {
    fontFamily: "Poppins_700Bold",
    fontSize: 18,
    color: "#1A1A1A",
    marginBottom: 4,
  },
  userEmail: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#666666",
  },
  optionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  option: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionIcon: {
    marginRight: 12,
  },
  optionWithBorder: {
    borderWidth: 0,
  },
  logoutOption: {
    backgroundColor: "#FFF5F5",
    marginTop: 24,
  },
  optionText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    color: "#333",
  },
  logoutText: {
    color: "#FF3B30",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAF9F6",
  },
});
