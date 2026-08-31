import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types/product";

interface MenuGridProps {
  products: Product[];
}

function MenuGrid({ products }: MenuGridProps) {
  return (
    <div
      className="
    grid
    w-full
    grid-cols-1
    gap-5
    sm:grid-cols-2
    lg:grid-cols-4
  "
    >
      {products.map((product) => (
        <ProductCard key={product.MenuID} product={product} />
      ))}
    </div>
  );
}

export default MenuGrid;
