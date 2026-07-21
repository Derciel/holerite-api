import { Router, Request, Response } from 'express';
import { pool, query } from './db';
import crypto from 'crypto';

const router = Router();

// Helper: hash simples para senhas (bcrypt não está disponível, usando SHA-256 com salt)
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  const verify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === verify;
}

// ============================================================
// AUTH - Login com CPF/Senha
// ============================================================
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { cpf, senha } = req.body;
    if (!cpf || !senha) {
      return res.status(400).json({ status: 'erro', mensagem: 'CPF e senha são obrigatórios' });
    }

    // Normalizar CPF
    const cleanCpf = cpf.replace(/\D/g, '').padStart(11, '0');

    // Buscar usuário (tenta formatos diferentes)
    const result = await query(
      `SELECT * FROM usuario WHERE cpf = $1 OR cpf = $2 OR cpf = $3`,
      [cpf, cleanCpf, `${cleanCpf.slice(0,3)}.${cleanCpf.slice(3,6)}.${cleanCpf.slice(6,9)}-${cleanCpf.slice(9)}`]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ status: 'erro', mensagem: 'CPF ou senha incorretos' });
    }

    const user = result.rows[0];
    if (!verifyPassword(senha, user.senha)) {
      return res.status(401).json({ status: 'erro', mensagem: 'CPF ou senha incorretos' });
    }

    return res.json({ status: 'ok', role: user.role, nome: user.nome_exibicao || user.cpf, usuario_id: user.id });
  } catch (err) {
    console.error('[LOGIN] Erro:', err);
    return res.status(500).json({ status: 'erro', mensagem: 'Erro no servidor' });
  }
});

// ============================================================
// PORTAL - Listar holerites do colaborador
// ============================================================
router.get('/portal/holerites', async (req: Request, res: Response) => {
  try {
    const userId = req.query.user_id as string;
    if (!userId) return res.status(400).json({ erro: 'user_id obrigatório' });

    const result = await query(
      `SELECT h.id, h.tipo, h.mes, h.ano, h.valor_liquido, h.valor_bruto, h.total_descontos,
              h.data_criacao, f.nome as funcionario_nome, e.nome as empresa_nome
       FROM holerite h
       JOIN funcionario f ON f.id = h.funcionario_id
       LEFT JOIN empresa e ON e.id = f.empresa_id
       WHERE f.cpf = (SELECT cpf FROM usuario WHERE id = $1)
       ORDER BY h.ano DESC, h.mes DESC`,
      [userId]
    );

    return res.json(result.rows);
  } catch (err) {
    console.error('[PORTAL] Erro:', err);
    return res.status(500).json({ erro: 'Erro interno' });
  }
});

// ============================================================
// PORTAL - Download de holerite
// ============================================================
router.get('/portal/download/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.query.user_id as string;

    const result = await query(
      `SELECT h.*, f.cpf FROM holerite h
       JOIN funcionario f ON f.id = h.funcionario_id
       WHERE h.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Holerite não encontrado' });
    }

    const holerite = result.rows[0];

    // Verificar se o usuário tem acesso
    if (userId) {
      const userResult = await query('SELECT cpf FROM usuario WHERE id = $1', [userId]);
      if (userResult.rows.length > 0 && userResult.rows[0].cpf !== holerite.cpf) {
        return res.status(403).json({ erro: 'Acesso negado' });
      }
    }

    if (holerite.pdf_data) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="holerite_${holerite.mes}_${holerite.ano}.pdf"`);
      return res.send(holerite.pdf_data);
    }

    return res.status(404).json({ erro: 'PDF não disponível' });
  } catch (err) {
    console.error('[DOWNLOAD] Erro:', err);
    return res.status(500).json({ erro: 'Erro interno' });
  }
});

// ============================================================
// PORTAL - Notificações
// ============================================================
router.get('/portal/notificacoes', async (req: Request, res: Response) => {
  try {
    const userId = req.query.user_id as string;
    if (!userId) return res.json([]);

    const result = await query(
      `SELECT id, titulo, mensagem, lida, data_criacao
       FROM notificacao WHERE usuario_id = $1
       ORDER BY data_criacao DESC LIMIT 10`,
      [userId]
    );

    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno' });
  }
});

router.get('/portal/notificacoes/unread-count', async (req: Request, res: Response) => {
  try {
    const userId = req.query.user_id as string;
    if (!userId) return res.json({ count: 0 });

    const result = await query(
      'SELECT COUNT(*) as count FROM notificacao WHERE usuario_id = $1 AND lida = false',
      [userId]
    );

    return res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno' });
  }
});

router.post('/portal/notificacoes/lidas', async (req: Request, res: Response) => {
  try {
    const userId = req.body.user_id;
    if (!userId) return res.status(400).json({ erro: 'user_id obrigatório' });

    await query('UPDATE notificacao SET lida = true WHERE usuario_id = $1 AND lida = false', [userId]);
    return res.json({ status: 'ok' });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno' });
  }
});

// ============================================================
// ADMIN - Listar funcionários
// ============================================================
router.get('/admin/funcionarios', async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT f.id, f.nome, f.cpf, f.codigo, e.nome as empresa, e.id as empresa_id
       FROM funcionario f
       LEFT JOIN empresa e ON e.id = f.empresa_id
       ORDER BY f.nome`
    );
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno' });
  }
});

// ============================================================
// ADMIN - Criar funcionário
// ============================================================
router.post('/admin/funcionario', async (req: Request, res: Response) => {
  try {
    const { nome, cpf, codigo, empresa_id } = req.body;
    if (!nome || !cpf) {
      return res.status(400).json({ erro: 'Nome e CPF são obrigatórios' });
    }

    const result = await query(
      `INSERT INTO funcionario (nome, cpf, codigo, empresa_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [nome.toUpperCase(), cpf, codigo || null, empresa_id || null]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ erro: 'CPF já cadastrado' });
    }
    return res.status(500).json({ erro: 'Erro interno' });
  }
});

// ============================================================
// ADMIN - Atualizar funcionário
// ============================================================
router.put('/admin/funcionario/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, cpf, codigo, empresa_id } = req.body;

    const result = await query(
      `UPDATE funcionario SET nome = $1, cpf = $2, codigo = $3, empresa_id = $4
       WHERE id = $5 RETURNING *`,
      [nome?.toUpperCase(), cpf, codigo, empresa_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Funcionário não encontrado' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno' });
  }
});

// ============================================================
// ADMIN - Deletar funcionário
// ============================================================
router.delete('/admin/funcionario/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM holerite WHERE funcionario_id = $1', [id]);
    const result = await query('DELETE FROM funcionario WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Funcionário não encontrado' });
    }

    return res.json({ status: 'ok' });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno' });
  }
});

// ============================================================
// ADMIN - Listar empresas
// ============================================================
router.get('/admin/empresas', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM empresa ORDER BY nome');
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno' });
  }
});

// ============================================================
// ADMIN - Criar empresa
// ============================================================
router.post('/admin/empresa', async (req: Request, res: Response) => {
  try {
    const { nome, cnpj } = req.body;
    if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório' });

    const result = await query(
      'INSERT INTO empresa (nome, cnpj) VALUES ($1, $2) RETURNING *',
      [nome, cnpj || null]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ erro: 'CNPJ já cadastrado' });
    }
    return res.status(500).json({ erro: 'Erro interno' });
  }
});

// ============================================================
// ADMIN - Listar holerites
// ============================================================
router.get('/admin/holerites', async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT h.id, h.tipo, h.mes, h.ano, h.valor_liquido, h.valor_bruto, h.total_descontos,
              h.data_criacao, f.nome as funcionario, e.nome as empresa
       FROM holerite h
       JOIN funcionario f ON f.id = h.funcionario_id
       LEFT JOIN empresa e ON e.id = f.empresa_id
       ORDER BY h.data_criacao DESC
       LIMIT 200`
    );
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno' });
  }
});

// ============================================================
// ADMIN - Criar holerite (manual)
// ============================================================
router.post('/admin/holerite', async (req: Request, res: Response) => {
  try {
    const { funcionario_id, tipo, mes, ano, valor_liquido, valor_bruto, total_descontos, pdf_data } = req.body;
    if (!funcionario_id || !tipo || !mes || !ano) {
      return res.status(400).json({ erro: 'funcionario_id, tipo, mes e ano são obrigatórios' });
    }

    const result = await query(
      `INSERT INTO holerite (funcionario_id, tipo, mes, ano, valor_liquido, valor_bruto, total_descontos, pdf_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [funcionario_id, tipo, mes, ano, valor_liquido || null, valor_bruto || null, total_descontos || null, pdf_data || null]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno' });
  }
});

// ============================================================
// ADMIN - Deletar holerite
// ============================================================
router.delete('/admin/holerite/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM holerite WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Holerite não encontrado' });
    }

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno' });
  }
});

// ============================================================
// ADMIN - KPIs
// ============================================================
router.get('/admin/kpis', async (req: Request, res: Response) => {
  try {
    const totalFuncs = await query('SELECT COUNT(*) as count FROM funcionario');
    const totalHolerites = await query('SELECT COUNT(*) as count FROM holerite');
    const empresas = await query('SELECT COUNT(*) as count FROM empresa');

    const ultimoMes = await query(
      'SELECT mes, ano FROM holerite ORDER BY ano DESC, mes DESC LIMIT 1'
    );

    const folhaTotal = await query(
      'SELECT COALESCE(SUM(valor_bruto), 0) as total FROM holerite WHERE valor_bruto IS NOT NULL'
    );

    const porTipo = await query(
      'SELECT tipo, COUNT(*) as count FROM holerite GROUP BY tipo'
    );

    const porEmpresa = await query(
      `SELECT e.nome, COUNT(f.id) as total
       FROM empresa e
       LEFT JOIN funcionario f ON f.empresa_id = e.id
       GROUP BY e.id, e.nome
       ORDER BY total DESC`
    );

    return res.json({
      total_funcionarios: parseInt(totalFuncs.rows[0].count),
      total_holerites: parseInt(totalHolerites.rows[0].count),
      total_empresas: parseInt(empresas.rows[0].count),
      ultimo_mes: ultimoMes.rows.length > 0 ? `${ultimoMes.rows[0].mes}/${ultimoMes.rows[0].ano}` : '',
      folha_total: parseFloat(folhaTotal.rows[0].total),
      por_tipo: porTipo.rows.reduce((acc: any, r: any) => { acc[r.tipo] = parseInt(r.count); return acc; }, {}),
      por_empresa: porEmpresa.rows,
    });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno' });
  }
});

// ============================================================
// ADMIN - Notificar todos
// ============================================================
router.post('/admin/notificar-todos', async (req: Request, res: Response) => {
  try {
    const { titulo, mensagem } = req.body;
    const users = await query('SELECT id FROM usuario WHERE role = $1', ['COLABORADOR']);

    for (const user of users.rows) {
      await query(
        'INSERT INTO notificacao (usuario_id, titulo, mensagem) VALUES ($1, $2, $3)',
        [user.id, titulo || 'Novo documento disponível', mensagem || 'Seu holerite mensal chegou!']
      );
    }

    return res.json({ status: 'ok', enviadas: users.rows.length });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno' });
  }
});

// ============================================================
// HEALTH
// ============================================================
router.get('/health', async (_req: Request, res: Response) => {
  try {
    await query('SELECT 1');
    return res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (err) {
    return res.status(500).json({ status: 'erro' });
  }
});

// ============================================================
// USUÁRIO - Criar usuário (para o Clerk sync ou registro manual)
// ============================================================
router.post('/usuario', async (req: Request, res: Response) => {
  try {
    const { cpf, senha, role, nome_exibicao } = req.body;
    if (!cpf || !senha) {
      return res.status(400).json({ erro: 'CPF e senha são obrigatórios' });
    }

    const result = await query(
      `INSERT INTO usuario (cpf, senha, role, nome_exibicao)
       VALUES ($1, $2, $3, $4) RETURNING id, cpf, role, nome_exibicao`,
      [cpf, hashPassword(senha), role || 'COLABORADOR', nome_exibicao || null]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ erro: 'CPF já cadastrado' });
    }
    return res.status(500).json({ erro: 'Erro interno' });
  }
});

// ============================================================
// USUÁRIO - Listar
// ============================================================
router.get('/usuarios', async (_req: Request, res: Response) => {
  try {
    const result = await query('SELECT id, cpf, role, nome_exibicao FROM usuario ORDER BY cpf');
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno' });
  }
});

// ============================================================
// CHAT - Mensagens
// ============================================================

// Criar tabela se não existir
async function initChatTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS chat_mensagem (
        id SERIAL PRIMARY KEY,
        remetente_id INTEGER NOT NULL,
        remetente_nome VARCHAR(100) NOT NULL,
        remetente_role VARCHAR(20) NOT NULL,
        mensagem TEXT NOT NULL,
        lida BOOLEAN DEFAULT FALSE,
        data_criacao TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await query('CREATE INDEX IF NOT EXISTS idx_chat_data ON chat_mensagem(data_criacao DESC)').catch(() => {});
  } catch (err) {
    console.error('[CHAT] Erro ao criar tabela:', err);
  }
}
initChatTable();

// Listar mensagens (todas para admin, apenas próprias para colaborador)
router.get('/chat/mensagens', async (req: Request, res: Response) => {
  try {
    const userId = req.query.user_id as string;
    const role = req.query.role as string;
    const lastId = req.query.last_id as string;

    let sql = '';
    let params: any[] = [];

    if (role === 'ADMIN') {
      // Admin vê todas as mensagens
      if (lastId) {
        sql = 'SELECT * FROM chat_mensagem WHERE id > $1 ORDER BY data_criacao ASC';
        params = [lastId];
      } else {
        sql = 'SELECT * FROM chat_mensagem ORDER BY data_criacao ASC LIMIT 200';
      }
    } else {
      // Colaborador vê apenas suas mensagens + respostas do RH
      if (lastId) {
        sql = 'SELECT * FROM chat_mensagem WHERE id > $1 AND (remetente_id = $2 OR remetente_role = $3) ORDER BY data_criacao ASC';
        params = [lastId, userId, 'ADMIN'];
      } else {
        sql = 'SELECT * FROM chat_mensagem WHERE remetente_id = $1 OR remetente_role = $2 ORDER BY data_criacao ASC LIMIT 200';
        params = [userId, 'ADMIN'];
      }
    }

    const result = await query(sql, params);
    return res.json(result.rows);
  } catch (err) {
    console.error('[CHAT] Erro ao buscar mensagens:', err);
    return res.status(500).json({ erro: 'Erro interno' });
  }
});

// Enviar mensagem
router.post('/chat/mensagem', async (req: Request, res: Response) => {
  try {
    const { remetente_id, remetente_nome, remetente_role, mensagem } = req.body;

    if (!remetente_id || !remetente_nome || !remetente_role || !mensagem) {
      return res.status(400).json({ erro: 'Dados obrigatórios faltando' });
    }

    if (mensagem.trim().length === 0) {
      return res.status(400).json({ erro: 'Mensagem não pode ser vazia' });
    }

    const result = await query(
      `INSERT INTO chat_mensagem (remetente_id, remetente_nome, remetente_role, mensagem)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [remetente_id, remetente_nome, remetente_role, mensagem.trim().slice(0, 2000)]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[CHAT] Erro ao enviar mensagem:', err);
    return res.status(500).json({ erro: 'Erro interno' });
  }
});

// Marcar mensagens como lidas
router.post('/chat/lidas', async (req: Request, res: Response) => {
  try {
    const { user_id, role } = req.body;

    if (role === 'ADMIN') {
      await query('UPDATE chat_mensagem SET lida = true WHERE remetente_role != $1 AND lida = false', ['ADMIN']);
    } else if (user_id) {
      await query('UPDATE chat_mensagem SET lida = true WHERE remetente_id != $1 AND lida = false', [user_id]);
    }

    return res.json({ status: 'ok' });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno' });
  }
});

// Contagem de não lidas
router.get('/chat/unread-count', async (req: Request, res: Response) => {
  try {
    const userId = req.query.user_id as string;
    const role = req.query.role as string;

    let sql = '';
    let params: any[] = [];

    if (role === 'ADMIN') {
      sql = 'SELECT COUNT(*) as count FROM chat_mensagem WHERE remetente_role != $1 AND lida = false';
      params = ['ADMIN'];
    } else {
      sql = 'SELECT COUNT(*) as count FROM chat_mensagem WHERE remetente_id != $1 AND lida = false';
      params = [userId];
    }

    const result = await query(sql, params);
    return res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno' });
  }
});

// Deletar mensagem (admin)
router.delete('/chat/mensagem/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM chat_mensagem WHERE id = $1', [id]);
    return res.json({ status: 'ok' });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno' });
  }
});

export default router;
