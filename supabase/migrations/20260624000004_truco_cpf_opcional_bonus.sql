-- Migração: CPF Opcional e Elegibilidade ao Bônus da Premiação
-- 2º Torneio de Truco - ExpoGoiabal 2026

-- 1. Coluna de regularização para premiação/bônus na tabela truco_equipes
ALTER TABLE IF EXISTS public.truco_equipes 
ADD COLUMN IF NOT EXISTS cadastro_regularizado BOOLEAN NOT NULL DEFAULT TRUE;

-- 2. Permitir que o CPF dos jogadores seja opcional (remover restrição NOT NULL)
ALTER TABLE IF EXISTS public.truco_jogadores 
ALTER COLUMN cpf DROP NOT NULL;

ALTER TABLE IF EXISTS public.truco_jogadores 
ALTER COLUMN cpf SET DEFAULT '';
