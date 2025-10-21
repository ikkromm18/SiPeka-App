import API_BASE_URL from "@/config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

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

const PindahLuarProvinsi = () => {
    const [fields, setFields] = useState<FieldSurat[]>([]);
    const [form, setForm] = useState<{ [key: string]: any }>({});
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    // ambil data user dari API
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

    // ambil field surat dari API
    useEffect(() => {
        const fetchFields = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/getFieldSurat/2`);
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

    // pilih file
    const handlePickFile = async (fieldName: string) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "*/*",
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            const file = result.assets[0];
            setForm((prevForm) => ({
                ...prevForm,
                [fieldName]: file,
            }));
        } catch (error) {
            console.error("❌ Error picking file:", error);
        }
    };

    // kirim data form
    const handleSubmit = async () => {
        if (!user) {
            Alert.alert("❌ Error", "User tidak ditemukan");
            return;
        }

        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");

            const formData = new FormData();

            // 🔹 Data user
            formData.append("nik", user.nik);
            formData.append("name", user.name);
            formData.append("email", user.email);
            formData.append("alamat", user.alamat);
            formData.append("jenis_surat_id", "2");

            // 🔹 Field dinamis
            fields.forEach((f) => {
                const value = form[f.nama_field];

                if (f.tipe_field === "file" && value && value.uri) {
                    // Jika field adalah file
                    formData.append(`fields[${f.id}]`, {
                        uri: value.uri,
                        name: value.name || `file_${f.id}`,
                        type: value.mimeType || "application/octet-stream",
                    } as any);
                } else {
                    // Jika field biasa (text, number, select)
                    formData.append(`fields[${f.id}]`, value || "");
                }
            });

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
            <Text className="mb-4 text-xl font-bold">Form Pindah Luar Provinsi</Text>

            {fields.map((item) => (
                <View key={item.id} className="mb-4">
                    <Text className="mb-1 text-base text-gray-700">
                        {item.nama_field}{" "}
                        {item.is_required === 1 && <Text className="text-red-500">*</Text>}
                    </Text>

                    {/* === INPUT BERDASARKAN TIPE FIELD === */}
                    {item.tipe_field === "select" && item.options ? (
                        <View className="border border-gray-300 rounded-lg">
                            <Picker
                                selectedValue={form[item.nama_field] || ""}
                                onValueChange={(value) =>
                                    setForm({ ...form, [item.nama_field]: value })
                                }
                            >
                                <Picker.Item label={`Pilih ${item.nama_field}`} value="" />
                                {item.options.map((opt: string, index: number) => (
                                    <Picker.Item key={index} label={opt} value={opt} />
                                ))}
                            </Picker>
                        </View>
                    ) : item.tipe_field === "file" ? (
                        <TouchableOpacity
                            onPress={() => handlePickFile(item.nama_field)}
                            className="p-4 border border-gray-300 rounded-lg bg-gray-50"
                        >
                            <Text className="text-gray-700">
                                {form[item.nama_field]?.name
                                    ? `📄 ${form[item.nama_field].name}`
                                    : `Pilih file untuk ${item.nama_field}`}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <TextInput
                            className="w-full p-4 text-base border border-gray-300 rounded-lg"
                            placeholder={`Masukkan ${item.nama_field}`}
                            keyboardType={item.tipe_field === "number" ? "numeric" : "default"}
                            secureTextEntry={item.tipe_field === "password"}
                            autoCapitalize="none"
                            value={form[item.nama_field] || ""}
                            onChangeText={(text) =>
                                setForm({ ...form, [item.nama_field]: text })
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

export default PindahLuarProvinsi;
