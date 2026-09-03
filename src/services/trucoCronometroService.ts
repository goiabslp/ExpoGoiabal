import { supabase } from './supabase';

/**
 * Serviço de Cronômetro Oficial do Torneio de Truco (2 Horas / Queda Saídeira / Partidas Encerradas)
 * Sincronizado em tempo real globalmente via:
 * 1. Supabase Realtime Broadcast (WebSockets em milissegundos entre todos os dispositivos/telas)
 * 2. Supabase Database Persistence (gravação no banco de dados na tabela truco_torneio_status)
 * 3. Supabase Postgres Changes (escuta de alterações no banco)
 * 4. LocalStorage & BroadcastChannel (latência zero no mesmo dispositivo)
 */

export type TrucoCronometroStatus = 
  | 'parado' 
  | 'pre_inicio_5s' 
  | 'em_andamento' 
  | 'pausado' 
  | 'queda_saideira' 
  | 'encerrado';

export interface TrucoCronometroEstado {
  status: TrucoCronometroStatus;
  tempoRestanteSegundos: number; // Segundos restantes (0 a 7200)
  tempoTotalSegundos: number;    // 7200 (2 horas)
  preInicioRestante: number;     // 5, 4, 3, 2, 1, 0
  rodada: number;
  iniciadoEm: number | null;     // timestamp em ms
  expiraEm: number | null;       // timestamp em ms quando atinge 0
  pausadoEm: number | null;
  atualizadoEm: number;
}

const STORAGE_KEY = 'expogoiabal_truco_cronometro_v2';
const BROADCAST_CHANNEL_NAME = 'truco_cronometro_local_v2';
const SUPABASE_CHANNEL_NAME = 'truco_cronometro_live_v2';

export const TEMPO_OFICIAL_SEGUNDOS = 2 * 60 * 60; // 7200s = 02:00:00
export const TEMPO_PRE_CONTAGEM_SEGUNDOS = 5;

const ESTADO_INICIAL: TrucoCronometroEstado = {
  status: 'parado',
  tempoRestanteSegundos: TEMPO_OFICIAL_SEGUNDOS,
  tempoTotalSegundos: TEMPO_OFICIAL_SEGUNDOS,
  preInicioRestante: TEMPO_PRE_CONTAGEM_SEGUNDOS,
  rodada: 1,
  iniciadoEm: null,
  expiraEm: null,
  pausadoEm: null,
  atualizadoEm: Date.now()
};

// Canal Local BroadcastChannel
let localChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    localChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel local não suportado:', e);
}

// Canal Global Supabase Realtime
let supabaseRealtimeChannel: ReturnType<typeof supabase.channel> | null = null;

// Callbacks registrados para atualização de componentes React
const listeners = new Set<(estado: TrucoCronometroEstado) => void>();

const notificarListeners = (estado: TrucoCronometroEstado) => {
  listeners.forEach(fn => {
    try {
      fn(estado);
    } catch (err) {
      console.error('Erro em listener do cronômetro:', err);
    }
  });
};

/**
 * Lê e recalcula o estado atômico atual com base no relógio do sistema
 */
export const obterEstadoCronometro = (): TrucoCronometroEstado => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) {
      return { ...ESTADO_INICIAL, atualizadoEm: Date.now() };
    }

    const estado: TrucoCronometroEstado = JSON.parse(raw);
    const agora = Date.now();

    // 1. Se estiver na contagem prévia de 5 segundos
    if (estado.status === 'pre_inicio_5s' && estado.iniciadoEm) {
      const decorridoPre = Math.floor((agora - estado.iniciadoEm) / 1000);
      const restantePre = Math.max(0, TEMPO_PRE_CONTAGEM_SEGUNDOS - decorridoPre);

      if (restantePre <= 0) {
        // Transição automática para contagem oficial de 02:00:00
        const novoExpiraEm = agora + estado.tempoTotalSegundos * 1000;
        const novoEstado: TrucoCronometroEstado = {
          ...estado,
          status: 'em_andamento',
          preInicioRestante: 0,
          iniciadoEm: agora,
          expiraEm: novoExpiraEm,
          tempoRestanteSegundos: estado.tempoTotalSegundos,
          atualizadoEm: agora
        };
        salvarEstadoCronometro(novoEstado);
        return novoEstado;
      } else {
        return {
          ...estado,
          preInicioRestante: restantePre
        };
      }
    }

    // 2. Se estiver em andamento oficial de 2 horas
    if (estado.status === 'em_andamento' && estado.expiraEm) {
      const restante = Math.max(0, Math.ceil((estado.expiraEm - agora) / 1000));
      
      if (restante <= 0) {
        // Atingiu 02:00 horas -> Transição automática para QUEDA SAÍDEIRA
        const novoEstado: TrucoCronometroEstado = {
          ...estado,
          status: 'queda_saideira',
          tempoRestanteSegundos: 0,
          atualizadoEm: agora
        };
        salvarEstadoCronometro(novoEstado);
        return novoEstado;
      }

      return {
        ...estado,
        tempoRestanteSegundos: restante
      };
    }

    return estado;
  } catch (err) {
    console.error('Erro ao obter estado do cronômetro:', err);
    return { ...ESTADO_INICIAL, atualizadoEm: Date.now() };
  }
};

/**
 * Aplica um estado vindo de outro dispositivo via Supabase Realtime ou Banco
 */
const aplicarEstadoRemoto = (novoEstado: Partial<TrucoCronometroEstado>) => {
  if (!novoEstado || typeof novoEstado !== 'object') return;

  try {
    const estadoAtual = obterEstadoCronometro();

    // Se o estado remoto for mais recente ou for uma ação explícita
    const estadoMesclado: TrucoCronometroEstado = {
      ...estadoAtual,
      ...novoEstado,
      atualizadoEm: novoEstado.atualizadoEm || Date.now()
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(estadoMesclado));
      window.dispatchEvent(new CustomEvent('truco_cronometro_update', { detail: estadoMesclado }));
    }

    notificarListeners(obterEstadoCronometro());
  } catch (e) {
    console.error('Erro ao aplicar estado remoto do cronômetro:', e);
  }
};

/**
 * Salva o estado localmente e propaga via Supabase Realtime + Supabase Database
 */
export const salvarEstadoCronometro = (novoEstado: TrucoCronometroEstado): void => {
  try {
    const agora = Date.now();
    const estadoComTimestamp: TrucoCronometroEstado = {
      ...novoEstado,
      atualizadoEm: agora
    };

    // 1. Salvar no localStorage local
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(estadoComTimestamp));
      window.dispatchEvent(new CustomEvent('truco_cronometro_update', { detail: estadoComTimestamp }));
    }

    // 2. Notificar BroadcastChannel local (outras abas na mesma máquina)
    if (localChannel) {
      try {
        localChannel.postMessage(estadoComTimestamp);
      } catch (err) {
        console.warn('Erro ao postar mensagem no localChannel:', err);
      }
    }

    // 3. Notificar listeners locais
    notificarListeners(estadoComTimestamp);

    // 4. Disparar Supabase Realtime Broadcast (milissegundos para celulares, TVs e outros PCs)
    if (supabaseRealtimeChannel) {
      try {
        supabaseRealtimeChannel.send({
          type: 'broadcast',
          event: 'cronometro_sync',
          payload: estadoComTimestamp
        });
      } catch (err) {
        console.warn('Erro ao enviar broadcast no Supabase Realtime:', err);
      }
    }

    // 5. Persistir no Supabase Database (tabela truco_torneio_status) para persistência permanente
    salvarNoBancoSupabase(estadoComTimestamp);
  } catch (err) {
    console.error('Erro ao salvar estado do cronômetro:', err);
  }
};

/**
 * Persiste o estado do cronômetro no banco de dados Supabase
 */
const salvarNoBancoSupabase = async (estado: TrucoCronometroEstado) => {
  try {
    const { error } = await supabase
      .from('truco_torneio_status')
      .upsert({
        id: 'main',
        sorteio_iniciado_em: JSON.stringify(estado), // Guarda o JSON do cronômetro no status principal
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.warn('Aviso ao salvar cronômetro no banco Supabase:', error.message);
    }
  } catch (e) {
    console.warn('Falha na persistência no banco:', e);
  }
};

/**
 * Busca o estado do cronômetro salvo no banco de dados Supabase (usado na inicialização)
 */
export const buscarEstadoCronometroSupabase = async (): Promise<TrucoCronometroEstado> => {
  try {
    const { data, error } = await supabase
      .from('truco_torneio_status')
      .select('sorteio_iniciado_em, updated_at')
      .eq('id', 'main')
      .maybeSingle();

    if (!error && data?.sorteio_iniciado_em) {
      try {
        const parsed = typeof data.sorteio_iniciado_em === 'string'
          ? JSON.parse(data.sorteio_iniciado_em)
          : data.sorteio_iniciado_em;

        if (parsed && parsed.status) {
          aplicarEstadoRemoto(parsed);
          return obterEstadoCronometro();
        }
      } catch (e) {
        console.warn('Dados de cronômetro no banco não estavam em formato JSON padrão:', e);
      }
    }
  } catch (err) {
    console.warn('Erro ao carregar estado do cronômetro do Supabase:', err);
  }

  return obterEstadoCronometro();
};

/**
 * Inicia a contagem com a contagem prévia de 5 segundos
 */
export const dispararInicioPartidaCom5s = (rodada?: number): TrucoCronometroEstado => {
  const agora = Date.now();
  const estadoAtual = obterEstadoCronometro();

  const novoEstado: TrucoCronometroEstado = {
    ...estadoAtual,
    status: 'pre_inicio_5s',
    preInicioRestante: TEMPO_PRE_CONTAGEM_SEGUNDOS,
    tempoTotalSegundos: TEMPO_OFICIAL_SEGUNDOS,
    tempoRestanteSegundos: TEMPO_OFICIAL_SEGUNDOS,
    rodada: rodada ?? estadoAtual.rodada ?? 1,
    iniciadoEm: agora,
    expiraEm: null,
    pausadoEm: null,
    atualizadoEm: agora
  };

  salvarEstadoCronometro(novoEstado);
  return novoEstado;
};

/**
 * Inicia imediatamente sem contagem prévia (caso o admin queira forçar)
 */
export const iniciarContagemOficialDireta = (rodada?: number): TrucoCronometroEstado => {
  const agora = Date.now();
  const estadoAtual = obterEstadoCronometro();
  const expira = agora + TEMPO_OFICIAL_SEGUNDOS * 1000;

  const novoEstado: TrucoCronometroEstado = {
    ...estadoAtual,
    status: 'em_andamento',
    preInicioRestante: 0,
    tempoTotalSegundos: TEMPO_OFICIAL_SEGUNDOS,
    tempoRestanteSegundos: TEMPO_OFICIAL_SEGUNDOS,
    rodada: rodada ?? estadoAtual.rodada ?? 1,
    iniciadoEm: agora,
    expiraEm: expira,
    pausadoEm: null,
    atualizadoEm: agora
  };

  salvarEstadoCronometro(novoEstado);
  return novoEstado;
};

/**
 * Pausa o cronômetro
 */
export const pausarCronometro = (): TrucoCronometroEstado => {
  const estado = obterEstadoCronometro();
  if (estado.status !== 'em_andamento' && estado.status !== 'pre_inicio_5s') return estado;

  const agora = Date.now();
  const novoEstado: TrucoCronometroEstado = {
    ...estado,
    status: 'pausado',
    pausadoEm: agora,
    atualizadoEm: agora
  };

  salvarEstadoCronometro(novoEstado);
  return novoEstado;
};

/**
 * Retoma o cronômetro pausado
 */
export const retomarCronometro = (): TrucoCronometroEstado => {
  const estado = obterEstadoCronometro();
  if (estado.status !== 'pausado') return estado;

  const agora = Date.now();
  const novoExpiraEm = agora + estado.tempoRestanteSegundos * 1000;

  const novoEstado: TrucoCronometroEstado = {
    ...estado,
    status: 'em_andamento',
    expiraEm: novoExpiraEm,
    pausadoEm: null,
    atualizadoEm: agora
  };

  salvarEstadoCronometro(novoEstado);
  return novoEstado;
};

/**
 * Aciona imediatamente o modo QUEDA SAÍDEIRA
 */
export const acionarQuedaSaideira = (): TrucoCronometroEstado => {
  const estado = obterEstadoCronometro();
  const agora = Date.now();

  const novoEstado: TrucoCronometroEstado = {
    ...estado,
    status: 'queda_saideira',
    tempoRestanteSegundos: 0,
    expiraEm: agora,
    atualizadoEm: agora
  };

  salvarEstadoCronometro(novoEstado);
  return novoEstado;
};

/**
 * Finaliza e encerra oficialmente as partidas do dia
 */
export const encerrarPartidasDoDia = (): TrucoCronometroEstado => {
  const estado = obterEstadoCronometro();
  const agora = Date.now();

  const novoEstado: TrucoCronometroEstado = {
    ...estado,
    status: 'encerrado',
    tempoRestanteSegundos: 0,
    atualizadoEm: agora
  };

  salvarEstadoCronometro(novoEstado);
  return novoEstado;
};

/**
 * Reinicia o cronômetro para o estado inicial (02:00:00 parado)
 */
export const reiniciarCronometro = (novaRodada?: number): TrucoCronometroEstado => {
  const agora = Date.now();
  const estadoAtual = obterEstadoCronometro();

  const novoEstado: TrucoCronometroEstado = {
    status: 'parado',
    tempoTotalSegundos: TEMPO_OFICIAL_SEGUNDOS,
    tempoRestanteSegundos: TEMPO_OFICIAL_SEGUNDOS,
    preInicioRestante: TEMPO_PRE_CONTAGEM_SEGUNDOS,
    rodada: novaRodada ?? estadoAtual.rodada ?? 1,
    iniciadoEm: null,
    expiraEm: null,
    pausadoEm: null,
    atualizadoEm: agora
  };

  salvarEstadoCronometro(novoEstado);
  return novoEstado;
};

/**
 * Ajusta o tempo restante adicionando ou subtraindo minutos/segundos
 */
export const ajustarTempoCronometro = (segundosDelta: number): TrucoCronometroEstado => {
  const estado = obterEstadoCronometro();
  const novoRestante = Math.max(0, estado.tempoRestanteSegundos + segundosDelta);
  const agora = Date.now();

  let novoStatus = estado.status;
  if (novoRestante === 0 && estado.status === 'em_andamento') {
    novoStatus = 'queda_saideira';
  } else if (novoRestante > 0 && estado.status === 'queda_saideira') {
    novoStatus = 'em_andamento';
  }

  const novoExpira = estado.status === 'em_andamento' ? agora + novoRestante * 1000 : estado.expiraEm;

  const novoEstado: TrucoCronometroEstado = {
    ...estado,
    status: novoStatus,
    tempoRestanteSegundos: novoRestante,
    expiraEm: novoExpira,
    atualizadoEm: agora
  };

  salvarEstadoCronometro(novoEstado);
  return novoEstado;
};

/**
 * Formata segundos em formato HH:MM:SS
 */
export const formatarTempoHHMMSS = (totalSegundos: number): { horas: string; minutos: string; segundos: string; texto: string } => {
  const s = Math.max(0, Math.floor(totalSegundos));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const seg = s % 60;

  const horas = String(h).padStart(2, '0');
  const minutos = String(m).padStart(2, '0');
  const segundos = String(seg).padStart(2, '0');

  return {
    horas,
    minutos,
    segundos,
    texto: `${horas}:${minutos}:${segundos}`
  };
};

/**
 * Inicializa a conexão com Supabase Realtime (chamado automaticamente)
 */
const inicializarSupabaseRealtime = () => {
  if (supabaseRealtimeChannel) return;

  try {
    supabaseRealtimeChannel = supabase.channel(SUPABASE_CHANNEL_NAME, {
      config: { broadcast: { self: false } }
    });

    supabaseRealtimeChannel
      .on('broadcast', { event: 'cronometro_sync' }, (payload) => {
        if (payload?.payload) {
          aplicarEstadoRemoto(payload.payload);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'truco_torneio_status' }, (payload: any) => {
        if (payload?.new?.sorteio_iniciado_em) {
          try {
            const parsed = typeof payload.new.sorteio_iniciado_em === 'string'
              ? JSON.parse(payload.new.sorteio_iniciado_em)
              : payload.new.sorteio_iniciado_em;
            if (parsed && parsed.status) {
              aplicarEstadoRemoto(parsed);
            }
          } catch (e) {
            console.warn('Erro ao processar alteração postgres do cronômetro:', e);
          }
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Busca estado inicial do banco após assinar
          buscarEstadoCronometroSupabase();
        }
      });
  } catch (err) {
    console.warn('Não foi possível inicializar Supabase Realtime Channel:', err);
  }
};

/**
 * Inscreve-se para receber atualizações do cronômetro em tempo real (multi-dispositivo)
 */
export const subscribeCronometro = (callback: (estado: TrucoCronometroEstado) => void): (() => void) => {
  listeners.add(callback);
  inicializarSupabaseRealtime();

  // Busca do Supabase logo na inscrição
  buscarEstadoCronometroSupabase().then(est => callback(est));

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      callback(obterEstadoCronometro());
    }
  };

  const handleCustom = () => {
    callback(obterEstadoCronometro());
  };

  const handleLocalBroadcast = (event: MessageEvent) => {
    if (event.data) {
      callback(obterEstadoCronometro());
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
    window.addEventListener('truco_cronometro_update', handleCustom);
    if (localChannel) {
      localChannel.addEventListener('message', handleLocalBroadcast);
    }
  }

  // Polling leve de fallback (a cada 2.5 segundos) para garantir sincronia se o websocket oscilar
  const fallbackInterval = setInterval(() => {
    buscarEstadoCronometroSupabase().then(est => callback(est));
  }, 2500);

  return () => {
    listeners.delete(callback);
    clearInterval(fallbackInterval);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('truco_cronometro_update', handleCustom);
      if (localChannel) {
        localChannel.removeEventListener('message', handleLocalBroadcast);
      }
    }
  };
};
