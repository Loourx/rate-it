import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/stores/authStore';

interface ConsumeFreezeInput {
    freezeDate: string; // 'YYYY-MM-DD'
    userId: string;
}

export function useConsumeFreeze() {
    const queryClient = useQueryClient();
    const currentUserId = useAuthStore((state) => state.user?.id);

    return useMutation({
        mutationFn: async ({ freezeDate, userId: uid }: ConsumeFreezeInput): Promise<void> => {
            const { error } = await supabase
                .from('streak_freezes')
                .insert({ user_id: uid, freeze_date: freezeDate });
            if (error) throw error;
        },
        onSuccess: () => {
            // Invalidar streak para recalcular
            if (currentUserId) {
                queryClient.invalidateQueries({ queryKey: ['streak', currentUserId] });
            }
        },
    });
}
