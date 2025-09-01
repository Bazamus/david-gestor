import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import NotificationContainer from '../common/NotificationContainer';
import CommandPalette from '../common/CommandPalette';
import { MobileNavigation, MobileHeader } from '../mobile';

const MainLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Solo visible en desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Solo visible en desktop */}
        <div className="hidden lg:block">
          <Header />
        </div>
        
        {/* Mobile Header - Solo visible en móvil */}
        <MobileHeader onMenuToggle={handleMobileMenuToggle} />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container-responsive pt-6 pb-6">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Mobile Navigation - Solo visible en móvil */}
      <MobileNavigation 
        isOpen={isMobileMenuOpen} 
        onClose={handleMobileMenuClose} 
      />
      
      {/* Notifications */}
      <NotificationContainer />
      
      {/* Command Palette */}
      <CommandPalette />
    </div>
  );
};

export default MainLayout;