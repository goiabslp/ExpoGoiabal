import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createPixPayment } from '../_utils/mercadoPago';
import { supabaseAdmin } from '../_utils/supabase';
import crypto from 'crypto';

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

  const { nome, email, valor } = req.body;

  // Validações básicas
  if (!nome || typeof nome !== 'string' || nome.trim().length === 0) {
    return res.status(400).json({ message: 'Nome do doador é obrigatório.' });
  }

  const numericValue = Number(valor);
  if (isNaN(numericValue) || numericValue <= 0) {
    return res.status(400).json({ message: 'O valor da doação deve ser um número maior que zero.' });
  }

  // O e-mail do pagador é exigido pela API do Mercado Pago.
  // Caso o usuário não forneça, usamos um e-mail de fallback padrão da ExpoGoiabal
  const payerEmail = email && typeof email === 'string' && email.includes('@')
    ? email.trim()
    : 'doador@expogoiabal.com.br';

  // Geramos um UUID interno para nossa transação e chave de idempotência
  const localPaymentId = crypto.randomUUID();

  try {
    // 1. Cria o pagamento no Mercado Pago usando o UUID local como Idempotency Key
    const mpPayment = await createPixPayment({
      amount: numericValue,
      description: `Apoio a Nilson Garcia - ExpoGoiabal 2026 (Doador: ${nome})`,
      payerName: nome.trim(),
      payerEmail,
      idempotencyKey: localPaymentId,
    });

    // 2. Registra o pagamento com status 'pending' no banco de dados do Supabase
    const { data: dbPayment, error: dbError } = await supabaseAdmin
      .from('pagamentos_pix')
      .insert({
        id: localPaymentId,
        mercado_pago_id: String(mpPayment.id),
        valor: mpPayment.amount,
        nome_doador: nome.trim(),
        email_doador: payerEmail,
        status: mpPayment.status,
        qr_code: mpPayment.qrCode,
        qr_code_base64: mpPayment.qrCodeBase64,
        data_expiracao: mpPayment.dateExpiration,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Erro ao salvar pagamento no banco de dados:', dbError.message);
      // Apesar do erro no banco, o pagamento foi criado no MP.
      // Vamos tentar logar isso.
      throw new Error(`Erro ao salvar no banco de dados: ${dbError.message}`);
    }

    // 3. Registra o log de criação (Requisito 9)
    await supabaseAdmin.from('logs_pagamentos_pix').insert({
      pagamento_id: localPaymentId,
      mercado_pago_id: String(mpPayment.id),
      acao: 'criacao_cobranca',
      status_novo: mpPayment.status,
      detalhes: {
        nome_doador: nome.trim(),
        email_doador: payerEmail,
        valor: mpPayment.amount,
      },
    });

    // 4. Retorna os dados necessários para o frontend (Requisito 4)
    return res.status(200).json({
      id: dbPayment.id,
      mercado_pago_id: dbPayment.mercado_pago_id,
      qr_code: dbPayment.qr_code,
      qr_code_base64: dbPayment.qr_code_base64,
      valor: dbPayment.valor,
      data_expiracao: dbPayment.data_expiracao,
      status: dbPayment.status,
    });
  } catch (error: any) {
    console.error('Erro geral no endpoint create-payment:', error.message);

    // Registra o log do erro no banco se for possível identificar o localPaymentId
    try {
      await supabaseAdmin.from('logs_pagamentos_pix').insert({
        pagamento_id: localPaymentId,
        acao: 'erro',
        detalhes: {
          mensagem: error.message,
          stack: error.stack,
          fase: 'criacao_cobranca',
        },
      });
    } catch (logError) {
      console.error('Não foi possível gravar o log de erro no Supabase:', logError);
    }

    return res.status(500).json({
      message: 'Ocorreu um erro ao gerar a cobrança PIX. Tente novamente mais tarde.',
      error: error.message,
    });
  }
}
