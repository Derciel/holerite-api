# Guia de Teste - Holerites App

## Pré-requisitos

1. Node.js instalado
2. Expo CLI (`npm install -g expo-cli`)
3. Acesso ao banco PostgreSQL (já configurado)

## Passo 1: Criar Usuário de Teste

Execute este SQL no seu PostgreSQL para criar um usuário admin:

```sql
-- Criar usuário admin (senha: admin123)
INSERT INTO usuario (cpf, senha, role, nome_exibicao) 
VALUES ('000.000.000-00', 'admin123', 'ADMIN', 'Administrador')
ON CONFLICT (cpf) DO NOTHING;
```

## Passo 2: Iniciar o Servidor API

No terminal, navegue até a pasta do projeto e execute:

```bash
cd C:\Users\Usuario\Documents\holerite-app
npm run server
```

O servidor deve mostrar:
```
Conectado ao PostgreSQL!
[DB] Todas as tabelas criadas/verificadas
Servidor rodando na porta 3001
```

## Passo 3: Testar a API (Opcional)

Em outro terminal, teste se a API está funcionando:

```bash
# Health check
Invoke-RestMethod -Uri "http://localhost:3001/api/health"

# Login
$body = @{ cpf = "000.000.000-00"; senha = "admin123" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3001/api/login" -Method POST -Body $body -ContentType "application/json"
```

## Passo 4: Iniciar o App Expo

Em outro terminal:

```bash
cd C:\Users\Usuario\Documents\holerite-app
npm start
```

## Passo 5: Testar no Celular

1. Baixe o app **Expo Go** na Play Store (Android) ou App Store (iOS)
2. Escaneie o QR Code mostrado no terminal
3. O app vai abrir no celular

## Passo 6: Testar o Login

1. No app, digite o CPF: `000.000.000-00`
2. Digite a senha: `admin123`
3. Clique em "Entrar"

## Passo 7: Testar as Funcionalidades

### Portal do Colaborador
- ✅ Ver lista de holerites (vazia no início)
- ✅ Filtros por tipo (Salário, Adiantamento, Férias, IRPF)
- ✅ Pull-to-refresh

### Chat RH
- ✅ Clique no 💬 para abrir o chat
- ✅ Envie uma mensagem
- ✅ Mensagem aparece na lista

### Notificações
- ✅ Clique no 🔔 para ver notificações
- ✅ Botão "Marcar lidas"

### Perfil
- ✅ Clique no 👤 para ver o perfil
- ✅ Editar nome de exibição

### Admin (apenas para ADMIN)
- ✅ Clique no ⚙ para ver o painel
- ✅ Dashboard com KPIs
- ✅ Lista de funcionários
- ✅ Lista de empresas
- ✅ Lista de holerites

## Passo 8: Criar Dados de Teste (Opcional)

### Criar Empresa
```sql
INSERT INTO empresa (nome, cnpj) VALUES ('Empresa Teste LTDA', '12345678000199');
```

### Criar Funcionário
```sql
INSERT INTO funcionario (nome, cpf, codigo, empresa_id) 
VALUES ('JOÃO DA SILVA', '111.111.111-11', '001', 1);

-- Criar usuário para o funcionário
INSERT INTO usuario (cpf, senha, role) 
VALUES ('111.111.111-11', '11111111111', 'COLABORADOR');
```

### Criar Holerite
```sql
INSERT INTO holerite (funcionario_id, tipo, mes, ano, valor_liquido, valor_bruto, total_descontos)
VALUES (1, 'SALARIO', '01', '2026', 3500.00, 5000.00, 1500.00);
```

## Troubleshooting

### Erro: "Não foi possível conectar ao banco"
- Verifique se o PostgreSQL está rodando
- Verifique as credenciais no arquivo `.env`

### Erro: "Cannot find module"
Execute:
```bash
npm install
```

### Erro: "Port 3001 already in use"
Mata o processo anterior:
```bash
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### App não conecta ao servidor
Verifique o IP no arquivo `.env`:
```
EXPO_PUBLIC_API_URL=http://SEU_IP:3001
```

## URLs Úteis

- **API Health:** http://localhost:3001/api/health
- **Portal Holerites:** http://localhost:3001/api/portal/holerites?user_id=1
- **Chat Mensagens:** http://localhost:3001/api/chat/mensagens?user_id=1&role=ADMIN
