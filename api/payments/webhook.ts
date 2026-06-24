import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPaymentStatus, validateWebhookSignature } from '../_utils/mercadoPago.js';
import { getSupabaseAdmin } from '../_utils/supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // O Mercado Pago pode enviar webhooks de teste ou pings, então respondemos 200 sempre o mais rápido possível
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido. Use POST.' });
  }

  // 1. Registrar logs do recebimento do webhook (Requisito 9)
  console.log('Webhook do Mercado Pago recebido. Body:', JSON.stringify(req.body));
  console.log('Webhook Headers:', JSON.stringify(req.headers));

  const xSignature = req.headers['x-signature'] as string;
  const xRequestId = req.headers['x-request-id'] as string;

  // Tenta extrair o ID do pagamento de várias formas para garantir compatibilidade
  // O formato oficial moderno envia no body: { type: 'payment', data: { id: '123456789' } }
  // O formato legado pode enviar { topic: 'payment', id: 123456789 }
  // Ou via query params.
  let mpPaymentId: string | null = null;
  let isPaymentEvent = false;

  const body = req.body || {};
  const query = req.query || {};

  if (body.type === 'payment' && body.data?.id) {
    mpPaymentId = String(body.data.id);
    isPaymentEvent = true;
  } else if (body.topic === 'payment' && body.id) {
    mpPaymentId = String(body.id);
    isPaymentEvent = true;
  } else if (query.topic === 'payment' && query.id) {
    mpPaymentId = String(query.id);
    isPaymentEvent = true;
  } else if (body.resource) {
    // Ex: https://api.mercadolibre.com/v1/payments/123456789
    const match = body.resource.match(/\/payments\/(\d+)/);
    if (match && match[1]) {
      mpPaymentId = match[1];
      isPaymentEvent = true;
    }
  }

  // Se não for um evento relacionado a pagamentos ou não contiver ID, retornamos 200 OK para o Mercado Pago não reenviar
  if (!isPaymentEvent || !mpPaymentId) {
    console.log('Webhook ignorado: não é um evento de pagamento válido.');
    return res.status(200).json({ message: 'Webhook recebido, mas ignorado por não ser de pagamento.' });
  }

  // 2. Validar autenticidade da notificação (Requisito 6)
  if (xSignature) {
    const isSignatureValid = validateWebhookSignature({
      xSignature,
      xRequestId,
      dataId: mpPaymentId,
    });

    if (!isSignatureValid) {
      console.warn(`Alerta de Segurança: Assinatura inválida para o pagamento ${mpPaymentId}`);
      // Registra o log de erro de autenticação no banco
      await getSupabaseAdmin().from('logs_pagamentos_pix').insert({
        mercado_pago_id: mpPaymentId,
        acao: 'erro',
        detalhes: {
          mensagem: 'Assinatura digital do webhook inválida.',
          headers: req.headers,
        },
      });

      return res.status(401).json({ message: 'Assinatura inválida.' });
    }
  } else {
    console.log('Aviso: Webhook recebido sem cabeçalho x-signature. A autenticidade será validada via consulta direta.');
  }

  // Criamos uma variável para registrar logs vinculados ao pagamento local se encontrarmos
  let dbPaymentId: string | null = null;
  let currentStatus = 'unknown';

  try {
    // 3. Consultar no Supabase se esse pagamento já existe localmente
    const { data: localPayment, error: findError } = await getSupabaseAdmin()
      .from('pagamentos_pix')
      .select('id, status')
      .eq('mercado_pago_id', mpPaymentId)
      .maybeSingle();

    if (findError) {
      console.error('Erro ao buscar pagamento localmente:', findError.message);
    }

    if (localPayment) {
      dbPaymentId = localPayment.id;
      currentStatus = localPayment.status;
    }

    // Grava o log de recebimento de webhook no banco (Requisito 9)
    await getSupabaseAdmin().from('logs_pagamentos_pix').insert({
      pagamento_id: dbPaymentId,
      mercado_pago_id: mpPaymentId,
      acao: 'recebimento_webhook',
      status_anterior: currentStatus,
      detalhes: {
        body,
        query,
      },
    });

    // 4. Garantir que notificações duplicadas não processem se o pagamento já estiver 'approved' (Requisito 10)
    if (currentStatus === 'approved') {
      console.log(`Pagamento ${mpPaymentId} já foi processado anteriormente como aprovado. Ignorando.`);
      return res.status(200).json({ message: 'Pagamento já processado anteriormente.' });
    }

    // 5. Consultar a API do Mercado Pago para obter o status real atualizado (Requisito 7)
    // Isso é o que garante a autenticidade se a assinatura não puder ser validada ou para redundância
    const realPayment = await getPaymentStatus(mpPaymentId);
    console.log(`Status real do pagamento ${mpPaymentId} no Mercado Pago:`, realPayment.status);

    // Se o status local e o status real forem iguais e não for aprovado, não precisamos fazer nada
    if (currentStatus === realPayment.status && realPayment.status !== 'approved') {
      return res.status(200).json({ message: 'Status atualizado, nenhuma ação necessária.' });
    }

    // 6. Atualizar ou Criar automaticamente o status do pagamento no banco de dados (Requisito 8)
    if (realPayment.status === 'approved') {
      let finalPaymentId = dbPaymentId;
      const nomeDoador = realPayment.payerName || 'Apoiador Anônimo';
      const emailDoador = realPayment.payerEmail || 'doador@expogoiabal.com.br';
      const valorDoador = realPayment.amount;

      if (!dbPaymentId) {
        // Se o pagamento não existia localmente, significa que foi feito lendo o QR Code estático diretamente
        // no app do banco (PIX de valor livre). Registramos a nova doação no banco.
        const { data: insertedPayment, error: insertError } = await getSupabaseAdmin()
          .from('pagamentos_pix')
          .insert({
            mercado_pago_id: mpPaymentId,
            valor: valorDoador,
            nome_doador: nomeDoador,
            email_doador: emailDoador,
            status: 'approved',
            qr_code: 'PIX Estático',
            data_expiracao: new Date().toISOString()
          })
          .select('id')
          .single();

        if (insertError) {
          throw new Error(`Erro ao registrar nova doação via PIX Estático: ${insertError.message}`);
        }

        finalPaymentId = insertedPayment.id;
      } else {
        // Se já existia (PIX Dinâmico), apenas atualizamos para approved
        const { error: updateError } = await getSupabaseAdmin()
          .from('pagamentos_pix')
          .update({
            status: 'approved',
            updated_at: new Date().toISOString(),
          })
          .eq('id', dbPaymentId);

        if (updateError) {
          throw new Error(`Erro ao atualizar status do pagamento no banco: ${updateError.message}`);
        }
      }

      // Registramos o log de confirmação (Requisito 9)
      await getSupabaseAdmin().from('logs_pagamentos_pix').insert({
        pagamento_id: finalPaymentId,
        mercado_pago_id: mpPaymentId,
        acao: 'confirmacao_pagamento',
        status_anterior: currentStatus,
        status_novo: 'approved',
        detalhes: {
          valor: valorDoador,
          nome_doador: nomeDoador,
          metodo: 'pix',
          origem: dbPaymentId ? 'pix_dinamico' : 'pix_estatico'
        },
      });

      console.log(`Sucesso: Pagamento ${mpPaymentId} do doador ${nomeDoador} no valor de R$ ${valorDoador} foi CONFIRMADO com sucesso!`);
    } else {
      // Outros status como rejected, cancelled, etc.
      if (dbPaymentId) {
        await getSupabaseAdmin()
          .from('pagamentos_pix')
          .update({
            status: realPayment.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', dbPaymentId);
      }

      await getSupabaseAdmin().from('logs_pagamentos_pix').insert({
        pagamento_id: dbPaymentId,
        mercado_pago_id: mpPaymentId,
        acao: 'atualizacao_status',
        status_anterior: currentStatus,
        status_novo: realPayment.status,
        detalhes: {
          status_real: realPayment.status,
        },
      });
    }

    return res.status(200).json({
      message: 'Webhook processado com sucesso.',
      status: realPayment.status,
    });
  } catch (error: any) {
    console.error('Erro ao processar webhook:', error.message);

    // Registra o log do erro de webhook no banco (Requisito 9)
    try {
      await getSupabaseAdmin().from('logs_pagamentos_pix').insert({
        pagamento_id: dbPaymentId,
        mercado_pago_id: mpPaymentId,
        acao: 'erro',
        status_anterior: currentStatus,
        detalhes: {
          mensagem: error.message,
          stack: error.stack,
          fase: 'processamento_webhook',
        },
      });
    } catch (logError) {
      console.error('Não foi possível gravar o log de erro no Supabase:', logError);
    }

    // Retorna erro para que o Mercado Pago reenvie a notificação posteriormente (Requisito 11 - Tentativas de reprocessamento)
    // O Mercado Pago tenta reprocessar notificações se retornamos um código de erro HTTP (ex: 500)
    return res.status(500).json({
      message: 'Erro interno ao processar notificação do webhook. Mercado Pago tentará reprocessar.',
      error: error.message,
    });
  }
}
