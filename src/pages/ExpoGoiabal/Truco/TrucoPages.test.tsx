import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../services/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: async () => ({ data: null, error: null }), single: async () => ({ data: null, error: null }) }),
        order: () => Promise.resolve({ data: [], error: null }),
        then: (resolve: any) => resolve({ data: [], error: null })
      }),
      insert: async () => ({ error: null }),
      upsert: async () => ({ error: null }),
      update: () => ({ eq: async () => ({ error: null, select: () => ({ single: async () => ({ data: null, error: null }) }) }) }),
      delete: () => ({ eq: async () => ({ error: null }), neq: async () => ({ error: null }), or: async () => ({ error: null }) })
    }),
    storage: {
      from: () => ({
        upload: async () => ({ error: null }),
        getPublicUrl: (p: string) => ({ data: { publicUrl: `https://mock.storage/${p}` } })
      })
    },
    channel: () => ({
      on: function() { return this; },
      subscribe: function() { return this; },
      send: async () => ({})
    }),
    removeChannel: () => {}
  }
}));

import { TrucoHomePage } from './TrucoHomePage';
import { TrucoCadastroPage } from './TrucoCadastroPage';
import { TrucoSorteioRodadasPage } from './TrucoSorteioRodadasPage';
import { TrucoPartidasPage } from './TrucoPartidasPage';
import { TrucoPartidasRelatorioImpressaoPage } from './TrucoPartidasRelatorioImpressaoPage';
import { TrucoTabelaRelatorioImpressaoPage } from './TrucoTabelaRelatorioImpressaoPage';
import { TrucoTabelaPage } from './TrucoTabelaPage';
import { TrucoMataMataPage } from './TrucoMataMataPage';
import { TrucoRegulamentoPage } from './TrucoRegulamentoPage';
import { TrucoRegulamentoRelatorioImpressaoPage } from './TrucoRegulamentoRelatorioImpressaoPage';
import { TrucoPartidasDoDiaPage } from './TrucoPartidasDoDiaPage';
import { AdminTrucoHomePage } from '../../Admin/Truco/AdminTrucoHomePage';
import { AdminTrucoEquipesPage } from '../../Admin/Truco/AdminTrucoEquipesPage';
import { AdminTrucoSorteioPage } from '../../Admin/Truco/AdminTrucoSorteioPage';
import { AdminTrucoPartidasDoDiaPage } from '../../Admin/Truco/AdminTrucoPartidasDoDiaPage';
import { 
  obterEstadoCronometro, 
  dispararInicioPartidaCom5s, 
  pausarCronometro, 
  retomarCronometro, 
  acionarQuedaSaideira, 
  encerrarPartidasDoDia, 
  reiniciarCronometro,
  definirTempoEspecifico,
  formatarTempoHHMMSS
} from '../../../services/trucoCronometroService';

describe('Renderização das páginas completas de Truco', () => {
  it('deve renderizar TrucoHomePage sem erros', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/ExpoGoiabal/Truco']}>
        <TrucoHomePage />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });

  it('deve renderizar TrucoCadastroPage sem erros', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/ExpoGoiabal/Truco/Cadastrar']}>
        <TrucoCadastroPage />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });

  it('deve renderizar TrucoSorteioRodadasPage na rota principal sem erros', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/ExpoGoiabal/Truco/Sorteio']}>
        <TrucoSorteioRodadasPage />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });

  it('deve renderizar TrucoSorteioRodadasPage na rota de Resumo sem erros', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/ExpoGoiabal/Truco/Sorteio/Resumo']}>
        <TrucoSorteioRodadasPage />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });

  it('deve renderizar TrucoSorteioRodadasPage na rota de TV sem erros', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/ExpoGoiabal/Truco/Sorteio/TV']}>
        <TrucoSorteioRodadasPage />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });

  it('deve renderizar TrucoSorteioRodadasPage na rota AoVivo sem erros', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/ExpoGoiabal/Truco/Sorteio/AoVivo']}>
        <TrucoSorteioRodadasPage />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });

  it('deve renderizar TrucoPartidasPage sem erros', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/ExpoGoiabal/Truco/Partidas']}>
        <TrucoPartidasPage />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });

  it('deve renderizar TrucoPartidasPage na rota dinâmica de rodada específica', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/ExpoGoiabal/Truco/Partidas/Rodada/2']}>
        <TrucoPartidasPage />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });

  it('deve renderizar TrucoPartidasRelatorioImpressaoPage sem erros', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/ExpoGoiabal/Truco/Partidas/Imprimir/Rodada/1']}>
        <TrucoPartidasRelatorioImpressaoPage />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });

  it('deve renderizar TrucoTabelaPage sem erros', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/ExpoGoiabal/Truco/Tabela']}>
        <TrucoTabelaPage />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });

  it('deve renderizar TrucoTabelaRelatorioImpressaoPage sem erros', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/ExpoGoiabal/Truco/Tabela/Imprimir']}>
        <TrucoTabelaRelatorioImpressaoPage />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });

  it('deve renderizar TrucoMataMataPage sem erros', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/ExpoGoiabal/Truco/MataMata']}>
        <TrucoMataMataPage />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });

  it('deve renderizar AdminTrucoHomePage sem erros', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/Admin/Truco']}>
        <AdminTrucoHomePage />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });

  it('deve renderizar AdminTrucoEquipesPage sem erros', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/Admin/Truco/Equipes']}>
        <AdminTrucoEquipesPage />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });

  it('deve renderizar AdminTrucoSorteioPage sem erros', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/Admin/Truco/Sorteio']}>
        <AdminTrucoSorteioPage />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });

  it('deve renderizar TrucoRegulamentoPage sem erros', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/ExpoGoiabal/Truco/Regulamento']}>
        <TrucoRegulamentoPage />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });

  it('deve renderizar TrucoRegulamentoRelatorioImpressaoPage sem erros', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/ExpoGoiabal/Truco/Regulamento/Imprimir']}>
        <TrucoRegulamentoRelatorioImpressaoPage />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });

  it('deve renderizar TrucoPartidasDoDiaPage pública sem erros', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/ExpoGoiabal/Truco/PartidasDoDia']}>
        <TrucoPartidasDoDiaPage />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });

  it('deve renderizar AdminTrucoPartidasDoDiaPage sem erros', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/Admin/Truco/PartidasDoDia']}>
        <AdminTrucoPartidasDoDiaPage />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });
});

describe('Serviço de Cronômetro de Truco (trucoCronometroService)', () => {
  it('deve inicializar estado e formatar 02:00:00 corretamente', () => {
    const formatado = formatarTempoHHMMSS(7200);
    expect(formatado.horas).toBe('02');
    expect(formatado.minutos).toBe('00');
    expect(formatado.segundos).toBe('00');
    expect(formatado.texto).toBe('02:00:00');
  });

  it('deve disparar pré-contagem de 5 segundos', () => {
    const est = dispararInicioPartidaCom5s(1);
    expect(est.status).toBe('pre_inicio_5s');
    expect(est.preInicioRestante).toBe(5);
  });

  it('deve acionar Queda Saideira', () => {
    const est = acionarQuedaSaideira();
    expect(est.status).toBe('queda_saideira');
    expect(est.tempoRestanteSegundos).toBe(0);
  });

  it('deve pausar, retomar e obter estado do cronômetro', () => {
    const estInicial = obterEstadoCronometro();
    expect(estInicial).toBeTruthy();

    const estPausado = pausarCronometro();
    expect(estPausado).toBeTruthy();

    const estRetomado = retomarCronometro();
    expect(estRetomado).toBeTruthy();
  });

  it('deve encerrar partidas do dia', () => {
    const est = encerrarPartidasDoDia();
    expect(est.status).toBe('encerrado');
  });

  it('deve reiniciar cronômetro para 02:00:00', () => {
    const est = reiniciarCronometro(2);
    expect(est.status).toBe('parado');
    expect(est.tempoRestanteSegundos).toBe(7200);
    expect(est.rodada).toBe(2);
  });

  it('deve definir tempo específico personalizado e refletir no estado', () => {
    const est = definirTempoEspecifico(5400, false); // 1h 30m = 5400s
    expect(est.tempoRestanteSegundos).toBe(5400);

    const estIniciado = definirTempoEspecifico(1800, true); // 30 min iniciado
    expect(estIniciado.tempoRestanteSegundos).toBe(1800);
    expect(estIniciado.status).toBe('em_andamento');
  });
});
