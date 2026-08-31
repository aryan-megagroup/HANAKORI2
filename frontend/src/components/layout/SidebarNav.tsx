import { useState } from 'react';
import { Crown, Home, LogOut, IceCream, Tag, Receipt, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SidebarNavProps {
  variant?: 'customer' | 'manager';
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onHome?: () => void;
  onResetSession?: () => void;
  isMobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
  onManagerAccessClick?: () => void;
}

export function SidebarNav({
  variant = 'customer',
  activeTab,
  onTabChange,
  onHome,
  onResetSession,
  isMobileOpen = false,
  onMobileOpenChange,
  onManagerAccessClick,
}: SidebarNavProps) {
  const { t } = useTranslation();
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const isManager = variant === 'manager';

  const handleHome = () => {
    onHome?.();
    onMobileOpenChange?.(false);
  };

  const handleResetSession = () => {
    onResetSession?.();
    setResetDialogOpen(false);
    onMobileOpenChange?.(false);
  };

  const handleManagerAccess = () => {
    if (onManagerAccessClick) {
      onManagerAccessClick();
    }
    onMobileOpenChange?.(false);
  };

  return (
    <>
      <aside
        className={`
          fixed left-0 top-0 z-40
          flex h-screen w-64 flex-col
          bg-sidebar text-sidebar-foreground
          px-5 py-6
          shadow-sm border-r border-border
          transition-transform duration-300
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Brand */}
        <div className="mb-8 px-1">
          <span className="text-2xl font-bold text-sidebar-foreground">
            華こおり
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-2">
          {/* Manager navigation */}
          {isManager ? (
            <>
              <Button
                variant={activeTab === 'products' ? 'default' : 'ghost'}
                onClick={() => onTabChange?.('products')}
                className={`h-14 w-full justify-start gap-4 rounded-xl px-4 ${
                  activeTab === 'products' ? 'shadow-md' : ''
                }`}
              >
                <IceCream className="h-5 w-5" />
                <span className="text-base font-medium">
                  {t('manager.navigation.products')}
                </span>
              </Button>

              <Button
                variant={activeTab === 'promos' ? 'default' : 'ghost'}
                onClick={() => onTabChange?.('promos')}
                className={`h-14 w-full justify-start gap-4 rounded-xl px-4 ${
                  activeTab === 'promos' ? 'shadow-md' : ''
                }`}
              >
                <Tag className="h-5 w-5" />
                <span className="text-base font-medium">
                  {t('manager.navigation.promo_codes')}
                </span>
              </Button>

              <Button
                variant={activeTab === 'orders' ? 'default' : 'ghost'}
                onClick={() => onTabChange?.('orders')}
                className={`h-14 w-full justify-start gap-4 rounded-xl px-4 ${
                  activeTab === 'orders' ? 'shadow-md' : ''
                }`}
              >
                <Receipt className="h-5 w-5" />
                <span className="text-base font-medium">
                  {t('manager.navigation.orders')}
                </span>
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                className="
                  h-14 w-full justify-start gap-4
                  rounded-xl px-4
                  bg-sidebar-primary
                  text-sidebar-primary-foreground
                  hover:bg-sidebar-primary
                  hover:text-sidebar-primary-foreground
                "
                onClick={handleHome}
              >
                <Home className="h-5 w-5" />

                <span className="text-base font-medium">
                  {t('customer.navigation.home')}
                </span>
              </Button>

              {/* Manager */}
              <Button
                variant="ghost"
                onClick={handleManagerAccess}
                className="
                  h-14 w-full justify-start gap-4
                  rounded-xl px-4
                  text-sidebar-foreground
                  hover:bg-sidebar-accent
                  hover:text-sidebar-accent-foreground
                "
              >
                <Crown className="h-5 w-5" />

                <span className="text-base font-medium">
                  {t('customer.navigation.manager')}
                </span>
              </Button>
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border pt-4">
          {isManager ? (
            <Button
              variant="ghost"
              onClick={() => {
                window.location.href = '/';
              }}
              className="h-12 w-full justify-start gap-4 rounded-xl px-4 text-danger hover:bg-danger/10 hover:text-danger"
            >
              <ArrowLeft className="h-5 w-5" />

              <span className="text-base font-medium">
                {t('manager.navigation.back_to_store')}
              </span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="
                h-12 w-full justify-start gap-4
                rounded-xl px-4
                text-sidebar-foreground
                hover:bg-sidebar-accent
                hover:text-sidebar-accent-foreground
              "
              onClick={() => setResetDialogOpen(true)}
            >
              <LogOut className="h-5 w-5" />

              <span className="text-base font-medium">
                {t('customer.navigation.reset_session')}
              </span>
            </Button>
          )}
        </div>
      </aside>

      {/* Reset session confirmation */}
      {!isManager && (
        <AlertDialog
          open={resetDialogOpen}
          onOpenChange={setResetDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t('customer.reset_session.title')}
              </AlertDialogTitle>

              <AlertDialogDescription>
                {t('customer.reset_session.description')}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>
                {t('common.cancel')}
              </AlertDialogCancel>

              <AlertDialogAction onClick={handleResetSession}>
                {t('common.reset')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
