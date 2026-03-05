// MVP_FEED_DISABLED — pendiente diseño system Feed
// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import { getCategoryColor } from '@/lib/utils/constants';
// import { FONT } from '@/lib/utils/typography';
// import { CardAmbientGlow, CardFooter } from '@/components/sharing/partials';
// import { CardFeedContentRow } from '@/components/sharing/partials/CardFeedContentRow';
// import type { ShareableRatingCardProps } from '@/components/sharing/ShareableRatingCard';

// // Card dimensions: 360×450

// const EMOJI: Record<string, string> = {
//     movie: '🎬', series: '📺', book: '📚', game: '🎮', music: '🎵', podcast: '🎙️', anything: '⭐',
// };
// const LABEL: Record<string, string> = {
//     movie: 'PELÍCULA', series: 'SERIE', book: 'LIBRO', game: 'JUEGO', music: 'MÚSICA', podcast: 'PODCAST', anything: 'ARTÍCULO',
// };

// function formatScore(score: number): string {
//     if (score === 10) return '10';
//     return Number.isInteger(score) ? score.toFixed(1) : score.toString();
// }

// export function ShareableRatingCardFeed({
//     contentType,
//     title,
//     posterUrl,
//     score,
//     headline,
//     reviewText,
//     username,
//     year,
//     creator,
//     platform,
//     favoriteTrack,
// }: ShareableRatingCardProps): React.ReactElement {
//     const color = getCategoryColor(contentType);
//     const emoji = EMOJI[contentType] ?? '⭐';
//     const label = LABEL[contentType] ?? contentType.toUpperCase();

//     // `creator` field for all types (director/author/artist/developer)
//     const displayCreator = creator ?? null;

//     const rawQuote = headline?.trim() || (reviewText && reviewText.length > 5 ? reviewText : null);
//     const displayQuote = rawQuote
//         ? rawQuote.length > 150 ? rawQuote.slice(0, 150) + '…' : rawQuote
//         : null;

//     return (
//         <View style={s.card}>
//             {/* Ambient glow — positioned behind everything */}
//             <CardAmbientGlow accentColor={color} cardWidth={360} height={450} />

//             {/* TOP ROW: category badge (left) + score (right) */}
//             <View style={s.topRow}>
//                 <View style={[s.pill, { backgroundColor: color + '33' }]}>
//                     <Text style={[s.pillText, { color }]}>{emoji} {label}</Text>
//                 </View>
//                 <Text style={[s.scoreText, { color }]}>{formatScore(score)}</Text>
//             </View>

//             {/* CONTENT ROW — poster + info column */}
//             <CardFeedContentRow
//                 title={title}
//                 posterUrl={posterUrl}
//                 creator={displayCreator}
//                 year={year}
//                 platform={platform}
//                 favoriteTrack={favoriteTrack}
//                 contentType={contentType}
//                 accentColor={color}
//             />

//             {/* SEPARATOR + QUOTE — only rendered when a quote exists */}
//             {!!displayQuote && (
//                 <>
//                     <View style={s.separator} />
//                     <Text style={s.quote} numberOfLines={4}>{displayQuote}</Text>
//                 </>
//             )}

//             {/* FOOTER */}
//             <View style={s.footerWrapper}>
//                 <CardFooter username={username} accentColor={color} />
//             </View>
//         </View>
//     );
// }

// const s = StyleSheet.create({
//     card: {
//         width: 360,
//         height: 450,
//         borderRadius: 16,
//         backgroundColor: '#121212',
//         padding: 20,
//         overflow: 'hidden',
//     },
//     topRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         zIndex: 1,
//     },
//     pill: {
//         borderRadius: 20,
//         paddingHorizontal: 12,
//         paddingVertical: 4,
//     },
//     pillText: {
//         fontSize: 12,
//         fontFamily: FONT.bold,
//     },
//     scoreText: {
//         fontSize: 52,
//         fontFamily: FONT.bold,
//         lineHeight: 56,
//     },
//     separator: {
//         height: 1,
//         backgroundColor: '#2A2A2A',
//         marginVertical: 12,
//         zIndex: 1,
//     },
//     quote: {
//         fontSize: 13,
//         fontFamily: FONT.regular,
//         fontStyle: 'italic',
//         color: '#A0A0A0',
//         zIndex: 1,
//     },
//     footerWrapper: {
//         position: 'absolute',
//         bottom: 20,
//         left: 20,
//         right: 20,
//         zIndex: 1,
//     },
// });
