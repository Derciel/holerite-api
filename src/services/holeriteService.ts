import { Holerite, HoleriteResponse, Notificacao, Funcionario, Empresa, KPIs } from '../types/holerite';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

// ============================================================
// PORTAL - Holerites
// ============================================================
export async function fetchHolerites(userId: string): Promise<HoleriteResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/portal/holerites?user_id=${userId}`);
    const data = await response.json();
    if (!response.ok) return { data: null, error: data.erro || 'Erro ao buscar holerites' };
    return { data, error: null };
  } catch {
    return { data: null, error: 'Erro de conexão' };
  }
}

export async function downloadHolerite(holeriteId: number, userId: string): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/portal/download/${holeriteId}?user_id=${userId}`);
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
export async function fetchNotificacoes(userId: string): Promise<Notificacao[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/portal/notificacoes?user_id=${userId}`);
    return await response.json();
  } catch {
    return [];
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/portal/notificacoes/unread-count?user_id=${userId}`);
    const data = await response.json();
    return data.count || 0;
  } catch {
    return 0;
  }
}

export async function markAllRead(userId: string): Promise<boolean> {
  try {
    await fetch(`${API_BASE_URL}/api/portal/notificacoes/lidas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    });
    return true;
  } catch {
    return false;
  }
}

// ============================================================
// ADMIN - Funcionários
// ============================================================
export async function fetchFuncionarios(): Promise<Funcionario[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/funcionarios`);
    return await response.json();
  } catch {
    return [];
  }
}

export async function createFuncionario(data: { nome: string; cpf: string; codigo?: string; empresa_id?: number }): Promise<Funcionario | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/funcionario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function updateFuncionario(id: number, data: Partial<Funcionario>): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/funcionario/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function deleteFuncionario(id: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/funcionario/${id}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch {
    return false;
  }
}

// ============================================================
// ADMIN - Empresas
// ============================================================
export async function fetchEmpresas(): Promise<Empresa[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/empresas`);
    return await response.json();
  } catch {
    return [];
  }
}

export async function createEmpresa(data: { nome: string; cnpj?: string }): Promise<Empresa | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/empresa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

// ============================================================
// ADMIN - Holerites
// ============================================================
export async function fetchAdminHolerites(): Promise<Holerite[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/holerites`);
    return await response.json();
  } catch {
    return [];
  }
}

export async function deleteHolerite(id: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/holerite/${id}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch {
    return false;
  }
}

// ============================================================
// ADMIN - KPIs
// ============================================================
export async function fetchKPIs(): Promise<KPIs | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/kpis`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

// ============================================================
// ADMIN - Notificar todos
// ============================================================
export async function notificarTodos(titulo: string, mensagem: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/notificar-todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, mensagem }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

// ============================================================
// AUTH
// ============================================================
export async function login(cpf: string, senha: string): Promise<{ status: string; role?: string; usuario_id?: number; nome?: string; erro?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpf, senha }),
    });
    return await response.json();
  } catch {
    return { status: 'erro', erro: 'Erro de conexão' };
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

export async function fetchChatMensagens(userId: string, role: string, lastId?: number): Promise<ChatMensagem[]> {
  try {
    let url = `${API_BASE_URL}/api/chat/mensagens?user_id=${userId}&role=${role}`;
    if (lastId) url += `&last_id=${lastId}`;
    const response = await fetch(url);
    return await response.json();
  } catch {
    return [];
  }
}

export async function sendChatMensagem(data: {
  remetente_id: number;
  remetente_nome: string;
  remetente_role: string;
  mensagem: string;
}): Promise<ChatMensagem | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/mensagem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function markChatAsRead(userId: string, role: string): Promise<boolean> {
  try {
    await fetch(`${API_BASE_URL}/api/chat/lidas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, role }),
    });
    return true;
  } catch {
    return false;
  }
}

export async function getChatUnreadCount(userId: string, role: string): Promise<number> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/unread-count?user_id=${userId}&role=${role}`);
    const data = await response.json();
    return data.count || 0;
  } catch {
    return 0;
  }
}
