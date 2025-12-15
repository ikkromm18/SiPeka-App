import { API_BASE_URL, IMAGE_BASE_URL } from "@/config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

/* ================== TYPE ================== */
type User = {
    name: string;
    email: string;
    nik?: string;
    no_kk?: string;
    nama_kepala_keluarga?: string;
    alamat?: string;
    desa?: string;
    rt?: string;
    rw?: string;
    kode_pos?: string;
    dusun?: string;
    nomor_hp?: string;
    pekerjaan?: string;
    tempat_lahir?: string;
    tgl_lahir?: string;
    foto_ktp?: string;
    foto_kk?: string;
    foto_profil?: string;
};

type PhotoState = {
    uri: string;
    isLocal: boolean;
};

/* ================== COMPONENT ================== */
export default function EditProfile() {
    const { control, handleSubmit, reset } = useForm<User>();
    const [loading, setLoading] = useState(false);

    const [fotoKtp, setFotoKtp] = useState<PhotoState | null>(null);
    const [fotoKk, setFotoKk] = useState<PhotoState | null>(null);
    const [fotoProfil, setFotoProfil] = useState<PhotoState | null>(null);

    /* ================== PERMISSION ================== */
    useEffect(() => {
        ImagePicker.requestCameraPermissionsAsync();
        ImagePicker.requestMediaLibraryPermissionsAsync();
    }, []);

    /* ================== FETCH USER ================== */
    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                const token = await AsyncStorage.getItem("token");
                if (!token) {
                    Alert.alert("Error", "Token tidak ditemukan");
                    return;
                }

                const res = await axios.get(`${API_BASE_URL}/user`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });

                const userData = res.data.user ?? res.data;

                reset(userData);

                if (userData.foto_ktp) {
                    setFotoKtp({
                        uri: `${IMAGE_BASE_URL}/${userData.foto_ktp}`,
                        isLocal: false,
                    });
                }

                if (userData.foto_kk) {
                    setFotoKk({
                        uri: `${IMAGE_BASE_URL}/${userData.foto_kk}`,
                        isLocal: false,
                    });
                }

                if (userData.foto_profil) {
                    setFotoProfil({
                        uri: `${IMAGE_BASE_URL}/${userData.foto_profil}`,
                        isLocal: false,
                    });
                }
            } catch (err: any) {
                console.log("Fetch user error:", err.response?.data || err.message);
                Alert.alert("Error", "Gagal memuat profil");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    /* ================== PICK IMAGE ================== */
    const pickImage = async (
        setter: React.Dispatch<React.SetStateAction<PhotoState | null>>
    ) => {
        Alert.alert("Pilih Gambar", "Ambil foto baru atau pilih dari galeri?", [
            {
                text: "Kamera",
                onPress: async () => {
                    const result = await ImagePicker.launchCameraAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        quality: 0.7,
                    });

                    if (!result.canceled) {
                        setter({
                            uri: result.assets[0].uri,
                            isLocal: true,
                        });
                    }
                },
            },
            {
                text: "Galeri",
                onPress: async () => {
                    const result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        quality: 0.7,
                    });

                    if (!result.canceled) {
                        setter({
                            uri: result.assets[0].uri,
                            isLocal: true,
                        });
                    }
                },
            },
            { text: "Batal", style: "cancel" },
        ]);
    };

    /* ================== SUBMIT ================== */
    const onSubmit = async (data: User) => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            if (!token) return;

            const formData = new FormData();

            Object.entries(data).forEach(([key, value]) => {
                if (value) formData.append(key, value as string);
            });

            formData.append("_method", "PUT");

            if (fotoKtp?.isLocal) {
                formData.append("foto_ktp", {
                    uri: fotoKtp.uri,
                    type: "image/jpeg",
                    name: "foto_ktp.jpg",
                } as any);
            }

            if (fotoKk?.isLocal) {
                formData.append("foto_kk", {
                    uri: fotoKk.uri,
                    type: "image/jpeg",
                    name: "foto_kk.jpg",
                } as any);
            }

            if (fotoProfil?.isLocal) {
                formData.append("foto_profil", {
                    uri: fotoProfil.uri,
                    type: "image/jpeg",
                    name: "foto_profil.jpg",
                } as any);
            }

            await axios.post(`${API_BASE_URL}/profile/update`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            Alert.alert("Sukses", "Profil berhasil diperbarui");
        } catch (err: any) {
            console.log("Update error:", err.response?.data || err.message);
            Alert.alert("Error", "Gagal memperbarui profil");
        } finally {
            setLoading(false);
        }
    };

    /* ================== LOADING ================== */
    if (loading) {
        return (
            <View className="items-center justify-center flex-1">
                <ActivityIndicator size="large" color="#03B798" />
                <Text>Memuat...</Text>
            </View>
        );
    }

    /* ================== UI ================== */
    return (
        <ScrollView className="flex-1 p-6 pb-10 bg-white">
            <Text className="mb-6 text-2xl font-bold text-center">
                Edit Profil
            </Text>

            {[
                ["name", "Nama"],
                ["email", "Email"],
                ["nik", "NIK"],
                ["no_kk", "No KK"],
            ].map(([name, label]) => (
                <View key={name} className="mb-4">
                    <Text>{label}</Text>
                    <Controller
                        control={control}
                        name={name as keyof User}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                className="p-3 border rounded"
                                value={value}
                                onChangeText={onChange}
                            />
                        )}
                    />
                </View>
            ))}

            {/* FOTO KTP */}
            <View className="mb-4">
                {fotoKtp && (
                    <Image source={{ uri: fotoKtp.uri }} className="h-40 mb-2 rounded" />
                )}
                <TouchableOpacity onPress={() => pickImage(setFotoKtp)}>
                    <Text className="p-3 text-center text-white bg-green-500 rounded">
                        Upload Foto KTP
                    </Text>
                </TouchableOpacity>
            </View>

            {/* FOTO KK */}
            <View className="mb-4">
                {fotoKk && (
                    <Image source={{ uri: fotoKk.uri }} className="h-40 mb-2 rounded" />
                )}
                <TouchableOpacity onPress={() => pickImage(setFotoKk)}>
                    <Text className="p-3 text-center text-white bg-green-500 rounded">
                        Upload Foto KK
                    </Text>
                </TouchableOpacity>
            </View>

            {/* FOTO PROFIL */}
            <View className="mb-6">
                {fotoProfil && (
                    <Image source={{ uri: fotoProfil.uri }} className="h-40 mb-2 rounded" />
                )}
                <TouchableOpacity onPress={() => pickImage(setFotoProfil)}>
                    <Text className="p-3 text-center text-white bg-green-500 rounded">
                        Upload Foto Profil
                    </Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleSubmit(onSubmit)}>
                <Text className="p-4 mb-16 text-center text-white bg-black rounded">
                    Simpan Perubahan
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
