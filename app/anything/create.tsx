import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, ScrollView, Image, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '@/lib/utils/constants';
import { useCreateAnythingItem } from '@/lib/hooks/useCreateAnythingItem';
import { Toast } from '@/components/ui/Toast';

const MAX_TITLE = 200;
const MAX_TAG = 50;
const MAX_DESC = 500;

export default function CreateAnythingScreen() {
    const router = useRouter();
    const { mutate: createItem, isPending } = useCreateAnythingItem();

    const [title, setTitle] = useState('');
    const [categoryTag, setCategoryTag] = useState('');
    const [description, setDescription] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [toastMsg, setToastMsg] = useState<string | null>(null);
    const [toastError, setToastError] = useState(false);

    const isValid = title.trim().length >= 2;

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });
        if (!result.canceled && result.assets[0]) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleCreate = () => {
        if (!isValid || isPending) return;
        createItem(
            {
                title: title.trim(),
                description: description.trim() || undefined,
                categoryTag: categoryTag.trim() || undefined,
                imageUri: imageUri ?? undefined,
            },
            {
                onSuccess: (data) => {
                    setToastMsg('¡Item creado!');
                    setToastError(false);
                    setTimeout(() => router.replace(`/content/anything/${data.id}`), 700);
                },
                onError: (error) => {
                    setToastMsg(error.message || 'No se pudo crear el item');
                    setToastError(true);
                },
            },
        );
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Crear item',
                    headerStyle: { backgroundColor: COLORS.background },
                    headerTintColor: COLORS.textPrimary,
                }}
            />
            <SafeAreaView style={s.safe} edges={['bottom']}>
                <KeyboardAvoidingView
                    style={s.flex}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">

                        {/* Image Picker */}
                        <TouchableOpacity onPress={pickImage} activeOpacity={0.8} style={s.imageTouchable}>
                            {imageUri ? (
                                <>
                                    <Image source={{ uri: imageUri }} style={s.imagePreview} />
                                    <View style={s.imageOverlay}>
                                        <Ionicons name="camera" size={22} color={COLORS.textPrimary} />
                                        <Text style={s.imageOverlayText}>Cambiar</Text>
                                    </View>
                                </>
                            ) : (
                                <View style={s.imagePlaceholder}>
                                    <Ionicons name="camera-outline" size={36} color={COLORS.categoryAnything} />
                                    <Text style={s.imagePlaceholderText}>Añadir foto</Text>
                                    <Text style={s.imagePlaceholderHint}>Opcional</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        {imageUri && (
                            <TouchableOpacity onPress={() => setImageUri(null)} style={s.removeBtn}>
                                <Ionicons name="close-circle" size={20} color={COLORS.textTertiary} />
                                <Text style={s.removeText}>Eliminar foto</Text>
                            </TouchableOpacity>
                        )}

                        {/* Form */}
                        <View style={s.form}>
                            {/* Title */}
                            <Text style={s.label}>Título *</Text>
                            <TextInput
                                style={s.input}
                                placeholderTextColor={COLORS.textTertiary}
                                placeholder="Ej: Espátula IKEA GNARP"
                                value={title}
                                onChangeText={(t) => setTitle(t.slice(0, MAX_TITLE))}
                                maxLength={MAX_TITLE}
                                autoFocus
                            />
                            <Text style={s.counter}>{title.length}/{MAX_TITLE}</Text>

                            {/* Category Tag */}
                            <Text style={s.label}>Subcategoría</Text>
                            <TextInput
                                style={s.input}
                                placeholderTextColor={COLORS.textTertiary}
                                placeholder="Ej: Cocina, Restaurante, Gadget..."
                                value={categoryTag}
                                onChangeText={(t) => setCategoryTag(t.slice(0, MAX_TAG))}
                                maxLength={MAX_TAG}
                            />

                            {/* Description */}
                            <Text style={[s.label, { marginTop: SPACING.base }]}>Descripción</Text>
                            <TextInput
                                style={[s.input, s.multilineInput]}
                                placeholderTextColor={COLORS.textTertiary}
                                placeholder="Describe brevemente este item..."
                                value={description}
                                onChangeText={(t) => setDescription(t.slice(0, MAX_DESC))}
                                maxLength={MAX_DESC}
                                multiline
                                textAlignVertical="top"
                                numberOfLines={3}
                            />
                            <Text style={s.counter}>{description.length}/{MAX_DESC}</Text>
                        </View>
                    </ScrollView>

                    {/* Submit */}
                    <View style={s.bottomBar}>
                        <TouchableOpacity
                            onPress={handleCreate}
                            disabled={!isValid || isPending}
                            style={[s.submitBtn, { backgroundColor: isValid ? COLORS.categoryAnything : COLORS.surfaceElevated, opacity: isPending ? 0.7 : 1 }]}
                            activeOpacity={0.85}
                        >
                            {isPending ? (
                                <Text style={s.submitText}>Creando...</Text>
                            ) : (
                                <View style={s.submitRow}>
                                    <Ionicons name="sparkles" size={18} color={COLORS.textPrimary} />
                                    <Text style={s.submitText}>Crear y publicar</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>

                <Toast
                    message={toastMsg ?? ''}
                    visible={!!toastMsg}
                    onDismiss={() => setToastMsg(null)}
                />
            </SafeAreaView>
        </>
    );
}

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.background },
    flex: { flex: 1 },
    scroll: { flex: 1 },
    scrollContent: { padding: SPACING.xl, paddingBottom: 20 },
    imageTouchable: {
        width: 200, height: 200, borderRadius: RADIUS.lg,
        alignSelf: 'center', marginBottom: SPACING.sm,
        overflow: 'hidden', backgroundColor: COLORS.surfaceElevated,
    },
    imagePreview: { width: '100%', height: '100%' },
    imageOverlay: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', paddingVertical: 8,
        alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6,
    },
    imageOverlayText: { color: COLORS.textPrimary, fontSize: FONT_SIZE.bodySmall, fontWeight: '600' },
    imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
    imagePlaceholderText: { color: COLORS.categoryAnything, fontSize: FONT_SIZE.bodyMedium, fontWeight: '600' },
    imagePlaceholderHint: { color: COLORS.textTertiary, fontSize: FONT_SIZE.bodySmall },
    removeBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 4, marginBottom: SPACING.lg,
    },
    removeText: { color: COLORS.textTertiary, fontSize: FONT_SIZE.bodySmall },
    form: { gap: SPACING.sm },
    label: { color: COLORS.textSecondary, fontSize: FONT_SIZE.bodySmall, fontWeight: '500', marginTop: SPACING.sm },
    input: {
        backgroundColor: COLORS.surfaceElevated, color: COLORS.textPrimary,
        borderRadius: RADIUS.md, padding: SPACING.base, fontSize: FONT_SIZE.bodyLarge,
    },
    multilineInput: { minHeight: 80, textAlignVertical: 'top' },
    counter: { color: COLORS.textTertiary, fontSize: FONT_SIZE.bodySmall, textAlign: 'right', marginTop: 2 },
    bottomBar: { padding: SPACING.xl, paddingBottom: 32, borderTopWidth: 1, borderTopColor: COLORS.divider },
    submitBtn: { borderRadius: RADIUS.full, paddingVertical: 16, alignItems: 'center' },
    submitRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    submitText: { color: COLORS.textPrimary, fontSize: FONT_SIZE.bodyLarge, fontWeight: '700' },
});
