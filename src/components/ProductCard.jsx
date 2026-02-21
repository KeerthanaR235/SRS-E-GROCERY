// Product Card Component - Displays individual product with stock status
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiStar } from 'react-icons/fi';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const isOutOfStock = product.stock <= 0;
    const isLowStock = product.stock > 0 && product.stock <= (product.lowStockThreshold || 10);
    const discountedPrice = product.price - (product.price * (product.discount || 0) / 100);

    return (
        <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-500 hover:-translate-y-1 relative">
            {/* Discount Badge */}
            {product.discount > 0 && (
                <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-lg shadow-lg">
                    {product.discount}% OFF
                </div>
            )}

            {/* Stock Badge */}
            {isLowStock && (
                <div className="absolute top-3 right-3 z-10 px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-lg border border-orange-200">
                    Only {product.stock} left
                </div>
            )}

            {/* Product Image */}
            <div className="relative overflow-hidden bg-gray-50 aspect-square">
                <img
                    src={product.imageURL}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isOutOfStock ? 'grayscale opacity-50' : ''}`}
                    onError={(e) => {
                        e.target.src = `https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=${encodeURIComponent(product.name)}`;
                    }}
                />

                {/* Out of Stock Overlay */}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                        <span className="px-4 py-2 bg-red-600 text-white font-bold text-sm rounded-lg shadow-lg rotate-[-5deg]">
                            OUT OF STOCK
                        </span>
                    </div>
                )}

                {/* Quick Add Button */}
                {!isOutOfStock && (
                    <button
                        onClick={() => addToCart(product)}
                        className="absolute bottom-3 right-3 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-blue-700 hover:scale-110 transform translate-y-2 group-hover:translate-y-0"
                    >
                        <FiShoppingCart />
                    </button>
                )}
            </div>

            {/* Product Info */}
            <div className="p-4">
                {/* Category */}
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">{product.category}</p>

                {/* Name */}
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-2 line-clamp-2 leading-snug">
                    {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                    <div className="flex items-center gap-0.5 px-2 py-0.5 bg-green-50 rounded-md">
                        <FiStar className="text-yellow-500 fill-yellow-500 text-xs" />
                        <span className="text-xs font-semibold text-green-700">{product.rating || 4.0}</span>
                    </div>
                    <span className="text-xs text-gray-400">|</span>
                    <span className="text-xs text-gray-400">{product.stock} in stock</span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-gray-900">₹{discountedPrice.toFixed(0)}</span>
                        {product.discount > 0 && (
                            <span className="text-sm text-gray-400 line-through">₹{product.price}</span>
                        )}
                    </div>

                    {/* Add to Cart Button */}
                    <button
                        onClick={() => addToCart(product)}
                        disabled={isOutOfStock}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200
              ${isOutOfStock
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white active:scale-95'
                            }`}
                    >
                        {isOutOfStock ? 'Unavailable' : 'Add'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
