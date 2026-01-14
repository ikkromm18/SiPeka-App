import { API_BASE_URL, IMAGE_BASE_URL } from "@/config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
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
    kecamatan?: string;
    kabupaten?: string;
    provinsi?: string;
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
    const { control, handleSubmit, reset, setValue, watch } = useForm<User>();
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [fotoKtp, setFotoKtp] = useState<PhotoState | null>(null);
    const [fotoKk, setFotoKk] = useState<PhotoState | null>(null);
    const [fotoProfil, setFotoProfil] = useState<PhotoState | null>(null);

    const tglLahir = watch("tgl_lahir");

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
                        allowsEditing: true,
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
                        allowsEditing: true,
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

        if (data.tgl_lahir) {
            const umur = hitungUmur(data.tgl_lahir);

            if (umur < 17) {
                Alert.alert("Gagal", "Usia minimal adalah 17 tahun.");
                return;
            }
        }
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                Alert.alert("Error", "Token tidak ditemukan");
                return;
            }

            const formData = new FormData();

            // Append semua data user
            Object.entries(data).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== "") {
                    formData.append(key, value as string);
                }
            });

            // ✅ Method spoofing untuk Laravel PUT request
            formData.append("_method", "PUT");

            // Upload foto hanya jika ada perubahan (isLocal = true)
            if (fotoKtp?.isLocal) {
                const uriParts = fotoKtp.uri.split('.');
                const fileType = uriParts[uriParts.length - 1];

                formData.append("foto_ktp", {
                    uri: Platform.OS === 'ios' ? fotoKtp.uri.replace('file://', '') : fotoKtp.uri,
                    type: `image/${fileType}`,
                    name: `foto_ktp.${fileType}`,
                } as any);
            }

            if (fotoKk?.isLocal) {
                const uriParts = fotoKk.uri.split('.');
                const fileType = uriParts[uriParts.length - 1];

                formData.append("foto_kk", {
                    uri: Platform.OS === 'ios' ? fotoKk.uri.replace('file://', '') : fotoKk.uri,
                    type: `image/${fileType}`,
                    name: `foto_kk.${fileType}`,
                } as any);
            }

            if (fotoProfil?.isLocal) {
                const uriParts = fotoProfil.uri.split('.');
                const fileType = uriParts[uriParts.length - 1];

                formData.append("foto_profil", {
                    uri: Platform.OS === 'ios' ? fotoProfil.uri.replace('file://', '') : fotoProfil.uri,
                    type: `image/${fileType}`,
                    name: `foto_profil.${fileType}`,
                } as any);
            }

            const response = await axios.post(`${API_BASE_URL}/profile/update`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                    Accept: "application/json",
                },
            });

            Alert.alert("Sukses", response.data.message || "Profil berhasil diperbarui");
        } catch (err: any) {
            console.log("Update error:", err.response?.data || err.message);
            Alert.alert(
                "Error",
                err.response?.data?.message || "Gagal memperbarui profil"
            );
        } finally {
            setLoading(false);
        }
    };

    const hitungUmur = (tglLahir: string) => {
        const today = new Date();
        const birthDate = new Date(tglLahir);

        let umur = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            umur--;
        }

        return umur;
    };


    /* ================== LOADING ================== */
    if (loading) {
        return (
            <View className="items-center justify-center flex-1 bg-white">
                <ActivityIndicator size="large" color="#03B798" />
                <Text className="mt-4 text-gray-600">Memuat...</Text>
            </View>
        );
    }

    /* ================== FORM FIELDS CONFIG ================== */
    const formFields = [
        { name: "name", label: "Nama Lengkap", placeholder: "Nama Lengkap" },
        { name: "email", label: "Email", placeholder: "Email", keyboardType: "email-address" },
        { name: "nik", label: "NIK", placeholder: "NIK (16 digit)", keyboardType: "numeric", maxLength: 16 },
        { name: "no_kk", label: "No KK", placeholder: "No KK (16 digit)", keyboardType: "numeric", maxLength: 16 },
        { name: "nama_kepala_keluarga", label: "Nama Kepala Keluarga", placeholder: "Nama Kepala Keluarga" },
        { name: "alamat", label: "Alamat", placeholder: "Alamat" },
        { name: "desa", label: "Desa", placeholder: "Desa" },
        { name: "rt", label: "RT", placeholder: "RT", keyboardType: "numeric" },
        { name: "rw", label: "RW", placeholder: "RW", keyboardType: "numeric" },
        { name: "kecamatan", label: "Kecamatan", placeholder: "Kecamatan" },
        { name: "kabupaten", label: "Kabupaten", placeholder: "Kabupaten" },
        { name: "provinsi", label: "Provinsi", placeholder: "Provinsi" },
        { name: "kode_pos", label: "Kode Pos", placeholder: "Kode Pos", keyboardType: "numeric", maxLength: 5 },
        { name: "dusun", label: "Dusun", placeholder: "Dusun" },
        { name: "nomor_hp", label: "Nomor HP", placeholder: "Nomor HP", keyboardType: "phone-pad" },
        { name: "pekerjaan", label: "Pekerjaan", placeholder: "Pekerjaan" },
        { name: "tempat_lahir", label: "Tempat Lahir", placeholder: "Tempat Lahir" },
    ];

    const maxBirthDate = new Date();
    maxBirthDate.setFullYear(maxBirthDate.getFullYear() - 17);

    /* ================== UI ================== */
    return (
        <ScrollView className="flex-1 bg-white">
            <View className="p-6 pb-32">
                <Text className="mb-6 text-2xl font-bold text-center text-gray-800">
                    Edit Profil
                </Text>

                {/* FOTO PROFIL */}
                <View className="items-center mb-6">
                    {fotoProfil && (
                        <Image
                            source={{ uri: fotoProfil.uri }}
                            className="w-32 h-32 mb-3 border-4 border-teal-500 rounded-full"
                        />
                    )}
                    <TouchableOpacity
                        onPress={() => pickImage(setFotoProfil)}
                        className="px-6 py-3 bg-teal-500 rounded-lg"
                    >
                        <Text className="font-semibold text-white">
                            {fotoProfil ? "Ubah Foto Profil" : "Upload Foto Profil"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* FORM FIELDS */}
                {formFields.map((field) => (
                    <View key={field.name} className="mb-4">
                        <Text className="mb-2 font-semibold text-gray-700">
                            {field.label}
                        </Text>
                        <Controller
                            control={control}
                            name={field.name as keyof User}
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    className="p-3 border border-gray-300 rounded-lg"
                                    placeholder={field.placeholder}
                                    value={value || ""}
                                    onChangeText={(text) => {
                                        // Validasi khusus untuk NIK dan No KK (hanya angka)
                                        if (field.name === "nik" || field.name === "no_kk") {
                                            const numericText = text.replace(/[^0-9]/g, "");
                                            onChange(numericText);
                                        } else {
                                            onChange(text);
                                        }
                                    }}
                                    keyboardType={field.keyboardType as any}
                                    maxLength={field.maxLength}
                                    style={{ color: "#111827" }}
                                />
                            )}
                        />
                    </View>
                ))}

                {/* TANGGAL LAHIR */}
                <View className="mb-4">
                    <Text className="mb-2 font-semibold text-gray-700">Tanggal Lahir</Text>
                    <TouchableOpacity
                        className="p-3 border border-gray-300 rounded-lg"
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text className="text-gray-800">
                            {tglLahir ? `📅 ${tglLahir}` : "Pilih Tanggal Lahir"}
                        </Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        // <DateTimePicker
                        //     value={tglLahir ? new Date(tglLahir) : new Date()}
                        //     mode="date"
                        //     display={Platform.OS === "ios" ? "spinner" : "calendar"}
                        //     onChange={(event, selectedDate) => {
                        //         setShowDatePicker(false);
                        //         if (selectedDate) {
                        //             const isoDate = selectedDate.toISOString().split("T")[0];
                        //             setValue("tgl_lahir", isoDate);
                        //         }
                        //     }}
                        // />
                        <DateTimePicker
                            value={tglLahir ? new Date(tglLahir) : maxBirthDate}
                            mode="date"
                            maximumDate={maxBirthDate}   // 🔒 TIDAK bisa pilih umur < 17
                            display={Platform.OS === "ios" ? "spinner" : "calendar"}
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(false);

                                if (selectedDate) {
                                    const isoDate = selectedDate.toISOString().split("T")[0];
                                    const umur = hitungUmur(isoDate);

                                    if (umur < 17) {
                                        Alert.alert(
                                            "Usia tidak memenuhi",
                                            "Umur minimal untuk mendaftar adalah 17 tahun."
                                        );
                                        return;
                                    }

                                    setValue("tgl_lahir", isoDate);
                                }
                            }}
                        />

                    )}
                </View>

                {/* FOTO KTP */}
                <View className="mb-4">
                    <Text className="mb-2 font-semibold text-gray-700">Foto KTP</Text>
                    {fotoKtp && (
                        <Image
                            source={{ uri: fotoKtp.uri }}
                            className="w-full mb-3 rounded-lg h-52"
                            resizeMode="cover"
                        />
                    )}
                    <TouchableOpacity
                        onPress={() => pickImage(setFotoKtp)}
                        className="p-3 bg-blue-500 rounded-lg"
                    >
                        <Text className="font-semibold text-center text-white">
                            {fotoKtp ? "Ubah Foto KTP" : "Upload Foto KTP"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* FOTO KK */}
                <View className="mb-6">
                    <Text className="mb-2 font-semibold text-gray-700">Foto KK</Text>
                    {fotoKk && (
                        <Image
                            source={{ uri: fotoKk.uri }}
                            className="w-full mb-3 rounded-lg h-52"
                            resizeMode="cover"
                        />
                    )}
                    <TouchableOpacity
                        onPress={() => pickImage(setFotoKk)}
                        className="p-3 bg-blue-500 rounded-lg"
                    >
                        <Text className="font-semibold text-center text-white">
                            {fotoKk ? "Ubah Foto KK" : "Upload Foto KK"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* SUBMIT BUTTON */}
                <TouchableOpacity
                    onPress={handleSubmit(onSubmit)}
                    disabled={loading}
                    className="p-4 bg-teal-600 rounded-lg shadow-lg"
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-lg font-bold text-center text-white">
                            Simpan Perubahan
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}