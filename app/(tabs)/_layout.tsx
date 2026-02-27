import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { COLORS } from '@/lib/utils/constants';
import { TYPO } from '@/lib/utils/typography';
import { useUnreadCount } from '@/lib/hooks/useUnreadCount';

export default function TabLayout() {
    const { data: unreadCount } = useUnreadCount();

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
                    ...TYPO.label,
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
                    tabBarBadge:
                        unreadCount && unreadCount > 0 ? unreadCount : undefined,
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
                    ),
                    headerShown: true,
                    headerStyle: { backgroundColor: COLORS.background },
                    headerTintColor: COLORS.textPrimary,
                    headerRight: () => (
                        <Pressable
                            onPress={() => router.push('/notifications')}
                            className="mr-4"
                        >
                            <View>
                                <Ionicons
                                    name="notifications-outline"
                                    size={24}
                                    color={COLORS.textPrimary}
                                />
                                {!!unreadCount && unreadCount > 0 && (
                                    <View className="absolute -top-1 -right-1 bg-error rounded-full w-4 h-4 items-center justify-center">
                                        <Text className="text-white text-[10px] font-bold">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </Pressable>
                    ),
                }}
            />
        </Tabs>
    );
}
