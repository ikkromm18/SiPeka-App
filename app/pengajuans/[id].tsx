import API_BASE_URL from "@/config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";

type FieldSurat = {
    id: number;
    nama_field: string;
};

type DataPengajuan = {
    id: number;
    nilai: string;
    field_surats: FieldSurat;
};

type PengajuanDetail = {
    id: number;
    nik: string;
    name: string;
    email: string;
    alamat: string;
    status: string;
    keterangan: string | null;
    created_at: string;
    jenis_surats: {
        id: number;
        nama_jenis: string;
    };
    data_pengajuans: DataPengajuan[];
};

const downloadSurat = async (id: number) => {
    try {
        const token = await AsyncStorage.getItem("token");
        const downloadResumable = FileSystem.createDownloadResumable(
            `${API_BASE_URL}/pengajuan/${id}/cetak`,
            FileSystem.documentDirectory + `surat_${id}.pdf`, // ✅ ubah jadi pdf
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/pdf", // ✅ ubah jadi pdf
                },
            }
        );

        const { uri } = (await downloadResumable.downloadAsync()) as { uri: string };

        if (uri && (await Sharing.isAvailableAsync())) {
            await Sharing.shareAsync(uri, {
                mimeType: "application/pdf",
                dialogTitle: "Bagikan Surat PDF",
            });
        }
    } catch (e) {
        console.error("Gagal download:", e);
    }
};


export default function PengajuanDetail() {
    const { id } = useLocalSearchParams(); // ambil ID dari URL
    const [detail, setDetail] = useState<PengajuanDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                if (!token) return;

                const res = await fetch(`${API_BASE_URL}/pengajuan/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });

                if (!res.ok) {
                    console.log("❌ Gagal fetch detail:", await res.text());
                    return;
                }

                const json = await res.json();
                setDetail(json);
            } catch (error) {
                console.error("Error fetch detail pengajuan:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-[#18353D]">
                <ActivityIndicator size="large" color="#03BA9B" />
            </View>
        );
    }

    if (!detail) {
        return (
            <View className="flex-1 justify-center items-center bg-[#18353D]">
                <Text className="text-white">Detail pengajuan tidak ditemukan.</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-[#18353D] p-6">
            <View className="mb-8">


                <Text className="mb-4 text-2xl font-bold text-white">
                    {detail.jenis_surats?.nama_jenis}
                </Text>

                <Text className="text-white">Nama: {detail.name}</Text>
                <Text className="text-white">NIK: {detail.nik}</Text>
                <Text className="text-white">Email: {detail.email}</Text>
                <Text className="text-white">Alamat: {detail.alamat}</Text>
                <Text className="text-white">Status: {detail.status}</Text>
                {detail.keterangan && (
                    <Text className="text-white">Keterangan: {detail.keterangan}</Text>
                )}
                <Text className="mb-4 text-white">
                    Dibuat: {new Date(detail.created_at).toLocaleString()}
                </Text>

                <Text className="mb-2 text-lg font-semibold text-white">Data Isian:</Text>
                {detail.data_pengajuans.length === 0 ? (
                    <Text className="text-white">Tidak ada data tambahan.</Text>
                ) : (
                    detail.data_pengajuans.map((d) => (
                        <View
                            key={d.id}
                            className="bg-[#245059] p-3 rounded-lg mb-2"
                        >
                            <Text className="font-semibold text-white">{d.field_surats?.nama_field}</Text>
                            <Text className="text-white">{d.nilai}</Text>
                        </View>
                    ))
                )}

                {/* <TouchableOpacity
                    onPress={() => {
                        router.push(`/pengajuans/pdf-view?id=${detail.id}`);
                    }}
                    className="bg-[#03BA9B] p-3 rounded-lg mt-4 mb-8"
                >
                    <Text className="font-semibold text-center text-white">
                        Lihat PDF
                    </Text>
                </TouchableOpacity> */}

                <TouchableOpacity
                    onPress={() => {
                        router.push(`/pengajuans/pdf-view?id=${detail.id}`);
                    }}
                    className="bg-[#03BA9B] p-3 rounded-lg mt-4 mb-10"
                >
                    <Text className="font-semibold text-center text-white">
                        Lihat & Download Surat
                    </Text>
                </TouchableOpacity>

            </View>
        </ScrollView>
    );
}
