import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";

// Dummy data riwayat
const riwayatData = [
    {
        id: 1,
        title: "Pindah Antar Kabupaten / Provinsi",
        date: "10 September 2025, 10.00",
        icon: "location-on",
    },
    {
        id: 2,
        title: "Permohonan Ijin Hajatan",
        date: "08 September 2025, 14.30",
        icon: "event",
    },
    {
        id: 3,
        title: "Surat Dispen Nikah",
        date: "05 September 2025, 09.15",
        icon: "favorite-border",
    },
    {
        id: 4,
        title: "Pindah Dalam Provinsi",
        date: "03 September 2025, 11.45",
        icon: "location-on",
    },
    {
        id: 5,
        title: "Pindah Luar Provinsi",
        date: "01 September 2025, 16.20",
        icon: "flight-takeoff",
    },
    {
        id: 6,
        title: "Pindah Antar Kabupaten / Provinsi",
        date: "10 September 2025, 10.00",
        icon: "location-on",
    },
    {
        id: 7,
        title: "Permohonan Ijin Hajatan",
        date: "08 September 2025, 14.30",
        icon: "event",
    },
    {
        id: 8,
        title: "Surat Dispen Nikah",
        date: "05 September 2025, 09.15",
        icon: "favorite-border",
    },
    {
        id: 9,
        title: "Pindah Dalam Provinsi",
        date: "03 September 2025, 11.45",
        icon: "location-on",
    },
    {
        id: 10,
        title: "Pindah Luar Provinsi",
        date: "01 September 2025, 16.20",
        icon: "flight-takeoff",
    },
    {
        id: 11,
        title: "Surat Dispen Nikah",
        date: "05 September 2025, 09.15",
        icon: "favorite-border",
    },
    {
        id: 12,
        title: "Pindah Dalam Provinsi",
        date: "03 September 2025, 11.45",
        icon: "location-on",
    },
    {
        id: 13,
        title: "Pindah Luar Provinsi",
        date: "01 September 2025, 16.20",
        icon: "flight-takeoff",
    },
];

const History = () => {
    return (
        <View className="flex-1 bg-[#18353D]">
            <SafeAreaView>
                <ScrollView className="px-6 py-4">
                    <Text className="mt-8 mb-4 text-2xl font-semibold text-white">
                        Riwayat Pengajuan
                    </Text>

                    <View className="flex flex-col pb-36">
                        {riwayatData.map((item) => (
                            <View
                                key={item.id}
                                className="flex flex-row items-center justify-between border-b border-b-gray-600"
                            >
                                <View className="flex flex-row items-center justify-center py-4">
                                    <View className="bg-[#fff] rounded-full p-2">
                                        <MaterialIcons name={item.icon as any} size={35} color="#03BA9B" />
                                    </View>

                                    <View className="flex flex-col flex-shrink ml-3">
                                        <Text className="text-base font-normal text-white">
                                            {item.title}
                                        </Text>
                                        <Text className="text-xs font-light text-white">
                                            {item.date}
                                        </Text>
                                    </View>
                                </View>

                                <FontAwesome6 name="angle-right" size={16} color="white" />
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default History;
