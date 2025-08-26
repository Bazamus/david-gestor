// ======================================
// COMPONENTE DE NOTIFICACIÓN PARA GENERACIÓN DE PDF
// Feedback visual profesional para Aclimar
// ======================================

import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DownloadIcon,
  AlertTriangleIcon
} from 'lucide-react';

// ======================================
// TIPOS E INTERFACES
// ======================================

export type TipoNotificacion = 'success' | 'error' | 'loading' | 'warning';

interface NotificacionPDFProps {
  tipo: TipoNotificacion;
  mensaje: string;
  submensaje?: string;
  visible: boolean;
  onClose?: () => void;
  autoClose?: boolean;
  duracion?: number; // en milisegundos
}

// ======================================
// CONFIGURACIÓN DE ESTILOS
// ======================================

const estilosNotificacion = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: CheckCircleIcon,
    iconColor: 'text-green-600',
    textColor: 'text-green-800',
    subTextColor: 'text-green-700'
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: XCircleIcon,
    iconColor: 'text-red-600',
    textColor: 'text-red-800',
    subTextColor: 'text-red-700'
  },
  loading: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: ClockIcon,
    iconColor: 'text-blue-600',
    textColor: 'text-blue-800',
    subTextColor: 'text-blue-700'
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: AlertTriangleIcon,
    iconColor: 'text-yellow-600',
    textColor: 'text-yellow-800',
    subTextColor: 'text-yellow-700'
  }
};

// ======================================
// COMPONENTE PRINCIPAL
// ======================================

const NotificacionPDF: React.FC<NotificacionPDFProps> = ({
  tipo,
  mensaje,
  submensaje,
  visible,
  onClose,
  autoClose = true,
  duracion = 5000
}) => {
  const [mostrar, setMostrar] = useState(visible);

  // Efecto para auto-cerrar la notificación
  useEffect(() => {
    if (visible && autoClose && tipo !== 'loading') {
      const timer = setTimeout(() => {
        setMostrar(false);
        if (onClose) {
          setTimeout(onClose, 300); // Esperar a que termine la animación
        }
      }, duracion);

      return () => clearTimeout(timer);
    }
  }, [visible, autoClose, tipo, duracion, onClose]);

  // Sincronizar estado interno con prop
  useEffect(() => {
    setMostrar(visible);
  }, [visible]);

  const estilo = estilosNotificacion[tipo];
  const IconComponent = estilo.icon;

  if (!mostrar) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
      mostrar ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`
        max-w-md w-full ${estilo.bg} ${estilo.border} border rounded-lg shadow-lg p-4
        animate-slide-in-right
      `}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <IconComponent className={`w-6 h-6 ${estilo.iconColor} ${
              tipo === 'loading' ? 'animate-spin' : ''
            }`} />
          </div>
          
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-medium ${estilo.textColor}`}>
              {mensaje}
            </h3>
            
            {submensaje && (
              <p className={`mt-1 text-sm ${estilo.subTextColor}`}>
                {submensaje}
              </p>
            )}
            
            {/* Barra de progreso para loading */}
            {tipo === 'loading' && (
              <div className="mt-3">
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Botón de cerrar */}
          {onClose && tipo !== 'loading' && (
            <button
              onClick={() => {
                setMostrar(false);
                setTimeout(onClose, 300);
              }}
              className={`ml-4 inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition ease-in-out duration-150`}
            >
              <XCircleIcon className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Indicador de descarga para success */}
        {tipo === 'success' && (
          <div className="mt-3 flex items-center text-sm text-green-700">
            <DownloadIcon className="w-4 h-4 mr-2" />
            <span>El archivo se ha descargado automáticamente</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ======================================
// HOOK PERSONALIZADO PARA NOTIFICACIONES
// ======================================

export const useNotificacionPDF = () => {
  const [notificacion, setNotificacion] = useState<{
    tipo: TipoNotificacion;
    mensaje: string;
    submensaje?: string;
    visible: boolean;
  }>({
    tipo: 'success',
    mensaje: '',
    visible: false
  });

  const mostrarNotificacion = (
    tipo: TipoNotificacion,
    mensaje: string,
    submensaje?: string
  ) => {
    setNotificacion({
      tipo,
      mensaje,
      submensaje,
      visible: true
    });
  };

  const ocultarNotificacion = () => {
    setNotificacion(prev => ({
      ...prev,
      visible: false
    }));
  };

  const mostrarExito = (mensaje: string, submensaje?: string) => {
    mostrarNotificacion('success', mensaje, submensaje);
  };

  const mostrarError = (mensaje: string, submensaje?: string) => {
    mostrarNotificacion('error', mensaje, submensaje);
  };

  const mostrarCargando = (mensaje: string, submensaje?: string) => {
    mostrarNotificacion('loading', mensaje, submensaje);
  };

  const mostrarAdvertencia = (mensaje: string, submensaje?: string) => {
    mostrarNotificacion('warning', mensaje, submensaje);
  };

  return {
    notificacion,
    mostrarExito,
    mostrarError,
    mostrarCargando,
    mostrarAdvertencia,
    ocultarNotificacion,
    NotificacionComponent: () => (
      <NotificacionPDF
        tipo={notificacion.tipo}
        mensaje={notificacion.mensaje}
        submensaje={notificacion.submensaje}
        visible={notificacion.visible}
        onClose={ocultarNotificacion}
      />
    )
  };
};

export default NotificacionPDF;
