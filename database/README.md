# 🗄️ Database Configuration - Ecojardim & Pedras

## Quick Start

### ✅ Se está criando um novo projeto (Recomendado)

1. **Crie um novo projeto Supabase**
   - Vá para: https://app.supabase.com
   - Clique em "New Project"

2. **Execute o schema.sql**
   - Abra SQL Editor
   - Crie uma Nova Query
   - Copie o conteúdo de: `database/schema.sql`
   - Execute (Ctrl+Enter)

3. **Pronto!** ✨
   - Seu banco está completamente configurado
   - As políticas RLS estão corretas
   - Você pode começar a usar a aplicação

---

### ⚠️ Se já tem um projeto existente com erro 42501

1. **Aplique a migração de correção**
   - Abra SQL Editor no Supabase
   - Copie: `database/migrations/fix_user_creation_rls.sql`
   - Execute o script

2. **Teste o signup**
   - http://localhost:5173/register
   - Tente criar um novo usuário
   - Se funcionar, problema resolvido! ✅

---

## 📁 Estrutura de Arquivos

```
database/
├── schema.sql                           # ← Schema COMPLETO (use esse!)
├── QUICK_REFERENCE.md                   # Referência rápida
├── SETUP_DATABASE.md                    # Instruções detalhadas de setup
└── migrations/
    ├── confirm_user_email.sql           # Email confirmation trigger
    ├── fix_users_rls_policies.sql       # Migração anterior (deprecated)
    └── fix_user_creation_rls.sql        # ← USAR ESSA para corrigir erro 42501
```

---

## 🔑 Informações Essenciais

### URLs do Supabase
```
Projeto: Ecojardim & Pedras
Console: https://app.supabase.com
```

### Variáveis de Ambiente (Frontend)

No arquivo `.env.local`:
```env
VITE_SUPABASE_URL=seu_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_publica
```

⚠️ **Nunca compartilhe a chave privada (`service_role_key`)!**

---

## 🚨 Erro Comum: Code 42501

### Sintoma
```
Error: new row violates row-level security policy for table "users"
Code: 42501
```

### Causa
As políticas RLS estão bloqueando a inserção de usuários

### Solução Rápida
1. Abra Supabase Console
2. SQL Editor → New Query
3. Execute: `database/migrations/fix_user_creation_rls.sql`
4. Teste o signup novamente

### Solução Detalhada
Ver: `DATABASE_FIX_GUIDE.md`

---

## 📊 Tabelas do Banco

| Tabela | Descrição | RLS |
|--------|-----------|-----|
| `users` | Usuários do sistema | ✅ Ativado |
| `customers` | Dados detalhados dos clientes | ✅ Ativado |
| `products` | Catálogo de produtos | ✅ Ativado |
| `services` | Serviços oferecidos | ✅ Ativado |
| `orders` | Pedidos dos clientes | ✅ Ativado |
| `budgets` | Orçamentos/estimativas | ✅ Ativado |
| `carts` | Carrinhos de compras | ✅ Ativado |
| `activity_logs` | Log de atividades | ✅ Ativado |

---

## 🔒 Segurança - Row Level Security (RLS)

### O que é RLS?
Row Level Security garante que cada usuário só veja/modifique seus próprios dados.

### Exemplo de Política
```sql
-- Um usuário pode ver apenas seus próprios dados
CREATE POLICY "Users can view own data"
    ON users FOR SELECT
    USING (auth.uid() = auth_user_id);
```

### Políticas Atuais

#### Na tabela `users`
- ✅ Usuários podem criar conta (INSERT)
- ✅ Cada usuário vê apenas seus dados (SELECT)
- ✅ Cada usuário pode atualizar seus dados (UPDATE)
- ✅ Service role (backend) pode gerenciar (ALL)

#### Na tabela `orders`
- ✅ Usuários veem apenas seus pedidos (SELECT)
- ✅ Usuários podem criar pedidos (INSERT)
- ✅ Usuários podem atualizar pedidos pendentes (UPDATE)

#### Na tabela `products` e `services`
- ✅ Qualquer um pode visualizar (SELECT)
- ✅ Apenas autenticados podem gerenciar (INSERT/UPDATE/DELETE)

---

## 🧪 Testar o Banco

### Via Supabase Console

```sql
-- Ver todas as políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Ver usuários existentes
SELECT id, name, email, auth_user_id FROM users LIMIT 5;

-- Contar registros
SELECT COUNT(*) as total FROM users;

-- Ver estrutura da tabela
\d users;
```

### Via Aplicação

1. **Teste de Signup**
   ```
   URL: http://localhost:5173/register
   - Nome: Test User
   - Email: test@example.com
   - Senha: TestPassword123!
   ```

2. **Verifique o Console do Navegador**
   ```
   Procure por:
   [authService] User created in auth: ✓
   [authService] User created in public.users: ✓
   ```

3. **Verifique no Supabase**
   ```
   Dashboard → Packages → Authentication
   Você deve ver o novo usuário na aba "Users"
   ```

---

## 📚 Documentação Relacionada

| Arquivo | Descrição |
|---------|-----------|
| `DATABASE_FIX_GUIDE.md` | Guia completo para corrigir erro 42501 |
| `QUICK_REFERENCE.md` | Referência rápida do schema |
| `SETUP_DATABASE.md` | Setup detalhado passo a passo |
| `check-database.sh` | Script de diagnóstico |

---

## 🛠️ Operações Comuns

### Criar um novo usuário (via SQL)
```sql
INSERT INTO users (auth_user_id, name, email, role)
VALUES ('uuid-do-auth', 'John Doe', 'john@example.com', 'customer');
```

### Ver um usuário específico
```sql
SELECT * FROM users WHERE email = 'john@example.com';
```

### Resetar RLS (CUIDADO!)
```sql
-- Desativar RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Reativar
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

### Fazer backup das políticas
```sql
SELECT * FROM pg_policies WHERE tablename = 'users';
-- Copie as políticas para segurança
```

---

## ⚙️ Configuração de Email (Confirmação)

Para habilitar confirmação de email:

1. **Supabase Console**
   - Authentication → Settings
   - Email confirmation → Enable

2. **Configurar Email Provider**
   - SMTP ou SendGrid (ver `EMAIL_MIGRATION_GUIDE.md`)

3. **Testar**
   - Registre-se
   - Você receberá um email de confirmação
   - Clique no link para confirmar

---

## 🔗 Links Úteis

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✨ Próximos Passos

- [ ] Executar schema.sql no banco novo OU aplicar fix_user_creation_rls.sql no existente
- [ ] Testar signup com novo usuário
- [ ] Configurar email confirmação (opcional)
- [ ] Implementar backend API para emails
- [ ] Configurar SMTP/SendGrid
- [ ] Fazer backup do banco

---

**Última Atualização:** 10 de Dezembro de 2025  
**Status:** ✅ Pronto para usar  
**Próximo:** Execute o schema.sql no Supabase Console
