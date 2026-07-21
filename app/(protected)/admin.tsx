import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/lib/AuthContext';
import { fetchKPIs, fetchFuncionarios, fetchEmpresas } from '../../src/services/holeriteService';
import { KPIs, Funcionario, Empresa } from '../../src/types/holerite';

type Tab = 'dashboard' | 'funcionarios' | 'empresas' | 'holerites';

export default function AdminScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const [k, f, e] = await Promise.all([
      fetchKPIs(),
      fetchFuncionarios(),
      fetchEmpresas(),
    ]);
    setKpis(k);
    setFuncionarios(f);
    setEmpresas(e);
  };

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Painel Admin</Text>
          <Text style={styles.subtitle}>Gestão do sistema</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['dashboard', 'funcionarios', 'empresas', 'holerites'] as Tab[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'dashboard' ? 'Dashboard' : t === 'funcionarios' ? 'Funcionários' : t === 'empresas' ? 'Empresas' : 'Holerites'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#00C19C" />}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#00C19C" style={styles.loader} />
        ) : tab === 'dashboard' ? (
          <DashboardTab kpis={kpis} />
        ) : tab === 'funcionarios' ? (
          <FuncionariosTab data={funcionarios} />
        ) : tab === 'empresas' ? (
          <EmpresasTab data={empresas} />
        ) : (
          <HoleritesTab />
        )}
      </ScrollView>
    </View>
  );
}

// ============================================================
// Dashboard Tab
// ============================================================
function DashboardTab({ kpis }: { kpis: KPIs | null }) {
  if (!kpis) return <Text style={styles.emptyText}>Erro ao carregar KPIs</Text>;

  return (
    <View style={styles.kpiGrid}>
      <KpiCard title="Funcionários" value={kpis.total_funcionarios} color="#00C19C" />
      <KpiCard title="Holerites" value={kpis.total_holerites} color="#5A82FF" />
      <KpiCard title="Empresas" value={kpis.total_empresas} color="#F5C518" />
      <KpiCard title="Folha Total" value={`R$ ${(kpis.folha_total / 1000).toFixed(1)}k`} color="#FF8C42" />
      <KpiCard title="Último Mês" value={kpis.ultimo_mes || '-'} color="#FF5050" />

      {kpis.por_tipo && Object.keys(kpis.por_tipo).length > 0 && (
        <View style={styles.kpiFull}>
          <Text style={styles.kpiSectionTitle}>Por Tipo</Text>
          {Object.entries(kpis.por_tipo).map(([tipo, count]) => (
            <View key={tipo} style={styles.kpiRow}>
              <Text style={styles.kpiRowLabel}>{tipo}</Text>
              <Text style={styles.kpiRowValue}>{count}</Text>
            </View>
          ))}
        </View>
      )}

      {kpis.por_empresa && kpis.por_empresa.length > 0 && (
        <View style={styles.kpiFull}>
          <Text style={styles.kpiSectionTitle}>Por Empresa</Text>
          {kpis.por_empresa.map((e, i) => (
            <View key={i} style={styles.kpiRow}>
              <Text style={styles.kpiRowLabel}>{e.nome}</Text>
              <Text style={styles.kpiRowValue}>{e.total}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function KpiCard({ title, value, color }: { title: string; value: string | number; color: string }) {
  return (
    <View style={[styles.kpiCard, { borderLeftColor: color }]}>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiTitle}>{title}</Text>
    </View>
  );
}

// ============================================================
// Funcionários Tab
// ============================================================
function FuncionariosTab({ data }: { data: Funcionario[] }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>{data.length} funcionários cadastrados</Text>
      {data.map(f => (
        <View key={f.id} style={styles.listItem}>
          <View style={styles.listItemInfo}>
            <Text style={styles.listItemTitle}>{f.nome}</Text>
            <Text style={styles.listItemSubtitle}>CPF: {f.cpf} {f.codigo ? `| Cod: ${f.codigo}` : ''}</Text>
            <Text style={styles.listItemSubtitle}>{f.empresa || 'Sem empresa'}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ============================================================
// Empresas Tab
// ============================================================
function EmpresasTab({ data }: { data: Empresa[] }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>{data.length} empresas cadastradas</Text>
      {data.map(e => (
        <View key={e.id} style={styles.listItem}>
          <View style={styles.listItemInfo}>
            <Text style={styles.listItemTitle}>{e.nome}</Text>
            <Text style={styles.listItemSubtitle}>CNPJ: {e.cnpj || 'Não informado'}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ============================================================
// Holerites Tab
// ============================================================
function HoleritesTab() {
  const [holerites, setHolerites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/holerites`)
      .then(r => r.json())
      .then(setHolerites)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#00C19C" style={styles.loader} />;

  return (
    <View>
      <Text style={styles.sectionTitle}>{holerites.length} holerites no sistema</Text>
      {holerites.map(h => (
        <View key={h.id} style={styles.listItem}>
          <View style={styles.listItemInfo}>
            <Text style={styles.listItemTitle}>{h.funcionario || '?'}</Text>
            <Text style={styles.listItemSubtitle}>{h.tipo} — {h.mes}/{h.ano} — {h.empresa || '?'}</Text>
            <Text style={styles.listItemSubtitle}>{h.data_criacao}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16,
    backgroundColor: '#111', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  title: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  subtitle: { fontSize: 14, color: '#888', marginTop: 2 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  logoutText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  tabs: {
    flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  tab: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 50,
  },
  tabActive: { backgroundColor: '#00C19C', borderColor: 'transparent' },
  tabText: { fontSize: 13, fontWeight: '700', color: '#888' },
  tabTextActive: { color: '#000' },
  content: { flex: 1, padding: 16 },
  loader: { marginTop: 40 },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 40 },
  kpiGrid: { gap: 12 },
  kpiCard: {
    backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderLeftWidth: 3,
  },
  kpiValue: { fontSize: 24, fontWeight: '900', color: '#FFF' },
  kpiTitle: { fontSize: 13, color: '#888', marginTop: 4 },
  kpiFull: {
    backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  kpiSectionTitle: { fontSize: 14, fontWeight: '800', color: '#FFF', marginBottom: 12 },
  kpiRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  kpiRowLabel: { fontSize: 13, color: '#CCC' },
  kpiRowValue: { fontSize: 13, fontWeight: '700', color: '#FFF' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#FFF', marginBottom: 16 },
  listItem: {
    backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  listItemInfo: { flex: 1 },
  listItemTitle: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  listItemSubtitle: { fontSize: 12, color: '#888', marginTop: 2 },
});
