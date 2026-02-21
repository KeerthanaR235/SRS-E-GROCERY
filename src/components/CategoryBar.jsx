// Category Bar Component - Horizontal scrollable category navigation
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useRef } from 'react';

const categories = [
    { name: 'All', icon: '🏪', color: 'from-blue-500 to-blue-600' },
    { name: 'Vegetables', icon: '🥬', color: 'from-green-500 to-green-600' },
    { name: 'Fruits', icon: '🍎', color: 'from-red-400 to-pink-500' },
    { name: 'Dairy', icon: '🥛', color: 'from-yellow-400 to-orange-400' },
    { name: 'Grains', icon: '🌾', color: 'from-amber-500 to-amber-600' },
    { name: 'Beverages', icon: '🥤', color: 'from-cyan-500 to-teal-500' },
    { name: 'Household', icon: '🏠', color: 'from-purple-500 to-purple-600' },
    { name: 'Snacks', icon: '🍿', color: 'from-orange-500 to-red-500' }
];

const CategoryBar = ({ selectedCategory, onSelectCategory }) => {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = direction === 'left' ? -200 : 200;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-white border-b border-gray-100 sticky top-16 lg:top-18 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative flex items-center py-3">
                    {/* Left Arrow */}
                    <button
                        onClick={() => scroll('left')}
                        className="hidden sm:flex absolute left-0 z-10 w-8 h-8 items-center justify-center bg-white/90 backdrop-blur border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-all"
                    >
                        <FiChevronLeft className="text-gray-600" />
                    </button>

                    {/* Categories */}
                    <div
                        ref={scrollRef}
                        className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide px-0 sm:px-10 scroll-smooth"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {categories.map((cat) => (
                            <button
                                key={cat.name}
                                onClick={() => onSelectCategory(cat.name === 'All' ? '' : cat.name)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 shrink-0
                  ${(selectedCategory === cat.name || (selectedCategory === '' && cat.name === 'All'))
                                        ? `bg-gradient-to-r ${cat.color} text-white shadow-md shadow-blue-200/50 scale-105`
                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:scale-105'
                                    }`}
                            >
                                <span className="text-lg">{cat.icon}</span>
                                <span>{cat.name}</span>
                            </button>
                        ))}
                    </div>

                    {/* Right Arrow */}
                    <button
                        onClick={() => scroll('right')}
                        className="hidden sm:flex absolute right-0 z-10 w-8 h-8 items-center justify-center bg-white/90 backdrop-blur border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-all"
                    >
                        <FiChevronRight className="text-gray-600" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategoryBar;
