import { API_BASE_URL } from '@/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    RefreshControl,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// 🧩 Definisikan tipe notifikasi sesuai data dari Laravel
interface NotificationData {
    message: string;
    pengajuan_id?: number;
}

interface NotificationItem {
    id: string;
    data: NotificationData;
    created_at: string;
    read_at: string | null;
}

interface ApiResponse {
    unread: NotificationItem[];
    read: NotificationItem[];
}

const Notifikasi: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const fadeAnim = useState(new Animated.Value(0))[0];

    const API_URL = `${API_BASE_URL}/notifications`;

    const fetchNotifications = async () => {
        try {
            setLoading(true);

            // 🔑 Ambil token dari AsyncStorage
            const token = await AsyncStorage.getItem('token');

            if (!token) {
                console.warn('Token tidak ditemukan di AsyncStorage');
                setLoading(false);
                return;
            }

            // 🔥 Panggil API Laravel - menggunakan endpoint /notifications
            const response = await axios.get<ApiResponse>(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Gabungkan unread dan read notifications
            const allNotifications = [
                ...(response.data.unread || []),
                ...(response.data.read || [])
            ];

            setNotifications(allNotifications);

            // Animasi fade in
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }).start();
        } catch (error: any) {
            console.error('Gagal mengambil notifikasi:', error.response?.data || error.message);
            Alert.alert('Error', 'Gagal memuat notifikasi');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const markAsRead = async (notificationId: string) => {
        try {
            const token = await AsyncStorage.getItem('token');

            if (!token) {
                Alert.alert('Error', 'Token tidak ditemukan');
                return;
            }

            // Panggil API untuk menandai notifikasi sebagai dibaca
            await axios.patch(
                `${API_BASE_URL}/notifications/${notificationId}/read`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Update state lokal - tandai notifikasi sebagai read
            setNotifications(prevNotifications =>
                prevNotifications.map(notif =>
                    notif.id === notificationId
                        ? { ...notif, read_at: new Date().toISOString() }
                        : notif
                )
            );

        } catch (error: any) {
            console.error('Gagal menandai notifikasi sebagai dibaca:', error.response?.data || error.message);
            Alert.alert('Error', 'Gagal menandai notifikasi sebagai dibaca');
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = await AsyncStorage.getItem('token');

            if (!token) {
                Alert.alert('Error', 'Token tidak ditemukan');
                return;
            }

            const unreadNotifications = notifications.filter(notif => !notif.read_at);

            // Mark all unread notifications as read
            for (const notification of unreadNotifications) {
                await axios.patch(
                    `${API_BASE_URL}/notifications/${notification.id}/read`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            }

            // Update semua notifikasi menjadi read
            setNotifications(prevNotifications =>
                prevNotifications.map(notif => ({ ...notif, read_at: notif.read_at || new Date().toISOString() }))
            );

            Alert.alert('Sukses', 'Semua notifikasi ditandai sebagai dibaca');

        } catch (error: any) {
            console.error('Gagal menandai semua notifikasi sebagai dibaca:', error.response?.data || error.message);
            Alert.alert('Error', 'Gagal menandai semua notifikasi sebagai dibaca');
        }
    };

    const formatTime = (timeString: string) => {
        return timeString;
    };

    const getUnreadCount = () => {
        return notifications.filter(notif => !notif.read_at).length;
    };

    if (loading) {
        return (
            <View className="items-center justify-center flex-1 bg-slate-50">
                <ActivityIndicator size="large" color="#03BA9B" />
                <Text className="mt-3 text-sm text-slate-500">
                    Memuat notifikasi...
                </Text>
            </View>
        );
    }

    const unreadCount = getUnreadCount();

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header Custom - karena header Stack sudah diatur di RootLayout */}
            <View className="bg-[#172E35] px-6 pt-16 pb-6 rounded-b-3xl shadow-lg shadow-black/20">
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="mb-1 text-3xl font-bold text-white">
                            Notifikasi
                        </Text>
                        <Text className="text-sm text-[#03BA9B] font-medium">
                            {unreadCount} pesan belum dibaca
                        </Text>
                    </View>
                    {unreadCount > 0 && (
                        <TouchableOpacity
                            onPress={markAllAsRead}
                            className="bg-[#03BA9B] px-3 py-2 rounded-lg"
                        >
                            <Text className="text-xs font-medium text-white">
                                Tandai Semua Dibaca
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {notifications.length === 0 ? (
                <View className="items-center justify-center flex-1 px-12">
                    <View className="items-center justify-center w-20 h-20 mb-6 rounded-full bg-slate-100">
                        <Text className="text-3xl">🔔</Text>
                    </View>
                    <Text className="text-lg font-semibold text-[#172E35] mb-2 text-center">
                        Tidak ada notifikasi
                    </Text>
                    <Text className="text-sm leading-5 text-center text-slate-500">
                        Anda akan menerima notifikasi di sini ketika ada pembaruan
                    </Text>
                </View>
            ) : (
                <Animated.FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    style={{ opacity: fadeAnim }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#03BA9B']}
                            tintColor="#03BA9B"
                        />
                    }
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity
                            className={`
                                bg-white p-5 mx-4 my-2 rounded-2xl 
                                border border-slate-100 shadow-sm shadow-[#172E35]/10
                                ${index === 0 ? 'mt-4' : ''}
                                ${index === notifications.length - 1 ? 'mb-4' : ''}
                                ${!item.read_at ? 'border-l-4 border-l-[#03BA9B]' : ''}
                            `}
                            onPress={() => !item.read_at && markAsRead(item.id)}
                            activeOpacity={0.7}
                        >
                            <View className="flex-row items-center justify-between mb-2">
                                <View className="flex-row items-center">
                                    {!item.read_at && (
                                        <View className="w-2 h-2 rounded-full bg-[#03BA9B] mr-2" />
                                    )}
                                    <Text className={`text-xs ${!item.read_at ? 'text-[#03BA9B] font-semibold' : 'text-slate-500'}`}>
                                        {!item.read_at ? 'BARU' : 'SUDAH DIBACA'}
                                    </Text>
                                </View>
                                <Text className="text-xs font-normal text-slate-500">
                                    {formatTime(item.created_at)}
                                </Text>
                            </View>
                            <Text className={`text-base leading-6 font-medium ${!item.read_at ? 'text-[#172E35]' : 'text-slate-500'}`}>
                                {item.data?.message}
                            </Text>
                            {/* {item.data.pengajuan_id && (
                                <View className="self-start px-2 py-1 mt-3 rounded-lg bg-slate-100">
                                    <Text className="text-xs font-medium text-slate-600">
                                        ID: {item.data.pengajuan_id}
                                    </Text>
                                </View>
                            )} */}
                            {!item.read_at && (
                                <TouchableOpacity
                                    onPress={() => markAsRead(item.id)}
                                    className="bg-[#03BA9B] self-end px-3 py-1 rounded-lg mt-3"
                                >
                                    <Text className="text-xs font-medium text-white">
                                        Tandai Dibaca
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={{ paddingVertical: 8 }}
                />
            )}
        </View>
    );
};

export default Notifikasi;