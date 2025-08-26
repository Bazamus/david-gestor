import React from 'react';
import { Folder, CheckSquare, BarChart3 } from 'lucide-react';

interface TimelineTabsProps {
  activeView: 'projects' | 'tasks' | 'kpis';
  onViewChange: (view: 'projects' | 'tasks' | 'kpis') => void;
}

const TimelineTabs: React.FC<TimelineTabsProps> = ({ activeView, onViewChange }) => {
  const tabs = [
    {
      key: 'projects',
      label: 'Proyectos',
      icon: Folder,
      color: 'blue'
    },
    {
      key: 'tasks',
      label: 'Tareas',
      icon: CheckSquare,
      color: 'green'
    },
    {
      key: 'kpis',
      label: 'KPIs',
      icon: BarChart3,
      color: 'purple'
    }
  ];

  return (
    <div className="p-3">
      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeView === tab.key;
          
          return (
            <button
              key={tab.key}
              onClick={() => onViewChange(tab.key as 'projects' | 'tasks' | 'kpis')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                isActive
                  ? `bg-${tab.color}-500 text-white shadow-sm`
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-600/50'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineTabs; 