import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';

export default function PerfilScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useUser();
  const [editando, setEditando] = useState(false);
  const [nomeEdit, setNomeEdit] = useState(user?.firstName || '');

  const handleLogout = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.nomeDisplay}>{user?.fullName || 'Usuário'}</Text>
          <Text style={styles.emailText}>{user?.primaryEmailAddress?.emailAddress}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informações da Conta</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Nome</Text>
            <Text style={styles.fieldValue}>{user?.fullName || '-'}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            <Text style={styles.fieldValue}>{user?.primaryEmailAddress?.emailAddress || '-'}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>ID do Usuário</Text>
            <Text style={styles.fieldValue}>{user?.id || '-'}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Sair da Conta</Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Sobre o App</Text>
          <Text style={styles.infoText}>Holerites para Você v2.0</Text>
          <Text style={styles.infoText}>Sistema de Gestão de Holerites</Text>
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
  emailText: { fontSize: 14, color: '#888', marginTop: 4 },
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
  logoutBtn: {
    padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 24,
    backgroundColor: 'rgba(255,80,80,0.1)', borderWidth: 1, borderColor: 'rgba(255,80,80,0.2)',
  },
  logoutBtnText: { color: '#FF5050', fontSize: 14, fontWeight: '700' },
  infoCard: {
    backgroundColor: '#1A1A1A', borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 40,
  },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#888', marginBottom: 8 },
  infoText: { fontSize: 13, color: '#666', marginBottom: 4 },
});
