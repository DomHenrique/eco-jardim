-- Confirmar email de um usuário específico
-- Substitua 'email@exemplo.com' pelo email do usuário

UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'henrique.ferreira.carvalho@gmail.com';

-- Ou confirmar todos os emails não confirmados (útil para desenvolvimento)
-- UPDATE auth.users
-- SET email_confirmed_at = NOW()
-- WHERE email_confirmed_at IS NULL;
