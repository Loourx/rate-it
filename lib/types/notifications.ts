export type NotificationType = 'follow' | 'like';

export interface Notification {
    id: string;
    type: NotificationType;
    actorId: string;
    actorUsername: string;
    actorAvatarUrl: string | null;
    ratingId: string | null;
    ratingTitle: string | null;
    ratingType: string | null;
    isRead: boolean;
    createdAt: string;
}
