// Footer Component - Site footer with links and info
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-green-400 rounded-xl flex items-center justify-center">
                                <span className="text-white text-lg">🛒</span>
                            </div>
                            <span className="text-xl font-bold text-white">
                                E-<span className="text-green-400">Grocery</span>
                            </span>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed mb-4">
                            Your one-stop shop for fresh groceries delivered to your doorstep within 24 hours. Quality guaranteed.
                        </p>
                        <div className="flex gap-3">
                            {['📘', '🐦', '📷', '📺'].map((icon, i) => (
                                <button key={i} className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors text-sm">
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2.5">
                            {['Home', 'Shop', 'Categories', 'Offers', 'About Us'].map(link => (
                                <li key={link}>
                                    <a href="#" className="text-sm text-gray-400 hover:text-white hover:pl-1 transition-all duration-200">{link}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Customer Service</h4>
                        <ul className="space-y-2.5">
                            {['My Account', 'Order Tracking', 'Returns', 'FAQs', 'Privacy Policy'].map(link => (
                                <li key={link}>
                                    <a href="#" className="text-sm text-gray-400 hover:text-white hover:pl-1 transition-all duration-200">{link}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Contact Us</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-sm">
                                <FiMapPin className="text-blue-400 mt-0.5 shrink-0" />
                                <span className="text-gray-400">123 Grocery Street, Fresh Market, IN 560001</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm">
                                <FiPhone className="text-blue-400 shrink-0" />
                                <span className="text-gray-400">+91 98765 43210</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm">
                                <FiMail className="text-blue-400 shrink-0" />
                                <span className="text-gray-400">support@egrocery.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-500">© 2026 E-Grocery. All rights reserved.</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>💳 Visa</span>
                        <span>💳 Mastercard</span>
                        <span>💳 UPI</span>
                        <span>💵 COD</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
