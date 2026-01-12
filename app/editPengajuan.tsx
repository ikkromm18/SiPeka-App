import { API_BASE_URL, IMAGE_BASE_URL } from "@/config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

/* ================== TYPES ================== */
type FieldData = {
    id: number;
    field_surats: {
        id: number;
        nama_field: string;
        tipe_field: string;
        is_required: boolean;
    };
    nilai: string;
};

type PengajuanDetail = {
    id: number;
    name: string;
    email: string;
    alamat: string;
    status: string;
    keterangan?: string;
    jenis_surats: {
        id: number;
        nama_jenis: string;
    };
    data_pengajuans: FieldData[];
};

type FileState = {
    uri: string;
    name: string;
    type: string;
    isLocal: boolean;
};

/* ================== COMPONENT ================== */
export default function EditPengajuan() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const pengajuanId = params.id;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [pengajuan, setPengajuan] = useState<PengajuanDetail | null>(null);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [files, setFiles] = useState<Record<number, FileState>>({});

    /* ================== FETCH DETAIL PENGAJUAN ================== */
    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                if (!token) {
                    Alert.alert("Error", "Token tidak ditemukan");
                    return;
                }

                const response = await fetch(
                    `${API_BASE_URL}/pengajuan/${pengajuanId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }
                );

                const data = await response.json();
                console.log("📌 Detail pengajuan:", data);

                if (data) {
                    setPengajuan(data);

                    // Set form data dari pengajuan
                    const initialForm: Record<string, any> = {
                        name: data.name,
                        email: data.email,
                        alamat: data.alamat,
                    };

                    // Set nilai field dari data_pengajuans
                    const initialFiles: Record<number, FileState> = {};
                    data.data_pengajuans?.forEach((item: FieldData) => {
                        const fieldId = item.field_surats.id;

                        if (item.field_surats.tipe_field === 'file') {
                            // Jika field adalah file
                            if (item.nilai) {
                                initialFiles[fieldId] = {
                                    uri: `${IMAGE_BASE_URL}/${item.nilai}`,
                                    name: item.nilai.split('/').pop() || 'file',
                                    type: 'application/pdf',
                                    isLocal: false,
                                };
                            }
                        } else {
                            // Field text/number/dll
                            initialForm[`field_${fieldId}`] = item.nilai;
                        }
                    });

                    setFormData(initialForm);
                    setFiles(initialFiles);
                } else {
                    Alert.alert("Error", "Gagal memuat data pengajuan");
                    router.back();
                }
            } catch (error) {
                console.error("Fetch error:", error);
                Alert.alert("Error", "Tidak dapat terhubung ke server");
                router.back();
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [pengajuanId]);

    /* ================== PICK FILE ================== */
    const pickFile = async (fieldId: number) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["application/pdf", "image/jpeg", "image/png"],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                setFiles({
                    ...files,
                    [fieldId]: {
                        uri: asset.uri,
                        name: asset.name,
                        type: asset.mimeType || "application/pdf",
                        isLocal: true,
                    },
                });
            }
        } catch (error) {
            console.error("File picker error:", error);
            Alert.alert("Error", "Gagal memilih file");
        }
    };

    /* ================== UPDATE FORM DATA ================== */
    const updateFormData = (key: string, value: any) => {
        setFormData({ ...formData, [key]: value });
    };

    /* ================== SUBMIT UPDATE ================== */
    const handleSubmit = async () => {
        // Validasi required fields
        const missingFields = pengajuan?.data_pengajuans?.filter((item) => {
            if (!item.field_surats.is_required) return false;

            const fieldId = item.field_surats.id;
            const fieldKey = `field_${fieldId}`;

            if (item.field_surats.tipe_field === 'file') {
                return !files[fieldId];
            } else {
                return !formData[fieldKey];
            }
        });

        if (missingFields && missingFields.length > 0) {
            Alert.alert("Error", "Mohon lengkapi semua field yang wajib diisi");
            return;
        }

        Alert.alert(
            "Konfirmasi",
            "Apakah Anda yakin ingin mengajukan ulang pengajuan ini?",
            [
                { text: "Batal", style: "cancel" },
                {
                    text: "Ya, Ajukan",
                    onPress: async () => {
                        setSubmitting(true);
                        try {
                            const token = await AsyncStorage.getItem("token");
                            if (!token) {
                                Alert.alert("Error", "Token tidak ditemukan");
                                return;
                            }

                            const formDataToSend = new FormData();

                            // Append basic data
                            formDataToSend.append("name", formData.name);
                            formDataToSend.append("email", formData.email);
                            formDataToSend.append("alamat", formData.alamat);

                            // Append fields data
                            pengajuan?.data_pengajuans?.forEach((item) => {
                                const fieldId = item.field_surats.id;
                                const fieldKey = `field_${fieldId}`;

                                if (item.field_surats.tipe_field === 'file') {
                                    // Handle file upload
                                    const file = files[fieldId];
                                    if (file?.isLocal) {
                                        const uriParts = file.uri.split(".");
                                        const fileType = uriParts[uriParts.length - 1];

                                        formDataToSend.append(`fields[${fieldId}]`, {
                                            uri: Platform.OS === "ios"
                                                ? file.uri.replace("file://", "")
                                                : file.uri,
                                            type: file.type,
                                            name: `file_${fieldId}_${Date.now()}.${fileType}`,
                                        } as any);
                                    }
                                } else {
                                    // Handle text/number fields
                                    if (formData[fieldKey]) {
                                        formDataToSend.append(
                                            `fields[${fieldId}]`,
                                            formData[fieldKey]
                                        );
                                    }
                                }
                            });

                            const response = await fetch(
                                `${API_BASE_URL}/pengajuan/${pengajuanId}/update`,
                                {
                                    method: "POST",
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                        "Content-Type": "multipart/form-data",
                                        Accept: "application/json",
                                    },
                                    body: formDataToSend,
                                }
                            );

                            const result = await response.json();
                            console.log("📌 Update response:", result);

                            if (response.ok) {
                                Alert.alert(
                                    "Berhasil",
                                    result.message || "Pengajuan berhasil diperbarui dan diajukan ulang",
                                    [
                                        {
                                            text: "OK",
                                            onPress: () => router.back(),
                                        },
                                    ]
                                );
                            } else {
                                Alert.alert(
                                    "Error",
                                    result.message || "Gagal memperbarui pengajuan"
                                );
                            }
                        } catch (error) {
                            console.error("Submit error:", error);
                            Alert.alert("Error", "Tidak dapat terhubung ke server");
                        } finally {
                            setSubmitting(false);
                        }
                    },
                },
            ]
        );
    };

    /* ================== LOADING ================== */
    if (loading) {
        return (
            <View className="items-center justify-center flex-1 bg-white">
                <ActivityIndicator size="large" color="#03B798" />
                <Text className="mt-4 text-gray-600">Memuat data...</Text>
            </View>
        );
    }

    if (!pengajuan) {
        return null;
    }

    /* ================== RENDER ================== */
    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="p-6 bg-teal-600">
                <TouchableOpacity onPress={() => router.back()} className="mb-4">
                    <Text className="text-white">← Kembali</Text>
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-white">
                    Edit & Ajukan Ulang
                </Text>
                <Text className="mt-1 text-sm text-teal-100">
                    {pengajuan.jenis_surats.nama_jenis}
                </Text>
            </View>

            <ScrollView className="flex-1 p-6">
                {/* Alasan Penolakan */}
                {pengajuan.keterangan && (
                    <View className="p-4 mb-6 bg-red-50 rounded-lg border border-red-200">
                        <Text className="mb-2 text-sm font-bold text-red-800">
                            Alasan Penolakan:
                        </Text>
                        <Text className="text-sm text-red-700">
                            {pengajuan.keterangan}
                        </Text>
                    </View>
                )}

                {/* Basic Info */}
                <View className="mb-4">
                    <Text className="mb-2 font-semibold text-gray-700">
                        Nama Lengkap <Text className="text-red-500">*</Text>
                    </Text>
                    <TextInput
                        className="p-3 border border-gray-300 rounded-lg"
                        placeholder="Nama Lengkap"
                        value={formData.name}
                        onChangeText={(text) => updateFormData("name", text)}
                        style={{ color: "#111827" }}
                    />
                </View>

                <View className="mb-4">
                    <Text className="mb-2 font-semibold text-gray-700">
                        Email <Text className="text-red-500">*</Text>
                    </Text>
                    <TextInput
                        className="p-3 border border-gray-300 rounded-lg"
                        placeholder="Email"
                        value={formData.email}
                        onChangeText={(text) => updateFormData("email", text)}
                        keyboardType="email-address"
                        style={{ color: "#111827" }}
                    />
                </View>

                <View className="mb-4">
                    <Text className="mb-2 font-semibold text-gray-700">
                        Alamat <Text className="text-red-500">*</Text>
                    </Text>
                    <TextInput
                        className="p-3 border border-gray-300 rounded-lg"
                        placeholder="Alamat"
                        value={formData.alamat}
                        onChangeText={(text) => updateFormData("alamat", text)}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                        style={{ color: "#111827" }}
                    />
                </View>

                {/* Dynamic Fields */}
                {pengajuan.data_pengajuans?.map((item) => {
                    const fieldId = item.field_surats.id;
                    const fieldKey = `field_${fieldId}`;
                    const field = item.field_surats;

                    if (field.tipe_field === 'file') {
                        return (
                            <View key={fieldId} className="mb-4">
                                <Text className="mb-2 font-semibold text-gray-700">
                                    {field.nama_field}
                                    {field.is_required && (
                                        <Text className="text-red-500"> *</Text>
                                    )}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => pickFile(fieldId)}
                                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg"
                                >
                                    <Text className="text-center text-gray-600">
                                        {files[fieldId]
                                            ? `📄 ${files[fieldId].name}`
                                            : `📎 Pilih file ${field.nama_field}`}
                                    </Text>
                                </TouchableOpacity>
                                {files[fieldId] && (
                                    <Text className="mt-2 text-xs text-gray-500">
                                        {files[fieldId].isLocal
                                            ? "File baru dipilih"
                                            : "File sebelumnya"}
                                    </Text>
                                )}
                            </View>
                        );
                    } else {
                        return (
                            <View key={fieldId} className="mb-4">
                                <Text className="mb-2 font-semibold text-gray-700">
                                    {field.nama_field}
                                    {field.is_required && (
                                        <Text className="text-red-500"> *</Text>
                                    )}
                                </Text>
                                <TextInput
                                    className="p-3 border border-gray-300 rounded-lg"
                                    placeholder={field.nama_field}
                                    value={formData[fieldKey]}
                                    onChangeText={(text) =>
                                        updateFormData(fieldKey, text)
                                    }
                                    keyboardType={
                                        field.tipe_field === 'number'
                                            ? 'numeric'
                                            : 'default'
                                    }
                                    multiline={field.tipe_field === 'textarea'}
                                    numberOfLines={
                                        field.tipe_field === 'textarea' ? 4 : 1
                                    }
                                    textAlignVertical={
                                        field.tipe_field === 'textarea'
                                            ? 'top'
                                            : 'center'
                                    }
                                    style={{ color: "#111827" }}
                                />
                            </View>
                        );
                    }
                })}

                {/* Info */}
                <View className="p-4 mb-6 bg-blue-50 rounded-lg">
                    <Text className="text-sm text-blue-800">
                        💡 Setelah Anda mengajukan ulang, status pengajuan akan
                        berubah menjadi "Diajukan" dan akan diproses kembali oleh
                        admin.
                    </Text>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={submitting}
                    className={`p-4 rounded-lg mb-8 ${submitting ? "bg-gray-400" : "bg-teal-600"
                        }`}
                    activeOpacity={0.8}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-lg font-bold text-center text-white">
                            Ajukan Ulang
                        </Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}