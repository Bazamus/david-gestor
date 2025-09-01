// ======================================
// GRÁFICO CIRCULAR (PIE) PARA REPORTES
// ======================================

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import ChartContainer from './ChartContainer';

interface DatosPie {
  nombre: string;
  valor: number;
  color?: string;
}

interface GraficoPieProps {
  data: DatosPie[];
  dataKey?: string;
  nameKey?: string;
  colorKey?: string;
  titulo?: string;
  subtitulo?: string;
  isLoading?: boolean;
  error?: string | null;
  height?: number;
  colores?: string[];
  mostrarLeyenda?: boolean;
  mostrarEtiquetas?: boolean;
  radioInterior?: number;
  formatoTooltip?: (value: any, name: string) => string;
}

const GraficoPie: React.FC<GraficoPieProps> = ({
  data,
  dataKey = 'valor',
  nameKey = 'nombre',
  colorKey = 'color',
  titulo,
  subtitulo,
  isLoading = false,
  error = null,
  height = 300,
  colores = ['#2563EB', '#059669', '#EA580C', '#EF4444', '#8B5CF6', '#F59E0B'],
  mostrarLeyenda = true,
  mostrarEtiquetas = true,
  radioInterior = 0
}) => {
  // Validar que data existe y no es undefined
  if (!data || !Array.isArray(data)) {
    return (
      <ChartContainer
        title={titulo}
        subtitle={subtitulo}
        height={height}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-gray-400 text-lg font-medium mb-2">
              Sin datos para mostrar
            </div>
            <p className="text-gray-500 text-sm">
              No hay información disponible
            </p>
          </div>
        </div>
      </ChartContainer>
    );
  }

  // Calcular porcentajes
  const total = data.reduce((sum, item) => sum + (item[dataKey as keyof typeof item] as number), 0);
  const datosConPorcentaje = data.map((item, index) => ({
    ...item,
    valor: item[dataKey as keyof typeof item] as number,
    nombre: item[nameKey as keyof typeof item] as string,
    porcentaje: total > 0 ? Math.round(((item[dataKey as keyof typeof item] as number) / total) * 100) : 0,
    color: item[colorKey as keyof typeof item] as string || colores[index % colores.length]
  }));

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white mb-1">
            {data.nombre}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Valor: {data.valor}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Porcentaje: {data.porcentaje}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Etiquetas personalizadas
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    porcentaje
  }: any) => {
    if (porcentaje < 5) return null; // No mostrar etiquetas muy pequeñas

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${porcentaje}%`}
      </text>
    );
  };

  // Leyenda personalizada
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <ChartContainer
        title={titulo}
        subtitle={subtitulo}
        height={height}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-gray-400 text-lg font-medium mb-2">
              Sin datos para mostrar
            </div>
            <p className="text-gray-500 text-sm">
              No hay información disponible para el período seleccionado
            </p>
          </div>
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer
      title={titulo}
      subtitle={subtitulo}
      isLoading={isLoading}
      error={error}
      height={height}
    >
      <PieChart>
        <Pie
          data={datosConPorcentaje}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={mostrarEtiquetas ? renderCustomizedLabel : false}
          outerRadius={Math.min(height * 0.35, 120)}
          innerRadius={radioInterior}
          fill="#8884d8"
          dataKey="valor"
        >
          {datosConPorcentaje.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        
        <Tooltip content={<CustomTooltip />} />
        
        {mostrarLeyenda && <Legend content={<CustomLegend />} />}
      </PieChart>
    </ChartContainer>
  );
};

export default GraficoPie;
