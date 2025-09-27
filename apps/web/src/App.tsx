import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Users,
  Trophy,
  Repeat,
  Smartphone,
  DownloadCloud,
  Leaf,
  Lightbulb,
  Heart,
  Globe,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Craftopia Landing Page
// - Uses TailwindCSS for styling
// - Uses Framer Motion for animations
// - Uses Lucide React for icons
// Notes: Replace placeholder images/links with your real assets.

const stagger = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 * i },
  }),
};

const card = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: "easeOut" } },
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

const App = () => {
  const [activeSection, setActiveSection] = useState<"features" | "story">("features");
  const [storyStep, setStoryStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const storySteps = [
    {
      icon: Lightbulb,
      title: "The Spark of an Idea",
      content: "It all began when our founder, Sarah, noticed how much creative potential was being thrown away every day. From cardboard boxes to glass jars, each item held untapped possibilities for artistry and innovation.",
      color: "from-yellow-400 to-orange-400",
    },
    {
      icon: Leaf,
      title: "Growing a Green Vision",
      content: "We started small - a community workshop where neighbors would gather to transform their recyclables. The joy and creativity we witnessed showed us that sustainability could be beautiful, engaging, and community-driven.",
      color: "from-green-400 to-emerald-400",
    },
    {
      icon: Users,
      title: "Building a Movement",
      content: "As word spread, what began as local workshops grew into a global community. Thousands of makers joined, each bringing their unique perspective and creativity to the upcycling revolution.",
      color: "from-blue-400 to-cyan-400",
    },
    {
      icon: Sparkles,
      title: "The AI Revolution",
      content: "We integrated AI to make crafting accessible to everyone. Our smart suggestions help beginners and experts alike discover new ways to transform everyday materials into extraordinary creations.",
      color: "from-purple-400 to-pink-400",
    },
    {
      icon: Globe,
      title: "Global Impact",
      content: "Today, Craftopia has helped repurpose over 2 million items worldwide. Every craft tells a story of transformation - not just of materials, but of people rediscovering their creativity and connection to our planet.",
      color: "from-indigo-400 to-violet-400",
    },
  ];

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setStoryStep((prev) => {
      const nextStep = prev + newDirection;
      if (nextStep < 0) return storySteps.length - 1;
      if (nextStep >= storySteps.length) return 0;
      return nextStep;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-craftopia-light to-craftopia-surface text-craftopia-textPrimary antialiased">
      {/* Decorative background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-48 -left-48 w-[700px] h-[700px] bg-gradient-to-tr from-craftopia-secondary/30 via-craftopia-accent/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-48 -right-48 w-[600px] h-[600px] bg-gradient-to-bl from-craftopia-accent/20 via-craftopia-secondary/10 to-transparent rounded-full blur-3xl" />
      </div>

      {/* NAV */}
      <nav className="max-w-7xl mx-auto px-6 sm:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-craftopia-primary to-craftopia-secondary rounded-xl flex items-center justify-center shadow-2xl">
            <Sparkles className="w-5 h-5 text-craftopia-surface" />
          </div>
          <div>
            <div className="text-lg font-semibold tracking-wide">Craftopia</div>
            <div className="text-xs text-craftopia-textSecondary">Turn Waste into Wonder</div>
          </div>
        </div>

        <button className="inline-flex items-center gap-2 bg-craftopia-primary/10 backdrop-blur-sm border border-craftopia-primary/20 px-4 py-2 rounded-xl hover:scale-[1.02] transition text-craftopia-primary font-medium">Get Early Access</button>
      </nav>

      {/* HERO */}
      <header className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6">
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <p className="inline-flex items-center gap-2 text-sm text-craftopia-primary font-medium mb-4">
                <span className="bg-craftopia-secondary/20 px-3 py-1 rounded-full">New • AI-Powered</span>
                <span className="hidden sm:inline">Sustainability made playful</span>
              </p>

              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
                Reimagine Waste. <span className="text-transparent bg-clip-text bg-gradient-to-r from-craftopia-primary via-craftopia-secondary to-craftopia-accent">Redefine Creativity.</span>
              </h1>

              <p className="mt-6 text-lg text-craftopia-textSecondary max-w-xl leading-relaxed">
                Craftopia is your AI-powered companion that transforms everyday recyclables into innovative, sustainable crafts. Turn what you throw away into something extraordinary.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a href="#download" className="inline-flex items-center gap-3 bg-gradient-to-r from-craftopia-primary to-craftopia-secondary text-craftopia-surface font-semibold px-5 py-3 rounded-2xl shadow-xl hover:scale-[1.02] transform transition">
                  <DownloadCloud className="w-5 h-5" />
                  Download the App
                </a>

                <button 
                  onClick={() => setActiveSection("story")}
                  className="inline-flex items-center gap-2 border border-craftopia-primary/20 px-4 py-3 rounded-2xl text-craftopia-textPrimary hover:bg-craftopia-primary/5 transition"
                >
                  Our Story
                </button>
              </div>

              <div className="mt-8 flex items-center gap-4 text-sm text-craftopia-textSecondary">
                <div className="inline-flex items-center gap-3">
                  <div className="w-10 h-10 bg-craftopia-primary/10 rounded-lg flex items-center justify-center">★</div>
                  <div>
                    <div className="font-medium text-craftopia-textPrimary">150k+</div>
                    <div className="text-xs">Makers onboard</div>
                  </div>
                </div>

                <div className="inline-flex items-center gap-3">
                  <div className="w-10 h-10 bg-craftopia-primary/10 rounded-lg flex items-center justify-center">♻️</div>
                  <div>
                    <div className="font-medium text-craftopia-textPrimary">2M+</div>
                    <div className="text-xs">Items repurposed</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Mockup */}
          <div className="lg:col-span-6">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="flex justify-center lg:justify-end">
              <div className="relative w-[320px] sm:w-[360px] lg:w-[420px]">
                {/* floating glow */}
                <div className="absolute -inset-6 rounded-3xl blur-3xl bg-gradient-to-br from-craftopia-primary/20 to-craftopia-secondary/20 -z-10" />

                <div className="relative bg-gradient-to-b from-craftopia-light to-craftopia-surface border border-craftopia-primary/10 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl p-4">
                  <div className="flex justify-between items-center px-2">
                    <div className="w-12 h-4 rounded-md bg-craftopia-primary/10" />
                    <div className="text-xs text-craftopia-textSecondary">Craftopia</div>
                  </div>

                  <div className="mt-4 bg-gradient-to-tr from-craftopia-light/70 to-transparent rounded-xl p-4 h-[560px] sm:h-[520px] flex flex-col gap-4">
                    <div className="flex-1 rounded-lg border border-craftopia-primary/10 bg-craftopia-light flex items-center justify-center">
                      <Smartphone className="w-20 h-20 text-craftopia-textSecondary/70" />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs text-craftopia-textSecondary">Preview: AI Craft Generator</div>
                      <div className="text-xs text-craftopia-textSecondary">Swipe to explore ➜</div>
                    </div>
                  </div>
                </div>

                {/* small floating badges */}
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -left-6 -top-6 bg-gradient-to-br from-craftopia-primary to-craftopia-secondary p-2 rounded-xl shadow-lg">
                  <Sparkles className="w-5 h-5 text-craftopia-surface" />
                </motion.div>

                <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 3.2, repeat: Infinity }} className="absolute -right-6 -bottom-6 bg-gradient-to-br from-craftopia-primary to-craftopia-accent p-2 rounded-xl shadow-lg">
                  <Trophy className="w-5 h-5 text-craftopia-surface" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* FEATURES/STORY TOGGLE */}
      <section id="how" className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        <div className="flex justify-center mb-8">
          <div className="bg-craftopia-light border border-craftopia-primary/10 rounded-2xl p-1 inline-flex">
            <button
              onClick={() => setActiveSection("features")}
              className={`px-6 py-2 rounded-xl transition-all ${
                activeSection === "features" 
                  ? "bg-craftopia-primary text-craftopia-surface shadow-lg" 
                  : "text-craftopia-textSecondary hover:text-craftopia-textPrimary"
              }`}
            >
              Features
            </button>
            <button
              onClick={() => setActiveSection("story")}
              className={`px-6 py-2 rounded-xl transition-all ${
                activeSection === "story" 
                  ? "bg-craftopia-primary text-craftopia-surface shadow-lg" 
                  : "text-craftopia-textSecondary hover:text-craftopia-textPrimary"
              }`}
            >
              Our Story
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          {activeSection === "features" ? (
            <motion.div
              key="features"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div variants={card} className="bg-craftopia-light border border-craftopia-primary/10 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-craftopia-primary to-craftopia-secondary rounded-lg">
                      <Sparkles className="w-6 h-6 text-craftopia-surface" />
                    </div>
                    <div>
                      <h3 className="font-semibold">AI Craft Generator</h3>
                      <p className="text-sm text-craftopia-textSecondary mt-1">Tell Craftopia what recyclable items you have, and our AI suggests creative projects tailored to your materials.</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={card} className="bg-craftopia-light border border-craftopia-primary/10 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-craftopia-accent to-craftopia-secondary rounded-lg">
                      <Trophy className="w-6 h-6 text-craftopia-surface" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Eco-Challenges & Rewards</h3>
                      <p className="text-sm text-craftopia-textSecondary mt-1">Join gamified challenges that inspire eco-friendly crafting. Complete missions, earn rewards, and climb leaderboards.</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={card} className="bg-craftopia-light border border-craftopia-primary/10 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-craftopia-accent/80 to-craftopia-secondary rounded-lg">
                      <Users className="w-6 h-6 text-craftopia-surface" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Community Hub</h3>
                      <p className="text-sm text-craftopia-textSecondary mt-1">Share your creations, learn from others, and connect with a growing community of eco-conscious makers worldwide.</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={card} className="bg-craftopia-light border border-craftopia-primary/10 rounded-2xl p-6 backdrop-blur-sm opacity-90">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-craftopia-secondary/80 to-craftopia-accent rounded-lg">
                      <Repeat className="w-6 h-6 text-craftopia-surface" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Sustainable Marketplace</h3>
                      <p className="text-sm text-craftopia-textSecondary mt-1">Trade crafts, materials, and ideas in a future-ready marketplace designed to support upcycling and circular living. (Coming soon)</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="story"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="bg-craftopia-light border border-craftopia-primary/10 rounded-3xl p-8 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 bg-gradient-to-br ${storySteps[storyStep].color} rounded-xl`}>
                      {React.createElement(storySteps[storyStep].icon, { className: "w-8 h-8 text-white" })}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{storySteps[storyStep].title}</h2>
                      <div className="flex gap-1 mt-2">
                        {storySteps.map((_, index) => (
                          <div
                            key={index}
                            className={`h-1 rounded-full transition-all ${
                              index === storyStep ? "bg-craftopia-primary w-6" : "bg-craftopia-primary/30 w-3"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => paginate(-1)}
                      className="p-2 rounded-lg border border-craftopia-primary/20 hover:bg-craftopia-primary/5 transition"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => paginate(1)}
                      className="p-2 rounded-lg border border-craftopia-primary/20 hover:bg-craftopia-primary/5 transition"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <p className="text-lg text-craftopia-textSecondary leading-relaxed">
                  {storySteps[storyStep].content}
                </p>

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-sm text-craftopia-textSecondary">
                    Step {storyStep + 1} of {storySteps.length}
                  </span>
                  <button
                    onClick={() => paginate(1)}
                    className="inline-flex items-center gap-2 text-craftopia-primary hover:gap-3 transition-all"
                  >
                    Next Chapter <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* CTA */}
      <section id="download" className="max-w-7xl mx-auto px-6 sm:px-8 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-craftopia-light to-craftopia-surface/80 border border-craftopia-primary/10 rounded-3xl p-10 backdrop-blur-md relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[conic-gradient(circle,_rgba(55,74,54,.08),_rgba(107,142,107,.06),_rgba(212,169,106,.02))] blur-2xl" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-extrabold">Join the Upcycling Revolution Today</h2>
              <p className="mt-4 text-craftopia-textSecondary max-w-lg">Start transforming waste into wonder. Download Craftopia and be part of a movement where creativity meets sustainability.</p>

              <div className="mt-6 flex gap-4 flex-wrap">
                <a className="inline-flex items-center gap-2 border border-craftopia-primary/20 px-4 py-3 rounded-2xl hover:scale-[1.02] transition bg-white" href="#">
                  <span className="w-6 h-6 grid place-items-center bg-craftopia-light rounded"></span>
                  <div className="text-left text-xs">
                    <div className="font-semibold">Download for iOS</div>
                    <div className="text-craftopia-textSecondary">App Store</div>
                  </div>
                </a>

                <a className="inline-flex items-center gap-2 bg-craftopia-primary text-craftopia-surface border border-craftopia-primary px-4 py-3 rounded-2xl hover:scale-[1.02] transition" href="#">
                  <span className="w-6 h-6 grid place-items-center bg-craftopia-primary/20 rounded">⬇️</span>
                  <div className="text-left text-xs">
                    <div className="font-semibold">Download for Android</div>
                    <div className="text-craftopia-light/90">Google Play</div>
                  </div>
                </a>
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              <div className="w-[260px] h-[420px] rounded-3xl border border-craftopia-primary/10 bg-gradient-to-b from-craftopia-light to-craftopia-surface p-4 shadow-2xl">
                <div className="h-full rounded-xl overflow-hidden bg-craftopia-light flex items-center justify-center text-craftopia-textSecondary">App Preview</div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        <div className="border-t border-craftopia-primary/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-craftopia-primary to-craftopia-secondary rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-craftopia-surface" />
            </div>
            <div>
              <div className="font-semibold">Craftopia</div>
              <div className="text-xs text-craftopia-textSecondary">Turning Waste into Wonder</div>
            </div>
          </div>

          <div className="text-sm text-craftopia-textSecondary">
            © {new Date().getFullYear()} Craftopia. Built for dreamers, makers, and changemakers.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;