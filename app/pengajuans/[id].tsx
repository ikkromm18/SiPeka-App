import { API_BASE_URL, IMAGE_BASE_URL } from "@/config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Linking,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

/* =======================
   TYPE DEFINITIONS
======================= */

type FieldSurat = {
    id: number;
    nama_field: string;
};

type DataPengajuan = {
    id: number;
    nilai: string; // path file atau text
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

/* =======================
   FILE HELPERS (FINAL)
======================= */

// 🔥 SATU PINTU URL FILE (TANPA /api)
const getFileUrl = (path?: string) => {
    if (!path) return "";

    const cleanPath = path
        .replace(/^\/+/, "") // hapus slash depan
        .replace(/^api\//, ""); // jaga-jaga kalau backend salah

    return `${IMAGE_BASE_URL}/${cleanPath}`;
};

const getExt = (value: string) =>
    value?.split(".").pop()?.toLowerCase() || "";

const isImage = (ext: string) =>
    ["jpg", "jpeg", "png", "webp"].includes(ext);

const isPdf = (ext: string) => ext === "pdf";

const isFile = (ext: string) =>
    ["pdf", "doc", "docx", "xls", "xlsx", "zip"].includes(ext);

/* =======================
   FILE ACTIONS
======================= */

// 🔥 OPEN FILE LANGSUNG (TANPA API)
const openFile = async (path: string) => {
    const url = getFileUrl(path);
    console.log("OPEN FILE:", url);
    await Linking.openURL(url);
};

// 🔥 DOWNLOAD PDF SURAT (INI MEMANG API)
const downloadSurat = async (id: number) => {
    try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        const downloadResumable = FileSystem.createDownloadResumable(
            `${API_BASE_URL}/pengajuan/${id}/cetak`,
            FileSystem.documentDirectory + `surat_${id}.pdf`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/pdf",
                },
            }
        );

        const result = await downloadResumable.downloadAsync();
        if (!result?.uri) return;

        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(result.uri, {
                mimeType: "application/pdf",
                dialogTitle: "Bagikan Surat PDF",
            });
        }
    } catch (e) {
        console.error("❌ Gagal download:", e);
    }
};

/* =======================
   MAIN COMPONENT
======================= */

export default function PengajuanDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [detail, setDetail] = useState<PengajuanDetail | null>(null);
    const [loading, setLoading] = useState(true);

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
                    console.log("❌ Fetch error:", await res.text());
                    return;
                }

                const json = await res.json();
                setDetail(json);
            } catch (error) {
                console.error("❌ Error fetch detail:", error);
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

    const isCompleted = detail.status?.toLowerCase() === "selesai";

    return (
        <ScrollView className="flex-1 bg-[#18353D] pb-20 pt-6 pr-6 pl-6">
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

            <Text className="mb-2 text-lg font-semibold text-white">
                Data Isian:
            </Text>

            {detail.data_pengajuans.length === 0 ? (
                <Text className="text-white">Tidak ada data tambahan.</Text>
            ) : (
                detail.data_pengajuans.map((d) => {
                    const ext = getExt(d.nilai);
                    const fileUrl = getFileUrl(d.nilai);

                    console.log("RAW PATH :", d.nilai);
                    console.log("FINAL URL:", fileUrl);

                    return (
                        <View
                            key={d.id}
                            className="bg-[#245059] p-3 rounded-lg mb-2"
                        >
                            <Text className="mb-1 font-semibold text-white">
                                {d.field_surats?.nama_field}
                            </Text>

                            {/* IMAGE */}
                            {isImage(ext) && (
                                <TouchableOpacity onPress={() => openFile(d.nilai)}>
                                    <Image
                                        source={{ uri: fileUrl }}
                                        style={{ height: 200, borderRadius: 8 }}
                                        resizeMode="cover"
                                    />
                                    <Text className="mt-1 text-xs text-gray-300">
                                        Ketuk untuk melihat gambar
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {/* PDF */}
                            {isPdf(ext) && (
                                <TouchableOpacity
                                    onPress={() => openFile(d.nilai)}
                                    className="mt-2 bg-[#03BA9B] p-2 rounded"
                                >
                                    <Text className="text-white">Lihat PDF</Text>
                                </TouchableOpacity>
                            )}

                            {/* FILE LAIN */}
                            {!isImage(ext) && !isPdf(ext) && isFile(ext) && (
                                <TouchableOpacity
                                    onPress={() => openFile(d.nilai)}
                                    className="p-2 mt-2 bg-gray-600 rounded"
                                >
                                    <Text className="text-white">Download File</Text>
                                </TouchableOpacity>
                            )}

                            {/* TEXT */}
                            {!isFile(ext) && (
                                <Text className="text-white">{d.nilai}</Text>
                            )}
                        </View>
                    );
                })
            )}

            <TouchableOpacity
                disabled={!isCompleted}
                onPress={() =>
                    router.push(`/pengajuans/pdf-view?id=${detail.id}`)
                }
                className={`${isCompleted ? "bg-[#03BA9B]" : "bg-gray-500 opacity-60"
                    } p-3 rounded-lg mt-4 mb-10`}
            >
                <Text className="font-semibold text-center text-white">
                    {isCompleted
                        ? "Lihat & Download Surat"
                        : "Menunggu Selesai..."}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                disabled={true}

                className={`${isCompleted ? "bg-[#18353D]" : "bg-[#18353D] opacity-60"
                    } p-3 rounded-lg mt-4 mb-10`}
            >

            </TouchableOpacity>
        </ScrollView>
    );
}
