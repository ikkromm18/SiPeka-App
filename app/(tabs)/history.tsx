import API_BASE_URL from "@/config/api";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Pengajuan = {
    id: number;
    jenis_surats: {
        id: number;
        nama_jenis: string;
    };
    status: string;
    created_at: string;
};

const History = () => {
    const [data, setData] = useState<Pengajuan[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            if (!token) return;

            const res = await fetch(`${API_BASE_URL}/pengajuan`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });
            const json = await res.json();
            console.log("📌 Response pengajuan:", json);

            if (Array.isArray(json)) {
                setData(json);
            } else if (Array.isArray(json.data)) {
                setData(json.data);
            } else {
                setData([]);
            }
        } catch (error) {
            console.error("❌ Error fetch history:", error);
            setData([]);
        } finally {
            setLoading(false);
            setRefreshing(false); // ✅ pastikan spinner berhenti juga saat selesai
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchHistory(); // ✅ ambil data ulang saat di-refresh
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    return (
        <View className="flex-1 bg-[#18353D]">
            <SafeAreaView>
                <ScrollView
                    className="px-6 py-4"
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#007AFF"]}
                        />
                    }
                >
                    <Text className="mt-8 mb-4 text-2xl font-semibold text-white">
                        Riwayat Pengajuan
                    </Text>

                    {loading ? (
                        <ActivityIndicator size="large" color="#03BA9B" />
                    ) : (
                        <View className="flex flex-col pb-36">
                            {data.length === 0 ? (
                                <Text className="text-center text-white">
                                    Belum ada riwayat pengajuan.
                                </Text>
                            ) : (
                                data.map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        onPress={() => router.push(`/pengajuans/${item.id}`)}
                                    >
                                        <View className="flex flex-row items-center justify-between border-b border-b-gray-600">
                                            <View className="flex flex-row items-center justify-center py-4">
                                                <View className="bg-[#fff] rounded-full p-2">
                                                    <MaterialIcons
                                                        name="description"
                                                        size={30}
                                                        color="#03BA9B"
                                                    />
                                                </View>

                                                <View className="flex flex-col flex-shrink ml-3">
                                                    <Text className="text-base font-normal text-white">
                                                        {item.jenis_surats?.nama_jenis}
                                                    </Text>
                                                    <Text className="text-xs font-light text-white">
                                                        {new Date(
                                                            item.created_at
                                                        ).toLocaleString()}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View className="flex flex-row gap-3">
                                                <Text className="px-1 text-xs font-normal text-white rounded bg-slate-500">
                                                    {item.status}
                                                </Text>

                                                <FontAwesome6
                                                    name="angle-right"
                                                    size={16}
                                                    color="white"
                                                />
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))
                            )}
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default History;
