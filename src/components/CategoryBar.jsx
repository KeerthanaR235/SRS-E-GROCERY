// Category Bar Component - Horizontal scrollable category navigation with green theme
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useRef } from 'react';

const categories = [
    { name: 'All', image: '/categories/all.jpg', color: '#2e7d32' },
    { name: 'Vegetables', image: '/categories/vegetables.jpg', color: '#4caf50' },
    { name: 'Dairy', image: '/categories/dairy.jpg', color: '#ff9800' },
    { name: 'Grains & Cereals', image: '/categories/grains.jpg', color: '#8d6e63' },
    { name: 'Pulses', image: '/categories/pulses.jpg', color: '#d84315' },
    { name: 'Flours', image: '/categories/flours.jpg', color: '#6d4c41' },
    { name: 'Beverages', image: '/categories/beverages.jpg', color: '#00bcd4' },
    { name: 'Household', image: '/categories/household.jpg', color: '#9c27b0' },
    { name: 'Leafy Greens', image: '/categories/leafy-greens.jpg', color: '#2e7d32' },
    { name: 'Chocolates', image: '/categories/chocolates.jpg', color: '#795548' },
    { name: 'Biscuits', image: '/categories/biscuits.jpg', color: '#ffc107' }
];

const CategoryBar = ({ selectedCategory, onSelectCategory }) => {
    return (
        <div className="bg-white border-b border-gray-100 sticky top-14 lg:top-16 z-40 shadow-sm py-5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-5 bg-[#2e7d32] rounded-full"></div>
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Browse Categories</h3>
                    </div>

                    {/* Categories Grid */}
                    <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
                        {categories.map((cat) => {
                            const isSelected = selectedCategory === cat.name || (selectedCategory === '' && cat.name === 'All');
                            return (
                                <button
                                    key={cat.name}
                                    onClick={() => onSelectCategory(cat.name === 'All' ? '' : cat.name)}
                                    className={`flex flex-col items-center justify-center gap-2.5 p-3 sm:p-4 rounded-2xl text-sm font-bold transition-all duration-300 border-2 ${isSelected
                                        ? 'text-white shadow-xl scale-105 z-10'
                                        : 'bg-gray-50 text-gray-600 border-transparent hover:border-gray-200 hover:bg-white hover:scale-105'
                                        }`}
                                    style={isSelected ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
                                >
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shadow-sm">
                                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                                    </div>
                                    <span className="text-[12px] sm:text-[13px] whitespace-nowrap">{cat.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryBar;
