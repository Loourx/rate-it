import React, { useState, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/lib/stores/authStore';
import { useDiary } from '@/lib/hooks/useDiary';
import { CalendarDay } from '@/components/profile/CalendarDay';
import { DayDetail } from '@/components/profile/DayDetail';
import { COLORS, FONT_SIZE, SPACING } from '@/lib/utils/constants';
import type { DiaryDay } from '@/lib/api/diary';

// ─── calendar grid util ───────────────────────────────────────────────────────

interface CalendarCell {
    day: number | null;
    dateKey: string | null;
}

function buildCalendarGrid(year: number, month: number): CalendarCell[][] {
    const paddedMonth = String(month).padStart(2, '0');
    const firstDayDate = new Date(year, month - 1, 1);
    // Monday-first: JS getDay() 0=Sun..6=Sat → Mon=0..Sun=6
    const startOffset = (firstDayDate.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month, 0).getDate();

    const cells: CalendarCell[] = [];

    // Padding cells for previous month days
    for (let i = 0; i < startOffset; i++) {
        cells.push({ day: null, dateKey: null });
    }
    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
        const dayStr = String(d).padStart(2, '0');
        cells.push({ day: d, dateKey: `${year}-${paddedMonth}-${dayStr}` });
    }
    // Pad to a multiple of 7
    while (cells.length % 7 !== 0) {
        cells.push({ day: null, dateKey: null });
    }

    // Split into weeks
    const weeks: CalendarCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
        weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
}

const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const DAY_HEADERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

// ─── screen ───────────────────────────────────────────────────────────────────

export default function DiaryScreen() {
    const userId = useAuthStore((s) => s.user?.id);
    const router = useRouter();

    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1); // 1-based
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const { data: diaryMap, isLoading } = useDiary(userId, year, month);

    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const prevMonth = useCallback(() => {
        setSelectedDate(null);
        if (month === 1) {
            setYear((y) => y - 1);
            setMonth(12);
        } else {
            setMonth((m) => m - 1);
        }
    }, [month]);

    const nextMonth = useCallback(() => {
        setSelectedDate(null);
        if (month === 12) {
            setYear((y) => y + 1);
            setMonth(1);
        } else {
            setMonth((m) => m + 1);
        }
    }, [month]);

    const handleDayPress = useCallback((dateKey: string) => {
        setSelectedDate((prev) => (prev === dateKey ? null : dateKey));
    }, []);

    const weeks = buildCalendarGrid(year, month);
    const selectedRatings: DiaryDay[] = selectedDate
        ? (diaryMap?.get(selectedDate) ?? [])
        : [];

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />

            {/* Custom header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mi Diario 📅</Text>
                <View style={styles.backBtn} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Month navigator */}
                <View style={styles.navRow}>
                    <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
                        <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.monthLabel}>
                        {MONTH_NAMES[month - 1]} {year}
                    </Text>
                    <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
                        <Ionicons name="chevron-forward" size={22} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                </View>

                {/* Day-of-week headers */}
                <View style={styles.dayHeaders}>
                    {DAY_HEADERS.map((h) => (
                        <Text key={h} style={styles.dayHeaderText}>
                            {h}
                        </Text>
                    ))}
                </View>

                {/* Calendar grid */}
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color={COLORS.link} />
                    </View>
                ) : (
                    <View style={styles.grid}>
                        {weeks.map((week, wi) => (
                            <View key={wi} style={styles.weekRow}>
                                {week.map((cell, di) => (
                                    <CalendarDay
                                        key={`${wi}-${di}`}
                                        day={cell.day}
                                        dateKey={cell.dateKey}
                                        ratings={cell.dateKey ? (diaryMap?.get(cell.dateKey) ?? []) : []}
                                        isSelected={selectedDate === cell.dateKey}
                                        isToday={cell.dateKey === todayKey}
                                        onPress={handleDayPress}
                                    />
                                ))}
                            </View>
                        ))}
                    </View>
                )}

                {/* Day detail panel */}
                {selectedDate && selectedRatings.length > 0 && (
                    <DayDetail dateKey={selectedDate} ratings={selectedRatings} />
                )}

                {/* Empty month message */}
                {!isLoading && diaryMap?.size === 0 && (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="calendar-outline" size={40} color={COLORS.textTertiary} />
                        <Text style={styles.emptyText}>Sin ratings este mes</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.sm,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: COLORS.divider,
    },
    backBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: FONT_SIZE.headlineSmall,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    scroll: {
        paddingBottom: 40,
    },
    navRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.md,
    },
    navBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: COLORS.surface,
    },
    monthLabel: {
        fontSize: FONT_SIZE.headlineMedium,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    dayHeaders: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.base,
        marginBottom: 4,
    },
    dayHeaderText: {
        flex: 1,
        textAlign: 'center',
        fontSize: FONT_SIZE.labelSmall,
        fontWeight: '600',
        color: COLORS.textTertiary,
        textTransform: 'uppercase',
    },
    loadingContainer: {
        height: 260,
        alignItems: 'center',
        justifyContent: 'center',
    },
    grid: {
        paddingHorizontal: SPACING.base,
    },
    weekRow: {
        flexDirection: 'row',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        gap: 12,
    },
    emptyText: {
        fontSize: FONT_SIZE.bodyMedium,
        color: COLORS.textTertiary,
    },
});
