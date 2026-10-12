import React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  fog?: boolean;
}

export function Card({ children, className, fog, ...props }: CardProps) {
  return (
    <div 
      className={clsx(
        "technical-card p-6",
        fog && "glass-fog",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
