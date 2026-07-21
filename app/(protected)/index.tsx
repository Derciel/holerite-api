import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/lib/AuthContext';
import { fetchHolerites, getUnreadCount } from '../../src/services/holeriteService';
import { HoleriteCard } from '../../src/components/HoleriteCard';
import { Holerite, TIPO_LABELS, TIPO_COLORS, HoleriteTipo } from '../../src/types/holerite';

const TIPOS_FILTRO: { key: string; label: string }[] = [
  { key: 'Todos', label: 'Todos' },
  { key: 'SALARIO', label: 'Salário' },
  { key: 'ADIANTAMENTO', label: 'Adiant.' },
  { key: 'FERIAS', label: 'Férias' },
  { key: 'RENDIMENTOS', label: 'IRPF' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { userId, nome, role, logout } = useAuth();
  const [holerites, setHolerites] = useState<Holerite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [unreadCount, setUnreadCount] = useState(0);

  const loadData = useCallback(async () => {
    if (!userId) return;

    const result = await fetchHolerites(String(userId));
    if (result.error) {
      setError(result.error);
    } else {
      setHolerites(result.data ?? []);
      setError(null);
    }

    const count = await getUnreadCount(String(userId));
    setUnreadCount(count);
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  function handleHoleritePress(holerite: Holerite) {
    router.push({
      pathname: '/(protected)/holerite',
      params: {
        id: String(holerite.id),
        competencia: `${holerite.mes}/${holerite.ano}`,
        tipo: holerite.tipo,
        file_name: `${holerite.tipo}_${holerite.mes}_${holerite.ano}.pdf`,
      },
    });
  }

  const holeritesFiltrados = filtroTipo === 'Todos'
    ? holerites
    : holerites.filter(h => h.tipo === filtroTipo);

  // Agrupar por mês/ano
  const holeritesAgrupados = holeritesFiltrados.reduce((acc, h) => {
    const key = `${h.mes} / ${h.ano}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(h);
    return acc;
  }, {} as Record<string, Holerite[]>);

  const contagens: Record<string, number> = {
    Todos: holerites.length,
    ...TIPOS_FILTRO.slice(1).reduce((acc: Record<string, number>, t) => {
      acc[t.key] = holerites.filter(h => h.tipo === t.key).length;
      return acc;
    }, {}),
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {nome || 'Usuário'}</Text>
          <Text style={styles.subtitle}>Meus Holerites</Text>
        </View>
        <View style={styles.headerTools}>
          <TouchableOpacity
            style={styles.toolBtn}
            onPress={() => router.push('/(protected)/notificacoes')}
          >
            <Text style={styles.toolBtnText}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolBtn}
            onPress={() => router.push('/(protected)/chat')}
          >
            <Text style={styles.toolBtnText}>💬</Text>
          </TouchableOpacity>
          {role === 'ADMIN' && (
            <TouchableOpacity
              style={styles.toolBtn}
              onPress={() => router.push('/(protected)/admin')}
            >
              <Text style={styles.toolBtnText}>⚙</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.toolBtn}
            onPress={() => router.push('/(protected)/perfil')}
          >
            <Text style={styles.toolBtnText}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs de filtro */}
      <View style={styles.tabs}>
        {TIPOS_FILTRO.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, filtroTipo === t.key && styles.tabActive]}
            onPress={() => setFiltroTipo(t.key)}
          >
            <Text style={[styles.tabText, filtroTipo === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
            {contagens[t.key] > 0 && (
              <View style={[styles.badge, filtroTipo === t.key && styles.badgeActive]}>
                <Text style={[styles.badgeText, filtroTipo === t.key && styles.badgeTextActive]}>
                  {contagens[t.key]}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Conteúdo */}
      {loading ? (
        <ActivityIndicator size="large" color="#00C19C" style={styles.loader} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : holeritesFiltrados.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📄</Text>
          <Text style={styles.emptyTitle}>Nenhum documento encontrado</Text>
          <TouchableOpacity onPress={() => setFiltroTipo('Todos')} style={styles.retryButton}>
            <Text style={styles.retryText}>Ver Todos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={Object.entries(holeritesAgrupados)}
          keyExtractor={([mes]) => mes}
          renderItem={({ item: [mes, docs] }) => (
            <View style={styles.monthSection}>
              <Text style={styles.monthDivider}>{mes}</Text>
              {docs.map(doc => (
                <HoleriteCard
                  key={doc.id}
                  holerite={doc}
                  onPress={() => handleHoleritePress(doc)}
                />
              ))}
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#00C19C" />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  headerTools: {
    flexDirection: 'row',
    gap: 10,
  },
  toolBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  toolBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
  },
  tabActive: {
    backgroundColor: '#00C19C',
    borderColor: 'transparent',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
  },
  tabTextActive: {
    color: '#000',
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 50,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeActive: {
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888',
  },
  badgeTextActive: {
    color: '#000',
  },
  loader: {
    marginTop: 60,
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 14,
    color: '#FF5050',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#00C19C',
    borderRadius: 12,
  },
  retryText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#888',
    marginBottom: 20,
  },
  monthSection: {
    paddingHorizontal: 16,
  },
  monthDivider: {
    fontSize: 12,
    fontWeight: '800',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 24,
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 40,
  },
});
