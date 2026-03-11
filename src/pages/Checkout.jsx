// Checkout Page - Green themed payment processing matching UI design
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrderAndDeductStock } from '../services/orderService';
import { initiateRazorpayPayment, simulatePayment, processCOD } from '../services/paymentService';
import toast from 'react-hot-toast';
import { FiCreditCard, FiTruck, FiMapPin, FiCheckCircle, FiXCircle } from 'react-icons/fi';



const Checkout = () => {
    const { cartItems, getSubtotal, getGST, getTotal, clearCart } = useCart();
    const { user, customerId, address: profileAddress } = useAuth();
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState('online');
    const [processing, setProcessing] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderFailed, setOrderFailed] = useState(false);
    const [orderId, setOrderId] = useState('');
    const [finalOrderItems, setFinalOrderItems] = useState([]);
    const [finalOrderTotal, setFinalOrderTotal] = useState(0);
    const [address, setAddress] = useState({
        fullName: user?.displayName || '',
        phone: profileAddress?.phone || '',
        street: profileAddress?.street || '',
        city: profileAddress?.city || '',
        state: profileAddress?.state || '',
        pincode: profileAddress?.pincode || ''
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
        const orderTotal = getTotal();
        const currentItems = [...cartItems];

        try {
            if (paymentMethod === 'cod') {
                const codResult = processCOD({ amount: orderTotal });
                const newOrderId = await createOrderAndDeductStock(user.uid, currentItems, codResult.paymentId, 'success', orderTotal, { ...address, email: user.email, customerId: customerId || '' }, 'cod');
                setOrderId(newOrderId);
                setFinalOrderItems(currentItems);
                setFinalOrderTotal(orderTotal);
                setOrderPlaced(true);
                clearCart();
            } else {
                const orderDetails = { amount: orderTotal, items: currentItems, customerName: address.fullName, customerEmail: user.email, customerPhone: address.phone };
                const onSuccess = async (result) => {
                    try {
                        const id = await createOrderAndDeductStock(user.uid, currentItems, result.paymentId, 'success', orderTotal, { ...address, email: user.email, customerId: customerId || '' }, 'online');
                        setOrderId(id);
                        setFinalOrderItems(currentItems);
                        setFinalOrderTotal(orderTotal);
                        setOrderPlaced(true);
                        clearCart();
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



    // Order Confirmed View
    if (orderPlaced) return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-md">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                        <FiCheckCircle className="text-3xl text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-[#2e7d32] mb-1">Order Confirmed!</h2>
                    <p className="text-sm text-gray-500 mb-1">Thank you for your purchase!</p>
                    <p className="text-xs text-gray-400 mb-4">Order #{orderId.slice(0, 8)}</p>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Order Summary</p>
                        <div className="space-y-1.5">
                            {finalOrderItems.length > 0 ? finalOrderItems.map(item => (
                                <div key={item.id} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <img src={item.imageURL} alt={item.name} className="w-6 h-6 rounded object-cover"
                                            onError={e => { e.target.src = 'https://via.placeholder.com/30'; }} />
                                        <span className="text-gray-700">{item.name}</span>
                                    </div>
                                    <span className="text-gray-500">x {item.quantity}</span>
                                </div>
                            )) : (
                                <p className="text-xs text-gray-400">Items processed successfully</p>
                            )}
                        </div>
                        <hr className="my-2 border-gray-200" />
                        <div className="flex justify-between text-sm font-bold">
                            <span>Total:</span>
                            <span>₹{finalOrderTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={() => navigate('/orders')} className="flex-1 py-2.5 bg-[#2e7d32] text-white font-semibold rounded-lg hover:bg-[#1b5e20] text-xs">View Orders</button>
                        <button onClick={() => navigate('/')} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 text-xs">Continue Shopping</button>
                    </div>
                </div>
            </div>
        </div>
    );

    if (orderFailed) return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center"><FiXCircle className="text-3xl text-red-600" /></div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Failed</h2>
                <p className="text-gray-500 text-sm mb-6">No amount deducted. Please try again.</p>
                <div className="flex gap-3 justify-center">
                    <button onClick={() => { setOrderFailed(false); setProcessing(false); }} className="px-5 py-2.5 bg-[#2e7d32] text-white font-semibold rounded-lg text-sm">Try Again</button>
                    <button onClick={() => navigate('/cart')} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg text-sm">Back to Cart</button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-[#2e7d32] rounded-full"></span>
                    Checkout
                </h1>
                <div className="grid lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3 space-y-5">
                        {/* Address */}
                        <div className="bg-white rounded-xl border border-gray-100 p-5">
                            <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-4"><FiMapPin className="text-[#2e7d32]" /> Delivery Address</h3>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {[{ n: 'fullName', l: 'Full Name', p: 'John Doe' }, { n: 'phone', l: 'Phone', p: '+91 98765 43210' }, { n: 'street', l: 'Street Address', p: 'House, Street', span: true }, { n: 'city', l: 'City', p: 'Mumbai' }, { n: 'state', l: 'State', p: 'Maharashtra' }, { n: 'pincode', l: 'Pincode', p: '400001' }]
                                    .map(f => (
                                        <div key={f.n} className={f.span ? 'sm:col-span-2' : ''}>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">{f.l}</label>
                                            <input name={f.n} value={address[f.n]} onChange={handleInputChange} placeholder={f.p}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all" />
                                        </div>
                                    ))}
                            </div>
                        </div>
                        {/* Payment Method */}
                        <div className="bg-white rounded-xl border border-gray-100 p-5">
                            <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-4"><FiCreditCard className="text-[#2e7d32]" /> Payment Method</h3>
                            {[{ v: 'online', t: 'Online Payment (UPI/Card)', d: 'UPI, Card, Net Banking', i: '💳' }, { v: 'cod', t: 'Cash on Delivery', d: 'Pay on arrival', i: '💵' }].map(m => (
                                <label key={m.v} className={`flex items-center gap-4 p-3.5 rounded-lg border-2 cursor-pointer mb-2.5 transition-all ${paymentMethod === m.v ? 'border-[#2e7d32] bg-green-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input type="radio" name="payment" value={m.v} checked={paymentMethod === m.v} onChange={e => setPaymentMethod(e.target.value)} className="w-4 h-4 text-green-600 accent-green-600" />
                                    <div className="flex-1"><p className="font-semibold text-gray-800 text-sm">{m.t}</p><p className="text-xs text-gray-500">{m.d}</p></div>
                                    <span className="text-lg">{m.i}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    {/* Summary */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-20">
                            <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-4"><FiTruck className="text-[#2e7d32]" /> Order Summary</h3>
                            <div className="space-y-2.5 mb-4 max-h-52 overflow-y-auto">
                                {cartItems.map(item => {
                                    const dp = item.price - (item.price * (item.discount || 0) / 100);
                                    return (<div key={item.id} className="flex items-center gap-2.5">
                                        <img src={item.imageURL} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-gray-50" onError={e => { e.target.src = 'https://via.placeholder.com/100'; }} />
                                        <div className="flex-1 min-w-0"><p className="text-xs font-medium truncate">{item.name}</p><p className="text-[10px] text-gray-400">Qty: {item.quantity}</p></div>
                                        <p className="text-xs font-semibold">₹{(dp * item.quantity).toFixed(0)}</p>
                                    </div>);
                                })}
                            </div>
                            <hr className="mb-3" />
                            <div className="space-y-1.5 mb-5">
                                <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>₹{getSubtotal().toFixed(2)}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-gray-500">GST (5%)</span><span>₹{getGST().toFixed(2)}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-gray-500">Delivery</span><span className="text-green-600">FREE</span></div>
                                <hr />
                                <div className="flex justify-between pt-1"><span className="font-bold text-sm">Total</span><span className="font-bold text-lg">₹{getTotal().toFixed(2)}</span></div>
                            </div>
                            <button onClick={handlePayment} disabled={processing}
                                className="w-full py-3 bg-[#2e7d32] text-white font-semibold rounded-lg hover:bg-[#1b5e20] shadow-md disabled:opacity-50 transition-all">
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
