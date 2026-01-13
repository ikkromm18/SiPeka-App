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
        <Stack.Screen name="notifikasi" options={{ headerShown: true, title: "Pemberitahuan" }} />
        <Stack.Screen name="editPengajuan" options={{ headerShown: true, title: "Edit Pengajuan" }} />





        <Stack.Screen name="editProfile" options={{
          headerShown: true, title: "Edit Profile"
        }} />
        <Stack.Screen name="ubahPassword" options={{ headerShown: true, title: "Ubah Password" }} />


        <Stack.Screen name="pengajuans/[id]" options={{ headerShown: true, title: "Detail Pengajuan" }} />


      </Stack>
    </AuthProvider>
  );
}
