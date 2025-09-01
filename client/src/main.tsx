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

// Importar PWA Provider
import { PWAProvider } from './pwa';

// Importar AutoRefresh Provider
import { AutoRefreshProvider } from './contexts/AutoRefreshContext';

// Configurar moment para español globalmente
moment.locale('es');

// Configuración mejorada del cliente de React Query para actualizaciones automáticas
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1 * 60 * 1000, // 1 minuto (reducido para mejor refresco)
      gcTime: 5 * 60 * 1000, // 5 minutos (reducido para liberar memoria más rápido)
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
      refetchOnWindowFocus: true, // Habilitado para refrescar al volver a la ventana
      refetchOnMount: true, // Habilitado para refrescar al montar componentes
      refetchOnReconnect: true,
      refetchInterval: false, // Deshabilitado por defecto, se configura por query
    },
    mutations: {
      retry: false,
      // Configuración para invalidaciones más agresivas
      onSuccess: () => {
        // Invalidar automáticamente todas las queries relacionadas después de mutaciones exitosas
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['time-entries'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PWAProvider>
      <QueryClientProvider client={queryClient}>
        <AutoRefreshProvider defaultAutoRefreshInterval={5 * 60 * 1000}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AutoRefreshProvider>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </PWAProvider>
  </React.StrictMode>
);