import API_BASE_URL from "@/config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type FieldSurat = {
    id: number;
    jenis_surat_id: number;
    nama_field: string;
    tipe_field: string;
    is_required: number;
    options?: string[];
};

type User = {
    nik: string;
    name: string;
    email: string;
    alamat: string;
};

const PindahDalamProvinsi = () => {
    const [fields, setFields] = useState<FieldSurat[]>([]);
    const [form, setForm] = useState<{ [key: string]: any }>({});
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    // 🔹 Ambil data user login
    useEffect(() => {
        const fetchUser = async () => {
            const token = await AsyncStorage.getItem("token");
            if (!token) return;

            try {
                const res = await axios.get(`${API_BASE_URL}/user`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });
                setUser(res.data);
            } catch (err) {
                console.error("❌ Error ambil user:", err);
            }
        };

        fetchUser();
    }, []);

    // 🔹 Ambil struktur field dari API
    useEffect(() => {
        const fetchFields = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/getFieldSurat/1`);
                const data = await res.json();
                setFields(data);

                const initForm: { [key: string]: any } = {};
                data.forEach((f: FieldSurat) => {
                    initForm[f.nama_field] = "";
                });
                setForm(initForm);
            } catch (error) {
                console.error("❌ Error fetching fields:", error);
            }
        };

        fetchFields();
    }, []);

    // 🔹 Fungsi untuk memilih file
    const handlePickFile = async (fieldName: string) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "*/*",
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                setForm((prevForm) => ({
                    ...prevForm,
                    [fieldName]: {
                        uri: file.uri,
                        name: file.name,
                        mimeType: file.mimeType,
                    },
                }));
            }
        } catch (err) {
            console.error("❌ File pick error:", err);
        }
    };

    // 🔹 Kirim data pengajuan
    const handleSubmit = async () => {
        if (!user) {
            Alert.alert("❌ Error", "User tidak ditemukan");
            return;
        }

        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");

            const formData = new FormData();
            formData.append("nik", user.nik);
            formData.append("name", user.name);
            formData.append("email", user.email);
            formData.append("alamat", user.alamat);
            formData.append("jenis_surat_id", "1");

            // Tambahkan fields
            for (const field of fields) {
                const value = form[field.nama_field];
                if (value) {
                    if (value.uri) {
                        // File upload
                        formData.append(`fields[${field.id}]`, {
                            uri: value.uri,
                            name: value.name || "upload",
                            type: value.mimeType || "application/octet-stream",
                        } as any);
                    } else {
                        // Text input / select
                        formData.append(`fields[${field.id}]`, value);
                    }
                }
            }

            const res = await fetch(`${API_BASE_URL}/pengajuan`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                    "Content-Type": "multipart/form-data",
                },
                body: formData,
            });

            const data = await res.json();
            setLoading(false);

            if (res.ok) {
                Alert.alert("✅ Berhasil", "Pengajuan berhasil dikirim!");
                console.log("Response:", data);
                router.push("/(tabs)/history");
            } else {
                Alert.alert("❌ Gagal", data.message || "Terjadi kesalahan");
            }
        } catch (error) {
            setLoading(false);
            console.error("❌ Error submit:", error);
            Alert.alert("❌ Error", "Tidak bisa mengirim data");
        }
    };

    return (
        <ScrollView className="flex-1 p-4 bg-white">
            <Text className="mb-4 text-xl font-bold">Form Pindah Dalam Provinsi</Text>

            {fields.map((item) => (
                <View key={item.id} className="mb-4">
                    <Text className="mb-1 text-base text-gray-700">
                        {item.nama_field}{" "}
                        {item.is_required === 1 && (
                            <Text className="text-red-500">*</Text>
                        )}
                    </Text>

                    {item.tipe_field === "select" && item.options ? (
                        // 🔹 SELECT
                        <View className="border border-gray-300 rounded-lg">
                            <Picker
                                selectedValue={form[item.nama_field] || ""}
                                onValueChange={(value) =>
                                    setForm({ ...form, [item.nama_field]: value })
                                }
                            >
                                <Picker.Item
                                    label={`Pilih ${item.nama_field}`}
                                    value=""
                                />
                                {item.options.map((opt: string, index: number) => (
                                    <Picker.Item
                                        key={index}
                                        label={opt}
                                        value={opt}
                                    />
                                ))}
                            </Picker>
                        </View>
                    ) : item.tipe_field === "file" ? (
                        // 🔹 FILE PICKER
                        <TouchableOpacity
                            onPress={() => handlePickFile(item.nama_field)}
                            className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50"
                        >
                            <Text className="text-gray-700">
                                {form[item.nama_field]?.name
                                    ? `📎 ${form[item.nama_field].name}`
                                    : `Pilih file ${item.nama_field}`}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        // 🔹 TEXT INPUT
                        <TextInput
                            className="w-full p-4 text-base border border-gray-300 rounded-lg"
                            placeholder={`Masukkan ${item.nama_field}`}
                            keyboardType={
                                item.tipe_field === "number"
                                    ? "numeric"
                                    : "default"
                            }
                            secureTextEntry={
                                item.tipe_field === "password"
                            }
                            autoCapitalize="none"
                            value={form[item.nama_field] || ""}
                            onChangeText={(text) =>
                                setForm({
                                    ...form,
                                    [item.nama_field]: text,
                                })
                            }
                        />
                    )}
                </View>
            ))}

            <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                className={`w-full p-4 mt-4 mb-10 rounded-lg ${loading ? "bg-gray-400" : "bg-blue-600"
                    }`}
            >
                <Text className="font-bold text-center text-white">
                    {loading ? "Mengirim..." : "Ajukan"}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default PindahDalamProvinsi;
