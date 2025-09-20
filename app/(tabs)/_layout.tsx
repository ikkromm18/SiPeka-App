import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import React from 'react'
import { StyleSheet } from 'react-native'

const _layout = () => {
    return (
        <Tabs
            screenOptions={
                {
                    tabBarActiveTintColor: '#03B798',
                    tabBarInactiveTintColor: '#9CA3AF',
                    tabBarItemStyle: {
                        width: '100%',
                        height: '50%',
                        justifyContent: 'center',
                        alignItems: 'center'
                    },
                    tabBarStyle: {
                        backgroundColor: '#172E35',
                        borderColor: '#172E35',
                        marginHorizontal: 0,
                        position: 'absolute',
                        overflow: 'hidden',
                        shadowColor: '#000',
                        shadowOffset: {
                            width: 0,
                            height: 5,
                        },
                        shadowOpacity: 0.1,
                        shadowRadius: 5,
                    }
                }
            }
        >
            <Tabs.Screen

                name='index'
                options={{
                    headerShown: false,
                    title: 'Beranda',
                    tabBarIcon: ({ size, color }) => (
                        <Ionicons name="home-outline" size={20} color={color} />
                    )
                }}
            />

            <Tabs.Screen

                name='history'
                options={{
                    headerShown: false,
                    title: 'Riwayat',
                    tabBarIcon: ({ size, color }) => (
                        <Ionicons name="time-outline" size={20} color={color} />
                    )
                }}
            />

            <Tabs.Screen

                name='profile'
                options={{
                    headerShown: false,
                    title: 'Akun',
                    tabBarIcon: ({ size, color }) => (
                        <Ionicons name="person-outline" size={20} color={color} />
                    )
                }}
            />
        </Tabs>
    )
}

export default _layout

const styles = StyleSheet.create({})