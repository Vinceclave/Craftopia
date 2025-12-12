import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export const Footer = () => {
    const currentYear = new Date().getFullYear();

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <footer className="bg-[#2B4A2F] text-white py-12 relative overflow-hidden">
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand Column */}
                    <div className="md:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-[#6CAC73]">✦</span> Craftopia
                            </h3>
                            <p className="text-gray-300 text-sm leading-relaxed mb-6">
                                Transforming recyclable materials into beautiful projects with AI magic.
                            </p>
                            <div className="flex gap-4">
                                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                                    <a
                                        key={idx}
                                        href="#"
                                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#6CAC73] transition-colors duration-300"
                                    >
                                        <Icon className="w-4 h-4 text-white" />
                                    </a>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-lg mb-4 text-[#6CAC73]">Quick Links</h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li>
                                <Link to="/" className="hover:text-white hover:underline transition-colors decoration-[#6CAC73]">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <button
                                    onClick={() => scrollToSection('features')}
                                    className="hover:text-white hover:underline transition-colors decoration-[#6CAC73] text-left"
                                >
                                    Features
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => scrollToSection('how-it-works')}
                                    className="hover:text-white hover:underline transition-colors decoration-[#6CAC73] text-left"
                                >
                                    How It Works
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-bold text-lg mb-4 text-[#6CAC73]">Legal</h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li>
                                <Link to="/privacy-policy" className="hover:text-white hover:underline transition-colors decoration-[#6CAC73]">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms-and-conditions" className="hover:text-white hover:underline transition-colors decoration-[#6CAC73]">
                                    Terms & Conditions
                                </Link>
                            </li>
                            <li>
                                <Link to="/cookie-policy" className="hover:text-white hover:underline transition-colors decoration-[#6CAC73]">
                                    Cookie Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/acceptable-use" className="hover:text-white hover:underline transition-colors decoration-[#6CAC73]">
                                    Acceptable Use
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold text-lg mb-4 text-[#6CAC73]">Contact</h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li>support@craftopia.com</li>
                            <li>1-800-CRAFT-AI</li>
                            <li>123 Maker Street, Tech City</li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
                    <p>© {currentYear} Craftopia. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};
