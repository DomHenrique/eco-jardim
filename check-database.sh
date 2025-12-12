#!/bin/bash

# ========================================
# Database Configuration Diagnostic Tool
# ========================================
# This script helps diagnose and fix database configuration issues

echo "🔍 Ecojardim & Pedras - Database Diagnostic Tool"
echo "=================================================="
echo ""

echo "📋 Checklist de Configuração do Banco de Dados:"
echo ""

echo "1️⃣  RLS (Row Level Security) Status"
echo "   ├─ Abra: https://app.supabase.com"
echo "   ├─ Projeto: Ecojardim & Pedras"
echo "   ├─ Vá para: Authentication → Policies"
echo "   └─ Verifique a tabela 'users' - deve ter políticas RLS"
echo ""

echo "2️⃣  Políticas na Tabela 'users'"
echo "   ├─ Você deve ver essas políticas:"
echo "   │  ✓ Allow authenticated user creation (INSERT)"
echo "   │  ✓ Users can view own data (SELECT)"
echo "   │  ✓ Users can update own data (UPDATE)"
echo "   │  ✓ Service role can manage users (ALL)"
echo "   └─ Se faltam, execute o script de correção"
echo ""

echo "3️⃣  Estrutura da Coluna auth_user_id"
echo "   ├─ Campo na tabela: auth_user_id (UUID)"
echo "   ├─ Deve referenciar: auth.users(id)"
echo "   └─ Verá na tabela: Database → Tables → users → Columns"
echo ""

echo "4️⃣  Teste de Signup"
echo "   ├─ Abra: http://localhost:5173/register"
echo "   ├─ Teste criar um usuário com:"
echo "   │  - Nome: John Doe"
echo "   │  - Email: john@example.com"
echo "   │  - Senha: Test@1234"
echo "   └─ Monitore o console para erros"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔧 PROBLEMAS COMUNS E SOLUÇÕES:"
echo ""

echo "❌ Erro: 'new row violates row-level security policy'"
echo "   └─ Solução: Execute database/migrations/fix_user_creation_rls.sql"
echo ""

echo "❌ Erro: 'relation \"auth.users\" does not exist'"
echo "   └─ Solução: RLS está ativado mas auth.users não está disponível"
echo "      → Verifique se Supabase Auth está ativado no projeto"
echo ""

echo "❌ Erro: 'column \"auth_user_id\" does not exist'"
echo "   └─ Solução: Atualize schema.sql com a coluna auth_user_id"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📝 PASSOS PARA CORRIGIR:"
echo ""
echo "1. Abra Supabase Console"
echo "   → https://app.supabase.com"
echo ""

echo "2. Selecione seu projeto"
echo "   → Ecojardim & Pedras"
echo ""

echo "3. Vá para SQL Editor"
echo "   → Menu lateral → SQL Editor"
echo "   → Clique em 'New Query'"
echo ""

echo "4. Copie e execute o script SQL"
echo "   → Arquivo: database/migrations/fix_user_creation_rls.sql"
echo "   → Cole no editor"
echo "   → Pressione Ctrl+Enter ou clique 'Run'"
echo ""

echo "5. Teste o signup novamente"
echo "   → http://localhost:5173/register"
echo "   → Tente criar um novo usuário"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📊 VERIFICAR STATUS DO BANCO:"
echo ""
echo "Execute no SQL Editor do Supabase:"
echo ""
echo "-- Ver todas as políticas da tabela users"
echo "SELECT * FROM pg_policies WHERE tablename = 'users';"
echo ""
echo "-- Ver usuários existentes"
echo "SELECT id, name, email, auth_user_id FROM users LIMIT 10;"
echo ""
echo "-- Ver estatísticas"
echo "SELECT COUNT(*) as total_users FROM users;"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "✨ ARQUIVOS DISPONÍVEIS:"
echo ""
echo "📄 DATABASE_FIX_GUIDE.md"
echo "   └─ Guia completo em Markdown com todas as instruções"
echo ""
echo "🔧 database/migrations/fix_user_creation_rls.sql"
echo "   └─ Script SQL para corrigir o problema"
echo ""
echo "📋 database/schema.sql"
echo "   └─ Schema completo do banco (referência)"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Pronto! Siga as instruções acima para corrigir o banco."
echo ""
