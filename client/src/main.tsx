import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/es';

// Importar estilos
import './index.css';
import './styles/responsive.scss';

// Importar componente principal
import App from './App';

// Configurar moment para español globalmente
moment.locale('es');

// Configuración del cliente de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutos
      gcTime: 15 * 60 * 1000, // 15 minutos
      retry: (failureCount, error) => {
        // No reintentar errores 4xx
        if (error instanceof Error) {
          const status = (error as any)?.response?.status;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Cambiado a false para evitar refetch automático
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </React.StrictMode>
);