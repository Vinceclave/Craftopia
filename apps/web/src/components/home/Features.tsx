import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Target, Users, Zap} from 'lucide-react';

export const Features = () => {
  const features = [
    {
      icon: Sparkles,
      title: "AI Craft Generator",
      description: "Transform any material into creative projects with our intelligent AI",
      color: "from-[#6CAC73] to-[#2B4A2F]",
      items: [
        "Material scanning",
        "Instant craft ideas", 
        "Step-by-step guides"
      ]
    },
    {
      icon: Target,
      title: "Weekly Challenges",
      description: "Join themed crafting challenges and win exclusive badges",
      color: "from-[#FF6B6B] to-[#FF8E53]",
      items: [
        "Premium rewards",
        "Skill building"
      ]
    },
    {
      icon: Users,
      title: "Creative Feed",
      description: "Discover inspiration from our global community of makers",
      color: "from-[#4F46E5] to-[#7E22CE]",
      items: [
        "Trending projects",
        "Share your creations"
      ]
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-[#FFF9F0] to-white">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-white/80 backdrop-blur-sm text-[#2B4A2F] border border-[#6CAC73]/20 px-4 py-2 rounded-full shadow-sm">
            <Zap className="w-4 h-4 mr-2" />
            Core Features
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-[#2B4A2F] mb-4">
            Everything You Need to <span className="bg-gradient-to-r from-[#2B4A2F] to-[#6CAC73] bg-clip-text text-transparent">Create Magic</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From AI-powered crafting to community challenges, discover tools that turn your recyclables into masterpieces
          </p>
        </motion.div>

        {/* Main Features Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="group"
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                
                {/* Icon */}
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-[#2B4A2F] mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-6 flex-grow">
                  {feature.description}
                </p>

                {/* Feature List */}
                <ul className="space-y-2 mb-6">
                  {feature.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center text-sm text-gray-600">
                      <div className={`w-2 h-2 bg-gradient-to-r ${feature.color} rounded-full mr-3`} />
                      {item}
                    </li>
                  ))}
                </ul>

                <Button className="w-full bg-gradient-to-r from-[#2B4A2F] to-[#6CAC73] hover:from-[#6CAC73] hover:to-[#2B4A2F] text-white border-0">
                  Explore Feature
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        </div>
    </section>
  );
};