import API_BASE_URL from '@/config/api';
import axios from 'axios';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_URL = `${API_BASE_URL}/forgot-password`;

// 🔍 Debug awal — pastikan API URL benar
console.log("🔗 API_URL:", API_URL);

const LupaPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        console.log("📩 Tombol diklik");
        console.log("📧 Email input:", email);

        if (!email) {
            Alert.alert('Error', 'Email tidak boleh kosong');
            console.warn("⚠️ Validasi gagal: email kosong");
            return;
        }

        setLoading(true);

        try {
            console.log("🚀 Mengirim request ke:", API_URL);
            const response = await axios.post(API_URL, { email });

            // 🔍 Debug hasil respon dari server
            console.log("✅ Response status:", response.status);
            console.log("📦 Response data:", response.data);

            Alert.alert('Berhasil', response.data.message || 'Link reset password telah dikirim ke email Anda');
            setEmail('');
        } catch (error: any) {
            console.log("❌ Terjadi error saat kirim forgot-password:");

            // Debug lengkap — untuk memeriksa semua kemungkinan
            if (error.response) {
                console.log("🧾 Response error data:", error.response.data);
                console.log("⚙️ Response status:", error.response.status);
                console.log("🧠 Response headers:", error.response.headers);
            } else if (error.request) {
                console.log("📡 Request dikirim tapi tidak ada response:", error.request);
            } else {
                console.log("💥 Kesalahan saat membuat request:", error.message);
            }

            Alert.alert('Gagal', error.response?.data?.message || 'Terjadi kesalahan saat mengirim permintaan');
        } finally {
            setLoading(false);
            console.log("⏹️ Proses selesai\n");
        }
    };

    return (
        <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20 }}>Lupa Password</Text>

            <TextInput
                placeholder="Masukkan email kamu"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 20,
                }}
            />

            <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                style={{
                    backgroundColor: loading ? '#999' : '#007bff',
                    padding: 14,
                    borderRadius: 8,
                    alignItems: 'center',
                }}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Kirim Link Reset</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

export default LupaPassword;
