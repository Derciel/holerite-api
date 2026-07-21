# Deploy no Render - Guia Completo

## Passo 1: Criar conta no Render

1. Acesse https://render.com
2. Crie uma conta gratuita (pode usar GitHub/Google)

## Passo 2: Preparar o repositório Git

```bash
cd C:\Users\Usuario\Documents\holerite-app

# Inicializar git (se ainda não tiver)
git init

# Criar .gitignore se não tiver
echo "node_modules/" > .gitignore
echo ".env" >> .gitignore
echo "dist/" >> .gitignore

# Adicionar arquivos
git add .
git commit -m "Initial commit - API backend"
```

## Passo 3: Criar repositório no GitHub

1. Acesse https://github.com
2. Crie um novo repositório: `holerite-api`
3. Faça push do código:

```bash
git remote add origin https://github.com/SEU_USER/holerite-api.git
git branch -M main
git push -u origin main
```

## Passo 4: Criar serviço no Render

1. Acesse https://dashboard.render.com
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório GitHub
4. Configure:

| Campo | Valor |
|-------|-------|
| **Name** | `holerite-api` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npx ts-node server/index.ts` |
| **Plan** | `Free` |

## Passo 5: Configurar variáveis de ambiente

Na aba **"Environment"**, adicione:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DB_HOST` | `100.101.103.87` |
| `DB_PORT` | `5432` |
| `DB_NAME` | `sistema-holerite` |
| `DB_USER` | `postgres_admin` |
| `DB_PASSWORD` | `admin@123` |

## Passo 6: Deploy

1. Clique em **"Create Web Service"**
2. Aguarde o deploy (2-3 minutos)
3. O URL será algo como: `https://holerite-api.onrender.com`

## Passo 7: Testar

```bash
# Testar health check
curl https://holerite-api.onrender.com/api/health

# Deve retornar: {"status":"ok","timestamp":"..."}
```

## Passo 8: Atualizar o app

Atualize o `.env` do app com a URL do Render:

```bash
EXPO_PUBLIC_API_URL=https://holerite-api.onrender.com
```

## Notas Importantes

### Render Free Tier
- O serviço dorme após 15 minutos sem uso
- Demora ~30 segundos para "acordar"
- Limite de 750 horas/mês

### Para evitar sleep
O Render pode configurar ping automático para manter o serviço ativo.

### URL do Render
Anote a URL gerada. Ela será usada no app mobile.

## Troubleshooting

### Erro: "Cannot find module"
Verifique se o `ts-node` está nas dependências.

### Erro de conexão com banco
Verifique se o IP do banco está correto e acessível.

### Deploy falhou
Verifique os logs no painel do Render.
