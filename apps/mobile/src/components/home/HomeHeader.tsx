import React, { useState } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Bell, Sparkles } from 'lucide-react-native';
import { useCurrentUser } from '~/hooks/useAuth';
import { useUnreadAnnouncementCount } from '~/hooks/queries/useAnnouncements';
import { NotificationModal } from './NotificationModal';

export const HomeHeader = () => {
  const { data: user } = useCurrentUser();
  const unreadCount = useUnreadAnnouncementCount();
  const [showNotifications, setShowNotifications] = useState(false);
  
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";

  const getMotivationalMessage = () => {
    const messages = [
      "Ready to create something beautiful?",
      "Your next masterpiece awaits!",
      "Transform waste into wonder!",
      "Every craft makes a difference!",
      "Let's build a greener world together!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <>
      <View className="px-4 pt-8 pb-3 bg-craftopia-surface border-b border-craftopia-light">
        {/* Main Header Row */}
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-1">
            <Text className="text-xs font-nunito text-craftopia-textSecondary mb-1">
              {`Good ${greeting}`}
            </Text>
            <Text className="text-lg font-poppinsBold text-craftopia-textPrimary">
              {user?.username || 'Crafter'}
            </Text>
          </View>
          
          <View className="flex-row items-center">
            <TouchableOpacity 
              className="relative active:opacity-70"
              onPress={() => setShowNotifications(true)}
            >
              <View className="w-9 h-9 rounded-lg bg-craftopia-light items-center justify-center border border-craftopia-light">
                <Bell size={16} color="#3B6E4D" />
              </View>
              
              {/* Unread Badge */}
              {unreadCount > 0 && (
                <View className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-craftopia-accent items-center justify-center border-2 border-craftopia-surface px-1">
                  <Text className="text-[10px] font-poppinsBold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Motivational Card */}
        <View className="bg-craftopia-light rounded-xl p-3 border border-craftopia-light">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-lg bg-craftopia-primary/10 items-center justify-center mr-3 border border-craftopia-primary/20">
              <Sparkles size={16} color="#3B6E4D" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-poppinsBold text-craftopia-textPrimary mb-1">
                {getMotivationalMessage()}
              </Text>
              <Text className="text-xs font-nunito text-craftopia-textSecondary">
                Complete today's quests to unlock rewards
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Notification Modal */}
      <NotificationModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
};