import { RouterProvider } from 'react-router-dom';
import { router } from './app/routes';
import { GlobalModal } from './components/Modal';

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <GlobalModal />
    </>
  );
}

export default App;
