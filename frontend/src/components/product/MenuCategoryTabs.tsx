import React from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type CategoryType = 'All' | 'Snack' | 'Ice';

interface MenuCategoryTabsProps {
  activeCategory: CategoryType;
  onCategoryChange: (category: CategoryType) => void;
  className?: string;
}

export const MenuCategoryTabs: React.FC<MenuCategoryTabsProps> = ({
  activeCategory,
  onCategoryChange,
  className,
}) => {
  const { t } = useTranslation();

  const tabs: { id: CategoryType; label: string }[] = [
    { 
        id: 'All',  
        label: t('customer.categories.all'),  
    },
    { 
        id: 'Snack', 
        label: t('customer.categories.snack'),
    },
    { 
        id: 'Ice', 
        label: t('customer.categories.ice'),
    },
  ];

  return (
    <Tabs 
      value={activeCategory} 
      onValueChange={(value : string) => onCategoryChange(value as CategoryType)}
      className={cn("w-full", className)}
    >
      <TabsList 
        className="inline-flex h-auto w-fit max-w-full gap-2.5 overflow-x-auto rounded-[30px] bg-white p-2 shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="whitespace-nowrap rounded-full px-6 py-2.5 text-base font-semibold transition-all duration-200 outline-none hover:-translate-y-1 hover:shadow-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_4px_12px_rgba(255,192,203,0.8)] data-[state=active]:hover:shadow-[0_6px_16px_rgba(255,192,203,0.9)] data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-slate-50"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};