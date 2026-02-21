// Orders Page - User's order history with tracking
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserOrders } from '../services/orderService';
import { Link } from 'react-router-dom';
import { FiPackage, FiClock, FiCheckCircle, FiTruck, FiShoppingBag } from 'react-icons/fi';

const statusColors = {
    placed: 'bg-blue-100 text-blue-700',
    packed: 'bg-yellow-100 text-yellow-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700'
};

const statusIcons = { placed: FiClock, packed: FiPackage, shipped: FiTruck, delivered: FiCheckCircle, cancelled: FiPackage };

const Orders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const unsubscribe = getUserOrders(user.uid, (data) => {
            setOrders(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    const downloadBill = (order) => {
        const date = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-IN') : 'N/A';
        const content = `
E-GROCERY RECEIPT
=================
Order ID: ${order.id}
Date: ${date}
Status: ${order.orderStatus.toUpperCase()}

ITEMS:
${order.items.map(item => `- ${item.name.padEnd(30)} x${item.quantity.toString().padEnd(2)} ₹${(item.price * item.quantity).toFixed(2)}`).join('\n')}

-----------------
TOTAL AMOUNT: ₹${order.totalAmount.toFixed(2)}
PAYMENT: ${order.paymentStatus.toUpperCase()}
-----------------

Thank you for shopping with E-Grocery!
        `;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `E-Grocery_Order_${order.id.slice(0, 8)}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    };

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="animate-spin w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
        </div>
    );

    if (orders.length === 0) return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-50 rounded-full flex items-center justify-center">
                    <FiShoppingBag className="text-4xl text-gray-300" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">No Orders Yet</h2>
                <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
                <Link to="/" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200">
                    Shop Now
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
                <div className="space-y-4">
                    {orders.map(order => {
                        const StatusIcon = statusIcons[order.orderStatus] || FiPackage;
                        const date = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent';
                        return (
                            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                                {/* Order Header */}
                                <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-b border-gray-50 bg-gray-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                            <StatusIcon className="text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Order ID</p>
                                            <p className="font-mono text-sm font-semibold text-gray-700">{order.id.slice(0, 12)}...</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-gray-400">{date}</span>
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${statusColors[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                                            {order.orderStatus}
                                        </span>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="p-4 sm:p-5">
                                    <div className="flex flex-wrap gap-3 mb-4">
                                        {order.items?.map((item, i) => (
                                            <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                                                <img src={item.imageURL} alt={item.name} className="w-8 h-8 rounded object-cover"
                                                    onError={e => { e.target.src = 'https://via.placeholder.com/50'; }} />
                                                <div>
                                                    <p className="text-xs font-medium text-gray-800 truncate max-w-[120px]">{item.name}</p>
                                                    <p className="text-[10px] text-gray-400">×{item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Order Timeline */}
                                    <div className="flex items-center gap-1 mb-4">
                                        {['placed', 'packed', 'shipped', 'delivered'].map((step, i) => {
                                            const steps = ['placed', 'packed', 'shipped', 'delivered'];
                                            const currentIdx = steps.indexOf(order.orderStatus);
                                            const isActive = i <= currentIdx;
                                            const isCancelled = order.orderStatus === 'cancelled';
                                            return (
                                                <div key={step} className="flex items-center flex-1">
                                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isCancelled ? 'bg-red-100 text-red-500' :
                                                        isActive ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                                                        }`}>
                                                        {isActive && !isCancelled ? '✓' : i + 1}
                                                    </div>
                                                    {i < 3 && <div className={`flex-1 h-0.5 mx-1 ${isActive && i < currentIdx ? 'bg-green-300' : 'bg-gray-100'}`}></div>}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <p className="text-xs text-gray-400">
                                                Payment: <span className={order.paymentStatus === 'success' ? 'text-green-600' : 'text-orange-500'}>
                                                    {order.paymentStatus === 'success' ? 'Paid' : 'Pending'}
                                                </span>
                                            </p>
                                            <button
                                                onClick={() => downloadBill(order)}
                                                className="text-xs text-blue-600 font-semibold hover:underline"
                                            >
                                                Download Bill
                                            </button>
                                        </div>
                                        <p className="font-bold text-gray-900">₹{order.totalAmount?.toFixed(2) || '0.00'}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Orders;
