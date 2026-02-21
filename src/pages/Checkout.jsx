// Checkout Page - Payment processing with Razorpay/COD
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrderAndDeductStock } from '../services/orderService';
import { initiateRazorpayPayment, simulatePayment, processCOD } from '../services/paymentService';
import toast from 'react-hot-toast';
import { FiCreditCard, FiTruck, FiMapPin, FiPhone, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const Checkout = () => {
    const { cartItems, getSubtotal, getGST, getTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState('online');
    const [processing, setProcessing] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderFailed, setOrderFailed] = useState(false);
    const [orderId, setOrderId] = useState('');
    const [address, setAddress] = useState({
        fullName: user?.displayName || '', phone: '', street: '', city: '', state: '', pincode: ''
    });

    const handleInputChange = (e) => setAddress(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const validateAddress = () => {
        for (const field of ['fullName', 'phone', 'street', 'city', 'state', 'pincode']) {
            if (!address[field].trim()) { toast.error(`Please enter your ${field}`); return false; }
        }
        return true;
    };

    const handlePayment = async () => {
        if (!validateAddress() || cartItems.length === 0) return;
        setProcessing(true);
        try {
            if (paymentMethod === 'cod') {
                const codResult = processCOD({ amount: getTotal() });
                const newOrderId = await createOrderAndDeductStock(user.uid, cartItems, codResult.paymentId, 'success', getTotal());
                setOrderId(newOrderId); setOrderPlaced(true); clearCart();
            } else {
                const orderDetails = { amount: getTotal(), items: cartItems, customerName: address.fullName, customerEmail: user.email, customerPhone: address.phone };
                const onSuccess = async (result) => {
                    try {
                        const id = await createOrderAndDeductStock(user.uid, cartItems, result.paymentId, 'success', getTotal());
                        setOrderId(id); setOrderPlaced(true); clearCart();
                    } catch { setOrderFailed(true); }
                    setProcessing(false);
                };
                const onFailure = () => { setOrderFailed(true); setProcessing(false); };
                try { await initiateRazorpayPayment(orderDetails, onSuccess, onFailure); }
                catch { await simulatePayment(orderDetails, onSuccess, onFailure); }
                return;
            }
        } catch (error) { toast.error(error.message || 'Checkout failed'); setOrderFailed(true); }
        setProcessing(false);
    };

    if (orderPlaced) return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"><FiCheckCircle className="text-4xl text-green-600" /></div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed! 🎉</h2>
                <p className="text-gray-500 mb-2">Your order is being processed.</p>
                <p className="text-sm text-gray-400 mb-6">Order ID: <span className="font-mono text-gray-600">{orderId}</span></p>
                <div className="bg-white rounded-xl border p-5 mb-6 text-left">
                    <h4 className="font-semibold text-gray-800 mb-3 text-sm">Order Progress</h4>
                    {['Order Placed', 'Packing', 'Shipped', 'Delivered'].map((s, i) => (
                        <div key={s} className="flex items-center gap-3 mb-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>{i === 0 ? '✓' : i + 1}</div>
                            <span className={`text-sm ${i === 0 ? 'text-green-700 font-medium' : 'text-gray-400'}`}>{s}</span>
                        </div>
                    ))}
                </div>
                <div className="flex gap-3 justify-center">
                    <button onClick={() => navigate('/orders')} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200">View Orders</button>
                    <button onClick={() => navigate('/')} className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200">Continue Shopping</button>
                </div>
            </div>
        </div>
    );

    if (orderFailed) return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center"><FiXCircle className="text-4xl text-red-600" /></div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
                <p className="text-gray-500 mb-6">No amount deducted. Please try again.</p>
                <div className="flex gap-3 justify-center">
                    <button onClick={() => { setOrderFailed(false); setProcessing(false); }} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl">Try Again</button>
                    <button onClick={() => navigate('/cart')} className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl">Back to Cart</button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
                <div className="grid lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3 space-y-6">
                        {/* Address */}
                        <div className="bg-white rounded-2xl border p-6">
                            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-5"><FiMapPin className="text-blue-600" /> Delivery Address</h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {[{ n: 'fullName', l: 'Full Name', p: 'John Doe' }, { n: 'phone', l: 'Phone', p: '+91 98765 43210' }, { n: 'street', l: 'Street Address', p: 'House, Street', span: true }, { n: 'city', l: 'City', p: 'Mumbai' }, { n: 'state', l: 'State', p: 'Maharashtra' }, { n: 'pincode', l: 'Pincode', p: '400001' }]
                                    .map(f => (
                                        <div key={f.n} className={f.span ? 'sm:col-span-2' : ''}>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{f.l}</label>
                                            <input name={f.n} value={address[f.n]} onChange={handleInputChange} placeholder={f.p}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
                                        </div>
                                    ))}
                            </div>
                        </div>
                        {/* Payment Method */}
                        <div className="bg-white rounded-2xl border p-6">
                            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-5"><FiCreditCard className="text-blue-600" /> Payment Method</h3>
                            {[{ v: 'online', t: 'Online Payment (Razorpay)', d: 'UPI, Card, Net Banking', i: '💳' }, { v: 'cod', t: 'Cash on Delivery', d: 'Pay on arrival', i: '💵' }].map(m => (
                                <label key={m.v} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer mb-3 transition-all ${paymentMethod === m.v ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input type="radio" name="payment" value={m.v} checked={paymentMethod === m.v} onChange={e => setPaymentMethod(e.target.value)} className="w-4 h-4 text-blue-600" />
                                    <div className="flex-1"><p className="font-semibold text-gray-800 text-sm">{m.t}</p><p className="text-xs text-gray-500">{m.d}</p></div>
                                    <span className="text-lg">{m.i}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    {/* Summary */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border p-6 sticky top-24">
                            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-5"><FiTruck className="text-blue-600" /> Order Summary</h3>
                            <div className="space-y-3 mb-5 max-h-64 overflow-y-auto">
                                {cartItems.map(item => {
                                    const dp = item.price - (item.price * (item.discount || 0) / 100);
                                    return (<div key={item.id} className="flex items-center gap-3">
                                        <img src={item.imageURL} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-gray-50" onError={e => { e.target.src = 'https://via.placeholder.com/100'; }} />
                                        <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{item.name}</p><p className="text-xs text-gray-400">Qty: {item.quantity}</p></div>
                                        <p className="text-sm font-semibold">₹{(dp * item.quantity).toFixed(0)}</p>
                                    </div>);
                                })}
                            </div>
                            <hr className="mb-4" />
                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>₹{getSubtotal().toFixed(2)}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-gray-500">GST (5%)</span><span>₹{getGST().toFixed(2)}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-gray-500">Delivery</span><span className="text-green-600">FREE</span></div>
                                <hr />
                                <div className="flex justify-between pt-1"><span className="font-bold">Total</span><span className="font-bold text-xl">₹{getTotal().toFixed(2)}</span></div>
                            </div>
                            <button onClick={handlePayment} disabled={processing}
                                className="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-200 disabled:opacity-50">
                                {processing ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order (COD)' : `Pay ₹${getTotal().toFixed(0)}`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
