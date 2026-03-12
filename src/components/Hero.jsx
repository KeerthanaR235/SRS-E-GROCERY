// Hero Section Component - Welcome banner with category circles matching UI design
import { Link } from 'react-router-dom';

const Hero = () => {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-[#e8f5e9] via-[#c8e6c9] to-[#a5d6a7]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="text-center md:text-left md:flex-1">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1b5e20] leading-tight mb-3">
                            Welcome to Sri Ranga Supermarket!
                        </h1>
                        <p className="text-[#2e7d32] text-base sm:text-lg max-w-lg mx-auto md:mx-0">
                            Fresh groceries & daily essentials at your doorstep in Trichy. Shop from our wide range of categories.
                        </p>
                    </div>
                    <div className="md:flex-1 flex justify-center">
                        <img
                            src="/hero-cart.jpg"
                            alt="Shopping Cart"
                            className="w-64 sm:w-80 md:w-96 rounded-2xl shadow-xl object-cover"
                        />
                    </div>
                </div>
            </div>

            {/* Bottom wave */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 80L60 70C120 60 240 40 360 30C480 20 600 20 720 25C840 30 960 40 1080 45C1200 50 1320 50 1380 50L1440 50V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="white" />
                </svg>
            </div>
        </section>
    );
};

export default Hero;
