import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Sharing from 'expo-sharing';
import { downloadHolerite } from '../../src/services/holeriteService';
import { TIPO_LABELS, TIPO_COLORS, HoleriteTipo } from '../../src/types/holerite';

export default function HoleriteDetailScreen() {
  const { id, competencia, tipo, file_name } = useLocalSearchParams<{
    id: string;
    competencia: string;
    tipo: string;
    file_name: string;
  }>();

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tipoLabel = TIPO_LABELS[tipo as HoleriteTipo] || tipo;
  const tipoColor = TIPO_COLORS[tipo as HoleriteTipo] || '#888';

  async function handleView() {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      const url = await downloadHolerite(Number(id));
      if (!url) {
        setError('PDF não disponível');
        return;
      }
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(url);
      } else {
        await WebBrowser.openBrowserAsync(url);
      }
    } catch {
      setError('Erro ao abrir o holerite.');
    } finally {
      setLoading(false);
    }
  }

  async function handleShare() {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      const url = await downloadHolerite(Number(id));
      if (!url) {
        setError('PDF não disponível');
        return;
      }
      await Sharing.shareAsync(url);
    } catch {
      setError('Erro ao compartilhar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={[styles.iconLarge, { backgroundColor: `${tipoColor}15` }]}>
          <Text style={[styles.iconEmoji, { color: tipoColor }]}>
            {tipo === 'SALARIO' ? '💰' : tipo === 'ADIANTAMENTO' ? '🔄' : tipo === 'FERIAS' ? '🏖' : tipo === 'RENDIMENTOS' ? '📋' : '📄'}
          </Text>
        </View>

        <Text style={styles.title}>{tipoLabel}</Text>
        <Text style={styles.competencia}>{competencia}</Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: tipoColor }]}
            onPress={handleView}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Visualizar PDF</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleShare}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Compartilhar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 8 },
  backButton: { paddingVertical: 8 },
  backText: { fontSize: 16, color: '#00C19C', fontWeight: '500' },
  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24, paddingBottom: 80,
  },
  iconLarge: {
    width: 80, height: 80, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  iconEmoji: { fontSize: 36 },
  title: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  competencia: { fontSize: 16, color: '#888', marginBottom: 24 },
  error: { fontSize: 14, color: '#FF5050', marginBottom: 16, textAlign: 'center' },
  actions: { width: '100%', gap: 12 },
  primaryButton: {
    width: '100%', height: 52, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  primaryButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  secondaryButton: {
    width: '100%', height: 52, backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  secondaryButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});
