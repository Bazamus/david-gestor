import React from 'react';
import { LoaderIcon } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'btn focus-ring';
  
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    destructive: 'btn-destructive',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
  };
  
  const sizeClasses = {
    sm: 'btn-sm',
    md: 'h-10 px-4',
    lg: 'btn-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  
  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${widthClass}
    ${className}
  `.trim();

  const isDisabled = disabled || loading;

  const renderIcon = (position: 'left' | 'right') => {
    if (loading && position === 'left') {
      return <LoaderIcon className="w-4 h-4 animate-spin" />;
    }
    
    if (icon && iconPosition === position) {
      return icon;
    }
    
    return null;
  };

  return (
    <button
      className={classes}
      disabled={isDisabled}
      {...props}
    >
      {renderIcon('left')}
      
      {children && (
        <span className={icon || loading ? 'mx-2' : ''}>
          {children}
        </span>
      )}
      
      {renderIcon('right')}
    </button>
  );
};

// Componentes de botón específicos para casos comunes
export const PrimaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="primary" {...props} />
);

export const SecondaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="secondary" {...props} />
);

export const DestructiveButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="destructive" {...props} />
);

export const OutlineButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="outline" {...props} />
);

export const GhostButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="ghost" {...props} />
);

// Componente para agrupar botones
export const ButtonGroup: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`flex space-x-2 ${className}`}>
    {React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) return child;
      
      const isLast = index === React.Children.count(children) - 1;
      
      return React.cloneElement(child as React.ReactElement<any>, {
        className: `${child.props.className || ''} ${!isLast ? 'rounded-r-none' : ''} ${index > 0 ? 'rounded-l-none' : ''}`,
      });
    })}
  </div>
);

export default Button;