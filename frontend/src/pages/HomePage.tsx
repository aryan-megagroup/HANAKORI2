import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { SidebarNav } from '@/components/layout/SidebarNav';
import VideoBackground from '@/components/layout/VideoBackground';
import PromoBanner from '@/components/layout/PromoBanner';

import MenuGrid from '@/components/product/MenuGrid';
import { MenuCategoryTabs } from '@/components/product/MenuCategoryTabs';
import type { CategoryType } from '@/components/product/MenuCategoryTabs';

import { getProducts } from '@/services/menuApi';
import type { Product } from '@/types/product';

function HomePage() {
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] =
    useState<CategoryType>('All');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleHome = () => {
    console.log('Home clicked');
  };

  const handleResetSession = () => {
    console.log('Reset session');
    // TODO: Add actual session reset logic
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.Name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    if (!matchesSearch) {
      return false;
    }

    if (activeCategory === 'All') {
      return true;
    }

    if (activeCategory === 'Snack') {
      return product.Category === 'スナック';
    }

    if (activeCategory === 'Ice') {
      return product.Category === 'かき氷本体';
    }

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
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onToggleSidebar={() =>
              setIsSidebarOpen((prev) => !prev)
            }
          />

          <main className="w-full px-6 pb-8 pt-2 md:px-8">
            <PromoBanner />

            <div className="flex flex-col gap-6 pt-4">
              <MenuCategoryTabs
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />

              {loading && (
                <p className="text-muted-foreground">
                  {t('manager.loading_products')}
                </p>
              )}

              {error && (
                <p className="font-bold text-danger">
                  {t('customer.status.error', 'Error')}: {error}
                </p>
              )}

              {!loading &&
                !error &&
                filteredProducts.length === 0 && (
                  <p className="text-muted-foreground">
                    {t(
                      'customer.no_items',
                      '現在、このカテゴリーには商品がありません。'
                    )}
                  </p>
                )}

              {!loading &&
                !error &&
                filteredProducts.length > 0 && (
                  <MenuGrid products={filteredProducts} />
                )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default HomePage;