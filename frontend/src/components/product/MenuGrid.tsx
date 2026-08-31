import ProductCard from '@/components/product/ProductCard';
import type { Product } from '@/types/product';

interface MenuGridProps {
  products: Product[];
}

function MenuGrid({ products }: MenuGridProps) {
  return (
    <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
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