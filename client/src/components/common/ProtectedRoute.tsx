import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'cliente';
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallbackPath = '/login'
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Si no hay usuario autenticado, redirigir al login
  if (!user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Si se requiere un rol específico y el usuario no lo tiene
  if (requiredRole && user.role !== requiredRole) {
    // Para usuarios cliente, redirigir a reportes
    if (user.role === 'cliente') {
      return <Navigate to="/reportes" replace />;
    }
    // Para otros casos, redirigir al dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // Si todo está bien, mostrar el contenido
  return <>{children}</>;
};

// Componente específico para rutas de administrador
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute requiredRole="admin" fallbackPath="/login">
      {children}
    </ProtectedRoute>
  );
};

// Componente específico para rutas de cliente
export const ClienteRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute requiredRole="cliente" fallbackPath="/login">
      {children}
    </ProtectedRoute>
  );
};

// Componente para rutas que requieren autenticación pero cualquier rol
export const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute fallbackPath="/login">
      {children}
    </ProtectedRoute>
  );
};
