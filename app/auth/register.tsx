import API_BASE_URL from "@/config/api";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const Register = () => {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password || !passwordConfirmation) {
            Alert.alert("Error", "Semua field wajib diisi");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    password_confirmation: passwordConfirmation,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert("Berhasil", "Registrasi berhasil, silakan login", [
                    {
                        text: "OK",
                        onPress: () => router.replace("/auth/login"),
                    },
                ]);
            } else {
                Alert.alert("Gagal", data.message || "Registrasi gagal");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Tidak bisa konek ke server");
        } finally {
            setLoading(false);
        }
    };


    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <View className="items-center justify-center flex-1 p-8 bg-white">
                    <StatusBar barStyle="dark-content" />

                    <Image
                        source={require("../../assets/logo/auth-logo.png")}
                        className="w-28 h-28"
                        resizeMode="contain"
                    />

                    <Text className="mt-6 text-xl font-bold tracking-wider text-center text-gray-800">
                        REGISTER AKUN SIPEKA
                    </Text>
                    <Text className="mb-10 text-lg font-semibold text-center text-gray-600">
                        KECAMATAN PETATUKAN
                    </Text>

                    <TextInput
                        className="w-full p-4 mb-4 text-base border border-gray-300 rounded-lg"
                        placeholder="Masukkan Nama Lengkap Sesuai KTP"
                        value={name}
                        onChangeText={setName}
                    />

                    <TextInput
                        className="w-full p-4 mb-4 text-base border border-gray-300 rounded-lg"
                        placeholder="Masukkan Email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />

                    <TextInput
                        className="w-full p-4 mb-4 text-base border border-gray-300 rounded-lg"
                        placeholder="Password"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />

                    <TextInput
                        className="w-full p-4 text-base border border-gray-300 rounded-lg"
                        placeholder="Konfirmasi Password"
                        secureTextEntry
                        value={passwordConfirmation}
                        onChangeText={setPasswordConfirmation}
                    />

                    <TouchableOpacity
                        onPress={handleRegister}
                        disabled={loading}
                        className="items-center justify-center w-full p-4 mt-4 bg-teal-500 rounded-lg shadow"
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-base font-bold text-white">
                                Daftar Akun
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="mt-4 mb-6"
                        onPress={() => router.push("/auth/login")}
                    >
                        <Text className="font-semibold text-teal-600">
                            Sudah Punya Akun? Login
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default Register;
