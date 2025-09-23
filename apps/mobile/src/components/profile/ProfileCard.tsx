import React from 'react';
import { View, Text, Image } from 'react-native';
import { Check, Pencil, MapPin, Star } from 'lucide-react-native';
import Button from '../common/Button';

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
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  userProfile,
  onEditPress,
}) => {
  const progressPercentage =
    userProfile.totalPoints && userProfile.nextLevelPoints
      ? Math.min(
          (userProfile.totalPoints / userProfile.nextLevelPoints) * 100,
          100,
        )
      : 0;

  return (
    <View className="p-3 bg-craftopia-surface rounded-lg shadow-sm">
      {/* Avatar + Name */}
      <View className="flex-row items-center gap-2.5 mb-2.5">
        {userProfile.avatar ? (
          <View className="relative">
            <Image
              source={{ uri: userProfile.avatar }}
              className="w-14 h-14 rounded-full"
            />
            {userProfile.verified && (
              <View className="absolute top-0 right-0 bg-craftopia-primary rounded-full w-4.5 h-4.5 justify-center items-center border-2 border-white">
                <Check size={9} color="#fff" />
              </View>
            )}
          </View>
        ) : (
          <View className="w-14 h-14 bg-craftopia-light justify-center items-center rounded-full relative">
            <Text className="text-craftopia-primary text-base font-bold">
              {userProfile.name?.[0] ?? '?'}
            </Text>
            {userProfile.verified && (
              <View className="absolute top-0 right-0 bg-craftopia-primary rounded-full w-4.5 h-4.5 justify-center items-center border-2 border-white">
                <Check size={9} color="#fff" />
              </View>
            )}
          </View>
        )}
        <View className="flex-1">
          <Text className="text-base text-craftopia-textPrimary font-bold mb-0.5">
            {userProfile.name}
          </Text>
          <Text className="text-sm text-craftopia-textSecondary">
            @{userProfile.username}
          </Text>
        </View>
      </View>

      {/* Bio */}
      {userProfile.bio && (
        <Text
          className="text-sm text-craftopia-textSecondary italic mb-2 leading-5"
          numberOfLines={2}
        >
          {userProfile.bio}
        </Text>
      )}

      {/* Location + Join Date */}
      <View className="mb-3 flex-row justify-between items-center">
        {userProfile.location && (
          <View className="flex-row items-center gap-1.5">
            <MapPin size={14} color="#004E98" />
            <Text className="text-sm text-craftopia-textSecondary">
              {userProfile.location}
            </Text>
          </View>
        )}
        {userProfile.joinDate && (
          <Text className="text-sm text-craftopia-textSecondary">
            Joined: {userProfile.joinDate}
          </Text>
        )}
      </View>

      {/* Level & Points */}
      <View className="mb-3 p-2.5 bg-craftopia-light rounded-md">
        <View className="flex-row items-center justify-between mb-1.5">
          <View className="flex-row items-center gap-1.5">
            <Star size={16} color="#004E98" />
            <Text className="text-sm text-craftopia-primary font-semibold">
              Level {userProfile.level || 1}
            </Text>
            {userProfile.title && (
              <Text className="text-sm text-craftopia-textSecondary">
                • {userProfile.title}
              </Text>
            )}
          </View>
          <Text className="text-sm text-craftopia-textSecondary font-medium">
            {userProfile.totalPoints || 0} pts
          </Text>
        </View>

        {/* Progress */}
        {userProfile.nextLevelPoints && (
          <>
            <View className="w-full h-1.5 bg-gray-200 rounded-full mb-0.5">
              <View
                className="h-1.5 bg-craftopia-primary rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </View>
            <Text className="text-xs text-craftopia-textSecondary text-right">
              {userProfile.nextLevelPoints - (userProfile.totalPoints || 0)} pts
              to next level
            </Text>
          </>
        )}
      </View>

      {/* Edit Button */}
      <Button
        onPress={onEditPress}
        title="Edit Profile"
        leftIcon={<Pencil size={16} color="#fff" />}
        textClassName="text-sm font-semibold"
      />
    </View>
  );
};
