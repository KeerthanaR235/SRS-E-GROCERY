// Header Component - Green themed navigation matching UI design
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { FiSearch, FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut, FiPackage, FiShield, FiHeart } from 'react-icons/fi';

const Header = ({ onSearch }) => {
    const { user, logout, isAdmin } = useAuth();
    const { getCartCount } = useCart();
    const { getWishlistCount } = useWishlist();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (onSearch) onSearch(searchQuery);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
            setDropdownOpen(false);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/#categories', label: 'Category' },
        { path: '/#products', label: 'Products' },
        { path: '/#contact', label: 'Contact Us' },
    ];

    const isActivePath = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <header className="bg-gradient-to-r from-[#2e7d32] to-[#388e3c] sticky top-0 z-50 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14 lg:h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 shrink-0">
                        <img src="/logo.png" alt="SRS Logo" className="w-9 h-9 rounded-lg object-cover" />
                        <div className="hidden sm:block">
                            <p className="text-white font-bold text-sm leading-tight">Sri Ranga</p>
                            <p className="text-green-200 text-[10px] leading-tight tracking-wide">Supermarket</p>
                        </div>
                    </Link>

                    {/* Navigation Links - Desktop */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <a
                                key={link.path}
                                href={link.path}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${isActivePath(link.path)
                                    ? 'bg-white/20 text-white'
                                    : 'text-green-100 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    {/* Right Section */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        {/* Admin Link */}
                        {isAdmin && (
                            <Link
                                to="/admin"
                                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-white/15 text-white text-xs font-medium rounded-lg hover:bg-white/25 transition-all duration-200 border border-white/20"
                            >
                                <FiShield className="text-xs" />
                                Admin
                            </Link>
                        )}

                        {/* Wishlist */}
                        <Link
                            to="/wishlist"
                            className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-white/15 hover:bg-white/25 transition-all duration-200 border border-white/20"
                        >
                            <FiHeart className="text-lg text-white" />
                            {getWishlistCount() > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-[#2e7d32]">
                                    {getWishlistCount()}
                                </span>
                            )}
                        </Link>

                        {/* Cart */}
                        <Link
                            to="/cart"
                            className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-white/15 hover:bg-white/25 transition-all duration-200 border border-white/20"
                        >
                            <FiShoppingCart className="text-lg text-white" />
                            {getCartCount() > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-[#2e7d32]">
                                    {getCartCount()}
                                </span>
                            )}
                        </Link>

                        {/* Orders */}
                        {user && (
                            <Link
                                to="/orders"
                                className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/15 hover:bg-white/25 transition-all duration-200 border border-white/20"
                            >
                                <FiPackage className="text-lg text-white" />
                            </Link>
                        )}

                        {/* User Menu */}
                        {user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-1.5 px-1.5 py-1 rounded-lg hover:bg-white/15 transition-colors border border-transparent hover:border-white/20"
                                >
                                    <div className="w-8 h-8 bg-white/25 rounded-lg flex items-center justify-center text-white text-sm font-bold border border-white/30">
                                        {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <span className="hidden sm:block text-xs font-medium text-white max-w-[80px] truncate">
                                        {user.displayName || 'User'}
                                    </span>
                                </button>

                                {/* Dropdown */}
                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-fadeIn">
                                        <div className="px-4 py-2.5 border-b border-gray-100">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{user.displayName || 'User'}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            {isAdmin && (
                                                <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">Admin</span>
                                            )}
                                        </div>
                                        <Link to="/orders" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                            <FiPackage className="text-gray-400" /> My Orders
                                        </Link>
                                        <Link to="/wishlist" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                            <FiHeart className="text-gray-400" /> My Wishlist
                                        </Link>
                                        <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                            <FiUser className="text-gray-400" /> My Profile
                                        </Link>
                                        {isAdmin && (
                                            <Link to="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                <FiShield className="text-gray-400" /> Admin Dashboard
                                            </Link>
                                        )}
                                        <hr className="my-1 border-gray-100" />
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <FiLogOut /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="flex items-center gap-1.5 px-4 py-2 bg-white text-green-700 text-sm font-semibold rounded-lg hover:bg-green-50 transition-all duration-200 shadow-md"
                            >
                                <FiUser className="text-sm" />
                                <span className="hidden sm:inline">Login</span>
                            </Link>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-white/15 hover:bg-white/25 transition-colors border border-white/20"
                        >
                            {mobileMenuOpen ? <FiX className="text-xl text-white" /> : <FiMenu className="text-xl text-white" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden pb-4 animate-fadeIn">
                        <div className="flex flex-col gap-1 mb-3">
                            {navLinks.map((link) => (
                                <a
                                    key={link.path}
                                    href={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="px-4 py-2 text-sm text-green-100 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>
                        <form onSubmit={handleSearch}>
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search groceries..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        if (onSearch) onSearch(e.target.value);
                                    }}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white/90 border border-white/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                                />
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
