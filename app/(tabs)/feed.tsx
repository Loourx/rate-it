import React from 'react';
import { View, Text } from 'react-native';
import { EmptyState } from '@/components/ui/EmptyState';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FeedScreen() {
    return (
        <SafeAreaView className="flex-1 bg-background">
            <EmptyState
                icon="people-outline"
                title="Feed Social"
                description="Aquí verás la actividad de tus amigos. ¡Próximamente!"
            />
        </SafeAreaView>
    );
}
