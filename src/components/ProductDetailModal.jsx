// Product Detail Modal - Shows product details with brand/variant selection
import { useState, useEffect } from 'react';
import { FiX, FiHeart, FiMinus, FiPlus, FiShield, FiTruck, FiShoppingCart } from 'react-icons/fi';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { parseQuantityToKg } from '../services/productService';

const ProductDetailModal = ({ product, isOpen, onClose }) => {
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const wishlisted = isInWishlist(product?.id);

    const [selectedBrandIndex, setSelectedBrandIndex] = useState(0);
    const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);

    // Reset selections when product changes
    useEffect(() => {
        setSelectedBrandIndex(0);
        setSelectedVariantIndex(0);
        setQuantity(1);
    }, [product?.id]);

    if (!isOpen || !product) return null;

    const brands = product.brands && product.brands.length > 0
        ? product.brands
        : [{ name: product.brand || product.name, variants: [{ quantity: product.quantity || '1 unit', price: product.price, stock: product.stock }] }];

    const selectedBrand = brands[selectedBrandIndex] || brands[0];
    const selectedVariant = selectedBrand.variants[selectedVariantIndex] || selectedBrand.variants[0];
    const variantPrice = Number(selectedVariant.price);
    const variantStock = Number(selectedVariant.stock);
    const isVegetable = product.category === 'Vegetables';
    const kgPerUnit = isVegetable ? parseQuantityToKg(selectedVariant.quantity) : null;
    const maxItems = (isVegetable && kgPerUnit && kgPerUnit > 0) ? Math.floor(variantStock / kgPerUnit) : variantStock;
    const totalPrice = variantPrice * quantity;
    const isOutOfStock = variantStock <= 0;

    // Star rating renderer
    const rating = product.rating || 4.0;
    const renderStars = () => {
        const stars = [];
        const full = Math.floor(rating);
        const hasHalf = rating - full >= 0.25 && rating - full < 0.75;
        const totalStars = 5;
        for (let i = 0; i < full; i++) stars.push(<FaStar key={i} className="text-amber-400" />);
        if (hasHalf) stars.push(<FaStarHalfAlt key="half" className="text-amber-400" />);
        while (stars.length < totalStars) stars.push(<FaRegStar key={`empty-${stars.length}`} className="text-amber-400" />);
        return stars;
    };

    const handleAddToCart = () => {
        const cartProduct = {
            ...product,
            price: variantPrice,
            stock: variantStock,
            selectedBrand: selectedBrand.name,
            selectedQuantity: selectedVariant.quantity,
            // Unique ID per brand+variant combo
            id: `${product.id}_${selectedBrand.name}_${selectedVariant.quantity}`,
            originalId: product.id,
        };
        for (let i = 0; i < quantity; i++) {
            addToCart(cartProduct);
        }
        onClose();
    };

    const handleBrandSelect = (index) => {
        setSelectedBrandIndex(index);
        setSelectedVariantIndex(0);
        setQuantity(1);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-modalIn"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col md:flex-row">
                    {/* Left: Image */}
                    <div className="md:w-[45%] p-6 flex items-center justify-center bg-[#fafafa] rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none">
                        <img
                            src={product.imageURL}
                            alt={product.name}
                            className="w-full max-w-[320px] h-auto object-cover rounded-2xl shadow-lg"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    </div>

                    {/* Right: Details */}
                    <div className="md:w-[55%] p-6 md:p-8 flex flex-col">
                        {/* Top actions */}
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[11px] font-black text-[#2e7d32] uppercase tracking-[0.1em] bg-green-50 px-3 py-1.5 rounded-lg">
                                {product.category}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => toggleWishlist(product)}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 hover:scale-110 ${
                                        wishlisted
                                            ? 'bg-red-50 border-red-200 text-red-500'
                                            : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-red-400'
                                    }`}
                                >
                                    <FiHeart className={`text-lg ${wishlisted ? 'fill-red-500' : ''}`} />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                                >
                                    <FiX className="text-lg" />
                                </button>
                            </div>
                        </div>

                        {/* Name */}
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2 leading-tight">
                            {product.name}
                        </h2>

                        {/* Price */}
                        <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-3xl font-black text-[#2e7d32]">₹{variantPrice}</span>
                            <span className="text-base text-gray-400 font-medium">/ {selectedVariant.quantity}</span>
                        </div>

                        {/* Description */}
                        {product.description && (
                            <p className="text-sm text-gray-500 leading-relaxed mb-5">
                                {product.description}
                            </p>
                        )}
                        {!product.description && (
                            <p className="text-sm text-gray-500 leading-relaxed mb-5">
                                Fresh and high-quality {product.name.toLowerCase()} sourced directly from local farms. Rich in nutrients and guaranteed freshness.
                            </p>
                        )}

                        {/* Select Brand */}
                        {brands.length > 0 && (
                            <div className="mb-5">
                                <h4 className="text-sm font-bold text-gray-800 mb-2.5">Select Brand</h4>
                                <div className="flex flex-wrap gap-2">
                                    {brands.map((brand, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleBrandSelect(idx)}
                                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                                                selectedBrandIndex === idx
                                                    ? 'bg-[#2e7d32] text-white shadow-lg shadow-green-200'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {brand.name || product.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Select Quantity/Unit */}
                        {selectedBrand.variants.length > 0 && (
                            <div className="mb-5">
                                <h4 className="text-sm font-bold text-gray-800 mb-2.5">Select Quantity/Unit</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedBrand.variants.map((variant, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => { setSelectedVariantIndex(idx); setQuantity(1); }}
                                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                                                selectedVariantIndex === idx
                                                    ? 'bg-[#2e7d32] text-white shadow-lg shadow-green-200'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {variant.quantity} - ₹{Number(variant.price)}
                                            <span className={`ml-1 text-[10px] ${selectedVariantIndex === idx ? 'text-green-200' : Number(variant.stock) <= 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                                ({Number(variant.stock) <= 0 ? 'Out of stock' : `${variant.stock}${product.category === 'Vegetables' ? ' kg' : ''} left`})
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div className="flex items-center gap-4 mb-5">
                            <h4 className="text-sm font-bold text-gray-800">Quantity</h4>
                            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                                >
                                    <FiMinus />
                                </button>
                                <span className="w-10 h-10 flex items-center justify-center font-bold text-gray-800 border-x border-gray-200">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(q => Math.min(maxItems, q + 1))}
                                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                                >
                                    <FiPlus />
                                </button>
                            </div>
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-6 mb-6 text-sm text-gray-400">
                            <div className="flex items-center gap-1.5">
                                <FiShield className="text-[#2e7d32]" />
                                <span className="font-medium">Quality Guaranteed</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <FiTruck className="text-[#2e7d32]" />
                                <span className="font-medium">Free Delivery</span>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            disabled={isOutOfStock}
                            className={`w-full py-3.5 rounded-2xl text-base font-black flex items-center justify-center gap-2 transition-all duration-300 ${
                                isOutOfStock
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-[#2e7d32] text-white hover:bg-[#1b5e20] active:scale-[0.98] shadow-xl shadow-green-200'
                            }`}
                        >
                            <FiShoppingCart className="text-lg" />
                            {isOutOfStock ? 'Out of Stock' : `Add to Cart • ₹${totalPrice}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;
