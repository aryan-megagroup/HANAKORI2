import ProductCard from '@/components/product/ProductCard';
import type { Product } from '@/types/product';

interface MenuGridProps {
  products: Product[];
}

function MenuGrid({ products }: MenuGridProps) {
  return (
    <div
      className="
        grid
        grid-cols-[repeat(auto-fill,minmax(180px,1fr))]
        gap-4
      "
    >
      {products.map((product) => (
        <ProductCard
          key={product.MenuID}
          product={product}
        />
      ))}
    </div>
  );
}

export default MenuGrid;