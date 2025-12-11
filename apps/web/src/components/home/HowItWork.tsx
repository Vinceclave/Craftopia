import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Wand2, Hammer, Heart } from 'lucide-react';

const steps = [
  {
    icon: Camera,
    title: "Snap a Photo",
    description: "Focus on your materials. Our smart camera instantly identifies what you have.",
    color: "bg-[#E0F2F1]",
    textColor: "text-[#00695C]",
    screen: (
      <div className="flex flex-col items-center justify-center h-full relative overflow-hidden bg-gray-900/5">
        {/* Photo Placeholder */}
        <div className="absolute inset-4 bg-gray-200 rounded-2xl overflow-hidden shadow-inner">
          <div className="w-full h-full flex items-center justify-center bg-white/50">
            <Camera className="w-20 h-20 text-gray-300" />
          </div>

          {/* Scanning Beam */}
          <motion.div
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-1 bg-[#00695C] shadow-[0_0_20px_rgba(0,105,92,0.8)] z-10"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
          </motion.div>

          {/* Grid Overlay for Tech feel */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,105,92,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,105,92,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
        </div>

        <div className="absolute bottom-8 text-center bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg">
          <p className="text-xs font-bold text-[#00695C] uppercase tracking-wider">Analyzing Materials...</p>
        </div>
      </div>
    )
  },
  {
    icon: Wand2,
    title: "Get Ideas",
    description: "Our AI generates unique craft ideas based on your specific items.",
    color: "bg-[#F3E5F5]",
    textColor: "text-[#6A1B9A]",
    screen: (
      <div className="p-4 h-full flex flex-col justify-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-3"
        >
          {/* Shimmering Loading State transforming to Results */}
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.2, type: "spring" }}
              className="bg-white rounded-xl p-3 shadow-md flex items-center gap-3 border border-[#6A1B9A]/10"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                className="w-12 h-12 bg-[#F3E5F5] rounded-lg flex items-center justify-center"
              >
                <Wand2 className="w-6 h-6 text-[#6A1B9A]" />
              </motion.div>
              <div className="flex-1 space-y-2">
                <div className="h-2.5 bg-gray-100 rounded-full w-3/4 overflow-hidden relative">
                  <motion.div
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-[#6A1B9A]/20 to-transparent"
                  />
                </div>
                <div className="h-2 bg-gray-100 rounded-full w-1/2" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Floating Ideas Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-[#6A1B9A] rounded-full opacity-20"
              animate={{ y: -100, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
              style={{ left: `${20 + i * 15}%`, bottom: '20%' }}
            />
          ))}
        </div>
      </div>
    )
  },
  {
    icon: Hammer,
    title: "Ease Crafting",
    description: "Follow simple, step-by-step interactive guides to build your masterpiece.",
    color: "bg-[#FFF3E0]",
    textColor: "text-[#E65100]",
    screen: (
      <div className="h-full flex flex-col p-5 bg-gradient-to-b from-white/50 to-white/20">
        {/* Progress Header */}
        <div className="mb-6 bg-white rounded-xl p-3 shadow-sm">
          <div className="flex justify-between text-xs mb-2 font-bold text-[#E65100]">
            <span>Progress</span>
            <span>75%</span>
          </div>
          <div className="h-2 bg-[#FFF3E0] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              whileInView={{ width: "75%" }}
              transition={{ duration: 1.5, ease: "circOut" }}
              className="h-full bg-[#E65100]"
            />
          </div>
        </div>

        {/* Dynamic Checklist */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.4 }}
              className="flex items-center gap-3 bg-white/80 p-3 rounded-xl border border-white shadow-sm"
            >
              <div className="relative">
                <div className="w-6 h-6 rounded-full border-2 border-[#E65100] flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: i * 0.4 + 0.3, type: "spring" }}
                    className="w-3 h-3 bg-[#E65100] rounded-full"
                  />
                </div>
              </div>
              <div className="h-2 bg-gray-200 rounded w-full" />
            </motion.div>
          ))}
        </div>
      </div>
    )
  },
  {
    icon: Heart,
    title: "Share & Inspire",
    description: "Share your creation with the community and connect with other crafters.",
    color: "bg-[#FFF8E1]",
    textColor: "text-[#F57F17]",
    screen: (
      <div className="h-full flex flex-col relative bg-gradient-to-br from-[#FFF8E1] to-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#F57F17 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

        {/* Success Message */}
        <div className="pt-12 pb-4 text-center z-10">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            className="text-[#F57F17] font-bold text-xl"
          >
            Creation Shared!
          </motion.div>
        </div>

        {/* Social Card */}
        <div className="flex-1 flex flex-col items-center justify-start pt-4 px-4 z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="bg-white rounded-3xl p-4 shadow-xl w-full max-w-[240px] relative overflow-hidden"
          >
            {/* Image Placeholder */}
            <div className="w-full h-32 bg-gray-100 rounded-2xl mb-4 relative overflow-hidden group">
              <div className="absolute inset-0 flex items-center justify-center bg-[#FFF8E1]">
                <Heart className="w-8 h-8 text-[#F57F17]/50" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-2 w-20 bg-gray-200 rounded mb-1" />
                <div className="h-2 w-12 bg-gray-100 rounded" />
              </div>
            </div>

            {/* Likes Section */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="p-1.5 bg-red-50 rounded-full"
              >
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              </motion.div>
              <span className="text-xs font-bold text-gray-600">You and 24 others</span>
            </div>
          </motion.div>
        </div>

        {/* Floating Hearts */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: 600, x: 0, opacity: 0, scale: 0 }}
            whileInView={{
              y: -50,
              x: (Math.random() - 0.5) * 200,
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 3,
              delay: i * 0.3,
              ease: "easeOut",
              repeat: Infinity,
              repeatDelay: 1
            }}
            className="absolute bottom-0 text-red-500"
            style={{ left: '50%' }}
          >
            <Heart className="w-6 h-6 fill-red-500/50" />
          </motion.div>
        ))}
      </div>
    )
  }
];

export const HowItWorks = () => {
  return (
    <div id="how-it-works" className="bg-[#FFF9F0]">
      {steps.map((step, index) => (
        <Step key={index} step={step} index={index} />
      ))}
    </div>
  );
};

const Step = ({ step, index }: { step: any, index: number }) => {
  const isEven = index % 2 === 0;

  return (
    <section className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="container mx-auto max-w-6xl grid md:grid-cols-2 gap-12 items-center">

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: isEven ? -50 : 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`space-y-8 ${isEven ? 'md:order-1 md:text-left' : 'md:order-2 md:text-left'} text-center md:flex md:flex-col md:items-start`}
        >
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${step.color} ${step.textColor} mb-2 shadow-sm`}>
            <step.icon className="w-8 h-8" />
          </div>

          <div className="space-y-4">
            <div className="text-sm font-bold uppercase tracking-wider text-gray-400">
              Step 0{index + 1}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#2B4A2F] leading-tight">
              {step.title}
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed max-w-md">
              {step.description}
            </p>
          </div>
        </motion.div>

        {/* Phone Frame */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`flex justify-center ${isEven ? 'md:order-2' : 'md:order-1'}`}
        >
          <PhoneFrame color={step.color}>
            {step.screen}
          </PhoneFrame>
        </motion.div>
      </div>
    </section>
  )
}

const PhoneFrame = ({ children, color }: { children: React.ReactNode, color: string }) => (
  <div className="relative w-[300px] h-[600px] bg-gray-900 rounded-[3rem] p-4 shadow-2xl border-[6px] border-gray-900 ring-1 ring-gray-950/50 transform hover:scale-[1.02] transition-transform duration-500">
    {/* Dynamic Island / Notch */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-2xl z-20"></div>

    {/* Screen */}
    <div className={`w-full h-full rounded-[2.5rem] overflow-hidden ${color} relative`}>
      {/* Status Bar Placeholder */}
      <div className="h-10 w-full bg-black/5 absolute top-0 left-0 z-10" />

      {/* Content */}
      <div className="w-full h-full pt-12 pb-8 px-4">
        {children}
      </div>

      {/* Home Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/20 rounded-full" />
    </div>

    {/* Side Buttons */}
    <div className="absolute top-24 -right-2 w-1 h-12 bg-gray-800 rounded-r-md" />
    <div className="absolute top-24 -left-2 w-1 h-8 bg-gray-800 rounded-l-md" />
    <div className="absolute top-36 -left-2 w-1 h-12 bg-gray-800 rounded-l-md" />
  </div>
)
