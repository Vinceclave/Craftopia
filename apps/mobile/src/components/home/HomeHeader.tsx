import React, { useState, useMemo } from 'react';
import { Text, View, Pressable, Platform } from 'react-native';
import { Bell, Sparkles } from 'lucide-react-native';
import { useCurrentUser } from '~/hooks/useAuth';
import { useUnreadAnnouncementCount } from '~/hooks/queries/useAnnouncements';
import { NotificationModal } from './NotificationModal';
import { NotificationService } from '~/services/notification.service';
import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

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
  const insets = useSafeAreaInsets();
  const { data: user } = useCurrentUser();
  const unreadCount = useUnreadAnnouncementCount();
  const [showNotifications, setShowNotifications] = useState(false);

  // Register notification service handler
  useEffect(() => {
    NotificationService.setOpenHandler(() => setShowNotifications(true));
    return () => NotificationService.setOpenHandler(() => { });
  }, []);

  const greeting = useMemo(() => getGreeting(), []);

  const motivationalMessage = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length);
    return MOTIVATIONAL_MESSAGES[randomIndex];
  }, []);

  const displayBadgeCount = useMemo(() => {
    if (unreadCount > 99) return '99+';
    return unreadCount;
  }, [unreadCount]);

  const paddingTop = Platform.select({
    ios: insets.top,
    android: insets.top + 12, // Slight extra padding for Android status bars
    default: insets.top
  });

  return (
    <>
      <View
        testID={testID}
        className="bg-craftopia-surface border-b border-craftopia-light/50 z-20 shadow-sm shadow-black/5"
        style={{ paddingTop }}
      >
        <View className="px-5 pb-5">
          {/* Top Bar: Greeting & Notifications */}
          <View className="flex-row justify-between items-center mb-5">
            <View className="flex-1 mr-4">
              <Text
                className="text-sm font-nunito font-medium text-craftopia-textSecondary mb-0.5"
                accessibilityLabel={`Good ${greeting}`}
              >
                Good {greeting},
              </Text>
              <Text
                className="text-2xl font-poppinsBold text-craftopia-textPrimary tracking-tight"
                accessibilityLabel={`User: ${user?.username || 'Crafter'}`}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {user?.username || 'Crafter'}
              </Text>
            </View>

            <Pressable
              testID="notification-button"
              onPress={() => setShowNotifications(true)}
              className="active:opacity-70"
              hitSlop={8}
              accessibilityLabel="Open notifications"
              accessibilityHint={`${unreadCount > 0 ? `${unreadCount} unread notifications` : 'No unread notifications'}`}
              accessibilityRole="button"
            >
              <View className="w-11 h-11 rounded-full bg-white border border-craftopia-light items-center justify-center shadow-sm shadow-black/5">
                <Bell
                  size={20}
                  color="#3B6E4D"
                  fill={unreadCount > 0 ? "#3B6E4D" : "transparent"}
                  className="opacity-90"
                />
              </View>

              {/* Unread Badge */}
              {unreadCount > 0 && (
                <View
                  className="absolute -top-1 -right-1 min-w-[22px] h-[22px] rounded-full bg-craftopia-error items-center justify-center border-2 border-white px-1 shadow-sm"
                  accessibilityLabel={`${unreadCount} unread notifications`}
                >
                  <Text className="text-[10px] font-bold text-white text-center">
                    {displayBadgeCount}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Motivational Card */}
          <LinearGradient
            colors={['#3B6E4D', '#58946C']} // Primary Green to Lighter Green gradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-2xl p-[1px]" // Border gradient effect container if we wanted, but here using as bg
          >
            <View className="flex-row items-center p-4">
              <View
                className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3 border border-white/30"
                accessibilityLabel="Sparkle icon"
              >
                <Sparkles
                  size={20}
                  color="#FFFFFF"
                  fill="white"
                />
              </View>
              <View className="flex-1">
                <Text
                  className="text-sm font-poppinsBold text-white mb-0.5 leading-tight"
                  accessibilityLabel={motivationalMessage}
                >
                  {motivationalMessage}
                </Text>
                <Text
                  className="text-xs font-nunito text-white/90"
                  numberOfLines={1}
                >
                  Complete today's quests to unlock rewards
                </Text>
              </View>
            </View>
          </LinearGradient>
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