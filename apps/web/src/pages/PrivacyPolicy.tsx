import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { Footer } from '@/components/home/Footer';

export const PrivacyPolicy = () => {
    return (
        <>
            <div className="min-h-screen bg-[#FFF9F0] py-20">
                <div className="container mx-auto px-4 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#6CAC73] text-white mb-4 shadow-lg">
                            <Shield className="w-8 h-8" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-[#2B4A2F] mb-4">
                            Privacy Policy
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Last updated: December 12, 2025
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-white rounded-3xl shadow-xl p-8 md:p-12 space-y-8"
                    >
                        <section>
                            <h2 className="text-2xl font-bold text-[#2B4A2F] mb-4">Introduction</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Welcome to Craftopia. We respect your privacy and are committed to protecting your personal data.
                                This privacy policy will inform you about how we look after your personal data when you visit our
                                application and tell you about your privacy rights and how the law protects you.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2B4A2F] mb-4">Information We Collect</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                We may collect, use, store and transfer different kinds of personal data about you:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                                <li>Identity Data (name, username)</li>
                                <li>Contact Data (email address)</li>
                                <li>Technical Data (IP address, browser type, device information)</li>
                                <li>Usage Data (how you use our application)</li>
                                <li>Content Data (photos, craft projects, posts you create)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2B4A2F] mb-4">How We Use Your Information</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                We use your personal data for the following purposes:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                                <li>To provide and maintain our service</li>
                                <li>To process your craft generation requests using AI</li>
                                <li>To enable community features and social interactions</li>
                                <li>To send you notifications about challenges and updates</li>
                                <li>To improve our application and user experience</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2B4A2F] mb-4">Data Security</h2>
                            <p className="text-gray-600 leading-relaxed">
                                We have put in place appropriate security measures to prevent your personal data from being
                                accidentally lost, used or accessed in an unauthorized way, altered or disclosed. We limit
                                access to your personal data to those employees, agents, contractors and other third parties
                                who have a business need to know.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2B4A2F] mb-4">Your Rights</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                Under certain circumstances, you have rights under data protection laws in relation to your personal data:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                                <li>Request access to your personal data</li>
                                <li>Request correction of your personal data</li>
                                <li>Request erasure of your personal data</li>
                                <li>Object to processing of your personal data</li>
                                <li>Request restriction of processing your personal data</li>
                                <li>Request transfer of your personal data</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2B4A2F] mb-4">Contact Us</h2>
                            <p className="text-gray-600 leading-relaxed">
                                If you have any questions about this privacy policy or our privacy practices, please contact us at:
                                <br />
                                <a href="mailto:privacy@craftopia.com" className="text-[#6CAC73] hover:underline font-semibold">
                                    privacy@craftopia.com
                                </a>
                            </p>
                        </section>
                    </motion.div>
                </div>
            </div>
            <Footer />
        </>
    );
};
