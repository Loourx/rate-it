import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, View } from 'react-native';
import { COLORS } from '@/lib/utils/constants';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: COLORS.surface,
                    borderTopWidth: 1,
                    borderTopColor: COLORS.divider,
                    height: Platform.OS === 'ios' ? 88 : 60,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: COLORS.textPrimary,
                tabBarInactiveTintColor: COLORS.textTertiary,
                tabBarShowLabel: true,
                tabBarLabelStyle: {
                    fontFamily: 'SpaceGrotesk_500Medium',
                    fontSize: 10,
                    marginBottom: 4,
                },
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Inicio',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    title: 'Buscar',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "search" : "search-outline"} size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="rate"
                options={{
                    title: '',
                    tabBarButton: (props) => (
                        <View className="items-center justify-center -mt-6">
                            <View
                                className="w-14 h-14 rounded-full bg-surface-elevated items-center justify-center shadow-lg border border-divider"
                                onTouchEnd={props.onPress}
                            >
                                <Ionicons name="add" size={32} color={COLORS.textPrimary} />
                            </View>
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="feed"
                options={{
                    title: 'Feed',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "people" : "people-outline"} size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Perfil',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
