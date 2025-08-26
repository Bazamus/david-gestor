import React from 'react';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  Target,
  BarChart3,
  Zap
} from 'lucide-react';
import { TimelineKPIsData } from '../../types/timeline';

interface TimelineKPIsProps {
  kpis: TimelineKPIsData;
}

const TimelineKPIs: React.FC<TimelineKPIsProps> = ({ kpis }) => {
  const kpiCards = [
    {
      title: 'Proyectos Activos',
      value: kpis.activeProjects,
      total: kpis.totalProjects,
      icon: Target,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
      textColor: 'text-blue-700 dark:text-blue-300',
      borderColor: 'border-blue-200 dark:border-blue-700'
    },
    {
      title: 'Tareas Completadas',
      value: kpis.completedTasks,
      total: kpis.totalTasks,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
      textColor: 'text-green-700 dark:text-green-300',
      borderColor: 'border-green-200 dark:border-green-700'
    },
    {
      title: 'Tareas Pendientes',
      value: kpis.pendingTasks,
      total: kpis.totalTasks,
      icon: Clock,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20',
      textColor: 'text-yellow-700 dark:text-yellow-300',
      borderColor: 'border-yellow-200 dark:border-yellow-700'
    },
    {
      title: 'Tareas Vencidas',
      value: kpis.overdueTasks,
      total: kpis.totalTasks,
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
      textColor: 'text-red-700 dark:text-red-300',
      borderColor: 'border-red-200 dark:border-red-700'
    },
    {
      title: 'Progreso Promedio',
      value: kpis.averageProgress,
      suffix: '%',
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
      textColor: 'text-purple-700 dark:text-purple-300',
      borderColor: 'border-purple-200 dark:border-purple-700'
    },
    {
      title: 'Vencimientos Próximos',
      value: kpis.upcomingDeadlines,
      icon: Calendar,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
      textColor: 'text-orange-700 dark:text-orange-300',
      borderColor: 'border-orange-200 dark:border-orange-700'
    }
  ];

  return (
    <div className="space-y-8">
      {/* KPIs principales en grid grande */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiCards.map((card, index) => {
          const IconComponent = card.icon;
          const percentage = card.total ? Math.round((card.value / card.total) * 100) : 0;
          
          return (
            <div
              key={index}
              className={`p-6 rounded-2xl border-2 ${card.bgColor} ${card.borderColor} transition-all duration-300 hover:scale-105 hover:shadow-2xl group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                    {card.title}
                  </p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {card.value}
                      {card.suffix}
                    </span>
                    {card.total && (
                      <span className="text-lg text-gray-500 dark:text-gray-400">
                        / {card.total}
                      </span>
                    )}
                  </div>
                </div>
                <div className={`p-4 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-8 h-8" />
                </div>
              </div>
              
              {card.total && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Progreso</span>
                    <span className="font-bold text-gray-900 dark:text-white">{percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full bg-gradient-to-r ${card.color} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Métricas adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de distribución */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Distribución de Estados
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Completadas</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">{kpis.completedTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Pendientes</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">{kpis.pendingTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Vencidas</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">{kpis.overdueTasks}</span>
            </div>
          </div>
        </div>

        {/* Resumen de productividad */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-500" />
            Resumen de Productividad
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700 dark:text-gray-300">Progreso Promedio</span>
              <span className="font-bold text-2xl text-purple-600 dark:text-purple-400">{kpis.averageProgress}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700 dark:text-gray-300">Vencimientos Próximos</span>
              <span className="font-bold text-2xl text-orange-600 dark:text-orange-400">{kpis.upcomingDeadlines}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700 dark:text-gray-300">Críticos</span>
              <span className="font-bold text-2xl text-red-600 dark:text-red-400">{kpis.criticalDeadlines}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineKPIs; 