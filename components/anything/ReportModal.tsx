import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/lib/utils/constants';
import { useReportAnything } from '@/lib/hooks/useReportAnything';

interface ReportModalProps {
    visible: boolean;
    onClose: () => void;
    anythingItemId: string;
    itemTitle: string;
}

const REPORT_REASONS = [
    { id: 'spam', label: 'Spam o publicidad' },
    { id: 'inappropriate', label: 'Contenido inapropiado' },
    { id: 'offensive', label: 'Ofensivo o de odio' },
    { id: 'duplicate', label: 'Duplicado' },
    { id: 'other', label: 'Otro motivo' },
];

export function ReportModal({ visible, onClose, anythingItemId, itemTitle }: ReportModalProps) {
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [customReason, setCustomReason] = useState('');
    const { mutate: report, isPending } = useReportAnything();

    const handleSubmit = () => {
        const reason = selectedReason === 'other' 
            ? customReason.trim() 
            : REPORT_REASONS.find(r => r.id === selectedReason)?.label;

        if (!reason) {
            Alert.alert('Error', 'Por favor selecciona un motivo');
            return;
        }

        report(
            { anythingItemId, reason },
            {
                onSuccess: () => {
                    Alert.alert('Gracias', 'Tu reporte ha sido enviado. Lo revisaremos pronto.');
                    onClose();
                    setSelectedReason(null);
                    setCustomReason('');
                },
                onError: (error) => {
                    Alert.alert('Error', error.message || 'No se pudo enviar el reporte');
                },
            }
        );
    };

    const handleClose = () => {
        setSelectedReason(null);
        setCustomReason('');
        onClose();
    };

    const isValid = selectedReason && (selectedReason !== 'other' || customReason.trim().length > 0);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <Pressable
                className="flex-1 bg-black/70 justify-end"
                onPress={handleClose}
            >
                <Pressable
                    className="bg-surface rounded-t-3xl px-6 pt-6 pb-10"
                    onPress={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-6">
                        <View className="flex-row items-center gap-3">
                            <View className="w-10 h-10 rounded-full bg-error/20 items-center justify-center">
                                <Ionicons name="flag" size={20} color={COLORS.error} />
                            </View>
                            <Text className="text-primary text-lg font-bold">Reportar</Text>
                        </View>
                        <TouchableOpacity onPress={handleClose} className="p-2">
                            <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <Text className="text-secondary mb-4" numberOfLines={2}>
                        Reportando: <Text className="text-primary font-semibold">{itemTitle}</Text>
                    </Text>

                    {/* Reasons */}
                    <View className="gap-2 mb-4">
                        {REPORT_REASONS.map((reason) => (
                            <TouchableOpacity
                                key={reason.id}
                                onPress={() => setSelectedReason(reason.id)}
                                className={`flex-row items-center p-4 rounded-xl border ${
                                    selectedReason === reason.id
                                        ? 'border-error bg-error/10'
                                        : 'border-divider bg-surface-elevated'
                                }`}
                            >
                                <View
                                    className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                                        selectedReason === reason.id
                                            ? 'border-error bg-error'
                                            : 'border-tertiary'
                                    }`}
                                >
                                    {selectedReason === reason.id && (
                                        <Ionicons name="checkmark" size={12} color={COLORS.textPrimary} />
                                    )}
                                </View>
                                <Text className="text-primary flex-1">{reason.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Custom reason input */}
                    {selectedReason === 'other' && (
                        <TextInput
                            className="bg-surface-elevated text-primary px-4 py-3 rounded-xl border border-divider mb-4"
                            placeholderTextColor={COLORS.textTertiary}
                            placeholder="Describe el motivo..."
                            value={customReason}
                            onChangeText={setCustomReason}
                            multiline
                            maxLength={200}
                        />
                    )}

                    {/* Submit */}
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={!isValid || isPending}
                        className="py-4 rounded-xl items-center"
                        style={{
                            backgroundColor: isValid ? COLORS.error : COLORS.surfaceElevated,
                            opacity: isPending ? 0.7 : 1,
                        }}
                    >
                        <Text className="text-primary font-bold">
                            {isPending ? 'Enviando...' : 'Enviar reporte'}
                        </Text>
                    </TouchableOpacity>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
