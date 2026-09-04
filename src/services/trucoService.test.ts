import { describe, it, expect, vi } from 'vitest';

// Simulação em memória do banco Postgres para testes unitários
const dbEquipes: any[] = [];
const dbJogadores: any[] = [];
const dbPartidas: any[] = [];
let dbStatusTorneio: any = {
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

vi.mock('./supabase', () => {
  return {
    supabase: {
      from: (table: string) => {
        let filterEq: { [key: string]: any } = {};
        return {
          select: () => {
            const queryObj: any = {
              eq: (col: string, val: any) => {
                filterEq[col] = val;
                return queryObj;
              },
              order: () => queryObj,
              single: async () => {
                if (table === 'truco_torneio_status') return { data: dbStatusTorneio, error: null };
                return { data: null, error: null };
              },
              maybeSingle: async () => {
                if (table === 'truco_torneio_status') return { data: dbStatusTorneio, error: null };
                return { data: null, error: null };
              },
              then: (resolve: any) => {
                if (table === 'truco_equipes') {
                  let res = [...dbEquipes];
                  if (filterEq['status']) res = res.filter(e => e.status === filterEq['status']);
                  resolve({ data: res, error: null });
                } else if (table === 'truco_jogadores') {
                  let res = [...dbJogadores];
                  if (filterEq['equipe_id']) res = res.filter(j => j.equipe_id === filterEq['equipe_id']);
                  resolve({ data: res, error: null });
                } else if (table === 'truco_partidas') {
                  resolve({ data: [...dbPartidas], error: null });
                } else {
                  resolve({ data: [], error: null });
                }
              }
            };
            return queryObj;
          },
          insert: async (data: any) => {
            const items = Array.isArray(data) ? data : [data];
            if (table === 'truco_equipes') dbEquipes.push(...items);
            if (table === 'truco_jogadores') dbJogadores.push(...items);
            if (table === 'truco_partidas') dbPartidas.push(...items);
            return { error: null };
          },
          upsert: async (data: any) => {
            if (table === 'truco_torneio_status') {
              dbStatusTorneio = { ...dbStatusTorneio, ...data };
            }
            return { error: null };
          },
          update: (data: any) => {
            return {
              eq: async (col: string, val: any) => {
                if (table === 'truco_equipes') {
                  dbEquipes.forEach(e => {
                    if (e[col] === val) Object.assign(e, data);
                  });
                }
                return { error: null, select: () => ({ single: async () => ({ data, error: null }) }) };
              }
            };
          },
          delete: () => {
            return {
              neq: async () => {
                if (table === 'truco_equipes') dbEquipes.length = 0;
                if (table === 'truco_jogadores') dbJogadores.length = 0;
                if (table === 'truco_partidas') dbPartidas.length = 0;
                return { error: null };
              },
              eq: async (col: string, val: any) => {
                if (table === 'truco_equipes') {
                  const idx = dbEquipes.findIndex(e => e[col] === val);
                  if (idx !== -1) dbEquipes.splice(idx, 1);
                }
                if (table === 'truco_jogadores') {
                  const toKeep = dbJogadores.filter(j => j[col] !== val);
                  dbJogadores.length = 0;
                  dbJogadores.push(...toKeep);
                }
                return { error: null };
              },
              or: async () => {
                return { error: null };
              }
            };
          }
        };
      },
      storage: {
        from: () => ({
          upload: async () => ({ error: null }),
          getPublicUrl: (p: string) => ({ data: { publicUrl: `https://mock.storage/${p}` } })
        })
      },
      channel: () => ({
        on: function() { return this; },
        subscribe: function() { return this; }
      }),
      removeChannel: () => {}
    }
  };
});

import { 
  gerarRoundRobin, 
  realizarSorteioPrimeiraFase,
  isTimeDeFora,
  calcularClassificacao, 
  realizarSorteioMataMata,
  atualizarChaveamentoMataMata,
  type TrucoEquipe, 
  type TrucoPartida 
} from './trucoService';

describe('Matemática Round-Robin (Circle Method)', () => {
  it('deve gerar corretamente rodadas simultâneas para 4 equipes (3 rodadas, 2 jogos/rodada, 6 jogos no total)', () => {
    const times = ['T1', 'T2', 'T3', 'T4'];
    const res = gerarRoundRobin(times);
    const confrontos = res.confrontos;

    expect(confrontos.length).toBe(6); // 4 * 3 / 2 = 6
    expect(res.numRodadas).toBe(3);
    expect(res.jogosPorRodada).toBe(2);

    // Verificar rodadas
    const rodadas = new Set(confrontos.map(c => c.rodada));
    expect(rodadas.size).toBe(3); // 4 - 1 = 3 rodadas

    // Verificar jogos por rodada
    for (let r = 1; r <= 3; r++) {
      const jogosRodada = confrontos.filter(c => c.rodada === r);
      expect(jogosRodada.length).toBe(2); // 4 / 2 = 2 jogos

      // Todos os 4 times devem jogar exatamente uma vez na rodada r
      const timesNaRodada = new Set<string>();
      jogosRodada.forEach(j => {
        expect(timesNaRodada.has(j.time_a_id)).toBe(false);
        expect(timesNaRodada.has(j.time_b_id)).toBe(false);
        timesNaRodada.add(j.time_a_id);
        timesNaRodada.add(j.time_b_id);
      });
      expect(timesNaRodada.size).toBe(4);
    }

    // Verificar que cada confronto acontece exatamente uma vez
    const pares = new Set<string>();
    confrontos.forEach(c => {
      const key = [c.time_a_id, c.time_b_id].sort().join(' x ');
      expect(pares.has(key)).toBe(false);
      pares.add(key);
    });
    expect(pares.size).toBe(6);
  });

  it('deve gerar corretamente rodadas simultâneas para 8 equipes (7 rodadas, 4 jogos/rodada, 28 jogos no total)', () => {
    const times = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8'];
    const res = gerarRoundRobin(times);
    const confrontos = res.confrontos;

    expect(confrontos.length).toBe(28); // 8 * 7 / 2 = 28
    expect(res.numRodadas).toBe(7);
    expect(res.jogosPorRodada).toBe(4);

    const rodadas = new Set(confrontos.map(c => c.rodada));
    expect(rodadas.size).toBe(7); // 8 - 1 = 7 rodadas

    for (let r = 1; r <= 7; r++) {
      const jogosRodada = confrontos.filter(c => c.rodada === r);
      expect(jogosRodada.length).toBe(4);

      const timesNaRodada = new Set<string>();
      jogosRodada.forEach(j => {
        expect(timesNaRodada.has(j.time_a_id)).toBe(false);
        expect(timesNaRodada.has(j.time_b_id)).toBe(false);
        timesNaRodada.add(j.time_a_id);
        timesNaRodada.add(j.time_b_id);
      });
      expect(timesNaRodada.size).toBe(8);
    }

    const pares = new Set<string>();
    confrontos.forEach(c => {
      const key = [c.time_a_id, c.time_b_id].sort().join(' x ');
      expect(pares.has(key)).toBe(false);
      pares.add(key);
    });
    expect(pares.size).toBe(28);
  });

  it('deve gerar corretamente calendário Todos contra Todos para quantidade ÍMPAR de equipes (5 equipes: 5 rodadas, 2 jogos/rodada, 10 jogos no total)', () => {
    const times = ['T1', 'T2', 'T3', 'T4', 'T5'];
    // Definimos T5 como a equipe que folga na Rodada 1
    const res = gerarRoundRobin(times, 'T5');
    const confrontos = res.confrontos;

    expect(confrontos.length).toBe(10); // 5 * 4 / 2 = 10 jogos
    expect(res.numRodadas).toBe(5);
    expect(res.jogosPorRodada).toBe(2);
    expect(res.totalJogos).toBe(10);

    // Verificar que na Rodada 1 o time T5 NÃO joga (folga) e os outros 4 jogam
    const jogosRodada1 = confrontos.filter(c => c.rodada === 1);
    expect(jogosRodada1.length).toBe(2);
    const timesRodada1 = new Set(jogosRodada1.flatMap(j => [j.time_a_id, j.time_b_id]));
    expect(timesRodada1.has('T5')).toBe(false);
    expect(timesRodada1.size).toBe(4);

    // Verificar que todas as 5 equipes jogam exatamente 4 partidas ao longo do torneio
    times.forEach(t => {
      const partidasDoTime = confrontos.filter(c => c.time_a_id === t || c.time_b_id === t);
      expect(partidasDoTime.length).toBe(4);
    });

    // Verificar que cada par de equipes se enfrenta exatamente uma vez
    const pares = new Set<string>();
    confrontos.forEach(c => {
      const key = [c.time_a_id, c.time_b_id].sort().join(' x ');
      expect(pares.has(key)).toBe(false);
      pares.add(key);
    });
    expect(pares.size).toBe(10);
  });

  it('deve realizar sorteio com número ímpar de equipes garantindo que todos os times de fora joguem na Rodada 1 e que o último cadastrado folgue', () => {
    const equipesTeste: TrucoEquipe[] = [
      { id: '1', nome: 'Time Fora 1 (Dionísio)', cidade: 'Dionísio - MG', status: 'aprovado' },
      { id: '2', nome: 'Time Local 1 (Goiabal)', cidade: 'São José do Goiabal - MG', status: 'aprovado' },
      { id: '3', nome: 'Time Fora 2 (Prata)', cidade: 'São Domingos do Prata', status: 'aprovado' },
      { id: '4', nome: 'Time Local 2 (Goiabal)', cidade: 'São José do Goiabal - MG', status: 'aprovado' },
      { id: '5', nome: 'Time Local 3 (Último Cadastrado)', cidade: 'São José do Goiabal - MG', status: 'aprovado' },
    ];

    expect(isTimeDeFora(equipesTeste[0].cidade)).toBe(true);
    expect(isTimeDeFora(equipesTeste[1].cidade)).toBe(false);
    expect(isTimeDeFora(equipesTeste[2].cidade)).toBe(true);
    expect(isTimeDeFora(equipesTeste[3].cidade)).toBe(false);
    expect(isTimeDeFora(equipesTeste[4].cidade)).toBe(false);

    const sorteio = realizarSorteioPrimeiraFase(equipesTeste);

    expect(sorteio.totalJogos).toBe(10);
    expect(sorteio.numRodadas).toBe(5);
    expect(sorteio.partidasGeradas.length).toBe(10);

    // O último time cadastrado local (ID 5) deve ser a equipe de folga na Rodada 1
    expect(sorteio.equipeFolgaRodada1?.id).toBe('5');

    // Na Rodada 1, todos os times de fora (IDs 1 e 3) devem obrigatoriamente estar jogando
    const partidasR1 = sorteio.partidasGeradas.filter((p: TrucoPartida) => p.rodada === 1);
    const timesJogandoR1 = new Set(partidasR1.flatMap((p: TrucoPartida) => [p.time_a_id, p.time_b_id]));

    expect(timesJogandoR1.has('1')).toBe(true); // Time Fora 1 jogando na R1
    expect(timesJogandoR1.has('3')).toBe(true); // Time Fora 2 jogando na R1
    expect(timesJogandoR1.has('5')).toBe(false); // Time 5 folgando na R1

    // Todas as partidas do Time 5 foram geradas para as rodadas seguintes
    const partidasTime5 = sorteio.partidasGeradas.filter((p: TrucoPartida) => p.time_a_id === '5' || p.time_b_id === '5');
    expect(partidasTime5.length).toBe(4);
  });

  it('deve priorizar a equipe GENERAL para folgar na 1ª rodada quando houver número ímpar de equipes', () => {
    const equipesComGeneral: TrucoEquipe[] = [
      { id: 't1', nome: 'ADEGA', cidade: 'São José do Goiabal - MG', status: 'aprovado' },
      { id: 't2', nome: 'AZULÃO', cidade: 'São José do Goiabal - MG', status: 'aprovado' },
      { id: 't3', nome: 'CRUZ DE MALTA', cidade: 'São José do Goiabal - MG', status: 'aprovado' },
      { id: 't4', nome: 'FELPS', cidade: 'São José do Goiabal - MG', status: 'aprovado' },
      { id: 't5', nome: 'GENERAL', cidade: 'São José do Goiabal - MG', status: 'aprovado' },
      { id: 't6', nome: 'LAGOA', cidade: 'São José do Goiabal - MG', status: 'aprovado' },
      { id: 't7', nome: 'LENDÁRIOS', cidade: 'São José do Goiabal - MG', status: 'aprovado' }
    ];

    const sorteio = realizarSorteioPrimeiraFase(equipesComGeneral);

    expect(sorteio.numRodadas).toBe(7);
    expect(sorteio.totalJogos).toBe(21); // 7 * 6 / 2 = 21

    // A equipe GENERAL (t5) deve ser selecionada para folgar na Rodada 1
    expect(sorteio.equipeFolgaRodada1?.nome).toBe('GENERAL');
    expect(sorteio.equipeFolgaRodada1?.id).toBe('t5');

    // Na Rodada 1, a equipe GENERAL NÃO deve estar em nenhuma partida
    const partidasR1 = sorteio.partidasGeradas.filter(p => p.rodada === 1);
    expect(partidasR1.length).toBe(3); // (7 - 1) / 2 = 3 jogos
    const timesR1 = new Set(partidasR1.flatMap(p => [p.time_a_id, p.time_b_id]));
    expect(timesR1.has('t5')).toBe(false);
    expect(timesR1.size).toBe(6); // Os outros 6 times jogam na Rodada 1

    // Nas rodadas 2 a 7, a equipe GENERAL joga 6 partidas (contra todos os outros 6 times)
    const partidasGeneral = sorteio.partidasGeradas.filter(p => p.time_a_id === 't5' || p.time_b_id === 't5');
    expect(partidasGeneral.length).toBe(6);
  });
});

describe('Classificação da 1ª Fase do Truco', () => {
  const equipeA: TrucoEquipe = { id: '1', nome: 'Valetes de Ouro', cidade: 'São José do Goiabal', status: 'aprovado' };
  const equipeB: TrucoEquipe = { id: '2', nome: 'Ases do Blefe', cidade: 'Dionísio', status: 'aprovado' };
  const equipeC: TrucoEquipe = { id: '3', nome: 'Reis da Noite', cidade: 'São Domingos do Prata', status: 'aprovado' };

  it('deve ordenar alfabeticamente antes de haver partidas finalizadas', () => {
    const equipes = [equipeA, equipeB, equipeC];
    const partidas: TrucoPartida[] = [];

    const resultado = calcularClassificacao(equipes, partidas);

    expect(resultado[0].equipe.nome).toBe('Ases do Blefe');
    expect(resultado[1].equipe.nome).toBe('Reis da Noite');
    expect(resultado[2].equipe.nome).toBe('Valetes de Ouro');
    expect(resultado[0].pontos).toBe(0);
    expect(resultado[0].saldoPontos).toBe(0);
  });

  it('deve calcular vitórias (3 pts), derrotas (0 pts) e saldo (marcados - sofridos)', () => {
    const equipes = [equipeA, equipeB];
    const partidas: TrucoPartida[] = [
      {
        id: 'p1',
        tipo_fase: 'primeira_fase',
        rodada: 1,
        numero_jogo: 1,
        time_a_id: '1',
        time_b_id: '2',
        pontos_time_a: 12,
        pontos_time_b: 6,
        vencedor_id: '1',
        status: 'finalizada',
        fase_nome: 'Rodada 01'
      }
    ];

    const resultado = calcularClassificacao(equipes, partidas);

    expect(resultado[0].equipe.id).toBe('1');
    expect(resultado[0].pontos).toBe(3);
    expect(resultado[0].vitorias).toBe(1);
    expect(resultado[0].saldoPontos).toBe(6);

    expect(resultado[1].equipe.id).toBe('2');
    expect(resultado[1].pontos).toBe(0);
    expect(resultado[1].vitorias).toBe(0);
    expect(resultado[1].saldoPontos).toBe(-6);
  });

  it('deve calcular empates (1 pt cada) quando as equipes terminarem com o mesmo saldo de pontos', () => {
    const equipes = [equipeA, equipeB];
    const partidas: TrucoPartida[] = [
      {
        id: 'p_empate',
        tipo_fase: 'primeira_fase',
        rodada: 1,
        numero_jogo: 1,
        time_a_id: '1',
        time_b_id: '2',
        pontos_time_a: 10,
        pontos_time_b: 10,
        vencedor_id: null,
        status: 'finalizada',
        fase_nome: 'Rodada 01'
      }
    ];

    const resultado = calcularClassificacao(equipes, partidas);

    expect(resultado[0].pontos).toBe(1);
    expect(resultado[0].empates).toBe(1);
    expect(resultado[0].vitorias).toBe(0);
    expect(resultado[0].saldoPontos).toBe(0);

    expect(resultado[1].pontos).toBe(1);
    expect(resultado[1].empates).toBe(1);
    expect(resultado[1].vitorias).toBe(0);
    expect(resultado[1].saldoPontos).toBe(0);
  });

  it('deve utilizar Pontos Marcados (PM) como critério de desempate imediatamente após Saldo de Pontos (SG)', () => {
    const eq1: TrucoEquipe = { id: 't1', nome: 'Time Alpha', cidade: 'Goiabal', status: 'aprovado' };
    const eq2: TrucoEquipe = { id: 't2', nome: 'Time Beta', cidade: 'Goiabal', status: 'aprovado' };
    const eq3: TrucoEquipe = { id: 't3', nome: 'Time Gamma', cidade: 'Goiabal', status: 'aprovado' };

    // Cenário:
    // eq1 contra eq3: 12 x 10 (Vitória de eq1, +2 SG, 12 PM, 3 PTS)
    // eq2 contra eq3: 8 x 6 (Vitória de eq2, +2 SG, 8 PM, 3 PTS)
    // Ambos têm 3 PTS, 1 V, +2 SG. O desempate deve ser por PM: eq1 (12 PM) fica na frente de eq2 (8 PM).
    const equipes = [eq2, eq1, eq3]; // eq2 colocado primeiro na lista propositalmente
    const partidas: TrucoPartida[] = [
      { id: 'p1', tipo_fase: 'primeira_fase', rodada: 1, numero_jogo: 1, time_a_id: 't1', time_b_id: 't3', pontos_time_a: 12, pontos_time_b: 10, vencedor_id: 't1', status: 'finalizada', fase_nome: 'R1' },
      { id: 'p2', tipo_fase: 'primeira_fase', rodada: 2, numero_jogo: 2, time_a_id: 't2', time_b_id: 't3', pontos_time_a: 8, pontos_time_b: 6, vencedor_id: 't2', status: 'finalizada', fase_nome: 'R2' },
    ];

    const resultado = calcularClassificacao(equipes, partidas);
    expect(resultado[0].equipe.id).toBe('t1');
    expect(resultado[0].pontosMarcados).toBe(12);
    expect(resultado[1].equipe.id).toBe('t2');
    expect(resultado[1].pontosMarcados).toBe(8);
  });

  it('deve computar os pontos na tabela mesmo se o status da partida não for explicitamente "finalizada", mas tiver placar inserido (> 0)', () => {
    const eq1: TrucoEquipe = { id: 't1', nome: 'Time Alpha', cidade: 'Goiabal', status: 'aprovado' };
    const eq2: TrucoEquipe = { id: 't2', nome: 'Time Beta', cidade: 'Goiabal', status: 'aprovado' };
    const equipes = [eq1, eq2];

    // Partida com placar 12 x 4, porém com status "agendada" (cenário de inserção rápida)
    const partidas: TrucoPartida[] = [
      { 
        id: 'p1', 
        tipo_fase: 'primeira_fase', 
        rodada: 1, 
        numero_jogo: 1, 
        time_a_id: 't1', 
        time_b_id: 't2', 
        pontos_time_a: 12, 
        pontos_time_b: 4, 
        vencedor_id: 't1', 
        status: 'agendada', 
        fase_nome: 'Rodada 01' 
      }
    ];

    const resultado = calcularClassificacao(equipes, partidas);
    expect(resultado[0].equipe.id).toBe('t1');
    expect(resultado[0].pontos).toBe(3);
    expect(resultado[0].vitorias).toBe(1);
    expect(resultado[0].saldoPontos).toBe(8);
    expect(resultado[1].equipe.id).toBe('t2');
    expect(resultado[1].pontos).toBe(0);
    expect(resultado[1].saldoPontos).toBe(-8);
  });
});

describe('Mata-Mata (Top 8, Grupos A e B e Grande Final)', () => {
  it('deve sortear e estruturar corretamente as 7 partidas do Mata-Mata para os 8 classificados', async () => {
    const top8: TrucoEquipe[] = Array.from({ length: 8 }, (_, i) => ({
      id: `team_${i + 1}`,
      nome: `Equipe ${i + 1}`,
      cidade: 'Goiabal',
      status: 'aprovado'
    }));

    const { grupoA, grupoB, partidasMataMata } = await realizarSorteioMataMata(top8);

    expect(grupoA.length).toBe(4);
    expect(grupoB.length).toBe(4);
    expect(partidasMataMata.length).toBe(7);

    // Verificar se as semifinais contêm os times sorteados
    const semiA1 = partidasMataMata.find(p => p.tipo_fase === 'semi_a1');
    const semiA2 = partidasMataMata.find(p => p.tipo_fase === 'semi_a2');
    const semiB1 = partidasMataMata.find(p => p.tipo_fase === 'semi_b1');
    const semiB2 = partidasMataMata.find(p => p.tipo_fase === 'semi_b2');

    expect(semiA1?.time_a_id).toBeTruthy();
    expect(semiA1?.time_b_id).toBeTruthy();
    expect(semiA2?.time_a_id).toBeTruthy();
    expect(semiA2?.time_b_id).toBeTruthy();

    expect(semiB1?.time_a_id).toBeTruthy();
    expect(semiB1?.time_b_id).toBeTruthy();
    expect(semiB2?.time_a_id).toBeTruthy();
    expect(semiB2?.time_b_id).toBeTruthy();
  });

  it('deve avançar vencedores para as Finais de Grupo e Grande Final', async () => {
    const top8: TrucoEquipe[] = Array.from({ length: 8 }, (_, i) => ({
      id: `t_${i + 1}`,
      nome: `Time ${i + 1}`,
      cidade: 'Goiabal',
      status: 'aprovado'
    }));

    const { partidasMataMata } = await realizarSorteioMataMata(top8);

    // Simula conclusão da Semifinal A1 (vence Time 1) e Semifinal A2 (vence Time 3)
    const semiA1 = partidasMataMata.find(p => p.tipo_fase === 'semi_a1')!;
    semiA1.pontos_time_a = 12;
    semiA1.pontos_time_b = 4;
    semiA1.vencedor_id = semiA1.time_a_id;
    semiA1.status = 'finalizada';

    const semiA2 = partidasMataMata.find(p => p.tipo_fase === 'semi_a2')!;
    semiA2.pontos_time_a = 12;
    semiA2.pontos_time_b = 8;
    semiA2.vencedor_id = semiA2.time_a_id;
    semiA2.status = 'finalizada';

    await atualizarChaveamentoMataMata(partidasMataMata);

    const finalA = partidasMataMata.find(p => p.tipo_fase === 'final_a')!;
    expect(finalA.time_a_id).toBe(semiA1.vencedor_id);
    expect(finalA.time_b_id).toBe(semiA2.vencedor_id);
  });
});

describe('Sistema de Moderação e Status dos Times (Pendente, Aprovado, Reprovado)', () => {
  it('novos cadastros de equipes devem iniciar com status PENDENTE', async () => {
    const { cadastrarEquipe } = await import('./trucoService');
    const equipe = await cadastrarEquipe(
      { nome: 'Time Teste Pendente', cidade: 'Goiabal' },
      [
        { nome_completo: 'J1', cpf: '111', data_nascimento: '1990-01-01', is_titular: true },
        { nome_completo: 'J2', cpf: '222', data_nascimento: '1990-01-01', is_titular: true },
        { nome_completo: 'J3', cpf: '333', data_nascimento: '1990-01-01', is_titular: true },
        { nome_completo: 'J4', cpf: '444', data_nascimento: '1990-01-01', is_titular: true }
      ]
    );

    expect(equipe.status).toBe('pendente');
  });

  it('deve aprovar e reprovar equipes corretamente refletindo no status', async () => {
    const { cadastrarEquipe, aprovarEquipe, reprovarEquipe, buscarTodasEquipesAdmin } = await import('./trucoService');
    const equipe = await cadastrarEquipe(
      { nome: 'Time Para Aprovar', cidade: 'Goiabal' },
      [
        { nome_completo: 'J1', cpf: '111', data_nascimento: '1990-01-01', is_titular: true },
        { nome_completo: 'J2', cpf: '222', data_nascimento: '1990-01-01', is_titular: true },
        { nome_completo: 'J3', cpf: '333', data_nascimento: '1990-01-01', is_titular: true },
        { nome_completo: 'J4', cpf: '444', data_nascimento: '1990-01-01', is_titular: true }
      ]
    );

    expect(equipe.status).toBe('pendente');

    // Aprovar
    await aprovarEquipe(equipe.id);
    let todas = await buscarTodasEquipesAdmin();
    let eqAtualizada = todas.find(e => e.id === equipe.id);
    expect(eqAtualizada?.status).toBe('aprovado');

    // Reprovar
    await reprovarEquipe(equipe.id);
    todas = await buscarTodasEquipesAdmin();
    eqAtualizada = todas.find(e => e.id === equipe.id);
    expect(eqAtualizada?.status).toBe('reprovado');
  });

  it('deve excluir uma equipe individualmente e não re-popular automaticamente', async () => {
    const { cadastrarEquipe, excluirEquipe, buscarTodasEquipesAdmin } = await import('./trucoService');
    const equipe = await cadastrarEquipe(
      { nome: 'Time Para Excluir', cidade: 'Goiabal' },
      [
        { nome_completo: 'J1', cpf: '111', data_nascimento: '1990-01-01', is_titular: true },
        { nome_completo: 'J2', cpf: '222', data_nascimento: '1990-01-01', is_titular: true },
        { nome_completo: 'J3', cpf: '333', data_nascimento: '1990-01-01', is_titular: true },
        { nome_completo: 'J4', cpf: '444', data_nascimento: '1990-01-01', is_titular: true }
      ]
    );

    await excluirEquipe(equipe.id);
    const todas = await buscarTodasEquipesAdmin();
    const encontrada = todas.find(e => e.id === equipe.id);
    expect(encontrada).toBeUndefined();
  });

  it('deve excluir todas as equipes e manter a lista vazia sem auto-popular', async () => {
    const { excluirTodasEquipes, buscarTodasEquipesAdmin } = await import('./trucoService');
    await excluirTodasEquipes();
    const todas = await buscarTodasEquipesAdmin();
    expect(todas.length).toBe(0);
  });
});

describe('Regra de CPF Opcional e Bônus de Premiação no Cadastro', () => {
  it('deve cadastrar equipe com todos CPFs e definir cadastro_regularizado como TRUE', async () => {
    const { cadastrarEquipe, buscarTodasEquipesAdmin } = await import('./trucoService');
    const equipe = await cadastrarEquipe(
      { nome: 'Time Regularizado', cidade: 'Goiabal' },
      [
        { nome_completo: 'J1', cpf: '123.456.789-01', data_nascimento: '1990-01-01', is_titular: true },
        { nome_completo: 'J2', cpf: '234.567.890-12', data_nascimento: '1990-01-01', is_titular: true },
        { nome_completo: 'J3', cpf: '345.678.901-23', data_nascimento: '1990-01-01', is_titular: true },
        { nome_completo: 'J4', cpf: '456.789.012-34', data_nascimento: '1990-01-01', is_titular: true }
      ]
    );

    expect(equipe.cadastro_regularizado).toBe(true);

    const todas = await buscarTodasEquipesAdmin();
    const encontrada = todas.find(e => e.id === equipe.id);
    expect(encontrada?.cadastro_regularizado).toBe(true);
  });

  it('deve cadastrar equipe sem CPF e definir cadastro_regularizado como FALSE quando explicitado ou inferido', async () => {
    const { cadastrarEquipe, buscarTodasEquipesAdmin } = await import('./trucoService');
    const equipe = await cadastrarEquipe(
      { nome: 'Time Sem CPF', cidade: 'Goiabal', cadastro_regularizado: false },
      [
        { nome_completo: 'J1', cpf: '', data_nascimento: '1990-01-01', is_titular: true },
        { nome_completo: 'J2', cpf: '', data_nascimento: '1990-01-01', is_titular: true },
        { nome_completo: 'J3', cpf: '', data_nascimento: '1990-01-01', is_titular: true },
        { nome_completo: 'J4', cpf: '', data_nascimento: '1990-01-01', is_titular: true }
      ]
    );

    expect(equipe.cadastro_regularizado).toBe(false);

    const todas = await buscarTodasEquipesAdmin();
    const encontrada = todas.find(e => e.id === equipe.id);
    expect(encontrada?.cadastro_regularizado).toBe(false);
  });

  it('deve editar todos os dados de uma equipe existente e seus jogadores via atualizarEquipeCompleta', async () => {
    const { cadastrarEquipe, atualizarEquipeCompleta, buscarTodasEquipesAdmin } = await import('./trucoService');
    const equipe = await cadastrarEquipe(
      { nome: 'Nome Antigo', cidade: 'Cidade Antiga' },
      [
        { nome_completo: 'J1 Antigo', cpf: '111', data_nascimento: '1990-01-01', is_titular: true },
        { nome_completo: 'J2 Antigo', cpf: '222', data_nascimento: '1990-01-01', is_titular: true },
        { nome_completo: 'J3 Antigo', cpf: '333', data_nascimento: '1990-01-01', is_titular: true },
        { nome_completo: 'J4 Antigo', cpf: '444', data_nascimento: '1990-01-01', is_titular: true }
      ]
    );

    const editada = await atualizarEquipeCompleta(
      equipe.id,
      {
        nome: 'Nome Novo e Atualizado',
        cidade: 'Goiabal Nova',
        status: 'aprovado',
        cadastro_regularizado: true
      },
      [
        { nome_completo: 'J1 Novo', cpf: '123.456.789-00', data_nascimento: '1995-05-10', is_titular: true },
        { nome_completo: 'J2 Novo', cpf: '234.567.890-11', data_nascimento: '1996-06-11', is_titular: true },
        { nome_completo: 'J3 Novo', cpf: '345.678.901-22', data_nascimento: '1997-07-12', is_titular: true },
        { nome_completo: 'J4 Novo', cpf: '456.789.012-33', data_nascimento: '1998-08-13', is_titular: true },
        { nome_completo: 'Reserva Novo', cpf: '567.890.123-44', data_nascimento: '1999-09-14', is_titular: false }
      ]
    );

    expect(editada.nome).toBe('Nome Novo e Atualizado');
    expect(editada.cidade).toBe('Goiabal Nova');
    expect(editada.status).toBe('aprovado');
    expect(editada.cadastro_regularizado).toBe(true);
    expect(editada.jogadores?.length).toBe(5);

    const todas = await buscarTodasEquipesAdmin();
    const noBanco = todas.find(e => e.id === equipe.id);
    expect(noBanco?.nome).toBe('Nome Novo e Atualizado');
    expect(noBanco?.status).toBe('aprovado');
  });

  it('deve distribuir a premiação de R$ 2.500,00 exclusivamente para os 5 melhores times elegíveis pulando times sem CPF', async () => {
    const { calcularClassificacao } = await import('./trucoService');

    const mockEquipes = [
      { id: '1', nome: 'Time A', cidade: 'Cidade A', status: 'aprovado' as const, cadastro_regularizado: true },
      { id: '2', nome: 'Time B', cidade: 'Cidade B', status: 'aprovado' as const, cadastro_regularizado: false }, // Sem CPF
      { id: '3', nome: 'Time C', cidade: 'Cidade C', status: 'aprovado' as const, cadastro_regularizado: true },
      { id: '4', nome: 'Time D', cidade: 'Cidade D', status: 'aprovado' as const, cadastro_regularizado: true },
      { id: '5', nome: 'Time E', cidade: 'Cidade E', status: 'aprovado' as const, cadastro_regularizado: false }, // Sem CPF
      { id: '6', nome: 'Time F', cidade: 'Cidade F', status: 'aprovado' as const, cadastro_regularizado: true },
      { id: '7', nome: 'Time G', cidade: 'Cidade G', status: 'aprovado' as const, cadastro_regularizado: true },
      { id: '8', nome: 'Time H', cidade: 'Cidade H', status: 'aprovado' as const, cadastro_regularizado: true },
    ];

    // Simulação de partidas para ordenar A > B > C > D > E > F > G > H
    const mockPartidas = [
      { id: 'p1', tipo_fase: 'primeira_fase' as const, rodada: 1, numero_jogo: 1, time_a_id: '1', time_b_id: '8', pontos_time_a: 12, pontos_time_b: 0, vencedor_id: '1', status: 'finalizada' as const, fase_nome: '1ª Fase' },
      { id: 'p2', tipo_fase: 'primeira_fase' as const, rodada: 1, numero_jogo: 2, time_a_id: '2', time_b_id: '8', pontos_time_a: 11, pontos_time_b: 0, vencedor_id: '2', status: 'finalizada' as const, fase_nome: '1ª Fase' },
      { id: 'p3', tipo_fase: 'primeira_fase' as const, rodada: 1, numero_jogo: 3, time_a_id: '3', time_b_id: '8', pontos_time_a: 10, pontos_time_b: 0, vencedor_id: '3', status: 'finalizada' as const, fase_nome: '1ª Fase' },
      { id: 'p4', tipo_fase: 'primeira_fase' as const, rodada: 1, numero_jogo: 4, time_a_id: '4', time_b_id: '8', pontos_time_a: 9, pontos_time_b: 0, vencedor_id: '4', status: 'finalizada' as const, fase_nome: '1ª Fase' },
      { id: 'p5', tipo_fase: 'primeira_fase' as const, rodada: 1, numero_jogo: 5, time_a_id: '5', time_b_id: '8', pontos_time_a: 8, pontos_time_b: 0, vencedor_id: '5', status: 'finalizada' as const, fase_nome: '1ª Fase' },
      { id: 'p6', tipo_fase: 'primeira_fase' as const, rodada: 1, numero_jogo: 6, time_a_id: '6', time_b_id: '8', pontos_time_a: 7, pontos_time_b: 0, vencedor_id: '6', status: 'finalizada' as const, fase_nome: '1ª Fase' },
      { id: 'p7', tipo_fase: 'primeira_fase' as const, rodada: 1, numero_jogo: 7, time_a_id: '7', time_b_id: '8', pontos_time_a: 6, pontos_time_b: 0, vencedor_id: '7', status: 'finalizada' as const, fase_nome: '1ª Fase' },
    ];

    const ranking = calcularClassificacao(mockEquipes, mockPartidas);

    // Verificação de Posição Geral Esportiva
    expect(ranking[0].equipe.nome).toBe('Time A');
    expect(ranking[0].posicao).toBe(1);
    expect(ranking[0].premiacaoPosicao).toBe(1);
    expect(ranking[0].premiacaoValor).toBe(1000);
    expect(ranking[0].premiacaoFormatada).toBe('R$ 1.000,00');

    // Time B é 2º Geral, mas não elegível
    expect(ranking[1].equipe.nome).toBe('Time B');
    expect(ranking[1].posicao).toBe(2);
    expect(ranking[1].isElegivelPremiacao).toBe(false);
    expect(ranking[1].premiacaoPosicao).toBeUndefined();
    expect(ranking[1].premiacaoValor).toBeUndefined();

    // Time C é 3º Geral, mas é o 2º Elegível -> Recebe R$ 600
    expect(ranking[2].equipe.nome).toBe('Time C');
    expect(ranking[2].posicao).toBe(3);
    expect(ranking[2].isElegivelPremiacao).toBe(true);
    expect(ranking[2].premiacaoPosicao).toBe(2);
    expect(ranking[2].premiacaoValor).toBe(600);
    expect(ranking[2].premiacaoFormatada).toBe('R$ 600,00');

    // Time D é 4º Geral, 3º Elegível -> Recebe R$ 400
    expect(ranking[3].equipe.nome).toBe('Time D');
    expect(ranking[3].posicao).toBe(4);
    expect(ranking[3].isElegivelPremiacao).toBe(true);
    expect(ranking[3].premiacaoPosicao).toBe(3);
    expect(ranking[3].premiacaoValor).toBe(400);

    // Time E é 5º Geral, mas não elegível
    expect(ranking[4].equipe.nome).toBe('Time E');
    expect(ranking[4].posicao).toBe(5);
    expect(ranking[4].isElegivelPremiacao).toBe(false);
    expect(ranking[4].premiacaoPosicao).toBeUndefined();

    // Time F é 6º Geral, 4º Elegível -> Recebe R$ 300
    expect(ranking[5].equipe.nome).toBe('Time F');
    expect(ranking[5].posicao).toBe(6);
    expect(ranking[5].isElegivelPremiacao).toBe(true);
    expect(ranking[5].premiacaoPosicao).toBe(4);
    expect(ranking[5].premiacaoValor).toBe(300);

    // Time G é 7º Geral, 5º Elegível -> Recebe R$ 200
    expect(ranking[6].equipe.nome).toBe('Time G');
    expect(ranking[6].posicao).toBe(7);
    expect(ranking[6].isElegivelPremiacao).toBe(true);
    expect(ranking[6].premiacaoPosicao).toBe(5);
    expect(ranking[6].premiacaoValor).toBe(200);

    // Time H é 8º Geral, 6º Elegível -> Fora dos 5 premiados
    expect(ranking[7].equipe.nome).toBe('Time H');
    expect(ranking[7].posicao).toBe(8);
    expect(ranking[7].isElegivelPremiacao).toBe(true);
    expect(ranking[7].premiacaoPosicao).toBeUndefined();
  });

  it('deve calcular corretamente as datas das rodadas iniciando em 03/09/2026 em terças e quintas', async () => {
    const { calcularDataRodada } = await import('./trucoService');

    const r1 = calcularDataRodada(1);
    expect(r1.dataFormatada).toBe('03/09/2026');
    expect(r1.diaSemana).toBe('Quinta-feira');
    expect(r1.textoCompleto).toBe('Quinta-feira, 03/09/2026');

    const r2 = calcularDataRodada(2);
    expect(r2.dataFormatada).toBe('08/09/2026');
    expect(r2.diaSemana).toBe('Terça-feira');
    expect(r2.textoCompleto).toBe('Terça-feira, 08/09/2026');

    const r3 = calcularDataRodada(3);
    expect(r3.dataFormatada).toBe('10/09/2026');
    expect(r3.diaSemana).toBe('Quinta-feira');
    expect(r3.textoCompleto).toBe('Quinta-feira, 10/09/2026');

    const r4 = calcularDataRodada(4);
    expect(r4.dataFormatada).toBe('15/09/2026');
    expect(r4.diaSemana).toBe('Terça-feira');

    const r5 = calcularDataRodada(5);
    expect(r5.dataFormatada).toBe('17/09/2026');
    expect(r5.diaSemana).toBe('Quinta-feira');
  });

  it('deve gerar imagem de baralho com cartas e o nome do time estampado', async () => {
    const { cadastrarEquipe, gerarEscudoBaralhoComNome } = await import('./trucoService');

    const nomeTime = 'Reis do Zap de Goiabal';
    const nova = await cadastrarEquipe(
      { nome: nomeTime, cidade: 'São José do Goiabal - MG' },
      [
        { nome_completo: 'J1', cpf: '111.111.111-11', data_nascimento: '1990-01-01' },
        { nome_completo: 'J2', cpf: '222.222.222-22', data_nascimento: '1990-01-01' },
        { nome_completo: 'J3', cpf: '333.333.333-33', data_nascimento: '1990-01-01' },
        { nome_completo: 'J4', cpf: '444.444.444-44', data_nascimento: '1990-01-01' }
      ]
    );

    expect(nova.foto_url).toBeTruthy();
    expect(nova.foto_url).toContain('data:image/svg+xml');
    
    // A imagem gerada contém o nome do time decodificado
    const svgDecodificado = decodeURIComponent((nova.foto_url || '').replace('data:image/svg+xml;utf8,', ''));
    expect(svgDecodificado.toUpperCase()).toContain('REIS DO ZAP');
    expect(svgDecodificado).toContain('svg');

    // Teste direto de gerarEscudoBaralhoComNome
    const escudo = gerarEscudoBaralhoComNome('Ás de Espadas');
    expect(escudo).toContain('data:image/svg+xml');
    expect(decodeURIComponent(escudo)).toContain('ÁS DE ESPADAS');
  });
});

