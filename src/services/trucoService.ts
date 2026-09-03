import { supabase } from './supabase';

export interface TrucoJogador {
  id: string;
  equipe_id?: string;
  nome_completo: string;
  cpf: string;
  data_nascimento: string;
  is_titular?: boolean;
  created_at?: string;
}

export type TrucoStatusEquipe = 'pendente' | 'aprovado' | 'reprovado';

export interface TrucoEquipe {
  id: string;
  nome: string;
  cidade: string;
  foto_url?: string;
  status: TrucoStatusEquipe;
  cadastro_regularizado?: boolean;
  created_at?: string;
  jogadores?: TrucoJogador[];
}

export type TrucoTipoFase = 
  | 'primeira_fase' 
  | 'semi_a1' 
  | 'semi_a2' 
  | 'semi_b1' 
  | 'semi_b2' 
  | 'final_a' 
  | 'final_b' 
  | 'grande_final';

export interface TrucoPartida {
  id: string;
  tipo_fase: TrucoTipoFase;
  rodada: number;
  numero_jogo: number;
  time_a_id: string | null;
  time_b_id: string | null;
  pontos_time_a: number;
  pontos_time_b: number;
  vencedor_id: string | null;
  status: 'agendada' | 'em_andamento' | 'finalizada';
  fase_nome: string;
  created_at?: string;
  updated_at?: string;
  time_a?: TrucoEquipe | null;
  time_b?: TrucoEquipe | null;
  vencedor?: TrucoEquipe | null;
}

export interface TrucoTorneioStatus {
  id: string;
  fase_atual: 'inscricao' | 'primeira_fase' | 'primeira_fase_encerrada' | 'mata_mata' | 'finalizado';
  sorteio_primeira_fase_confirmado: boolean;
  sorteio_mata_mata_confirmado: boolean;
  sorteio_iniciado_em?: string | null;
  sorteio_animacao_ativa?: boolean;
  top8_equipes_ids: string[];
  grupo_a_equipes_ids: string[];
  grupo_b_equipes_ids: string[];
  campeao_equipe_id: string | null;
}

export const DEFAULT_STATUS: TrucoTorneioStatus = {
  id: 'main',
  fase_atual: 'inscricao',
  sorteio_primeira_fase_confirmado: false,
  sorteio_mata_mata_confirmado: false,
  sorteio_iniciado_em: null,
  sorteio_animacao_ativa: false,
  top8_equipes_ids: [],
  grupo_a_equipes_ids: [],
  grupo_b_equipes_ids: [],
  campeao_equipe_id: null
};

/**
 * Calcula a data de cada rodada iniciando em 03/09/2026 (Quinta-feira)
 * Realizadas sempre às Terças e Quintas-feiras
 */
export const calcularDataRodada = (rodadaNumero: number): { dataFormatada: string; diaSemana: string; textoCompleto: string } => {
  const r = Math.max(1, rodadaNumero);

  // Base: 03 de Setembro de 2026 (Quinta-feira)
  const baseDate = new Date(2026, 8, 3); // Setembro é mês 8 (0-indexed)

  let diasAdicionais = 0;
  let isQuinta = true;

  if (r === 1) {
    diasAdicionais = 0;
    isQuinta = true;
  } else if (r % 2 === 1) {
    // Rodadas ímpares (3, 5, 7...): Quintas-feiras
    const k = Math.floor((r - 1) / 2);
    diasAdicionais = k * 7;
    isQuinta = true;
  } else {
    // Rodadas pares (2, 4, 6...): Terças-feiras
    const k = Math.floor(r / 2);
    diasAdicionais = (k * 7) - 2;
    isQuinta = false;
  }

  const targetDate = new Date(baseDate);
  targetDate.setDate(baseDate.getDate() + diasAdicionais);

  const dia = String(targetDate.getDate()).padStart(2, '0');
  const mes = String(targetDate.getMonth() + 1).padStart(2, '0');
  const ano = targetDate.getFullYear();
  const diaSemana = isQuinta ? 'Quinta-feira' : 'Terça-feira';

  return {
    dataFormatada: `${dia}/${mes}/${ano}`,
    diaSemana,
    textoCompleto: `${diaSemana}, ${dia}/${mes}/${ano}`
  };
};

export interface TrucoPremiacaoInfo {
  posicaoPremiado: number;
  titulo: string;
  emoji: string;
  valor: number;
  valorFormatado: string;
}

export const TABELA_PREMIACOES_TRUCO: TrucoPremiacaoInfo[] = [
  { posicaoPremiado: 1, titulo: '1º Premiado', emoji: '🥇', valor: 1000, valorFormatado: 'R$ 1.000,00' },
  { posicaoPremiado: 2, titulo: '2º Premiado', emoji: '🥈', valor: 600, valorFormatado: 'R$ 600,00' },
  { posicaoPremiado: 3, titulo: '3º Premiado', emoji: '🥉', valor: 400, valorFormatado: 'R$ 400,00' },
  { posicaoPremiado: 4, titulo: '4º Premiado', emoji: '🏅', valor: 300, valorFormatado: 'R$ 300,00' },
  { posicaoPremiado: 5, titulo: '5º Premiado', emoji: '🏅', valor: 200, valorFormatado: 'R$ 200,00' }
];

export const TOTAL_PREMIACAO_TRUCO_FORMATADO = 'R$ 2.500,00';
export const TOTAL_PREMIACAO_TRUCO_VALOR = 2500;

/**
 * Gerador de Escudo e Imagem Oficial Exclusiva de Baralho de Truco com o NOME DO TIME estampado.
 * Cria um SVG vetorial de alta resolução com cartas de truco reais (Zap, 7 Copas, Espadilha, 7 Ouros),
 * naipes iluminados (♠ ♥ ♦ ♣), brasão e o nome da equipe em destaque central absoluto.
 * Garante um design único por time, sem repetições!
 */
export const gerarEscudoBaralhoComNome = (nomeTime: string, semente?: string): string => {
  const nomeLimpo = (nomeTime || 'EQUIPE DE TRUCO').trim().toUpperCase();
  
  // Hash único para determinar o estilo visual exclusivo do time
  const seedStr = `${nomeLimpo}_${semente || ''}`;
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  // 12 Paletas e Combinações Exclusivas de Cartas de Truco
  const temasBaralho = [
    {
      nome: 'Zap Imperial',
      bg1: '#05130b',
      bg2: '#0b2e1c',
      borda: '#10b981',
      accent: '#34d399',
      gold: '#fbbf24',
      badgeBg: '#062015',
      naipe: '♣',
      cartas: ['4♣', '7♥'],
      c1Cor: '#10b981',
      c2Cor: '#ef4444'
    },
    {
      nome: 'Sete Copas Supremo',
      bg1: '#180407',
      bg2: '#3f0c14',
      borda: '#ef4444',
      accent: '#f87171',
      gold: '#fde047',
      badgeBg: '#2a080d',
      naipe: '♥',
      cartas: ['7♥', 'A♠'],
      c1Cor: '#ef4444',
      c2Cor: '#0f172a'
    },
    {
      nome: 'Espadilha de Elite',
      bg1: '#030d1e',
      bg2: '#0a2540',
      borda: '#38bdf8',
      accent: '#7dd3fc',
      gold: '#fbbf24',
      badgeBg: '#08172c',
      naipe: '♠',
      cartas: ['A♠', '7♦'],
      c1Cor: '#0f172a',
      c2Cor: '#f59e0b'
    },
    {
      nome: 'Manilha de Ouro 7♦',
      bg1: '#1c1203',
      bg2: '#422807',
      borda: '#f59e0b',
      accent: '#fcd34d',
      gold: '#fef08a',
      badgeBg: '#2e1904',
      naipe: '♦',
      cartas: ['7♦', '4♣'],
      c1Cor: '#f59e0b',
      c2Cor: '#10b981'
    },
    {
      nome: 'Reis do Truco',
      bg1: '#130424',
      bg2: '#2e0a54',
      borda: '#a855f7',
      accent: '#c084fc',
      gold: '#facc15',
      badgeBg: '#20073b',
      naipe: '👑',
      cartas: ['K♠', 'K♥'],
      c1Cor: '#0f172a',
      c2Cor: '#ef4444'
    },
    {
      nome: 'Valetes da Mesa',
      bg1: '#02181f',
      bg2: '#063c4e',
      borda: '#06b6d4',
      accent: '#22d3ee',
      gold: '#eab308',
      badgeBg: '#052936',
      naipe: '🃏',
      cartas: ['J♣', 'J♦'],
      c1Cor: '#10b981',
      c2Cor: '#f59e0b'
    },
    {
      nome: 'Ases da Noite',
      bg1: '#0f0f12',
      bg2: '#1f1f28',
      borda: '#e2e8f0',
      accent: '#f8fafc',
      gold: '#fbbf24',
      badgeBg: '#14141c',
      naipe: '♠',
      cartas: ['A♠', 'A♥'],
      c1Cor: '#0f172a',
      c2Cor: '#ef4444'
    },
    {
      nome: 'Damas de Espadas',
      bg1: '#1a041f',
      bg2: '#3d084a',
      borda: '#ec4899',
      accent: '#f472b6',
      gold: '#fde047',
      badgeBg: '#26052f',
      naipe: '♦',
      cartas: ['Q♦', 'Q♠'],
      c1Cor: '#f59e0b',
      c2Cor: '#0f172a'
    },
    {
      nome: 'Chamas do Truco',
      bg1: '#200903',
      bg2: '#4a1506',
      borda: '#f97316',
      accent: '#fb923c',
      gold: '#fef08a',
      badgeBg: '#310f04',
      naipe: '🔥',
      cartas: ['3♣', '2♥'],
      c1Cor: '#10b981',
      c2Cor: '#ef4444'
    },
    {
      nome: 'Goiabal Ouro Preto',
      bg1: '#0a0a0c',
      bg2: '#1a1815',
      borda: '#eab308',
      accent: '#fef08a',
      gold: '#ca8a04',
      badgeBg: '#12110e',
      naipe: '♣',
      cartas: ['4♣', 'A♠'],
      c1Cor: '#10b981',
      c2Cor: '#0f172a'
    },
    {
      nome: 'Mesa Real de Truco',
      bg1: '#04161b',
      bg2: '#0b3542',
      borda: '#14b8a6',
      accent: '#2dd4bf',
      gold: '#fbbf24',
      badgeBg: '#07242c',
      naipe: '♥',
      cartas: ['7♥', '7♦'],
      c1Cor: '#ef4444',
      c2Cor: '#f59e0b'
    },
    {
      nome: 'Blefe Fatal',
      bg1: '#180718',
      bg2: '#380f38',
      borda: '#d946ef',
      accent: '#e879f9',
      gold: '#facc15',
      badgeBg: '#270a27',
      naipe: '♣',
      cartas: ['3♦', '4♣'],
      c1Cor: '#f59e0b',
      c2Cor: '#10b981'
    }
  ];

  const t = temasBaralho[absHash % temasBaralho.length];

  // Tratamento de quebra de linha inteligente para o nome do time
  let linha1 = nomeLimpo;
  let linha2 = '';
  if (nomeLimpo.length > 15) {
    const palavras = nomeLimpo.split(' ');
    if (palavras.length > 1) {
      const meio = Math.ceil(palavras.length / 2);
      linha1 = palavras.slice(0, meio).join(' ');
      linha2 = palavras.slice(meio).join(' ');
    }
  }

  const fontSizeL1 = linha2 ? (linha1.length > 13 ? 24 : 28) : (linha1.length > 14 ? 26 : (linha1.length > 10 ? 32 : 38));
  const fontSizeL2 = linha2.length > 13 ? 22 : 26;

  // Escapar caracteres especiais para XML/SVG
  const escapeXml = (unsafe: string) => unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <!-- Gradiente de Fundo -->
    <linearGradient id="bgGrad_${absHash}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${t.bg1}" />
      <stop offset="50%" stop-color="${t.bg2}" />
      <stop offset="100%" stop-color="${t.bg1}" />
    </linearGradient>

    <!-- Gradiente Dourado de Borda -->
    <linearGradient id="goldGrad_${absHash}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${t.gold}" />
      <stop offset="50%" stop-color="${t.accent}" />
      <stop offset="100%" stop-color="${t.borda}" />
    </linearGradient>

    <!-- Gradiente de Carta Branca -->
    <linearGradient id="cardGrad_${absHash}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="85%" stop-color="#f8fafc" />
      <stop offset="100%" stop-color="#e2e8f0" />
    </linearGradient>

    <!-- Filtro de Sombra -->
    <filter id="shadow_${absHash}" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.85" />
    </filter>

    <!-- Filtro de Brilho Neon -->
    <filter id="glow_${absHash}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Fundo do Card -->
  <rect width="600" height="600" fill="url(#bgGrad_${absHash})" />

  <!-- Padrão Decorativo de Naipes no Fundo -->
  <g opacity="0.08" fill="#ffffff" font-size="72" font-family="sans-serif" text-anchor="middle">
    <text x="75" y="95">♠</text>
    <text x="525" y="95">♥</text>
    <text x="75" y="555">♦</text>
    <text x="525" y="555">♣</text>
    <text x="140" y="300">♣</text>
    <text x="460" y="300">♠</text>
    <text x="300" y="100">♦</text>
    <text x="300" y="550">♥</text>
  </g>

  <!-- Brasão Central em Formato de Escudo de Luxo -->
  <g filter="url(#shadow_${absHash})">
    <!-- Borda Externa -->
    <path d="M 300 55 C 470 55 520 110 520 275 C 520 440 300 535 300 535 C 300 535 80 440 80 275 C 80 110 130 55 300 55 Z"
          fill="${t.badgeBg}" stroke="url(#goldGrad_${absHash})" stroke-width="8" />
    
    <!-- Linha Pontilhada Interna -->
    <path d="M 300 72 C 450 72 500 120 500 270 C 500 420 300 512 300 512 C 300 512 100 420 100 270 C 100 120 150 72 300 72 Z"
          fill="none" stroke="${t.accent}" stroke-width="2.5" stroke-dasharray="8 6" opacity="0.65" />
  </g>

  <!-- DUAS CARTAS DE TRUCO OFICIAIS CRUZADAS NO TOPO -->
  <g filter="url(#shadow_${absHash})">
    <!-- Carta 1 (Esquerda) -->
    <g transform="translate(255, 175) rotate(-18)">
      <rect x="-44" y="-62" width="88" height="124" rx="10" fill="url(#cardGrad_${absHash})" stroke="#cbd5e1" stroke-width="3" />
      <text x="-30" y="-36" font-size="22" font-weight="900" fill="${t.c1Cor}" font-family="sans-serif">${t.cartas[0]}</text>
      <text x="0" y="20" font-size="40" fill="${t.c1Cor}" text-anchor="middle" font-family="sans-serif">${t.cartas[0].slice(-1)}</text>
      <text x="30" y="50" font-size="22" font-weight="900" fill="${t.c1Cor}" font-family="sans-serif" text-anchor="end">${t.cartas[0]}</text>
    </g>

    <!-- Carta 2 (Direita) -->
    <g transform="translate(345, 175) rotate(18)">
      <rect x="-44" y="-62" width="88" height="124" rx="10" fill="url(#cardGrad_${absHash})" stroke="#cbd5e1" stroke-width="3" />
      <text x="-30" y="-36" font-size="22" font-weight="900" fill="${t.c2Cor}" font-family="sans-serif">${t.cartas[1]}</text>
      <text x="0" y="20" font-size="40" fill="${t.c2Cor}" text-anchor="middle" font-family="sans-serif">${t.cartas[1].slice(-1)}</text>
      <text x="30" y="50" font-size="22" font-weight="900" fill="${t.c2Cor}" font-family="sans-serif" text-anchor="end">${t.cartas[1]}</text>
    </g>
  </g>

  <!-- Ícone/Naipe de Destaque Central -->
  <g filter="url(#glow_${absHash})">
    <text x="300" y="275" font-size="60" fill="${t.gold}" text-anchor="middle" font-family="sans-serif" font-weight="900">
      ${t.naipe}
    </text>
  </g>

  <!-- FAIXA CENTRAL METÁLICA PARA O NOME DO TIME -->
  <g filter="url(#shadow_${absHash})">
    <path d="M 50 338 L 550 338 L 530 442 L 70 442 Z" fill="#090d16" stroke="url(#goldGrad_${absHash})" stroke-width="4.5" />
    <path d="M 60 346 L 540 346 L 522 434 L 78 434 Z" fill="#111827" stroke="${t.borda}" stroke-width="1.5" opacity="0.85" />
  </g>

  <!-- Naipes de Ouro nas Extremidades da Faixa -->
  <text x="95" y="396" font-size="26" fill="${t.gold}" text-anchor="middle" font-family="sans-serif">♠</text>
  <text x="505" y="396" font-size="26" fill="${t.gold}" text-anchor="middle" font-family="sans-serif">♥</text>

  <!-- NOME DO TIME ESTAMPADO COM DESTAQUE NA IMAGEM -->
  <g font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-weight="900" text-anchor="middle" letter-spacing="1.2">
    ${linha2 ? `
      <text x="300" y="380" font-size="${fontSizeL1}" fill="#ffffff" filter="url(#shadow_${absHash})">
        ${escapeXml(linha1)}
      </text>
      <text x="300" y="416" font-size="${fontSizeL2}" fill="${t.gold}" filter="url(#shadow_${absHash})">
        ${escapeXml(linha2)}
      </text>
    ` : `
      <text x="300" y="398" font-size="${fontSizeL1}" fill="#ffffff" filter="url(#shadow_${absHash})">
        ${escapeXml(linha1)}
      </text>
    `}
  </g>

  <!-- Subtítulo Oficial do Torneio -->
  <g font-family="sans-serif" font-weight="900" text-anchor="middle" font-size="12" letter-spacing="3" fill="#cbd5e1">
    <text x="300" y="475" opacity="0.95">TORNEIO DE TRUCO • 2026</text>
  </g>

  <!-- 4 Naipes nos Quatro Cantos do Card -->
  <g font-size="22" fill="${t.gold}" opacity="0.8" font-family="sans-serif">
    <text x="30" y="45">♠</text>
    <text x="570" y="45">♥</text>
    <text x="30" y="585">♦</text>
    <text x="570" y="585">♣</text>
  </g>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/**
 * Retorna a imagem oficial temática de baralho e cartas personalizada com o NOME DO TIME
 */
export const obterImagemAleatoriaBaralho = (nomeTime?: string, semente?: string): string => {
  return gerarEscudoBaralhoComNome(nomeTime || 'EQUIPE DE TRUCO', semente || nomeTime);
};

export interface TrucoClassificacaoRow {
  posicao: number;
  equipe: TrucoEquipe;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  pontos: number;
  pontosMarcados: number;
  pontosSofridos: number;
  saldoPontos: number;
  // Campos de Premiação Automática & Elegibilidade
  isElegivelPremiacao: boolean;
  motivoInelegibilidade?: string;
  premiacaoPosicao?: number;
  premiacaoTitulo?: string;
  premiacaoEmoji?: string;
  premiacaoValor?: number;
  premiacaoFormatada?: string;
}

export const TIMES_FICTICIOS_SEED: {
  nome: string;
  cidade: string;
  foto_url: string;
  jogadores: { nome_completo: string; cpf: string; data_nascimento: string; is_titular: boolean }[];
}[] = [
  {
    nome: 'Os Reis do Zap',
    cidade: 'São José do Goiabal - MG',
    foto_url: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=400&auto=format&fit=crop&q=80',
    jogadores: [
      { nome_completo: 'Carlos Eduardo Mendes', cpf: '123.456.789-01', data_nascimento: '1992-04-15', is_titular: true },
      { nome_completo: 'Lucas Gabriel Ferreira', cpf: '234.567.890-12', data_nascimento: '1995-08-22', is_titular: true },
      { nome_completo: 'Marcos Vinicius Silva', cpf: '345.678.901-23', data_nascimento: '1989-12-03', is_titular: true },
      { nome_completo: 'Rodrigo Alves Pereira', cpf: '456.789.012-34', data_nascimento: '1994-06-18', is_titular: true },
      { nome_completo: 'Felipe Augusto Costa', cpf: '567.890.123-45', data_nascimento: '1996-01-30', is_titular: false }
    ]
  },
  {
    nome: 'Goiabal Truco Clube',
    cidade: 'São José do Goiabal - MG',
    foto_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&auto=format&fit=crop&q=80',
    jogadores: [
      { nome_completo: 'Rafael Santos Oliveira', cpf: '678.901.234-56', data_nascimento: '1990-03-12', is_titular: true },
      { nome_completo: 'Diego Henrique Lima', cpf: '789.012.345-67', data_nascimento: '1993-07-25', is_titular: true },
      { nome_completo: 'Bruno César Souza', cpf: '890.123.456-78', data_nascimento: '1988-11-14', is_titular: true },
      { nome_completo: 'Thiago Matheus Ribeiro', cpf: '901.234.567-89', data_nascimento: '1997-05-09', is_titular: true },
      { nome_completo: 'Alex Sandro Batista', cpf: '012.345.678-90', data_nascimento: '1991-09-20', is_titular: false }
    ]
  },
  {
    nome: 'Ás de Ouro',
    cidade: 'João Monlevade - MG',
    foto_url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&auto=format&fit=crop&q=80',
    jogadores: [
      { nome_completo: 'Gustavo Henrique Nogueira', cpf: '135.246.357-48', data_nascimento: '1991-02-17', is_titular: true },
      { nome_completo: 'Leonardo Martins Rocha', cpf: '246.357.468-59', data_nascimento: '1994-10-05', is_titular: true },
      { nome_completo: 'Daniel Fernando Teixeira', cpf: '357.468.579-60', data_nascimento: '1987-04-28', is_titular: true },
      { nome_completo: 'André Luiz Gomes', cpf: '468.579.680-71', data_nascimento: '1995-12-11', is_titular: true },
      { nome_completo: 'Marcelo Ramos Dias', cpf: '579.680.791-82', data_nascimento: '1990-08-03', is_titular: false }
    ]
  },
  {
    nome: 'Valetes da Serra',
    cidade: 'Rio Piracicaba - MG',
    foto_url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80',
    jogadores: [
      { nome_completo: 'Eduardo José Barbosa', cpf: '680.791.802-93', data_nascimento: '1993-01-24', is_titular: true },
      { nome_completo: 'Victor Hugo Moreira', cpf: '791.802.913-04', data_nascimento: '1996-09-15', is_titular: true },
      { nome_completo: 'Gabriel Antônio Carvalho', cpf: '802.913.024-15', data_nascimento: '1989-06-30', is_titular: true },
      { nome_completo: 'Samuel Vitor Andrade', cpf: '913.024.135-26', data_nascimento: '1992-11-08', is_titular: true },
      { nome_completo: 'Danilo Silva Rezende', cpf: '024.135.246-37', data_nascimento: '1995-03-19', is_titular: false }
    ]
  },
  {
    nome: 'Sete Copas',
    cidade: 'Alvinópolis - MG',
    foto_url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=400&auto=format&fit=crop&q=80',
    jogadores: [
      { nome_completo: 'Mateus Felipe Correia', cpf: '147.258.369-10', data_nascimento: '1990-07-14', is_titular: true },
      { nome_completo: 'Igor Vinicius Pires', cpf: '258.369.470-21', data_nascimento: '1994-03-29', is_titular: true },
      { nome_completo: 'Arthur Henrique Farias', cpf: '369.470.581-32', data_nascimento: '1988-09-02', is_titular: true },
      { nome_completo: 'Caio Cesar Guimarães', cpf: '470.581.692-43', data_nascimento: '1997-01-18', is_titular: true },
      { nome_completo: 'Leandro Pinto Ramos', cpf: '581.692.703-54', data_nascimento: '1992-05-23', is_titular: false }
    ]
  },
  {
    nome: 'Manilha de Ouro',
    cidade: 'Bela Vista de Minas - MG',
    foto_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&auto=format&fit=crop&q=80',
    jogadores: [
      { nome_completo: 'Renan Lucas Macedo', cpf: '258.147.369-05', data_nascimento: '1991-06-19', is_titular: true },
      { nome_completo: 'Wesley Douglas Freitas', cpf: '369.258.147-16', data_nascimento: '1993-11-27', is_titular: true },
      { nome_completo: 'Patrick Emanuel Borges', cpf: '470.369.258-27', data_nascimento: '1989-08-14', is_titular: true },
      { nome_completo: 'Renan Augusto Cardoso', cpf: '581.470.369-38', data_nascimento: '1996-04-03', is_titular: true },
      { nome_completo: 'Valdir Soares Cruz', cpf: '692.581.470-49', data_nascimento: '1987-10-10', is_titular: false }
    ]
  },
  {
    nome: 'Espadilha FC',
    cidade: 'Nova Era - MG',
    foto_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80',
    jogadores: [
      { nome_completo: 'Juliano César Vasconcelos', cpf: '369.147.258-99', data_nascimento: '1990-12-05', is_titular: true },
      { nome_completo: 'Marcelo Henrique Duarte', cpf: '470.258.369-88', data_nascimento: '1994-07-21', is_titular: true },
      { nome_completo: 'Fábio Rogério Santana', cpf: '581.369.470-77', data_nascimento: '1988-03-16', is_titular: true },
      { nome_completo: 'Ricardo Souza Campos', cpf: '692.470.581-66', data_nascimento: '1995-09-30', is_titular: true },
      { nome_completo: 'Reginaldo Bento Lima', cpf: '703.581.692-55', data_nascimento: '1992-02-14', is_titular: false }
    ]
  },
  {
    nome: 'Zap & Copas',
    cidade: 'Dionísio - MG',
    foto_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80',
    jogadores: [
      { nome_completo: 'Wanderson Alves Monteiro', cpf: '814.725.369-00', data_nascimento: '1991-05-18', is_titular: true },
      { nome_completo: 'Jonathan Silveira Reis', cpf: '925.836.470-11', data_nascimento: '1995-10-29', is_titular: true },
      { nome_completo: 'Cristiano Morais Fontes', cpf: '036.947.581-22', data_nascimento: '1989-01-12', is_titular: true },
      { nome_completo: 'Alan Douglas Pacheco', cpf: '147.058.692-33', data_nascimento: '1996-08-07', is_titular: true },
      { nome_completo: 'Everton Lucas Brandão', cpf: '258.169.703-44', data_nascimento: '1993-04-25', is_titular: false }
    ]
  }
];

/**
 * Insere as 08 equipes fictícias no banco de dados Supabase (Ação manual do Administrador).
 */
export const popularTimesFicticios = async (): Promise<TrucoEquipe[]> => {
  const novasEquipes: TrucoEquipe[] = [];

  for (const seed of TIMES_FICTICIOS_SEED) {
    const novaEqId = crypto.randomUUID();
    const novaEq: TrucoEquipe = {
      id: novaEqId,
      nome: seed.nome,
      cidade: seed.cidade,
      foto_url: seed.foto_url,
      status: 'aprovado',
      cadastro_regularizado: true,
      created_at: new Date().toISOString(),
      jogadores: seed.jogadores.map(j => ({
        id: crypto.randomUUID(),
        equipe_id: novaEqId,
        nome_completo: j.nome_completo,
        cpf: j.cpf,
        data_nascimento: j.data_nascimento,
        is_titular: j.is_titular,
        created_at: new Date().toISOString()
      }))
    };

    try {
      await supabase.from('truco_equipes').insert({
        id: novaEq.id,
        nome: novaEq.nome,
        cidade: novaEq.cidade,
        foto_url: novaEq.foto_url,
        status: novaEq.status,
        cadastro_regularizado: true
      });

      if (novaEq.jogadores && novaEq.jogadores.length > 0) {
        await supabase.from('truco_jogadores').insert(novaEq.jogadores);
      }
    } catch (e) {
      console.error('Erro ao inserir time ficticio no Supabase:', e);
    }

    novasEquipes.push(novaEq);
  }

  return novasEquipes;
};

// ==========================================
// SERVIÇOS DE EQUIPES E JOGADORES (SUPABASE)
// ==========================================

/**
 * Busca equipes cadastradas diretamente no banco de dados.
 * Por padrão (apenasAprovados = true), retorna EXCLUSIVAMENTE equipes com status 'aprovado' para telas públicas.
 * Para a área administrativa, use apenasAprovados = false ou buscarTodasEquipesAdmin().
 */
export const buscarEquipes = async (apenasAprovados: boolean = true): Promise<TrucoEquipe[]> => {
  try {
    let query = supabase
      .from('truco_equipes')
      .select('*')
      .order('nome', { ascending: true });

    if (apenasAprovados) {
      query = query.eq('status', 'aprovado');
    }

    const { data: equipesData, error: equipesError } = await query;

    if (equipesError) {
      console.error('Erro ao buscar equipes no Supabase:', equipesError);
      return [];
    }

    if (!equipesData || equipesData.length === 0) {
      return [];
    }

    const { data: jogadoresData, error: jogadoresError } = await supabase
      .from('truco_jogadores')
      .select('*');

    if (jogadoresError) {
      console.warn('Erro ao buscar jogadores no Supabase:', jogadoresError);
    }

    const equipesComJogadores: TrucoEquipe[] = equipesData.map((eq: any) => {
      const fotoFinal = (eq.foto_url && eq.foto_url.trim() !== '')
        ? eq.foto_url
        : obterImagemAleatoriaBaralho(eq.nome, eq.id || eq.nome);

      return {
        id: eq.id,
        nome: eq.nome,
        cidade: eq.cidade,
        foto_url: fotoFinal,
        status: (eq.status || 'aprovado') as TrucoStatusEquipe,
        cadastro_regularizado: eq.cadastro_regularizado !== false,
        created_at: eq.created_at,
        jogadores: (jogadoresData || []).filter((j: any) => j.equipe_id === eq.id)
      };
    });

    return equipesComJogadores;
  } catch (err) {
    console.error('Falha de conexão com o banco ao buscar equipes:', err);
    return [];
  }
};

/**
 * Busca todas as equipes para o Painel Administrativo (Pendentes, Aprovadas e Reprovadas).
 */
export const buscarTodasEquipesAdmin = async (): Promise<TrucoEquipe[]> => {
  return buscarEquipes(false);
};

export const excluirTodasEquipes = async (): Promise<void> => {
  try {
    await supabase.from('truco_jogadores').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('truco_partidas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('truco_equipes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  } catch (e) {
    console.error('Erro ao excluir todas equipes no Supabase:', e);
  }

  await resetarTorneio();
};

/**
 * Realiza o cadastro de uma nova equipe no banco de dados.
 * OBRIGATÓRIO: Toda nova equipe entra com status 'pendente' aguardando moderação admin.
 * Caso nenhuma foto seja informada, uma imagem oficial de baralho personalizada com o NOME DO TIME é gerada automaticamente.
 */
export const cadastrarEquipe = async (
  dados: { nome: string; cidade: string; foto_url?: string; cadastro_regularizado?: boolean },
  jogadores: { nome_completo: string; cpf?: string; data_nascimento: string; is_titular?: boolean }[],
  fotoFile?: File | null
): Promise<TrucoEquipe> => {
  let fotoUrlFinal = dados.foto_url || '';

  // Upload no Supabase Storage se houver arquivo
  if (fotoFile) {
    try {
      const fileExt = fotoFile.name.split('.').pop() || 'png';
      const fileName = `truco_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `truco-equipes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('expogoiabal')
        .upload(filePath, fotoFile, { cacheControl: '3600', upsert: true });

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('expogoiabal')
          .getPublicUrl(filePath);
        fotoUrlFinal = publicUrl;
      } else {
        // Fallback para Base64 caso o bucket não esteja configurado
        fotoUrlFinal = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(fotoFile);
        });
      }
    } catch (e) {
      console.warn('Falha no upload de imagem:', e);
    }
  }

  const novaEquipeId = crypto.randomUUID();
  const statusInicial: TrucoStatusEquipe = 'pendente';

  // Se nenhuma foto foi enviada, gera o escudo oficial temático de baralho com o NOME DO TIME
  if (!fotoUrlFinal || fotoUrlFinal.trim() === '') {
    fotoUrlFinal = obterImagemAleatoriaBaralho(dados.nome, novaEquipeId);
  }

  // Se cadastro_regularizado não for passado explicitamente, verifica se todos os jogadores possuem CPF completo informado
  const todosJogadoresComCpf = jogadores.length > 0 && jogadores.every(j => Boolean(j.cpf && j.cpf.replace(/\D/g, '').length === 11));
  const isRegularizado = dados.cadastro_regularizado !== undefined ? dados.cadastro_regularizado : todosJogadoresComCpf;

  const novaEquipe: TrucoEquipe = {
    id: novaEquipeId,
    nome: dados.nome.trim(),
    cidade: dados.cidade.trim(),
    foto_url: fotoUrlFinal,
    status: statusInicial,
    cadastro_regularizado: isRegularizado,
    created_at: new Date().toISOString()
  };

  try {
    const { error: equipeError } = await supabase
      .from('truco_equipes')
      .insert({
        id: novaEquipe.id,
        nome: novaEquipe.nome,
        cidade: novaEquipe.cidade,
        foto_url: novaEquipe.foto_url,
        status: novaEquipe.status,
        cadastro_regularizado: novaEquipe.cadastro_regularizado
      });

    if (equipeError) {
      console.error('Erro ao cadastrar equipe no Supabase:', equipeError);
      throw new Error(`Erro ao salvar equipe no banco de dados: ${equipeError.message}`);
    }

    const jogadoresFormatados: TrucoJogador[] = jogadores.map((j, idx) => ({
      id: crypto.randomUUID(),
      equipe_id: novaEquipeId,
      nome_completo: j.nome_completo.trim(),
      cpf: j.cpf ? j.cpf.trim() : '',
      data_nascimento: j.data_nascimento,
      is_titular: j.is_titular !== undefined ? j.is_titular : idx < 4,
      created_at: new Date().toISOString()
    }));

    if (jogadoresFormatados.length > 0) {
      const { error: jogadoresError } = await supabase
        .from('truco_jogadores')
        .insert(jogadoresFormatados);

      if (jogadoresError) {
        console.warn('Erro ao cadastrar jogadores no Supabase:', jogadoresError);
      }
    }

    return {
      ...novaEquipe,
      jogadores: jogadoresFormatados
    };
  } catch (err: any) {
    console.error('Falha de inserção no Supabase:', err);
    throw err;
  }
};

/**
 * Atualiza todas as informações de uma equipe e de seus jogadores no banco de dados.
 */
export const atualizarEquipeCompleta = async (
  equipeId: string,
  dados: {
    nome: string;
    cidade: string;
    foto_url?: string;
    status: TrucoStatusEquipe;
    cadastro_regularizado?: boolean;
  },
  jogadores: {
    id?: string;
    nome_completo: string;
    cpf?: string;
    data_nascimento: string;
    is_titular?: boolean;
  }[],
  fotoFile?: File | null
): Promise<TrucoEquipe> => {
  let fotoUrlFinal = dados.foto_url || '';

  // Upload no Supabase Storage se houver arquivo novo
  if (fotoFile) {
    try {
      const fileExt = fotoFile.name.split('.').pop() || 'png';
      const fileName = `truco_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `truco-equipes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('expogoiabal')
        .upload(filePath, fotoFile, { cacheControl: '3600', upsert: true });

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('expogoiabal')
          .getPublicUrl(filePath);
        fotoUrlFinal = publicUrl;
      } else {
        fotoUrlFinal = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(fotoFile);
        });
      }
    } catch (e) {
      console.warn('Falha no upload de imagem:', e);
    }
  }

  const todosJogadoresComCpf = jogadores.length > 0 && jogadores.every(j => Boolean(j.cpf && j.cpf.replace(/\D/g, '').length === 11));
  const isRegularizado = dados.cadastro_regularizado !== undefined ? dados.cadastro_regularizado : todosJogadoresComCpf;

  // Se a foto estiver vazia, atribui uma imagem temática de baralho com o NOME DO TIME
  if (!fotoUrlFinal || fotoUrlFinal.trim() === '') {
    fotoUrlFinal = obterImagemAleatoriaBaralho(dados.nome, equipeId);
  }

  // 1. Atualiza dados da equipe
  const { error: eqError } = await supabase
    .from('truco_equipes')
    .update({
      nome: dados.nome.trim(),
      cidade: dados.cidade.trim(),
      foto_url: fotoUrlFinal,
      status: dados.status,
      cadastro_regularizado: isRegularizado,
      updated_at: new Date().toISOString()
    })
    .eq('id', equipeId);

  if (eqError) {
    console.error('Erro ao atualizar equipe no Supabase:', eqError);
    throw new Error(`Erro ao salvar alterações da equipe: ${eqError.message}`);
  }

  // 2. Atualiza a lista de jogadores
  try {
    await supabase.from('truco_jogadores').delete().eq('equipe_id', equipeId);

    const jogadoresFormatados: TrucoJogador[] = jogadores.map((j, idx) => ({
      id: j.id && !j.id.startsWith('temp_') ? j.id : crypto.randomUUID(),
      equipe_id: equipeId,
      nome_completo: j.nome_completo.trim(),
      cpf: j.cpf ? j.cpf.trim() : '',
      data_nascimento: j.data_nascimento,
      is_titular: j.is_titular !== undefined ? j.is_titular : idx < 4,
      created_at: new Date().toISOString()
    }));

    if (jogadoresFormatados.length > 0) {
      const { error: jogError } = await supabase
        .from('truco_jogadores')
        .insert(jogadoresFormatados);

      if (jogError) {
        console.warn('Erro ao atualizar jogadores no Supabase:', jogError);
      }
    }

    return {
      id: equipeId,
      nome: dados.nome.trim(),
      cidade: dados.cidade.trim(),
      foto_url: fotoUrlFinal,
      status: dados.status,
      cadastro_regularizado: isRegularizado,
      jogadores: jogadoresFormatados
    };
  } catch (err: any) {
    console.error('Falha de sincronização de jogadores:', err);
    throw err;
  }
};

/**
 * Atualiza o status de aprovação de uma equipe no banco de dados (pendente, aprovado, reprovado).
 */
export const atualizarStatusEquipe = async (
  equipeId: string, 
  novoStatus: TrucoStatusEquipe
): Promise<void> => {
  const { error } = await supabase
    .from('truco_equipes')
    .update({ status: novoStatus, updated_at: new Date().toISOString() })
    .eq('id', equipeId);

  if (error) {
    console.error('Erro ao atualizar status da equipe no Supabase:', error);
    throw new Error(`Falha ao atualizar status no banco: ${error.message}`);
  }
};

/**
 * Aprova um time cadastrado (torna participante oficial do torneio).
 */
export const aprovarEquipe = async (equipeId: string): Promise<void> => {
  return atualizarStatusEquipe(equipeId, 'aprovado');
};

/**
 * Reprova um time cadastrado (remove do torneio e oculta publicamente).
 */
export const reprovarEquipe = async (equipeId: string): Promise<void> => {
  return atualizarStatusEquipe(equipeId, 'reprovado');
};

/**
 * Exclui definitivamente uma equipe e seus registros associados do banco de dados.
 */
export const excluirEquipe = async (equipeId: string): Promise<void> => {
  try {
    await supabase.from('truco_jogadores').delete().eq('equipe_id', equipeId);
    await supabase.from('truco_partidas').delete().or(`time_a_id.eq.${equipeId},time_b_id.eq.${equipeId}`);
    const { error } = await supabase.from('truco_equipes').delete().eq('id', equipeId);
    if (error) {
      console.error('Erro ao excluir equipe no Supabase:', error);
    }
  } catch (e) {
    console.error('Erro ao excluir equipe no Supabase:', e);
  }
};

// ==========================================
// STATUS DO TORNEIO (SUPABASE)
// ==========================================

export const buscarStatusTorneio = async (): Promise<TrucoTorneioStatus> => {
  try {
    const { data, error } = await supabase
      .from('truco_torneio_status')
      .select('*')
      .eq('id', 'main')
      .maybeSingle();

    if (!error && data) {
      return {
        id: data.id,
        fase_atual: data.fase_atual,
        sorteio_primeira_fase_confirmado: Boolean(data.sorteio_primeira_fase_confirmado),
        sorteio_mata_mata_confirmado: Boolean(data.sorteio_mata_mata_confirmado),
        sorteio_iniciado_em: data.sorteio_iniciado_em,
        sorteio_animacao_ativa: Boolean(data.sorteio_animacao_ativa),
        top8_equipes_ids: typeof data.top8_equipes_ids === 'string' ? JSON.parse(data.top8_equipes_ids) : (data.top8_equipes_ids || []),
        grupo_a_equipes_ids: typeof data.grupo_a_equipes_ids === 'string' ? JSON.parse(data.grupo_a_equipes_ids) : (data.grupo_a_equipes_ids || []),
        grupo_b_equipes_ids: typeof data.grupo_b_equipes_ids === 'string' ? JSON.parse(data.grupo_b_equipes_ids) : (data.grupo_b_equipes_ids || []),
        campeao_equipe_id: data.campeao_equipe_id
      };
    }

    // Se ainda não existir registro no Supabase, cria o registro inicial padrão
    await supabase.from('truco_torneio_status').upsert(DEFAULT_STATUS);
    return DEFAULT_STATUS;
  } catch (err) {
    console.error('Erro ao buscar status do torneio no Supabase:', err);
    return DEFAULT_STATUS;
  }
};

export const salvarStatusTorneio = async (status: Partial<TrucoTorneioStatus>): Promise<TrucoTorneioStatus> => {
  const current = await buscarStatusTorneio();
  const updated: TrucoTorneioStatus = {
    ...current,
    ...status,
    id: 'main'
  };

  try {
    const { error } = await supabase
      .from('truco_torneio_status')
      .upsert({
        id: 'main',
        fase_atual: updated.fase_atual,
        sorteio_primeira_fase_confirmado: updated.sorteio_primeira_fase_confirmado,
        sorteio_mata_mata_confirmado: updated.sorteio_mata_mata_confirmado,
        sorteio_iniciado_em: updated.sorteio_iniciado_em,
        sorteio_animacao_ativa: updated.sorteio_animacao_ativa,
        top8_equipes_ids: updated.top8_equipes_ids,
        grupo_a_equipes_ids: updated.grupo_a_equipes_ids,
        grupo_b_equipes_ids: updated.grupo_b_equipes_ids,
        campeao_equipe_id: updated.campeao_equipe_id,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erro ao salvar status no Supabase:', error);
    }
  } catch (e) {
    console.error('Erro ao salvar status no Supabase:', e);
  }

  return updated;
};

// ==========================================
// GERAÇÃO MATEMÁTICA ROUND-ROBIN (CIRCLE METHOD)
// ==========================================

export interface RoundRobinConfronto {
  rodada: number;
  numero_jogo: number;
  time_a_id: string;
  time_b_id: string;
}

/**
 * Verifica se a cidade da equipe é de fora (diferente de "São José do Goiabal - MG" / Goiabal)
 */
export const isTimeDeFora = (cidade?: string): boolean => {
  if (!cidade) return false;
  const normalizada = cidade.trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return !normalizada.includes('goiabal');
};

export interface RoundRobinConfronto {
  rodada: number;
  numero_jogo: number;
  time_a_id: string;
  time_b_id: string;
}

export interface RoundRobinResultado {
  confrontos: RoundRobinConfronto[];
  numRodadas: number;
  jogosPorRodada: number;
  totalJogos: number;
  equipeFolgaRodada1Id?: string | null;
}

/**
 * Algoritmo canônico do Método do Círculo (Polygon / Circle Method)
 * Suporta quantidades PARES e ÍMPARES de equipes.
 * 
 * Para quantidade PAR (N):
 * - Rodadas = N - 1
 * - Jogos por Rodada = N / 2
 * - Total de Jogos = N * (N - 1) / 2
 * - Todos jogam simultaneamente a cada rodada
 * 
 * Para quantidade ÍMPAR (N):
 * - Rodadas = N
 * - Jogos por Rodada = (N - 1) / 2
 * - Total de Jogos = N * (N - 1) / 2
 * - Exatamente 1 equipe folga por rodada de forma rotativa programada
 * - Na Rodada 1, o time selecionado (último cadastrado) folga
 * - Todos jogam contra todos exatamente 1 vez no campeonato completo
 */
export const gerarRoundRobin = (
  equipesIds: string[], 
  timeFolgaRodada1Id?: string
): RoundRobinResultado => {
  const n = equipesIds.length;
  if (n < 2) {
    throw new Error('É necessário ter no mínimo 2 equipes para gerar confrontos.');
  }

  const isImpar = n % 2 !== 0;
  const confrontos: RoundRobinConfronto[] = [];
  let contadorJogo = 1;

  if (!isImpar) {
    // ==========================================
    // CASO PAR: N equipes, N-1 rodadas, N/2 jogos/rodada
    // ==========================================
    const numRodadas = n - 1;
    const jogosPorRodada = n / 2;
    const totalJogos = (n * (n - 1)) / 2;

    const rotating = equipesIds.slice(1);
    const rotatingLen = rotating.length;

    for (let r = 0; r < numRodadas; r++) {
      const rodadaNumero = r + 1;

      // Jogo 1 da rodada: time fixo contra o time que está na rotação
      const timeFixo = equipesIds[0];
      const timeMovel1 = rotating[r % rotatingLen];

      if (r % 2 === 0) {
        confrontos.push({
          rodada: rodadaNumero,
          numero_jogo: contadorJogo++,
          time_a_id: timeFixo,
          time_b_id: timeMovel1
        });
      } else {
        confrontos.push({
          rodada: rodadaNumero,
          numero_jogo: contadorJogo++,
          time_a_id: timeMovel1,
          time_b_id: timeFixo
        });
      }

      // Demais jogos da rodada conectando os pares opostos no círculo
      for (let k = 1; k < jogosPorRodada; k++) {
        const idxA = (r + k) % rotatingLen;
        const idxB = (r - k + rotatingLen) % rotatingLen;

        const timeA = rotating[idxA];
        const timeB = rotating[idxB];

        confrontos.push({
          rodada: rodadaNumero,
          numero_jogo: contadorJogo++,
          time_a_id: timeA,
          time_b_id: timeB
        });
      }
    }

    return {
      confrontos,
      numRodadas,
      jogosPorRodada,
      totalJogos,
      equipeFolgaRodada1Id: null
    };
  } else {
    // ==========================================
    // CASO ÍMPAR: N equipes, N rodadas, (N-1)/2 jogos/rodada
    // Utiliza um elemento virtual '__BYE__' emparelhado no círculo.
    // ==========================================
    const numRodadas = n;
    const jogosPorRodada = Math.floor(n / 2);
    const totalJogos = (n * (n - 1)) / 2;

    // Se foi informada uma equipe específica para folgar na Rodada 1,
    // garantimos que ela esteja na primeira posição do rotating (índice 0),
    // pois na Rodada 1 (r=0), rotating[0] é o time emparelhado com o BYE.
    let rotatingList = [...equipesIds];
    if (timeFolgaRodada1Id && rotatingList.includes(timeFolgaRodada1Id)) {
      rotatingList = [
        timeFolgaRodada1Id,
        ...rotatingList.filter(id => id !== timeFolgaRodada1Id)
      ];
    }

    for (let r = 0; r < numRodadas; r++) {
      const rodadaNumero = r + 1;

      // Na rodada r, o time que folga é rotatingList[r % n]
      // Os outros N-1 times são emparelhados em pares simétricos
      for (let k = 1; k <= jogosPorRodada; k++) {
        const idxA = (r + k) % n;
        const idxB = (r - k + n) % n;

        const timeA = rotatingList[idxA];
        const timeB = rotatingList[idxB];

        if (r % 2 === 0) {
          confrontos.push({
            rodada: rodadaNumero,
            numero_jogo: contadorJogo++,
            time_a_id: timeA,
            time_b_id: timeB
          });
        } else {
          confrontos.push({
            rodada: rodadaNumero,
            numero_jogo: contadorJogo++,
            time_a_id: timeB,
            time_b_id: timeA
          });
        }
      }
    }

    return {
      confrontos,
      numRodadas,
      jogosPorRodada,
      totalJogos,
      equipeFolgaRodada1Id: timeFolgaRodada1Id || rotatingList[0]
    };
  }
};

/**
 * Embaralha as equipes e gera os confrontos da 1ª Fase
 * Suporta quantidade PAR e ÍMPAR de equipes.
 * 
 * Regra Obrigatória para a Rodada 1:
 * - Todos os times de fora da cidade (cidade != "São José do Goiabal - MG") jogam hoje.
 * - Caso a quantidade de equipes seja ímpar, o último time cadastrado folga hoje na Rodada 1.
 * - Todas as demais partidas do time que folgou são agendadas para as rodadas seguintes,
 *   preservando o formato Todos contra Todos completo.
 */
export const realizarSorteioPrimeiraFase = (
  equipes: TrucoEquipe[],
  equipeFolgaIdDesejada?: string
): {
  equipesSorteadaOrdem: TrucoEquipe[];
  numRodadas: number;
  jogosPorRodada: number;
  totalJogos: number;
  partidasGeradas: TrucoPartida[];
  equipeFolgaRodada1?: TrucoEquipe | null;
} => {
  const equipesAprovadas = equipes.filter(e => (e.status || 'aprovado') === 'aprovado');

  if (equipesAprovadas.length < 3) {
    throw new Error('O torneio precisa ter no mínimo 3 equipes APROVADAS para realizar o sorteio.');
  }

  const isImpar = equipesAprovadas.length % 2 !== 0;

  // Determinar a equipe que folga na Rodada 1 caso seja ímpar:
  // Regra:
  // 1. Se informada equipeFolgaIdDesejada, usa ela.
  // 2. Se houver o time "GENERAL", ele é o time definido para folgar na 1ª rodada.
  // 3. Todos os times de fora da cidade DEVEM jogar hoje.
  // 4. Caso contrário, o último time cadastrado local (Goiabal) fica sem jogar hoje.
  let equipeFolgaRodada1: TrucoEquipe | null = null;
  if (isImpar) {
    if (equipeFolgaIdDesejada) {
      equipeFolgaRodada1 = equipesAprovadas.find(e => e.id === equipeFolgaIdDesejada) || null;
    }

    if (!equipeFolgaRodada1) {
      const timeGeneral = equipesAprovadas.find(e => e.nome.trim().toUpperCase().includes('GENERAL'));
      if (timeGeneral) {
        equipeFolgaRodada1 = timeGeneral;
      } else {
        const timesLocais = equipesAprovadas.filter(e => !isTimeDeFora(e.cidade));
        if (timesLocais.length > 0) {
          equipeFolgaRodada1 = timesLocais[timesLocais.length - 1];
        } else {
          equipeFolgaRodada1 = equipesAprovadas[equipesAprovadas.length - 1];
        }
      }
    }
  }

  // Embaralha as equipes (Fisher-Yates) mantendo a equipe de folga isolada para a posição correta
  const poolParaSorteio = equipesAprovadas.filter(e => e.id !== equipeFolgaRodada1?.id);
  const shuffled = [...poolParaSorteio];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const equipesSorteadaOrdem: TrucoEquipe[] = equipeFolgaRodada1 
    ? [equipeFolgaRodada1, ...shuffled] 
    : [...shuffled];

  const roundRobinRes = gerarRoundRobin(
    equipesSorteadaOrdem.map(e => e.id), 
    equipeFolgaRodada1?.id
  );

  const partidasGeradas: TrucoPartida[] = roundRobinRes.confrontos.map((conf) => ({
    id: crypto.randomUUID(),
    tipo_fase: 'primeira_fase',
    rodada: conf.rodada,
    numero_jogo: conf.numero_jogo,
    time_a_id: conf.time_a_id,
    time_b_id: conf.time_b_id,
    pontos_time_a: 0,
    pontos_time_b: 0,
    vencedor_id: null,
    status: 'agendada',
    fase_nome: `Rodada ${String(conf.rodada).padStart(2, '0')}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  return {
    equipesSorteadaOrdem,
    numRodadas: roundRobinRes.numRodadas,
    jogosPorRodada: roundRobinRes.jogosPorRodada,
    totalJogos: roundRobinRes.totalJogos,
    partidasGeradas,
    equipeFolgaRodada1
  };
};

export const confirmarSorteioPrimeiraFase = async (partidas: TrucoPartida[]): Promise<void> => {
  try {
    await supabase.from('truco_partidas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('truco_partidas').insert(partidas.map(p => ({
      id: p.id,
      tipo_fase: p.tipo_fase,
      rodada: p.rodada,
      numero_jogo: p.numero_jogo,
      time_a_id: p.time_a_id,
      time_b_id: p.time_b_id,
      pontos_time_a: 0,
      pontos_time_b: 0,
      vencedor_id: null,
      status: 'agendada',
      fase_nome: p.fase_nome
    })));
  } catch (e) {
    console.error('Erro ao salvar partidas no Supabase:', e);
  }

  await salvarStatusTorneio({
    fase_atual: 'primeira_fase',
    sorteio_primeira_fase_confirmado: true,
    sorteio_mata_mata_confirmado: false,
    sorteio_iniciado_em: new Date().toISOString(),
    sorteio_animacao_ativa: true,
    top8_equipes_ids: [],
    grupo_a_equipes_ids: [],
    grupo_b_equipes_ids: [],
    campeao_equipe_id: null
  });
};

/**
 * Aciona o sorteio oficial pelo Administrador e dispara a transmissão pública
 */
export const acionarSorteioPublicoAdmin = async (
  equipes: TrucoEquipe[],
  equipeFolgaIdDesejada?: string
): Promise<{ sucesso: boolean; mensagem: string }> => {
  const equipesAprovadas = equipes.filter(e => (e.status || 'aprovado') === 'aprovado');

  if (equipesAprovadas.length < 3) {
    return { sucesso: false, mensagem: 'É necessário ter pelo menos 3 equipes APROVADAS para realizar o sorteio.' };
  }

  const resultado = realizarSorteioPrimeiraFase(equipesAprovadas, equipeFolgaIdDesejada);
  if (!resultado || resultado.partidasGeradas.length === 0) {
    return { sucesso: false, mensagem: 'Falha ao gerar os confrontos da primeira fase.' };
  }

  await confirmarSorteioPrimeiraFase(resultado.partidasGeradas);

  const msgFolga = resultado.equipeFolgaRodada1 
    ? ` (Quantidade ímpar: ${equipesAprovadas.length} equipes. A equipe "${resultado.equipeFolgaRodada1.nome}" folga na Rodada 1 e jogará nas rodadas seguintes)` 
    : '';

  return { 
    sucesso: true, 
    mensagem: `Sorteio ativado com sucesso! ${resultado.partidasGeradas.length} partidas geradas em ${resultado.numRodadas} rodadas com as ${equipesAprovadas.length} equipes aprovadas.${msgFolga}` 
  };
};

/**
 * Conclui ou desativa a exibição forçada da animação no telão público
 */
export const concluirAnimacaoSorteio = async (): Promise<void> => {
  const status = await buscarStatusTorneio();
  await salvarStatusTorneio({
    ...status,
    sorteio_animacao_ativa: false
  });
};

export const resetarTorneio = async (): Promise<void> => {
  try {
    await supabase.from('truco_partidas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  } catch (e) {
    console.error('Erro ao resetar partidas no Supabase:', e);
  }

  await salvarStatusTorneio({
    fase_atual: 'inscricao',
    sorteio_primeira_fase_confirmado: false,
    sorteio_mata_mata_confirmado: false,
    sorteio_iniciado_em: null,
    sorteio_animacao_ativa: false,
    top8_equipes_ids: [],
    grupo_a_equipes_ids: [],
    grupo_b_equipes_ids: [],
    campeao_equipe_id: null
  });
};

// ==========================================
// CONSULTA E ATUALIZAÇÃO DE PARTIDAS (SUPABASE)
// ==========================================

export const buscarPartidas = async (): Promise<TrucoPartida[]> => {
  try {
    const { data: partidasData, error } = await supabase
      .from('truco_partidas')
      .select('*')
      .order('numero_jogo', { ascending: true });

    if (!error && partidasData) {
      return partidasData;
    }
  } catch (err) {
    console.error('Erro ao buscar partidas no Supabase:', err);
  }

  return [];
};

export const registrarResultadoPartida = async (
  partidaId: string,
  pontosA: number,
  pontosB: number,
  status: 'agendada' | 'em_andamento' | 'finalizada' = 'finalizada'
): Promise<TrucoPartida | null> => {
  const partidas = await buscarPartidas();
  const partida = partidas.find(p => p.id === partidaId);
  if (!partida) return null;

  let vencedorId: string | null = null;
  if (status === 'finalizada') {
    if (pontosA > pontosB) vencedorId = partida.time_a_id;
    else if (pontosB > pontosA) vencedorId = partida.time_b_id;
  }

  const payload = {
    pontos_time_a: pontosA,
    pontos_time_b: pontosB,
    vencedor_id: vencedorId,
    status,
    updated_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('truco_partidas')
      .update(payload)
      .eq('id', partidaId)
      .select()
      .single();

    if (!error && data) {
      // Se for partida do mata-mata, atualiza chaveamento subsequente
      if (data.tipo_fase !== 'primeira_fase') {
        const todasPartidasAtualizadas = partidas.map(p => p.id === partidaId ? { ...p, ...data } : p);
        await atualizarChaveamentoMataMata(todasPartidasAtualizadas);
      }
      return data;
    }
  } catch (err) {
    console.error('Erro ao registrar resultado da partida no Supabase:', err);
  }

  return null;
};

// ==========================================
// CÁLCULO DE CLASSIFICAÇÃO DA 1ª FASE
// ==========================================

export const calcularClassificacao = (
  equipes: TrucoEquipe[],
  partidas: TrucoPartida[]
): TrucoClassificacaoRow[] => {
  const mapStats = new Map<string, {
    jogos: number;
    vitorias: number;
    empates: number;
    derrotas: number;
    pontos: number;
    pontosMarcados: number;
    pontosSofridos: number;
    saldoPontos: number;
  }>();

  equipes.forEach(eq => {
    mapStats.set(eq.id, {
      jogos: 0,
      vitorias: 0,
      empates: 0,
      derrotas: 0,
      pontos: 0,
      pontosMarcados: 0,
      pontosSofridos: 0,
      saldoPontos: 0
    });
  });

  const partidasPrimeiraFaseFinalizadas = partidas.filter(
    p => p.tipo_fase === 'primeira_fase' && p.status === 'finalizada'
  );

  partidasPrimeiraFaseFinalizadas.forEach(partida => {
    if (!partida.time_a_id || !partida.time_b_id) return;

    const statsA = mapStats.get(partida.time_a_id);
    const statsB = mapStats.get(partida.time_b_id);

    if (!statsA || !statsB) return;

    const ptsA = Number(partida.pontos_time_a) || 0;
    const ptsB = Number(partida.pontos_time_b) || 0;

    statsA.jogos += 1;
    statsB.jogos += 1;

    statsA.pontosMarcados += ptsA;
    statsA.pontosSofridos += ptsB;
    statsA.saldoPontos = statsA.pontosMarcados - statsA.pontosSofridos;

    statsB.pontosMarcados += ptsB;
    statsB.pontosSofridos += ptsA;
    statsB.saldoPontos = statsB.pontosMarcados - statsB.pontosSofridos;

    if (ptsA > ptsB) {
      statsA.vitorias += 1;
      statsA.pontos += 3;
      statsB.derrotas += 1;
    } else if (ptsB > ptsA) {
      statsB.vitorias += 1;
      statsB.pontos += 3;
      statsA.derrotas += 1;
    } else {
      // Partida terminada empatada com mesmo saldo de pontos (1 ponto para cada time)
      statsA.empates += 1;
      statsA.pontos += 1;
      statsB.empates += 1;
      statsB.pontos += 1;
    }
  });

  const temJogosDisputados = partidasPrimeiraFaseFinalizadas.length > 0;

  const listaClassificacao: TrucoClassificacaoRow[] = equipes.map(equipe => {
    const stats = mapStats.get(equipe.id) || {
      jogos: 0,
      vitorias: 0,
      empates: 0,
      derrotas: 0,
      pontos: 0,
      pontosMarcados: 0,
      pontosSofridos: 0,
      saldoPontos: 0
    };

    return {
      posicao: 1,
      equipe,
      isElegivelPremiacao: equipe.cadastro_regularizado !== false,
      ...stats
    };
  });

  listaClassificacao.sort((a, b) => {
    if (!temJogosDisputados) {
      return a.equipe.nome.localeCompare(b.equipe.nome, 'pt-BR');
    }

    // 1º Maior número de pontos
    if (b.pontos !== a.pontos) return b.pontos - a.pontos;
    // 2º Maior número de vitórias
    if (b.vitorias !== a.vitorias) return b.vitorias - a.vitorias;
    // 3º Melhor saldo de pontos (Marcada - Sofrida)
    if (b.saldoPontos !== a.saldoPontos) return b.saldoPontos - a.saldoPontos;
    // 4º Maior pontuação marcada
    if (b.pontosMarcados !== a.pontosMarcados) return b.pontosMarcados - a.pontosMarcados;
    // 5º Ordem alfabética
    return a.equipe.nome.localeCompare(b.equipe.nome, 'pt-BR');
  });

  let contadorPremiadosElegiveis = 0;

  return listaClassificacao.map((item, index) => {
    const posicaoGeral = index + 1;
    const isElegivel = item.equipe.cadastro_regularizado !== false;

    let motivoInelegibilidade: string | undefined = undefined;
    let premiacaoPosicao: number | undefined = undefined;
    let premiacaoTitulo: string | undefined = undefined;
    let premiacaoEmoji: string | undefined = undefined;
    let premiacaoValor: number | undefined = undefined;
    let premiacaoFormatada: string | undefined = undefined;

    if (!isElegivel) {
      motivoInelegibilidade = 'Cadastro sem CPF / Não regularizado';
    } else {
      if (contadorPremiadosElegiveis < TABELA_PREMIACOES_TRUCO.length) {
        const premio = TABELA_PREMIACOES_TRUCO[contadorPremiadosElegiveis];
        premiacaoPosicao = premio.posicaoPremiado;
        premiacaoTitulo = premio.titulo;
        premiacaoEmoji = premio.emoji;
        premiacaoValor = premio.valor;
        premiacaoFormatada = premio.valorFormatado;
        contadorPremiadosElegiveis++;
      }
    }

    return {
      ...item,
      posicao: posicaoGeral,
      isElegivelPremiacao: isElegivel,
      motivoInelegibilidade,
      premiacaoPosicao,
      premiacaoTitulo,
      premiacaoEmoji,
      premiacaoValor,
      premiacaoFormatada
    };
  });
};

// ==========================================
// ENCERRAMENTO DA 1ª FASE & APURAÇÃO DO TOP 8
// ==========================================

export const encerrarPrimeiraFase = async (
  equipes: TrucoEquipe[],
  partidas: TrucoPartida[]
): Promise<{ top8Equipes: TrucoEquipe[]; sucesso: boolean; mensagem?: string }> => {
  const partidas1aFase = partidas.filter(p => p.tipo_fase === 'primeira_fase');
  const pendentes = partidas1aFase.filter(p => p.status !== 'finalizada');

  if (pendentes.length > 0) {
    throw new Error(`A primeira fase não pode ser encerrada. Ainda existem ${pendentes.length} partida(s) pendente(s).`);
  }

  const ranking = calcularClassificacao(equipes, partidas);
  const top8Ranking = ranking.slice(0, 8);
  const top8Ids = top8Ranking.map(r => r.equipe.id);

  await salvarStatusTorneio({
    fase_atual: 'primeira_fase_encerrada',
    top8_equipes_ids: top8Ids
  });

  return {
    top8Equipes: top8Ranking.map(r => r.equipe),
    sucesso: true
  };
};

// ==========================================
// SORTEIO E GERAÇÃO DO MATA-MATA (TOP 8)
// ==========================================

export const realizarSorteioMataMata = async (top8Equipes: TrucoEquipe[]): Promise<{
  grupoA: TrucoEquipe[];
  grupoB: TrucoEquipe[];
  partidasMataMata: TrucoPartida[];
}> => {
  if (top8Equipes.length < 8) {
    throw new Error('É necessário ter 8 equipes classificadas para sortear o Mata-Mata.');
  }

  const shuffled = [...top8Equipes];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const grupoA = shuffled.slice(0, 4);
  const grupoB = shuffled.slice(4, 8);

  const partidasMataMata: TrucoPartida[] = [
    // GRUPO A - SEMIFINAIS
    {
      id: crypto.randomUUID(),
      tipo_fase: 'semi_a1',
      rodada: 1,
      numero_jogo: 101,
      time_a_id: grupoA[0].id,
      time_b_id: grupoA[1].id,
      pontos_time_a: 0,
      pontos_time_b: 0,
      vencedor_id: null,
      status: 'agendada',
      fase_nome: 'Semifinal A1'
    },
    {
      id: crypto.randomUUID(),
      tipo_fase: 'semi_a2',
      rodada: 1,
      numero_jogo: 102,
      time_a_id: grupoA[2].id,
      time_b_id: grupoA[3].id,
      pontos_time_a: 0,
      pontos_time_b: 0,
      vencedor_id: null,
      status: 'agendada',
      fase_nome: 'Semifinal A2'
    },
    // GRUPO A - FINAL
    {
      id: crypto.randomUUID(),
      tipo_fase: 'final_a',
      rodada: 2,
      numero_jogo: 103,
      time_a_id: null,
      time_b_id: null,
      pontos_time_a: 0,
      pontos_time_b: 0,
      vencedor_id: null,
      status: 'agendada',
      fase_nome: 'Final do Grupo A'
    },
    // GRUPO B - SEMIFINAIS
    {
      id: crypto.randomUUID(),
      tipo_fase: 'semi_b1',
      rodada: 1,
      numero_jogo: 104,
      time_a_id: grupoB[0].id,
      time_b_id: grupoB[1].id,
      pontos_time_a: 0,
      pontos_time_b: 0,
      vencedor_id: null,
      status: 'agendada',
      fase_nome: 'Semifinal B1'
    },
    {
      id: crypto.randomUUID(),
      tipo_fase: 'semi_b2',
      rodada: 1,
      numero_jogo: 105,
      time_a_id: grupoB[2].id,
      time_b_id: grupoB[3].id,
      pontos_time_a: 0,
      pontos_time_b: 0,
      vencedor_id: null,
      status: 'agendada',
      fase_nome: 'Semifinal B2'
    },
    // GRUPO B - FINAL
    {
      id: crypto.randomUUID(),
      tipo_fase: 'final_b',
      rodada: 2,
      numero_jogo: 106,
      time_a_id: null,
      time_b_id: null,
      pontos_time_a: 0,
      pontos_time_b: 0,
      vencedor_id: null,
      status: 'agendada',
      fase_nome: 'Final do Grupo B'
    },
    // GRANDE FINAL
    {
      id: crypto.randomUUID(),
      tipo_fase: 'grande_final',
      rodada: 3,
      numero_jogo: 107,
      time_a_id: null,
      time_b_id: null,
      pontos_time_a: 0,
      pontos_time_b: 0,
      vencedor_id: null,
      status: 'agendada',
      fase_nome: 'Grande Final do Torneio'
    }
  ];

  return {
    grupoA,
    grupoB,
    partidasMataMata
  };
};

export const confirmarSorteioMataMata = async (
  grupoA: TrucoEquipe[],
  grupoB: TrucoEquipe[],
  partidasMataMata: TrucoPartida[]
): Promise<void> => {
  try {
    await supabase.from('truco_partidas').delete().neq('tipo_fase', 'primeira_fase');
    await supabase.from('truco_partidas').insert(partidasMataMata.map(p => ({
      id: p.id,
      tipo_fase: p.tipo_fase,
      rodada: p.rodada,
      numero_jogo: p.numero_jogo,
      time_a_id: p.time_a_id,
      time_b_id: p.time_b_id,
      pontos_time_a: 0,
      pontos_time_b: 0,
      vencedor_id: null,
      status: 'agendada',
      fase_nome: p.fase_nome
    })));
  } catch (e) {
    console.error('Erro ao salvar mata-mata no Supabase:', e);
  }

  await salvarStatusTorneio({
    fase_atual: 'mata_mata',
    sorteio_mata_mata_confirmado: true,
    grupo_a_equipes_ids: grupoA.map(e => e.id),
    grupo_b_equipes_ids: grupoB.map(e => e.id),
    campeao_equipe_id: null
  });
};

/**
 * Atualiza automaticamente os slots subsequentes do chaveamento conforme as partidas anteriores são concluídas
 */
export const atualizarChaveamentoMataMata = async (todasPartidas: TrucoPartida[]): Promise<void> => {
  const findPartida = (tipo: TrucoTipoFase) => todasPartidas.find(p => p.tipo_fase === tipo);

  const semiA1 = findPartida('semi_a1');
  const semiA2 = findPartida('semi_a2');
  const finalA = findPartida('final_a');

  const semiB1 = findPartida('semi_b1');
  const semiB2 = findPartida('semi_b2');
  const finalB = findPartida('final_b');

  const grandeFinal = findPartida('grande_final');

  // Atualizar Final do Grupo A
  if (finalA) {
    const timeA = semiA1?.status === 'finalizada' ? semiA1.vencedor_id : null;
    const timeB = semiA2?.status === 'finalizada' ? semiA2.vencedor_id : null;

    if (finalA.time_a_id !== timeA || finalA.time_b_id !== timeB) {
      finalA.time_a_id = timeA;
      finalA.time_b_id = timeB;
      try {
        await supabase.from('truco_partidas').update({ time_a_id: timeA, time_b_id: timeB }).eq('id', finalA.id);
      } catch (e) {
        console.error('Erro ao atualizar Final A no Supabase:', e);
      }
    }
  }

  // Atualizar Final do Grupo B
  if (finalB) {
    const timeA = semiB1?.status === 'finalizada' ? semiB1.vencedor_id : null;
    const timeB = semiB2?.status === 'finalizada' ? semiB2.vencedor_id : null;

    if (finalB.time_a_id !== timeA || finalB.time_b_id !== timeB) {
      finalB.time_a_id = timeA;
      finalB.time_b_id = timeB;
      try {
        await supabase.from('truco_partidas').update({ time_a_id: timeA, time_b_id: timeB }).eq('id', finalB.id);
      } catch (e) {
        console.error('Erro ao atualizar Final B no Supabase:', e);
      }
    }
  }

  // Atualizar Grande Final
  if (grandeFinal) {
    const timeA = finalA?.status === 'finalizada' ? finalA.vencedor_id : null;
    const timeB = finalB?.status === 'finalizada' ? finalB.vencedor_id : null;

    if (grandeFinal.time_a_id !== timeA || grandeFinal.time_b_id !== timeB) {
      grandeFinal.time_a_id = timeA;
      grandeFinal.time_b_id = timeB;
      try {
        await supabase.from('truco_partidas').update({ time_a_id: timeA, time_b_id: timeB }).eq('id', grandeFinal.id);
      } catch (e) {
        console.error('Erro ao atualizar Grande Final no Supabase:', e);
      }
    }

    // Se a grande final estiver concluída, salvar o Campeão Supremo
    if (grandeFinal.status === 'finalizada' && grandeFinal.vencedor_id) {
      await salvarStatusTorneio({
        fase_atual: 'finalizado',
        campeao_equipe_id: grandeFinal.vencedor_id
      });
    }
  }
};

// ==========================================
// REALTIME LISTENER (SUPABASE)
// ==========================================

export const subscribeToTrucoChanges = (onUpdate: () => void) => {
  const channel = supabase
    .channel('truco_realtime_changes_v3')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'truco_equipes' }, () => onUpdate())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'truco_jogadores' }, () => onUpdate())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'truco_torneio_status' }, () => onUpdate())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'truco_partidas' }, () => onUpdate())
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
