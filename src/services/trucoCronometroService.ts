/**
 * Serviço de Cronômetro Oficial do Torneio de Truco (2 Horas / Queda Saideira / Partidas Encerradas)
 * Sincronizado via timestamps reais, BroadcastChannel e localStorage.
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

const STORAGE_KEY = 'expogoiabal_truco_cronometro_v1';
const BROADCAST_CHANNEL_NAME = 'truco_cronometro_channel_v1';
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

let channel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel não suportado neste ambiente:', e);
}

/**
 * Lê e recalcula o estado atômico atual com base no relógio do sistema
 */
export const obterEstadoCronometro = (): TrucoCronometroEstado => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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
 * Salva o estado e notifica todos os canais e janelas ativas
 */
export const salvarEstadoCronometro = (novoEstado: TrucoCronometroEstado): void => {
  try {
    const estadoComTimestamp = {
      ...novoEstado,
      atualizadoEm: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estadoComTimestamp));
    
    // Notifica BroadcastChannel
    if (channel) {
      channel.postMessage(estadoComTimestamp);
    }

    // Dispara evento interno na própria janela
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('truco_cronometro_update', { detail: estadoComTimestamp }));
    }
  } catch (err) {
    console.error('Erro ao salvar estado do cronômetro:', err);
  }
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
 * Inscreve-se para receber atualizações do cronômetro em tempo real
 */
export const subscribeCronometro = (callback: (estado: TrucoCronometroEstado) => void): (() => void) => {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      callback(obterEstadoCronometro());
    }
  };

  const handleCustom = () => {
    callback(obterEstadoCronometro());
  };

  const handleBroadcast = (event: MessageEvent) => {
    if (event.data) {
      callback(obterEstadoCronometro());
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
    window.addEventListener('truco_cronometro_update', handleCustom);
    if (channel) {
      channel.addEventListener('message', handleBroadcast);
    }
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('truco_cronometro_update', handleCustom);
      if (channel) {
        channel.removeEventListener('message', handleBroadcast);
      }
    }
  };
};
