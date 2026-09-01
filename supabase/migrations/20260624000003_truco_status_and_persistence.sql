-- Migração de Persistência Obrigatória: 2º Torneio de Truco
-- Garante que todas as colunas de status, moderação, sorteio e mata-mata estejam no banco de dados

-- 1. Coluna status na tabela truco_equipes
ALTER TABLE IF EXISTS public.truco_equipes 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'pendente';

-- 2. Colunas de controle de animação e início do sorteio em truco_torneio_status
ALTER TABLE IF EXISTS public.truco_torneio_status 
ADD COLUMN IF NOT EXISTS sorteio_iniciado_em TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sorteio_animacao_ativa BOOLEAN DEFAULT FALSE;

-- 3. Garantir Políticas de Acesso RLS completas
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
