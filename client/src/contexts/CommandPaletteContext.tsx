import React, { createContext, useContext } from 'react';
import { useCommandPalette } from '@/hooks/useCommandPalette';

interface CommandPaletteContextType {
  isOpen: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredItems: ReturnType<typeof useCommandPalette>['filteredItems'];
  groupedItems: ReturnType<typeof useCommandPalette>['groupedItems'];
  openPalette: () => void;
  closePalette: () => void;
  togglePalette: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextType | undefined>(undefined);

export const CommandPaletteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const commandPalette = useCommandPalette();

  return (
    <CommandPaletteContext.Provider value={commandPalette}>
      {children}
    </CommandPaletteContext.Provider>
  );
};

export const useCommandPaletteContext = () => {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error('useCommandPaletteContext must be used within a CommandPaletteProvider');
  }
  return context;
};