import API_BASE_URL from "@/config/api";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../context/AuthContext"; // pakai context

const Login = () => {
    const router = useRouter();
    const { login } = useAuth(); // ambil login dari context
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Email dan Password wajib diisi!");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok && data.token) {
                // Simpan via context (AsyncStorage + state)
                await login(data.token);

                // Redirect ke halaman utama
                router.replace("/(tabs)");
            } else {
                Alert.alert("Login Gagal", data.message || "Email/Password salah");
            }
        } catch (error) {
            Alert.alert("Error", "Email/Password Salah");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="items-center justify-center flex-1 p-8 bg-white">
            <StatusBar barStyle="dark-content" />

            <Image
                source={require("../../assets/logo/auth-logo.png")}
                className="w-28 h-28"
                resizeMode="contain"
            />

            <Text className="mt-6 text-xl font-bold tracking-wider text-center text-gray-800">
                SISTEM PELAYANAN ADMINISTRASI
            </Text>
            <Text className="mb-10 text-lg font-semibold text-center text-gray-600">
                KECAMATAN PETARUKAN
            </Text>

            <TextInput
                className="w-full p-4 mb-4 text-base border border-gray-300 rounded-lg"
                placeholder="Email atau Username"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                className="w-full p-4 text-base border border-gray-300 rounded-lg"
                placeholder="Password"
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
            />

            <TouchableOpacity
                className="self-end mt-2 mb-6"
                onPress={() => router.push("/auth/lupapassword")}
            >
                <Text className="font-semibold text-teal-600">Lupa Password</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                className="items-center justify-center w-full p-4 bg-teal-500 rounded-lg shadow"
                activeOpacity={0.8}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text className="text-base font-bold text-white">Login</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => router.push("/auth/register")}
                className="items-center justify-center w-full p-4 mt-4 border border-teal-500 rounded-lg"
                activeOpacity={0.8}
            >
                <Text className="text-base font-bold text-teal-500">Register</Text>
            </TouchableOpacity>

            <Link className="absolute bottom-16 text-zinc-300" href="/(tabs)">SiPeka App</Link>
        </View>
    );
};

export default Login;
