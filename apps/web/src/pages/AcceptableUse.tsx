import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { Footer } from '@/components/home/Footer';

export const AcceptableUse = () => {
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
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-[#2B4A2F] mb-4">
                            Acceptable Use Policy
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
                            <h2 className="text-2xl font-bold text-[#2B4A2F] mb-4">Purpose</h2>
                            <p className="text-gray-600 leading-relaxed">
                                This Acceptable Use Policy outlines the prohibited uses of Craftopia. By using our service,
                                you agree to comply with this policy. Violation of this policy may result in suspension or
                                termination of your account.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2B4A2F] mb-4">Prohibited Activities</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                You may not use Craftopia to:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                                <li>Violate any applicable laws or regulations</li>
                                <li>Infringe on the intellectual property rights of others</li>
                                <li>Transmit harmful, offensive, or inappropriate content</li>
                                <li>Harass, threaten, or abuse other users</li>
                                <li>Impersonate any person or entity</li>
                                <li>Distribute spam or unsolicited commercial content</li>
                                <li>Attempt to gain unauthorized access to our systems</li>
                                <li>Interfere with or disrupt the service or servers</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2B4A2F] mb-4">Content Standards</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                All content you post on Craftopia must:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                                <li>Be accurate and not misleading</li>
                                <li>Be appropriate for all ages</li>
                                <li>Respect the privacy and rights of others</li>
                                <li>Not contain malicious code or viruses</li>
                                <li>Not promote illegal activities or violence</li>
                                <li>Not contain explicit or adult content</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2B4A2F] mb-4">Community Behavior</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                We expect all users to:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                                <li>Treat others with respect and kindness</li>
                                <li>Provide constructive feedback</li>
                                <li>Give credit to original creators</li>
                                <li>Report inappropriate content or behavior</li>
                                <li>Follow community guidelines and moderator instructions</li>
                                <li>Contribute positively to the community</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2B4A2F] mb-4">Safety Guidelines</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                When sharing craft projects:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                                <li>Include appropriate safety warnings for potentially dangerous materials or tools</li>
                                <li>Provide age-appropriate recommendations</li>
                                <li>Do not encourage unsafe practices</li>
                                <li>Be mindful of environmental impact and sustainability</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2B4A2F] mb-4">Intellectual Property</h2>
                            <p className="text-gray-600 leading-relaxed">
                                You must respect intellectual property rights. Do not post content that infringes on copyrights,
                                trademarks, patents, or other proprietary rights. If you believe content on Craftopia violates
                                your intellectual property rights, please contact us immediately.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2B4A2F] mb-4">Enforcement</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                Violations of this policy may result in:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                                <li>Content removal</li>
                                <li>Warning notifications</li>
                                <li>Temporary suspension of account</li>
                                <li>Permanent termination of account</li>
                                <li>Legal action if required</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2B4A2F] mb-4">Reporting Violations</h2>
                            <p className="text-gray-600 leading-relaxed">
                                If you encounter content or behavior that violates this policy, please report it to us
                                immediately. We review all reports and take appropriate action.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2B4A2F] mb-4">Changes to This Policy</h2>
                            <p className="text-gray-600 leading-relaxed">
                                We may update this Acceptable Use Policy from time to time. Continued use of Craftopia after
                                changes are posted constitutes acceptance of the updated policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2B4A2F] mb-4">Contact Us</h2>
                            <p className="text-gray-600 leading-relaxed">
                                If you have questions about this Acceptable Use Policy or need to report a violation,
                                please contact us at:
                                <br />
                                <a href="mailto:support@craftopia.com" className="text-[#6CAC73] hover:underline font-semibold">
                                    support@craftopia.com
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
