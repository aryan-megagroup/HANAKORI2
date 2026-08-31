import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { SidebarNav } from '@/components/layout/SidebarNav';
import VideoBackground from '@/components/layout/VideoBackground';
import PromoBanner from '@/components/layout/PromoBanner';

import MenuGrid from '@/components/product/MenuGrid';
import { MenuCategoryTabs } from '@/components/product/MenuCategoryTabs';
import type { CategoryType } from '@/components/product/MenuCategoryTabs';
import { ManagerAccessModal } from '@/components/features/ManagerAccessModal';

import { getProducts } from '@/services/menuApi';
import type { Product } from '@/types/product';

function HomePage() {
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState<CategoryType>('All');
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(t('customer.status.unknown_error'));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [t]);

  const handleHome = () => {
    console.log('Home clicked');
  };

  const handleResetSession = () => {
    console.log('Reset session');
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.Name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Snack') return product.Category === 'スナック';
    if (activeCategory === 'Ice') return product.Category === 'かき氷本体';

    return true;
  });

  return (
    <>
      <VideoBackground />

      <div className="relative z-10 min-h-screen font-sans">
        <SidebarNav
          onHome={handleHome}
          onResetSession={handleResetSession}
          isMobileOpen={isSidebarOpen}
          onMobileOpenChange={setIsSidebarOpen}
          onManagerAccessClick={() => setIsManagerModalOpen(true)}
        />

        <div
          className={`
            min-h-screen
            transition-[margin]
            duration-300
            ${isSidebarOpen ? 'md:ml-64' : 'md:ml-0'}
          `}
        >
          <DashboardHeader
            title={t('customer.greeting')}
            subtitle={t('customer.subgreeting')}
            searchQuery={searchQuery}
            searchPlaceholder={t('customer.search_placeholder')}
            showSearch={true}
            onSearchChange={setSearchQuery}
            onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          />

          <main className="w-full px-6 pb-8 md:px-8">
            <div className="px-3 pt-2">
              <PromoBanner />
            </div>

            <div className="flex flex-col gap-6 pt-4">
              <MenuCategoryTabs
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />

              {loading && (
                <p className="text-muted-foreground">
                  {t('customer.status.loading_products')}
                </p>
              )}

              {error && (
                <p className="font-bold text-danger">
                  {t('customer.status.error')}: {error}
                </p>
              )}

              {!loading &&
                !error &&
                filteredProducts.length === 0 && (
                  <p className="text-muted-foreground">
                    {t('customer.status.no_products')}
                  </p>
                )}

              {!loading &&
                !error &&
                filteredProducts.length > 0 && (
                  <MenuGrid products={filteredProducts} />
                )}
            </div>

            <ManagerAccessModal
              isOpen={isManagerModalOpen}
              onClose={() => setIsManagerModalOpen(false)}
            />
          </main>
        </div>
      </div>
    </>
  );
}

export default HomePage;
