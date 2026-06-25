-- Criar a tabela de cantores
CREATE TABLE IF NOT EXISTS public.cantores (
    slug VARCHAR(255) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    subtitulo VARCHAR(255),
    chave_pix VARCHAR(255) NOT NULL,
    qr_code_url VARCHAR(255),
    tema_cor_primaria VARCHAR(50) DEFAULT 'yellow', -- Ex: yellow, emerald, etc.
    tema_cor_secundaria VARCHAR(50) DEFAULT 'emerald',
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar RLS na tabela cantores
ALTER TABLE public.cantores ENABLE ROW LEVEL SECURITY;

-- Remover política se já existir para evitar erros
DROP POLICY IF EXISTS "Permitir leitura pública de cantores" ON public.cantores;

CREATE POLICY "Permitir leitura pública de cantores" ON public.cantores
    FOR SELECT
    USING (true);

-- Adicionar coluna cantor_slug na tabela pagamentos_pix referenciando a tabela cantores
ALTER TABLE public.pagamentos_pix 
ADD COLUMN IF NOT EXISTS cantor_slug VARCHAR(255) REFERENCES public.cantores(slug) ON DELETE SET NULL;

-- Criar índice para o cantor_slug
CREATE INDEX IF NOT EXISTS idx_pagamentos_pix_cantor_slug ON public.pagamentos_pix(cantor_slug);

-- Inserir o cantor inicial Nilson Garcia para manter a compatibilidade
INSERT INTO public.cantores (slug, nome, subtitulo, chave_pix, qr_code_url, tema_cor_primaria, tema_cor_secundaria)
VALUES (
    'NilsonGarcia',
    'Nilson Garcia',
    'O Show da Copa na ExpoGoiabal',
    '31 9 8231-1929',
    '/QR.png',
    'yellow',
    'emerald'
)
ON CONFLICT (slug) DO UPDATE 
SET nome = EXCLUDED.nome,
    subtitulo = EXCLUDED.subtitulo,
    chave_pix = EXCLUDED.chave_pix,
    qr_code_url = EXCLUDED.qr_code_url;

-- Migrar pagamentos antigos sem cantor para pertencerem a Nilson Garcia
UPDATE public.pagamentos_pix SET cantor_slug = 'NilsonGarcia' WHERE cantor_slug IS NULL;
