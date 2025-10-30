import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  X, 
  Camera, 
  Sparkles, 
  Image, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Download,
  Share2,
  Zap,
  Scan,
  Lightbulb,
  Layers,
  Rocket
} from 'lucide-react';

export const HowItWorks = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      step: 1,
      icon: Camera, // This is now the actual Camera component
      title: "Scan & Capture",
      description: "Take a photo of your recyclable materials using your phone's camera",
      subtitle: "AI will automatically identify materials and quantities",
      color: "from-blue-500 to-cyan-500",
      features: [
        "Smart material detection",
        "Automatic categorization", 
        "Quantity estimation",
        "Quality assessment"
      ],
      visual: (
        <div className="relative">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <Badge className="bg-blue-100 text-blue-700 text-xs">SCANNING</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Plastic Bottles', count: 3, color: 'from-blue-400 to-cyan-400' },
                { name: 'Glass Jars', count: 2, color: 'from-emerald-400 to-green-400' },
                { name: 'Cardboard', count: 1, color: 'from-amber-400 to-orange-400' },
                { name: 'Metal Cans', count: 4, color: 'from-gray-400 to-gray-500' }
              ].map((item, idx) => (
                <motion.div
                  key={item.name}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-xl p-3 text-center shadow-sm border"
                >
                  <div className={`w-8 h-8 bg-gradient-to-br ${item.color} rounded-lg mx-auto mb-2 flex items-center justify-center`}>
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 block">{item.name}</span>
                  <span className="text-xs text-gray-500">({item.count} detected)</span>
                </motion.div>
              ))}
            </div>
          </div>
          <motion.div
            animate={{ x: [0, 20, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-2 -right-2"
          >
            <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 py-1 text-xs">
              <Scan className="w-3 h-3 mr-1" />
              AI Active
            </Badge>
          </motion.div>
        </div>
      )
    },
    {
      step: 2,
      icon: Sparkles, // This is now the actual Sparkles component
      title: "AI Suggestions",
      description: "Get personalized craft ideas based on your available materials",
      subtitle: "Multiple creative options tailored to your skill level",
      color: "from-purple-500 to-pink-500",
      features: [
        "Personalized recommendations",
        "Difficulty matching",
        "Time & cost estimates", 
        "AR preview available"
      ],
      visual: (
        <div className="relative">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {[
                { 
                  name: 'Herb Garden', 
                  time: '2 hours', 
                  difficulty: 'Easy',
                  materials: 'Bottles',
                  popularity: '🔥 1.2K'
                },
                { 
                  name: 'Wall Art', 
                  time: '1 hour', 
                  difficulty: 'Medium',
                  materials: 'Jars + Paint',
                  popularity: '✨ 892'
                },
                { 
                  name: 'Planters', 
                  time: '45 mins', 
                  difficulty: 'Easy',
                  materials: 'Cans',
                  popularity: '⭐ 2.1K'
                }
              ].map((project) => (
                <motion.div
                  key={project.name}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="flex-shrink-0 w-48 bg-white rounded-xl p-4 shadow-lg border"
                >
                  <div className="w-full h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg mb-3 flex items-center justify-center">
                    <Lightbulb className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-sm text-gray-800 mb-2">{project.name}</h4>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>⏱️ {project.time}</span>
                      <Badge variant="outline" className="text-xs px-1">
                        {project.difficulty}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>🛠️ {project.materials}</span>
                      <span>{project.popularity}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-2 -left-2"
          >
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 text-xs">
              <Zap className="w-3 h-3 mr-1" />
              3 Ideas
            </Badge>
          </motion.div>
        </div>
      )
    },
    {
      step: 3,
      icon: Image, // This is now the actual Image component
      title: "View Steps & Samples",
      description: "Browse through detailed instructions and sample images",
      subtitle: "Step-by-step guides with visual references",
      color: "from-green-500 to-emerald-500",
      features: [
        "Interactive tutorials",
        "Sample images",
        "Video demonstrations",
        "Pro tips & tricks"
      ],
      visual: (
        <div className="relative">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-gray-800">Herb Garden Project</h4>
                <p className="text-sm text-gray-600">5 steps • 2 hours • Easy</p>
              </div>
              <Badge className="bg-green-100 text-green-700 text-xs">
                <Layers className="w-3 h-3 mr-1" />
                Tutorial
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-lg p-3 border text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white font-bold">1</span>
                </div>
                <span className="text-xs font-medium">Clean & Cut</span>
              </div>
              <div className="bg-white rounded-lg p-3 border text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white font-bold">2</span>
                </div>
                <span className="text-xs font-medium">Add Soil</span>
              </div>
              <div className="bg-white rounded-lg p-3 border text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white font-bold">3</span>
                </div>
                <span className="text-xs font-medium">Plant Seeds</span>
              </div>
              <div className="bg-white rounded-lg p-3 border text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white font-bold">4</span>
                </div>
                <span className="text-xs font-medium">Decorate</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-400 rounded-lg flex items-center justify-center">
                  <Image className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h5 className="font-semibold text-sm">Sample Result</h5>
                  <p className="text-xs text-gray-600">See what your finished project could look like</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      step: 4,
      icon: CheckCircle, // This is now the actual CheckCircle component
      title: "Create & Save",
      description: "Follow the steps, create your project, and save to your portfolio",
      subtitle: "Track your progress and share with the community",
      color: "from-amber-500 to-orange-500",
      features: [
        "Progress tracking",
        "Project portfolio",
        "Community sharing",
        "Achievement badges"
      ],
      visual: (
        <div className="relative">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-bold text-gray-800 text-lg">Project Complete! 🎉</h4>
              <p className="text-sm text-gray-600">Your herb garden is ready to grow</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-xs text-gray-600">Completed</span>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Download className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-xs text-gray-600">Saved</span>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Share2 className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-xs text-gray-600">Shared</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border text-center">
              <h5 className="font-semibold text-sm mb-2">🎊 Achievement Unlocked!</h5>
              <p className="text-xs text-gray-600 mb-3">"Eco Gardener" - First plant project</p>
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">
                Level Up! +50 XP
              </Badge>
            </div>
          </div>
        </div>
      )
    }
  ];

  const openModal = () => {
    setIsModalOpen(true);
    setCurrentStep(0);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      closeModal();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Get the current step's icon component
  const CurrentStepIcon = steps[currentStep].icon;

  return (
    <>
      <section className="py-20 bg-gradient-to-b from-white to-[#FFF9F0] overflow-hidden">
        <div className="container mx-auto px-4">
          
          {/* Header with Interactive Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Badge 
                onClick={openModal}
                className="mb-4 bg-white/80 backdrop-blur-sm text-[#2B4A2F] border border-[#6CAC73]/20 px-4 py-2 rounded-full shadow-sm cursor-pointer hover:bg-white transition-colors duration-200"
              >
                <Play className="w-4 h-4 mr-2" />
                How It Works
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="ml-1"
                >
                  →
                </motion.div>
              </Badge>
            </motion.div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-[#2B4A2F] mb-4">
              Create Magic in <span className="bg-gradient-to-r from-[#2B4A2F] to-[#6CAC73] bg-clip-text text-transparent">4 Simple Steps</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Watch your recyclables transform into extraordinary creations with our AI-powered platform
            </p>
          </motion.div>

        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-[#2B4A2F] to-[#6CAC73] p-6 text-white">
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <div className="text-center">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    Crafting Process
                  </h2>
                  <p className="text-white/80">
                    Step {currentStep + 1} of {steps.length}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 bg-white/20 rounded-full h-2">
                  <motion.div
                    className="bg-white h-2 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="grid lg:grid-cols-2 gap-8 items-start">
                  {/* Left Side - Step Info */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-16 h-16 bg-gradient-to-br ${steps[currentStep].color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                        {/* Fixed: Use the actual icon component */}
                        <CurrentStepIcon className="w-8 h-8" />
                      </div>
                      <div>
                        <Badge className={`bg-gradient-to-r ${steps[currentStep].color} text-white mb-2`}>
                          Step {steps[currentStep].step}
                        </Badge>
                        <h3 className="text-2xl font-bold text-[#2B4A2F]">
                          {steps[currentStep].title}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          {steps[currentStep].subtitle}
                        </p>
                      </div>
                    </div>

                    <p className="text-lg text-gray-700 leading-relaxed">
                      {steps[currentStep].description}
                    </p>

                    <div className="space-y-3">
                      {steps[currentStep].features.map((feature, index) => (
                        <motion.div
                          key={feature}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl"
                        >
                          <div className={`w-6 h-6 bg-gradient-to-br ${steps[currentStep].color} rounded-lg flex items-center justify-center`}>
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-gray-700 font-medium">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Right Side - Visual Demo */}
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center"
                  >
                    {steps[currentStep].visual}
                  </motion.div>
                </div>
              </div>

              {/* Footer - Navigation */}
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="flex justify-between items-center">
                  <Button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </Button>

                  <div className="flex space-x-2">
                    {steps.map((_, index) => (
                      <div
                        key={index}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentStep
                            ? `bg-gradient-to-r ${steps[currentStep].color}`
                            : index < currentStep
                            ? 'bg-green-500'
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  <Button
                    onClick={nextStep}
                    className="flex items-center space-x-2 bg-gradient-to-r from-[#2B4A2F] to-[#6CAC73] hover:from-[#6CAC73] hover:to-[#2B4A2F]"
                  >
                    <span>
                      {currentStep === steps.length - 1 ? 'Get Started' : 'Next Step'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};