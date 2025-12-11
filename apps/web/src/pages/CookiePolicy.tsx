import { motion } from 'framer-motion';
import { Cookie } from 'lucide-react';
import { Footer } from '@/components/home/Footer';

export const CookiePolicy = () => {
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
                            <Cookie className="w-8 h-8" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-[#2B4A2F] mb-4">
                            Cookie Policy
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
                            <h2 className="text-2xl font-bold text-[#2B4A2F] mb-4">What Are Cookies</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Cookies are small text files that are placed on your device when you visit our application.
                                They are widely used to make applications work more efficiently and provide information to
                                the owners of the application.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2B4A2F] mb-4">How We Use Cookies</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                Craftopia uses cookies for the following purposes:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                                <li><strong>Essential Cookies:</strong> Required for the operation of our application, including authentication and security</li>
                                <li><strong>Functional Cookies:</strong> Enable enhanced functionality and personalization, such as remembering your preferences</li>
                                <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our application</li>
                                <li><strong>Performance Cookies:</strong> Help us improve the performance and user experience of our application</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2B4A2F] mb-4">Types of Cookies We Use</h2>
                            <div className="space-y-4">
                                <div className="bg-[#FFF9F0] p-4 rounded-xl">
                                    <h3 className="font-bold text-[#2B4A2F] mb-2">Session Cookies</h3>
                                    <p className="text-gray-600 text-sm">
                                        Temporary cookies that expire when you close your browser. Used to maintain your session
                                        and keep you logged in.
                                    </p>
                                </div>
                                <div className="bg-[#FFF9F0] p-4 rounded-xl">
                                    <h3 className="font-bold text-[#2B4A2F] mb-2">Persistent Cookies</h3>
                                    <p className="text-gray-600 text-sm">
                                        Remain on your device for a set period or until you delete them. Used to remember your
                                        preferences and settings.
                                    </p>
                                </div>
                                <div className="bg-[#FFF9F0] p-4 rounded-xl">
                                    <h3 className="font-bold text-[#2B4A2F] mb-2">Third-Party Cookies</h3>
                                    <p className="text-gray-600 text-sm">
                                        Set by third-party services we use, such as analytics providers and authentication services.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2B4A2F] mb-4">Managing Cookies</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                You can control and manage cookies in various ways:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                                <li>Most browsers allow you to refuse or accept cookies</li>
                                <li>You can delete cookies that have already been set</li>
                                <li>You can set your browser to notify you when cookies are being sent</li>
                            </ul>
                            <p className="text-gray-600 leading-relaxed mt-4">
                                Please note that if you choose to block cookies, some features of Craftopia may not function properly.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2B4A2F] mb-4">Cookie Consent</h2>
                            <p className="text-gray-600 leading-relaxed">
                                By using Craftopia, you consent to our use of cookies in accordance with this Cookie Policy.
                                If you do not agree to our use of cookies, you should change your browser settings accordingly
                                or refrain from using our application.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2B4A2F] mb-4">Updates to This Policy</h2>
                            <p className="text-gray-600 leading-relaxed">
                                We may update this Cookie Policy from time to time to reflect changes in our practices or for
                                other operational, legal, or regulatory reasons. We encourage you to review this policy
                                periodically to stay informed about our use of cookies.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2B4A2F] mb-4">Contact Us</h2>
                            <p className="text-gray-600 leading-relaxed">
                                If you have any questions about our use of cookies, please contact us at:
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
