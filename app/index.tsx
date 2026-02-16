import { Redirect } from 'expo-router';
import { useAuthStore } from '@/lib/stores/authStore';

export default function Index() {
    const { session } = useAuthStore();

    if (session) {
        return <Redirect href="/(tabs)" />;
    } else {
        return <Redirect href="/(auth)/login" />;
    }
}
