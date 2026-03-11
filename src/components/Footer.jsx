// Footer Component - Green themed site footer
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => {
    return (
        <footer id="contact" className="bg-[#1b5e20] text-green-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <img src="/logo.png" alt="SRS Logo" className="w-9 h-9 rounded-lg object-cover" />
                            <div>
                                <span className="text-lg font-bold text-white">Sri Ranga</span>
                                <p className="text-[10px] text-green-300 tracking-wide">Supermarket</p>
                            </div>
                        </div>
                        <p className="text-sm text-green-200 leading-relaxed mb-4">
                            Your one-stop supermarket for fresh groceries and daily essentials. Quality guaranteed at Sri Ranga Supermarket.
                        </p>
                        <div className="flex gap-2">
                            {['📘', '🐦', '📷', '📺'].map((icon, i) => (
                                <button key={i} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors text-sm border border-white/10">
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4 text-sm">Quick Links</h4>
                        <ul className="space-y-2">
                            {['Home', 'Shop', 'Categories', 'Offers', 'About Us'].map(link => (
                                <li key={link}>
                                    <a href="#" className="text-sm text-green-200 hover:text-white hover:pl-1 transition-all duration-200">{link}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h4 className="text-white font-semibold mb-4 text-sm">Customer Service</h4>
                        <ul className="space-y-2">
                            {['My Account', 'Returns', 'FAQs', 'Privacy Policy'].map(link => (
                                <li key={link}>
                                    <a href="#" className="text-sm text-green-200 hover:text-white hover:pl-1 transition-all duration-200">{link}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-semibold mb-4 text-sm">Contact Us</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-sm">
                                <FiMapPin className="text-green-300 mt-0.5 shrink-0" />
                                <span className="text-green-200">C57, 4th Cross Street, Thillai Nagar, Trichy</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm">
                                <FiPhone className="text-green-300 shrink-0" />
                                <span className="text-green-200">+91 8056644344</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm">
                                <FiMail className="text-green-300 shrink-0" />
                                <span className="text-green-200">rengafoods19@gmail.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-green-800 mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-sm text-green-300">© 2026 Sri Ranga Supermarket. All rights reserved.</p>
                    <div className="flex items-center gap-4 text-sm text-green-300">
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
