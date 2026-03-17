export interface StreakFreeze {
    id: string;
    userId: string;
    freezeDate: string; // 'YYYY-MM-DD'
    createdAt: string;
}

export interface StreakState {
    streakDays: number;
    freezesAvailableThisWeek: number; // 0, 1 o 2
    freezesUsedDates: string[];       // ['YYYY-MM-DD', ...]
}
