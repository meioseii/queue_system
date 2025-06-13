export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  SendOTP: undefined;
  VerifyOTP: { email: string }; // Add email parameter
  ChangePassword: undefined;
  // ... other routes
};