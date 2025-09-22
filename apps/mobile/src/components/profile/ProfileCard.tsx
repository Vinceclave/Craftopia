import { Image, Text, View, TouchableOpacity } from 'react-native';
import Button from '../common/Button';
import { CheckCircle, Pencil, MapPin, Calendar } from 'lucide-react-native';

interface UserProfile {
  username?: string;
  name?: string;
  avatar?: string;
  verified?: boolean;
  joinDate?: string;
  bio?: string;
  level?: number;
  title?: string;
  totalPoints?: number;
  nextLevelPoints?: number;
  location?: string;
}

interface ProfileCardProps {
  userProfile: UserProfile;
  onEditPress: () => void;
  onAvatarPress?: () => void;
  isLoading?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  userProfile,
  onEditPress,
  onAvatarPress,
  isLoading = false
}) => {
  const formatJoinDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const getProgressPercentage = () => {
    if (!userProfile.totalPoints || !userProfile.nextLevelPoints) return 0;
    return Math.min((userProfile.totalPoints / userProfile.nextLevelPoints) * 100, 100);
  };

  const renderAvatar = () => {
    const avatarContent = userProfile.avatar ? (
      <Image
        source={{ uri: userProfile.avatar }}
        className="w-16 h-16 rounded-full"
        accessibilityLabel={`${userProfile.name || userProfile.username}'s profile picture`}
      />
    ) : (
      <View className="w-16 h-16 rounded-full bg-craftopia-light justify-center items-center">
        <Text className="text-xl font-bold text-craftopia-text-primary">
          {(userProfile.name?.charAt(0) || userProfile.username?.charAt(0) || '?').toUpperCase()}
        </Text>
      </View>
    );

    if (onAvatarPress) {
      return (
        <TouchableOpacity onPress={onAvatarPress} className="mr-4">
          {avatarContent}
        </TouchableOpacity>
      );
    }

    return <View className="mr-4">{avatarContent}</View>;
  };

  if (isLoading) {
    return (
      <View className="p-4 bg-craftopia-surface rounded-lg shadow-md">
        <View className="flex-row items-center mb-4">
          <View className="w-16 h-16 rounded-full bg-craftopia-light mr-4" />
          <View className="flex-1">
            <View className="h-5 bg-craftopia-light rounded mb-2 w-3/4" />
            <View className="h-4 bg-craftopia-light rounded w-1/2" />
          </View>
        </View>
        <View className="h-10 bg-craftopia-light rounded" />
      </View>
    );
  }

  return (
    <View className="p-4 bg-craftopia-surface rounded-lg shadow-md">
      {/* User Info */}
      <View className="flex-row items-center mb-4">
        {renderAvatar()}

        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-lg font-semibold text-craftopia-text-primary">
              {userProfile.name || userProfile.username || 'Unknown User'}
            </Text>
            {userProfile.verified && (
              <CheckCircle
                size={20}
                color="#10B981" // craftopia-growth
                accessibilityLabel="Verified user"
              />
            )}
          </View>

          {userProfile.username && (
            <Text className="text-sm text-craftopia-text-secondary mb-1">
              @{userProfile.username}
            </Text>
          )}

          {userProfile.title && (
            <Text className="text-sm text-craftopia-primary font-medium">
              {userProfile.title}
            </Text>
          )}
        </View>
      </View>

      {/* Bio Section */}
      {userProfile.bio && (
        <View className="mb-4">
          <Text
            className="text-sm text-craftopia-text-primary leading-5"
            numberOfLines={3}
            ellipsizeMode="tail"
          >
            {userProfile.bio}
          </Text>
        </View>
      )}

      {/* Level / Points Progress */}
      {userProfile.level !== undefined && (
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-semibold text-craftopia-text-primary">
              Level {userProfile.level}
            </Text>
            {userProfile.totalPoints !== undefined && userProfile.nextLevelPoints !== undefined && (
              <Text className="text-xs text-craftopia-text-secondary">
                {userProfile.totalPoints.toLocaleString()}/{userProfile.nextLevelPoints.toLocaleString()} XP
              </Text>
            )}
          </View>

          {userProfile.totalPoints !== undefined && userProfile.nextLevelPoints !== undefined && (
            <View className="bg-craftopia-light rounded-full h-2">
              <View
                className="bg-craftopia-accent h-2 rounded-full"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </View>
          )}
        </View>
      )}

      {/* Additional Info */}
      {(userProfile.location || userProfile.joinDate) && (
        <View className="flex-row items-center justify-between mb-4">
          {userProfile.location && (
            <View className="flex-row items-center">
              <MapPin size={16} color="#6B7280" /> {/* craftopia-text-secondary */}
              <Text className="text-sm text-craftopia-text-secondary ml-1">
                {userProfile.location}
              </Text>
            </View>
          )}

          {userProfile.joinDate && (
            <View className="flex-row items-center">
              <Calendar size={16} color="#6B7280" />
              <Text className="text-sm text-craftopia-text-secondary ml-1">
                Joined {formatJoinDate(userProfile.joinDate)}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Edit Button */}
      <Button
        onPress={onEditPress}
        title="Edit Profile"
        leftIcon={<Pencil size={20} color="#FFF" />}
        size="md"
        className="gap-2 bg-craftopia-primary text-white"
      />
    </View>
  );
};
