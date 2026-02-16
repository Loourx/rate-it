import React from 'react';
import { View, Text } from 'react-native';
import { EmptyState } from '@/components/ui/EmptyState';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RateScreen() {
    return (
        <SafeAreaView className="flex-1 bg-background">
            <EmptyState
                icon="star-outline"
                title="Valorar Contenido"
                description="Busca y valora contenido rápidamente. ¡Próximamente!"
            />
        </SafeAreaView>
    );
}
