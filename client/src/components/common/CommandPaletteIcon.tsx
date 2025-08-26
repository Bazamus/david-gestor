import React from 'react';
import { 
  FolderIcon, 
  CheckSquareIcon, 
  PlusIcon, 
  HomeIcon, 
  LayoutIcon,
  SettingsIcon
} from 'lucide-react';

interface CommandPaletteIconProps {
  iconType: 'folder' | 'task' | 'plus' | 'home' | 'kanban' | 'settings';
  iconColor?: string;
  className?: string;
}

const CommandPaletteIcon: React.FC<CommandPaletteIconProps> = ({ 
  iconType, 
  iconColor, 
  className = "w-4 h-4" 
}) => {
  const style = iconColor ? { color: iconColor } : undefined;

  switch (iconType) {
    case 'folder':
      return <FolderIcon className={className} style={style} />;
    case 'task':
      return <CheckSquareIcon className={className} style={style} />;
    case 'plus':
      return <PlusIcon className={className} style={style} />;
    case 'home':
      return <HomeIcon className={className} style={style} />;
    case 'kanban':
      return <LayoutIcon className={className} style={style} />;
    case 'settings':
      return <SettingsIcon className={className} style={style} />;
    default:
      return <FolderIcon className={className} style={style} />;
  }
};

export default CommandPaletteIcon;