import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ContentType } from '@/lib/types/content';
import { RatingSlider } from '@/components/rating/RatingSlider';
import { RatingHeader } from '@/components/rating/RatingHeader';
import { StatusPicker } from '@/components/rating/StatusPicker';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Toast } from '@/components/ui/Toast';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '@/lib/utils/constants';
import { useRatingForm } from '@/lib/hooks/useRatingForm';
import { AlbumTrackRatingSection } from '@/components/rating/AlbumTrackRatingSection';

const CATEGORY_COLORS: Record<ContentType, string> = {
    movie: COLORS.categoryMovie,
    series: COLORS.categorySeries,
    book: COLORS.categoryBook,
    game: COLORS.categoryGame,
    music: COLORS.categoryMusic,
    podcast: COLORS.categoryPodcast,
    anything: COLORS.categoryAnything,
};

const MAX_REVIEW_LENGTH = 2000;

export default function RateScreen() {
    const { type, id, isAlbum: _isAlbum } = useLocalSearchParams<{ type: string; id: string; isAlbum?: string }>();
    const contentType = type as ContentType;
    const categoryColor = CATEGORY_COLORS[contentType] ?? COLORS.textPrimary;

    const { content, formData, state, actions } = useRatingForm({
        contentType,
        contentId: id,
    });

    if (state.isLoading) return <LoadingSkeleton />;
    if (state.isError || !content) return <ErrorState onRetry={() => actions.refetch()} />;

    return (
        <>
            <Stack.Screen options={{
                title: state.isEditing ? 'Editar valoración' : 'Valorar',
                headerStyle: { backgroundColor: COLORS.background },
                headerTintColor: COLORS.textPrimary,
            }} />
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                    <RatingHeader content={content} />
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>{state.isAlbumContent ? 'Nota del álbum' : 'Desliza para puntuar'}</Text>
                        <RatingSlider
                            value={formData.score}
                            onValueChange={actions.setScore}
                            category={contentType}
                            size="interactive"
                        />
                    </View>
                    {state.isAlbumContent && (
                        <AlbumTrackRatingSection
                            collectionId={id}
                            trackRatings={formData.trackRatings}
                            onTrackScoreChange={actions.setTrackScore}
                            trackAverage={formData.trackAverage}
                            expanded={formData.showTrackRatings}
                            onToggleExpanded={actions.setShowTrackRatings}
                            initializeTrackRatings={actions.initializeTrackRatings}
                            categoryColor={categoryColor}
                        />
                    )}
                    {state.isAlbumContent && formData.trackAverage !== null && (
                        <Text style={[styles.trackAverageLabel, { color: categoryColor }]}>
                            Media canciones: {formData.trackAverage.toFixed(1)}
                        </Text>
                    )}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Reseña (opcional)</Text>
                        <TextInput
                            style={styles.textInput}
                            multiline
                            maxLength={MAX_REVIEW_LENGTH}
                            placeholder="¿Qué te ha parecido?"
                            placeholderTextColor={COLORS.textTertiary}
                            value={formData.review}
                            onChangeText={actions.setReview}
                        />
                        <Text style={styles.charCount}>{formData.review.length}/{MAX_REVIEW_LENGTH}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => actions.setHasSpoiler((p) => !p)}
                        style={styles.spoilerRow}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={formData.hasSpoiler ? 'checkbox' : 'square-outline'}
                            size={24}
                            color={formData.hasSpoiler ? COLORS.warning : COLORS.textTertiary}
                        />
                        <Text style={styles.spoilerText}>Contiene spoilers</Text>
                    </TouchableOpacity>
                    <View style={styles.section}>
                        <StatusPicker
                            contentType={contentType}
                            selectedStatus={formData.status}
                            onStatusChange={actions.setStatus}
                            categoryColor={categoryColor}
                        />
                    </View>
                </ScrollView>
                <View style={styles.bottomBar}>
                    <TouchableOpacity
                        onPress={actions.handleSave}
                        disabled={state.isSaving}
                        style={[styles.saveButton, { backgroundColor: categoryColor, opacity: state.isSaving ? 0.6 : 1 }]}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.saveText}>{state.isEditing ? 'Actualizar' : 'Guardar valoración'}</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
            <Toast
                message={state.toastConfig.message}
                type={state.toastConfig.type}
                visible={state.toastConfig.visible}
                onDismiss={() => actions.setToastConfig((prev) => ({ ...prev, visible: false }))}
            />
        </>
    );
}

function LoadingSkeleton() {
    return (
        <View style={[styles.flex, { backgroundColor: COLORS.background, padding: SPACING.xl }]}>
            <View style={{ flexDirection: 'row', gap: SPACING.base, marginBottom: SPACING['2xl'] }}>
                <Skeleton width={60} height={90} borderRadius={RADIUS.sm} />
                <View style={{ flex: 1, gap: SPACING.sm }}>
                    <Skeleton width="80%" height={22} />
                    <Skeleton width="40%" height={16} />
                    <Skeleton width={70} height={20} borderRadius={RADIUS.full} />
                </View>
            </View>
            <Skeleton width="100%" height={12} borderRadius={RADIUS.full} style={{ marginBottom: SPACING['2xl'] }} />
            <Skeleton width="100%" height={120} borderRadius={RADIUS.md} />
        </View>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: COLORS.background },
    scroll: { padding: SPACING.xl, paddingBottom: 140 },
    section: { marginTop: SPACING['2xl'] },
    sectionLabel: { color: COLORS.textSecondary, fontSize: FONT_SIZE.bodyMedium, fontWeight: '500', marginBottom: SPACING.md },
    textInput: {
        backgroundColor: COLORS.surfaceElevated,
        color: COLORS.textPrimary,
        borderRadius: RADIUS.md,
        padding: SPACING.base,
        fontSize: FONT_SIZE.bodyLarge,
        minHeight: 120,
        textAlignVertical: 'top',
    },
    charCount: { color: COLORS.textTertiary, fontSize: FONT_SIZE.bodySmall, textAlign: 'right', marginTop: SPACING.xs },
    spoilerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.base,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.base,
        backgroundColor: COLORS.surfaceElevated,
        borderRadius: RADIUS.md,
    },
    spoilerText: { color: COLORS.textPrimary, fontSize: FONT_SIZE.bodyLarge, marginLeft: SPACING.md },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: SPACING.xl,
        paddingBottom: 40,
        backgroundColor: COLORS.background,
    },
    saveButton: { paddingVertical: SPACING.base, borderRadius: RADIUS.full, alignItems: 'center' },
    saveText: { color: COLORS.background, fontSize: FONT_SIZE.headlineSmall, fontWeight: '700' },
    trackAverageLabel: { fontSize: FONT_SIZE.bodyMedium, fontFamily: 'SpaceGrotesk_600SemiBold', textAlign: 'center', paddingVertical: SPACING.sm },
});
