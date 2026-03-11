// Wishlist Page - Displays user's wishlisted products
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiTrash2, FiArrowLeft, FiStar } from 'react-icons/fi';

const Wishlist = () => {
    const { wishlistItems, removeFromWishlist, clearWishlist, loading } = useWishlist();
    const { addToCart } = useCart();
    const { user } = useAuth();

    const handleMoveToCart = (item) => {
        addToCart(item);
        removeFromWishlist(item.id);
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 text-sm">Loading your wishlist...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
                        <FiHeart className="text-3xl text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view your Wishlist</h2>
                    <p className="text-gray-500 mb-6">Create an account or sign in to save your favorite products and access them anytime.</p>
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#2e7d32] text-white font-semibold rounded-xl hover:bg-[#1b5e20] transition-all duration-200 shadow-lg shadow-green-200"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    if (wishlistItems.length === 0) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="w-24 h-24 bg-gradient-to-br from-pink-50 to-red-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-pink-100">
                        <FiHeart className="text-4xl text-pink-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
                    <p className="text-gray-500 mb-6">Browse our products and tap the heart icon to save items you love!</p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#2e7d32] text-white font-semibold rounded-xl hover:bg-[#1b5e20] transition-all duration-200 shadow-lg shadow-green-200"
                    >
                        <FiArrowLeft /> Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-6 sm:py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-pink-200">
                                <FiHeart className="text-white text-lg" />
                            </div>
                            My Wishlist
                        </h1>
                        <p className="text-gray-500 text-sm mt-1.5 ml-[52px]">
                            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
                        </p>
                    </div>
                    <div className="flex items-center gap-3 ml-[52px] sm:ml-0">
                        <button
                            onClick={clearWishlist}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200 border border-red-100"
                        >
                            <FiTrash2 className="text-sm" /> Clear All
                        </button>
                    </div>
                </div>

                {/* Wishlist Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {wishlistItems.map((item) => {
                        const discountedPrice = item.price - (item.price * (item.discount || 0) / 100);
                        const isOutOfStock = item.stock <= 0;

                        return (
                            <div
                                key={item.id}
                                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-green-100/50 transition-all duration-500 hover:-translate-y-1 relative"
                            >
                                {/* Remove Button */}
                                <button
                                    onClick={() => removeFromWishlist(item.id)}
                                    className="absolute top-3 right-3 z-20 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-red-50 hover:scale-110 transition-all duration-200 border border-gray-100 group/btn"
                                    title="Remove from wishlist"
                                >
                                    <FiHeart className="text-red-500 fill-red-500 text-sm" />
                                </button>

                                {/* Discount Badge */}
                                {item.discount > 0 && (
                                    <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-md shadow-lg">
                                        {item.discount}% OFF
                                    </div>
                                )}

                                {/* Product Image */}
                                <div className="relative overflow-hidden bg-gray-50 aspect-square">
                                    <img
                                        src={item.imageURL}
                                        alt={item.name}
                                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isOutOfStock ? 'grayscale opacity-50' : ''}`}
                                        onError={(e) => {
                                            e.target.src = `https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=${encodeURIComponent(item.name)}`;
                                        }}
                                    />
                                    {isOutOfStock && (
                                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                                            <span className="px-4 py-2 bg-red-600 text-white font-bold text-sm rounded-lg shadow-lg rotate-[-5deg]">
                                                OUT OF STOCK
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Product Info */}
                                <div className="p-4">
                                    {/* Category */}
                                    <p className="text-[11px] font-semibold text-[#2e7d32] uppercase tracking-wider mb-1">{item.category}</p>

                                    {/* Name */}
                                    <h3 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2 leading-snug">
                                        {item.name}
                                    </h3>

                                    {/* Rating */}
                                    <div className="flex items-center gap-1.5 mb-3">
                                        <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-green-50 rounded">
                                            <FiStar className="text-yellow-500 fill-yellow-500 text-[10px]" />
                                            <span className="text-[11px] font-semibold text-green-700">{item.rating || 4.0}</span>
                                        </div>
                                    </div>

                                    {/* Price & Actions */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-lg font-bold text-gray-900">₹{discountedPrice.toFixed(0)}</span>
                                            {item.discount > 0 && (
                                                <span className="text-xs text-gray-400 line-through">₹{item.price}</span>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handleMoveToCart(item)}
                                            disabled={isOutOfStock}
                                            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${isOutOfStock
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-[#2e7d32] text-white hover:bg-[#1b5e20] active:scale-95 shadow-sm shadow-green-200'
                                                }`}
                                        >
                                            <FiShoppingCart className="text-sm" />
                                            {isOutOfStock ? 'Unavailable' : 'Move to Cart'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Continue Shopping */}
                <div className="text-center mt-10">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-[#2e7d32] bg-green-50 rounded-xl hover:bg-green-100 transition-all duration-200 border border-green-100"
                    >
                        <FiArrowLeft /> Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Wishlist;
