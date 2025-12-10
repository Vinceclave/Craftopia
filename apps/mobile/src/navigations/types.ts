// apps/mobile/src/navigations/types.ts 
import type { NavigatorScreenParams } from "@react-navigation/native";

export interface CraftIdea {
  title: string;
  description: string;
  steps: string[];
  timeNeeded: string;
  quickTip: string;
}

// HomeStack only contains the Home screen
export type HomeStackParamList = {
  Home: undefined;
};

// FeedStack contains Feed and Create screens
export type FeedStackParamList = {
  Feed: undefined;
  Create: {
    onPostCreated?: () => void;
    initialTitle?: string;
    initialContent?: string;
    initialImageUri?: string;
    initialTags?: string[];
    initialCategory?: string;
    redirectToFeed?: boolean;
  };
  PostDetails?: { postId: string };
};

// CraftStack contains all craft-related screens
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
    generatedImageUrl?: string;
    timeNeeded?: string;
    quickTip?: string;
    description?: string;
    difficulty?: string;
    toolsNeeded?: string[];
    uniqueFeature?: string;
    ideaId?: number;
    isSaved?: boolean;
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

// ✅ Root Tab Navigator - only includes the 5 main tabs
export type RootTabParamList = {
  HomeStack: NavigatorScreenParams<HomeStackParamList>;
  FeedStack: NavigatorScreenParams<FeedStackParamList>;
  CraftStack: NavigatorScreenParams<CraftStackParamList>;
  EcoQuestStack: NavigatorScreenParams<EcoQuestStackParamList>;
  ProfileStack: NavigatorScreenParams<ProfileStackParamList>;
};

// ✅ Root Stack Navigator - wraps the tab navigator
export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<RootTabParamList>;
};

// ✅ Auth Navigator types
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  VerifyEmail: {
    email?: string;
    token?: string;
    autoVerify?: boolean;
  };
  ResetPassword: {
    token?: string;
  };
};

// ✅ App-level navigator types (includes onboarding, auth, and main)
export type AppStackParamList = {
  Onboarding: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<RootStackParamList>;
};

// ✅ Helper type for nested navigation - improves TypeScript autocomplete
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootTabParamList { }
  }
}