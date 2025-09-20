import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "./global.css";


// --- tahan splash biar tidak langsung hilang
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // load font (atau bisa tambahkan asset lain di sini)
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      // kalau font sudah siap → tutup splash
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // kalau belum siap, jangan render apapun → biarkan splash tetap tampil
  if (!loaded) {
    return null;
  }


  return <Stack>
    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    <Stack.Screen name="pengajuans/[id]" options={{ headerShown: false }} />

  </Stack>;
}
