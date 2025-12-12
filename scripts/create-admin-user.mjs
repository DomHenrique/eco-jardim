#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Erro: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não configurados em .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ADMIN_USER = {
  email: 'midias@hnperformancedigital.com.br',
  password: 'senhadeteste123',
  name: 'Admin Dev',
  role: 'admin'
};

async function createAdminUser() {
  try {
    console.log('🔐 Iniciando criação de usuário admin...\n');
    
    console.log(`📧 Criando usuário na Supabase Auth...`);
    console.log(`   Email: ${ADMIN_USER.email}`);
    console.log(`   Senha: ${ADMIN_USER.password}\n`);

    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email: ADMIN_USER.email,
      password: ADMIN_USER.password,
      options: {
        data: {
          name: ADMIN_USER.name,
        },
      },
    });

    if (authError) {
      console.error('❌ Erro ao criar usuário na Supabase Auth:', authError.message);
      
      if (authError.message.includes('already registered')) {
        console.log('⚠️  Usuário já existe. Tentando fazer login...\n');
        
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: ADMIN_USER.email,
          password: ADMIN_USER.password,
        });

        if (loginError) {
          console.error('❌ Erro ao fazer login:', loginError.message);
          process.exit(1);
        }

        if (loginData.user) {
          console.log('✅ Login bem-sucedido!');
          console.log(`   User ID: ${loginData.user.id}`);
          console.log(`   Email: ${loginData.user.email}`);
          console.log(`   Email confirmado: ${loginData.user.email_confirmed_at ? 'Sim ✅' : 'Não ❌'}\n`);

          await createOrUpdatePublicUser(loginData.user.id);
        }
      } else {
        process.exit(1);
      }
    } else {
      if (authUser.user) {
        console.log('✅ Usuário criado na Supabase Auth!');
        console.log(`   User ID: ${authUser.user.id}`);
        console.log(`   Email: ${authUser.user.email}`);
        console.log(`   Email confirmado: ${authUser.user.email_confirmed_at ? 'Sim ✅' : 'Não ❌'}\n`);

        await createOrUpdatePublicUser(authUser.user.id);
      }
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    process.exit(1);
  }
}

async function createOrUpdatePublicUser(authUserId) {
  try {
    console.log('📝 Criando usuário em public.users...\n');

    const { data, error } = await supabase
      .from('users')
      .upsert({
        email: ADMIN_USER.email,
        name: ADMIN_USER.name,
        role: ADMIN_USER.role,
        auth_user_id: authUserId,
      }, {
        onConflict: 'email',
      })
      .select();

    if (error) {
      console.error('❌ Erro ao criar usuário em public.users:', error.message);
      process.exit(1);
    }

    if (data && data.length > 0) {
      const user = data[0];
      console.log('✅ Usuário criado em public.users!');
      console.log(`   ID: ${user.id}`);
      console.log(`   Nome: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Auth User ID: ${user.auth_user_id}\n`);

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✨ USUÁRIO ADMIN CRIADO COM SUCESSO!\n');
      console.log('📋 Credenciais:');
      console.log(`   Email: ${ADMIN_USER.email}`);
      console.log(`   Senha: ${ADMIN_USER.password}`);
      console.log(`   Role: ${ADMIN_USER.role}\n`);
      console.log('🔗 Acessar em:');
      console.log('   http://localhost:3002/login\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

  } catch (error) {
    console.error('❌ Erro ao criar usuário em public.users:', error);
    process.exit(1);
  }
}

createAdminUser();
