import API_BASE_URL from '@/config/api';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { Alert, Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

// 🧩 Tipe data user lengkap — agar tidak merah lagi
type User = {
    id?: number;
    name?: string;
    email?: string;
    foto_profil?: string; // ✅ tambahkan field ini
};

// Komponen item menu profil
type ProfileMenuItemProps = {
    icon: keyof typeof MaterialIcons.glyphMap;
    text: string;
    onPress?: () => void;
};

const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({ icon, text, onPress }) => (
    <TouchableOpacity
        activeOpacity={0.8}
        className="mb-3 overflow-hidden rounded-lg"
        onPress={onPress}
    >
        <LinearGradient
            colors={["#03B99A", "#016F5C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-row items-center justify-between p-4"
        >
            <View className="flex-row items-center">
                <MaterialIcons name={icon} size={22} color="#fff" />
                <Text className="ml-4 text-base font-medium text-white">{text}</Text>
            </View>
            <MaterialIcons name="edit" size={18} color="#fff" />
        </LinearGradient>
    </TouchableOpacity>
);

const Profile = () => {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null); // ✅ gunakan tipe User
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                if (!token) return;

                const res = await fetch(`${API_BASE_URL}/user`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    console.log("✅ Data user:", data);
                    setUser(data);
                } else {
                    console.log("⚠️ Gagal ambil user:", await res.text());
                }
            } catch (e) {
                console.log("❌ Error:", e);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const handleLogout = async () => {
        try {
            const token = await AsyncStorage.getItem("token");

            if (token) {
                const res = await fetch(`${API_BASE_URL}/logout`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });

                const data = await res.json();
                console.log("Logout response:", data);
            }

            await AsyncStorage.removeItem("token");
            router.replace("/auth/login");
        } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Gagal logout, coba lagi.");
        }
    };

    console.log(`${API_BASE_URL}/storage/${user?.foto_profil}`);


    return (

        <SafeAreaView className="flex-1 bg-[#18353D]">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 30 }}
            >
                <View className="p-6">
                    {/* Bagian Profil */}
                    <View className="items-center pt-16 mb-10">
                        <View className="relative">
                            <Image
                                source={{
                                    uri: user?.foto_profil
                                        ? `${API_BASE_URL}/storage/${user.foto_profil}`
                                        : 'https://i.pinimg.com/736x/76/f3/f3/76f3f3007969fd3b6db21c744e1ef289.jpg',
                                }}
                                className="rounded-full w-28 h-28 border-4 border-[#03BA9B]"
                            />
                        </View>

                        <Text className="mt-4 text-2xl font-bold text-[#03BA9B]">
                            {user?.name || "Guest"}
                        </Text>
                        <Text className="text-base text-white">
                            {user?.email || "Guest"}
                        </Text>
                    </View>

                    {/* Informasi Pribadi */}
                    <View className="mb-6">
                        <Text className="mb-4 text-lg font-bold text-white">Informasi Pribadi</Text>
                        <Link href="/editProfile" asChild>
                            <ProfileMenuItem icon="person-outline" text="Edit Profile" />
                        </Link>
                        <Link href="/ubahPassword" asChild>
                            <ProfileMenuItem icon="lock-outline" text="Ganti Password" />
                        </Link>
                    </View>

                    {/* Lainnya */}
                    <View className="mb-8">
                        <Text className="mb-4 text-lg font-bold text-white">Lainnya</Text>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            className="mb-3 overflow-hidden rounded-lg"
                            onPress={handleLogout}
                        >
                            <LinearGradient
                                colors={["#03B99A", "#016F5C"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                className="flex-row items-center justify-between p-4"
                            >
                                <View className="flex-row items-center">
                                    <MaterialIcons name="logout" size={22} color="#fff" />
                                    <Text className="ml-4 text-base font-medium text-white">Log Out</Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Profile;
