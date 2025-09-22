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
  const progressPercentage = userProfile.totalPoints && userProfile.nextLevelPoints 
    ? Math.min((userProfile.totalPoints / userProfile.nextLevelPoints) * 100, 100)
    : 0;

  return (
    <View className="p-4 bg-craftopia-surface rounded-xl shadow-sm">
      {/* Avatar + Name + Verified */}
      <View className="flex-row items-center gap-3 mb-3">
        {userProfile.avatar ? (
          <View className="relative">
            <Image
              source={{ uri: userProfile.avatar }}
              className="w-16 h-16 rounded-full"
            />
            {userProfile.verified && (
              <View className="absolute top-0 right-0 bg-craftopia-primary rounded-full w-5 h-5 justify-center items-center border-2 border-white">
                <Check size={10} color="#fff" />
              </View>
            )}
          </View>
        ) : (
          <View className="w-16 h-16 bg-craftopia-light justify-center items-center rounded-full relative">
            <Text className="text-craftopia-primary text-lg font-bold">
              {userProfile.name?.[0] ?? "?"}
            </Text>
            {userProfile.verified && (
              <View className="absolute top-0 right-0 bg-craftopia-primary rounded-full w-5 h-5 justify-center items-center border-2 border-white">
                <Check size={10} color="#fff" />
              </View>
            )}
          </View>
        )}
        <View className="flex-1">
          <Text className="text-lg text-craftopia-textPrimary font-bold mb-1">
            {userProfile.name}
          </Text>
          <Text className="text-base text-craftopia-textSecondary">
            @{userProfile.username}
          </Text>
        </View>
      </View>

      {/* Bio */}
      {userProfile.bio && (
        <Text className="text-base text-craftopia-textSecondary italic mb-3 leading-5" numberOfLines={2}>
          {userProfile.bio}
        </Text>
      )}

      {/* Location + Join Date */}
      <View className="mb-4 flex-row justify-between items-center">
        {userProfile.location && (
          <View className="flex-row items-center gap-2">
            <MapPin size={16} color="#004E98" />
            <Text className="text-base text-craftopia-textSecondary">{userProfile.location}</Text>
          </View>
        )}
        {userProfile.joinDate && (
          <Text className="text-base text-craftopia-textSecondary">Joined: {userProfile.joinDate}</Text>
        )}
      </View>

      {/* Level & Points */}
      <View className="mb-4 p-3 bg-craftopia-light rounded-lg">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-2">
            <Star size={18} color="#004E98" />
            <Text className="text-base text-craftopia-primary font-semibold">Level {userProfile.level || 1}</Text>
            {userProfile.title && (
              <Text className="text-base text-craftopia-textSecondary">• {userProfile.title}</Text>
            )}
          </View>
          <Text className="text-base text-craftopia-textSecondary font-medium">{userProfile.totalPoints || 0} pts</Text>
        </View>

        {/* Progress Bar */}
        {userProfile.nextLevelPoints && (
          <>
            <View className="w-full h-2 bg-gray-200 rounded-full mb-1">
              <View className="h-2 bg-craftopia-primary rounded-full" style={{ width: `${progressPercentage}%` }} />
            </View>
            <Text className="text-base text-craftopia-textSecondary text-right">
              {userProfile.nextLevelPoints - (userProfile.totalPoints || 0)} pts to next level
            </Text>
          </>
        )}
      </View>

      {/* Edit Button */}
      <Button
        onPress={onEditPress}
        title="Edit Profile"
        leftIcon={<Pencil size={18} color="#fff" />}
        textClassName="text-base font-semibold"
      />
    </View>
  );
};
