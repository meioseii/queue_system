import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useNavigation } from "expo-router";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../app-types";
import { StatusBar } from "expo-status-bar";

export default function QRScanner() {
  type Navigation = NativeStackNavigationProp<AppStackParamList, "QRScanner">;
  const navigation = useNavigation<Navigation>();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleScanData = (data: string) => {
    setScanned(true);
    // Here you can handle the queue data
    console.log("Scanned data:", data);
    // Navigate to appropriate screen
    navigation.navigate("Tabs");
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden={false} backgroundColor="#FF9500" />
      <View style={styles.header}>
        <Text style={styles.headerText}>Scan QR Code</Text>
      </View>
      <View style={styles.scannerContainer}>
        <CameraView
          style={styles.scanner}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={
            scanned ? undefined : ({ data }) => handleScanData(data)
          }
        />
        <View style={styles.overlay}>
          <View style={styles.scannerFrame} />
          <Text style={styles.instructions}>
            Position the QR code within the frame
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
    marginTop: 35,
  },
  header: {
    backgroundColor: "#FF9500",
    elevation: 5,
    paddingLeft: 15,
    paddingVertical: 10,
  },
  headerText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    color: "#fff",
  },
  scannerContainer: {
    flex: 1,
    position: "relative",
  },
  scanner: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "#FF9500",
    backgroundColor: "transparent",
  },
  instructions: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    marginTop: 20,
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 10,
    borderRadius: 5,
  },
  text: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    marginTop: 20,
  },
});
