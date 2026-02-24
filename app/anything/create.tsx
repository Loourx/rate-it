import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/lib/utils/constants';
import { useCreateAnythingItem } from '@/lib/hooks/useCreateAnythingItem';

const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 500;

export default function CreateAnythingScreen() {
    const router = useRouter();
    const { mutate: createItem, isPending } = useCreateAnythingItem();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryTag, setCategoryTag] = useState('');

    const isValid = title.trim().length >= 2;

    const handleCreate = () => {
        if (!isValid || isPending) return;

        createItem(
            {
                title: title.trim(),
                description: description.trim() || undefined,
                categoryTag: categoryTag.trim() || undefined,
            },
            {
                onSuccess: (data) => {
                    // Navigate to rate the newly created item
                    router.replace(`/rate/anything/${data.id}`);
                },
                onError: (error) => {
                    Alert.alert('Error', error.message || 'No se pudo crear el item');
                },
            }
        );
    };

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Crear Anything',
                    headerStyle: { backgroundColor: COLORS.background },
                    headerTintColor: COLORS.textPrimary,
                }}
            />
            <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    <ScrollView className="flex-1 px-6 pt-6" keyboardShouldPersistTaps="handled">
                        {/* Hero Section */}
                        <View className="items-center mb-8">
                            <View
                                className="w-20 h-20 rounded-full items-center justify-center mb-4"
                                style={{ backgroundColor: COLORS.categoryAnything + '33' }}
                            >
                                <Ionicons name="sparkles" size={40} color={COLORS.categoryAnything} />
                            </View>
                            <Text className="text-primary text-xl font-bold text-center">
                                ¿No encuentras lo que buscas?
                            </Text>
                            <Text className="text-secondary text-center mt-2">
                                Crea tu propio item para valorar cualquier cosa
                            </Text>
                        </View>

                        {/* Form */}
                        <View className="gap-4">
                            {/* Title */}
                            <View>
                                <Text className="text-secondary text-sm mb-2">Título *</Text>
                                <TextInput
                                    className="bg-surface text-primary px-4 py-3 rounded-xl border border-divider"
                                    placeholderTextColor={COLORS.textTertiary}
                                    placeholder="Ej: Mi café favorito, El parque del barrio..."
                                    value={title}
                                    onChangeText={(text) => setTitle(text.slice(0, MAX_TITLE_LENGTH))}
                                    maxLength={MAX_TITLE_LENGTH}
                                    autoFocus
                                />
                                <Text className="text-tertiary text-xs text-right mt-1">
                                    {title.length}/{MAX_TITLE_LENGTH}
                                </Text>
                            </View>

                            {/* Category Tag */}
                            <View>
                                <Text className="text-secondary text-sm mb-2">Categoría (opcional)</Text>
                                <TextInput
                                    className="bg-surface text-primary px-4 py-3 rounded-xl border border-divider"
                                    placeholderTextColor={COLORS.textTertiary}
                                    placeholder="Ej: Comida, Lugar, Experiencia..."
                                    value={categoryTag}
                                    onChangeText={setCategoryTag}
                                />
                            </View>

                            {/* Description */}
                            <View>
                                <Text className="text-secondary text-sm mb-2">Descripción (opcional)</Text>
                                <TextInput
                                    className="bg-surface text-primary px-4 py-3 rounded-xl border border-divider min-h-[100px]"
                                    placeholderTextColor={COLORS.textTertiary}
                                    placeholder="Añade contexto o detalles sobre este item..."
                                    value={description}
                                    onChangeText={(text) => setDescription(text.slice(0, MAX_DESCRIPTION_LENGTH))}
                                    maxLength={MAX_DESCRIPTION_LENGTH}
                                    multiline
                                    textAlignVertical="top"
                                />
                                <Text className="text-tertiary text-xs text-right mt-1">
                                    {description.length}/{MAX_DESCRIPTION_LENGTH}
                                </Text>
                            </View>
                        </View>

                        {/* Info Box */}
                        <View className="mt-6 bg-surface p-4 rounded-xl border border-divider">
                            <View className="flex-row items-center gap-2 mb-2">
                                <Ionicons name="information-circle" size={20} color={COLORS.link} />
                                <Text className="text-link font-semibold">Sobre Anything</Text>
                            </View>
                            <Text className="text-secondary text-sm leading-5">
                                Los items de Anything son creados por la comunidad. Si creas algo inapropiado,
                                otros usuarios pueden reportarlo.
                            </Text>
                        </View>
                    </ScrollView>

                    {/* Submit Button */}
                    <View className="px-6 py-4 border-t border-divider">
                        <TouchableOpacity
                            onPress={handleCreate}
                            disabled={!isValid || isPending}
                            className="py-4 rounded-xl items-center"
                            style={{
                                backgroundColor: isValid ? COLORS.categoryAnything : COLORS.surfaceElevated,
                                opacity: isPending ? 0.7 : 1,
                            }}
                        >
                            {isPending ? (
                                <Text className="text-primary font-bold text-base">Creando...</Text>
                            ) : (
                                <View className="flex-row items-center gap-2">
                                    <Ionicons name="add-circle" size={20} color={COLORS.textPrimary} />
                                    <Text className="text-primary font-bold text-base">Crear y valorar</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </>
    );
}
