import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

interface MobileTabsProps {
  tabs: Tab[];
  defaultActiveTab?: string;
  onTabChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  scrollable?: boolean;
  showArrows?: boolean;
}

const MobileTabs: React.FC<MobileTabsProps> = ({
  tabs,
  defaultActiveTab,
  onTabChange,
  variant = 'default',
  scrollable = true,
  showArrows = true,
}) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab || tabs[0]?.id || '');
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleTabChange = (tabId: string) => {
    if (tabs.find(tab => tab.id === tabId)?.disabled) return;
    
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('mobile-tabs-container');
    if (!container) return;

    const scrollAmount = 200;
    const newPosition = direction === 'left' 
      ? scrollPosition - scrollAmount 
      : scrollPosition + scrollAmount;

    container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });

    setScrollPosition(newPosition);
  };

  const variantClasses = {
    default: {
      tab: 'px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 border-b-2 border-transparent hover:text-gray-800 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600 transition-colors',
      active: 'text-primary border-primary',
      disabled: 'text-gray-400 dark:text-gray-600 cursor-not-allowed',
    },
    pills: {
      tab: 'px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors',
      active: 'text-white bg-primary hover:bg-primary/90',
      disabled: 'text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-800 cursor-not-allowed',
    },
    underline: {
      tab: 'px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 border-b-2 border-transparent hover:text-gray-800 dark:hover:text-gray-200 transition-colors',
      active: 'text-primary border-primary',
      disabled: 'text-gray-400 dark:text-gray-600 cursor-not-allowed',
    },
  };

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className="w-full">
      {/* Tabs Header */}
      <div className="relative">
        {scrollable && showArrows && (
          <>
            <button
              onClick={() => handleScroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        <div
          id="mobile-tabs-container"
          className={`flex ${scrollable ? 'overflow-x-auto scrollbar-hide' : 'flex-wrap'} gap-1 ${scrollable && showArrows ? 'px-8' : ''}`}
          onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            const isDisabled = tab.disabled;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                disabled={isDisabled}
                className={`
                  flex items-center gap-2 whitespace-nowrap transition-all duration-200
                  ${variantClasses[variant].tab}
                  ${isActive ? variantClasses[variant].active : ''}
                  ${isDisabled ? variantClasses[variant].disabled : ''}
                `}
              >
                {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTabContent}
      </div>
    </div>
  );
};

export default MobileTabs;
