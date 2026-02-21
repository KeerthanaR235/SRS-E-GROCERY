// Home Page - Main landing page with products grid
import { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import CategoryBar from '../components/CategoryBar';
import OffersSection from '../components/OffersSection';
import ProductCard from '../components/ProductCard';
import { subscribeToProducts, seedProducts } from '../services/productService';

const Home = ({ searchQuery = '' }) => {
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Seed dummy products on first load
        seedProducts().catch(console.error);

        // Subscribe to real-time product updates
        const unsubscribe = subscribeToProducts((data) => {
            setProducts(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Filter products based on category and search
    const filteredProducts = products.filter(product => {
        const matchesCategory = !selectedCategory || product.category === selectedCategory;
        const matchesSearch = !searchQuery ||
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    return (
        <div>
            <Hero />
            <CategoryBar
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
            />
            <OffersSection />

            {/* Products Grid */}
            <section id="products" className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                {selectedCategory || 'All'} Products
                            </h2>
                            <p className="text-gray-500 mt-1">
                                {filteredProducts.length} products available
                                {searchQuery && ` for "${searchQuery}"`}
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                                    <div className="aspect-square bg-gray-100"></div>
                                    <div className="p-4 space-y-3">
                                        <div className="h-3 bg-gray-100 rounded w-1/3"></div>
                                        <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                                        <div className="flex justify-between items-center">
                                            <div className="h-5 bg-gray-100 rounded w-16"></div>
                                            <div className="h-8 bg-gray-100 rounded w-14"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
                            <p className="text-gray-500">
                                {searchQuery
                                    ? `Try searching for something else`
                                    : `No products available in this category`
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Home;
