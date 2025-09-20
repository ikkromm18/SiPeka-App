import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from "expo-linear-gradient";
import { Dimensions, Image, SafeAreaView, ScrollView, Text, View } from "react-native";

const { width } = Dimensions.get('window')

const bannerData = [
  { id: 1, url: require("../../assets/images/banner.png") },
  { id: 2, url: require("../../assets/images/banner.png") },
  { id: 3, url: require("../../assets/images/banner.png") },
]

// Data dummy Riwayat
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
];



export default function Index() {

  const bannerWidth = width * 0.9;
  const marginHorizontal = width * 0.05

  return (
    <View className="flex-1 bg-[#18353D]">
      <Image source={require('../../assets/images/bg-home-screnn.png')}
        className="absolute z-0 object-cover w-full" />

      <SafeAreaView>
        <ScrollView>
          <View className="flex flex-row items-center justify-between px-4 mt-4">
            {/* Logo kiri */}
            <Image
              source={require("../../assets/logo/sipeka-logo.png")}
              className="w-28 h-28"
              resizeMode="contain"
            />

            {/* Icon Notifikasi */}
            <View className="bg-[#fff] rounded-full p-2">
              <MaterialIcons name="notifications-none" size={24} color="#03BA9B" />
            </View>

            {/* Badge jumlah notifikasi */}
            <View className="absolute items-center justify-center w-5 h-5 bg-red-500 rounded-full top-7 right-3">
              <Text className="text-xs font-bold text-white">3</Text>
            </View>
          </View>

          <View className='flex-col flex-1 px-4 mt-2'>

            <Image
              source={require("../../assets/logo/Avatar.png")}
              style={{ width: 50, height: 50, borderRadius: 16 }}
              resizeMode="cover"
            />
            <Text className='text-3xl font-semibold text-[#03BA9B] mt-2'>Aulia Unnaufal</Text>
            <Text className='text-sm font-light text-white'>Desa Karangasem, Kecamatan Petarukan</Text>

          </View>

          <View className="px-6 mt-4">
            <LinearGradient
              colors={["#03B99A", "#016F5C"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="flex flex-row items-center justify-center h-24 rounded-2xl"
            >
              <View className="flex flex-col items-center justify-center">
                <MaterialIcons name="location-on" size={32} color="#fff" />
                <Text className='w-24 text-xs font-light text-center text-white'>Pindah Dalam Provinsi</Text>
              </View>

              <View className="flex flex-col items-center justify-center">
                <MaterialIcons name="flight-takeoff" size={32} color="#fff" />
                <Text className='w-24 text-xs font-light text-center text-white'>Pindah Luar Provinsi</Text>
              </View>

              <View className="flex flex-col items-center justify-center">
                <MaterialIcons name="event" size={32} color="#fff" />
                <Text className='w-24 text-xs font-light text-center text-white'>Permohonan Ijin Hajatan</Text>
              </View>

              <View className="flex flex-col items-center justify-center">
                <MaterialIcons name="favorite-border" size={32} color="#fff" />
                <Text className='w-24 text-xs font-light text-center text-white'>Surat Dispen Nikah</Text>
              </View>

            </LinearGradient>
          </View>

          {/* Riwayat */}
          <View className="px-6 mt-6 bg-[#172E35] py-2">
            <Text className="text-xl font-medium text-white">Riwayat Pengajuan</Text>

            <View className="flex flex-col">
              {riwayatData.slice(-3).map((item) => (
                <View
                  key={item.id}
                  className="flex flex-row items-center justify-between border-b border-b-gray-600"
                >
                  <View className="flex flex-row items-center justify-center py-4">
                    <View className="bg-[#fff] rounded-full p-2">
                      <MaterialIcons name={item.icon as any} size={35} color="#03BA9B" />
                    </View>

                    <View className="flex flex-col ml-3 max-w-40">
                      <Text className="font-normal text-white text-normal">{item.title}</Text>
                      <Text className="text-xs font-light text-white">{item.date}</Text>
                    </View>
                  </View>

                  <FontAwesome6 name="angle-right" size={16} color="white" />
                </View>
              ))}
            </View>

            <View className="flex flex-row items-center justify-center gap-2 mt-2">
              <Text className="text-lg font-light text-center text-white">Lainnya</Text>
              <FontAwesome6 name="angle-right" size={10} color="white" />
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
              {bannerData.map((banner, index) => (
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
