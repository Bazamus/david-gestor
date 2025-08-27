import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AuthService } from '../services/authService';

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'cliente';
  description: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string; }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    const tokenToInvalidate = localStorage.getItem('authToken');
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');

    if (tokenToInvalidate) {
      AuthService.logout(tokenToInvalidate).catch(error => {
        console.error('Error al notificar al servidor sobre el logout:', error);
      });
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        try {
          console.log('Token encontrado. Verificando sesión...');
          const response = await AuthService.getCurrentUser(storedToken);
          if (response.success && response.user) {
            console.log('Verificación exitosa. Usuario autenticado.');
            setUser(response.user);
            setToken(storedToken);
          } else {
            console.warn('Token inválido. Limpiando sesión.');
            logout();
          }
        } catch (error) {
          console.error('Fallo en la verificación del token. Limpiando sesión.', error);
          logout();
        }
      } else {
        console.log('No se encontró token. Sesión no iniciada.');
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [logout]);

  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Error de autenticación' };
      }
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, message: 'Error de conexión' };
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    logout,
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
