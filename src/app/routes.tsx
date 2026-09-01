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
import { TrucoCadastroPage } from '../pages/ExpoGoiabal/Truco/TrucoCadastroPage';
import { TrucoSorteioRodadasPage } from '../pages/ExpoGoiabal/Truco/TrucoSorteioRodadasPage';
import { TrucoPartidasPage } from '../pages/ExpoGoiabal/Truco/TrucoPartidasPage';
import { TrucoTabelaPage } from '../pages/ExpoGoiabal/Truco/TrucoTabelaPage';
import { TrucoMataMataPage } from '../pages/ExpoGoiabal/Truco/TrucoMataMataPage';
import { AdminTrucoPartidasPage } from '../pages/Admin/AdminTrucoPartidasPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/ExpoGoiabal/Inicio" replace />,
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
    element: <TrucoCadastroPage />,
  },
  {
    path: '/ExpoGoiabal/truco/cadastrar',
    element: <TrucoCadastroPage />,
  },
  {
    path: '/ExpoGoiabal/Truco/Sorteio',
    element: <TrucoSorteioRodadasPage />,
  },
  {
    path: '/ExpoGoiabal/truco/sorteio',
    element: <TrucoSorteioRodadasPage />,
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
    path: '/ExpoGoiabal/truco/tabela',
    element: <TrucoTabelaPage />,
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
