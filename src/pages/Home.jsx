// Home Page - Main landing page with green themed products grid
import { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import CategoryBar from '../components/CategoryBar';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import { subscribeToProducts } from '../services/productService';

const Home = ({ searchQuery = '' }) => {
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        const unsubscribe = subscribeToProducts((data) => {
            setProducts(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredProducts = products.filter(product => {
        const matchesCategory = !selectedCategory || product.category === selectedCategory;
        const matchesSearch = !searchQuery ||
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="bg-[#f8f9fa] min-h-screen">
            <Hero />
            <CategoryBar
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
            />

            {/* Products Grid Section */}
            <section id="products" className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-8 bg-[#2e7d32] rounded-full"></div>
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tighter italic">
                                    {selectedCategory || 'Our Fresh Collection'}
                                </h2>
                                <p className="text-gray-400 text-[13px] font-bold uppercase tracking-widest mt-0.5">
                                    {filteredProducts.length} items found {searchQuery && `for "${searchQuery}"`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100"></div>
                            ))}
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100 shadow-sm transition-all hover:border-green-100">
                            <div className="text-7xl mb-6">🔭</div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase italic tracking-tighter">No items found</h3>
                            <p className="text-gray-500 max-w-sm mx-auto font-medium">
                                We couldn't find any products matching your criteria. Try changing your filters or search keywords.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} onViewDetails={setSelectedProduct} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Product Detail Modal */}
            <ProductDetailModal
                product={selectedProduct}
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
            />
        </div>
    );
};

export default Home;
