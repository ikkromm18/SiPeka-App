import { API_BASE_URL } from "@/config/api";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
"@/config/api";

const Register = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // State form
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        nik: "",
        no_kk: "",
        nama_kepala_keluarga: "",
        alamat: "",
        desa: "",
        kecamatan: "",
        kabupaten: "",
        provinsi: "",
        rt: "",
        rw: "",
        kode_pos: "",
        dusun: "",
        nomor_hp: "",
        pekerjaan: "",
        tempat_lahir: "",
        tgl_lahir: "",
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [fotoKtp, setFotoKtp] = useState<any>(null);
    const [fotoKk, setFotoKk] = useState<any>(null);
    const [fotoProfil, setFotoProfil] = useState<any>(null);

    // ✅ Fungsi pilih gambar (kamera / galeri)
    // Fungsi pilih gambar (kamera / galeri)
    const pickImage = async (setter: any, fromCamera = false) => {
        try {
            let permissionResult;
            if (fromCamera) {
                permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            } else {
                permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            }

            if (!permissionResult.granted) {
                Alert.alert("Izin ditolak", "Aplikasi butuh izin untuk mengakses gambar/kamera");
                return;
            }

            const options: ImagePicker.ImagePickerOptions = {
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.7,
            };

            const result = fromCamera
                ? await ImagePicker.launchCameraAsync(options)
                : await ImagePicker.launchImageLibraryAsync(options);

            // ✅ result.canceled = true kalau user batal pilih gambar
            if (!result.canceled && result.assets && result.assets.length > 0) {
                setter(result.assets[0]);
            }
        } catch (error) {
            console.error("ImagePicker Error:", error);
            Alert.alert("Error", "Gagal memilih gambar");
        }
    };


    // ✅ Fungsi daftar
    const handleRegister = async () => {
        if (!form.name || !form.email || !form.password || !form.password_confirmation) {
            Alert.alert("Error", "Field wajib (nama, email, password, konfirmasi) belum diisi");
            return;
        }

        setLoading(true);
        try {
            let formData = new FormData();

            Object.keys(form).forEach((key) => {
                // @ts-ignore
                formData.append(key, form[key]);
            });

            // if (fotoKtp) {
            //     formData.append("foto_ktp", {
            //         uri: fotoKtp.uri,
            //         type: "image/jpeg",
            //         name: "foto_ktp.jpg",
            //     } as any);
            // }
            // if (fotoKk) {
            //     formData.append("foto_kk", {
            //         uri: fotoKk.uri,
            //         type: "image/jpeg",
            //         name: "foto_kk.jpg",
            //     } as any);
            // }

            // if (fotoProfil) {
            //     formData.append("foto_profil", {
            //         uri: fotoProfil.uri,
            //         type: "image/jpeg",
            //         name: "foto_profil.jpg",
            //     } as any);
            // }

            const response = await fetch(`${API_BASE_URL}/register`, {
                method: "POST",
                headers: { Accept: "application/json" }, // ❌ jangan set Content-Type manual
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert("Berhasil", "Registrasi berhasil, silakan login", [
                    { text: "OK", onPress: () => router.replace("/auth/login") },
                ]);
            } else {
                Alert.alert("Gagal", data.message || "Registrasi gagal");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Tidak bisa konek ke server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAwareScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            enableOnAndroid={true}
            extraScrollHeight={100} // ✅ biar input tidak ketutup keyboard
        >
            <View className="items-center justify-center flex-1 p-8 bg-white">
                <StatusBar barStyle="dark-content" />

                <Image
                    source={require("../../assets/logo/auth-logo.png")}
                    className="mt-5 w-28 h-28"
                    resizeMode="contain"
                />

                <Text className="mt-6 text-xl font-bold tracking-wider text-center text-gray-800">
                    REGISTER AKUN SIPEKA
                </Text>
                <Text className="mb-10 text-lg font-semibold text-center text-gray-600">
                    KECAMATAN PETATUKAN
                </Text>

                {/* Input utama */}
                {/* Input utama dengan label */}
                {[
                    { key: "name", label: "Nama Lengkap", placeholder: "Nama Lengkap Sesuai KTP" },
                    { key: "email", label: "Email", placeholder: "Email", keyboardType: "email-address" },
                    { key: "password", label: "Password", placeholder: "Password", secureTextEntry: true },
                    { key: "password_confirmation", label: "Konfirmasi Password", placeholder: "Konfirmasi Password", secureTextEntry: true },
                    { key: "nik", label: "NIK", placeholder: "NIK (16 digit)", keyboardType: "numeric", maxLength: 16 }, // ✅ Tambah maxLength
                    { key: "no_kk", label: "No KK", placeholder: "No KK (16 digit)", keyboardType: "numeric", maxLength: 16 }, // ✅ Tambah maxLength
                    // { key: "nama_kepala_keluarga", label: "Nama Kepala Keluarga", placeholder: "Nama Kepala Keluarga" },
                    // { key: "alamat", label: "Alamat", placeholder: "Alamat" },
                    // { key: "desa", label: "Desa", placeholder: "Desa" },
                    // { key: "rt", label: "RT", placeholder: "RT" },
                    // { key: "rw", label: "RW", placeholder: "RW" },
                    // { key: "kecamatan", label: "Kecamatan", placeholder: "Kecamatan" },
                    // { key: "kabupaten", label: "Kabupaten", placeholder: "Kabupaten" },
                    // { key: "provinsi", label: "Provinsi", placeholder: "Provinsi" },
                    // { key: "kode_pos", label: "Kode Pos", placeholder: "Kode Pos" },
                    // { key: "dusun", label: "Dusun", placeholder: "Dusun" },
                    // { key: "nomor_hp", label: "Nomor HP", placeholder: "Nomor HP", keyboardType: "phone-pad" },
                    // { key: "pekerjaan", label: "Pekerjaan", placeholder: "Pekerjaan" },
                    // { key: "tempat_lahir", label: "Tempat Lahir", placeholder: "Tempat Lahir" },
                ].map((item) => (
                    <View key={item.key} className="w-full mb-4">
                        <Text className="mb-2 font-semibold text-gray-700">{item.label}</Text>
                        <TextInput
                            className="w-full p-4 text-base border border-gray-300 rounded-lg"
                            placeholder={item.placeholder}
                            keyboardType={item.keyboardType as any}
                            secureTextEntry={item.secureTextEntry}
                            maxLength={item.maxLength} // ✅ Tambahkan prop ini
                            autoCapitalize="none"
                            style={{ color: "#111827" }}
                            selectionColor="#2563EB"
                            value={form[item.key as keyof typeof form]}
                            onChangeText={(text) => setForm({ ...form, [item.key]: text })}
                        />
                    </View>
                ))}


                {/* Date picker */}
                {/* <TouchableOpacity
                    className="w-full p-4 mb-3 border border-gray-300 rounded-lg"
                    onPress={() => setShowDatePicker(true)}
                >
                    <Text>
                        {form.tgl_lahir ? `📅 ${form.tgl_lahir}` : "Pilih Tanggal Lahir"}
                    </Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        value={form.tgl_lahir ? new Date(form.tgl_lahir) : new Date()}
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "calendar"}
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) {
                                const isoDate = selectedDate.toISOString().split("T")[0];
                                setForm({ ...form, tgl_lahir: isoDate });
                            }
                        }}
                    />
                )} */}

                {/* Upload Foto KTP */}
                {/* <View className="flex-row w-full gap-2">
                    <TouchableOpacity
                        onPress={() => pickImage(setFotoKtp, false)}
                        className="items-center flex-1 p-3 border border-gray-400 rounded-lg"
                    >
                        <Text>{fotoKtp ? "📂 Ulangi Foto KTP" : "Upload Foto KTP"}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => pickImage(setFotoKtp, true)}
                        className="items-center flex-1 p-3 border border-gray-400 rounded-lg"
                    >
                        <Text>📷 Kamera KTP</Text>
                    </TouchableOpacity>
                </View>

                {fotoKtp && (
                    <Image
                        source={{ uri: fotoKtp.uri }}
                        style={{ width: 120, height: 80, marginTop: 8, borderRadius: 8 }}
                    />
                )} */}

                {/* Upload Foto KK */}
                {/* <View className="flex-row w-full gap-2 mt-2">
                    <TouchableOpacity
                        onPress={() => pickImage(setFotoKk, false)}
                        className="items-center flex-1 p-3 border border-gray-400 rounded-lg"
                    >
                        <Text>{fotoKk ? "📂 Ulangi Foto KK" : "Upload Foto KK"}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => pickImage(setFotoKk, true)}
                        className="items-center flex-1 p-3 border border-gray-400 rounded-lg"
                    >
                        <Text>📷 Kamera KK</Text>
                    </TouchableOpacity>
                </View>
                {fotoKk && (
                    <Image
                        source={{ uri: fotoKk.uri }}
                        style={{ width: 120, height: 80, marginTop: 8, borderRadius: 8 }}
                    />
                )} */}

                {/* Upload Foto Profil */}
                {/* <View className="flex-row w-full gap-2 mt-2">
                    <TouchableOpacity
                        onPress={() => pickImage(setFotoProfil, false)}
                        className="items-center flex-1 p-3 border border-gray-400 rounded-lg"
                    >
                        <Text>{fotoProfil ? "📂 Ulangi Foto Profil" : "Upload Foto Profil"}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => pickImage(setFotoProfil, true)}
                        className="items-center flex-1 p-3 border border-gray-400 rounded-lg"
                    >
                        <Text>📷 Kamera Profil</Text>
                    </TouchableOpacity>
                </View>

                {fotoProfil && (
                    <Image
                        source={{ uri: fotoProfil.uri }}
                        style={{
                            width: 100,
                            height: 100,
                            marginTop: 8,
                            borderRadius: 50,
                            alignSelf: "center",
                        }}
                    />
                )} */}

                {/* Tombol daftar */}
                <TouchableOpacity
                    onPress={handleRegister}
                    disabled={loading}
                    className="items-center justify-center w-full p-4 mt-6 bg-teal-500 rounded-lg shadow"
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-base font-bold text-white">Daftar Akun</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    className="mt-4 mb-6"
                    onPress={() => router.push("/auth/login")}
                >
                    <Text className="font-semibold text-teal-600">
                        Sudah Punya Akun? Login
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAwareScrollView>
    );
};

export default Register;
