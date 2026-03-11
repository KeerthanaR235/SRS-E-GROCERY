// Login Page - Email/Password and Google Sign In
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
    const [loginType, setLoginType] = useState('user'); // 'user' or 'admin'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login, signInWithGoogle, logout } = useAuth();
    const navigate = useNavigate();

    // Helper to fetch user role from Firestore directly for verification
    const verifyRole = async (uid) => {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase/firebase');
        const userDoc = await getDoc(doc(db, 'users', uid));
        return userDoc.exists() ? userDoc.data().role : 'user';
    };

    // Hardcoded admin credentials
    const ADMIN_EMAIL = 'rengafoods26@gmail.com';
    const ADMIN_PASSWORD = 'rengafoods26';

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }
        setLoading(true);

        // Admin login: check hardcoded credentials only
        if (loginType === 'admin') {
            if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
                // Store admin session in localStorage
                localStorage.setItem('adminLoggedIn', 'true');
                localStorage.setItem('adminEmail', ADMIN_EMAIL);
                toast.success('Welcome back, Admin! 🎉');
                navigate('/admin');
            } else {
                toast.error('Invalid admin credentials. Access denied.');
            }
            setLoading(false);
            return;
        }

        // User login: normal Firebase auth
        try {
            const result = await login(email, password);
            const role = await verifyRole(result.user.uid);

            if (role === 'admin') {
                await logout();
                toast.error('Please use the Admin Login tab to sign in as admin.');
            } else {
                toast.success('Welcome back! 🎉');
                navigate('/');
            }
        } catch (error) {
            console.error(error);
            const errorMessages = {
                'auth/user-not-found': 'No account found with this email',
                'auth/wrong-password': 'Incorrect password',
                'auth/invalid-email': 'Invalid email address',
                'auth/too-many-requests': 'Too many attempts. Please try again later',
                'auth/invalid-credential': 'Invalid email or password'
            };
            toast.error(errorMessages[error.code] || 'Login failed. Please try again.');
        }
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const result = await signInWithGoogle();
            const role = await verifyRole(result.user.uid);

            if (loginType === 'admin' && role !== 'admin') {
                await logout();
                toast.error('Access denied. Admin account required.');
            } else {
                toast.success('Welcome! 🎉');
                navigate(role === 'admin' ? '/admin' : '/');
            }
        } catch (error) {
            if (error.code !== 'auth/popup-closed-by-user') {
                toast.error('Google sign-in failed. Please try again.');
            }
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg shadow-green-200">
                            <img src="/logo.png" alt="SRS Logo" className="w-full h-full object-cover" />
                        </div>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {loginType === 'admin' ? 'Admin Login' : 'Welcome Back'}
                    </h1>
                    <p className="text-gray-500">
                        {loginType === 'admin'
                            ? 'Access the management dashboard'
                            : 'Sign in to your Sri Ranga Supermarket account'}
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-white/50 p-8">

                    {/* Role Switcher */}
                    <div className="flex p-1 bg-gray-100 rounded-xl mb-8">
                        <button
                            onClick={() => setLoginType('user')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${loginType === 'user'
                                ? 'bg-white text-green-700 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <FiMail className={loginType === 'user' ? 'text-green-600' : ''} />
                            User Login
                        </button>
                        <button
                            onClick={() => setLoginType('admin')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${loginType === 'admin'
                                ? 'bg-white text-indigo-700 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <FiLock className={loginType === 'admin' ? 'text-indigo-600' : ''} />
                            Admin Login
                        </button>
                    </div>

                    {/* Google Sign In - Only shown for User login */}
                    {loginType !== 'admin' && (
                        <>
                            <button
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all duration-200 mb-6 disabled:opacity-50"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continue with Google
                            </button>

                            {/* Divider */}
                            <div className="relative mb-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="bg-white px-4 text-gray-400">or sign in with email</span>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Email Login Form */}
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                            <div className="relative">
                                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={loginType === 'admin' ? 'admin email' : 'you@example.com'}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                            <div className="relative">
                                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${loginType === 'admin'
                                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                                : 'bg-green-600 hover:bg-green-700 shadow-green-200'
                                }`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : `Sign In as ${loginType === 'admin' ? 'Admin' : 'User'}`}
                        </button>
                    </form>

                    {/* Sign Up Link - Only shown for User login */}
                    {loginType !== 'admin' && (
                        <p className="text-center text-sm text-gray-500 mt-6">
                            Don't have an account?{' '}
                            <Link
                                to="/signup"
                                className="font-semibold transition-colors text-green-600 hover:text-green-700"
                            >
                                Create Account
                            </Link>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
