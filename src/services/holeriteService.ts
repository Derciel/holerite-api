import { Holerite, HoleriteResponse, Notificacao, Funcionario, Empresa, KPIs } from '../types/holerite';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://sistema-holerite-v2.onrender.com';

// Helper para obter token do Clerk
let clerkToken: string | null = null;

export function setClerkToken(token: string | null) {
  clerkToken = token;
}

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (clerkToken) {
    headers['Authorization'] = `Bearer ${clerkToken}`;
  }

  return fetch(url, { ...options, headers });
}

// ============================================================
// PORTAL - Holerites
// ============================================================
export async function fetchHolerites(userId: string): Promise<HoleriteResponse> {
  try {
    const response = await authFetch(`${API_BASE_URL}/api/portal/holerites`);
    const data = await response.json();
    if (!response.ok) return { data: null, error: data.erro || 'Erro ao buscar holerites' };
    return { data, error: null };
  } catch {
    return { data: null, error: 'Erro de conexão' };
  }
}

export async function downloadHolerite(holeriteId: number): Promise<string | null> {
  try {
    const response = await authFetch(`${API_BASE_URL}/api/portal/download/${holeriteId}`);
    if (!response.ok) return null;
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

// ============================================================
// PORTAL - Notificações
// ============================================================
export async function fetchNotificacoes(): Promise<Notificacao[]> {
  try {
    const response = await authFetch(`${API_BASE_URL}/api/portal/notificacoes`);
    return await response.json();
  } catch {
    return [];
  }
}

export async function getUnreadCount(): Promise<number> {
  try {
    const response = await authFetch(`${API_BASE_URL}/api/portal/notificacoes/unread-count`);
    const data = await response.json();
    return data.count || 0;
  } catch {
    return 0;
  }
}

export async function markAllRead(): Promise<boolean> {
  try {
    await authFetch(`${API_BASE_URL}/api/portal/notificacoes/lidas`, { method: 'POST' });
    return true;
  } catch {
    return false;
  }
}

// ============================================================
// CHAT
// ============================================================
export interface ChatMensagem {
  id: number;
  remetente_id: number;
  remetente_nome: string;
  remetente_role: string;
  mensagem: string;
  lida: boolean;
  data_criacao: string;
}

export async function fetchChatMensagens(): Promise<ChatMensagem[]> {
  try {
    const response = await authFetch(`${API_BASE_URL}/api/chat/mensagens`);
    return await response.json();
  } catch {
    return [];
  }
}

export async function sendChatMensagem(mensagem: string): Promise<ChatMensagem | null> {
  try {
    const response = await authFetch(`${API_BASE_URL}/api/chat/mensagem`, {
      method: 'POST',
      body: JSON.stringify({ mensagem }),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function markChatAsRead(): Promise<boolean> {
  try {
    await authFetch(`${API_BASE_URL}/api/chat/lidas`, { method: 'POST' });
    return true;
  } catch {
    return false;
  }
}

export async function getChatUnreadCount(): Promise<number> {
  try {
    const response = await authFetch(`${API_BASE_URL}/api/chat/unread-count`);
    const data = await response.json();
    return data.count || 0;
  } catch {
    return 0;
  }
}

// ============================================================
// ADMIN
// ============================================================
export async function fetchKPIs(): Promise<KPIs | null> {
  try {
    const response = await authFetch(`${API_BASE_URL}/api/admin/kpis`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function fetchFuncionarios(): Promise<Funcionario[]> {
  try {
    const response = await authFetch(`${API_BASE_URL}/api/admin/funcionarios`);
    return await response.json();
  } catch {
    return [];
  }
}

export async function fetchEmpresas(): Promise<Empresa[]> {
  try {
    const response = await authFetch(`${API_BASE_URL}/api/admin/empresas`);
    return await response.json();
  } catch {
    return [];
  }
}

export async function fetchAdminHolerites(): Promise<Holerite[]> {
  try {
    const response = await authFetch(`${API_BASE_URL}/api/admin/holerites`);
    return await response.json();
  } catch {
    return [];
  }
}

export async function notificarTodos(titulo: string, mensagem: string): Promise<boolean> {
  try {
    const response = await authFetch(`${API_BASE_URL}/api/admin/notificar-todos`, {
      method: 'POST',
      body: JSON.stringify({ titulo, mensagem }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
