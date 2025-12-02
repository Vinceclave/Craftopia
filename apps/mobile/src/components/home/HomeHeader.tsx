import React, { useState, useMemo } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Bell, Sparkles } from 'lucide-react-native';
import { useCurrentUser } from '~/hooks/useAuth';
import { useUnreadAnnouncementCount } from '~/hooks/queries/useAnnouncements';
import { NotificationModal } from './NotificationModal';

const MOTIVATIONAL_MESSAGES = [
  "Ready to create something beautiful?",
  "Your next masterpiece awaits!",
  "Transform waste into wonder!",
  "Every craft makes a difference!",
  "Let's build a greener world together!"
] as const;

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 18) return "Afternoon";
  return "Evening";
};

interface HomeHeaderProps {
  testID?: string;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ testID = 'home-header' }) => {
  const { data: user } = useCurrentUser();
  const unreadCount = useUnreadAnnouncementCount();
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Memoized values for performance
  const greeting = useMemo(() => getGreeting(), []);
  
  const motivationalMessage = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length);
    return MOTIVATIONAL_MESSAGES[randomIndex];
  }, []);

  const displayBadgeCount = useMemo(() => {
    if (unreadCount > 99) return '99+';
    return unreadCount;
  }, [unreadCount]);

  return (
    <>
      <View 
        testID={testID}
        className="bg-craftopia-surface border-b border-craftopia-light pt-safe ios:pt-12 android:pt-6 pb-3"
      >
        {/* Main Header Row */}
        <View className="flex-row justify-between items-center mb-3 px-4">
          <View className="flex-1 mr-4">
            <Text 
              className="text-xs font-nunito text-craftopia-textSecondary mb-1"
              accessibilityLabel={`Good ${greeting}`}
              numberOfLines={1}
            >
              {`Good ${greeting}`}
            </Text>
            <Text 
              className="text-lg font-poppinsBold text-craftopia-textPrimary"
              accessibilityLabel={`User: ${user?.username || 'Crafter'}`}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {user?.username || 'Crafter'}
            </Text>
          </View>
          
          <View className="flex-row items-center">
            <TouchableOpacity
              testID="notification-button"
              className="relative active:opacity-70"
              onPress={() => setShowNotifications(true)}
              activeOpacity={0.7}
              accessibilityLabel="Open notifications"
              accessibilityHint={`${unreadCount > 0 ? `${unreadCount} unread notifications` : 'No unread notifications'}`}
              accessibilityRole="button"
            >
              <View className="w-10 h-10 rounded-lg bg-craftopia-light items-center justify-center border border-craftopia-light">
                <Bell 
                  size={18} 
                  color="#3B6E4D" 
                  accessibilityLabel="Notifications icon"
                />
              </View>
              
              {/* Unread Badge */}
              {unreadCount > 0 && (
                <View 
                  className="absolute -top-1 -right-1 min-w-[20px] h-[20px] rounded-full bg-craftopia-accent items-center justify-center border-2 border-craftopia-surface px-1"
                  accessibilityLabel={`${unreadCount} unread notifications`}
                  importantForAccessibility="no-hide-descendants"
                >
                  <Text className="text-[10px] font-poppinsBold text-white text-center">
                    {displayBadgeCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Motivational Card */}
        <View 
          className="mx-4 bg-craftopia-light rounded-xl p-3 border border-craftopia-light"
          accessibilityLabel="Motivational message"
          accessibilityRole="summary"
        >
          <View className="flex-row items-center">
            <View 
              className="w-9 h-9 rounded-lg bg-craftopia-primary/10 items-center justify-center mr-3 border border-craftopia-primary/20"
              accessibilityLabel="Sparkle icon"
            >
              <Sparkles 
                size={18} 
                color="#3B6E4D" 
              />
            </View>
            <View className="flex-1">
              <Text 
                className="text-sm font-poppinsBold text-craftopia-textPrimary mb-1"
                accessibilityLabel={motivationalMessage}
                numberOfLines={2}
              >
                {motivationalMessage}
              </Text>
              <Text 
                className="text-xs font-nunito text-craftopia-textSecondary"
                accessibilityLabel="Complete today's quests to unlock rewards"
                numberOfLines={1}
              >
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