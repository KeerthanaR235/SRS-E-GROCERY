// Product Card Component - Green themed card matching UI design
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { FiShoppingCart, FiStar, FiEye, FiHeart } from 'react-icons/fi';

const ProductCard = ({ product, onViewDetails }) => {
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const wishlisted = isInWishlist(product.id);

    // Check stock across all brands/variants — only "out of stock" if every variant is 0
    const totalStock = product.brands && product.brands.length > 0
        ? product.brands.reduce((sum, b) => sum + (b.variants || []).reduce((vs, v) => vs + Number(v.stock || 0), 0), 0)
        : Number(product.stock || 0);
    const isOutOfStock = totalStock <= 0;

    return (
        <div
            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 relative flex flex-col h-full hover:-translate-y-1 cursor-pointer"
            onClick={() => onViewDetails && onViewDetails(product)}
        >
            {/* Wishlist Heart Button */}
            <div className="absolute top-3 right-3 z-30 flex flex-col gap-2 items-center">
                <button
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 ${
                        wishlisted
                            ? 'bg-red-50 text-red-500'
                            : 'bg-white text-gray-400 opacity-0 group-hover:opacity-100'
                    }`}
                >
                    <FiHeart className={`text-lg ${wishlisted ? 'fill-red-500' : ''}`} />
                </button>
            </div>

            {/* Product Image */}
            <div className="relative overflow-hidden bg-[#fbfbfb] aspect-square">
                <img
                    src={product.imageURL}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isOutOfStock ? 'grayscale opacity-50' : ''}`}
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                    }}
                />
                <div className="hidden absolute inset-0 items-center justify-center bg-gray-50 text-gray-400 font-bold uppercase text-xs p-4 text-center">
                    {product.name}
                </div>

                {!isOutOfStock && (
                    <button
                        onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                        className="absolute top-1/2 -right-4 group-hover:right-4 -translate-y-1/2 w-11 h-11 bg-[#2e7d32] text-white rounded-xl flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#1b5e20] z-20"
                    >
                        <FiShoppingCart className="text-xl" />
                    </button>
                )}

                {isOutOfStock && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="px-5 py-2.5 bg-red-600 text-white font-black text-[11px] rounded-full shadow-2xl uppercase tracking-tighter">
                            Out of Stock
                        </span>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-4 flex flex-col flex-grow text-left">
                {/* Category & Brand/Quantity */}
                <div className="flex flex-wrap items-center gap-2 mb-1.5 capitalize">
                    <span className="text-[10px] font-black text-[#2e7d32] uppercase tracking-[0.08em] bg-green-50 px-2 py-0.5 rounded">
                        {product.category}
                    </span>
                    {(product.brand || product.quantity) && (
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {product.brand} {product.brand && product.quantity && '•'} {product.quantity}
                        </span>
                    )}
                </div>

                {/* Name */}
                <h3 className="font-bold text-gray-900 text-[15px] mb-2 line-clamp-1 leading-tight transition-colors group-hover:text-[#2e7d32]">
                    {product.name}
                </h3>

                {/* Interaction / Views */}
                <div className="flex items-center gap-1.5 text-gray-400 mb-4">
                    <FiEye className="text-[13px]" />
                    <span className="text-[11px] font-bold">{totalStock}{product.category === 'Vegetables' ? ' kg' : ''} in stock</span>
                </div>

                {/* Price & Add to Cart */}
                <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-50 pt-3">
                    <span className="text-[18px] font-black text-gray-900 leading-none">₹{Number(product.price).toFixed(0)}</span>

                    <button
                        onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                        disabled={isOutOfStock}
                        className={`h-9 px-4 text-[12px] font-black rounded-lg transition-all duration-300 flex items-center justify-center whitespace-nowrap ${isOutOfStock
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-[#2e7d32] text-white hover:bg-[#1b5e20] active:scale-95 shadow-lg shadow-green-100'
                            }`}
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
