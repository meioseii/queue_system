import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";

import AuthLayout from "./(auth)/_layout";
import { Inter_900Black } from "@expo-google-fonts/inter";
import { useAuthStore } from "./store/auth-store";
import AppLayout from "./(app)/_layout";

export default function RootLayout() {
  const Stack = createNativeStackNavigator();
  const { token } = useAuthStore();

  return (
    <Stack.Navigator>
      {token ? (
        <Stack.Screen
          name="(app)"
          component={AppLayout}
          options={{ headerShown: false }}
        />
      ) : (
        <Stack.Screen
          name="(auth)"
          component={AuthLayout}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}
