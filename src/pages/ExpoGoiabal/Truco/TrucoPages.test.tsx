import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TrucoHomePage } from './TrucoHomePage';
import { TrucoCadastroPage } from './TrucoCadastroPage';
import { TrucoSorteioRodadasPage } from './TrucoSorteioRodadasPage';
import { TrucoPartidasPage } from './TrucoPartidasPage';
import { TrucoTabelaPage } from './TrucoTabelaPage';
import { TrucoMataMataPage } from './TrucoMataMataPage';

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

  it('deve renderizar TrucoTabelaPage sem erros', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/ExpoGoiabal/Truco/Tabela']}>
        <TrucoTabelaPage />
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
});
