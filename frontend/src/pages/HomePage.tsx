import { useEffect, useState } from 'react';

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

  // Fetch data from the Go API on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Ensure we set an array even if the backend returns null
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
    <main style={{ padding: '30px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ color: '#334155' }}>HANAKORI2 - DB Connection Test</h1>
      
      {/* Handle Loading and Error States */}
      {loading && <p>Loading products from PostgreSQL...</p>}
      {error && <p style={{ color: 'red', fontWeight: 'bold' }}>Error: {error}</p>}
      
      {!loading && !error && products.length === 0 && (
        <p>No products found. Did the seeders run successfully?</p>
      )}

      {/* Render the Database Records */}
      {!loading && !error && products.length > 0 && (
        <div 
          style={{ 
            display: 'grid', 
            gap: '16px', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            marginTop: '20px'
          }}
        >
          {products.map(product => (
            <div 
              key={product.MenuID} 
              style={{ 
                border: '1px solid #e2e8f0', 
                padding: '16px', 
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
              }}
            >
              <h3 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>{product.Name}</h3>
              <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#64748b' }}>
                {product.Category}
              </p>
              <p style={{ margin: '8px 0', fontWeight: 'bold', color: '#FFC0CB' }}>
                ¥{product.Price}
              </p>
              <span 
                style={{ 
                  fontSize: '0.8rem',
                  padding: '4px 8px', 
                  borderRadius: '999px',
                  backgroundColor: product.IsAvailable ? '#dcfce7' : '#fee2e2',
                  color: product.IsAvailable ? '#166534' : '#991b1b'
                }}
              >
                {product.IsAvailable ? 'Available' : 'Sold Out'}
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default HomePage;