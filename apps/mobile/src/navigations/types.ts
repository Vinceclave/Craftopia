// apps/mobile/src/navigations/types.ts 
import type { NavigatorScreenParams } from "@react-navigation/native";

export interface CraftIdea {
  title: string;
  description: string;
  steps: string[];
  timeNeeded: string;
  quickTip: string;
}

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
  CraftScan: undefined;
  CraftProcessing: {
    imageUri: string;
  };
  CraftResults: {
    imageUri: string;
    detectedMaterials: string[];
    craftIdeas: CraftIdea[];
  };
  CraftDetails: {
    craftTitle: string;
    materials: string[];
    steps: string[];
  };
};


export type EcoQuestStackParamList = {
  EcoQuest: undefined;
  UserChallenges: undefined;
  QuestDetails: { questId: number };
  Rewards: undefined; 
  RedemptionHistory: undefined; 
};

export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  HelpCenter: undefined;
  ContactUs: undefined;
  AboutUs: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
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