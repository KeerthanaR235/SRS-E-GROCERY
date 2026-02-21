// Page Loader Component - Animated grocery-themed loading screen
import { useState, useEffect } from 'react';

const PageLoader = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 2;
            });
        }, 30);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50 z-[9999] flex items-center justify-center">
            <div className="text-center">
                {/* Animated Logo */}
                <div className="relative mb-8">
                    <div className="w-24 h-24 mx-auto relative">
                        {/* Spinning circle */}
                        <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>

                        {/* Inner icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-4xl animate-bounce">🛒</span>
                        </div>
                    </div>

                    {/* Floating groceries */}
                    <div className="absolute -top-2 -left-4 text-2xl animate-float-1">🥕</div>
                    <div className="absolute -top-4 -right-2 text-2xl animate-float-2">🍎</div>
                    <div className="absolute -bottom-2 -left-6 text-2xl animate-float-3">🥛</div>
                    <div className="absolute -bottom-4 -right-4 text-2xl animate-float-1">🍌</div>
                </div>

                {/* Brand */}
                <h1 className="text-3xl font-bold mb-2">
                    <span className="text-blue-600">E-</span>
                    <span className="text-green-600">Grocery</span>
                </h1>
                <p className="text-gray-500 text-sm mb-6">Fresh groceries at your doorstep</p>

                {/* Progress bar */}
                <div className="w-64 mx-auto">
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-100 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Loading fresh deals...</p>
                </div>
            </div>

            <style>{`
        @keyframes float-1 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(10deg); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-16px) rotate(-10deg); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        .animate-float-1 { animation: float-1 2s ease-in-out infinite; }
        .animate-float-2 { animation: float-2 2.5s ease-in-out infinite 0.3s; }
        .animate-float-3 { animation: float-3 1.8s ease-in-out infinite 0.6s; }
      `}</style>
        </div>
    );
};

export default PageLoader;
