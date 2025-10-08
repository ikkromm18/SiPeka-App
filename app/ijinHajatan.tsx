import API_BASE_URL from "@/config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router"; // ✅ import router
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

type FieldSurat = {
    id: number;
    jenis_surat_id: number;
    nama_field: string;
    tipe_field: string;
    is_required: number;
};

type User = {
    nik: string;
    name: string;
    email: string;
    alamat: string;
};

const IjinHajatan = () => {
    const [fields, setFields] = useState<FieldSurat[]>([]);
    const [form, setForm] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    const router = useRouter(); // ✅ inisialisasi router

    // ambil data user yang login dari API
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
                setUser(res.data); // pastikan API /user return { nik, nama, email, alamat }
            } catch (err) {
                console.error("❌ Error ambil user:", err);
            }
        };

        fetchUser();
    }, []);

    // ambil field form dari API
    useEffect(() => {
        const fetchFields = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/getFieldSurat/4`);
                const data = await res.json();
                setFields(data);

                const initForm: { [key: string]: string } = {};
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

    const handleSubmit = async () => {
        if (!user) {
            Alert.alert("❌ Error", "User tidak ditemukan");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                ...user, // ambil nik, nama, email, alamat dari API /user
                jenis_surat_id: 1,
                fields: fields.map((f) => ({
                    field_id: f.id,
                    nilai: form[f.nama_field] || "",
                })),
            };

            const token = await AsyncStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/pengajuan`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            setLoading(false);

            if (res.ok) {
                Alert.alert("✅ Berhasil", "Pengajuan berhasil dikirim!");
                console.log("Response:", data);

                // ✅ Redirect ke history setelah berhasil
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
            <Text className="mb-4 text-xl font-bold">Form Mengadakan Ijin Hajatan</Text>

            {fields.map((item) => (
                <View key={item.id} className="mb-4">
                    <Text className="mb-1 text-base text-gray-700">
                        {item.nama_field}{" "}
                        {item.is_required === 1 && <Text className="text-red-500">*</Text>}
                    </Text>
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

export default IjinHajatan;
