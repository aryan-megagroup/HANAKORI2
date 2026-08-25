import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

// Define the TypeScript interface matching the Go backend entity
interface Product {
  MenuID: number;
  Name: string;
  Price: number;
  Description: string;
  Category: string;
  ImageURL: string;
  IsAvailable: boolean;
}

function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        setProducts(data || []);
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

  return (
    <main className="min-h-screen bg-background p-8 font-sans">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-foreground">
          HANAKORI2 - DB Connection Test
        </h1>

        <div className="mt-6">
          <Button>Kakigori Button</Button>
        </div>

        {loading && (
          <p className="mt-4 text-muted-foreground">
            Loading products from PostgreSQL...
          </p>
        )}

        {error && (
          <p className="mt-4 font-bold text-danger">
            Error: {error}
          </p>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="mt-4 text-muted-foreground">
            No products found. Did the seeders run successfully?
          </p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
            {products.map((product) => (
              <div
                key={product.MenuID}
                className="rounded-md border border-border bg-card p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <h3 className="mb-2 text-lg font-bold text-foreground">
                  {product.Name}
                </h3>

                <p className="my-1 text-sm text-muted-foreground">
                  {product.Category}
                </p>

                <p className="my-2 font-bold text-primary">
                  ¥{product.Price}
                </p>

                <span
                  className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                  product.IsAvailable
                    ? 'bg-secondary text-secondary-foreground'
                    : 'bg-danger text-danger-foreground'
                  }`}
                >
                  {product.IsAvailable ? 'Available' : 'Sold Out'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default HomePage;