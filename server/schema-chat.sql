-- Tabela de mensagens do chat
CREATE TABLE IF NOT EXISTS chat_mensagem (
  id SERIAL PRIMARY KEY,
  remetente_id INTEGER NOT NULL,
  remetente_nome VARCHAR(100) NOT NULL,
  remetente_role VARCHAR(20) NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN DEFAULT FALSE,
  data_criacao TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_chat_data ON chat_mensagem(data_criacao DESC);
