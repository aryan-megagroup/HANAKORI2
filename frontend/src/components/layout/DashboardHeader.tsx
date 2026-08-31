import React from 'react';
import { Search, Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  searchQuery?: string;
  searchPlaceholder?: string;
  showSearch?: boolean;
  onSearchChange?: (value: string) => void;
  onToggleSidebar?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  searchQuery = '',
  searchPlaceholder,
  showSearch = true,
  onSearchChange,
  onToggleSidebar,
}) => {
  const { t } = useTranslation();

  const resolvedSearchPlaceholder =
    searchPlaceholder ?? t('common.search_placeholder');

  return (
    <header className="flex w-full items-start justify-between bg-background px-6 py-6 md:px-8">
      {/* Left side */}
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="
            h-9
            w-9
            shrink-0
            text-foreground
            hover:bg-muted
          "
          onClick={onToggleSidebar}
          aria-label={t('common.toggle_menu')}
        >
          <Menu className="h-6 w-6" />
        </Button>

        <div>
          {title && (
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
          )}

          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right side */}
      {showSearch && (
        <div className="relative w-48 sm:w-64 lg:w-72">
          <Search
            className="
              absolute
              left-3
              top-1/2
              h-4
              w-4
              -translate-y-1/2
              text-muted-foreground
            "
          />

          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={resolvedSearchPlaceholder}
            className="
              rounded-full
              border-transparent
              bg-card
              pl-9
              text-sm
              text-foreground
              shadow-sm
              focus-visible:ring-primary
            "
          />
        </div>
      )}
    </header>
  );
};

export default DashboardHeader;
