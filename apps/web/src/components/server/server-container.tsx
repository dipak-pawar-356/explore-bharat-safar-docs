import * as React from 'react';

export interface ServerContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export function ServerContainer({
  children,
  className = '',
  as: Component = 'section',
}: ServerContainerProps) {
  return (
    <Component className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </Component>
  );
}
