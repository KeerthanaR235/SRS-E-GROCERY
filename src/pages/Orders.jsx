// Orders Page - User's order history
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserOrders, updateOrderStatus } from '../services/orderService';
import { restockItems } from '../services/productService';
import { Link } from 'react-router-dom';
import { FiPackage, FiClock, FiCheckCircle, FiTruck, FiShoppingBag, FiXCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const statusColors = {
    placed: 'bg-blue-100 text-blue-700',
    packed: 'bg-yellow-100 text-yellow-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700'
};

const statusIcons = { placed: FiClock, packed: FiPackage, delivered: FiCheckCircle, cancelled: FiXCircle };

const Orders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);

    useEffect(() => {
        if (!user) return;
        const unsubscribe = getUserOrders(user.uid, (data) => {
            setOrders(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    const handleCancelOrder = async (order) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;

        setCancellingId(order.id);
        try {
            // Update status to cancelled
            await updateOrderStatus(order.id, 'cancelled');

            // Return stock back to inventory
            if (order.items && order.items.length > 0) {
                await restockItems(order.items);
            }

            toast.success('Order cancelled successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to cancel order');
        } finally {
            setCancellingId(null);
        }
    };

    const downloadBill = (order) => {
        const doc = new jsPDF("p", "mm", "a4");
        const date = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');
        const customer = order.customerInfo || { name: user.displayName || 'Customer', phone: '9840XXXXXX', email: user.email };
        const invoiceNo = `${order.id.slice(0, 10).toUpperCase()}`;

        // 1. Blue Header Section
        doc.setFillColor(190, 215, 235); // Light Blue Background
        doc.rect(0, 0, 210, 65, 'F');

        // Shop Details (Left)
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.setFont("helvetica", "normal");
        const shopDetails = [
            "Sri Ranga Supermarket",
            "C57, 4th Cross Street,",
            "Thillai Nagar, Trichy",
            "Tel: +91 8056644344",
            "Email: rengafoods19@gmail.com"
        ];
        shopDetails.forEach((line, i) => {
            doc.text(line, 55, 25 + (i * 5));
        });

        // "RECEIPT" text (Right)
        doc.setFontSize(35);
        doc.setTextColor(45, 84, 127); // Dark Blue
        doc.setFont("helvetica", "bold");
        doc.text("RECEIPT", 140, 42);

        // 2. Customer & Invoice Info
        doc.setTextColor(0, 0, 0);

        // Left Column
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(customer.name.toUpperCase(), 15, 80);
        doc.setFont("helvetica", "normal");
        doc.text(customer.phone, 15, 86);
        doc.text(customer.email || '', 15, 92);

        // Right Column
        doc.setFont("helvetica", "bold");
        doc.text("Order Date:", 115, 80);
        doc.setFont("helvetica", "normal");
        doc.text(date, 150, 80);

        // 4. Horizontal Separator with Customer ID
        doc.setDrawColor(220, 220, 220);
        doc.line(15, 105, 195, 105);
        doc.setFontSize(9);
        doc.text(`Customer ID : ${user.uid.slice(0, 12).toUpperCase()} | Order ID: ${order.id.slice(0, 12).toUpperCase()}`, 105, 112, { align: 'center' });
        doc.line(15, 118, 195, 118);

        // 5. Items Table
        const tableColumn = ["#", "ITEM DESCRIPTION", "QUANTITY", "UNIT PRICE", "GST (5%)", "AMOUNT ( INR )"];
        const tableRows = order.items.map((item, index) => {
            const unitPrice = item.price;
            const gstAmount = unitPrice * item.quantity * 0.05;
            const subtotal = (unitPrice * item.quantity) + gstAmount;
            return [
                index + 1,
                item.name.toUpperCase(),
                item.quantity,
                unitPrice.toFixed(2),
                gstAmount.toFixed(2),
                subtotal.toFixed(2)
            ];
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 125,
            theme: 'plain',
            headStyles: {
                fillColor: [190, 215, 235],
                textColor: [45, 84, 127],
                fontSize: 9,
                fontStyle: 'bold',
                halign: 'center'
            },
            bodyStyles: {
                fontSize: 9,
                halign: 'center'
            },
            columnStyles: {
                1: { halign: 'left' }
            },
            margin: { left: 15, right: 15 }
        });

        const finalY = doc.lastAutoTable.finalY;

        // 6. Net Total
        doc.setFillColor(45, 84, 127);
        doc.rect(120, finalY + 5, 75, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text("Net Total", 125, finalY + 11.5);
        doc.text(`${order.totalAmount.toFixed(2)}`, 190, finalY + 11.5, { align: 'right' });

        // 7. Footer
        doc.setFillColor(190, 215, 235);
        doc.rect(15, finalY + 30, 180, 12, 'F');
        doc.setTextColor(80, 80, 80);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text("Thanks for shopping in Sri Ranga SuperMarket!!Order again!!", 105, finalY + 37.5, { align: 'center' });

        doc.save(`SRS_Order_${order.id.slice(0, 8)}.pdf`);
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
                        const canCancel = order.orderStatus === 'placed';

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

                                {/* Order Items & Tracking */}
                                <div className="p-4 sm:p-5">
                                    <div className="flex flex-wrap gap-3 mb-6">
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
                                    {order.orderStatus !== 'cancelled' && (
                                        <div className="mb-6 px-2">
                                            <div className="relative flex justify-between items-center">
                                                {/* Progress Bars */}
                                                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
                                                <div
                                                    className="absolute top-1/2 left-0 h-0.5 bg-blue-500 -translate-y-1/2 transition-all duration-500 z-0"
                                                    style={{
                                                        width: order.orderStatus === 'placed' ? '0%' :
                                                            order.orderStatus === 'packed' ? '50%' : '100%'
                                                    }}
                                                ></div>

                                                {[
                                                    { id: 'placed', label: 'Placed', icon: FiClock },
                                                    { id: 'packed', label: 'Packed', icon: FiPackage },
                                                    { id: 'delivered', label: 'Delivered', icon: FiCheckCircle }
                                                ].map((step, index) => {
                                                    const isCompleted = index <= ['placed', 'packed', 'delivered'].indexOf(order.orderStatus);
                                                    const isActive = order.orderStatus === step.id;
                                                    const StepIcon = step.icon;

                                                    return (
                                                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-blue-600 text-white scale-110 shadow-lg' :
                                                                isCompleted ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'
                                                                }`}>
                                                                <StepIcon className="text-sm" />
                                                            </div>
                                                            <span className={`text-[10px] mt-1.5 font-bold uppercase tracking-wider ${isActive ? 'text-blue-600' :
                                                                isCompleted ? 'text-gray-700' : 'text-gray-400'
                                                                }`}>
                                                                {step.label}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-50 pt-4">
                                        <div className="flex items-center gap-4">
                                            <p className="text-xs text-gray-400">
                                                Payment: <span className={order.paymentStatus === 'success' ? 'text-green-600' : 'text-orange-500'}>
                                                    {(order.paymentMethod === 'cod' || order.paymentId?.startsWith('cod_')) ? 'Cash on Delivery' : order.paymentStatus === 'success' ? 'Paid' : 'Pending'}
                                                </span>
                                            </p>
                                            {(order.orderStatus === 'packed' || order.orderStatus === 'delivered') && (
                                                <button
                                                    onClick={() => downloadBill(order)}
                                                    className="text-xs text-blue-600 font-semibold hover:underline"
                                                >
                                                    Download Bill
                                                </button>
                                            )}
                                            {canCancel && (
                                                <button
                                                    onClick={() => handleCancelOrder(order)}
                                                    disabled={cancellingId === order.id}
                                                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${cancellingId === order.id
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100'
                                                        }`}
                                                >
                                                    {cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}
                                                </button>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total Amount</p>
                                            <p className="font-bold text-gray-900 text-lg">₹{order.totalAmount?.toFixed(2) || '0.00'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div >
    );
};

export default Orders;
