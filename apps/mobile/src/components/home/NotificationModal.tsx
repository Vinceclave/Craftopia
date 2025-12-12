// apps/mobile/src/components/home/NotificationModal.tsx - FIXED LAYOUT
import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { X, Bell, Megaphone, Clock, CheckCircle } from 'lucide-react-native';
import {
  useActiveAnnouncements,
  useMarkAnnouncementRead,
  useMarkAllAnnouncementsRead,
  Announcement
} from '~/hooks/queries/useAnnouncements';
import { NotificationService } from '~/services/notification.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
}) => {
  const { data: serverAnnouncements = [], isLoading } = useActiveAnnouncements();
  const markAsRead = useMarkAnnouncementRead();
  const markAllAsRead = useMarkAllAnnouncementsRead();
  const [readIds, setReadIds] = React.useState<Set<number>>(new Set());
  const [localAnnouncements, setLocalAnnouncements] = React.useState<Announcement[]>([]);

  // Subscribe to local notifications
  useEffect(() => {
    return NotificationService.subscribe(setLocalAnnouncements);
  }, []);

  // Merge and sort announcements
  const announcements = React.useMemo(() => {
    const combined = [...localAnnouncements, ...serverAnnouncements];
    return combined.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [localAnnouncements, serverAnnouncements]);

  // Load read announcements
  useEffect(() => {
    const loadReadIds = async () => {
      try {
        const stored = await AsyncStorage.getItem('read_announcements');
        if (stored) {
          setReadIds(new Set(JSON.parse(stored)));
        }
      } catch (error) {
        console.error('Failed to load read announcements:', error);
      }
    };

    if (visible) {
      loadReadIds();
    }
  }, [visible]);

  const handleMarkAsRead = async (announcementId: number) => {
    await markAsRead(announcementId);
    setReadIds(prev => new Set(prev).add(announcementId));
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    const allIds = announcements.map(a => a.announcement_id);
    setReadIds(new Set(allIds));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = announcements.filter(
    a => !readIds.has(a.announcement_id)
  ).length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1">
        {/* Full-screen semi-transparent overlay */}
        <TouchableOpacity
          className="absolute inset-0 bg-black/50"
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Content card - positioned at bottom */}
        <View className="absolute bottom-0 left-0 right-0 bg-craftopia-surface rounded-t-3xl max-h-[85%] border-t-2 border-craftopia-primary/20">
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-craftopia-light">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-craftopia-primary/10 items-center justify-center mr-3 border border-craftopia-primary/20">
                <Bell size={20} color="#3B6E4D" />
              </View>
              <View>
                <Text className="text-lg font-poppinsBold text-craftopia-textPrimary">
                  Notifications
                </Text>
                {unreadCount > 0 && (
                  <Text className="text-xs font-nunito text-craftopia-textSecondary">
                    {unreadCount} unread
                  </Text>
                )}
              </View>
            </View>

            <View className="flex-row items-center">
              {unreadCount > 0 && (
                <TouchableOpacity
                  onPress={handleMarkAllAsRead}
                  className="mr-3 px-3 py-1.5 rounded-lg bg-craftopia-primary/10 active:opacity-70"
                >
                  <Text className="text-xs font-poppinsBold text-craftopia-textPrimary">
                    Mark all read
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={onClose}
                className="w-8 h-8 rounded-lg bg-craftopia-light items-center justify-center active:opacity-70"
              >
                <X size={18} color="#5F6F64" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Content */}
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {isLoading ? (
              <View className="py-12 items-center">
                <ActivityIndicator size="large" color="#3B6E4D" />
                <Text className="text-sm font-nunito text-craftopia-textSecondary mt-3">
                  Loading notifications...
                </Text>
              </View>
            ) : announcements.length === 0 ? (
              <View className="py-12 px-5 items-center">
                <View className="w-16 h-16 rounded-2xl bg-craftopia-light items-center justify-center mb-4 border border-craftopia-light">
                  <Bell size={28} color="#9CA3AF" />
                </View>
                <Text className="text-base font-poppinsBold text-craftopia-textPrimary mb-2">
                  No Notifications
                </Text>
                <Text className="text-sm font-nunito text-craftopia-textSecondary text-center">
                  You're all caught up! We'll notify you when there's something new.
                </Text>
              </View>
            ) : (
              <View className="px-4 pt-3">
                {announcements.map((announcement, index) => {
                  const isRead = readIds.has(announcement.announcement_id);
                  const isExpiring = announcement.expires_at &&
                    new Date(announcement.expires_at).getTime() - Date.now() < 24 * 60 * 60 * 1000;

                  return (
                    <TouchableOpacity
                      key={announcement.announcement_id}
                      onPress={() => handleMarkAsRead(announcement.announcement_id)}
                      className="mb-3 rounded-xl overflow-hidden active:opacity-70"
                      style={{
                        backgroundColor: isRead ? '#FFFFFF' : 'rgba(59, 110, 77, 0.05)',
                        borderWidth: 1,
                        borderColor: isRead ? '#F5F7F2' : 'rgba(59, 110, 77, 0.2)',
                      }}
                    >
                      <View className="p-4">
                        {/* Header */}
                        <View className="flex-row items-start justify-between mb-2">
                          <View className="flex-row items-center flex-1">
                            <View
                              className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                              style={{
                                backgroundColor: isRead
                                  ? 'rgba(156, 163, 175, 0.1)'
                                  : 'rgba(59, 110, 77, 0.1)',
                                borderWidth: 1,
                                borderColor: isRead
                                  ? 'rgba(156, 163, 175, 0.2)'
                                  : 'rgba(59, 110, 77, 0.2)',
                              }}
                            >
                              <Megaphone
                                size={18}
                                color={isRead ? '#9CA3AF' : '#3B6E4D'}
                              />
                            </View>

                            <View className="flex-1">
                              <Text
                                className="text-base font-poppinsBold mb-1"
                                style={{
                                  color: isRead ? '#9CA3AF' : '#374A36'
                                }}
                              >
                                {announcement.title}
                              </Text>

                              <View className="flex-row items-center">
                                <Clock size={12} color="#9CA3AF" />
                                <Text className="text-xs font-nunito text-craftopia-textSecondary ml-1">
                                  {formatDate(announcement.created_at)}
                                </Text>

                                {announcement.admin && (
                                  <>
                                    <Text className="text-xs text-craftopia-textSecondary mx-1.5">•</Text>
                                    <Text className="text-xs font-nunito text-craftopia-textSecondary">
                                      by {announcement.admin.username}
                                    </Text>
                                  </>
                                )}
                              </View>
                            </View>

                            {!isRead && (
                              <View className="w-2.5 h-2.5 rounded-full bg-craftopia-primary ml-2" />
                            )}
                          </View>
                        </View>

                        {/* Content */}
                        <Text
                          className="text-sm font-nunito leading-5 mb-2"
                          style={{ color: isRead ? '#9CA3AF' : '#5F6F64' }}
                        >
                          {announcement.content}
                        </Text>

                        {/* Footer */}
                        <View className="flex-row items-center justify-between pt-3 border-t border-craftopia-light">
                          {isExpiring ? (
                            <View className="flex-row items-center px-2 py-1 rounded-lg bg-craftopia-warning/10">
                              <Clock size={12} color="#E3A84F" />
                              <Text className="text-xs font-poppinsBold text-craftopia-warning ml-1">
                                Expiring soon
                              </Text>
                            </View>
                          ) : announcement.expires_at ? (
                            <View className="flex-row items-center">
                              <Clock size={12} color="#9CA3AF" />
                              <Text className="text-xs font-nunito text-craftopia-textSecondary ml-1">
                                Expires {formatDate(announcement.expires_at)}
                              </Text>
                            </View>
                          ) : (
                            <View className="flex-row items-center">
                              <CheckCircle size={12} color="#9CA3AF" />
                              <Text className="text-xs font-nunito text-craftopia-textSecondary ml-1">
                                Permanent
                              </Text>
                            </View>
                          )}

                          {!isRead && (
                            <View className="px-2 py-1 rounded-lg bg-craftopia-primary/10">
                              <Text className="text-xs font-poppinsBold text-craftopia-textPrimary">
                                New
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};