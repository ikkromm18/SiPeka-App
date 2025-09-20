import MaterialIcons from '@expo/vector-icons/MaterialIcons'; // Menggunakan MaterialIcons
import { LinearGradient } from "expo-linear-gradient";
import React from 'react';
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

type ProfileMenuItemProps = {
    icon: keyof typeof MaterialIcons.glyphMap; // biar autocomplete sesuai icon
    text: string;
};


// Komponen terpisah untuk setiap item menu agar kode lebih bersih
const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({ icon, text }) => {
    return (
        <TouchableOpacity activeOpacity={0.8} className="mb-3 overflow-hidden rounded-lg">
            <LinearGradient
                colors={["#03B99A", "#016F5C"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="flex-row items-center justify-between p-4"
            >
                <View className="flex-row items-center">
                    <MaterialIcons name={icon} size={22} color="#fff" />
                    <Text className="ml-4 text-base font-medium text-white">{text}</Text>
                </View>

                <MaterialIcons name="edit" size={18} color="#fff" />
            </LinearGradient>
        </TouchableOpacity>
    );
};


const Profile = () => {
    return (
        <SafeAreaView className="flex-1 bg-[#18353D]">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 30 }}
            >
                <View className="p-6">


                    {/* Profile Info */}
                    <View className="items-center pt-16 mb-10">
                        <View>
                            <Image
                                source={{ uri: 'https://i.pravatar.cc/150?u=jackwilliam' }}
                                className="rounded-full w-28 h-28"
                            />
                            <View className="absolute bottom-0 right-0 p-1 bg-green-500 border-2 border-white rounded-full">
                                <MaterialIcons name="check" size={16} color="white" />
                            </View>
                        </View>
                        <Text className="mt-4 text-2xl font-bold text-[#03BA9B]">Aulia Unnaufal</Text>
                        <Text className="text-base text-white">naufal@gmail.com</Text>
                    </View>

                    {/* Personal Information Section */}
                    <View className="mb-6">
                        <Text className="mb-4 text-lg font-bold text-white">Personal Information</Text>
                        <ProfileMenuItem icon="person-outline" text="Edit Profile" />
                        <ProfileMenuItem icon="credit-card" text="Payment Method" />
                        <ProfileMenuItem icon="lock-outline" text="Old Password" />
                        <ProfileMenuItem icon="lock-outline" text="New Password" />
                    </View>

                    {/* Address Section */}
                    <View className="mb-8">
                        <Text className="mb-4 text-lg font-bold text-white">Address</Text>
                        <ProfileMenuItem icon="location-on" text="Edit Address" />
                    </View>


                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Profile;