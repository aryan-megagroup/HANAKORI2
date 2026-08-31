import type { Product } from '@/types/product';

export async function getProducts(): Promise<Product[]> {
  const response = await fetch('/api/products');

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: Product[] = await response.json();

  return data || [];
}