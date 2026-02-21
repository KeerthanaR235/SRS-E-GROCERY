// Hero Section Component - Main banner with CTA
const Hero = () => {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 text-8xl animate-float-slow">🥕</div>
                <div className="absolute top-20 right-20 text-7xl animate-float-medium">🍎</div>
                <div className="absolute bottom-10 left-1/4 text-6xl animate-float-fast">🥛</div>
                <div className="absolute bottom-20 right-1/3 text-8xl animate-float-slow">🌽</div>
                <div className="absolute top-1/2 left-1/2 text-9xl animate-float-medium">🛒</div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="relative z-10 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-white/90 text-sm mb-6 border border-white/20">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            Free delivery on orders above ₹499
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                            Fresh Groceries
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300">
                                Delivered in 24 Hours
                            </span>
                        </h1>

                        <p className="text-blue-100 text-lg sm:text-xl mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                            Shop from 1000+ fresh vegetables, fruits, dairy products and more. Quality guaranteed with farm-fresh sourcing.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <a
                                href="#products"
                                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-xl shadow-blue-900/30 hover:-translate-y-1 hover:shadow-2xl"
                            >
                                Shop Now
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </a>
                            <a
                                href="#offers"
                                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
                            >
                                View Offers 🎉
                            </a>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-8 mt-10 justify-center lg:justify-start">
                            <div className="text-center">
                                <p className="text-2xl sm:text-3xl font-bold text-white">1000+</p>
                                <p className="text-blue-200 text-sm">Products</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl sm:text-3xl font-bold text-white">500+</p>
                                <p className="text-blue-200 text-sm">Happy Customers</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl sm:text-3xl font-bold text-white">24hr</p>
                                <p className="text-blue-200 text-sm">Delivery</p>
                            </div>
                        </div>
                    </div>

                    {/* Right - Featured image area */}
                    <div className="hidden lg:flex justify-center relative">
                        <div className="relative w-96 h-96">
                            {/* Glowing circle */}
                            <div className="absolute inset-0 bg-gradient-to-br from-green-400/30 to-blue-400/30 rounded-full blur-3xl"></div>

                            {/* Floating product cards */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur rounded-2xl p-4 shadow-2xl animate-float-slow transform hover:scale-105 transition-transform">
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl">🥬</span>
                                    <div>
                                        <p className="font-semibold text-gray-800">Fresh Spinach</p>
                                        <p className="text-green-600 font-bold">₹30/bunch</p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute top-1/3 -left-4 bg-white/95 backdrop-blur rounded-2xl p-4 shadow-2xl animate-float-medium transform hover:scale-105 transition-transform">
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl">🍎</span>
                                    <div>
                                        <p className="font-semibold text-gray-800">Red Apples</p>
                                        <p className="text-green-600 font-bold">₹72/500g</p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute top-1/3 -right-4 bg-white/95 backdrop-blur rounded-2xl p-4 shadow-2xl animate-float-fast transform hover:scale-105 transition-transform">
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl">🥛</span>
                                    <div>
                                        <p className="font-semibold text-gray-800">Fresh Milk</p>
                                        <p className="text-green-600 font-bold">₹65/L</p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur rounded-2xl p-4 shadow-2xl animate-float-medium transform hover:scale-105 transition-transform">
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl">🍌</span>
                                    <div>
                                        <p className="font-semibold text-gray-800">Bananas</p>
                                        <p className="text-green-600 font-bold">₹50/dozen</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom wave */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" />
                </svg>
            </div>

            <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float-slow { animation: float-slow 4s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 3s ease-in-out infinite 0.5s; }
        .animate-float-fast { animation: float-fast 2.5s ease-in-out infinite 1s; }
      `}</style>
        </section>
    );
};

export default Hero;
