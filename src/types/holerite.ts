export interface Holerite {
  id: number;
  tipo: string;
  mes: string;
  ano: string;
  valor_liquido: number | null;
  valor_bruto: number | null;
  total_descontos: number | null;
  data_criacao: string;
  funcionario_nome?: string;
  empresa_nome?: string;
}

export interface Funcionario {
  id: number;
  nome: string;
  cpf: string;
  codigo: string | null;
  empresa: string | null;
  empresa_id: number | null;
}

export interface Empresa {
  id: number;
  nome: string;
  cnpj: string | null;
}

export interface Notificacao {
  id: number;
  titulo: string;
  mensagem: string;
  lida: boolean;
  data_criacao: string;
}

export interface Usuario {
  id: number;
  cpf: string;
  role: string;
  nome_exibicao: string | null;
}

export interface KPIs {
  total_funcionarios: number;
  total_holerites: number;
  total_empresas: number;
  ultimo_mes: string;
  folha_total: number;
  por_tipo: Record<string, number>;
  por_empresa: { nome: string; total: number }[];
}

export interface HoleriteResponse {
  data: Holerite[] | null;
  error: string | null;
}

export type HoleriteTipo = 'SALARIO' | 'ADIANTAMENTO' | 'FERIAS' | 'RESCISAO' | 'RENDIMENTOS';

export const TIPO_LABELS: Record<HoleriteTipo, string> = {
  SALARIO: 'Folha Mensal',
  ADIANTAMENTO: 'Adiantamento',
  FERIAS: 'Férias',
  RESCISAO: 'Rescisão',
  RENDIMENTOS: 'Informe IRPF',
};

export const TIPO_COLORS: Record<HoleriteTipo, string> = {
  SALARIO: '#00C19C',
  ADIANTAMENTO: '#5A82FF',
  FERIAS: '#FF8C42',
  RESCISAO: '#FF5050',
  RENDIMENTOS: '#F5C518',
};
