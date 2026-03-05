// TEMP: Testing screen — eliminar antes de merge a main
import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { StoryPreviewMini, StoryCardProps } from '@/components/sharing/stories';

const v1: StoryCardProps = {
    contentType: 'movie',
    title: "Oppenheimer",
    score: 9.0,
    year: "2023",
    posterUrl: null,
    platform: "Prime Video",
    reviewText: "Una obra maestra del cine contemporáneo que redefine el género biográfico con una tensión insoportable.",
    username: "NolanFan",
    showReview: true,
    showPlatform: true,
    showFavoriteTrack: false,
};

const v2: StoryCardProps = { ...v1, showReview: false };

const v3: StoryCardProps = {
    contentType: 'series',
    title: "The Bear",
    score: 8.5,
    year: "2022",
    posterUrl: null,
    platform: "Disney+",
    reviewText: "Yes, Chef! Una de las series más intensas y mejor dirigidas de la década.",
    username: "Carmy",
    showReview: true,
    showPlatform: true,
    showFavoriteTrack: false,
};

const v4: StoryCardProps = { ...v3, showReview: false };

const v5: StoryCardProps = {
    contentType: 'book',
    title: "El problema de los tres cuerpos",
    score: 9.2,
    year: "2008",
    posterUrl: null,
    bookFormat: "Físico",
    reviewText: "Ciencia ficción dura en su máxima expresión. Conceptos que te vuelan la cabeza.",
    username: "Reader",
    showReview: true,
    showPlatform: true, // Reuse platform toggle for format in some places or custom logic
    showFavoriteTrack: false,
};

const v6: StoryCardProps = { ...v5, showReview: false };

const v7: StoryCardProps = {
    contentType: 'game',
    title: "Elden Ring",
    score: 10.0,
    year: "2022",
    posterUrl: null,
    platform: "PlayStation 5",
    reviewText: "La culminación de la fórmula Souls en un mundo abierto magistral.",
    username: "Tarnished",
    showReview: true,
    showPlatform: true,
    showFavoriteTrack: false,
};

const v8: StoryCardProps = { ...v7, showReview: false };

const v9: StoryCardProps = {
    contentType: 'music',
    title: "DAMN.",
    score: 9.8,
    year: "2017",
    posterUrl: null,
    favoriteTrack: "HUMBLE.",
    reviewText: "Pulitzer Kendrick. Un álbum que captura el espíritu de una era con precisión quirúrgica.",
    username: "KDot",
    showReview: true,
    showPlatform: false,
    showFavoriteTrack: true,
};

const variants = [
    { label: "Variante 1: movie, con reseña, con plataforma", props: v1 },
    { label: "Variante 2: movie, sin reseña", props: v2 },
    { label: "Variante 3: series, con reseña, con plataforma", props: v3 },
    { label: "Variante 4: series, sin reseña", props: v4 },
    { label: "Variante 5: book, con reseña, con formato", props: v5 },
    { label: "Variante 6: book, sin reseña", props: v6 },
    { label: "Variante 7: game, con reseña, con plataforma", props: v7 },
    { label: "Variante 8: game, sin reseña", props: v8 },
    { label: "Variante 9: music, con reseña, con canción favorita", props: v9 },
];

export default function StoriesTestScreen() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.header}>Story System Test (9 Variants)</Text>
            {variants.map((v, i) => (
                <View key={i} style={styles.variantBlock}>
                    <Text style={styles.label}>{v.label}</Text>
                    <StoryPreviewMini {...v.props} />
                </View>
            ))}
            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    content: {
        alignItems: 'center',
        paddingVertical: 40,
        gap: 40,
    },
    header: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    variantBlock: {
        alignItems: 'center',
        gap: 12,
    },
    label: {
        color: '#FFF',
        fontSize: 12,
        opacity: 0.8,
    },
});
