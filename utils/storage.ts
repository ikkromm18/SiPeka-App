// utils/storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveToken = async (token: string) => {
  try {
    await AsyncStorage.setItem("token", token);
  } catch (e) {
    console.log("Error saving token", e);
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem("token");
  } catch (e) {
    return null;
  }
};

export const clearToken = async () => {
  try {
    await AsyncStorage.removeItem("token");
  } catch (e) {
    console.log("Error clearing token", e);
  }
};
