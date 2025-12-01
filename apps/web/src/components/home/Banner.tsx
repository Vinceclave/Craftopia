import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Scan, Zap, Users, Star, ChevronDown, Download, Lock } from 'lucide-react';
import banner from '../../assets/banner.png';

export const Banner = () => {
  const features = [
    {
      icon: Scan,
      title: "Material Scanner",
      description: "AI-powered recognition"
    },
    {
      icon: Zap,
      title: "Instant Ideas",
      description: "Craft suggestions"
    },
    {
      icon: Users,
      title: "Community",
      description: "Share with makers"
    }
  ];

  const stats = [
    { number: '50K+', label: 'Active Crafters' },
    { number: '100K+', label: 'Projects Created' },
    { number: '4.9', label: 'Store Rating' },
    { number: '10K+', label: 'Materials' }
  ];

  const scrollToNextSection = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  const handleApkDownload = () => {
    // Add your actual APK download link here
    window.location.href = "/craftopia.apk";
  };

  // Reduced floating elements for better performance
  const floatingElements = [...Array(3)];

  return (
    <section className="relative min-h-screen overflow-hidden flex flex-col justify-center bg-[#FFF9F0]">
      {/* Background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFF9F0] to-white" />
      
      {/* Reduced Floating Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
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
      
      {/* Main Photo - Desktop Only */}
      <motion.div 
        className="hidden xl:block absolute right-0 bottom-0 w-1/2 h-4/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <img 
          src={banner}
          alt="Craftopia in Action"
          className="w-full h-full object-cover mask-image-linear-gradient"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#FFF9F0]" />
        
        {/* Floating Rating Badge */}
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
      <div className="relative z-10 container mx-auto px-4 pt-20 pb-12 xl:py-0 flex items-center min-h-[calc(100vh-80px)] xl:min-h-screen">
        <div className="w-full max-w-3xl mx-auto xl:max-w-none xl:mx-0 xl:w-1/2">
          {/* Text Content */}
          <div className="text-center xl:text-left flex flex-col items-center xl:items-start">
            
            {/* App Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-4 bg-white/80 backdrop-blur-sm text-[#2B4A2F] border border-[#6CAC73]/20 px-3 py-1.5 rounded-full shadow-sm text-xs">
                <Sparkles className="w-3 h-3 mr-1.5" />
                Early Access - Beta Release
              </Badge>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="w-full"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2B4A2F] mb-4 leading-tight">
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
              className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed max-w-xl mx-auto xl:mx-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Transform recyclable materials into beautiful projects with our AI-powered crafting assistant.
            </motion.p>
            
            {/* Download Buttons Container - COMPACT VERSION */}
            <motion.div
              className="flex flex-wrap gap-2 justify-center xl:justify-start mb-8 w-full max-w-lg xl:max-w-none"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {/* APK Button (Active) */}
              <Button 
                onClick={handleApkDownload}
                className="flex-1 min-w-[130px] sm:flex-none bg-[#2B4A2F] text-white px-3 py-2.5 h-auto rounded-lg hover:bg-[#2B4A2F]/90 transition-all duration-200 shadow-md group border border-[#2B4A2F]"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <div className="text-left">
                    <div className="text-[9px] uppercase font-medium opacity-80 leading-none mb-0.5">Direct Download</div>
                    <div className="text-xs font-bold leading-none">Get APK</div>
                  </div>
                </div>
              </Button>

              {/* App Store (Coming Soon) */}
              <Button disabled className="flex-1 min-w-[130px] sm:flex-none bg-neutral-100 text-gray-400 px-3 py-2.5 h-auto rounded-lg border border-gray-200 shadow-sm opacity-80 cursor-not-allowed">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <svg className="w-4 h-4 grayscale opacity-50" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    {/* Tiny Lock Icon Overlay */}
                    <Lock className="w-2 h-2 absolute -top-1 -right-1 text-gray-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-[9px] uppercase font-medium opacity-60 leading-none mb-0.5">App Store</div>
                    <div className="text-xs font-bold leading-none">Coming Soon</div>
                  </div>
                </div>
              </Button>

              {/* Google Play (Coming Soon) */}
              <Button disabled className="flex-1 min-w-[130px] sm:flex-none bg-neutral-100 text-gray-400 px-3 py-2.5 h-auto rounded-lg border border-gray-200 shadow-sm opacity-80 cursor-not-allowed">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <svg className="w-4 h-4 grayscale opacity-50" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.25-.84-.76-.84-1.35m13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27m3.35-4.31c.34.27.59.69.59 1.19s-.25.92-.59 1.19l-2.01 1.25-2.27-2.27 2.01-1.25c.5-.31 1.14-.31 1.64 0l.63.39.6-.42m-2.37-3.15l2.27 2.27 2.01-1.25c.5-.31.86-.83.86-1.41 0-.58-.36-1.1-.86-1.41l-2.03-1.26-2.25 2.26z"/>
                    </svg>
                    <Lock className="w-2 h-2 absolute -top-1 -right-1 text-gray-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-[9px] uppercase font-medium opacity-60 leading-none mb-0.5">Google Play</div>
                    <div className="text-xs font-bold leading-none">Coming Soon</div>
                  </div>
                </div>
              </Button>
            </motion.div>

            {/* App Features - Mobile Optimized Grid */}
            <div className="grid grid-cols-3 gap-2 mb-8 w-full max-w-xl xl:max-w-none">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="bg-white/60 backdrop-blur-sm rounded-xl p-2.5 shadow-sm border border-white/20 flex flex-col items-center xl:items-start"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-lg flex items-center justify-center mb-1.5">
                    <feature.icon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-[#2B4A2F] text-[10px] sm:text-xs mb-0.5 text-center xl:text-left w-full truncate">
                    {feature.title}
                  </h3>
                  <p className="text-[9px] sm:text-[10px] text-gray-600 text-center xl:text-left leading-tight hidden sm:block">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* App Stats */}
            <motion.div
              className="flex flex-wrap justify-center xl:justify-start gap-4 sm:gap-8 pt-4 border-t border-[#6CAC73]/20 w-full max-w-xl mx-auto xl:mx-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center xl:text-left min-w-[70px]">
                  <div className="text-lg sm:text-2xl font-bold text-[#2B4A2F]">{stat.number}</div>
                  <div className="text-[10px] sm:text-xs text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Dropdown Arrow */}
      <motion.button
        onClick={scrollToNextSection}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg border border-[#6CAC73]/20 hover:bg-white transition-all duration-200 hidden sm:block"
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