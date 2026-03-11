// Main App Component - Root with routing and providers
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Header from './components/Header';
import Footer from './components/Footer';
import PageLoader from './components/PageLoader';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <PageLoader />;
    if (!user) return <Navigate to="/login" />;
    return children;
};

// Admin Route wrapper - checks if user is admin via Firebase OR hardcoded login
const AdminRoute = ({ children }) => {
    const { user, userRole, loading } = useAuth();
    // Check localStorage for hardcoded admin login
    const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (loading) return <PageLoader />;
    // Allow access if admin is logged in via hardcoded credentials OR via Firebase admin role
    if (isAdminLoggedIn) return children;
    if (!user) return <Navigate to="/login" />;
    if (userRole !== 'admin') return <Navigate to="/" />;
    return children;
};

// Layout with Header and Footer (for customer pages)
const CustomerLayout = ({ children, onSearch }) => (
    <div className="flex flex-col min-h-screen">
        <Header onSearch={onSearch} />
        <main className="flex-1">{children}</main>
        <Footer />
    </div>
);

const AppContent = () => {
    const { loading } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [showLoader, setShowLoader] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowLoader(false), 1800);
        return () => clearTimeout(timer);
    }, []);

    if (showLoader || loading) return <PageLoader />;

    return (
        <>
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 3000,
                    style: {
                        borderRadius: '12px',
                        background: '#1f2937',
                        color: '#fff',
                        fontSize: '14px',
                        padding: '12px 16px',
                    },
                    success: {
                        iconTheme: { primary: '#10b981', secondary: '#fff' },
                    },
                    error: {
                        iconTheme: { primary: '#ef4444', secondary: '#fff' },
                    },
                }}
            />

            <Routes>
                {/* Customer Pages */}
                <Route path="/" element={
                    <CustomerLayout onSearch={setSearchQuery}>
                        <Home searchQuery={searchQuery} />
                    </CustomerLayout>
                } />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/cart" element={
                    <CustomerLayout>
                        <Cart />
                    </CustomerLayout>
                } />
                <Route path="/checkout" element={
                    <ProtectedRoute>
                        <CustomerLayout>
                            <Checkout />
                        </CustomerLayout>
                    </ProtectedRoute>
                } />
                <Route path="/orders" element={
                    <ProtectedRoute>
                        <CustomerLayout>
                            <Orders />
                        </CustomerLayout>
                    </ProtectedRoute>
                } />
                <Route path="/wishlist" element={
                    <ProtectedRoute>
                        <CustomerLayout>
                            <Wishlist />
                        </CustomerLayout>
                    </ProtectedRoute>
                } />
                <Route path="/profile" element={
                    <ProtectedRoute>
                        <CustomerLayout>
                            <Profile />
                        </CustomerLayout>
                    </ProtectedRoute>
                } />

                {/* Admin Pages */}
                <Route path="/admin/*" element={
                    <AdminRoute>
                        <AdminDashboard />
                    </AdminRoute>
                } />

                {/* Fallback */}
                <Route path="*" element={
                    <CustomerLayout>
                        <div className="min-h-[60vh] flex items-center justify-center">
                            <div className="text-center">
                                <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
                                <p className="text-gray-500 mb-4">Page not found</p>
                                <a href="/" className="text-blue-600 font-semibold hover:underline">Go Home</a>
                            </div>
                        </div>
                    </CustomerLayout>
                } />
            </Routes>
        </>
    );
};

const App = () => {
    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                    <WishlistProvider>
                        <AppContent />
                    </WishlistProvider>
                </CartProvider>
            </AuthProvider>
        </Router>
    );
};

export default App;
