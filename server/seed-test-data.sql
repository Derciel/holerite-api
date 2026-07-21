-- Script para criar dados de teste
-- Execute este script no PostgreSQL

-- 1. Criar empresa de teste (se não existir)
INSERT INTO empresa (nome, cnpj) 
SELECT 'Grupo Nicopel', '12345678000199'
WHERE NOT EXISTS (SELECT 1 FROM empresa WHERE nome = 'Grupo Nicopel');

-- 2. Criar usuário admin (senha: admin123)
INSERT INTO usuario (cpf, senha, role, nome_exibicao) 
SELECT '000.000.000-00', 'admin123', 'ADMIN', 'Administrador'
WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE cpf = '000.000.000-00');

-- 3. Criar funcionários de teste
INSERT INTO funcionario (nome, cpf, codigo, empresa_id)
SELECT 'JOÃO DA SILVA', '111.111.111-11', '001', (SELECT id FROM empresa WHERE nome = 'Grupo Nicopel')
WHERE NOT EXISTS (SELECT 1 FROM funcionario WHERE cpf = '111.111.111-11');

INSERT INTO funcionario (nome, cpf, codigo, empresa_id)
SELECT 'MARIA SANTOS', '222.222.222-22', '002', (SELECT id FROM empresa WHERE nome = 'Grupo Nicopel')
WHERE NOT EXISTS (SELECT 1 FROM funcionario WHERE cpf = '222.222.222-22');

INSERT INTO funcionario (nome, cpf, codigo, empresa_id)
SELECT 'PEDRO OLIVEIRA', '333.333.333-33', '003', (SELECT id FROM empresa WHERE nome = 'Grupo Nicopel')
WHERE NOT EXISTS (SELECT 1 FROM funcionario WHERE cpf = '333.333.333-33');

-- 4. Criar usuários para os funcionários (senha = CPF limpo)
INSERT INTO usuario (cpf, senha, role)
SELECT '111.111.111-11', '11111111111', 'COLABORADOR'
WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE cpf = '111.111.111-11');

INSERT INTO usuario (cpf, senha, role)
SELECT '222.222.222-22', '22222222222', 'COLABORADOR'
WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE cpf = '222.222.222-22');

INSERT INTO usuario (cpf, senha, role)
SELECT '333.333.333-33', '33333333333', 'COLABORADOR'
WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE cpf = '333.333.333-33');

-- 5. Criar holerites de teste para João
INSERT INTO holerite (funcionario_id, tipo, mes, ano, valor_liquido, valor_bruto, total_descontos)
SELECT id, 'SALARIO', '01', '2026', 3500.00, 5000.00, 1500.00
FROM funcionario WHERE cpf = '111.111.111-11'
AND NOT EXISTS (SELECT 1 FROM holerite WHERE funcionario_id = (SELECT id FROM funcionario WHERE cpf = '111.111.111-11') AND mes = '01' AND ano = '2026');

INSERT INTO holerite (funcionario_id, tipo, mes, ano, valor_liquido, valor_bruto, total_descontos)
SELECT id, 'ADIANTAMENTO', '01', '2026', 1750.00, 1750.00, 0
FROM funcionario WHERE cpf = '111.111.111-11'
AND NOT EXISTS (SELECT 1 FROM holerite WHERE funcionario_id = (SELECT id FROM funcionario WHERE cpf = '111.111.111-11') AND mes = '01' AND ano = '2026' AND tipo = 'ADIANTAMENTO');

INSERT INTO holerite (funcionario_id, tipo, mes, ano, valor_liquido, valor_bruto, total_descontos)
SELECT id, 'SALARIO', '12', '2025', 3400.00, 4900.00, 1500.00
FROM funcionario WHERE cpf = '111.111.111-11'
AND NOT EXISTS (SELECT 1 FROM holerite WHERE funcionario_id = (SELECT id FROM funcionario WHERE cpf = '111.111.111-11') AND mes = '12' AND ano = '2025');

INSERT INTO holerite (funcionario_id, tipo, mes, ano, valor_liquido, valor_bruto, total_descontos)
SELECT id, 'FERIAS', '12', '2025', 4200.00, 6000.00, 1800.00
FROM funcionario WHERE cpf = '111.111.111-11'
AND NOT EXISTS (SELECT 1 FROM holerite WHERE funcionario_id = (SELECT id FROM funcionario WHERE cpf = '111.111.111-11') AND mes = '12' AND ano = '2025' AND tipo = 'FERIAS');

-- 6. Criar holerites para Maria
INSERT INTO holerite (funcionario_id, tipo, mes, ano, valor_liquido, valor_bruto, total_descontos)
SELECT id, 'SALARIO', '01', '2026', 4200.00, 6000.00, 1800.00
FROM funcionario WHERE cpf = '222.222.222-22'
AND NOT EXISTS (SELECT 1 FROM holerite WHERE funcionario_id = (SELECT id FROM funcionario WHERE cpf = '222.222.222-22') AND mes = '01' AND ano = '2026');

-- 7. Criar notificação de teste
INSERT INTO notificacao (usuario_id, titulo, mensagem, lida)
SELECT id, 'Bem-vindo ao portal!', 'Seu acesso foi liberado. Acesse seus holerites.', false
FROM usuario WHERE cpf = '111.111.111-11'
AND NOT EXISTS (SELECT 1 FROM notificacao WHERE usuario_id = (SELECT id FROM usuario WHERE cpf = '111.111.111-11'));

-- 8. Criar mensagem de teste no chat
INSERT INTO chat_mensagem (remetente_id, remetente_nome, remetente_role, mensagem)
SELECT id, 'RH', 'ADMIN', 'Olá! Este é o chat do RH. Como podemos ajudar?'
FROM usuario WHERE cpf = '000.000.000-00'
AND NOT EXISTS (SELECT 1 FROM chat_mensagem WHERE remetente_role = 'ADMIN' LIMIT 1);

-- Resumo dos dados criados
SELECT 
  (SELECT COUNT(*) FROM empresa) as empresas,
  (SELECT COUNT(*) FROM usuario) as usuarios,
  (SELECT COUNT(*) FROM funcionario) as funcionarios,
  (SELECT COUNT(*) FROM holerite) as holerites,
  (SELECT COUNT(*) FROM notificacao) as notificacoes,
  (SELECT COUNT(*) FROM chat_mensagem) as chat_mensagens;
