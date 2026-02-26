import { supabase } from '@/lib/supabase';
import type { Notification } from '@/lib/types/notifications';

export async function getNotifications(userId: string): Promise<Notification[]> {
    // Step 1: Fetch notifications with sender profile
    const { data, error } = await supabase
        .from('notifications')
        .select(`
            *,
            sender:profiles!sender_id(
                id,
                username,
                display_name,
                avatar_url
            )
        `)
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) throw error;

    // Step 2: For 'like' notifications, fetch the related rating titles
    const likeNotifs = (data ?? []).filter(
        (n) => n.type === 'like' && n.reference_id,
    );
    const ratingIds = likeNotifs.map((n) => n.reference_id as string);

    let ratingsMap: Record<string, { content_title: string; content_type: string }> = {};

    if (ratingIds.length > 0) {
        const { data: ratings } = await supabase
            .from('ratings')
            .select('id, content_title, content_type')
            .in('id', ratingIds);

        if (ratings) {
            ratingsMap = Object.fromEntries(
                ratings.map((r) => [r.id, { content_title: r.content_title, content_type: r.content_type }]),
            );
        }
    }

    return (data ?? []).map((notif) => {
        const sender = notif.sender as Record<string, string> | null;
        const rating = notif.reference_id ? ratingsMap[notif.reference_id as string] : null;

        return {
            id: notif.id as string,
            type: notif.type as Notification['type'],
            actorId: notif.sender_id as string,
            actorUsername: sender?.username ?? 'Usuario',
            actorAvatarUrl: sender?.avatar_url ?? null,
            ratingId: (notif.reference_id as string) ?? null,
            ratingTitle: rating?.content_title ?? null,
            ratingType: rating?.content_type ?? null,
            recContentType: (notif.rec_content_type as string) ?? null,
            recContentId: (notif.rec_content_id as string) ?? null,
            recContentTitle: (notif.rec_content_title as string) ?? null,
            recContentImage: (notif.rec_content_image as string) ?? null,
            isRead: notif.is_read as boolean,
            createdAt: notif.created_at as string,
        };
    });
}

export async function getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('is_read', false);

    if (error) throw error;
    return count ?? 0;
}

export async function markAsRead(notificationIds: string[]): Promise<void> {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', notificationIds);

    if (error) throw error;
}

export async function markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', userId)
        .eq('is_read', false);

    if (error) throw error;
}

export async function sendRecommendation({
    senderId,
    recipientId,
    contentType,
    contentId,
    contentTitle,
    contentImageUrl,
}: {
    senderId: string;
    recipientId: string;
    contentType: string;
    contentId: string;
    contentTitle: string;
    contentImageUrl: string | null;
}): Promise<void> {
    const { error } = await supabase
        .from('notifications')
        .insert({
            sender_id: senderId,
            recipient_id: recipientId,
            type: 'recommendation',
            rec_content_type: contentType,
            rec_content_id: contentId,
            rec_content_title: contentTitle,
            rec_content_image: contentImageUrl,
        });

    if (error) throw error;
}
