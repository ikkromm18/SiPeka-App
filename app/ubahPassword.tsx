import API_BASE_URL from "@/config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

const ubahPassword = () => {
    const router = useRouter();
    const [Password, setPassword] = useState("");
    const [NewPassword, setNewPassword] = useState("");
    const [NewPasswordConfirmation, setNewPasswordConfirmation] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {

        if (!Password || !NewPassword || !NewPasswordConfirmation) {
            alert("Semua field harus diisi");
            return;
        }

        setLoading(true);

        try {

            const token = await AsyncStorage.getItem("token");
            console.log("TOKEN:", token);

            if (!token) {
                Alert.alert("Error", "Token tidak ditemukan. Silakan login kembali.");
                setLoading(false);
                return;
            }

            // 🔹 Kirim request ke API
            const response = await fetch(`${API_BASE_URL}/ubahpassword`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    password: Password,
                    new_password: NewPassword,
                    new_password_confirmation: NewPasswordConfirmation,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert("Berhasil", "Password berhasil diubah.", [
                    { text: "OK", onPress: () => router.back() },
                ]);
            } else {
                Alert.alert("Gagal", data.message || "Gagal mengubah password.");
            }

        } catch (error) {
            console.error("Error:", error);
            Alert.alert("Kesalahan", "Terjadi kesalahan server.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <View className="items-center flex-1 p-8 bg-white">
            <StatusBar barStyle="dark-content" />


            <TextInput
                className="w-full p-4 mb-4 text-base border border-gray-300 rounded-lg"
                placeholder="Masukkan Password Lama"
                keyboardType="email-address"
                autoCapitalize="none"
                value={Password}
                onChangeText={setPassword}
            />
            <TextInput
                className="w-full p-4 mb-4 text-base border border-gray-300 rounded-lg"
                placeholder="Masukkan Password Baru"
                secureTextEntry={true}
                value={NewPassword}
                onChangeText={setNewPassword}
            />

            <TextInput
                className="w-full p-4 text-base border border-gray-300 rounded-lg"
                placeholder="Konfirmasi Password Baru"
                secureTextEntry={true}
                value={NewPasswordConfirmation}
                onChangeText={setNewPasswordConfirmation}
            />


            <TouchableOpacity
                onPress={handleChangePassword}
                disabled={loading}
                className="items-center justify-center w-full p-4 mt-4 bg-teal-500 rounded-lg shadow"
                activeOpacity={0.8}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text className="text-base font-bold text-white">Simpan</Text>
                )}
            </TouchableOpacity>

        </View>
    );
};

export default ubahPassword;
