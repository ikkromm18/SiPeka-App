import { Stack } from "expo-router";
import { AuthProvider } from "./context/AuthContext";
import "./global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#172E35" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false }} />
        <Stack.Screen name="auth/lupapassword" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="pindahDalamProvinsi" options={{ headerShown: true, title: "Pindah Dalam Provinsi" }} />
        <Stack.Screen name="pindahLuarProvinsi" options={{ headerShown: true, title: "Pindah Luar Provinsi" }} />
        <Stack.Screen name="ijinHajatan" options={{ headerShown: true, title: "Ijin Hajatan" }} />
        <Stack.Screen name="dispenNikah" options={{ headerShown: true, title: "Dispen Nikah" }} />
        <Stack.Screen name="pengajuans/[id]" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
