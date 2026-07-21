import { Pool, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Suporta tanto DATABASE_URL quanto variáveis individuais
const dbUrl = process.env.DATABASE_URL;

const poolConfig: any = dbUrl
  ? {
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
    }
  : {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
    };

export const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Erro inesperado no pool:', err);
});

export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    console.log('Conectado ao PostgreSQL!');
    client.release();
    return true;
  } catch (err) {
    console.error('Erro ao conectar:', err);
    return false;
  }
}

// Helper para queries
export async function query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}
