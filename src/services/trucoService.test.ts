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
  calcularClassificacao, 
  realizarSorteioMataMata,
  atualizarChaveamentoMataMata,
  type TrucoEquipe, 
  type TrucoPartida 
} from './trucoService';

describe('Matemática Round-Robin (Circle Method)', () => {
  it('deve gerar corretamente rodadas simultâneas para 4 equipes (3 rodadas, 2 jogos/rodada, 6 jogos no total)', () => {
    const times = ['T1', 'T2', 'T3', 'T4'];
    const confrontos = gerarRoundRobin(times);

    expect(confrontos.length).toBe(6); // 4 * 3 / 2 = 6

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
    const confrontos = gerarRoundRobin(times);

    expect(confrontos.length).toBe(28); // 8 * 7 / 2 = 28

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

  it('deve lançar erro caso a quantidade de equipes seja ímpar', () => {
    const timesImpar = ['T1', 'T2', 'T3', 'T4', 'T5'];
    expect(() => gerarRoundRobin(timesImpar)).toThrow();
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
