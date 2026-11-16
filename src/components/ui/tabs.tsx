'use client';

import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export const Tabs: React.FC<{
  defaultValue: string;
  value?: string;
  onValueChange?: (val: string) => void;
  children: React.ReactNode;
  className?: string;
}> = ({ defaultValue, value, onValueChange, children, className }) => {
  const [internalTab, setInternalTab] = useState(defaultValue);
  const activeTab = value !== undefined ? value : internalTab;

  const setActiveTab = (tab: string) => {
    if (value === undefined) {
      setInternalTab(tab);
    }
    onValueChange?.(tab);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabList: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'flex items-center gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar',
        className
      )}
    >
      {children}
    </div>
  );
};

export const TabTrigger: React.FC<{
  value: string;
  children: React.ReactNode;
  className?: string;
  count?: number;
}> = ({ value, children, className, count }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabTrigger must be used within Tabs');

  const isActive = context.activeTab === value;

  return (
    <button
      type="button"
      onClick={() => context.setActiveTab(value)}
      className={cn(
        'flex items-center gap-2 py-3 px-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap',
        isActive
          ? 'border-[#2563EB] text-[#2563EB]'
          : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300',
        className
      )}
    >
      {children}
      {count !== undefined && (
        <span
          className={cn(
            'px-1.5 py-0.5 rounded-full text-xs font-semibold',
            isActive ? 'bg-blue-100 text-[#2563EB]' : 'bg-slate-100 text-slate-600'
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
};

export const TabContent: React.FC<{
  value: string;
  children: React.ReactNode;
  className?: string;
}> = ({ value, children, className }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabContent must be used within Tabs');

  if (context.activeTab !== value) return null;

  return <div className={cn('pt-4 animate-in fade-in-50 duration-200', className)}>{children}</div>;
};

