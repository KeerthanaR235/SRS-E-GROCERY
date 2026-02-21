// Admin Dashboard - Main admin page with stats, low stock alerts, orders, and analytics
import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import { subscribeToProducts, addProduct, updateProduct, deleteProduct } from '../services/productService';
import { subscribeToAllOrders, updateOrderStatus } from '../services/orderService';
import toast from 'react-hot-toast';
import { FiMenu, FiPackage, FiShoppingBag, FiAlertTriangle, FiDollarSign, FiPlus, FiEdit2, FiTrash2, FiTrendingUp } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// ---- Dashboard Overview ----
const DashboardOverview = ({ products, orders }) => {
    const totalRevenue = orders.filter(o => o.paymentStatus === 'success').reduce((s, o) => s + (o.totalAmount || 0), 0);
    const totalStockValue = products.reduce((s, p) => s + (p.price * p.stock), 0);
    const lowStockCount = products.filter(p => p.stock <= (p.lowStockThreshold || 10)).length;
    const outOfStock = products.filter(p => p.stock <= 0).length;

    const stats = [
        { label: 'Total Products', value: products.length, icon: FiPackage, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
        { label: 'Total Orders', value: orders.length, icon: FiShoppingBag, color: 'from-green-500 to-green-600', bg: 'bg-green-50' },
        { label: 'Revenue', value: `₹${totalRevenue.toFixed(0)}`, icon: FiDollarSign, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50' },
        { label: 'Low Stock Items', value: lowStockCount, icon: FiAlertTriangle, color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50' },
    ];

    // Category distribution for pie chart
    const categoryData = products.reduce((acc, p) => {
        const cat = p.category || 'Other';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {});
    const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

    // Monthly revenue (simplified)
    const monthlyData = [
        { month: 'Jan', revenue: Math.round(totalRevenue * 0.6) },
        { month: 'Feb', revenue: Math.round(totalRevenue * 0.8) },
        { month: 'Mar', revenue: Math.round(totalRevenue * 1.0) },
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}>
                                    <Icon className="text-lg" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                            <p className="text-sm text-gray-500">{s.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-2xl border p-5">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><FiTrendingUp className="text-blue-600" /> Revenue Overview</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-2xl border p-5">
                    <h3 className="font-bold text-gray-800 mb-4">Products by Category</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl border p-5">
                <h3 className="font-bold text-gray-800 mb-4">Recent Orders</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr className="text-left text-gray-500 border-b">
                            <th className="pb-3 font-medium">Order ID</th><th className="pb-3 font-medium">Items</th>
                            <th className="pb-3 font-medium">Amount</th><th className="pb-3 font-medium">Status</th>
                        </tr></thead>
                        <tbody>
                            {orders.slice(0, 5).map(order => (
                                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="py-3 font-mono text-xs">{order.id.slice(0, 10)}...</td>
                                    <td className="py-3">{order.items?.length || 0} items</td>
                                    <td className="py-3 font-semibold">₹{order.totalAmount?.toFixed(0) || 0}</td>
                                    <td className="py-3">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                                            order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                            }`}>{order.orderStatus}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Inventory Info */}
            <div className="mt-6 bg-white rounded-2xl border p-5">
                <h3 className="font-bold text-gray-800 mb-2">Inventory Summary</h3>
                <div className="grid sm:grid-cols-3 gap-4 mt-4">
                    <div className="bg-blue-50 rounded-xl p-4"><p className="text-sm text-blue-600">Total Stock Value</p><p className="text-xl font-bold text-blue-800">₹{totalStockValue.toFixed(0)}</p></div>
                    <div className="bg-orange-50 rounded-xl p-4"><p className="text-sm text-orange-600">Low Stock Items</p><p className="text-xl font-bold text-orange-800">{lowStockCount}</p></div>
                    <div className="bg-red-50 rounded-xl p-4"><p className="text-sm text-red-600">Out of Stock</p><p className="text-xl font-bold text-red-800">{outOfStock}</p></div>
                </div>
            </div>
        </div>
    );
};

// ---- Products Management ----
const ProductsManagement = ({ products }) => {
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({});
    const [deleting, setDeleting] = useState(null);

    const handleEdit = (product) => { setEditId(product.id); setEditData({ ...product }); };
    const handleSave = async () => {
        try {
            await updateProduct(editId, editData);
            toast.success('Product updated!');
            setEditId(null);
        } catch { toast.error('Update failed'); }
    };
    const handleDelete = async (id) => {
        if (deleting === id) {
            try { await deleteProduct(id); toast.success('Product deleted'); } catch { toast.error('Delete failed'); }
            setDeleting(null);
        } else { setDeleting(id); setTimeout(() => setDeleting(null), 3000); }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Products</h2>
            <div className="bg-white rounded-2xl border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr className="text-left text-gray-500 bg-gray-50 border-b">
                            <th className="p-4 font-medium">Product</th><th className="p-4 font-medium">Category</th>
                            <th className="p-4 font-medium">Price</th><th className="p-4 font-medium">Stock</th>
                            <th className="p-4 font-medium">Status</th><th className="p-4 font-medium">Actions</th>
                        </tr></thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <img src={p.imageURL} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                                                onError={e => { e.target.src = 'https://via.placeholder.com/40'; }} />
                                            <span className="font-medium text-gray-800 max-w-[150px] truncate">{p.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600">{p.category}</td>
                                    <td className="p-4">
                                        {editId === p.id ? (
                                            <input type="number" value={editData.price} onChange={e => setEditData({ ...editData, price: e.target.value })}
                                                className="w-20 px-2 py-1 border rounded-lg text-sm" />
                                        ) : <span className="font-semibold">₹{p.price}</span>}
                                    </td>
                                    <td className="p-4">
                                        {editId === p.id ? (
                                            <input type="number" value={editData.stock} onChange={e => setEditData({ ...editData, stock: e.target.value })}
                                                className="w-20 px-2 py-1 border rounded-lg text-sm" />
                                        ) : <span className={p.stock <= 0 ? 'text-red-600 font-bold' : p.stock <= (p.lowStockThreshold || 10) ? 'text-orange-600 font-bold' : ''}>{p.stock}</span>}
                                    </td>
                                    <td className="p-4">
                                        {p.stock <= 0 ? <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Out of Stock</span>
                                            : p.stock <= (p.lowStockThreshold || 10) ? <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">Low Stock</span>
                                                : <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">In Stock</span>}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            {editId === p.id ? (
                                                <>
                                                    <button onClick={handleSave} className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600">Save</button>
                                                    <button onClick={() => setEditId(null)} className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300">Cancel</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleEdit(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><FiEdit2 /></button>
                                                    <button onClick={() => handleDelete(p.id)} className={`p-1.5 rounded-lg ${deleting === p.id ? 'text-white bg-red-500' : 'text-red-500 hover:bg-red-50'}`}><FiTrash2 /></button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ---- Add Product ----
const AddProduct = () => {
    const [form, setForm] = useState({ name: '', category: 'Vegetables', price: '', discount: '0', stock: '', description: '', rating: '4', imageURL: '', lowStockThreshold: '10' });
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.price || !form.stock) { toast.error('Fill required fields'); return; }
        setLoading(true);
        try {
            await addProduct(form, imageFile);
            toast.success('Product added!');
            setForm({ name: '', category: 'Vegetables', price: '', discount: '0', stock: '', description: '', rating: '4', imageURL: '', lowStockThreshold: '10' });
            setImageFile(null);
        } catch { toast.error('Failed to add product'); }
        setLoading(false);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h2>
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border p-6 max-w-2xl">
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                            {['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Beverages', 'Household', 'Snacks'].map(c => <option key={c}>{c}</option>)}
                        </select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                        <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                        <input type="number" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                        <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                        <input type="number" step="0.1" max="5" value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
                        <input type="number" value={form.lowStockThreshold} onChange={e => setForm({ ...form, lowStockThreshold: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" /></div>
                    <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Image URL (or upload)</label>
                        <input value={form.imageURL} onChange={e => setForm({ ...form, imageURL: e.target.value })} placeholder="https://..." className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none mb-2" />
                        <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="text-sm text-gray-500" /></div>
                    <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" /></div>
                </div>
                <button type="submit" disabled={loading} className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 disabled:opacity-50">
                    {loading ? 'Adding...' : 'Add Product'}
                </button>
            </form>
        </div>
    );
};

// ---- Orders Management ----
const OrdersManagement = ({ orders }) => {
    const handleStatusChange = async (orderId, newStatus) => {
        try { await updateOrderStatus(orderId, newStatus); toast.success('Status updated'); }
        catch { toast.error('Failed to update'); }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Orders</h2>
            <div className="space-y-4">
                {orders.map(order => {
                    const date = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-IN') : 'Recent';
                    return (
                        <div key={order.id} className="bg-white rounded-2xl border p-5">
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                                <div><p className="font-mono text-xs text-gray-400">{order.id}</p><p className="text-xs text-gray-400">{date}</p></div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-gray-900">₹{order.totalAmount?.toFixed(0) || 0}</span>
                                    <select value={order.orderStatus} onChange={e => handleStatusChange(order.id, e.target.value)}
                                        className="px-3 py-1.5 text-xs font-semibold border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                        {['placed', 'packed', 'shipped', 'delivered', 'cancelled'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {order.items?.map((item, i) => (
                                    <span key={i} className="text-xs bg-gray-50 px-2 py-1 rounded-lg">{item.name} ×{item.quantity}</span>
                                ))}
                            </div>
                        </div>
                    );
                })}
                {orders.length === 0 && <p className="text-center text-gray-400 py-10">No orders yet</p>}
            </div>
        </div>
    );
};

// ---- Low Stock Alerts ----
const LowStockAlerts = ({ products }) => {
    const lowStock = products.filter(p => p.stock <= (p.lowStockThreshold || 10));
    const [updating, setUpdating] = useState({});

    const handleStockUpdate = async (productId, newStock) => {
        try {
            await updateProduct(productId, { stock: Number(newStock) });
            toast.success('Stock updated!');
            setUpdating(prev => ({ ...prev, [productId]: undefined }));
        } catch { toast.error('Update failed'); }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Low Stock Alerts</h2>
            <p className="text-gray-500 mb-6">{lowStock.length} items need attention</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {lowStock.map(p => (
                    <div key={p.id} className={`bg-white rounded-2xl border p-5 ${p.stock <= 0 ? 'border-red-200 bg-red-50/30' : 'border-orange-200 bg-orange-50/30'}`}>
                        <div className="flex items-center gap-3 mb-3">
                            <img src={p.imageURL} alt={p.name} className="w-12 h-12 rounded-xl object-cover" onError={e => { e.target.src = 'https://via.placeholder.com/50'; }} />
                            <div><p className="font-semibold text-gray-800 text-sm">{p.name}</p><p className="text-xs text-gray-400">{p.category}</p></div>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-gray-500">Current Stock:</span>
                            <span className={`font-bold ${p.stock <= 0 ? 'text-red-600' : 'text-orange-600'}`}>{p.stock}</span>
                        </div>
                        <div className="flex gap-2">
                            <input type="number" placeholder="New stock" value={updating[p.id] || ''} onChange={e => setUpdating(prev => ({ ...prev, [p.id]: e.target.value }))}
                                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            <button onClick={() => handleStockUpdate(p.id, updating[p.id])} disabled={!updating[p.id]}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-30">Update</button>
                        </div>
                    </div>
                ))}
                {lowStock.length === 0 && <p className="text-gray-400 col-span-full text-center py-10">All products have sufficient stock ✅</p>}
            </div>
        </div>
    );
};

// ---- Analytics ----
const Analytics = ({ products, orders }) => {
    const totalRevenue = orders.filter(o => o.paymentStatus === 'success').reduce((s, o) => s + (o.totalAmount || 0), 0);
    const totalStockValue = products.reduce((s, p) => s + (p.price * p.stock), 0);

    // Best selling
    const salesMap = {};
    orders.forEach(o => o.items?.forEach(item => { salesMap[item.name] = (salesMap[item.name] || 0) + item.quantity; }));
    const bestSelling = Object.entries(salesMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, qty]) => ({ name, qty }));

    const downloadSalesReport = () => {
        const headers = ['Order ID', 'Date', 'Customer ID', 'Items Count', 'Total Amount', 'Status', 'Payment'];
        const rows = orders.map(o => [
            o.id,
            o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString() : 'N/A',
            o.userId,
            o.items?.length || 0,
            o.totalAmount.toFixed(2),
            o.orderStatus,
            o.paymentStatus
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `E-Grocery_Sales_Report_${new Date().toLocaleDateString()}.csv`;
        link.click();
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
                <button
                    onClick={downloadSalesReport}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 shadow-sm"
                >
                    Download CSV Report
                </button>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white"><p className="text-blue-100 text-sm">Total Revenue</p><p className="text-3xl font-bold">₹{totalRevenue.toFixed(0)}</p></div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white"><p className="text-green-100 text-sm">Total Stock Value</p><p className="text-3xl font-bold">₹{totalStockValue.toFixed(0)}</p></div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white"><p className="text-purple-100 text-sm">Avg Order Value</p><p className="text-3xl font-bold">₹{orders.length > 0 ? (totalRevenue / orders.length).toFixed(0) : '0'}</p></div>
            </div>
            <div className="bg-white rounded-2xl border p-5">
                <h3 className="font-bold text-gray-800 mb-4">Best Selling Products</h3>
                {bestSelling.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={bestSelling} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="qty" fill="#8b5cf6" radius={[0, 8, 8, 0]} name="Units Sold" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : <p className="text-gray-400 text-center py-10">No sales data yet</p>}
            </div>
        </div>
    );
};

// ---- Store Maintenance ----
const StoreMaintenance = () => {
    const [loading, setLoading] = useState(false);

    const handleSeed = async () => {
        setLoading(true);
        try {
            await seedProducts();
            toast.success('Sample products seeded!');
        } catch (error) {
            toast.error('Seeding failed');
        }
        setLoading(false);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Store Maintenance</h2>
            <div className="bg-white rounded-2xl border p-6 max-w-xl">
                <h3 className="font-bold text-gray-800 mb-2">Sample Data Seeding</h3>
                <p className="text-sm text-gray-500 mb-6"> Populate the store with sample products for testing. This will only add products if the store is currently empty.</p>
                <button
                    onClick={handleSeed}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Seeding...' : 'Seed Sample Products'}
                </button>
            </div>
        </div>
    );
};

// ---- Main Admin Dashboard ----
const AdminDashboard = () => {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const unsub1 = subscribeToProducts(setProducts);
        const unsub2 = subscribeToAllOrders(setOrders);
        return () => { unsub1(); unsub2(); };
    }, []);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex-1 min-w-0">
                {/* Top Bar */}
                <div className="bg-white border-b px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"><FiMenu /></button>
                        <h1 className="font-bold text-gray-800">Admin Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                            {user?.displayName?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.displayName || 'Admin'}</span>
                    </div>
                </div>
                {/* Content */}
                <div className="p-4 sm:p-6 lg:p-8">
                    <Routes>
                        <Route index element={<DashboardOverview products={products} orders={orders} />} />
                        <Route path="products" element={<ProductsManagement products={products} />} />
                        <Route path="add-product" element={<AddProduct />} />
                        <Route path="orders" element={<OrdersManagement orders={orders} />} />
                        <Route path="low-stock" element={<LowStockAlerts products={products} />} />
                        <Route path="analytics" element={<Analytics products={products} orders={orders} />} />
                        <Route path="maintenance" element={<StoreMaintenance />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
