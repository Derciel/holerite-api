import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { fetchNotificacoes, markAllRead } from '../../src/services/holeriteService';
import { Notificacao } from '../../src/types/holerite';

export default function NotificacoesScreen() {
  const router = useRouter();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const data = await fetchNotificacoes();
    setNotificacoes(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
  };

  const formatData = (data: string) => {
    try {
      const d = new Date(data);
      const hoje = new Date();
      if (d.toDateString() === hoje.toDateString()) {
        return `Hoje ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
      }
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch {
      return data;
    }
  };

  const unreadCount = notificacoes.filter(n => !n.lida).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Notificações</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerCount}>{unreadCount} não lidas</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.markReadBtn}>
            <Text style={styles.markReadText}>Marcar lidas</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#00C19C" style={styles.loader} />
      ) : (
        <FlatList
          data={notificacoes}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <View style={[styles.notifCard, !item.lida && styles.notifCardUnread]}>
              <View style={[styles.notifDot, !item.lida && styles.notifDotActive]} />
              <View style={styles.notifContent}>
                <Text style={styles.notifTitle}>{item.titulo}</Text>
                <Text style={styles.notifMessage}>{item.mensagem}</Text>
                <Text style={styles.notifDate}>{item.data_criacao}</Text>
              </View>
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#00C19C" />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={styles.emptyTitle}>Nenhuma notificação</Text>
              <Text style={styles.emptySubtitle}>Quando houver novidades, elas aparecerão aqui.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16,
    backgroundColor: '#111', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center',
  },
  backText: { color: '#FFF', fontSize: 18 },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  headerCount: { fontSize: 12, color: '#00C19C', marginTop: 2 },
  markReadBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(0,193,156,0.1)' },
  markReadText: { color: '#00C19C', fontSize: 12, fontWeight: '700' },
  loader: { marginTop: 60 },
  listContent: { padding: 16 },
  notifCard: {
    flexDirection: 'row', gap: 12, backgroundColor: '#1A1A1A', borderRadius: 12,
    padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  notifCardUnread: { borderColor: 'rgba(0,193,156,0.3)' },
  notifDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.1)', marginTop: 6 },
  notifDotActive: { backgroundColor: '#00C19C' },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '700', color: '#FFF', marginBottom: 4 },
  notifMessage: { fontSize: 13, color: '#888', lineHeight: 18 },
  notifDate: { fontSize: 11, color: '#666', marginTop: 8 },
  emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 24 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#888', textAlign: 'center' },
});
