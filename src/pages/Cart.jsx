// Cart Page - Shopping cart with green theme matching UI design
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartItem from '../components/CartItem';
import { FiShoppingBag, FiArrowRight, FiShoppingCart } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Cart = () => {
    const { cartItems, getSubtotal, getGST, getTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleCheckout = () => {
        if (!user) {
            toast.error('Please login to proceed to checkout');
            navigate('/login');
            return;
        }
        navigate('/checkout');
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="w-28 h-28 mx-auto mb-6 bg-green-50 rounded-full flex items-center justify-center">
                        <FiShoppingCart className="text-5xl text-green-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Empty</h2>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                        Looks like you haven't added any items yet. Start shopping now!
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#2e7d32] text-white font-semibold rounded-lg hover:bg-[#1b5e20] transition-all shadow-lg"
                    >
                        <FiShoppingBag /> Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <span className="w-1 h-6 bg-[#2e7d32] rounded-full"></span>
                            Shopping Cart
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart</p>
                    </div>
                    <button
                        onClick={clearCart}
                        className="text-xs text-red-500 hover:text-red-600 font-medium hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all"
                    >
                        Clear Cart
                    </button>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-3">
                        {cartItems.map((item) => (
                            <CartItem key={item.id} item={item} />
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-20 shadow-sm">
                            <h3 className="text-base font-bold text-gray-900 mb-4">Order Summary</h3>

                            {/* Cart item summary */}
                            <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                                {cartItems.map(item => {
                                    const dp = item.price - (item.price * (item.discount || 0) / 100);
                                    return (
                                        <div key={item.id} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <img src={item.imageURL} alt={item.name} className="w-8 h-8 rounded object-cover bg-gray-50"
                                                    onError={e => { e.target.src = 'https://via.placeholder.com/40'; }} />
                                                <span className="text-xs text-gray-700 truncate max-w-[120px]">{item.name}</span>
                                            </div>
                                            <span className="font-semibold text-xs text-gray-800">₹{(dp * item.quantity).toFixed(0)}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="font-medium text-gray-800">₹{getSubtotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">GST (5%)</span>
                                    <span className="font-medium text-gray-800">₹{getGST().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Delivery</span>
                                    <span className="font-medium text-green-600">FREE</span>
                                </div>
                                <hr className="border-gray-100" />
                                <div className="flex justify-between">
                                    <span className="font-bold text-gray-900 text-sm">Total:</span>
                                    <span className="font-bold text-lg text-gray-900">₹{getTotal().toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Savings */}
                            {cartItems.some(item => item.discount > 0) && (
                                <div className="bg-green-50 border border-green-100 rounded-lg p-2.5 mb-4">
                                    <p className="text-xs text-green-700 font-medium">
                                        🎉 You save ₹{cartItems.reduce((total, item) => {
                                            return total + (item.price * (item.discount || 0) / 100 * item.quantity);
                                        }, 0).toFixed(0)} on this order!
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={handleCheckout}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-[#2e7d32] text-white font-semibold rounded-lg hover:bg-[#1b5e20] transition-all shadow-md hover:shadow-lg"
                            >
                                Proceed to Checkout
                                <FiArrowRight />
                            </button>

                            <Link
                                to="/"
                                className="w-full flex items-center justify-center gap-2 py-2.5 mt-2 text-gray-600 font-medium text-sm rounded-lg hover:bg-gray-50 transition-all"
                            >
                                <FiShoppingBag /> Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
