// ======================================
// GRÁFICO DE BARRAS PARA REPORTES
// ======================================

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import ChartContainer from './ChartContainer';

interface DatosBarra {
  nombre: string;
  valor: number;
  valorSecundario?: number;
  color?: string;
}

interface GraficoBarrasProps {
  datos: DatosBarra[];
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
}

const GraficoBarras: React.FC<GraficoBarrasProps> = ({
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
  mostrarLeyenda = true
}) => {
  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
              {entry.name === labelValor && entry.value > 1 ? 'h' : ''}
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
      <BarChart
        data={datos}
        margin={{
          top: 20,
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
          dataKey="nombre"
          className="text-xs fill-gray-600 dark:fill-gray-400"
          axisLine={false}
          tickLine={false}
        />
        
        <YAxis 
          className="text-xs fill-gray-600 dark:fill-gray-400"
          axisLine={false}
          tickLine={false}
        />
        
        <Tooltip content={<CustomTooltip />} />
        
        {mostrarLeyenda && <Legend />}
        
        <Bar 
          dataKey="valor" 
          name={labelValor}
          fill={colorPrimario}
          radius={[4, 4, 0, 0]}
        />
        
        {labelValorSecundario && (
          <Bar 
            dataKey="valorSecundario" 
            name={labelValorSecundario}
            fill={colorSecundario}
            radius={[4, 4, 0, 0]}
          />
        )}
      </BarChart>
    </ChartContainer>
  );
};

export default GraficoBarras;
