-- Criar a tabela de pagamentos PIX
CREATE TABLE IF NOT EXISTS public.pagamentos_pix (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mercado_pago_id VARCHAR(255) UNIQUE NOT NULL,
    valor NUMERIC(10, 2) NOT NULL,
    nome_doador VARCHAR(255) NOT NULL,
    email_doador VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, approved, rejected, cancelled
    qr_code TEXT NOT NULL,
    qr_code_base64 TEXT,
    data_expiracao TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar o Realtime para a tabela pagamentos_pix de forma segura
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
          AND schemaname = 'public' 
          AND tablename = 'pagamentos_pix'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.pagamentos_pix;
    END IF;
END $$;

-- Criar a tabela de logs de pagamentos (Requisito 9)
CREATE TABLE IF NOT EXISTS public.logs_pagamentos_pix (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pagamento_id UUID REFERENCES public.pagamentos_pix(id) ON DELETE SET NULL,
    mercado_pago_id VARCHAR(255),
    acao VARCHAR(100) NOT NULL, -- criacao_cobranca, recebimento_webhook, confirmacao_pagamento, erro
    status_anterior VARCHAR(50),
    status_novo VARCHAR(50),
    detalhes JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para otimização de busca
CREATE INDEX IF NOT EXISTS idx_pagamentos_pix_mercado_pago_id ON public.pagamentos_pix(mercado_pago_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_pix_status ON public.pagamentos_pix(status);

-- Criar políticas RLS (Row Level Security)
-- Permitimos que qualquer usuário no frontend possa ler a tabela pagamentos_pix para verificar se o pagamento foi confirmado
ALTER TABLE public.pagamentos_pix ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública de pagamentos" ON public.pagamentos_pix
    FOR SELECT
    USING (true);

--logs_pagamentos_pix será restrito apenas para uso do backend (chaves de serviço)
ALTER TABLE public.logs_pagamentos_pix ENABLE ROW LEVEL SECURITY;
-- Por padrão, sem políticas adicionais, apenas a role service_role tem acesso completo às tabelas com RLS ativo.
