// Admin Sidebar Component - Green themed matching UI design
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FiHome,
    FiPackage,
    FiShoppingBag,
    FiLogOut,
    FiX
} from 'react-icons/fi';

const AdminSidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const menuItems = [
        { path: '/admin', label: 'Dashboard', icon: FiHome, exact: true },
        { path: '/admin/products', label: 'Manage Products', icon: FiPackage },
        { path: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
    ];

    const isActive = (path, exact) => {
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    const handleLogout = async () => {
        try {
            // Clear hardcoded admin session
            localStorage.removeItem('adminLoggedIn');
            localStorage.removeItem('adminEmail');
            await logout();
        } catch (e) { console.error(e); }
        navigate('/login');
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-60 bg-[#1b5e20] text-gray-300 z-50 transform transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:sticky lg:top-0 lg:h-screen shadow-2xl`}
            >
                <div className="flex flex-col h-full">
                    {/* Close button for mobile */}
                    <button
                        onClick={onClose}
                        className="lg:hidden absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <FiX />
                    </button>

                    {/* Header */}
                    <div className="p-5 border-b border-green-800">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="SRS Logo" className="w-10 h-10 rounded-lg object-cover" />
                            <div>
                                <p className="font-bold text-white text-sm leading-tight">Sri Ranga</p>
                                <p className="text-[10px] text-green-300 tracking-wide">Supermarket</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-3 mt-1">
                        <ul className="space-y-1">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.path, item.exact);
                                return (
                                    <li key={item.path}>
                                        <Link
                                            to={item.path}
                                            onClick={onClose}
                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                                                ${active
                                                    ? 'bg-white/20 text-white shadow-md'
                                                    : 'hover:bg-white/10 hover:text-white text-green-200'
                                                }`}
                                        >
                                            <Icon className={`text-lg ${active ? 'text-white' : 'text-green-300'}`} />
                                            {item.label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Footer */}
                    <div className="p-3 border-t border-green-800">
                        <Link to="/" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-green-200 hover:bg-white/10 hover:text-white transition-all">
                            <FiHome className="text-lg" />
                            Back to Store
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all"
                        >
                            <FiLogOut className="text-lg" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
