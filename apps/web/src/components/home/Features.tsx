import { motion } from 'framer-motion';
import { Sparkles, Target, Users, ArrowRight } from 'lucide-react';

export const Features = () => {
  const features = [
    {
      icon: Sparkles,
      title: "AI Craft Generator",
      description: "Instantly transform your available materials into unique, step-by-step projects.",
      color: "from-[#6CAC73] to-[#2B4A2F]"
    },
    {
      icon: Target,
      title: "Weekly Challenges",
      description: "Participate in themed creative challenges and earn exclusive badges for your profile.",
      color: "from-[#FF8E53] to-[#E65100]"
    },
    {
      icon: Users,
      title: "Community Feed",
      description: "Share your creations, discover new ideas, and connect with fellow makers worldwide.",
      color: "from-[#7E22CE] to-[#4A148C]"
    }
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden bg-[#FFF9F0]">
      {/* Subtle Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#6CAC73] rounded-full mix-blend-multiply filter blur-[128px] opacity-10" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#FF8E53] rounded-full mix-blend-multiply filter blur-[128px] opacity-10" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-[#6CAC73] font-semibold tracking-wider text-xs uppercase mb-3 block">Features</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#2B4A2F] mb-6">
            Magic in Every Feature
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-base leading-relaxed">
            Powerful tools designed to unleash your creativity, wrapped in a simple, beautiful interface that feels like magic.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="group relative rounded-3xl p-6 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-xl font-bold text-[#2B4A2F] mb-3 group-hover:text-[#6CAC73] transition-colors">
                {feature.title}
              </h3>

              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                {feature.description}
              </p>

              <div className="flex items-center text-[#2B4A2F] font-semibold text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                Learn more <ArrowRight className="w-3.5 h-3.5 ml-2" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};