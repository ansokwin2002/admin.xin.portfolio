import { RouterProvider } from 'react-router';
import router from './routes/Router';
import './css/globals.css';
import { ThemeProvider } from './components/provider/theme-provider';
import { Toaster } from 'sonner';

function App() {
  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <Toaster position="top-center" richColors />
          <RouterProvider router={router} />
      </ThemeProvider>
    </>
  );
}

export default App;
