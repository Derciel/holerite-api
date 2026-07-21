import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/lib/AuthContext';

export default function PerfilScreen() {
  const router = useRouter();
  const { userId, cpf, role, nome } = useAuth();
  const [editando, setEditando] = useState(false);
  const [nomeEdit, setNomeEdit] = useState(nome || '');

  const handleSalvar = async () => {
    // TODO: Implementar atualização de perfil via API
    Alert.alert('Sucesso', 'Perfil atualizado!');
    setEditando(false);
  };

  const getRoleLabel = (r: string | null) => {
    if (r === 'ADMIN') return 'Administrador';
    if (r === 'COLABORADOR') return 'Colaborador';
    return r || '-';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {nome ? nome.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
          <Text style={styles.nomeDisplay}>{nome || 'Usuário'}</Text>
          <Text style={styles.roleBadge}>{getRoleLabel(role)}</Text>
        </View>

        {/* Informações */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informações da Conta</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>CPF</Text>
            <Text style={styles.fieldValue}>{cpf || '-'}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Nome de Exibição</Text>
            {editando ? (
              <TextInput
                style={styles.input}
                value={nomeEdit}
                onChangeText={setNomeEdit}
                placeholderTextColor="#666"
              />
            ) : (
              <Text style={styles.fieldValue}>{nome || '-'}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Função</Text>
            <Text style={styles.fieldValue}>{getRoleLabel(role)}</Text>
          </View>
        </View>

        {/* Ações */}
        {editando ? (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditando(false)}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSalvar}>
              <Text style={styles.saveBtnText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditando(true)}>
            <Text style={styles.editBtnText}>Editar Perfil</Text>
          </TouchableOpacity>
        )}

        {/* Info extra */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Sobre o App</Text>
          <Text style={styles.infoText}>Holerites para Você v1.0</Text>
          <Text style={styles.infoText}>Portal do Colaborador</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16,
    backgroundColor: '#111', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center',
  },
  backText: { color: '#FFF', fontSize: 18 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  content: { flex: 1, padding: 16 },
  avatarSection: { alignItems: 'center', marginBottom: 32, marginTop: 16 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#00C19C', justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: '900', color: '#000' },
  nomeDisplay: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  roleBadge: {
    fontSize: 12, fontWeight: '700', color: '#00C19C',
    backgroundColor: 'rgba(0,193,156,0.1)', paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 50, marginTop: 8,
  },
  card: {
    backgroundColor: '#1A1A1A', borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#FFF', marginBottom: 16 },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#888', marginBottom: 6 },
  fieldValue: { fontSize: 15, color: '#FFF' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10, padding: 12, color: '#FFF', fontSize: 15,
  },
  actions: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  cancelBtn: {
    flex: 1, padding: 14, borderRadius: 12, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  cancelBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  saveBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', backgroundColor: '#00C19C' },
  saveBtnText: { color: '#000', fontSize: 14, fontWeight: '800' },
  editBtn: {
    padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  editBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  infoCard: {
    backgroundColor: '#1A1A1A', borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 40,
  },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#888', marginBottom: 8 },
  infoText: { fontSize: 13, color: '#666', marginBottom: 4 },
});
