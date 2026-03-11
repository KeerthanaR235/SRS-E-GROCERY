// Offers Section Component - Green themed promotional banners
const OffersSection = () => {
    const offers = [
        {
            title: '50% OFF',
            subtitle: 'On Fresh Fruits',
            description: 'Limited time offer on seasonal fruits',
            bg: 'from-[#e65100] to-[#ff6d00]',
            icon: '🍎',
            code: 'FRUIT50'
        },
        {
            title: '20% OFF',
            subtitle: 'Fresh Vegetables',
            description: 'Farm fresh vegetables daily',
            bg: 'from-[#2e7d32] to-[#43a047]',
            icon: '🥬',
            code: 'VEG20'
        },
        {
            title: 'Starting ₹79',
            subtitle: 'Household Essentials',
            description: 'Stock up on daily essentials',
            bg: 'from-[#1565c0] to-[#1e88e5]',
            icon: '🏠',
            code: 'HOME79'
        }
    ];

    return (
        <section id="offers" className="py-10 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <span className="w-1 h-6 bg-[#2e7d32] rounded-full"></span>
                            Today's Best Offers
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">Don't miss out on these amazing deals!</p>
                    </div>
                    <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full animate-pulse">
                        🔥 Limited Time
                    </span>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {offers.map((offer, index) => (
                        <div
                            key={index}
                            className={`relative overflow-hidden bg-gradient-to-br ${offer.bg} rounded-xl p-5 sm:p-6 text-white group hover:shadow-xl transition-all duration-500 hover:-translate-y-1 cursor-pointer`}
                        >
                            {/* Background decoration */}
                            <div className="absolute -right-4 -bottom-4 text-[100px] opacity-15 group-hover:opacity-25 transition-opacity group-hover:scale-110 transform duration-500">
                                {offer.icon}
                            </div>

                            <div className="relative z-10">
                                <div className="inline-block px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium mb-3">
                                    Use code: {offer.code}
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-extrabold mb-1">{offer.title}</h3>
                                <p className="text-lg font-semibold text-white/90 mb-1">{offer.subtitle}</p>
                                <p className="text-white/70 text-xs">{offer.description}</p>
                                <button className="mt-3 px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/30 transition-all text-xs border border-white/30">
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
