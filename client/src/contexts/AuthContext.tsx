import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  verifyToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

<<<<<<< HEAD
=======
  // Función interna para verificar token sin dependencias
  const verifyTokenInternal = async (tokenToVerify: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenToVerify}`,
        },
      });

      const data = await response.json();

      if (data.valid) {
        setUser(data.user);
        setToken(tokenToVerify);
        localStorage.setItem('user', JSON.stringify(data.user));
        return true;
      } else {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
        return false;
      }
    } catch (error) {
      console.error('Error verificando token:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
      return false;
    }
  };

>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
  // Verificar token al cargar la aplicación
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
<<<<<<< HEAD
      if (storedToken) {
        const isValid = await verifyToken();
        if (!isValid) {
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
        }
=======
      const storedUser = localStorage.getItem('user');
      
      if (storedToken) {
        // Primero cargar usuario desde localStorage como fallback
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setToken(storedToken);
          } catch (error) {
            console.error('Error parsing stored user:', error);
          }
        }
        
        // Luego verificar token con el servidor
        const isValid = await verifyTokenInternal(storedToken);
        if (!isValid) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      } else {
        // Si no hay token, limpiar usuario también
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

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

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Llamar al endpoint de logout (opcional)
    fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }).catch(console.error);
  };

  const verifyToken = async (): Promise<boolean> => {
<<<<<<< HEAD
    try {
      const storedToken = localStorage.getItem('authToken');
      if (!storedToken) return false;

      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${storedToken}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setToken(storedToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        return true;
      } else {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
        return false;
      }
    } catch (error) {
      console.error('Error verificando token:', error);
      localStorage.removeItem('authToken');
      setUser(null);
      setToken(null);
      return false;
    }
=======
    const storedToken = localStorage.getItem('authToken');
    if (!storedToken) return false;
    
    return await verifyTokenInternal(storedToken);
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    logout,
    verifyToken,
  };

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
