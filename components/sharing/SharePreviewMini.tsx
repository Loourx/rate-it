// MVP_FEED_DISABLED — pendiente diseño system Feed
// import React from 'react';
// import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
// import { ShareableRatingCard, ShareableRatingCardProps, CARD_DIMENSIONS } from '@/components/sharing/ShareableRatingCard';
// import { ShareableRatingCardFeed } from '@/components/sharing/ShareableRatingCardFeed';
// import { COLORS } from '@/lib/utils/constants';

// const SCALE = 0.45;

// interface SharePreviewMiniProps {
//     cardProps: ShareableRatingCardProps;
//     format: 'stories' | 'feed';
//     style?: StyleProp<ViewStyle>;
// }

// export function SharePreviewMini({
//     cardProps,
//     format,
//     style,
// }: SharePreviewMiniProps): React.ReactElement {
//     const { width: cardW, height: cardH } = CARD_DIMENSIONS[format];
//     const previewW = Math.round(cardW * SCALE);
//     const previewH = Math.round(cardH * SCALE);

//     return (
//         <View style={[styles.outer, { width: previewW, height: previewH }, style]}>
//             <View
//                 style={[
//                     styles.clipper,
//                     { width: previewW, height: previewH }
//                 ]}
//                 pointerEvents="none"
//             >
//                 <View
//                     style={{
//                         width: cardW,
//                         height: cardH,
//                         transform: [{ scale: SCALE }],
//                         transformOrigin: 'top left',
//                     } as ViewStyle}
//                 >
//                     {format === 'feed'
//                         ? <ShareableRatingCardFeed {...cardProps} />
//                         : <ShareableRatingCard {...cardProps} format={format} />
//                     }
//                 </View>
//             </View>
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     outer: {
//         // Shadow wrapper — must not clip itself
//         shadowColor: '#000',
//         shadowOpacity: 0.3,
//         shadowRadius: 8,
//         shadowOffset: { width: 0, height: 4 },
//         elevation: 4,
//         borderRadius: 16, // F11-FIX-S3
//         alignSelf: 'flex-start',
//     },
//     clipper: {
//         overflow: 'hidden',
//         borderRadius: 16, // F11-FIX-S3
//         borderWidth: 1,
//         borderColor: COLORS.divider,
//     },
// });
