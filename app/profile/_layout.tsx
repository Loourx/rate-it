import { Stack } from 'expo-router';
import { COLORS } from '@/lib/utils/constants';

export default function ProfileLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: COLORS.background,
                },
                headerTintColor: COLORS.textPrimary,
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="edit"
                options={{
                    headerShown: true,
                    title: 'Editar perfil'
                }}
            />
        </Stack>
    );
}
