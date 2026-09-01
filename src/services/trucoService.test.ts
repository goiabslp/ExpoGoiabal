import { describe, it, expect } from 'vitest';
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
  const equipeA: TrucoEquipe = { id: '1', nome: 'Valetes de Ouro', cidade: 'São José do Goiabal' };
  const equipeB: TrucoEquipe = { id: '2', nome: 'Ases do Blefe', cidade: 'Dionísio' };
  const equipeC: TrucoEquipe = { id: '3', nome: 'Reis da Noite', cidade: 'São Domingos do Prata' };

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
      cidade: 'Goiabal'
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
      cidade: 'Goiabal'
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
