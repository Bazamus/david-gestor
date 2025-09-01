// ======================================
// GRÁFICO DE LÍNEAS PARA REPORTES
// ======================================

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import ChartContainer from './ChartContainer';

interface DatosLinea {
  fecha: string;
  valor: number;
  valorSecundario?: number;
  label?: string;
}

interface GraficoLineasProps {
  datos: DatosLinea[];
  titulo?: string;
  subtitulo?: string;
  labelValor?: string;
  labelValorSecundario?: string;
  isLoading?: boolean;
  error?: string | null;
  height?: number;
  colorPrimario?: string;
  colorSecundario?: string;
  mostrarGrid?: boolean;
  mostrarLeyenda?: boolean;
  mostrarPuntos?: boolean;
  tipoLinea?: 'monotone' | 'linear' | 'step';
}

const GraficoLineas: React.FC<GraficoLineasProps> = ({
  datos,
  titulo,
  subtitulo,
  labelValor = 'Valor',
  labelValorSecundario,
  isLoading = false,
  error = null,
  height = 300,
  colorPrimario = '#2563EB',
  colorSecundario = '#059669',
  mostrarGrid = true,
  mostrarLeyenda = true,
  mostrarPuntos = true,
  tipoLinea = 'monotone'
}) => {
  // Formatear fecha para el eje X
  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const fecha = new Date(label);
      const fechaFormateada = fecha.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white mb-2 capitalize">
            {fechaFormateada}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
              {entry.name.toLowerCase().includes('hora') ? 'h' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ChartContainer
      title={titulo}
      subtitle={subtitulo}
      isLoading={isLoading}
      error={error}
      height={height}
    >
      <LineChart
        data={datos}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        {mostrarGrid && (
          <CartesianGrid 
            strokeDasharray="3 3" 
            className="stroke-gray-200 dark:stroke-gray-700"
          />
        )}
        
        <XAxis 
          dataKey="fecha"
          className="text-xs fill-gray-600 dark:fill-gray-400"
          axisLine={false}
          tickLine={false}
          tickFormatter={formatearFecha}
        />
        
        <YAxis 
          className="text-xs fill-gray-600 dark:fill-gray-400"
          axisLine={false}
          tickLine={false}
        />
        
        <Tooltip content={<CustomTooltip />} />
        
        {mostrarLeyenda && <Legend />}
        
        <Line 
          type={tipoLinea}
          dataKey="valor"
          name={labelValor}
          stroke={colorPrimario}
          strokeWidth={2}
          dot={mostrarPuntos ? { fill: colorPrimario, strokeWidth: 2, r: 4 } : false}
          activeDot={{ r: 6, fill: colorPrimario }}
        />
        
        {labelValorSecundario && (
          <Line 
            type={tipoLinea}
            dataKey="valorSecundario"
            name={labelValorSecundario}
            stroke={colorSecundario}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={mostrarPuntos ? { fill: colorSecundario, strokeWidth: 2, r: 4 } : false}
            activeDot={{ r: 6, fill: colorSecundario }}
          />
        )}
      </LineChart>
    </ChartContainer>
  );
};

export default GraficoLineas;
