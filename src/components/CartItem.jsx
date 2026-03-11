// Cart Item Component - Green themed individual cart item
import { useCart } from '../context/CartContext';
import { parseQuantityToKg } from '../services/productService';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';

const CartItem = ({ item }) => {
    const { updateQuantity, removeFromCart } = useCart();
    const discountedPrice = item.price - (item.price * (item.discount || 0) / 100);

    return (
        <div className="flex items-center gap-3.5 bg-white rounded-xl border border-gray-100 p-3.5 hover:shadow-md transition-all duration-300 group">
            {/* Product Image */}
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                <img
                    src={item.imageURL}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                        e.target.src = `https://via.placeholder.com/200x200/f3f4f6/9ca3af?text=${encodeURIComponent(item.name)}`;
                    }}
                />
            </div>

            {/* Product Details */}
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm truncate">{item.name}</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">{item.category}</p>

                <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-gray-900">₹{discountedPrice.toFixed(0)}</span>
                    {item.discount > 0 && (
                        <span className="text-[11px] text-gray-400 line-through">₹{item.price}</span>
                    )}
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2.5 mt-2">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.stock, item.category, item.selectedQuantity || item.quantity)}
                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-green-50 hover:text-[#2e7d32] transition-colors"
                        >
                            <FiMinus className="text-xs" />
                        </button>
                        <span className="w-8 h-7 flex items-center justify-center text-xs font-semibold text-gray-800 bg-gray-50 border-x border-gray-200">
                            {item.quantity}
                        </span>
                        <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.stock, item.category, item.selectedQuantity || item.quantity)}
                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-green-50 hover:text-[#2e7d32] transition-colors"
                        >
                            <FiPlus className="text-xs" />
                        </button>
                    </div>
                    <span className="text-[10px] text-gray-400">Max: {item.stock}{item.category === 'Vegetables' ? ' kg' : ''}</span>
                </div>
            </div>

            {/* Right Section - Total & Delete */}
            <div className="text-right shrink-0">
                <p className="text-base font-bold text-gray-900">
                    ₹{(discountedPrice * item.quantity).toFixed(0)}
                </p>
                <button
                    onClick={() => removeFromCart(item.id)}
                    className="mt-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Remove item"
                >
                    <FiTrash2 className="text-base" />
                </button>
            </div>
        </div>
    );
};

export default CartItem;
