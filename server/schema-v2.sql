-- Migration: replicar schema do sistema-holerite original
-- Execute este script no PostgreSQL

-- Tabela de empresas
CREATE TABLE IF NOT EXISTS empresa (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  cnpj VARCHAR(14) UNIQUE
);

-- Tabela de funcionários
CREATE TABLE IF NOT EXISTS funcionario (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  cpf VARCHAR(20) UNIQUE NOT NULL,
  codigo VARCHAR(20),
  empresa_id INTEGER REFERENCES empresa(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_funcionario_cpf ON funcionario(cpf);
CREATE INDEX IF NOT EXISTS idx_funcionario_codigo ON funcionario(codigo);
CREATE INDEX IF NOT EXISTS idx_funcionario_empresa ON funcionario(empresa_id);

-- Tabela de holerites
CREATE TABLE IF NOT EXISTS holerite (
  id SERIAL PRIMARY KEY,
  funcionario_id INTEGER REFERENCES funcionario(id) ON DELETE CASCADE,
  caminho VARCHAR(255),
  pdf_data BYTEA,
  tipo VARCHAR(20) NOT NULL,
  mes VARCHAR(20) NOT NULL,
  ano VARCHAR(4) NOT NULL,
  valor_liquido FLOAT,
  valor_bruto FLOAT,
  total_descontos FLOAT,
  data_criacao TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_holerite_funcionario ON holerite(funcionario_id);
CREATE INDEX IF NOT EXISTS idx_holerite_periodo ON holerite(ano, mes);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notificacao (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  titulo VARCHAR(100) NOT NULL,
  mensagem VARCHAR(255) NOT NULL,
  lida BOOLEAN DEFAULT FALSE,
  data_criacao TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notificacao_usuario_lida ON notificacao(usuario_id, lida);
