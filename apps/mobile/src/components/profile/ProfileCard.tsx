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
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
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
        onError={() => {
          // Handle image load error - could set a state to show fallback
        }}
      />
    ) : (
      <View className="w-16 h-16 rounded-full bg-gray-400 justify-center items-center">
        <Text className="text-xl font-bold text-white">
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
      <View className="p-4 bg-white rounded-lg shadow-md">
        <View className="flex-row items-center mb-4">
          <View className="w-16 h-16 rounded-full bg-gray-200 mr-4" />
          <View className="flex-1">
            <View className="h-5 bg-gray-200 rounded mb-2 w-3/4" />
            <View className="h-4 bg-gray-200 rounded w-1/2" />
          </View>
        </View>
        <View className="h-10 bg-gray-200 rounded" />
      </View>
    );
  }

  return (
    <View className="p-4 bg-white rounded-lg shadow-md">
      {/* User Info */}
      <View className="flex-row items-center mb-4">
        {/* Avatar */}
        {renderAvatar()}

        {/* Username & Title */}
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-lg font-semibold text-gray-900">
              {userProfile.name || userProfile.username || 'Unknown User'}
            </Text>
            {userProfile.verified && (
              <CheckCircle 
                size={20} 
                color="#4CAF50" 
                accessibilityLabel="Verified user"
              />
            )}
          </View>
          
          {userProfile.username && userProfile.name && (
            <Text className="text-sm text-gray-500 mb-1">
              @{userProfile.username}
            </Text>
          )}
          
          {userProfile.title && (
            <Text className="text-sm text-blue-600 font-medium">
              {userProfile.title}
            </Text>
          )}
        </View>
      </View>

      {/* Bio Section */}
      {userProfile.bio && (
        <View className="mb-4">
          <Text className="text-sm text-gray-700 leading-5" numberOfLines={3}>
            {userProfile.bio}
          </Text>
        </View>
      )}

      {/* Level/Points Progress */}
      {userProfile.level !== undefined && (
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-semibold text-gray-800">
              Level {userProfile.level}
            </Text>
            {userProfile.totalPoints !== undefined && userProfile.nextLevelPoints !== undefined && (
              <Text className="text-xs text-gray-500">
                {userProfile.totalPoints.toLocaleString()}/{userProfile.nextLevelPoints.toLocaleString()} XP
              </Text>
            )}
          </View>
          
          {userProfile.totalPoints !== undefined && userProfile.nextLevelPoints !== undefined && (
            <View className="bg-gray-200 rounded-full h-2">
              <View 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
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
              <MapPin size={16} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-1">
                {userProfile.location}
              </Text>
            </View>
          )}
          
          {userProfile.joinDate && (
            <View className="flex-row items-center">
              <Calendar size={16} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-1">
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
        className="gap-2"
      />
    </View>
  );
};