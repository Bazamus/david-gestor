import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Save, X, ArrowLeft } from 'lucide-react';
import Button from '../common/Button';

interface FormSection {
  id: string;
  title: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  required?: boolean;
  completed?: boolean;
}

interface MobileFormWrapperProps {
  title: string;
  subtitle?: string;
  sections: FormSection[];
  onSubmit: () => void;
  onCancel?: () => void;
  onBack?: () => void;
  loading?: boolean;
  submitText?: string;
  cancelText?: string;
  backText?: string;
  showProgress?: boolean;
  variant?: 'default' | 'compact' | 'fullscreen';
}

const MobileFormWrapper: React.FC<MobileFormWrapperProps> = ({
  title,
  subtitle,
  sections,
  onSubmit,
  onCancel,
  onBack,
  loading = false,
  submitText = 'Guardar',
  cancelText = 'Cancelar',
  backText = 'Volver',
  showProgress = true,
  variant = 'default'
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set([sections[0]?.id])
  );

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const expandAllSections = () => {
    setExpandedSections(new Set(sections.map(section => section.id)));
  };

  const collapseAllSections = () => {
    setExpandedSections(new Set());
  };

  const handleSubmit = () => {
    // Validar que todas las secciones requeridas estén completadas
    const requiredSections = sections.filter(section => section.required);
    const completedRequired = requiredSections.every(section => section.completed);
    
    if (!completedRequired) {
      // Expandir secciones requeridas no completadas
      const incompleteRequired = requiredSections
        .filter(section => !section.completed)
        .map(section => section.id);
      
      setExpandedSections(prev => new Set([...prev, ...incompleteRequired]));
      return;
    }

    onSubmit();
  };

  const getProgressPercentage = () => {
    if (sections.length === 0) return 0;
    const completedSections = sections.filter(section => section.completed).length;
    return Math.round((completedSections / sections.length) * 100);
  };

  const progressPercentage = getProgressPercentage();

  const baseClasses = `
    bg-white dark:bg-gray-900
    ${variant === 'fullscreen' ? 'min-h-screen' : 'rounded-lg border border-gray-200 dark:border-gray-700'}
  `;

  return (
    <div className={baseClasses}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={backText}
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={cancelText}
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {showProgress && sections.length > 1 && (
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Progreso
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Form Content */}
      <div className="p-4 space-y-4">
        {/* Section Controls */}
        {sections.length > 1 && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={expandAllSections}
              className="flex-1"
            >
              Expandir Todo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={collapseAllSections}
              className="flex-1"
            >
              Colapsar Todo
            </Button>
          </div>
        )}

        {/* Form Sections */}
        <div className="space-y-3">
          {sections.map((section) => (
            <div
              key={section.id}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {section.icon && (
                    <div className="w-6 h-6 text-gray-500 dark:text-gray-400">
                      {section.icon}
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {section.title}
                    </h3>
                    {section.required && (
                      <span className="text-xs text-red-500 dark:text-red-400">
                        Requerido
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {section.completed && (
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                  {expandedSections.has(section.id) ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </button>
              
              {expandedSections.has(section.id) && (
                <div className="px-4 pb-4">
                  <div className="pt-2">
                    {section.content}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex space-x-3">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={loading}
            >
              {cancelText}
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
            icon={<Save className="w-4 h-4" />}
            className="flex-1"
          >
            {submitText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileFormWrapper;
