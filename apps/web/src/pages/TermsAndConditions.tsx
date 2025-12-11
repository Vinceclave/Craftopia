import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { Footer } from '@/components/home/Footer';

export const TermsAndConditions = () => {
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
                            <FileText className="w-8 h-8" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-[#2B4A2F] mb-4">
                            Terms & Conditions
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
                            <h2 className="text-2xl font-bold text-[#2B4A2F] mb-4">Agreement to Terms</h2>
                            <p className="text-gray-600 leading-relaxed">
                                By accessing and using Craftopia, you accept and agree to be bound by the terms and provision
                                of this agreement. If you do not agree to abide by the above, please do not use this service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2B4A2F] mb-4">Use License</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                Permission is granted to temporarily download one copy of Craftopia for personal,
                                non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                                <li>Modify or copy the materials</li>
                                <li>Use the materials for any commercial purpose</li>
                                <li>Attempt to decompile or reverse engineer any software contained in Craftopia</li>
                                <li>Remove any copyright or other proprietary notations from the materials</li>
                                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2B4A2F] mb-4">User Content</h2>
                            <p className="text-gray-600 leading-relaxed">
                                You retain all rights to the content you create and share on Craftopia. By posting content,
                                you grant Craftopia a worldwide, non-exclusive, royalty-free license to use, reproduce,
                                modify, and display your content for the purpose of operating and promoting the service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2B4A2F] mb-4">Community Guidelines</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                When using Craftopia, you agree to:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                                <li>Be respectful and kind to other community members</li>
                                <li>Not post offensive, harmful, or inappropriate content</li>
                                <li>Not spam or engage in commercial solicitation</li>
                                <li>Not impersonate others or misrepresent your identity</li>
                                <li>Respect intellectual property rights</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2B4A2F] mb-4">AI-Generated Content</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Craftopia uses artificial intelligence to generate craft ideas and instructions. While we
                                strive for accuracy, AI-generated content may contain errors or inaccuracies. Users should
                                exercise their own judgment and take appropriate safety precautions when following craft instructions.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2B4A2F] mb-4">Disclaimer</h2>
                            <p className="text-gray-600 leading-relaxed">
                                The materials on Craftopia are provided on an 'as is' basis. Craftopia makes no warranties,
                                expressed or implied, and hereby disclaims and negates all other warranties including, without
                                limitation, implied warranties or conditions of merchantability, fitness for a particular purpose,
                                or non-infringement of intellectual property or other violation of rights.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2B4A2F] mb-4">Limitations</h2>
                            <p className="text-gray-600 leading-relaxed">
                                In no event shall Craftopia or its suppliers be liable for any damages (including, without
                                limitation, damages for loss of data or profit, or due to business interruption) arising out
                                of the use or inability to use Craftopia.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2B4A2F] mb-4">Modifications</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Craftopia may revise these terms of service at any time without notice. By using this
                                application, you are agreeing to be bound by the then current version of these terms of service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-[#2B4A2F] mb-4">Contact Information</h2>
                            <p className="text-gray-600 leading-relaxed">
                                If you have any questions about these Terms & Conditions, please contact us at:
                                <br />
                                <a href="mailto:legal@craftopia.com" className="text-[#6CAC73] hover:underline font-semibold">
                                    legal@craftopia.com
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
