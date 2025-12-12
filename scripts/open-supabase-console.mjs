#!/usr/bin/env node

/**
 * Script alternativo para confirmar email
 * Acessa o Supabase Console manualmente
 */

import open from 'open';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;

async function openSupabaseConsole() {
  try {
    console.log('🌐 Abrindo Supabase Console...\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ INSTRUÇÕES PARA CONFIRMAR EMAIL\n');
    console.log('1️⃣  O Supabase Console será aberto no navegador');
    console.log('2️⃣  Vá para: Authentication → Users');
    console.log('3️⃣  Procure: midias@hnperformancedigital.com.br');
    console.log('4️⃣  Clique no usuário e confirme o email');
    console.log('5️⃣  Volte aqui e pressione ENTER\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Tentar abrir o console
    if (SUPABASE_URL) {
      const projectRef = SUPABASE_URL.split('//')[1].split('.')[0];
      const supabaseUrl = `https://app.supabase.com/project/${projectRef}/auth/users`;
      
      console.log(`🔗 URL: ${supabaseUrl}\n`);
      
      try {
        await open(supabaseUrl);
        console.log('✅ Console aberto no navegador\n');
      } catch (e) {
        console.log('⚠️  Não foi possível abrir o navegador automaticamente');
        console.log(`   Acesse manualmente: ${supabaseUrl}\n`);
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

openSupabaseConsole();
