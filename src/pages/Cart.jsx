// Cart Page - Shopping cart with totals and checkout link
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
                    <div className="w-32 h-32 mx-auto mb-6 bg-gray-50 rounded-full flex items-center justify-center">
                        <FiShoppingCart className="text-5xl text-gray-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Empty</h2>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                        Looks like you haven't added any items to your cart yet. Start shopping now!
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                    >
                        <FiShoppingBag /> Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shopping Cart</h1>
                        <p className="text-gray-500 mt-1">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart</p>
                    </div>
                    <button
                        onClick={clearCart}
                        className="text-sm text-red-500 hover:text-red-600 font-medium hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all"
                    >
                        Clear Cart
                    </button>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <CartItem key={item.id} item={item} />
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h3>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal ({cartItems.length} items)</span>
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
                                    <span className="font-bold text-gray-900">Grand Total</span>
                                    <span className="font-bold text-xl text-gray-900">₹{getTotal().toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Savings */}
                            {cartItems.some(item => item.discount > 0) && (
                                <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-5">
                                    <p className="text-sm text-green-700 font-medium">
                                        🎉 You save ₹{cartItems.reduce((total, item) => {
                                            return total + (item.price * (item.discount || 0) / 100 * item.quantity);
                                        }, 0).toFixed(0)} on this order!
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={handleCheckout}
                                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5"
                            >
                                Proceed to Checkout
                                <FiArrowRight />
                            </button>

                            <Link
                                to="/"
                                className="w-full flex items-center justify-center gap-2 py-3 mt-3 text-gray-600 font-medium text-sm rounded-xl hover:bg-gray-50 transition-all"
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
