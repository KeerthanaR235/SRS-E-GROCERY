// Offers Section Component - Promotional banners
const OffersSection = () => {
    const offers = [
        {
            title: '50% OFF',
            subtitle: 'On Fresh Fruits',
            description: 'Limited time offer on seasonal fruits',
            bg: 'from-orange-400 to-red-500',
            icon: '🍎',
            code: 'FRUIT50'
        },
        {
            title: '20% OFF',
            subtitle: 'Fresh Vegetables',
            description: 'Farm fresh vegetables daily',
            bg: 'from-green-400 to-emerald-500',
            icon: '🥬',
            code: 'VEG20'
        },
        {
            title: 'Starting ₹79',
            subtitle: 'Household Essentials',
            description: 'Stock up on daily essentials',
            bg: 'from-blue-400 to-indigo-500',
            icon: '🏠',
            code: 'HOME79'
        }
    ];

    return (
        <section id="offers" className="py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Today's Best Offers</h2>
                        <p className="text-gray-500 mt-1">Don't miss out on these amazing deals!</p>
                    </div>
                    <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 text-sm font-semibold rounded-full animate-pulse">
                        🔥 Limited Time
                    </span>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {offers.map((offer, index) => (
                        <div
                            key={index}
                            className={`relative overflow-hidden bg-gradient-to-br ${offer.bg} rounded-2xl p-6 sm:p-8 text-white group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 cursor-pointer`}
                        >
                            {/* Background decoration */}
                            <div className="absolute -right-4 -bottom-4 text-[120px] opacity-20 group-hover:opacity-30 transition-opacity group-hover:scale-110 transform duration-500">
                                {offer.icon}
                            </div>

                            <div className="relative z-10">
                                <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
                                    Use code: {offer.code}
                                </div>
                                <h3 className="text-3xl sm:text-4xl font-extrabold mb-1">{offer.title}</h3>
                                <p className="text-xl font-semibold text-white/90 mb-2">{offer.subtitle}</p>
                                <p className="text-white/70 text-sm">{offer.description}</p>
                                <button className="mt-4 px-5 py-2 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/30 transition-all text-sm border border-white/30">
                                    Shop Now →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default OffersSection;
