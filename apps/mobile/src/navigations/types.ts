import type { NavigatorScreenParams } from "@react-navigation/native";

export type HomeStackParamList = {
  Home: undefined;
  Details: { id: string };
};

export type FeedStackParamList = {
  Feed: undefined;
  Create: undefined;
  PostDetails: { postId: string };
};

export type CraftStackParamList = {
  Craft: undefined;
  CraftDetails: { craftId: string };
  CraftEditor: { craftId?: string }; // optional for new
};

export type EcoQuestStackParamList = {
  EcoQuest: undefined;
  QuestDetails: { questId: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
  EditProfile: { userId: string };
};

export type RootTabParamList = {
  HomeStack: NavigatorScreenParams<HomeStackParamList>;
  FeedStack: NavigatorScreenParams<FeedStackParamList>;
  CraftStack: NavigatorScreenParams<CraftStackParamList>;
  EcoQuestStack: NavigatorScreenParams<EcoQuestStackParamList>;
  ProfileStack: NavigatorScreenParams<ProfileStackParamList>;
};
