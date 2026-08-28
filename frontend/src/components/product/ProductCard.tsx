import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);

  const hasImage = Boolean(product.ImageURL) && !imageError;

  return (
    <Card
      className={`
        overflow-hidden
        border-0
        bg-card
        shadow-md
        transition-shadow
        duration-200
        ${product.IsAvailable ? 'hover:shadow-lg' : ''}
      `}
    >
      <div className="p-4 pb-0">
        <div
          className={`
            relative
            aspect-[4/3]
            w-full
            overflow-hidden
            rounded-lg
            bg-muted
            ${!product.IsAvailable ? 'grayscale' : ''}
          `}
        >
          {hasImage ? (
            <img
              src={product.ImageURL}
              alt={product.Name}
              className="h-full w-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              {t('manager.product_image', '商品画像')}
            </div>
          )}

          {!product.IsAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
              <span className="rounded-md bg-muted px-3 py-1 text-sm font-bold text-muted-foreground">
                {t('customer.sold_out')}
              </span>
            </div>
          )}
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col pt-3">
        <h3 className="min-h-[1.75rem] text-base font-bold leading-7 text-foreground">
          {product.Name}
        </h3>

        <p className="mt-1 text-xl font-bold text-foreground">
          ¥{product.Price.toLocaleString()}
        </p>

        <Button
          type="button"
          disabled={!product.IsAvailable}
          className="
            mt-4
            w-full
            rounded-lg
            bg-primary
            font-semibold
            text-primary-foreground
            hover:bg-primary-hover
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {product.IsAvailable
            ? t('customer.order_customize')
            : t('customer.sold_out')}
        </Button>
      </CardContent>
    </Card>
  );
}

export default ProductCard;