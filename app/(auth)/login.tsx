import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/lib/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatCpf = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0,3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6)}`;
    return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6,9)}-${digits.slice(9)}`;
  };

  const handleLogin = async () => {
    if (!cpf || !senha) {
      setError('Preencha CPF e senha');
      return;
    }

    setLoading(true);
    setError('');

    const result = await login(cpf, senha);

    if (result.success) {
      router.replace('/(protected)');
    } else {
      setError(result.error || 'Erro ao fazer login');
    }

    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.brand}>Holerites</Text>
          <Text style={styles.brandSub}>para Você</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Acesse sua conta</Text>
          <Text style={styles.subtitle}>Bem-vindo ao seu portal de holerites</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CPF</Text>
            <TextInput
              style={styles.input}
              placeholder="000.000.000-00"
              placeholderTextColor="#666"
              value={cpf}
              onChangeText={(t) => setCpf(formatCpf(t))}
              keyboardType="numeric"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#666"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
            />
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Autenticando...' : 'Entrar'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Portal do Colaborador</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 32,
  },
  header: {
    alignItems: 'center',
  },
  brand: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1.5,
  },
  brandSub: {
    fontSize: 40,
    fontWeight: '300',
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: -8,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 32,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 28,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    marginBottom: 7,
    paddingLeft: 4,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 14,
    color: '#FFFFFF',
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(255,59,48,0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.2)',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#00C19C',
    padding: 17,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '900',
  },
  footer: {
    alignItems: 'center',
    opacity: 0.35,
  },
  footerText: {
    fontSize: 12,
    color: '#888',
  },
});
