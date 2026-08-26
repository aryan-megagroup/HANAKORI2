import { useState } from 'react';
import { Crown, Home, LogOut } from 'lucide-react';

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
  onHome: () => void;
  onResetSession: () => void;
  isMobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

export function SidebarNav({
  onHome,
  onResetSession,
  isMobileOpen = false,
  onMobileOpenChange,
}: SidebarNavProps) {
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const handleHome = () => {
    onHome();
    onMobileOpenChange?.(false);
  };

  const handleResetSession = () => {
    onResetSession();
    setResetDialogOpen(false);
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
          shadow-sm
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
          {/* Home */}
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
              ホーム
            </span>
          </Button>

          {/* Manager */}
          <Button
            variant="ghost"
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
              管理者画面
            </span>
          </Button>
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border pt-4">
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
              セッションをリセット
            </span>
          </Button>
        </div>
      </aside>

      {/* Reset session confirmation */}
      <AlertDialog
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              セッションをリセットしますか？
            </AlertDialogTitle>

            <AlertDialogDescription>
              現在の注文セッションをリセットします。
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              キャンセル
            </AlertDialogCancel>

            <AlertDialogAction onClick={handleResetSession}>
              リセット
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}