import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { testConnection, query } from './db';
import apiRouter from './routes';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));

app.use('/api', apiRouter);

async function initDatabase() {
  try {
    // Criar tabela de usuários (não está no schema original, mas necessária para auth)
    await query(`
      CREATE TABLE IF NOT EXISTS usuario (
        id SERIAL PRIMARY KEY,
        cpf VARCHAR(20) UNIQUE NOT NULL,
        senha VARCHAR(200) NOT NULL,
        role VARCHAR(20) DEFAULT 'COLABORADOR',
        nome_exibicao VARCHAR(100),
        foto_perfil TEXT
      )
    `);
    console.log('[DB] Tabela usuario verificada');

    // Criar tabela de empresa
    await query(`
      CREATE TABLE IF NOT EXISTS empresa (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        cnpj VARCHAR(14) UNIQUE
      )
    `);
    console.log('[DB] Tabela empresa verificada');

    // Criar tabela de funcionário
    await query(`
      CREATE TABLE IF NOT EXISTS funcionario (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        cpf VARCHAR(20) UNIQUE NOT NULL,
        codigo VARCHAR(20),
        empresa_id INTEGER REFERENCES empresa(id) ON DELETE CASCADE
      )
    `);
    console.log('[DB] Tabela funcionario verificada');

    // Criar tabela de holerite
    await query(`
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
      )
    `);
    console.log('[DB] Tabela holerite verificada');

    // Criar tabela de notificações
    await query(`
      CREATE TABLE IF NOT EXISTS notificacao (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL,
        titulo VARCHAR(100) NOT NULL,
        mensagem VARCHAR(255) NOT NULL,
        lida BOOLEAN DEFAULT FALSE,
        data_criacao TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('[DB] Tabela notificacao verificada');

    // Criar índices
    await query('CREATE INDEX IF NOT EXISTS idx_funcionario_cpf ON funcionario(cpf)').catch(() => {});
    await query('CREATE INDEX IF NOT EXISTS idx_funcionario_empresa ON funcionario(empresa_id)').catch(() => {});
    await query('CREATE INDEX IF NOT EXISTS idx_holerite_funcionario ON holerite(funcionario_id)').catch(() => {});
    await query('CREATE INDEX IF NOT EXISTS idx_holerite_periodo ON holerite(ano, mes)').catch(() => {});
    await query('CREATE INDEX IF NOT EXISTS idx_notificacao_usuario ON notificacao(usuario_id)').catch(() => {});

    console.log('[DB] Todas as tabelas criadas/verificadas');
  } catch (err) {
    console.error('[DB] Erro ao inicializar:', err);
  }
}

async function start() {
  const connected = await testConnection();
  if (!connected) {
    console.error('Não foi possível conectar ao banco.');
    process.exit(1);
  }

  await initDatabase();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT} (acessivel em todas as interfaces)`);
  });
}

start();
