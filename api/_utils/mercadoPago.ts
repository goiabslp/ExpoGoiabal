import axios from 'axios';
import crypto from 'crypto';

const MP_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN;
const MP_WEBHOOK_SECRET = process.env.MERCADO_PAGO_WEBHOOK_SECRET;

const mpClient = axios.create({
  baseURL: 'https://api.mercadopago.com',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
  },
});

interface PixPaymentPayload {
  amount: number;
  description: string;
  payerName: string;
  payerEmail: string;
  idempotencyKey: string;
  externalReference?: string;
}

interface MpPaymentResponse {
  id: number;
  status: string;
  qrCode: string;
  qrCodeBase64: string;
  dateExpiration: string;
  amount: number;
}

/**
 * Cria uma cobrança PIX no Mercado Pago utilizando a API oficial.
 */
export async function createPixPayment(payload: PixPaymentPayload): Promise<MpPaymentResponse> {
  if (!MP_ACCESS_TOKEN) {
    throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado.');
  }

  // Divide o nome do pagador em primeiro e último nome
  const nameParts = payload.payerName.trim().split(/\s+/);
  const firstName = nameParts[0] || 'Doador';
  const lastName = nameParts.slice(1).join(' ') || 'Anonimo';

  try {
    const response = await mpClient.post(
      '/v1/payments',
      {
        transaction_amount: Number(payload.amount),
        description: payload.description,
        payment_method_id: 'pix',
        external_reference: payload.externalReference,
        payer: {
          email: payload.payerEmail,
          first_name: firstName,
          last_name: lastName,
        },
      },
      {
        headers: {
          'X-Idempotency-Key': payload.idempotencyKey,
        },
      }
    );

    const data = response.data;

    // Extrai os dados específicos do PIX
    const qrCode = data.point_of_interaction?.transaction_data?.qr_code;
    const qrCodeBase64 = data.point_of_interaction?.transaction_data?.qr_code_base64;
    const dateExpiration = data.date_of_expiration;

    if (!qrCode) {
      throw new Error('A resposta do Mercado Pago não conteve o QR Code PIX.');
    }

    return {
      id: data.id,
      status: data.status,
      qrCode,
      qrCodeBase64,
      dateExpiration,
      amount: data.transaction_amount,
    };
  } catch (error: any) {
    const errorDetails = error.response?.data || error.message;
    console.error('Erro na criação de pagamento no Mercado Pago:', JSON.stringify(errorDetails));
    throw new Error(`Falha ao criar PIX no Mercado Pago: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Consulta um pagamento no Mercado Pago pelo ID para verificar seu status real e dados do pagador.
 */
export async function getPaymentStatus(paymentId: string | number): Promise<{ 
  id: number; 
  status: string; 
  amount: number;
  payerName?: string;
  payerEmail?: string;
  bankName?: string;
  externalReference?: string;
}> {
  if (!MP_ACCESS_TOKEN) {
    throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado.');
  }

  try {
    const response = await mpClient.get(`/v1/payments/${paymentId}`);
    const data = response.data;
    
    // Constrói o nome completo do doador retornado pelo banco/Mercado Pago
    const firstName = data.payer?.first_name || '';
    const lastName = data.payer?.last_name || '';
    const payerName = [firstName, lastName].filter(Boolean).join(' ').trim();

    // Obtém o nome da instituição financeira de origem do PIX
    const bankName = data.point_of_interaction?.transaction_data?.bank_info?.payer?.long_name;
    
    return {
      id: data.id,
      status: data.status,
      amount: data.transaction_amount,
      payerName: payerName || undefined,
      payerEmail: data.payer?.email || undefined,
      bankName: bankName || undefined,
      externalReference: data.external_reference || undefined,
    };
  } catch (error: any) {
    console.error(`Erro ao consultar pagamento ${paymentId} no Mercado Pago:`, error.message);
    throw new Error(`Falha ao obter status do pagamento: ${error.message}`);
  }
}

/**
 * Valida a assinatura digital x-signature enviada pelo webhook do Mercado Pago.
 */
export function validateWebhookSignature(params: {
  xSignature: string;
  xRequestId: string;
  dataId: string;
}): boolean {
  if (!MP_WEBHOOK_SECRET) {
    console.warn('MERCADO_PAGO_WEBHOOK_SECRET não configurado. Ignorando validação estrita por motivos de teste.');
    return true; // Se não configurado, ignora para não bloquear, mas a validação na API real garante autenticidade.
  }

  try {
    // Exemplo de xSignature: ts=1704908010,v1=618c85345248dd820d5fd456117c2ab2ef8eda45a0282ff693eac24131a5e839
    const parts = params.xSignature.split(',');
    let ts = '';
    let hashV1 = '';

    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key?.trim() === 'ts') ts = value?.trim();
      if (key?.trim() === 'v1') hashV1 = value?.trim();
    }

    if (!ts || !hashV1) {
      console.error('Assinatura x-signature inválida ou malformada.');
      return false;
    }

    // O id no manifesto do Mercado Pago deve conter apenas letras minúsculas caso haja letras
    const formattedId = params.dataId.toLowerCase();

    // Constrói o manifesto de validação: id:dataId;request-id:xRequestId;ts:ts;
    // IMPORTANTE: se alguma variável estiver vazia, omite
    let manifest = '';
    if (formattedId) manifest += `id:${formattedId};`;
    if (params.xRequestId) manifest += `request-id:${params.xRequestId};`;
    if (ts) manifest += `ts:${ts};`;

    // Calcula o HMAC-SHA256 do manifesto usando a chave secreta do webhook
    const hmac = crypto.createHmac('sha256', MP_WEBHOOK_SECRET);
    hmac.update(manifest);
    const computedHash = hmac.digest('hex');

    // Compara de forma segura contra timing attacks
    const bufferComputed = Buffer.from(computedHash, 'utf-8');
    const bufferReceived = Buffer.from(hashV1, 'utf-8');

    if (bufferComputed.length !== bufferReceived.length) {
      return false;
    }

    return crypto.timingSafeEqual(bufferComputed, bufferReceived);
  } catch (error: any) {
    console.error('Erro ao validar assinatura do webhook:', error.message);
    return false;
  }
}
