import { API_BASE_URL } from "@/config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Platform,
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

const IjinHajatan = () => {
    const [fields, setFields] = useState<FieldSurat[]>([]);
    const [form, setForm] = useState<{ [key: string]: any }>({});
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [showDatePicker, setShowDatePicker] = useState<{ [key: string]: boolean }>({});
    const router = useRouter();

    // =========================
    // GET USER
    // =========================
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

    // =========================
    // GET FIELDS
    // =========================
    useEffect(() => {
        const fetchFields = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/getFieldSurat/4`);
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

    // =========================
    // PICK FILE
    // =========================
    const handlePickFile = async (fieldName: string) => {
        const result = await DocumentPicker.getDocumentAsync({
            type: "*/*",
            copyToCacheDirectory: true,
        });

        if (result.canceled) return;

        const file = result.assets[0];
        setForm((prev) => ({ ...prev, [fieldName]: file }));
    };

    // =========================
    // PICK DATE
    // =========================
    const handleDateChange = (fieldName: string, _: any, date?: Date) => {
        setShowDatePicker((prev) => ({ ...prev, [fieldName]: false }));
        if (date) {
            setForm((prev) => ({
                ...prev,
                [fieldName]: date.toISOString().split("T")[0],
            }));
        }
    };

    // =========================
    // SUBMIT
    // =========================
    const handleSubmit = async () => {
        if (!user) {
            Alert.alert("Error", "User tidak ditemukan");
            return;
        }

        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            const formData = new FormData();

            // user data
            formData.append("nik", user.nik);
            formData.append("name", user.name);
            formData.append("email", user.email);
            formData.append("alamat", user.alamat);
            formData.append("jenis_surat_id", "4");

            // dynamic fields
            fields.forEach((f) => {
                const value = form[f.nama_field];

                if (f.tipe_field === "file" && value?.uri) {
                    formData.append(`fields[${f.id}]`, {
                        uri: value.uri,
                        name: value.name || `file_${f.id}`,
                        type: value.mimeType || "application/octet-stream",
                    } as any);
                } else {
                    formData.append(`fields[${f.id}]`, value || "");
                }
            });

            const res = await fetch(`${API_BASE_URL}/pengajuan`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                    // ❌ JANGAN SET Content-Type
                },
                body: formData,
            });

            const data = await res.json();
            setLoading(false);

            if (res.ok) {
                Alert.alert("Berhasil", "Pengajuan berhasil dikirim");
                router.push("/(tabs)/history");
            } else {
                Alert.alert("Gagal", data.message || "Terjadi kesalahan");
            }
        } catch (err) {
            setLoading(false);
            Alert.alert("Error", "Gagal mengirim data");
            console.error(err);
        }
    };

    // =========================
    // UI
    // =========================
    return (
        <ScrollView className="flex-1 p-4 bg-white">
            <Text className="mb-4 text-xl font-bold">
                Form Ijin Mengadakan Hajatan
            </Text>

            {fields.map((item) => (
                <View key={item.id} className="mb-4">
                    <Text className="mb-1 text-base text-gray-700">
                        {item.nama_field}
                        {item.is_required === 1 && (
                            <Text className="text-red-500"> *</Text>
                        )}
                    </Text>

                    {item.tipe_field === "file" ? (
                        <TouchableOpacity
                            onPress={() => handlePickFile(item.nama_field)}
                            className="p-4 border border-gray-300 rounded-lg bg-gray-50"
                        >
                            <Text className="text-gray-700">
                                {form[item.nama_field]?.name
                                    ? `📄 ${form[item.nama_field].name}`
                                    : `Pilih file`}
                            </Text>
                        </TouchableOpacity>
                    ) : item.tipe_field === "select" && item.options ? (
                        <View className="border border-gray-300 rounded-lg">
                            <Picker
                                selectedValue={form[item.nama_field]}
                                onValueChange={(v) =>
                                    setForm({ ...form, [item.nama_field]: v })
                                }
                            >
                                <Picker.Item label="Pilih" value="" />
                                {item.options.map((opt, i) => (
                                    <Picker.Item key={i} label={opt} value={opt} />
                                ))}
                            </Picker>
                        </View>
                    ) : item.tipe_field === "date" ? (
                        <>
                            <TouchableOpacity
                                className="p-4 border border-gray-300 rounded-lg bg-gray-50"
                                onPress={() =>
                                    setShowDatePicker((p) => ({
                                        ...p,
                                        [item.nama_field]: true,
                                    }))
                                }
                            >
                                <Text className="text-gray-700">
                                    {form[item.nama_field] || "Pilih tanggal"}
                                </Text>
                            </TouchableOpacity>

                            {showDatePicker[item.nama_field] && (
                                <DateTimePicker
                                    value={new Date()}
                                    mode="date"
                                    display={Platform.OS === "ios" ? "spinner" : "default"}
                                    onChange={(e, d) =>
                                        handleDateChange(item.nama_field, e, d!)
                                    }
                                />
                            )}
                        </>
                    ) : (
                        <TextInput
                            style={{ color: "#000" }} // ✅ FIX RELEASE
                            placeholderTextColor="#9CA3AF" // ✅ FIX PLACEHOLDER
                            className="w-full p-4 text-base border border-gray-300 rounded-lg"
                            placeholder={`Masukkan ${item.nama_field}`}
                            keyboardType={
                                item.tipe_field === "number" ? "numeric" : "default"
                            }
                            secureTextEntry={item.tipe_field === "password"}
                            autoCapitalize="none"
                            value={form[item.nama_field] || ""}
                            onChangeText={(t) =>
                                setForm({ ...form, [item.nama_field]: t })
                            }
                        />
                    )}
                </View>
            ))}

            <TouchableOpacity
                disabled={loading}
                onPress={handleSubmit}
                className={`p-4 mt-6 rounded-lg ${loading ? "bg-gray-400" : "bg-blue-600"
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
