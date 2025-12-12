-- Script SQL para confirmar email do usuário admin no Supabase
-- Execute isto no SQL Editor do Supabase Console

-- Confirmar email do usuário admin
UPDATE auth.users
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email = 'midias@hnperformancedigital.com.br';

-- Verificar se foi confirmado
SELECT id, email, email_confirmed_at, confirmed_at 
FROM auth.users 
WHERE email = 'midias@hnperformancedigital.com.br';
