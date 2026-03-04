import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    useWindowDimensions,
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
    SharePreviewMini,
    PlatformSelector,
    TrackSelector,
    BookFormatSelector,
    AutoInfoSection,
    ShareableRatingCard,
    ShareableRatingCardFeed,
} from '@/components/sharing';
import { useShareForm } from '@/lib/hooks/useShareForm';
import { useGenerateAndShare } from '@/lib/hooks/useGenerateAndShare';
import { useState, useRef } from 'react';

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

function HeadlineSection({
    value,
    onChange,
}: {
    value: string;
    onChange: (text: string) => void;
}): React.ReactElement {
    return (
        <View style={styles.section}>
            <SectionLabel>Gancho (máx. 50 caracteres)</SectionLabel>
            <View>
                <TextInput
                    style={styles.textInput}
                    multiline
                    maxLength={50}
                    placeholder="Resúmelo en pocas palabras..."
                    placeholderTextColor={COLORS.textTertiary}
                    value={value}
                    onChangeText={onChange}
                />
                <Text style={styles.charCount}>{value.length}/50</Text>
            </View>
        </View>
    );
}

function FormatSelector({
    value,
    onChange,
    accentColor,
}: {
    value: 'stories' | 'feed';
    onChange: (v: 'stories' | 'feed') => void;
    accentColor: string;
}): React.ReactElement {
    const options = [
        { value: 'stories', label: '9:16 Stories', icon: 'phone-portrait-outline' as const },
        { value: 'feed', label: '4:5 Feed', icon: 'image-outline' as const },
    ];

    return (
        <View style={styles.selectorRow}>
            {options.map((opt) => {
                const isSelected = value === opt.value;
                return (
                    <TouchableOpacity
                        key={opt.value}
                        onPress={() => onChange(opt.value as 'stories' | 'feed')}
                        style={[
                            styles.selectorPill,
                            isSelected
                                ? { backgroundColor: accentColor + '22', borderColor: accentColor }
                                : { backgroundColor: COLORS.surface, borderColor: COLORS.divider },
                        ]}
                    >
                        <Ionicons
                            name={opt.icon}
                            size={16}
                            color={isSelected ? accentColor : COLORS.textSecondary}
                        />
                        <Text
                            style={[
                                styles.selectorLabel,
                                {
                                    color: isSelected ? accentColor : COLORS.textSecondary,
                                    fontFamily: isSelected ? FONT.semibold : FONT.regular,
                                },
                            ]}
                        >
                            {opt.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
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
        cardProps,
        cardVariant,
        previewScore,
        pendingScore,
        actions,
    } = useShareForm({
        contentType,
        contentId: id,
        fromRating: fromRating === 'true',
    });

    const [format, setFormat] = useState<'stories' | 'feed'>('stories');
    const storiesRef = useRef<View | null>(null);
    const feedRef = useRef<View | null>(null);

    const activeRef = format === 'stories' ? storiesRef : feedRef;

    const { handleGenerate, isGenerating } = useGenerateAndShare({
        contentType,
        contentId: id,
        existingRatingId: existingRating?.id ?? null,
        formState,
        fromRating: fromRating === 'true',
        format,
        shareRef: activeRef,
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
            <View style={styles.divider} />

            <ScrollView
                style={styles.flex}
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
            >
                {/* Preview mini centered */}
                <View style={styles.previewContainer}>
                    <SharePreviewMini cardProps={cardProps} format={format} />
                </View>

                {/* Score slider */}
                {cardVariant !== 'minimal' ? (
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
                ) : (
                    <View style={styles.section}>
                        <Text style={styles.minimalHint}>Sin valoración — card minimalista</Text>
                    </View>
                )}

                {/* Headline input */}
                <HeadlineSection value={formState.headline} onChange={actions.setHeadline} />

                {/* Platform selector — movie / series / game */}
                {(contentType === 'movie' || contentType === 'series') && (
                    <View style={styles.section}>
                        <SectionLabel>¿Dónde lo viste?</SectionLabel>
                        <PlatformSelector
                            platforms={availablePlatforms}
                            selected={formState.selectedPlatform}
                            onSelect={actions.setSelectedPlatform}
                            accentColor={accentColor}
                        />
                    </View>
                )}
                {contentType === 'game' && (
                    <View style={styles.section}>
                        <SectionLabel>¿En qué plataforma jugaste?</SectionLabel>
                        <PlatformSelector
                            platforms={availablePlatforms}
                            selected={formState.selectedPlatform}
                            onSelect={actions.setSelectedPlatform}
                            accentColor={accentColor}
                        />
                    </View>
                )}

                {/* Track selector — music albums only */}
                {isAlbum && (
                    <View style={styles.section}>
                        <SectionLabel>Track favorito</SectionLabel>
                        <TrackSelector
                            tracks={availableTracks}
                            selected={formState.favoriteTrack}
                            onSelect={actions.setFavoriteTrack}
                            accentColor={accentColor}
                        />
                    </View>
                )}

                {/* Book format */}
                {contentType === 'book' && (
                    <View style={styles.section}>
                        <SectionLabel>Formato de lectura</SectionLabel>
                        <BookFormatSelector
                            selected={formState.bookFormat}
                            onSelect={actions.setBookFormat}
                        />
                    </View>
                )}

                {/* Auto info (collapsable) */}
                <View style={styles.section}>
                    <AutoInfoSection
                        trackAverage={cardProps.trackAverage ?? null}
                        episodeAverage={cardProps.episodeAverage ?? null}
                        score={cardProps.score}
                        contentType={contentType}
                        accentColor={accentColor}
                    />
                </View>

                <View style={{ paddingBottom: 100 }} />
            </ScrollView>

            {/* Fixed bottom bar */}
            <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
                <View style={{ marginBottom: SPACING.lg }}>
                    <FormatSelector
                        value={format}
                        onChange={setFormat}
                        accentColor={accentColor}
                    />
                </View>

                <Button
                    label={isGenerating ? 'Generando...' : 'Generar y compartir'}
                    onPress={handleGenerate}
                    variant="primary"
                    className="w-full"
                    disabled={isGenerating}
                />
            </SafeAreaView>

            {/* Off-screen portals for capture — F11-PI-j */}
            <View style={styles.offScreen} pointerEvents="none">
                <View ref={storiesRef} collapsable={false}>
                    <ShareableRatingCard {...cardProps} format="stories" />
                </View>
                <View style={{ height: 100 }} />
                <View ref={feedRef} collapsable={false}>
                    <ShareableRatingCardFeed {...cardProps} />
                </View>
            </View>
        </SafeAreaView>
    );
}

// ── Styles ────────────────────────────────────────────────

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
    divider: { height: 1, backgroundColor: COLORS.divider },
    scroll: { padding: SPACING.xl, paddingBottom: 20 },
    previewContainer: {
        alignItems: 'center',
        marginVertical: SPACING['2xl'],
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
        minHeight: 80,
        textAlignVertical: 'top',
    },
    charCount: {
        color: COLORS.textTertiary,
        ...TYPO.caption,
        textAlign: 'right',
        marginTop: SPACING.xs,
    },
    minimalHint: {
        color: COLORS.textTertiary,
        ...TYPO.bodySmall,
        textAlign: 'center',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: SPACING.xl,
        paddingTop: SPACING.base,
        backgroundColor: COLORS.background,
        borderTopWidth: 1,
        borderTopColor: COLORS.divider,
    },
    selectorRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    selectorPill: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: RADIUS.full,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 6,
    },
    selectorLabel: {
        fontSize: 13,
    },
    offScreen: {
        position: 'absolute',
        top: -2000,
        left: -2000,
        opacity: 0,
    },
    saveScoreCta: {
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginTop: 8,
        alignSelf: 'center',
    },
    saveScoreText: {
        fontSize: 14,
        fontFamily: FONT.semibold,
    },
});
