import API_BASE_URL from '@/config/api';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from 'expo-router';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get('window')

const bannerData = [
  { id: 1, url: require("../../assets/images/banner.png") },
  { id: 2, url: require("../../assets/images/banner.png") },
  { id: 3, url: require("../../assets/images/banner.png") },
];

type Pengajuan = {
  id: number;
  jenisSurats: {
    id: number;
    nama_jenis: string;
  };
  status: string;
  created_at: string;
};

type User = {
  id: number;
  name: string;
  alamat: string;
  is_active: boolean;
};

const RequirementItem = ({ title, items }: { title: string; items: string[] }) => (
  <View className="mb-4">
    <Text className="mb-2 text-base font-semibold text-white">{title}</Text>
    {items.map((item, idx) => (
      <View key={idx} className="flex-row items-start mb-1 ml-4">
        <MaterialIcons name="check-circle" size={16} color="#03BA9B" style={{ marginTop: 2 }} />
        <Text className="flex-shrink ml-2 text-sm text-white">{item}</Text>
      </View>
    ))}
  </View>
);

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [riwayat, setRiwayat] = useState<Pengajuan[]>([]);
  const [loadingRiwayat, setLoadingRiwayat] = useState(true);

  const bannerWidth = width * 0.9;
  const marginHorizontal = width * 0.05;

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${API_BASE_URL}/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          console.log("Gagal ambil user:", await res.text());
        }
      } catch (e) {
        console.log("Error:", e);
      } finally {
        setLoading(false);
      }
    };

    const loadRiwayat = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${API_BASE_URL}/pengajuanterbaru`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (res.ok) {
          const data = await res.json();
          setRiwayat(data);
        } else {
          console.log("Gagal ambil riwayat:", await res.text());
        }
      } catch (e) {
        console.log("Error:", e);
      } finally {
        setLoadingRiwayat(false);
      }
    };

    loadUser();
    loadRiwayat();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#172E35]">
        <ActivityIndicator size="large" color="#03BA9B" />
      </View>
    );
  }

  // Jika user tidak aktif
  if (user && !user.is_active) {
    return (
      <View className="flex-1 bg-[#18353D] items-center justify-center px-6">
        <Image
          source={require("../../assets/images/bg-home-screnn.png")}
          className="absolute z-0 object-cover w-full"
        />
        <MaterialIcons name="lock-outline" size={64} color="#03BA9B" />
        <Text className="mt-4 text-xl font-semibold text-center text-white">
          Akun Anda Belum Aktif
        </Text>
        <Text className="mt-2 text-center text-gray-300">
          Silakan hubungi admin atau pihak kecamatan untuk mengaktifkan kembali akun Anda.
        </Text>
      </View>
    );
  }

  // Jika user aktif
  return (
    <View className="flex-1 bg-[#18353D]">
      <Image
        source={require('../../assets/images/bg-home-screnn.png')}
        className="absolute z-0 object-cover w-full"
      />

      <SafeAreaView>
        <ScrollView>
          <View className="flex flex-row items-center justify-between px-6 mt-2">
            <Image
              source={require("../../assets/logo/sipeka-logo.png")}
              className="w-28 h-28"
              resizeMode="contain"
            />

            <View className="bg-[#fff] rounded-full p-2">
              <MaterialIcons name="notifications-none" size={24} color="#03BA9B" />
            </View>

            <View className="absolute items-center justify-center w-5 h-5 bg-red-500 rounded-full top-8 right-4">
              <Text className="text-xs font-bold text-white">3</Text>
            </View>
          </View>

          {/* Data User */}
          <View className="flex-col flex-1 px-4 mt-2 ml-2">
            <Image
              source={require("../../assets/logo/Avatar.png")}
              style={{ width: 50, height: 50, borderRadius: 16 }}
              resizeMode="cover"
            />
            <Text className="text-3xl font-semibold text-[#03BA9B] mt-2">
              {user?.name || "Guest"}
            </Text>
            <Text className="text-sm font-light text-white">
              {user?.alamat || "Tidak ada alamat"}
            </Text>
          </View>

          {/* Menu Surat */}
          <View className="px-6 mt-4">
            <LinearGradient
              colors={["#03B99A", "#016F5C"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="flex flex-row items-center justify-center h-24 rounded-2xl"
            >
              <RenderMenu href="/pindahDalamProvinsi" icon="location-on" text="Pindah Dalam Provinsi" />
              <RenderMenu href="/pindahLuarProvinsi" icon="flight-takeoff" text="Pindah Luar Provinsi" />
              <RenderMenu href="/dispenNikah" icon="favorite-border" text="Surat Dispen Nikah" />
              <RenderMenu href="/ijinHajatan" icon="event" text="Permohonan Ijin Hajatan" />
            </LinearGradient>
          </View>

          {/* Persyaratan */}
          <View className="bg-[#172E35] rounded-xl mt-8 px-8 py-4">
            <Text className="text-lg font-semibold text-[#03BA9B] mb-4">
              Persyaratan Pengajuan Surat
            </Text>
            <RequirementItem
              title="1. Surat Pengantar Pindah"
              items={["Surat pengantar pindah dari kelurahan", "KTP", "KK", "Buku Nikah"]}
            />
            <RequirementItem
              title="2. Surat Dispensasi Nikah"
              items={["Pengantar dari kelurahan"]}
            />
            <RequirementItem
              title="3. Surat Ijin Hajatan"
              items={["Pengantar dari kelurahan", "KTP"]}
            />
          </View>

          {/* Riwayat Pengajuan */}
          <View className="px-6 mt-6 bg-[#172E35] py-2 rounded-t-xl">
            <Text className="mt-4 text-xl font-medium text-white">Riwayat Pengajuan</Text>
            <View className="flex flex-col">
              {loadingRiwayat ? (
                <ActivityIndicator size="small" color="#03BA9B" className="mt-4" />
              ) : riwayat.length > 0 ? (
                riwayat.map((item) => (
                  <View
                    key={item.id}
                    className="flex flex-row items-center justify-between border-b border-b-gray-600"
                  >
                    <View className="flex flex-row items-center justify-center py-4">
                      <View className="bg-[#fff] rounded-full p-2">
                        <MaterialIcons name="description" size={35} color="#03BA9B" />
                      </View>
                      <View className="flex flex-col ml-3 max-w-40">
                        <Text className="font-normal text-white text-normal">
                          {item.jenisSurats?.nama_jenis || "Pengajuan Surat"}
                        </Text>
                        <Text className="text-xs font-light text-white">
                          {new Date(item.created_at).toLocaleString("id-ID")}
                        </Text>
                      </View>
                    </View>
                    <FontAwesome6 name="angle-right" size={16} color="white" />
                  </View>
                ))
              ) : (
                <Text className="mt-4 text-sm text-white">Belum ada riwayat pengajuan</Text>
              )}
            </View>
          </View>

          {/* Banner */}
          <View className="pb-32 mt-6">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              contentContainerStyle={{ paddingHorizontal: marginHorizontal }}
            >
              {bannerData.map((banner) => (
                <View
                  key={banner.id}
                  style={{
                    width: bannerWidth,
                    marginRight: 12,
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  <Image
                    source={banner.url}
                    style={{ width: "100%" }}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// Komponen menu surat
type RenderMenuProps = {
  href: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  text: string;
};

function RenderMenu({ href, icon, text }: RenderMenuProps) {
  return (
    <Link href={href as any} asChild>
      <TouchableOpacity className="items-center w-20">
        <MaterialIcons name={icon} size={32} color="#fff" />
        <Text className="w-24 mt-1 text-xs font-light text-center text-white">
          {text}
        </Text>
      </TouchableOpacity>
    </Link>
  );
}