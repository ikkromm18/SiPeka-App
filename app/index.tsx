import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="items-center justify-center flex-1">
      <Text className="text-5xl">Welcome</Text>
      <Link href="/onboarding" className="text-blue-500">Onboarding</Link>
    </View>
  );
}
