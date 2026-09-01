-- Migração Completa: 2º Torneio de Truco - ExpoGoiabal 2026
-- Inclui Equipes, Jogadores, Status do Torneio, Rodadas da 1ª Fase e Mata-Mata Completo

-- 1. Tabela de Equipes do Torneio de Truco
CREATE TABLE IF NOT EXISTS public.truco_equipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    cidade VARCHAR(255) NOT NULL,
    foto_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Jogadores das Equipes (4 titulares + reservas)
CREATE TABLE IF NOT EXISTS public.truco_jogadores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipe_id UUID REFERENCES public.truco_equipes(id) ON DELETE CASCADE,
    nome_completo VARCHAR(255) NOT NULL,
    cpf VARCHAR(20) NOT NULL,
    data_nascimento VARCHAR(20),
    is_titular BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Status e Configuração Geral do Torneio
CREATE TABLE IF NOT EXISTS public.truco_torneio_status (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'main',
    fase_atual VARCHAR(50) DEFAULT 'inscricao', -- 'inscricao', 'primeira_fase', 'primeira_fase_encerrada', 'mata_mata', 'finalizado'
    sorteio_primeira_fase_confirmado BOOLEAN DEFAULT FALSE,
    sorteio_mata_mata_confirmado BOOLEAN DEFAULT FALSE,
    top8_equipes_ids JSONB DEFAULT '[]'::jsonb,
    grupo_a_equipes_ids JSONB DEFAULT '[]'::jsonb,
    grupo_b_equipes_ids JSONB DEFAULT '[]'::jsonb,
    campeao_equipe_id UUID REFERENCES public.truco_equipes(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Partidas / Confrontos
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

-- Índices para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_truco_jogadores_equipe_id ON public.truco_jogadores(equipe_id);
CREATE INDEX IF NOT EXISTS idx_truco_partidas_tipo_fase ON public.truco_partidas(tipo_fase);
CREATE INDEX IF NOT EXISTS idx_truco_partidas_rodada ON public.truco_partidas(rodada);
CREATE INDEX IF NOT EXISTS idx_truco_partidas_status ON public.truco_partidas(status);

-- Habilitar RLS
ALTER TABLE public.truco_equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.truco_jogadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.truco_torneio_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.truco_partidas ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso Público para o Torneio
CREATE POLICY "Permitir leitura pública de equipes do truco" ON public.truco_equipes FOR SELECT USING (true);
CREATE POLICY "Permitir inserção pública de equipes do truco" ON public.truco_equipes FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização pública de equipes do truco" ON public.truco_equipes FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão pública de equipes do truco" ON public.truco_equipes FOR DELETE USING (true);

CREATE POLICY "Permitir leitura pública de jogadores do truco" ON public.truco_jogadores FOR SELECT USING (true);
CREATE POLICY "Permitir inserção pública de jogadores do truco" ON public.truco_jogadores FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir exclusão pública de jogadores do truco" ON public.truco_jogadores FOR DELETE USING (true);

CREATE POLICY "Permitir leitura pública de status do torneio" ON public.truco_torneio_status FOR SELECT USING (true);
CREATE POLICY "Permitir inserção/atualização de status do torneio" ON public.truco_torneio_status FOR ALL USING (true);

CREATE POLICY "Permitir leitura pública de partidas do truco" ON public.truco_partidas FOR SELECT USING (true);
CREATE POLICY "Permitir inserção pública de partidas do truco" ON public.truco_partidas FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização pública de partidas do truco" ON public.truco_partidas FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão pública de partidas do truco" ON public.truco_partidas FOR DELETE USING (true);

-- Habilitar Realtime
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
