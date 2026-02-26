export type NotificationType = 'follow' | 'like' | 'recommendation';

export interface Notification {
    id: string;
    type: NotificationType;
    actorId: string;
    actorUsername: string;
    actorAvatarUrl: string | null;
    // Para 'like':
    ratingId: string | null;
    ratingTitle: string | null;
    ratingType: string | null;
    // Para 'recommendation':
    recContentType: string | null;
    recContentId: string | null;
    recContentTitle: string | null;
    recContentImage: string | null;
    isRead: boolean;
    createdAt: string;
}
