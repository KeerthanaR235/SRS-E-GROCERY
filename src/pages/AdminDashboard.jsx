// Admin Dashboard - Green themed admin page matching UI design
import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import { subscribeToProducts, addProduct, updateProduct, deleteProduct } from '../services/productService';
import { subscribeToAllOrders, updateOrderStatus } from '../services/orderService';
import toast from 'react-hot-toast';
import { FiMenu, FiPackage, FiShoppingBag, FiDollarSign, FiPlus, FiEdit2, FiTrash2, FiTrendingUp, FiSearch, FiUser, FiSettings } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// ---- Dashboard Overview ----
const DashboardOverview = ({ products, orders }) => {
    const totalRevenue = orders.filter(o => o.paymentStatus === 'success').reduce((s, o) => s + (o.totalAmount || 0), 0);
    const pendingOrders = orders.filter(o => o.orderStatus === 'placed').length;

    const stats = [
        { label: 'Total Products', value: products.length, color: '#1565c0', bg: '#e3f2fd', icon: '📦' },
        { label: 'Pending Orders', value: pendingOrders, color: '#e65100', bg: '#fff3e0', icon: '⏳' },
        { label: 'Total Sales', value: `$${(totalRevenue / 75).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, color: '#c62828', bg: '#ffebee', icon: '💰' },
    ];

    // Order overview chart data
    const orderData = [
        { name: 'Week 1', Pending: Math.max(1, Math.floor(pendingOrders * 0.3)), Packed: Math.max(1, Math.floor(orders.length * 0.2)), Delivered: Math.max(1, Math.floor(orders.length * 0.5)) },
        { name: 'Week 2', Pending: Math.max(2, Math.floor(pendingOrders * 0.5)), Packed: Math.max(2, Math.floor(orders.length * 0.3)), Delivered: Math.max(2, Math.floor(orders.length * 0.6)) },
        { name: 'Week 3', Pending: Math.max(1, Math.floor(pendingOrders * 0.7)), Packed: Math.max(3, Math.floor(orders.length * 0.4)), Delivered: Math.max(4, Math.floor(orders.length * 0.7)) },
        { name: 'Week 4', Pending: Math.max(3, pendingOrders), Packed: Math.max(2, Math.floor(orders.length * 0.3)), Delivered: Math.max(5, Math.floor(orders.length * 0.8)) },
    ];

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Welcome, Admin!</h2>
            <p className="text-sm text-gray-500 mb-5">Here's what's happening with your store</p>

            {/* Stats Cards */}
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
                {stats.map((s, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
                        <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                        <div className="flex items-center justify-between">
                            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: s.bg }}>
                                {s.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Order Overview Chart */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FiTrendingUp className="text-[#2e7d32]" /> Order Overview
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={orderData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="Pending" stroke="#ff9800" strokeWidth={2} dot={{ fill: '#ff9800', r: 4 }} />
                        <Line type="monotone" dataKey="Packed" stroke="#2196f3" strokeWidth={2} dot={{ fill: '#2196f3', r: 4 }} />
                        <Line type="monotone" dataKey="Delivered" stroke="#4caf50" strokeWidth={2} dot={{ fill: '#4caf50', r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-bold text-gray-800 mb-4">Recent Orders</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 border-b border-gray-100">
                                <th className="pb-3 font-medium text-xs">Order ID</th>
                                <th className="pb-3 font-medium text-xs">Customer</th>
                                <th className="pb-3 font-medium text-xs">Amount</th>
                                <th className="pb-3 font-medium text-xs">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.slice(0, 5).map(order => (
                                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="py-3 font-mono text-xs text-gray-600">{order.id.slice(0, 10)}...</td>
                                    <td className="py-3 text-xs text-gray-600">{order.userId?.slice(0, 8) || 'Customer'}</td>
                                    <td className="py-3 font-semibold text-xs">₹{order.totalAmount?.toFixed(0) || 0}</td>
                                    <td className="py-3">
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                                            order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-orange-100 text-orange-700'
                                            }`}>{order.orderStatus}</span>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr><td colSpan="4" className="py-6 text-center text-gray-400 text-xs">No orders yet</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ---- Products Management ----
const ProductsManagement = ({ products }) => {
    const navigate = useNavigate();
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({});
    const [deleting, setDeleting] = useState(null);

    const handleEdit = (product) => {
        setEditId(product.id);
        setEditData({
            ...product,
            brands: product.brands && product.brands.length > 0
                ? product.brands.map(b => ({ ...b, variants: b.variants.map(v => ({ ...v })) }))
                : [{ name: product.brand || '', variants: [{ quantity: product.quantity || '', price: product.price || '', stock: product.stock || '' }] }]
        });
    };

    const handleEditVariantChange = (brandIndex, varIndex, field, value) => {
        const newBrands = [...editData.brands];
        newBrands[brandIndex].variants[varIndex][field] = value;
        const firstVariant = newBrands[0].variants[0];
        setEditData({ ...editData, brands: newBrands, price: Number(firstVariant.price), stock: Number(firstVariant.stock) });
    };

    const handleEditBrandNameChange = (brandIndex, value) => {
        const newBrands = [...editData.brands];
        newBrands[brandIndex].name = value;
        setEditData({ ...editData, brands: newBrands });
    };

    const handleSave = async () => {
        try {
            const firstBrand = editData.brands[0];
            const firstVariant = firstBrand.variants[0];
            const saveData = {
                ...editData,
                price: Number(firstVariant.price),
                stock: Number(firstVariant.stock),
                brand: firstBrand.name,
                quantity: firstVariant.quantity
            };
            await updateProduct(editId, saveData);
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
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-800">Manage Products</h2>
                <button
                    onClick={() => navigate('/admin/add-product')}
                    className="px-4 py-2 bg-[#2e7d32] text-white font-semibold rounded-lg hover:bg-[#1b5e20] shadow-md transition-all flex items-center gap-2 text-sm"
                >
                    <FiPlus /> Add Product
                </button>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 bg-gray-50 border-b border-gray-100">
                                <th className="p-3 font-medium text-xs">Product Name</th>
                                <th className="p-3 font-medium text-xs">Category</th>
                                <th className="p-3 font-medium text-xs">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                    <td className="p-3">
                                        <div className="flex items-center gap-2.5">
                                            <img src={p.imageURL} alt={p.name} className="w-9 h-9 rounded-lg object-cover bg-gray-100"
                                                onError={e => { e.target.src = 'https://via.placeholder.com/40'; }} />
                                            <span className="font-medium text-gray-800 text-xs max-w-[120px] truncate">{p.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-3 text-gray-600 text-xs">{p.category}</td>
                                    <td className="p-3">
                                        <div className="flex gap-1.5">
                                            <button onClick={() => handleEdit(p)} className="px-2.5 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded hover:bg-blue-200">Edit</button>
                                            <button onClick={() => handleDelete(p.id)} className={`px-2.5 py-1 text-[10px] font-bold rounded ${deleting === p.id ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                                                {deleting === p.id ? 'Confirm?' : 'Delete'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Product Modal */}
            {editId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
                        <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
                            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                <FiEdit2 className="text-blue-600" /> Edit Product
                            </h3>
                            <button onClick={() => setEditId(null)} className="text-gray-400 hover:text-gray-600 text-lg font-bold">&times;</button>
                        </div>
                        <div className="p-5 space-y-5">
                            {/* Product Name */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block">Product Name</label>
                                <input type="text" value={editData.name || ''} onChange={e => setEditData({ ...editData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none" />
                            </div>

                            {/* Brands & Variants */}
                            {editData.brands?.map((brand, bIdx) => (
                                <div key={bIdx} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">Brand Name</label>
                                    <input type="text" value={brand.name} onChange={e => handleEditBrandNameChange(bIdx, e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-3 focus:ring-2 focus:ring-green-500 focus:outline-none" placeholder="Brand name" />

                                    {brand.variants.map((v, vIdx) => (
                                        <div key={vIdx} className="flex gap-2 mb-2">
                                            <div className="flex-1">
                                                <label className="text-[10px] font-bold text-gray-400 block mb-0.5">Quantity</label>
                                                <input type="text" value={v.quantity} onChange={e => handleEditVariantChange(bIdx, vIdx, 'quantity', e.target.value)}
                                                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-green-500 focus:outline-none" placeholder="e.g. 500g" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-[10px] font-bold text-gray-400 block mb-0.5">Price (₹)</label>
                                                <input type="number" value={v.price} onChange={e => handleEditVariantChange(bIdx, vIdx, 'price', e.target.value)}
                                                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-green-500 focus:outline-none" placeholder="Price" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-[10px] font-bold text-gray-400 block mb-0.5">Stock</label>
                                                <input type="number" value={v.stock} onChange={e => handleEditVariantChange(bIdx, vIdx, 'stock', e.target.value)}
                                                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-green-500 focus:outline-none" placeholder="Stock" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-gray-100 flex gap-2 justify-end sticky bottom-0 bg-white">
                            <button onClick={() => setEditId(null)} className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200">Cancel</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-[#2e7d32] text-white text-xs font-bold rounded-lg hover:bg-[#1b5e20]">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ---- Add Product ----
const AddProduct = () => {
    const [form, setForm] = useState({
        name: '',
        category: 'Vegetables',
        imageURL: '',
        brands: [
            {
                name: '',
                variants: [{ quantity: '', price: '', stock: '' }]
            }
        ]
    });
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleAddBrand = () => {
        setForm({
            ...form,
            brands: [...form.brands, { name: '', variants: [{ quantity: '', price: '', stock: '' }] }]
        });
    };

    const handleRemoveBrand = (index) => {
        if (form.brands.length > 1) {
            const newBrands = [...form.brands];
            newBrands.splice(index, 1);
            setForm({ ...form, brands: newBrands });
        }
    };

    const handleAddVariant = (brandIndex) => {
        const newBrands = [...form.brands];
        newBrands[brandIndex].variants.push({ quantity: '', price: '', stock: '' });
        setForm({ ...form, brands: newBrands });
    };

    const handleRemoveVariant = (brandIndex, varIndex) => {
        if (form.brands[brandIndex].variants.length > 1) {
            const newBrands = [...form.brands];
            newBrands[brandIndex].variants.splice(varIndex, 1);
            setForm({ ...form, brands: newBrands });
        }
    };

    const handleBrandChange = (index, field, value) => {
        const newBrands = [...form.brands];
        newBrands[index][field] = value;
        setForm({ ...form, brands: newBrands });
    };

    const handleVariantChange = (brandIndex, varIndex, field, value) => {
        const newBrands = [...form.brands];
        newBrands[brandIndex].variants[varIndex][field] = value;
        setForm({ ...form, brands: newBrands });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.brands[0].variants[0].price) {
            toast.error('Please enter product name and at least one price');
            return;
        }
        setLoading(true);
        try {
            // For backward compatibility with existing components, we'll store the first variant's price/stock at top level too
            const firstBrand = form.brands[0];
            const firstVariant = firstBrand.variants[0];

            const submitData = {
                ...form,
                price: Number(firstVariant.price),
                stock: Number(firstVariant.stock),
                brand: firstBrand.name,
                quantity: firstVariant.quantity
            };

            await addProduct(submitData, imageFile);
            toast.success('Product added successfully!');
            // Reset form
            setForm({
                name: '', category: 'Vegetables', imageURL: '',
                brands: [{ name: '', variants: [{ quantity: '', price: '', stock: '' }] }]
            });
            setImageFile(null);
        } catch (error) {
            console.error(error);
            toast.error('Failed to add product');
        }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto py-4">
            <div className="bg-[#fbfcff] rounded-3xl border border-gray-100 shadow-xl overflow-hidden animate-fadeIn">
                <div className="p-8">
                    <h2 className="text-2xl font-black text-[#1a202c] mb-8">Add New Product</h2>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Info Section */}
                        <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-bold text-gray-500 ml-1">Product Name</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-[#f3f6f9] border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-green-500 transition-all outline-none"
                                    placeholder="Enter product name"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-bold text-gray-500 ml-1">Category</label>
                                <select
                                    value={form.category}
                                    onChange={e => setForm({ ...form, category: e.target.value })}
                                    className="w-full px-4 py-3 bg-[#f3f6f9] border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-green-500 transition-all outline-none appearance-none"
                                >
                                    {['Vegetables', 'Dairy', 'Grains', 'Beverages', 'Household', 'Snacks', 'Leafy Greens', 'Chocolates', 'Biscuits'].map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Brands & Pricing Section */}
                        <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-[15px] font-black text-[#1a202c]">Brands & Pricing</h3>
                                <button
                                    type="button"
                                    onClick={handleAddBrand}
                                    className="px-4 py-2 bg-[#1e88e5] text-white text-xs font-bold rounded-lg hover:bg-[#1565c0] shadow-md transition-all flex items-center gap-2"
                                >
                                    <FiPlus /> Add Brand
                                </button>
                            </div>

                            <div className="space-y-8">
                                {form.brands.map((brand, brandIdx) => (
                                    <div key={brandIdx} className="relative group/brand border border-gray-50 rounded-2xl p-4 bg-white hover:border-gray-200 transition-all">
                                        <div className="flex gap-4 items-start">
                                            <div className="w-8 h-8 rounded-lg bg-[#2e7d32] flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                {brandIdx + 1}
                                            </div>
                                            <div className="flex-1 space-y-6">
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={brand.name}
                                                        onChange={e => handleBrandChange(brandIdx, 'name', e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-[#f8fafb] border-none rounded-lg text-sm font-bold focus:ring-1 focus:ring-blue-500 outline-none"
                                                        placeholder="Brand name (e.g. Amul)"
                                                    />
                                                    {form.brands.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveBrand(brandIdx)}
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-300 hover:text-red-500"
                                                        >
                                                            <FiTrash2 className="text-sm" />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Variants Grid */}
                                                <div className="space-y-4">
                                                    {brand.variants.map((variant, varIdx) => (
                                                        <div key={varIdx} className="grid grid-cols-3 gap-4 items-end relative group/variant">
                                                            <div className="space-y-1.5">
                                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Quantity</label>
                                                                <input
                                                                    type="text"
                                                                    value={variant.quantity}
                                                                    onChange={e => handleVariantChange(brandIdx, varIdx, 'quantity', e.target.value)}
                                                                    className="w-full px-3 py-2 bg-[#f8fafb] border-none rounded-lg text-xs font-bold focus:ring-1 focus:ring-blue-500 outline-none"
                                                                    placeholder="e.g. 250ml"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Price (₹)</label>
                                                                <div className="relative">
                                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">₹</span>
                                                                    <input
                                                                        type="number"
                                                                        value={variant.price}
                                                                        onChange={e => handleVariantChange(brandIdx, varIdx, 'price', e.target.value)}
                                                                        className="w-full pl-6 pr-3 py-2 bg-[#f8fafb] border-none rounded-lg text-xs font-bold focus:ring-1 focus:ring-blue-500 outline-none"
                                                                        placeholder="0"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Stock</label>
                                                                <div className="flex gap-2">
                                                                    <input
                                                                        type="number"
                                                                        value={variant.stock}
                                                                        onChange={e => handleVariantChange(brandIdx, varIdx, 'stock', e.target.value)}
                                                                        className="w-full px-3 py-2 bg-[#f8fafb] border-none rounded-lg text-xs font-bold focus:ring-1 focus:ring-blue-500 outline-none"
                                                                        placeholder="0"
                                                                    />
                                                                    {brand.variants.length > 1 && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRemoveVariant(brandIdx, varIdx)}
                                                                            className="p-2 text-gray-300 hover:text-red-500"
                                                                        >
                                                                            <FiTrash2 className="text-xs" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    <button
                                                        type="button"
                                                        onClick={() => handleAddVariant(brandIdx)}
                                                        className="mt-2 px-3 py-1.5 border border-dashed border-gray-300 text-gray-400 text-[11px] font-bold rounded-lg hover:border-green-500 hover:text-green-600 transition-all flex items-center gap-2"
                                                    >
                                                        <FiPlus /> Add Variant
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Extra Info */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-bold text-gray-500 ml-1">Image URL (or upload)</label>
                                <input
                                    type="text"
                                    value={form.imageURL}
                                    onChange={e => setForm({ ...form, imageURL: e.target.value })}
                                    className="w-full px-4 py-3 bg-[#f3f6f9] border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-green-500 outline-none"
                                    placeholder="https://..."
                                />
                                <div className="mt-2">
                                    <input
                                        type="file"
                                        onChange={e => setImageFile(e.target.files[0])}
                                        className="text-[11px] text-gray-400 font-bold file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[11px] file:font-black file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full md:w-auto px-12 py-4 bg-[#2e7d32] text-white font-black rounded-2xl hover:bg-[#1b5e20] shadow-xl shadow-green-100 disabled:opacity-50 transition-all active:scale-95 text-sm uppercase tracking-wider"
                            >
                                {loading ? 'Processing...' : 'Add Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// ---- Orders Management ----
const OrdersManagement = ({ orders }) => {
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);

    const filteredOrders = orders.filter(o => {
        const matchSearch = !search || o.id.toLowerCase().includes(search.toLowerCase());
        const matchStatus = !filterStatus || o.orderStatus === filterStatus;
        return matchSearch && matchStatus;
    });

    const handleStatusChange = async (orderId, newStatus) => {
        try { await updateOrderStatus(orderId, newStatus); toast.success('Status updated'); }
        catch { toast.error('Failed to update'); }
    };

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Orders Management</h2>
            <p className="text-sm text-gray-500 mb-5">{orders.length} total orders</p>

            <div className="flex flex-col lg:flex-row gap-6 mb-5">
                {/* Status Tabs */}
                <div className="w-full lg:w-48 space-y-1">
                    {[
                        { label: 'All Orders', value: '', count: orders.length },
                        { label: 'Placed', value: 'placed', count: orders.filter(o => o.orderStatus === 'placed').length },
                        { label: 'Packed', value: 'packed', count: orders.filter(o => o.orderStatus === 'packed').length },
                        { label: 'Delivered', value: 'delivered', count: orders.filter(o => o.orderStatus === 'delivered').length },
                        { label: 'Cancelled', value: 'cancelled', count: orders.filter(o => o.orderStatus === 'cancelled').length },
                    ].map(tab => (
                        <button
                            key={tab.label}
                            onClick={() => setFilterStatus(tab.value)}
                            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${filterStatus === tab.value
                                ? 'bg-[#1b5e20] text-white shadow-lg'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
                                }`}
                        >
                            {tab.label} {tab.count !== null && <span className={`float-right px-1.5 py-0.5 rounded-full text-[10px] ${filterStatus === tab.value ? 'bg-white/20' : 'bg-gray-100'}`}>{tab.count}</span>}
                        </button>
                    ))}
                </div>

                <div className="flex-1">
                    {/* Search */}
                    <div className="relative mb-5">
                        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                            type="text"
                            placeholder="Search by Order ID..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:outline-none shadow-sm transition-all"
                        />
                    </div>

                    {/* Orders Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-gray-500 bg-gray-50/50 border-b border-gray-100">
                                        <th className="p-4 font-bold text-xs uppercase tracking-wider">Order Details</th>
                                        <th className="p-4 font-bold text-xs uppercase tracking-wider">Customer Info</th>
                                        <th className="p-4 font-bold text-xs uppercase tracking-wider text-right">Amount</th>
                                        <th className="p-4 font-bold text-xs uppercase tracking-wider text-center">Status</th>
                                        <th className="p-4 font-bold text-xs uppercase tracking-wider text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map(order => (
                                        <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-mono text-xs font-bold text-gray-900">#{order.id.slice(-8).toUpperCase()}</span>
                                                    <span className="text-[10px] text-gray-400 mt-0.5">{order.createdAt?.toDate?.()?.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-') || 'Recently'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">
                                                        {order.customerInfo?.name?.slice(0, 2).toUpperCase() || order.userId?.slice(0, 2).toUpperCase() || 'CU'}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-gray-800 font-semibold">{order.customerInfo?.name || 'Customer'}</span>
                                                        <span className="text-[10px] text-gray-400 font-mono">{order.customerInfo?.customerId || order.userId?.slice(0, 10)}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <span className="font-bold text-gray-900">₹{order.totalAmount?.toFixed(2)}</span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-tighter ${order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                                                    order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                        order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-orange-100 text-orange-700'
                                                    }`}>{order.orderStatus}</span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <select
                                                        value={order.orderStatus}
                                                        onChange={e => handleStatusChange(order.id, e.target.value)}
                                                        className="px-2 py-1 text-[11px] font-bold border border-gray-200 rounded-lg focus:ring-1 focus:ring-green-500 focus:outline-none bg-white cursor-pointer"
                                                    >
                                                        {['placed', 'packed', 'delivered'].map(s => (
                                                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <FiSearch className="text-sm" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredOrders.length === 0 && (
                                        <tr><td colSpan="5" className="py-12 text-center text-gray-400 text-sm font-medium">No orders found matching your criteria</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fadeIn">
                        <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                                <FiShoppingBag className="text-green-600" /> Order Details
                            </h3>
                            <button onClick={() => setSelectedOrder(null)} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
                                <FiX className="text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Order ID</p>
                                    <p className="font-mono text-xs font-bold text-gray-900">{selectedOrder.id}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Status</p>
                                    <span className="text-xs font-bold text-green-600 uppercase">{selectedOrder.orderStatus}</span>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider border-b border-gray-50 pb-1">Items Ordered</p>
                                {selectedOrder.items?.map((item, idx) => (
                                    <div key={idx} className="flex gap-3">
                                        <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                                            <img src={item.imageURL} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-gray-900 truncate">{item.name}</p>
                                            <p className="text-[10px] text-gray-500">{item.quantity} x ₹{item.price}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                                <div className="flex justify-between text-xs font-medium text-gray-500">
                                    <span>Subtotal</span>
                                    <span>₹{selectedOrder.totalAmount?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs font-medium text-gray-500">
                                    <span>Delivery</span>
                                    <span className="text-green-600 font-bold text-[10px] uppercase tracking-wider">Free</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
                                    <span>Total Amount</span>
                                    <span>₹{selectedOrder.totalAmount?.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="px-5 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ---- Main Admin Dashboard ----
const AdminDashboard = () => {
    const { user } = useAuth();
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
        <div className="flex min-h-screen bg-[#f5f5f5]">
            <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex-1 min-w-0">
                {/* Top Bar */}
                <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                            <FiMenu />
                        </button>
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt="SRS Logo" className="w-8 h-8 rounded-lg object-cover" />
                            <div>
                                <p className="text-xs font-bold text-gray-800">Sri Ranga</p>
                                <p className="text-[9px] text-gray-400">Supermarket</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#2e7d32] rounded-lg flex items-center justify-center text-white text-xs font-bold">
                                {user?.displayName?.[0]?.toUpperCase() || 'A'}
                            </div>
                            <span className="text-xs font-medium text-gray-700 hidden sm:block">{user?.displayName || 'Admin'}</span>
                        </div>
                    </div>
                </div>
                {/* Content */}
                <div className="p-4 sm:p-5 lg:p-6">
                    <Routes>
                        <Route index element={<DashboardOverview products={products} orders={orders} />} />
                        <Route path="products" element={<ProductsManagement products={products} />} />
                        <Route path="add-product" element={<AddProduct />} />
                        <Route path="orders" element={<OrdersManagement orders={orders} />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
