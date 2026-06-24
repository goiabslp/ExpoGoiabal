import { createBrowserRouter, Navigate } from 'react-router-dom';
import { trackPageView } from '../lib/analytics';
import { ExpoGoiabalPage } from '../pages/ExpoGoiabal/ExpoGoiabalPage';
import { EmbaixadoraPage } from '../pages/ExpoGoiabal/EmbaixadoraPage';
import { AdminPage } from '../pages/Admin/AdminPage';
import { PatrocinadorPage } from '../pages/ExpoGoiabal/PatrocinadorPage';
import { FotosPage } from '../pages/ExpoGoiabal/FotosPage';
import { ShowPage } from '../pages/ExpoGoiabal/ShowPage';
import { ApoiarPage } from '../pages/ExpoGoiabal/ApoiarPage'; // Novo formulário de doação no celular

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/ExpoGoiabal/Inicio" replace />,
  },
  {
    path: '/ExpoGoiabal/Inicio',
    element: <ExpoGoiabalPage />,
  },
  {
    path: '/ExpoGoiabal/fotos',
    element: <FotosPage />,
  },
  {
    path: '/ExpoGoiabal/show',
    element: <ShowPage />,
  },
  {
    path: '/ExpoGoiabal/apoiar',
    element: <ApoiarPage />,
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
