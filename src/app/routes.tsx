import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ExpoGoiabalPage } from '../pages/ExpoGoiabal/ExpoGoiabalPage';
import { ProgramacaoPage } from '../pages/ExpoGoiabal/ProgramacaoPage';
import { CamarotePage } from '../pages/ExpoGoiabal/CamarotePage';
import { EmbaixadoraPage } from '../pages/ExpoGoiabal/EmbaixadoraPage';
import { MarchaPage } from '../pages/ExpoGoiabal/MarchaPage';
import { InscricaoPage } from '../pages/ExpoGoiabal/InscricaoPage';
import { EmbaixadoraInscricaoPage } from '../pages/ExpoGoiabal/EmbaixadoraInscricaoPage';
import { TresTamboresPage } from '../pages/ExpoGoiabal/TresTamboresPage';
import { AdminPage } from '../pages/Admin/AdminPage';

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
    path: '/ExpoGoiabal/Programacao',
    element: <ProgramacaoPage />,
  },
  {
    path: '/ExpoGoiabal/Camarote',
    element: <CamarotePage />,
  },
  {
    path: '/ExpoGoiabal/Embaixadora',
    element: <EmbaixadoraPage />,
  },
  {
    path: '/ExpoGoiabal/Marcha',
    element: <MarchaPage />,
  },
  {
    path: '/ExpoGoiabal/Inscricao',
    element: <InscricaoPage />,
  },
  {
    path: '/ExpoGoiabal/Embaixadora/inscricao',
    element: <EmbaixadoraInscricaoPage />,
  },
  {
    path: '/ExpoGoiabal/3tambores',
    element: <TresTamboresPage />,
  },
  {
    path: '/Admin',
    element: <AdminPage />,
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
