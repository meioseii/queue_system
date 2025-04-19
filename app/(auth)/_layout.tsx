import { NavigationIndependentTree } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../auth-types";
import Login from "./Login";
import Register from "./Register";
import Success from "./Success";
import SendOTP from "./SendOTP";
import VerifyOTP from "./VerifyOTP";
import { useAuthStore } from "../store/auth-store";
import ChangePassword from "./ChangePassword";
import Toast from "react-native-toast-message";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthLayout() {
  const { changePasswordToken } = useAuthStore();

  return (
    <>
      <NavigationIndependentTree>
        <Stack.Navigator>
          {changePasswordToken ? (
            <Stack.Screen
              name="ChangePassword"
              component={ChangePassword}
              options={{ headerShown: false }}
            />
          ) : (
            <>
              <Stack.Screen
                name="Login"
                component={Login}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Register"
                component={Register}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Success"
                component={Success}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="SendOTP"
                component={SendOTP}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="VerifyOTP"
                component={VerifyOTP}
                options={{ headerShown: false }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationIndependentTree>
      <Toast />
    </>
  );
}
