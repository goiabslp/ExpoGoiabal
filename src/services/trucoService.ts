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

export interface TrucoEquipe {
  id: string;
  nome: string;
  cidade: string;
  foto_url?: string;
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

/**
 * Calcula a data de cada rodada iniciando em agosto de 2026
 * Realizadas sempre às Terças e Quintas-feiras
 */
export const calcularDataRodada = (rodadaNumero: number): { dataFormatada: string; diaSemana: string; textoCompleto: string } => {
  const r = Math.max(1, rodadaNumero);
  const semanaIndex = Math.floor((r - 1) / 2);
  const isQuinta = (r - 1) % 2 === 1;

  // Base: 04 de Agosto de 2026 (Primeira Terça-feira de Agosto/2026 a partir do dia 03/08)
  const baseDate = new Date(2026, 7, 4); // Agosto é mês 7 (0-indexed)
  const diasAdicionais = (semanaIndex * 7) + (isQuinta ? 2 : 0);

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

export interface TrucoClassificacaoRow {
  posicao: number;
  equipe: TrucoEquipe;
  jogos: number;
  vitorias: number;
  derrotas: number;
  pontos: number;
  pontosMarcados: number;
  pontosSofridos: number;
  saldoPontos: number;
}

const STORAGE_KEY_EQUIPES = '@ExpoGoiabal:truco_equipes';
const STORAGE_KEY_PARTIDAS = '@ExpoGoiabal:truco_partidas';
const STORAGE_KEY_STATUS = '@ExpoGoiabal:truco_status';

// ==========================================
// LOCAL STORAGE HELPERS (FALLBACK RESILIENTE)
// ==========================================

export const getLocalEquipes = (): TrucoEquipe[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EQUIPES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveLocalEquipes = (equipes: TrucoEquipe[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_EQUIPES, JSON.stringify(equipes));
  } catch (e) {
    console.error('Erro ao salvar equipes localmente:', e);
  }
};

export const getLocalPartidas = (): TrucoPartida[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PARTIDAS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveLocalPartidas = (partidas: TrucoPartida[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_PARTIDAS, JSON.stringify(partidas));
  } catch (e) {
    console.error('Erro ao salvar partidas localmente:', e);
  }
};

const DEFAULT_STATUS: TrucoTorneioStatus = {
  id: 'main',
  fase_atual: 'inscricao',
  sorteio_primeira_fase_confirmado: false,
  sorteio_mata_mata_confirmado: false,
  top8_equipes_ids: [],
  grupo_a_equipes_ids: [],
  grupo_b_equipes_ids: [],
  campeao_equipe_id: null
};

export const getLocalStatus = (): TrucoTorneioStatus => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STATUS);
    return raw ? JSON.parse(raw) : DEFAULT_STATUS;
  } catch {
    return DEFAULT_STATUS;
  }
};

export const saveLocalStatus = (status: TrucoTorneioStatus) => {
  try {
    localStorage.setItem(STORAGE_KEY_STATUS, JSON.stringify(status));
  } catch (e) {
    console.error('Erro ao salvar status localmente:', e);
  }
};

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
    foto_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&auto=format&fit=crop&q=80',
    jogadores: [
      { nome_completo: 'Renan Lucas Macedo', cpf: '692.703.814-65', data_nascimento: '1991-10-10', is_titular: true },
      { nome_completo: 'Wesley Douglas Freitas', cpf: '703.814.925-76', data_nascimento: '1995-06-04', is_titular: true },
      { nome_completo: 'Patrick Emanuel Borges', cpf: '814.925.036-87', data_nascimento: '1989-02-27', is_titular: true },
      { nome_completo: 'Renan Augusto Cardoso', cpf: '925.036.147-98', data_nascimento: '1993-12-16', is_titular: true },
      { nome_completo: 'Valdir Soares Cruz', cpf: '036.147.258-09', data_nascimento: '1996-08-07', is_titular: false }
    ]
  },
  {
    nome: 'Espadilha FC',
    cidade: 'Nova Era - MG',
    foto_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&auto=format&fit=crop&q=80',
    jogadores: [
      { nome_completo: 'Juliano César Vasconcelos', cpf: '159.357.246-80', data_nascimento: '1990-05-31', is_titular: true },
      { nome_completo: 'Marcelo Henrique Duarte', cpf: '260.468.357-91', data_nascimento: '1993-09-12', is_titular: true },
      { nome_completo: 'Fábio Rogério Santana', cpf: '371.579.468-02', data_nascimento: '1987-11-25', is_titular: true },
      { nome_completo: 'Ricardo Souza Campos', cpf: '482.680.579-13', data_nascimento: '1996-04-03', is_titular: true },
      { nome_completo: 'Reginaldo Bento Lima', cpf: '593.791.680-24', data_nascimento: '1991-01-19', is_titular: false }
    ]
  },
  {
    nome: 'Zap & Copas',
    cidade: 'Dionísio - MG',
    foto_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&auto=format&fit=crop&q=80',
    jogadores: [
      { nome_completo: 'Wanderson Alves Monteiro', cpf: '604.802.791-35', data_nascimento: '1992-08-08', is_titular: true },
      { nome_completo: 'Jonathan Silveira Reis', cpf: '715.913.802-46', data_nascimento: '1995-12-21', is_titular: true },
      { nome_completo: 'Cristiano Morais Fontes', cpf: '826.024.913-57', data_nascimento: '1988-03-16', is_titular: true },
      { nome_completo: 'Alan Douglas Pacheco', cpf: '937.135.024-68', data_nascimento: '1994-07-01', is_titular: true },
      { nome_completo: 'Everton Lucas Brandão', cpf: '048.246.135-79', data_nascimento: '1997-10-27', is_titular: false }
    ]
  }
];

export const popularTimesFicticios = async (): Promise<TrucoEquipe[]> => {
  const novasEquipes: TrucoEquipe[] = [];

  for (const time of TIMES_FICTICIOS_SEED) {
    const equipeId = crypto.randomUUID();
    const novaEq: TrucoEquipe = {
      id: equipeId,
      nome: time.nome,
      cidade: time.cidade,
      foto_url: time.foto_url,
      created_at: new Date().toISOString(),
      jogadores: time.jogadores.map(j => ({
        id: crypto.randomUUID(),
        equipe_id: equipeId,
        nome_completo: j.nome_completo,
        cpf: j.cpf,
        data_nascimento: j.data_nascimento,
        is_titular: j.is_titular,
        created_at: new Date().toISOString()
      }))
    };

    try {
      await supabase.from('truco_equipes').upsert({
        id: novaEq.id,
        nome: novaEq.nome,
        cidade: novaEq.cidade,
        foto_url: novaEq.foto_url
      });

      if (novaEq.jogadores && novaEq.jogadores.length > 0) {
        await supabase.from('truco_jogadores').upsert(novaEq.jogadores);
      }
    } catch (e) {
      console.warn('Erro ao inserir time ficticio no Supabase:', e);
    }

    novasEquipes.push(novaEq);
  }

  saveLocalEquipes(novasEquipes);
  try {
    window.dispatchEvent(new Event('storage'));
  } catch {}
  return novasEquipes;
};

// ==========================================
// SERVIÇOS DE EQUIPES E JOGADORES
// ==========================================

export const buscarEquipes = async (): Promise<TrucoEquipe[]> => {
  try {
    const { data: equipesData, error: equipesError } = await supabase
      .from('truco_equipes')
      .select('*')
      .order('nome', { ascending: true });

    if (!equipesError && equipesData && equipesData.length >= 8) {
      const { data: jogadoresData } = await supabase
        .from('truco_jogadores')
        .select('*');

      const equipesComJogadores: TrucoEquipe[] = equipesData.map((eq: any) => ({
        ...eq,
        jogadores: (jogadoresData || []).filter((j: any) => j.equipe_id === eq.id)
      }));

      saveLocalEquipes(equipesComJogadores);
      return equipesComJogadores;
    }
  } catch (err) {
    console.warn('Supabase inacessível, utilizando cache local para equipes:', err);
  }

  const locais = getLocalEquipes();
  if (locais.length >= 8) {
    return locais;
  }

  // Se houver menos de 8 equipes cadastradas, popula os 8 times fictícios oficiais
  return popularTimesFicticios();
};

export const excluirTodasEquipes = async (): Promise<void> => {
  try {
    await supabase.from('truco_jogadores').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('truco_partidas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('truco_equipes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  } catch (e) {
    console.warn('Erro ao excluir todas equipes no Supabase:', e);
  }

  saveLocalEquipes([]);
  saveLocalPartidas([]);
  await resetarTorneio();
};

export const cadastrarEquipe = async (
  dados: { nome: string; cidade: string; foto_url?: string },
  jogadores: { nome_completo: string; cpf: string; data_nascimento: string; is_titular?: boolean }[],
  fotoFile?: File | null
): Promise<TrucoEquipe> => {
  let fotoUrlFinal = dados.foto_url || '';

  if (fotoFile) {
    try {
      const fileExt = fotoFile.name.split('.').pop();
      const fileName = `truco_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `truco/${fileName}`;

      const { error: uploadErr } = await supabase.storage
        .from('fotos_truco')
        .upload(filePath, fotoFile, { upsert: true });

      if (!uploadErr) {
        const { data: publicUrlData } = supabase.storage
          .from('fotos_truco')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          fotoUrlFinal = publicUrlData.publicUrl;
        }
      }
    } catch (e) {
      console.warn('Erro ao enviar foto para o Supabase Storage:', e);
    }

    if (!fotoUrlFinal && fotoFile) {
      try {
        fotoUrlFinal = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(fotoFile);
        });
      } catch {
        fotoUrlFinal = '';
      }
    }
  }

  const novaEquipeId = crypto.randomUUID();

  try {
    const { data: equipeCriada, error: equipeErr } = await supabase
      .from('truco_equipes')
      .insert({
        id: novaEquipeId,
        nome: dados.nome.trim(),
        cidade: dados.cidade.trim(),
        foto_url: fotoUrlFinal
      })
      .select()
      .single();

    if (!equipeErr && equipeCriada) {
      const jogadoresParaInserir = jogadores.map((j, idx) => ({
        id: crypto.randomUUID(),
        equipe_id: equipeCriada.id,
        nome_completo: j.nome_completo.trim(),
        cpf: j.cpf.trim(),
        data_nascimento: j.data_nascimento,
        is_titular: j.is_titular !== undefined ? j.is_titular : idx < 4
      }));

      const { data: jogadoresCriados } = await supabase
        .from('truco_jogadores')
        .insert(jogadoresParaInserir)
        .select();

      const resultado: TrucoEquipe = {
        ...equipeCriada,
        jogadores: jogadoresCriados || jogadoresParaInserir
      };

      const locais = getLocalEquipes().filter(e => e.id !== resultado.id);
      saveLocalEquipes([...locais, resultado]);
      return resultado;
    }
  } catch (err) {
    console.warn('Falha no Supabase ao cadastrar equipe, salvando localmente:', err);
  }

  const novaEquipeLocal: TrucoEquipe = {
    id: novaEquipeId,
    nome: dados.nome.trim(),
    cidade: dados.cidade.trim(),
    foto_url: fotoUrlFinal,
    created_at: new Date().toISOString(),
    jogadores: jogadores.map((j, idx) => ({
      id: crypto.randomUUID(),
      equipe_id: novaEquipeId,
      nome_completo: j.nome_completo.trim(),
      cpf: j.cpf.trim(),
      data_nascimento: j.data_nascimento,
      is_titular: j.is_titular !== undefined ? j.is_titular : idx < 4,
      created_at: new Date().toISOString()
    }))
  };

  const locais = getLocalEquipes();
  saveLocalEquipes([...locais, novaEquipeLocal]);
  return novaEquipeLocal;
};

export const excluirEquipe = async (equipeId: string): Promise<void> => {
  try {
    await supabase.from('truco_jogadores').delete().eq('equipe_id', equipeId);
    await supabase.from('truco_partidas').delete().or(`time_a_id.eq.${equipeId},time_b_id.eq.${equipeId}`);
    await supabase.from('truco_equipes').delete().eq('id', equipeId);
  } catch (e) {
    console.warn('Erro ao excluir equipe no Supabase:', e);
  }

  const equipes = getLocalEquipes().filter(e => e.id !== equipeId);
  saveLocalEquipes(equipes);
  const partidas = getLocalPartidas().filter(p => p.time_a_id !== equipeId && p.time_b_id !== equipeId);
  saveLocalPartidas(partidas);
};

// ==========================================
// STATUS DO TORNEIO
// ==========================================

export const buscarStatusTorneio = async (): Promise<TrucoTorneioStatus> => {
  try {
    const { data, error } = await supabase
      .from('truco_torneio_status')
      .select('*')
      .eq('id', 'main')
      .single();

    if (!error && data) {
      const parsed: TrucoTorneioStatus = {
        ...data,
        top8_equipes_ids: typeof data.top8_equipes_ids === 'string' ? JSON.parse(data.top8_equipes_ids) : (data.top8_equipes_ids || []),
        grupo_a_equipes_ids: typeof data.grupo_a_equipes_ids === 'string' ? JSON.parse(data.grupo_a_equipes_ids) : (data.grupo_a_equipes_ids || []),
        grupo_b_equipes_ids: typeof data.grupo_b_equipes_ids === 'string' ? JSON.parse(data.grupo_b_equipes_ids) : (data.grupo_b_equipes_ids || []),
      };
      saveLocalStatus(parsed);
      return parsed;
    }
  } catch (err) {
    console.warn('Supabase status inacessível, usando cache local:', err);
  }

  return getLocalStatus();
};

export const salvarStatusTorneio = async (status: Partial<TrucoTorneioStatus>): Promise<TrucoTorneioStatus> => {
  const current = getLocalStatus();
  const updated: TrucoTorneioStatus = {
    ...current,
    ...status,
    id: 'main'
  };

  try {
    await supabase
      .from('truco_torneio_status')
      .upsert({
        id: 'main',
        fase_atual: updated.fase_atual,
        sorteio_primeira_fase_confirmado: updated.sorteio_primeira_fase_confirmado,
        sorteio_mata_mata_confirmado: updated.sorteio_mata_mata_confirmado,
        top8_equipes_ids: updated.top8_equipes_ids,
        grupo_a_equipes_ids: updated.grupo_a_equipes_ids,
        grupo_b_equipes_ids: updated.grupo_b_equipes_ids,
        campeao_equipe_id: updated.campeao_equipe_id,
        updated_at: new Date().toISOString()
      });
  } catch (e) {
    console.warn('Erro ao salvar status no Supabase:', e);
  }

  saveLocalStatus(updated);
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
 * Algoritmo canônico do Método do Círculo (Polygon / Circle Method)
 * Garante que:
 * - Rodadas = N - 1
 * - Jogos por Rodada = N / 2
 * - Total de Jogos = N * (N - 1) / 2
 * - Nenhum time joga duas vezes na mesma rodada
 * - Nenhum time fica sem jogar
 * - Todos jogam contra todos exatamente 1 vez
 */
export const gerarRoundRobin = (equipesIds: string[]): RoundRobinConfronto[] => {
  const n = equipesIds.length;
  if (n < 2 || n % 2 !== 0) {
    throw new Error('A quantidade de equipes deve ser par para gerar o calendário simultâneo de rodadas.');
  }

  const numRodadas = n - 1;
  const jogosPorRodada = n / 2;
  const confrontos: RoundRobinConfronto[] = [];

  // Posição fixa: índice 0 (equipesIds[0])
  // Elementos móveis: equipesIds[1 ... n-1]
  const rotating = equipesIds.slice(1);
  const rotatingLen = rotating.length; // n - 1

  let contadorJogo = 1;

  for (let r = 0; r < numRodadas; r++) {
    const rodadaNumero = r + 1;

    // Jogo 1 da rodada: time fixo contra o time que está na posição superior da rotação
    const timeFixo = equipesIds[0];
    const timeMovel1 = rotating[r % rotatingLen];

    // Alternância de mando de jogo para equilíbrio
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

  return confrontos;
};

/**
 * Embaralha as equipes e gera os confrontos da 1ª Fase
 */
export const realizarSorteioPrimeiraFase = (equipes: TrucoEquipe[]): {
  equipesSorteadaOrdem: TrucoEquipe[];
  numRodadas: number;
  jogosPorRodada: number;
  totalJogos: number;
  partidasGeradas: TrucoPartida[];
} => {
  if (equipes.length < 4 || equipes.length % 2 !== 0) {
    throw new Error('O torneio precisa ter uma quantidade par de equipes (mínimo de 4).');
  }

  // Embaralha as equipes (Fisher-Yates)
  const shuffled = [...equipes];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const ids = shuffled.map(e => e.id);
  const roundRobin = gerarRoundRobin(ids);

  const partidasGeradas: TrucoPartida[] = roundRobin.map((conf) => ({
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

  const numRodadas = equipes.length - 1;
  const jogosPorRodada = equipes.length / 2;
  const totalJogos = (equipes.length * (equipes.length - 1)) / 2;

  return {
    equipesSorteadaOrdem: shuffled,
    numRodadas,
    jogosPorRodada,
    totalJogos,
    partidasGeradas
  };
};

export const confirmarSorteioPrimeiraFase = async (partidas: TrucoPartida[]): Promise<void> => {
  // Limpar partidas antigas da 1ª fase
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
    console.warn('Erro ao salvar partidas no Supabase:', e);
  }

  saveLocalPartidas(partidas);
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
export const acionarSorteioPublicoAdmin = async (equipes: TrucoEquipe[]): Promise<{ sucesso: boolean; mensagem: string }> => {
  if (equipes.length < 4) {
    return { sucesso: false, mensagem: 'É necessário ter pelo menos 4 equipes cadastradas para realizar o sorteio.' };
  }
  if (equipes.length % 2 !== 0) {
    return { sucesso: false, mensagem: 'A quantidade de equipes deve ser PAR para que todas as partidas ocorram simultaneamente.' };
  }

  const resultado = realizarSorteioPrimeiraFase(equipes);
  if (!resultado || resultado.partidasGeradas.length === 0) {
    return { sucesso: false, mensagem: 'Falha ao gerar os confrontos da primeira fase.' };
  }

  await confirmarSorteioPrimeiraFase(resultado.partidasGeradas);

  return { sucesso: true, mensagem: `Sorteio ativado com sucesso! ${resultado.partidasGeradas.length} partidas geradas.` };
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
    console.warn('Erro ao resetar partidas no Supabase:', e);
  }

  saveLocalPartidas([]);
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
// CONSULTA E ATUALIZAÇÃO DE PARTIDAS
// ==========================================

export const buscarPartidas = async (): Promise<TrucoPartida[]> => {
  try {
    const { data: partidasData, error } = await supabase
      .from('truco_partidas')
      .select('*')
      .order('numero_jogo', { ascending: true });

    if (!error && partidasData) {
      saveLocalPartidas(partidasData);
      return partidasData;
    }
  } catch (err) {
    console.warn('Supabase partidas inacessível, usando cache local:', err);
  }

  return getLocalPartidas();
};

export const registrarResultadoPartida = async (
  partidaId: string,
  pontosA: number,
  pontosB: number,
  status: 'agendada' | 'em_andamento' | 'finalizada' = 'finalizada'
): Promise<TrucoPartida | null> => {
  const todasPartidas = getLocalPartidas();
  const partida = todasPartidas.find(p => p.id === partidaId);
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
      const atualizadas = todasPartidas.map(p => p.id === partidaId ? { ...p, ...data } : p);
      saveLocalPartidas(atualizadas);
      
      // Se for partida do mata-mata, atualiza chaveamento subsequente
      if (data.tipo_fase !== 'primeira_fase') {
        await atualizarChaveamentoMataMata(atualizadas);
      }
      return data;
    }
  } catch (err) {
    console.warn('Erro ao atualizar no Supabase, aplicando localmente:', err);
  }

  const atualizadas = todasPartidas.map(p => {
    if (p.id === partidaId) {
      return { ...p, ...payload };
    }
    return p;
  });
  saveLocalPartidas(atualizadas);

  if (partida.tipo_fase !== 'primeira_fase') {
    await atualizarChaveamentoMataMata(atualizadas);
  }

  return atualizadas.find(p => p.id === partidaId) || null;
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
    }
  });

  const temJogosDisputados = partidasPrimeiraFaseFinalizadas.length > 0;

  const listaClassificacao: TrucoClassificacaoRow[] = equipes.map(equipe => {
    const stats = mapStats.get(equipe.id) || {
      jogos: 0,
      vitorias: 0,
      derrotas: 0,
      pontos: 0,
      pontosMarcados: 0,
      pontosSofridos: 0,
      saldoPontos: 0
    };

    return {
      posicao: 1,
      equipe,
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

  return listaClassificacao.map((item, index) => ({
    ...item,
    posicao: index + 1
  }));
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

  // Embaralha os 8 classificados
  const shuffled = [...top8Equipes];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const grupoA = shuffled.slice(0, 4); // 4 times
  const grupoB = shuffled.slice(4, 8); // 4 times

  // Estrutura das 7 partidas do Mata-Mata:
  // 1. Semifinal A1 (A[0] vs A[1])
  // 2. Semifinal A2 (A[2] vs A[3])
  // 3. Final do Grupo A (Venc A1 vs Venc A2)
  // 4. Semifinal B1 (B[0] vs B[1])
  // 5. Semifinal B2 (B[2] vs B[3])
  // 6. Final do Grupo B (Venc B1 vs Venc B2)
  // 7. Grande Final (Finalista A vs Finalista B)

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
  const todasPartidas = getLocalPartidas();
  const partidas1aFase = todasPartidas.filter(p => p.tipo_fase === 'primeira_fase');
  const partidasAtualizadas = [...partidas1aFase, ...partidasMataMata];

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
    console.warn('Erro ao salvar mata-mata no Supabase:', e);
  }

  saveLocalPartidas(partidasAtualizadas);
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

  let mudouAlgo = false;

  // Atualizar Final do Grupo A
  if (finalA) {
    const timeA = semiA1?.status === 'finalizada' ? semiA1.vencedor_id : null;
    const timeB = semiA2?.status === 'finalizada' ? semiA2.vencedor_id : null;

    if (finalA.time_a_id !== timeA || finalA.time_b_id !== timeB) {
      finalA.time_a_id = timeA;
      finalA.time_b_id = timeB;
      mudouAlgo = true;
      try {
        await supabase.from('truco_partidas').update({ time_a_id: timeA, time_b_id: timeB }).eq('id', finalA.id);
      } catch (e) {
        console.warn('Erro ao atualizar Final A no Supabase:', e);
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
      mudouAlgo = true;
      try {
        await supabase.from('truco_partidas').update({ time_a_id: timeA, time_b_id: timeB }).eq('id', finalB.id);
      } catch (e) {
        console.warn('Erro ao atualizar Final B no Supabase:', e);
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
      mudouAlgo = true;
      try {
        await supabase.from('truco_partidas').update({ time_a_id: timeA, time_b_id: timeB }).eq('id', grandeFinal.id);
      } catch (e) {
        console.warn('Erro ao atualizar Grande Final no Supabase:', e);
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

  if (mudouAlgo) {
    saveLocalPartidas(todasPartidas);
  }
};

// ==========================================
// REALTIME LISTENER
// ==========================================

export const subscribeToTrucoChanges = (onUpdate: () => void) => {
  const channel = supabase
    .channel('truco_realtime_changes_v2')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'truco_equipes' }, () => onUpdate())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'truco_jogadores' }, () => onUpdate())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'truco_torneio_status' }, () => onUpdate())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'truco_partidas' }, () => onUpdate())
    .subscribe();

  const handleStorage = (e: StorageEvent) => {
    if (
      e.key === STORAGE_KEY_EQUIPES || 
      e.key === STORAGE_KEY_PARTIDAS || 
      e.key === STORAGE_KEY_STATUS
    ) {
      onUpdate();
    }
  };
  window.addEventListener('storage', handleStorage);

  return () => {
    supabase.removeChannel(channel);
    window.removeEventListener('storage', handleStorage);
  };
};
