import API_BASE_URL from "@/config/api";
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
};

export default function EditProfile() {
    const { control, handleSubmit, reset } = useForm<User>();
    const [loading, setLoading] = useState(false);

    const [fotoKtp, setFotoKtp] = useState<any>(null);
    const [fotoKk, setFotoKk] = useState<any>(null);

    // ✅ Ambil data user dari API Laravel
    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                const token = await AsyncStorage.getItem("token");
                if (!token) {
                    Alert.alert("Error", "Token tidak ditemukan. Silakan login kembali.");
                    return;
                }

                const res = await axios.get(`${API_BASE_URL}/user`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });

                // cek apakah res.data punya key `user` atau langsung object
                const userData = res.data.user ? res.data.user : res.data;

                // isi form
                reset(userData);

                // set foto
                if (userData.foto_ktp) setFotoKtp({ uri: `${API_BASE_URL}/storage/${userData.foto_ktp}` });
                if (userData.foto_kk) setFotoKk({ uri: `${API_BASE_URL}/storage/${userData.foto_kk}` });

            } catch (err: any) {
                console.log("❌ Fetch user error:", err.response?.data || err.message);
                Alert.alert("Error", "Gagal memuat data profil.");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    // ✅ Fungsi pilih foto (kamera / galeri)
    const pickImage = async (setter: any) => {
        Alert.alert(
            "Pilih Gambar",
            "Ambil foto baru atau pilih dari galeri?",
            [
                {
                    text: "Kamera",
                    onPress: async () => {
                        const result = await ImagePicker.launchCameraAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            quality: 0.7,
                        });
                        if (!result.canceled) setter(result.assets[0]);
                    },
                },
                {
                    text: "Galeri",
                    onPress: async () => {
                        const result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            quality: 0.7,
                        });
                        if (!result.canceled) setter(result.assets[0]);
                    },
                },
                { text: "Batal", style: "cancel" },
            ]
        );
    };


    // ✅ Simpan perubahan
    const onSubmit = async (data: User) => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                Alert.alert("Error", "Token tidak ditemukan. Silakan login kembali.");
                return;
            }

            if (!data.name || !data.email) {
                Alert.alert("Error", "Nama dan Email wajib diisi.");
                return;
            }


            let formData = new FormData();
            Object.keys(data).forEach((key) => {
                const value = (data as any)[key];
                if (value) formData.append(key, value);
            });

            // override method jadi PUT
            formData.append("_method", "PUT");

            if (fotoKtp?.uri) {
                formData.append("foto_ktp", {
                    uri: fotoKtp.uri,
                    type: "image/jpeg",
                    name: "foto_ktp.jpg",
                } as any);
            }

            if (fotoKk?.uri) {
                formData.append("foto_kk", {
                    uri: fotoKk.uri,
                    type: "image/jpeg",
                    name: "foto_kk.jpg",
                } as any);
            }

            console.log("Update Profile URL:", `${API_BASE_URL}/profile/update`);


            await axios.post(`${API_BASE_URL}/profile/update`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });


            Alert.alert("Sukses", "Profil berhasil diperbarui ✅");
        } catch (err: any) {
            console.log("❌ Update error:", err.response?.data || err.message);
            Alert.alert("Error", "Gagal memperbarui profil.");
        } finally {
            setLoading(false);
        }
    };


    if (loading) {
        return (
            <View className="items-center justify-center flex-1 bg-white">
                <ActivityIndicator size="large" color="#03B798" />
                <Text className="mt-3 text-[#18353D]">Sedang memuat...</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 p-6 bg-white">
            <Text className="mb-6 text-2xl font-bold text-center text-[#18353D]">
                Edit Profil
            </Text>

            {/* Input Fields */}
            {[
                { name: "name", label: "Nama", placeholder: "Masukkan nama" },
                { name: "email", label: "Email", placeholder: "Masukkan email" },
                { name: "nik", label: "NIK", placeholder: "Masukkan NIK" },
                { name: "no_kk", label: "No KK", placeholder: "Masukkan nomor KK" },
                { name: "nama_kepala_keluarga", label: "Nama Kepala Keluarga", placeholder: "Masukkan nama KK" },
                { name: "alamat", label: "Alamat", placeholder: "Masukkan alamat" },
                { name: "desa", label: "Desa", placeholder: "Masukkan desa" },
                { name: "rt", label: "RT", placeholder: "RT" },
                { name: "rw", label: "RW", placeholder: "RW" },
                { name: "kode_pos", label: "Kode Pos", placeholder: "Masukkan kode pos" },
                { name: "dusun", label: "Dusun", placeholder: "Masukkan dusun" },
                { name: "nomor_hp", label: "Nomor HP", placeholder: "Masukkan nomor HP" },
                { name: "pekerjaan", label: "Pekerjaan", placeholder: "Masukkan pekerjaan" },
                { name: "tempat_lahir", label: "Tempat Lahir", placeholder: "Masukkan tempat lahir" },
                { name: "tgl_lahir", label: "Tanggal Lahir", placeholder: "YYYY-MM-DD" },
            ].map((field) => (
                <View key={field.name} className="mb-4">
                    <Text className="mb-1 text-[#18353D]">{field.label}</Text>
                    <Controller
                        control={control}
                        name={field.name as keyof User}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                className="w-full p-3 border rounded-lg border-gray-300 text-[#18353D]"
                                value={value}
                                onChangeText={onChange}
                                placeholder={field.placeholder}
                                placeholderTextColor="#9CA3AF"
                            />
                        )}
                    />
                </View>
            ))}

            {/* Foto KTP */}
            <View className="mb-4">
                <Text className="mb-1 text-[#18353D]">Foto KTP</Text>
                {fotoKtp?.uri && (
                    <Image source={{ uri: fotoKtp.uri }} className="w-full h-40 mb-2 rounded-lg" />
                )}
                <TouchableOpacity
                    className="p-3 bg-[#03B798] rounded-lg items-center"
                    onPress={() => pickImage(setFotoKtp)}
                >
                    <Text className="font-semibold text-white">
                        {fotoKtp ? "Ubah Foto KTP" : "Upload Foto KTP"}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Foto KK */}
            <View className="mb-4">
                <Text className="mb-1 text-[#18353D]">Foto KK</Text>
                {fotoKk?.uri && (
                    <Image source={{ uri: fotoKk.uri }} className="w-full h-40 mb-2 rounded-lg" />
                )}
                <TouchableOpacity
                    className="p-3 bg-[#03B798] rounded-lg items-center"
                    onPress={() => pickImage(setFotoKk)}
                >
                    <Text className="font-semibold text-white">
                        {fotoKk ? "Ubah Foto KK" : "Upload Foto KK"}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Tombol Simpan */}
            <TouchableOpacity
                className="w-full p-4 mb-14 mt-4 bg-[#18353D] rounded-lg items-center"
                activeOpacity={0.8}
                onPress={handleSubmit(onSubmit)}
            >
                <Text className="text-base font-bold text-white">💾 Simpan Perubahan</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
