import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import VideoBackground from "@/components/layout/VideoBackground";

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
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setProducts(data || []);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <VideoBackground />
      <div className="min-h-screen font-sans relative z-10 flex flex-col">
        <DashboardHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onToggleSidebar={() => {
            // Future sidebar logic goes here
          }}
        />

        <main className="mx-auto w-full max-w-7xl flex-1 p-6 md:p-8">
          {loading && (
            <p className="text-muted-foreground bg-background/80 p-2 rounded inline-block">
              Loading products from PostgreSQL...
            </p>
          )}

          {error && (
            <p className="font-bold text-danger bg-background/80 p-2 rounded inline-block">
              Error: {error}
            </p>
          )}

          {!loading && !error && products.length === 0 && (
            <p className="text-muted-foreground bg-background/80 p-2 rounded inline-block">
              No products found. Did the seeders run successfully?
            </p>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
              {products.map((product) => (
                <div
                  key={product.MenuID}
                  className="rounded-lg border border-border bg-card p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
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
                    className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${product.IsAvailable
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-danger text-danger-foreground"
                      }`}
                  >
                    {product.IsAvailable ? "Available" : "Sold Out"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default HomePage;