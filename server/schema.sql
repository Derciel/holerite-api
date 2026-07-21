-- Script de criação da tabela de holerites
-- Execute este script no seu PostgreSQL

CREATE TABLE IF NOT EXISTS holerites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  competencia TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  description TEXT
);

-- Índice para buscar holerites por usuário
CREATE INDEX IF NOT EXISTS idx_holerites_user_id ON holerites(user_id);

-- Índice para ordenação por data
CREATE INDEX IF NOT EXISTS idx_holerites_created_at ON holerites(created_at DESC);

-- Comentários nas colunas
COMMENT ON TABLE holerites IS 'Tabela de holerites dos funcionários';
COMMENT ON COLUMN holerites.user_id IS 'ID do usuário no Clerk';
COMMENT ON COLUMN holerites.file_name IS 'Nome do arquivo PDF';
COMMENT ON COLUMN holerites.file_url IS 'URL ou caminho do arquivo no storage';
COMMENT ON COLUMN holerites.competencia IS 'Competência no formato MM/YYYY';
