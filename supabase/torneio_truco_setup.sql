-- ==============================================================================
-- MIGRAÇÃO COMPLETA E DEFINITIVA: 2º TORNEIO DE TRUCO - EXPOGOIABAL 2026
-- Execute este script no SQL Editor do seu painel Supabase (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. TABELA DE EQUIPES
CREATE TABLE IF NOT EXISTS public.truco_equipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    cidade VARCHAR(255) NOT NULL,
    foto_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pendente', -- 'pendente', 'aprovado', 'reprovado'
    cadastro_regularizado BOOLEAN NOT NULL DEFAULT TRUE, -- TRUE = elegível ao bônus de premiação, FALSE = sem CPF / inelegível ao bônus
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garantir colunas caso a tabela já tenha sido criada anteriormente
ALTER TABLE IF EXISTS public.truco_equipes 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'pendente';

ALTER TABLE IF EXISTS public.truco_equipes 
ADD COLUMN IF NOT EXISTS cadastro_regularizado BOOLEAN NOT NULL DEFAULT TRUE;

-- 2. TABELA DE JOGADORES (4 Titulares + Reservas)
CREATE TABLE IF NOT EXISTS public.truco_jogadores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipe_id UUID REFERENCES public.truco_equipes(id) ON DELETE CASCADE,
    nome_completo VARCHAR(255) NOT NULL,
    cpf VARCHAR(20) DEFAULT '',
    data_nascimento VARCHAR(20),
    is_titular BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE IF EXISTS public.truco_jogadores 
ALTER COLUMN cpf DROP NOT NULL;

ALTER TABLE IF EXISTS public.truco_jogadores 
ALTER COLUMN cpf SET DEFAULT '';

-- 3. TABELA DE STATUS GERAL DO TORNEIO (Inscrição, Sorteio, Grupos, Mata-mata)
CREATE TABLE IF NOT EXISTS public.truco_torneio_status (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'main',
    fase_atual VARCHAR(50) DEFAULT 'inscricao', -- 'inscricao', 'primeira_fase', 'primeira_fase_encerrada', 'mata_mata', 'finalizado'
    sorteio_primeira_fase_confirmado BOOLEAN DEFAULT FALSE,
    sorteio_mata_mata_confirmado BOOLEAN DEFAULT FALSE,
    sorteio_iniciado_em TIMESTAMPTZ,
    sorteio_animacao_ativa BOOLEAN DEFAULT FALSE,
    top8_equipes_ids JSONB DEFAULT '[]'::jsonb,
    grupo_a_equipes_ids JSONB DEFAULT '[]'::jsonb,
    grupo_b_equipes_ids JSONB DEFAULT '[]'::jsonb,
    campeao_equipe_id UUID REFERENCES public.truco_equipes(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir registro padrão se não existir
INSERT INTO public.truco_torneio_status (id, fase_atual)
VALUES ('main', 'inscricao')
ON CONFLICT (id) DO NOTHING;

-- 4. TABELA DE PARTIDAS E CONFRONTOS
CREATE TABLE IF NOT EXISTS public.truco_partidas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_fase VARCHAR(50) NOT NULL DEFAULT 'primeira_fase', -- 'primeira_fase', 'semi_a1', 'semi_a2', 'semi_b1', 'semi_b2', 'final_a', 'final_b', 'grande_final'
    rodada INTEGER DEFAULT 1,
    numero_jogo INTEGER DEFAULT 1,
    time_a_id UUID REFERENCES public.truco_equipes(id) ON DELETE SET NULL,
    time_b_id UUID REFERENCES public.truco_equipes(id) ON DELETE SET NULL,
    pontos_time_a INTEGER DEFAULT 0,
    pontos_time_b INTEGER DEFAULT 0,
    vencedor_id UUID REFERENCES public.truco_equipes(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'agendada', -- 'agendada', 'em_andamento', 'finalizada'
    fase_nome VARCHAR(100) DEFAULT 'Primeira Fase',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_truco_jogadores_equipe_id ON public.truco_jogadores(equipe_id);
CREATE INDEX IF NOT EXISTS idx_truco_partidas_tipo_fase ON public.truco_partidas(tipo_fase);
CREATE INDEX IF NOT EXISTS idx_truco_partidas_rodada ON public.truco_partidas(rodada);
CREATE INDEX IF NOT EXISTS idx_truco_partidas_status ON public.truco_partidas(status);

-- 6. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.truco_equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.truco_jogadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.truco_torneio_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.truco_partidas ENABLE ROW LEVEL SECURITY;

-- 7. POLÍTICAS DE ACESSO (RLS) - Permite leitura e escrita públicas para o aplicativo
DO $$ 
BEGIN
    -- truco_equipes
    DROP POLICY IF EXISTS "Permitir leitura pública de equipes do truco" ON public.truco_equipes;
    DROP POLICY IF EXISTS "Permitir inserção pública de equipes do truco" ON public.truco_equipes;
    DROP POLICY IF EXISTS "Permitir atualização pública de equipes do truco" ON public.truco_equipes;
    DROP POLICY IF EXISTS "Permitir exclusão pública de equipes do truco" ON public.truco_equipes;

    CREATE POLICY "Permitir leitura pública de equipes do truco" ON public.truco_equipes FOR SELECT USING (true);
    CREATE POLICY "Permitir inserção pública de equipes do truco" ON public.truco_equipes FOR INSERT WITH CHECK (true);
    CREATE POLICY "Permitir atualização pública de equipes do truco" ON public.truco_equipes FOR UPDATE USING (true);
    CREATE POLICY "Permitir exclusão pública de equipes do truco" ON public.truco_equipes FOR DELETE USING (true);

    -- truco_jogadores
    DROP POLICY IF EXISTS "Permitir leitura pública de jogadores do truco" ON public.truco_jogadores;
    DROP POLICY IF EXISTS "Permitir inserção pública de jogadores do truco" ON public.truco_jogadores;
    DROP POLICY IF EXISTS "Permitir atualização pública de jogadores do truco" ON public.truco_jogadores;
    DROP POLICY IF EXISTS "Permitir exclusão pública de jogadores do truco" ON public.truco_jogadores;

    CREATE POLICY "Permitir leitura pública de jogadores do truco" ON public.truco_jogadores FOR SELECT USING (true);
    CREATE POLICY "Permitir inserção pública de jogadores do truco" ON public.truco_jogadores FOR INSERT WITH CHECK (true);
    CREATE POLICY "Permitir atualização pública de jogadores do truco" ON public.truco_jogadores FOR UPDATE USING (true);
    CREATE POLICY "Permitir exclusão pública de jogadores do truco" ON public.truco_jogadores FOR DELETE USING (true);

    -- truco_torneio_status
    DROP POLICY IF EXISTS "Permitir leitura pública de status do torneio" ON public.truco_torneio_status;
    DROP POLICY IF EXISTS "Permitir inserção/atualização de status do torneio" ON public.truco_torneio_status;

    CREATE POLICY "Permitir leitura pública de status do torneio" ON public.truco_torneio_status FOR SELECT USING (true);
    CREATE POLICY "Permitir inserção/atualização de status do torneio" ON public.truco_torneio_status FOR ALL USING (true);

    -- truco_partidas
    DROP POLICY IF EXISTS "Permitir leitura pública de partidas do truco" ON public.truco_partidas;
    DROP POLICY IF EXISTS "Permitir inserção pública de partidas do truco" ON public.truco_partidas;
    DROP POLICY IF EXISTS "Permitir atualização pública de partidas do truco" ON public.truco_partidas;
    DROP POLICY IF EXISTS "Permitir exclusão pública de partidas do truco" ON public.truco_partidas;

    CREATE POLICY "Permitir leitura pública de partidas do truco" ON public.truco_partidas FOR SELECT USING (true);
    CREATE POLICY "Permitir inserção pública de partidas do truco" ON public.truco_partidas FOR INSERT WITH CHECK (true);
    CREATE POLICY "Permitir atualização pública de partidas do truco" ON public.truco_partidas FOR UPDATE USING (true);
    CREATE POLICY "Permitir exclusão pública de partidas do truco" ON public.truco_partidas FOR DELETE USING (true);
END $$;

-- 8. HABILITAR REALTIME (Para sincronização em tempo real das tabelas)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'truco_equipes') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.truco_equipes;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'truco_jogadores') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.truco_jogadores;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'truco_torneio_status') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.truco_torneio_status;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'truco_partidas') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.truco_partidas;
    END IF;
END $$;

-- 9. CONFIGURAR STORAGE BUCKET 'expogoiabal' (Público para fotos dos times)
INSERT INTO storage.buckets (id, name, public)
VALUES ('expogoiabal', 'expogoiabal', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de Storage para o bucket expogoiabal
DO $$
BEGIN
    DROP POLICY IF EXISTS "Acesso público aos arquivos da expogoiabal" ON storage.objects;
    DROP POLICY IF EXISTS "Permitir upload público no bucket expogoiabal" ON storage.objects;
    DROP POLICY IF EXISTS "Permitir update público no bucket expogoiabal" ON storage.objects;

    CREATE POLICY "Acesso público aos arquivos da expogoiabal" ON storage.objects
        FOR SELECT USING (bucket_id = 'expogoiabal');

    CREATE POLICY "Permitir upload público no bucket expogoiabal" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'expogoiabal');

    CREATE POLICY "Permitir update público no bucket expogoiabal" ON storage.objects
        FOR UPDATE USING (bucket_id = 'expogoiabal');
END $$;
