// Admin Sidebar Component - Navigation for admin dashboard
import { Link, useLocation } from 'react-router-dom';
import {
    FiHome,
    FiPackage,
    FiShoppingBag,
    FiAlertTriangle,
    FiBarChart2,
    FiArrowLeft,
    FiPlus,
    FiSettings,
    FiX
} from 'react-icons/fi';

const AdminSidebar = ({ isOpen, onClose }) => {
    const location = useLocation();

    const menuItems = [
        { path: '/admin', label: 'Dashboard', icon: FiHome, exact: true },
        { path: '/admin/products', label: 'Products', icon: FiPackage },
        { path: '/admin/add-product', label: 'Add Product', icon: FiPlus },
        { path: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
        { path: '/admin/low-stock', label: 'Low Stock', icon: FiAlertTriangle },
        { path: '/admin/analytics', label: 'Analytics', icon: FiBarChart2 },
        { path: '/admin/maintenance', label: 'Maintenance', icon: FiSettings },
    ];

    const isActive = (path, exact) => {
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-50 transform transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:sticky lg:top-0 lg:h-screen`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-5 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="text-white text-sm font-bold">A</span>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 text-sm">Admin Panel</p>
                                    <p className="text-xs text-gray-400">E-Grocery</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg">
                                <FiX className="text-gray-500" />
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-3 overflow-y-auto">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Menu</p>
                        <ul className="space-y-1">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.path, item.exact);
                                return (
                                    <li key={item.path}>
                                        <Link
                                            to={item.path}
                                            onClick={onClose}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                        ${active
                                                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                }`}
                                        >
                                            <Icon className={`text-lg ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                                            {item.label}
                                            {item.label === 'Low Stock' && (
                                                <span className="ml-auto w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Back to Store */}
                    <div className="p-3 border-t border-gray-100">
                        <Link
                            to="/"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
                        >
                            <FiArrowLeft className="text-gray-400" />
                            Back to Store
                        </Link>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
