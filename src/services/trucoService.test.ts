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
});

