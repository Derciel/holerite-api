import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  userId: number | null;
  cpf: string | null;
  role: string | null;
  nome: string | null;
  loading: boolean;
  isLoaded: boolean;
  isSignedIn: boolean;
  login: (cpf: string, senha: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  userId: null,
  cpf: null,
  role: null,
  nome: null,
  loading: true,
  isLoaded: false,
  isSignedIn: false,
  login: async () => ({ success: false }),
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<number | null>(null);
  const [cpf, setCpf] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [nome, setNome] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  async function loadSession() {
    try {
      const stored = await AsyncStorage.getItem('auth_session');
      if (stored) {
        const data = JSON.parse(stored);
        setUserId(data.userId);
        setCpf(data.cpf);
        setRole(data.role);
        setNome(data.nome);
      }
    } catch {}
    setLoading(false);
  }

  async function login(cpfInput: string, senha: string) {
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf: cpfInput, senha }),
      });
      const data = await response.json();

      if (data.status === 'ok') {
        setUserId(data.usuario_id);
        setCpf(data.nome);
        setRole(data.role);
        setNome(data.nome);
        await AsyncStorage.setItem('auth_session', JSON.stringify({
          userId: data.usuario_id,
          cpf: data.nome,
          role: data.role,
          nome: data.nome,
        }));
        return { success: true };
      }

      return { success: false, error: data.mensagem || 'Erro ao fazer login' };
    } catch {
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  }

  async function logout() {
    setUserId(null);
    setCpf(null);
    setRole(null);
    setNome(null);
    await AsyncStorage.removeItem('auth_session');
  }

  return (
    <AuthContext.Provider value={{ userId, cpf, role, nome, loading, isLoaded: !loading, isSignedIn: userId !== null, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
