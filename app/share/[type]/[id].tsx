import React, { useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ContentType, Music } from '@/lib/types/content';
import { COLORS, SPACING, RADIUS, getCategoryColor } from '@/lib/utils/constants';
import { TYPO, FONT } from '@/lib/utils/typography';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';
import { RatingSliderInteractive } from '@/components/rating/RatingSliderInteractive';
import {
    PlatformSelector,
    TrackSelector,
    BookFormatSelector,
    AutoInfoSection,
} from '@/components/sharing';
import { StoryPreviewMini, StoryCanvas } from '@/components/sharing/stories';
import { useShareForm } from '@/lib/hooks/useShareForm';
import { useGenerateAndShare } from '@/lib/hooks/useGenerateAndShare';

// ── Sub-components ────────────────────────────────────────

function LoadingSkeleton(): React.ReactElement {
    return (
        <View style={[styles.flex, { padding: SPACING.xl }]}>
            <Skeleton width="100%" height={288} borderRadius={12} style={{ marginBottom: SPACING['2xl'] }} />
            <Skeleton width="100%" height={16} borderRadius={RADIUS.full} style={{ marginBottom: SPACING.base }} />
            <Skeleton width="100%" height={80} borderRadius={RADIUS.md} />
        </View>
    );
}

function SectionLabel({ children }: { children: string }): React.ReactElement {
    return <Text style={styles.sectionLabel}>{children}</Text>;
}

function ToggleRow({
    label,
    value,
    onChange,
}: {
    label: string;
    value: boolean;
    onChange: () => void;
}): React.ReactElement {
    return (
        <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{label}</Text>
            <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ false: '#333', true: COLORS.textPrimary }}
                thumbColor={value ? '#FFF' : '#AAA'}
            />
        </View>
    );
}

// ── Main screen ───────────────────────────────────────────

export default function ShareScreen(): React.ReactElement {
    const { type, id, fromRating } = useLocalSearchParams<{
        type: string;
        id: string;
        fromRating?: string;
    }>();
    const router = useRouter();
    const contentType = type as ContentType;

    const {
        content,
        isLoading,
        isError,
        formState,
        existingRating,
        availablePlatforms,
        availableTracks,
        storyCardProps,
        previewScore,
        pendingScore,
        showReview,
        showPlatform,
        showFavoriteTrack,
        actions,
    } = useShareForm({
        contentType,
        contentId: id,
        fromRating: fromRating === 'true',
    });

    const captureRef = useRef<View | null>(null);

    const { handleGenerate, isGenerating } = useGenerateAndShare({
        contentType,
        contentId: id,
        existingRatingId: existingRating?.id ?? null,
        formState,
        fromRating: fromRating === 'true',
        shareRef: captureRef,
    });

    const accentColor = getCategoryColor(contentType);
    const isAlbum = contentType === 'music' && !!(content as Music | undefined)?.isAlbum;

    if (isLoading) return <LoadingSkeleton />;
    if (isError) return <ErrorState onRetry={() => { }} />;

    return (
        <SafeAreaView style={styles.flex} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} hitSlop={8}>
                    <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Compartir</Text>
                <View style={styles.headerBtn} />
            </View>
            <View style={styles.headerDivider} />

            <ScrollView
                style={styles.flex}
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* 1. Preview Area (~55% visual importance) */}
                <View style={styles.previewContainer}>
                    {storyCardProps ? (
                        <StoryPreviewMini {...storyCardProps} />
                    ) : (
                        <Text style={styles.unsupportedText}>
                            Vista previa no disponible para este tipo
                        </Text>
                    )}
                </View>

                {/* 2. Controls Zone */}
                <View style={styles.controlsContainer}>
                    {/* Rating Slider */}
                    {storyCardProps && (
                        <View style={styles.section}>
                            <SectionLabel>Tu valoración</SectionLabel>
                            <RatingSliderInteractive
                                value={previewScore}
                                onValueChange={actions.handleScoreChange}
                                category={contentType}
                            />
                            {pendingScore !== null && (
                                <TouchableOpacity
                                    onPress={actions.confirmScoreSave}
                                    style={[
                                        styles.saveScoreCta,
                                        { backgroundColor: accentColor + '33' },
                                    ]}
                                >
                                    <Text style={[styles.saveScoreText, { color: accentColor }]}>
                                        {'Guardar ' + pendingScore.toFixed(1) + ' como nueva nota ✓'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* Headline / Review text only if it exists or is being edited */}
                    {(existingRating?.review_text || formState.headline) && (
                        <View style={styles.section}>
                            <SectionLabel>Tu reseña (máx. 50 caracteres)</SectionLabel>
                            <TextInput
                                style={styles.textInput}
                                multiline
                                maxLength={50}
                                placeholder="Resúmelo en pocas palabras..."
                                placeholderTextColor={COLORS.textTertiary}
                                value={formState.headline}
                                onChangeText={actions.setHeadline}
                            />
                            <Text style={styles.charCount}>{formState.headline.length}/50</Text>
                        </View>
                    )}

                    {/* Dónde (Categoría específica) */}
                    {(contentType === 'movie' || contentType === 'series' || contentType === 'game') && (
                        <View style={styles.section}>
                            <SectionLabel>
                                {contentType === 'game' ? '¿En qué plataforma jugaste?' : '¿Dónde lo viste?'}
                            </SectionLabel>
                            <PlatformSelector
                                platforms={availablePlatforms}
                                selected={formState.selectedPlatform}
                                onSelect={actions.setSelectedPlatform}
                                accentColor={accentColor}
                            />
                        </View>
                    )}

                    {isAlbum && (
                        <View style={styles.section}>
                            <SectionLabel>Canción favorita</SectionLabel>
                            <TrackSelector
                                tracks={availableTracks}
                                selected={formState.favoriteTrack}
                                onSelect={actions.setFavoriteTrack}
                                accentColor={accentColor}
                            />
                        </View>
                    )}

                    {contentType === 'book' && (
                        <View style={styles.section}>
                            <SectionLabel>Formato de lectura</SectionLabel>
                            <BookFormatSelector
                                selected={formState.bookFormat}
                                onSelect={actions.setBookFormat}
                            />
                        </View>
                    )}

                    {/* Opciones de la tarjeta (Toggles) */}
                    <View style={styles.section}>
                        <SectionLabel>Opciones de la tarjeta</SectionLabel>
                        <View style={styles.optionsCard}>
                            {(storyCardProps?.reviewText) && (
                                <ToggleRow
                                    label="Mostrar reseña"
                                    value={showReview}
                                    onChange={actions.toggleReview}
                                />
                            )}
                            {formState.selectedPlatform && (
                                <ToggleRow
                                    label="Mostrar plataforma"
                                    value={showPlatform}
                                    onChange={actions.togglePlatform}
                                />
                            )}
                            {(contentType === 'music' && formState.favoriteTrack) && (
                                <ToggleRow
                                    label="Mostrar canción favorita"
                                    value={showFavoriteTrack}
                                    onChange={actions.toggleFavoriteTrack}
                                />
                            )}
                            {!(storyCardProps?.reviewText) && !formState.selectedPlatform && !formState.favoriteTrack && (
                                <Text style={styles.noOptionsText}>Sin opciones adicionales disponibles</Text>
                            )}
                        </View>
                    </View>

                    {/* Auto Info Section */}
                    <View style={styles.section}>
                        <AutoInfoSection
                            trackAverage={null}
                            episodeAverage={null}
                            score={previewScore}
                            contentType={contentType}
                            accentColor={accentColor}
                        />
                    </View>

                    <View style={{ height: 120 }} />
                </View>
            </ScrollView>

            {/* Bottom Bar */}
            <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
                <Button
                    label={isGenerating ? 'Capturando...' : 'Compartir'}
                    onPress={handleGenerate}
                    variant="primary"
                    className="w-full"
                    disabled={isGenerating || !storyCardProps}
                    isLoading={isGenerating}
                />
            </SafeAreaView>

            {/* Off-screen capture portal */}
            <View style={styles.offScreen} pointerEvents="none">
                {storyCardProps && (
                    <View ref={captureRef} collapsable={false}>
                        <StoryCanvas {...storyCardProps} />
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.md,
    },
    headerBtn: { width: 40, alignItems: 'center' },
    headerTitle: {
        color: COLORS.textPrimary,
        fontSize: 17,
        fontFamily: FONT.bold,
        textAlign: 'center',
    },
    headerDivider: { height: 1, backgroundColor: COLORS.divider },
    scroll: { flexGrow: 1 },
    previewContainer: {
        alignItems: 'center',
        paddingVertical: SPACING['2xl'],
        backgroundColor: '#000', // Sub-light background for preview focus
    },
    controlsContainer: {
        paddingHorizontal: SPACING.xl,
    },
    section: { marginTop: SPACING['2xl'] },
    sectionLabel: {
        color: COLORS.textSecondary,
        ...TYPO.bodySmall,
        fontFamily: FONT.medium,
        marginBottom: SPACING.md,
    },
    textInput: {
        backgroundColor: COLORS.surfaceElevated,
        color: COLORS.textPrimary,
        borderRadius: RADIUS.md,
        padding: SPACING.base,
        ...TYPO.body,
        minHeight: 60,
        textAlignVertical: 'top',
    },
    charCount: {
        color: COLORS.textTertiary,
        ...TYPO.caption,
        textAlign: 'right',
        marginTop: SPACING.xs,
    },
    optionsCard: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        gap: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.divider,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    toggleLabel: {
        color: COLORS.textPrimary,
        ...TYPO.body,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: SPACING.xl,
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.xl,
        backgroundColor: COLORS.background,
        borderTopWidth: 1,
        borderTopColor: COLORS.divider,
    },
    offScreen: {
        position: 'absolute',
        top: -3000,
        left: -3000,
        opacity: 0,
    },
    unsupportedText: {
        color: COLORS.textTertiary,
        ...TYPO.body,
        textAlign: 'center',
        paddingVertical: 100,
    },
    noOptionsText: {
        color: COLORS.textTertiary,
        ...TYPO.caption,
        textAlign: 'center',
        paddingVertical: 10,
    },
    saveScoreCta: {
        borderRadius: RADIUS.full,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginTop: SPACING.md,
        alignSelf: 'center',
    },
    saveScoreText: {
        fontSize: 14,
        fontFamily: FONT.semibold,
    },
});
