import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from '../_utils/supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido. Use POST.' });
  }

  const { nome, sessionId } = req.body;

  if (!nome || typeof nome !== 'string' || nome.trim().length === 0) {
    return res.status(400).json({ message: 'Nome do doador é obrigatório.' });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();

    // 1. Busca na tabela de pagamentos por transações de Pix Estático aprovadas recentemente (últimos 3 minutos)
    // que ainda estejam com o nome padrão "Doador" ou "Doador Anonimo" e que não tenham uma sessão vinculada.
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000).toISOString();

    const { data: recentPayments, error: fetchError } = await supabaseAdmin
      .from('pagamentos_pix')
      .select('*')
      .eq('status', 'approved')
      .in('nome_doador', ['Doador', 'Doador Anonimo', 'Doador Anônimo'])
      .is('session_id', null)
      .gte('created_at', threeMinutesAgo)
      .order('created_at', { ascending: false }); // Pega o mais recente primeiro

    if (fetchError) {
      console.error('Erro ao buscar pagamentos recentes para conciliação:', fetchError.message);
      return res.status(500).json({ message: 'Erro ao conectar ao banco de dados.' });
    }

    if (!recentPayments || recentPayments.length === 0) {
      // Se não encontrou nenhuma transação recente pendente de conciliação
      return res.status(404).json({
        message: 'Ainda não identificamos o seu Pix de valor livre no sistema. Se você já pagou, aguarde cerca de 5 segundos e clique em "Confirmar no Telão" novamente.',
      });
    }

    // 2. Associa o pagamento mais recente encontrado ao nome do doador
    const targetPayment = recentPayments[0];

    const { data: updatedPayment, error: updateError } = await supabaseAdmin
      .from('pagamentos_pix')
      .update({
        nome_doador: nome.trim(),
        session_id: sessionId || 'confirmacao_assistida',
        updated_at: new Date().toISOString(),
      })
      .eq('id', targetPayment.id)
      .select()
      .single();

    if (updateError) {
      console.error('Erro ao atualizar nome do doador no pagamento:', updateError.message);
      return res.status(500).json({ message: 'Erro ao associar o seu nome ao pagamento.' });
    }

    // 3. Registra o log da conciliação (Requisito 9)
    await supabaseAdmin.from('logs_pagamentos_pix').insert({
      pagamento_id: targetPayment.id,
      mercado_pago_id: targetPayment.mercado_pago_id,
      acao: 'confirmacao_pagamento',
      status_anterior: 'approved',
      status_novo: 'approved',
      detalhes: {
        conciliado_manualmente: true,
        nome_original: targetPayment.nome_doador,
        nome_conciliado: nome.trim(),
        valor: targetPayment.valor,
        session_id: sessionId,
      },
    });

    // 4. Retorna com sucesso os dados do pagamento conciliado
    return res.status(200).json({
      id: updatedPayment.id,
      valor: updatedPayment.valor,
      nome_doador: updatedPayment.nome_doador,
      status: updatedPayment.status,
    });
  } catch (error: any) {
    console.error('Erro geral no endpoint confirm-payment:', error.message);
    return res.status(500).json({
      message: 'Ocorreu um erro ao processar a confirmação. Tente novamente.',
      error: error.message,
    });
  }
}
