const supabaseUrl = "https://lluxkelguvceyseuwlbe.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsdXhrZWxndXZjZXlzZXV3bGJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODk1NjIyNCwiZXhwIjoyMDk0NTMyMjI0fQ.u8dqc-81X1Lsq_GgrmocHHGp6ZrGKa-ppWFhWPEDH3g";

async function checkDatabase() {
  console.log("=== VERIFICANDO DADOS DO SUPABASE ===");

  try {
    // 1. Verificar últimos pagamentos
    const paymentsRes = await fetch(`${supabaseUrl}/rest/v1/pagamentos_pix?select=*&order=created_at.desc&limit=5`, {
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`
      }
    });
    
    if (!paymentsRes.ok) {
      console.error("Erro ao buscar pagamentos:", await paymentsRes.text());
    } else {
      const payments = await paymentsRes.json();
      console.log(`\nÚltimos 5 pagamentos registrados (${payments.length}):`);
      console.log(JSON.stringify(payments, null, 2));
    }

    // 2. Verificar últimos logs
    const logsRes = await fetch(`${supabaseUrl}/rest/v1/logs_pagamentos_pix?select=*&order=created_at.desc&limit=10`, {
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`
      }
    });

    if (!logsRes.ok) {
      console.error("Erro ao buscar logs:", await logsRes.text());
    } else {
      const logs = await logsRes.json();
      console.log(`\nÚltimos 10 logs de auditoria registrados (${logs.length}):`);
      console.log(JSON.stringify(logs, null, 2));
    }

  } catch (err) {
    console.error("Erro na requisição:", err);
  }
}

checkDatabase();
