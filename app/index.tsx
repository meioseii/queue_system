import { Redirect } from "expo-router";
import React from "react";

const index = () => {
  return <Redirect href="./(auth)/Login" />;
};

export default index;
