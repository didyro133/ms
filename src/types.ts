export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'student' | 'mentor';
  inviteCode?: string;
  studentIds?: string[];
  avatar: string;
  level: number;
  xp: number;
  coins: number;
  achievements: string[];
  inventory: string[];
  equippedEffects: string[];
  receivedGifts: ReceivedGift[];
  createdAt: Date;
}

export interface ReceivedGift {
  id: string;
  giftType: string;
  emoji: string;
  name: string;
  coinValue: number;
  fromUserId: string;
  fromUserName: string;
  message?: string;
  receivedAt: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  coinReward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  type?: 'manual' | 'xp' | 'coins';
  targetValue?: number;
}

export interface Goal {
  id: string;
  studentId: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'nameEffect' | 'avatar' | 'badge';
  effect?: string;
  preview: string;
}

export interface Session {
  id: string;
  studentId: string;
  mentorId: string;
  title: string;
  description: string;
  scheduledAt: Date;
  duration: number;
  completed: boolean;
  completedAt?: Date;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'message' | 'gift';
  giftData?: {
    amount: number;
    message?: string;
  };
}

export interface ChatConversation {
  id: string;
  participants: string[];
  lastMessage: ChatMessage | null;
  createdAt: Date;
}