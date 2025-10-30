import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Scan, Zap, Users, Star, ChevronDown } from 'lucide-react';
import banner from '../../assets/banner.png';

export const Banner = () => {
  const features = [
    {
      icon: Scan,
      title: "Material Scanner",
      description: "AI-powered material recognition"
    },
    {
      icon: Zap,
      title: "Instant Ideas",
      description: "Personalized craft suggestions"
    },
    {
      icon: Users,
      title: "Community",
      description: "Share with creative makers"
    }
  ];

  const stats = [
    { number: '50K+', label: 'Active Crafters' },
    { number: '100K+', label: 'Projects Created' },
    { number: '4.9', label: 'App Store Rating' },
    { number: '10K+', label: 'Materials Scanned' }
  ];

  const scrollToNextSection = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  // Reduced floating elements for better performance
  const floatingElements = [...Array(3)];

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFF9F0] to-white" />
      
      {/* Reduced Floating Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingElements.map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#6CAC73] rounded-full opacity-20"
            animate={{
              y: [0, -20, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 1.5,
              ease: "easeInOut"
            }}
            style={{
              left: `${25 + i * 25}%`,
              top: `${40 + (i % 2) * 20}%`,
            }}
          />
        ))}
      </div>
      
      {/* Main Photo - Desktop Only with simpler animation */}
      <motion.div 
        className="hidden xl:block absolute right-0 bottom-0 w-1/2 h-4/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <img 
          src={banner}
          alt="Craftopia in Action"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#FFF9F0]" />
        
        {/* Floating Rating Badge with reduced animation */}
        <motion.div
          className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-3"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.8 }}
        >
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-[#FFD700] text-[#FFD700]" />
              ))}
            </div>
            <div className="text-xs font-semibold text-[#2B4A2F]">4.9</div>
          </div>
          <div className="text-xs text-gray-600 mt-0.5">2K+ Reviews</div>
        </motion.div>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-screen flex items-center">
        <div className="w-full max-w-3xl mx-auto xl:max-w-none xl:mx-0 xl:w-1/2">
          {/* Text Content */}
          <div className="text-center xl:text-left">
            
            {/* App Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-3 sm:mb-4 bg-white/80 backdrop-blur-sm text-[#2B4A2F] border border-[#6CAC73]/20 px-2 sm:px-3 py-1 rounded-full shadow-sm text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                Download Now - Free Forever
              </Badge>
            </motion.div>

            {/* Main Heading with staggered animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#2B4A2F] mb-3 sm:mb-4 leading-tight">
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  AI Crafting
                </motion.span>
                <motion.span
                  className="block bg-gradient-to-r from-[#2B4A2F] to-[#6CAC73] bg-clip-text text-transparent mt-1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  In Your Pocket
                </motion.span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed max-w-xl mx-auto xl:mx-0 px-2 sm:px-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Transform recyclable materials into beautiful projects with our AI-powered crafting assistant. Available on iOS and Android.
            </motion.p>
            
            {/* App Store Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center xl:justify-start mb-4 sm:mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button className="bg-black text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl hover:bg-black/90 transition-all duration-200 w-full sm:w-auto shadow-lg text-sm">
                <div className="flex items-center gap-2 sm:gap-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-sm sm:text-base font-semibold">App Store</div>
                  </div>
                </div>
              </Button>

              <Button className="bg-black text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl hover:bg-black/90 transition-all duration-200 w-full sm:w-auto shadow-lg text-sm">
                <div className="flex items-center gap-2 sm:gap-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.25-.84-.76-.84-1.35m13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27m3.35-4.31c.34.27.59.69.59 1.19s-.25.92-.59 1.19l-2.01 1.25-2.27-2.27 2.01-1.25c.5-.31 1.14-.31 1.64 0l.63.39.6-.42m-2.37-3.15l2.27 2.27 2.01-1.25c.5-.31.86-.83.86-1.41 0-.58-.36-1.1-.86-1.41l-2.03-1.26-2.25 2.26z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-sm sm:text-base font-semibold">Google Play</div>
                  </div>
                </div>
              </Button>
            </motion.div>

            {/* App Features with reduced animations */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6 max-w-xl mx-auto xl:mx-0">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="bg-white/60 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-white/20"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-lg flex items-center justify-center mb-2 mx-auto xl:mx-0">
                    <feature.icon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-[#2B4A2F] text-xs mb-0.5 text-center xl:text-left">{feature.title}</h3>
                  <p className="text-xs text-gray-600 text-center xl:text-left leading-tight">{feature.description}</p>
                </motion.div>
              ))}
            </div>

            {/* App Stats */}
            <motion.div
              className="flex flex-wrap justify-center xl:justify-start gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-[#6CAC73]/20 max-w-xl mx-auto xl:mx-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center xl:text-left">
                  <div className="text-base sm:text-lg font-bold text-[#2B4A2F]">{stat.number}</div>
                  <div className="text-xs text-gray-600">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Dropdown Arrow with simplified animation */}
      <motion.button
        onClick={scrollToNextSection}
        className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-20 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg border border-[#6CAC73]/20 hover:bg-white transition-all duration-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <motion.div
          animate={{ y: [0, 3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-[#2B4A2F]" />
        </motion.div>
      </motion.button>
    </section>
  );
};