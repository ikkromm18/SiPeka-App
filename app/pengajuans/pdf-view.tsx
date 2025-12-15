import { API_BASE_URL } from "@/config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

export default function WordViewScreen() {
    const { id } = useLocalSearchParams();
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWordUrl = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                const res = await fetch(`${API_BASE_URL}/pengajuancetak${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });

                const data = await res.json();
                setFileUrl(data.url);
            } catch (err) {
                console.error("❌ Gagal ambil URL Word:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchWordUrl();
    }, [id]);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-[#18353D]">
                <ActivityIndicator size="large" color="#03BA9B" />
            </View>
        );
    }

    if (!fileUrl) {
        return (
            <View className="flex-1 justify-center items-center bg-[#18353D]">
                <Text className="text-white">Gagal memuat file Word</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 justify-center items-center bg-[#18353D]">
            <TouchableOpacity
                onPress={() => Linking.openURL(fileUrl)}
                className="bg-[#03BA9B] p-4 rounded-lg"
            >
                <Text className="font-semibold text-white">
                    Unduh Surat (.docx)
                </Text>
            </TouchableOpacity>
        </View>
    );
}
