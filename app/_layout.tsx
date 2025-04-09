import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";

import AuthLayout from "./(auth)/_layout";
import { Inter_900Black } from "@expo-google-fonts/inter";

export default function RootLayout() {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="(auth)"
        component={AuthLayout}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
