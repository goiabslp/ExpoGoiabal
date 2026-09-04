import { createBrowserRouter, Navigate } from 'react-router-dom';
import { trackPageView } from '../lib/analytics';
import { ExpoGoiabalPage } from '../pages/ExpoGoiabal/ExpoGoiabalPage';
import { EmbaixadoraPage } from '../pages/ExpoGoiabal/EmbaixadoraPage';
import { AdminPage } from '../pages/Admin/AdminPage';
import { PatrocinadorPage } from '../pages/ExpoGoiabal/PatrocinadorPage';
import { FotosPage } from '../pages/ExpoGoiabal/FotosPage';
import { ShowPage } from '../pages/ExpoGoiabal/ShowPage';
import { ShowSelectorPage } from '../pages/ExpoGoiabal/ShowSelectorPage';
import { TrucoHomePage } from '../pages/ExpoGoiabal/Truco/TrucoHomePage';
import { TrucoPartidasPage } from '../pages/ExpoGoiabal/Truco/TrucoPartidasPage';
import { TrucoTabelaPage } from '../pages/ExpoGoiabal/Truco/TrucoTabelaPage';
import { TrucoMataMataPage } from '../pages/ExpoGoiabal/Truco/TrucoMataMataPage';
import { TrucoRegulamentoPage } from '../pages/ExpoGoiabal/Truco/TrucoRegulamentoPage';
import { TrucoRegulamentoRelatorioImpressaoPage } from '../pages/ExpoGoiabal/Truco/TrucoRegulamentoRelatorioImpressaoPage';
import { TrucoPartidasDoDiaPage } from '../pages/ExpoGoiabal/Truco/TrucoPartidasDoDiaPage';
import { TrucoPartidasRelatorioImpressaoPage } from '../pages/ExpoGoiabal/Truco/TrucoPartidasRelatorioImpressaoPage';
import { TrucoTabelaRelatorioImpressaoPage } from '../pages/ExpoGoiabal/Truco/TrucoTabelaRelatorioImpressaoPage';
import { AdminTrucoPartidasPage } from '../pages/Admin/AdminTrucoPartidasPage';
import { AdminTrucoHomePage } from '../pages/Admin/Truco/AdminTrucoHomePage';
import { AdminTrucoEquipesPage } from '../pages/Admin/Truco/AdminTrucoEquipesPage';
import { AdminTrucoSorteioPage } from '../pages/Admin/Truco/AdminTrucoSorteioPage';
import { AdminTrucoPartidasDoDiaPage } from '../pages/Admin/Truco/AdminTrucoPartidasDoDiaPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/ExpoGoiabal/Inicio" replace />,
  },
  {
    path: '/Admin/Truco',
    element: <AdminTrucoHomePage />,
  },
  {
    path: '/Admin/truco',
    element: <AdminTrucoHomePage />,
  },
  {
    path: '/Admin/Truco/Inicio',
    element: <AdminTrucoHomePage />,
  },
  {
    path: '/Admin/truco/inicio',
    element: <AdminTrucoHomePage />,
  },
  {
    path: '/Admin/Truco/Equipes',
    element: <AdminTrucoEquipesPage />,
  },
  {
    path: '/Admin/truco/equipes',
    element: <AdminTrucoEquipesPage />,
  },
  {
    path: '/Admin/Truco/Times',
    element: <AdminTrucoEquipesPage />,
  },
  {
    path: '/Admin/truco/times',
    element: <AdminTrucoEquipesPage />,
  },
  {
    path: '/Admin/Truco/Sorteio',
    element: <AdminTrucoSorteioPage />,
  },
  {
    path: '/Admin/truco/sorteio',
    element: <AdminTrucoSorteioPage />,
  },
  {
    path: '/Admin/Truco/Partidas',
    element: <AdminTrucoPartidasPage />,
  },
  {
    path: '/Admin/truco/partidas',
    element: <AdminTrucoPartidasPage />,
  },
  {
    path: '/Admin/Truco/partidas',
    element: <AdminTrucoPartidasPage />,
  },
  {
    path: '/Admin/Truco/Partidas/Rodada/:rodadaId',
    element: <AdminTrucoPartidasPage />,
  },
  {
    path: '/Admin/truco/partidas/rodada/:rodadaId',
    element: <AdminTrucoPartidasPage />,
  },
  {
    path: '/Admin/Truco/PartidasDoDia',
    element: <AdminTrucoPartidasDoDiaPage />,
  },
  {
    path: '/Admin/truco/partidasdodia',
    element: <AdminTrucoPartidasDoDiaPage />,
  },
  {
    path: '/Admin/Truco/ControlePartidas',
    element: <AdminTrucoPartidasDoDiaPage />,
  },
  {
    path: '/Admin/truco/controlepartidas',
    element: <AdminTrucoPartidasDoDiaPage />,
  },
  {
    path: '/Admin/Truco/Cronometro',
    element: <AdminTrucoPartidasDoDiaPage />,
  },
  {
    path: '/Admin/truco/cronometro',
    element: <AdminTrucoPartidasDoDiaPage />,
  },
  {
    path: '/ExpoGoiabal/Inicio',
    element: <ExpoGoiabalPage />,
  },
  {
    path: '/ExpoGoiabal/Truco',
    element: <TrucoHomePage />,
  },
  {
    path: '/ExpoGoiabal/truco',
    element: <TrucoHomePage />,
  },
  {
    path: '/ExpoGoiabal/Truco/Inicio',
    element: <TrucoHomePage />,
  },
  {
    path: '/ExpoGoiabal/truco/inicio',
    element: <TrucoHomePage />,
  },
  {
    path: '/ExpoGoiabal/Truco/Cadastrar',
    element: <Navigate to="/ExpoGoiabal/Truco" replace />,
  },
  {
    path: '/ExpoGoiabal/truco/cadastrar',
    element: <Navigate to="/ExpoGoiabal/Truco" replace />,
  },
  {
    path: '/ExpoGoiabal/Truco/Sorteio',
    element: <Navigate to="/ExpoGoiabal/Truco" replace />,
  },
  {
    path: '/ExpoGoiabal/truco/sorteio',
    element: <Navigate to="/ExpoGoiabal/Truco" replace />,
  },
  {
    path: '/ExpoGoiabal/Truco/Sorteio/AoVivo',
    element: <Navigate to="/ExpoGoiabal/Truco" replace />,
  },
  {
    path: '/ExpoGoiabal/truco/sorteio/aovivo',
    element: <Navigate to="/ExpoGoiabal/Truco" replace />,
  },
  {
    path: '/ExpoGoiabal/Truco/Sorteio/Resumo',
    element: <Navigate to="/ExpoGoiabal/Truco" replace />,
  },
  {
    path: '/ExpoGoiabal/truco/sorteio/resumo',
    element: <Navigate to="/ExpoGoiabal/Truco" replace />,
  },
  {
    path: '/ExpoGoiabal/Truco/Sorteio/TV',
    element: <Navigate to="/ExpoGoiabal/Truco" replace />,
  },
  {
    path: '/ExpoGoiabal/truco/sorteio/tv',
    element: <Navigate to="/ExpoGoiabal/Truco" replace />,
  },
  {
    path: '/ExpoGoiabal/Truco/Partidas',
    element: <TrucoPartidasPage />,
  },
  {
    path: '/ExpoGoiabal/truco/partidas',
    element: <TrucoPartidasPage />,
  },
  {
    path: '/ExpoGoiabal/Truco/Partidas/Rodada/:rodadaId',
    element: <TrucoPartidasPage />,
  },
  {
    path: '/ExpoGoiabal/truco/partidas/rodada/:rodadaId',
    element: <TrucoPartidasPage />,
  },
  {
    path: '/ExpoGoiabal/Truco/Partidas/Imprimir',
    element: <TrucoPartidasRelatorioImpressaoPage />,
  },
  {
    path: '/ExpoGoiabal/truco/partidas/imprimir',
    element: <TrucoPartidasRelatorioImpressaoPage />,
  },
  {
    path: '/ExpoGoiabal/Truco/Partidas/Imprimir/Rodada/:rodadaId',
    element: <TrucoPartidasRelatorioImpressaoPage />,
  },
  {
    path: '/ExpoGoiabal/truco/partidas/imprimir/rodada/:rodadaId',
    element: <TrucoPartidasRelatorioImpressaoPage />,
  },
  {
    path: '/ExpoGoiabal/Truco/Rodadas',
    element: <Navigate to="/ExpoGoiabal/Truco/Partidas" replace />,
  },
  {
    path: '/ExpoGoiabal/truco/rodadas',
    element: <Navigate to="/ExpoGoiabal/Truco/Partidas" replace />,
  },
  {
    path: '/ExpoGoiabal/Truco/Chaveamento',
    element: <TrucoMataMataPage />,
  },
  {
    path: '/ExpoGoiabal/truco/chaveamento',
    element: <TrucoMataMataPage />,
  },
  {
    path: '/ExpoGoiabal/Truco/Tabela',
    element: <TrucoTabelaPage />,
  },
  {
    path: '/ExpoGoiabal/truco/tabela',
    element: <TrucoTabelaPage />,
  },
  {
    path: '/ExpoGoiabal/Truco/Tabela/Imprimir',
    element: <TrucoTabelaRelatorioImpressaoPage />,
  },
  {
    path: '/ExpoGoiabal/truco/tabela/imprimir',
    element: <TrucoTabelaRelatorioImpressaoPage />,
  },
  {
    path: '/ExpoGoiabal/Truco/MataMata',
    element: <TrucoMataMataPage />,
  },
  {
    path: '/ExpoGoiabal/truco/matamata',
    element: <TrucoMataMataPage />,
  },
  {
    path: '/ExpoGoiabal/Truco/Mata-Mata',
    element: <TrucoMataMataPage />,
  },
  {
    path: '/ExpoGoiabal/truco/mata-mata',
    element: <TrucoMataMataPage />,
  },
  {
    path: '/ExpoGoiabal/Truco/Regulamento',
    element: <TrucoRegulamentoPage />,
  },
  {
    path: '/ExpoGoiabal/truco/regulamento',
    element: <TrucoRegulamentoPage />,
  },
  {
    path: '/ExpoGoiabal/Truco/Regulamento/Imprimir',
    element: <TrucoRegulamentoRelatorioImpressaoPage />,
  },
  {
    path: '/ExpoGoiabal/truco/regulamento/imprimir',
    element: <TrucoRegulamentoRelatorioImpressaoPage />,
  },
  {
    path: '/ExpoGoiabal/Truco/PartidasDoDia',
    element: <TrucoPartidasDoDiaPage />,
  },
  {
    path: '/ExpoGoiabal/truco/partidasdodia',
    element: <TrucoPartidasDoDiaPage />,
  },
  {
    path: '/ExpoGoiabal/Truco/PartidaDoDia',
    element: <TrucoPartidasDoDiaPage />,
  },
  {
    path: '/ExpoGoiabal/truco/partidadodia',
    element: <TrucoPartidasDoDiaPage />,
  },
  {
    path: '/ExpoGoiabal/Truco/Cronometro',
    element: <TrucoPartidasDoDiaPage />,
  },
  {
    path: '/ExpoGoiabal/truco/cronometro',
    element: <TrucoPartidasDoDiaPage />,
  },
  {
    path: '/ExpoGoiabal/Truco/AoVivo',
    element: <TrucoPartidasDoDiaPage />,
  },
  {
    path: '/ExpoGoiabal/truco/aovivo',
    element: <TrucoPartidasDoDiaPage />,
  },
  {
    path: '/truco/regulamento',
    element: <Navigate to="/ExpoGoiabal/Truco/Regulamento" replace />,
  },
  {
    path: '/truco/regulamento/imprimir',
    element: <Navigate to="/ExpoGoiabal/Truco/Regulamento/Imprimir" replace />,
  },
  {
    path: '/truco',
    element: <Navigate to="/ExpoGoiabal/Truco" replace />,
  },
  {
    path: '/Truco',
    element: <Navigate to="/ExpoGoiabal/Truco" replace />,
  },
  {
    path: '/expogoiabal/truco',
    element: <Navigate to="/ExpoGoiabal/Truco" replace />,
  },
  {
    path: '/expogoiabal/Truco',
    element: <Navigate to="/ExpoGoiabal/Truco" replace />,
  },
  {
    path: '/ExpoGoiabal/fotos',
    element: <FotosPage />,
  },
  {
    path: '/ExpoGoiabal/show',
    element: <ShowSelectorPage />,
  },
  {
    path: '/ExpoGoiabal/show/:singerSlug',
    element: <ShowPage />,
  },
  {
    path: '/ExpoGoiabal/Programacao',
    element: <Navigate to="/ExpoGoiabal/Inicio" replace />,
  },
  {
    path: '/ExpoGoiabal/Camarote',
    element: <Navigate to="/ExpoGoiabal/Inicio" replace />,
  },
  {
    path: '/ExpoGoiabal/pote-premiado',
    element: <Navigate to="/ExpoGoiabal/Inicio" replace />,
  },
  {
    path: '/ExpoGoiabal/Embaixadora',
    element: <EmbaixadoraPage />,
  },
  {
    path: '/ExpoGoiabal/Marcha',
    element: <Navigate to="/ExpoGoiabal/Inicio" replace />,
  },
  {
    path: '/ExpoGoiabal/Inscricao',
    element: <Navigate to="/ExpoGoiabal/Inicio" replace />,
  },
  {
    path: '/ExpoGoiabal/Embaixadora/inscricao',
    element: <Navigate to="/ExpoGoiabal/Inicio" replace />,
  },
  {
    path: '/ExpoGoiabal/Mirim/inscricao',
    element: <Navigate to="/ExpoGoiabal/Inicio" replace />,
  },
  {
    path: '/ExpoGoiabal/3tambores',
    element: <Navigate to="/ExpoGoiabal/Inicio" replace />,
  },
  {
    path: '/ExpoGoiabal/3tambores/inscricao',
    element: <Navigate to="/ExpoGoiabal/Inicio" replace />,
  },
  {
    path: '/Admin',
    element: <AdminPage />,
  },
  {
    path: '/ExpoGoiabal/Patrocinador',
    element: <PatrocinadorPage />,
  },
  {
    path: '/ExpoGoiabal',
    element: <Navigate to="/ExpoGoiabal/Inicio" replace />,
  },
  // Rota de fallback para 404 redirecionando para a home
  {
    path: '*',
    element: <Navigate to="/ExpoGoiabal/Inicio" replace />,
  }
]);

router.subscribe((state) => {
  trackPageView(state.location.pathname + state.location.search);
});
