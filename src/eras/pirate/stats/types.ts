import { LucideIcon } from 'lucide-react';

export interface QuizQuestion {
  id: string;
  setupQuestion: string; // Вопрос для того, кто настраивает (про себя)
  gameQuestion: string;  // Вопрос для того, кто угадывает (про партнера)
  options: string[];
  category: string;
  mode: 'knowledge' | 'hot' | 'lifestyle' | 'provocative';
}

export type IslandMode = 'knowledge' | 'hot' | 'lifestyle' | 'provocative';

export interface Island {
  id: IslandMode;
  title: string;
  desc: string;
  badge: string;
  icon: LucideIcon;
  color: string;
  questions: QuizQuestion[];
}

export interface UserAnswer {
  questionId: string;
  answer: string;
  timestamp: string;
}

export interface QuizState {
  Grinch: UserAnswer[];
  Cindy: UserAnswer[];
  userTruths: {
    Grinch: Record<string, string>;
    Cindy: Record<string, string>;
  };
  lastUpdate: string;
}

export interface ViewProps {
  quizState: QuizState;
  currentUser: 'Grinch' | 'Cindy' | null;
  spaceConfig: any;
  profiles: any;
  setView: (view: 'dashboard' | 'lobby' | 'game' | 'setup') => void;
  selectedIsland: IslandMode;
  setSelectedIsland: (island: IslandMode) => void;
  activeRound: number;
  setActiveRound: (round: number) => void;
  activeQuestionIndex: number;
  setActiveQuestonIndex: (index: number | ((prev: number) => number)) => void;
  handleAnswer: (option: string) => Promise<void>;
  handleSaveTruth: (questionId: string, option: string) => Promise<void>;
  handleAvatarUpload: (userId: 'Grinch' | 'Cindy', file: File) => Promise<void>;
  isUploading: string | null;
  isAnswering: boolean;
  islandQuestions: QuizQuestion[];
  activeQuestions: QuizQuestion[];
  hasFilledTruths: (userId: 'Grinch' | 'Cindy', roundIdx: number) => boolean;
  isRoundLocked: (roundIdx: number) => boolean;
  canIAnswerThisRound: (roundIdx: number) => boolean;
  onSwitchUser?: (userId: 'Grinch' | 'Cindy') => void;
}
