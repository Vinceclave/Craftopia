// apps/mobile/src/navigations/types.ts 
import type { NavigatorScreenParams } from "@react-navigation/native";

export type HomeStackParamList = {
  Home: undefined;
  Details: { id: string };
};

export type FeedStackParamList = {
  Feed: undefined;
  Create: { onPostCreated?: () => void };
  PostDetails: { postId: string };
};

export type CraftStackParamList = {
  Craft: undefined;
  CraftDetails: { craftId: string };
  CraftEditor: { craftId?: string };
  CameraCraft: undefined; // 👈 Add this line
};

export type EcoQuestStackParamList = {
  EcoQuest: undefined;
  UserChallenges: undefined;
  QuestDetails: { questId: number };
};

export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
  EditProfile: undefined;
};

export type ChatBotStackParamList = {
  ChatBot: undefined;
};

export type RootTabParamList = {
  HomeStack: NavigatorScreenParams<HomeStackParamList>;
  FeedStack: NavigatorScreenParams<FeedStackParamList>;
  CraftStack: NavigatorScreenParams<CraftStackParamList>;
  EcoQuestStack: NavigatorScreenParams<EcoQuestStackParamList>;
  ProfileStack: NavigatorScreenParams<ProfileStackParamList>;
  ChatBotStack: NavigatorScreenParams<ChatBotStackParamList>; // Add this line
};


export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<RootTabParamList>;
};