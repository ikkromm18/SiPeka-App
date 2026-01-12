import { API_BASE_URL } from "@/config/api";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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
    keterangan?: string; // alasan penolakan
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
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchHistory();
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    // ✅ Fungsi untuk hapus pengajuan
    const handleDelete = async (id: number, status: string) => {
        // Tidak bisa hapus yang sudah selesai
        if (status === 'selesai') {
            Alert.alert("Tidak Dapat Dihapus", "Pengajuan yang sudah selesai tidak dapat dihapus");
            return;
        }

        Alert.alert(
            "Konfirmasi Hapus",
            "Apakah Anda yakin ingin menghapus pengajuan ini?",
            [
                { text: "Batal", style: "cancel" },
                {
                    text: "Hapus",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem("token");
                            const response = await fetch(`${API_BASE_URL}/pengajuan/${id}`, {
                                method: "DELETE",
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    Accept: "application/json",
                                },
                            });

                            const result = await response.json();

                            if (response.ok) {
                                Alert.alert("Berhasil", result.message || "Pengajuan berhasil dihapus");
                                fetchHistory(); // Refresh data
                            } else {
                                Alert.alert("Error", result.message || "Gagal menghapus pengajuan");
                            }
                        } catch (error) {
                            console.error("Delete error:", error);
                            Alert.alert("Error", "Tidak dapat terhubung ke server");
                        }
                    },
                },
            ]
        );
    };

    // ✅ Fungsi untuk status badge
    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
            diajukan: { bg: "bg-yellow-500", text: "text-white", label: "Diajukan" },
            diproses: { bg: "bg-blue-500", text: "text-white", label: "Diproses" },
            ditolak: { bg: "bg-red-500", text: "text-white", label: "Ditolak" },
            selesai: { bg: "bg-green-500", text: "text-white", label: "Selesai" },
        };

        const config = statusConfig[status] || { bg: "bg-gray-500", text: "text-white", label: status };

        return (
            <View className={`px-2 py-1 rounded ${config.bg}`}>
                <Text className={`text-xs font-semibold ${config.text}`}>
                    {config.label}
                </Text>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-[#18353D]">
            <SafeAreaView>
                <ScrollView
                    className="px-6 py-4"
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#03BA9B"]}
                            tintColor="#03BA9B"
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
                                <View className="items-center justify-center p-8 mt-10">
                                    <Text className="text-lg text-white">
                                        Belum ada riwayat pengajuan
                                    </Text>
                                    <Text className="mt-2 text-sm text-gray-400">
                                        Silakan buat pengajuan baru
                                    </Text>
                                </View>
                            ) : (
                                data.map((item) => (
                                    <View
                                        key={item.id}
                                        className="mb-3 border border-gray-600 rounded-lg bg-[#1E4A54]"
                                    >
                                        {/* Header - Click untuk detail */}
                                        <TouchableOpacity
                                            onPress={() => router.push(`/pengajuans/${item.id}`)}
                                            className="flex flex-row items-center justify-between p-4"
                                        >
                                            <View className="flex flex-row items-center flex-1">
                                                <View className="bg-[#fff] rounded-full p-2">
                                                    <MaterialIcons
                                                        name="description"
                                                        size={30}
                                                        color="#03BA9B"
                                                    />
                                                </View>

                                                <View className="flex flex-col flex-1 ml-3">
                                                    <Text className="text-base font-semibold text-white">
                                                        {item.jenis_surats?.nama_jenis}
                                                    </Text>
                                                    <Text className="text-xs text-gray-300">
                                                        {new Date(item.created_at).toLocaleDateString("id-ID", {
                                                            day: "numeric",
                                                            month: "long",
                                                            year: "numeric",
                                                        })}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View className="flex flex-row items-center gap-3">
                                                {getStatusBadge(item.status)}
                                                <FontAwesome6
                                                    name="angle-right"
                                                    size={16}
                                                    color="white"
                                                />
                                            </View>
                                        </TouchableOpacity>

                                        {/* Alasan Penolakan jika status ditolak */}
                                        {item.status === "ditolak" && item.keterangan && (
                                            <View className="px-4 pb-3">
                                                <View className="p-3 bg-red-900/30 rounded-lg border border-red-700">
                                                    <Text className="mb-1 text-xs font-semibold text-red-300">
                                                        Alasan Penolakan:
                                                    </Text>
                                                    <Text className="text-sm text-red-200">
                                                        {item.keterangan}
                                                    </Text>
                                                </View>
                                            </View>
                                        )}

                                        {/* Action Buttons - Hanya untuk status tertentu */}
                                        {(item.status === "ditolak" || item.status === "diajukan") && (
                                            <View className="flex-row gap-2 px-4 pb-4">
                                                {/* Tombol Edit - Hanya untuk status ditolak */}
                                                {item.status === "ditolak" && (
                                                    <TouchableOpacity
                                                        onPress={() =>
                                                            router.push({
                                                                pathname: "/editPengajuan",
                                                                params: { id: item.id },
                                                            })
                                                        }
                                                        className="flex-1 p-3 bg-blue-600 rounded-lg"
                                                    >
                                                        <Text className="font-semibold text-center text-white">
                                                            Edit & Ajukan Ulang
                                                        </Text>
                                                    </TouchableOpacity>
                                                )}

                                                {/* Tombol Hapus */}
                                                <TouchableOpacity
                                                    onPress={() => handleDelete(item.id, item.status)}
                                                    className={`${item.status === "ditolak" ? "w-20" : "flex-1"
                                                        } p-3 bg-red-600 rounded-lg`}
                                                >
                                                    <Text className="font-semibold text-center text-white">
                                                        Hapus
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
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