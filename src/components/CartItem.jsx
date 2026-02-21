// Cart Item Component - Individual item in the cart
import { useCart } from '../context/CartContext';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';

const CartItem = ({ item }) => {
    const { updateQuantity, removeFromCart } = useCart();
    const discountedPrice = item.price - (item.price * (item.discount || 0) / 100);

    return (
        <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all duration-300 group">
            {/* Product Image */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-50 shrink-0">
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
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{item.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>

                <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-gray-900">₹{discountedPrice.toFixed(0)}</span>
                    {item.discount > 0 && (
                        <span className="text-xs text-gray-400 line-through">₹{item.price}</span>
                    )}
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.stock)}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                        >
                            <FiMinus className="text-sm" />
                        </button>
                        <span className="w-10 h-8 flex items-center justify-center text-sm font-semibold text-gray-800 bg-gray-50 border-x border-gray-200">
                            {item.quantity}
                        </span>
                        <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.stock)}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                        >
                            <FiPlus className="text-sm" />
                        </button>
                    </div>

                    <span className="text-xs text-gray-400">
                        Max: {item.stock}
                    </span>
                </div>
            </div>

            {/* Right Section - Total & Delete */}
            <div className="text-right shrink-0">
                <p className="text-lg font-bold text-gray-900">
                    ₹{(discountedPrice * item.quantity).toFixed(0)}
                </p>
                <button
                    onClick={() => removeFromCart(item.id)}
                    className="mt-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Remove item"
                >
                    <FiTrash2 className="text-lg" />
                </button>
            </div>
        </div>
    );
};

export default CartItem;
