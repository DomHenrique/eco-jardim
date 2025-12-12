#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error('❌ Erro: VITE_SUPABASE_URL não configurado em .env.local');
  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Erro: SUPABASE_SERVICE_ROLE_KEY não configurado em .env.local');
  console.error('   Para usar a API Admin do Supabase, você precisa da Service Role Key.');
  console.error('   Vá para: https://app.supabase.com → Settings → API → Service Role Secret');
  console.error('   Adicione à .env.local: SUPABASE_SERVICE_ROLE_KEY=sua_chave_aqui');
  process.exit(1);
}

// Usar Service Role Key para ter acesso admin
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const ADMIN_EMAIL = 'midias@hnperformancedigital.com.br';

async function confirmAdminEmail() {
  try {
    console.log('🔐 Confirmando email do usuário admin...\n');
    
    // Buscar usuário
    const { data: users, error: getUserError } = await supabaseAdmin.auth.admin.listUsers();

    if (getUserError) {
      console.error('❌ Erro ao buscar usuários:', getUserError.message);
      process.exit(1);
    }

    const adminUser = users?.users?.find(u => u.email === ADMIN_EMAIL);

    if (!adminUser) {
      console.error(`❌ Usuário ${ADMIN_EMAIL} não encontrado`);
      process.exit(1);
    }

    console.log(`📧 Usuário encontrado: ${adminUser.email}`);
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Email confirmado: ${adminUser.email_confirmed_at ? 'Sim ✅' : 'Não ❌'}\n`);

    // Atualizar usuário para confirmar email
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      adminUser.id,
      {
        email_confirm: true, // Confirma o email
      }
    );

    if (updateError) {
      console.error('❌ Erro ao confirmar email:', updateError.message);
      process.exit(1);
    }

    console.log('✅ Email confirmado com sucesso!');
    console.log(`   ID: ${updatedUser.user.id}`);
    console.log(`   Email: ${updatedUser.user.email}`);
    console.log(`   Email confirmado: ${updatedUser.user.email_confirmed_at ? 'Sim ✅' : 'Não ❌'}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ USUÁRIO ADMIN CONFIRMADO!\n');
    console.log('📋 Credenciais:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Senha: senhadeteste123`);
    console.log(`   Role: admin\n`);
    console.log('🔗 Acessar em:');
    console.log('   http://localhost:3002/login\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    process.exit(1);
  }
}

confirmAdminEmail();
