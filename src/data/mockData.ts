import { User, Achievement, Goal, ShopItem, Session, ChatMessage, ChatConversation } from '../types';

// No mock users - only real registered users will appear
export const mockUsers: User[] = [];

export const mockAchievements: Achievement[] = [
  {
    id: 'first_session',
    name: 'First Steps',
    description: 'Complete your first mentoring session',
    icon: '🎯',
    xpReward: 100,
    coinReward: 50,
    rarity: 'common'
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Send your first message in chat',
    icon: '🔥',
    xpReward: 50,
    coinReward: 25,
    rarity: 'rare'
  },
  {
    id: 'style_master',
    name: 'Style Master',
    description: 'Purchase your first name effect',
    icon: '💎',
    xpReward: 100,
    coinReward: 50,
    rarity: 'epic'
  },
  {
    id: 'xp_collector',
    name: 'XP Collector',
    description: 'Reach 1000 XP',
    icon: '🏆',
    xpReward: 200,
    coinReward: 100,
    rarity: 'epic'
  },
  {
    id: 'chat_master',
    name: 'Chat Master',
    description: 'Send 100 messages in chat',
    icon: '💬',
    xpReward: 300,
    coinReward: 150,
    rarity: 'rare'
  },
  {
    id: 'goal_achiever',
    name: 'Goal Achiever',
    description: 'Complete your first goal',
    icon: '🎯',
    xpReward: 150,
    coinReward: 75,
    rarity: 'common'
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Maintain a 7-day learning streak',
    icon: '⚡',
    xpReward: 400,
    coinReward: 200,
    rarity: 'epic'
  },
  {
    id: 'mentor_legend',
    name: 'Mentor Legend',
    description: 'Successfully mentor 10 students',
    icon: '👑',
    xpReward: 1000,
    coinReward: 500,
    rarity: 'legendary'
  },
  {
    id: 'knowledge_seeker',
    name: 'Knowledge Seeker',
    description: 'Complete 5 learning sessions',
    icon: '📚',
    xpReward: 250,
    coinReward: 125,
    rarity: 'rare'
  },
  {
    id: 'community_helper',
    name: 'Community Helper',
    description: 'Help 3 different students in chat',
    icon: '🤝',
    xpReward: 300,
    coinReward: 150,
    rarity: 'epic'
  }
];

export const mockGoals: Goal[] = [];

export const mockShopItems: ShopItem[] = [
  {
    id: 'animated_gradient_effect',
    name: 'Animated Gradient Name',
    description: 'Add a beautiful animated gradient effect to your name',
    price: 50,
    type: 'nameEffect',
    effect: 'animated-gradient',
    preview: 'bg-gradient-to-r from-purple-500 to-pink-500'
  },
  {
    id: 'glow_effect',
    name: 'Glowing Name',
    description: 'Make your name glow with a radiant aura',
    price: 50,
    type: 'nameEffect',
    effect: 'glow',
    preview: 'shadow-lg shadow-blue-400/50'
  },
  {
    id: 'rainbow_effect',
    name: 'Rainbow Name',
    description: 'Animated rainbow colors cycling through your name',
    price: 50,
    type: 'nameEffect',
    effect: 'rainbow',
    preview: 'bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500'
  },
  {
    id: 'waving_dots_effect',
    name: 'Waving Dots',
    description: 'Subtle animated dots that wave around your name',
    price: 75,
    type: 'nameEffect',
    effect: 'waving-dots',
    preview: 'relative'
  },
  {
    id: 'badge1',
    name: 'Star Student Badge',
    description: 'Show off your stellar performance',
    price: 100,
    type: 'badge',
    preview: '⭐'
  },
  {
    id: 'avatar1',
    name: 'Premium Avatar Frame',
    description: 'Golden border for your avatar',
    price: 75,
    type: 'avatar',
    preview: 'gold-border'
  }
];

export const mockSessions: Session[] = [];

export const mockChatMessages: ChatMessage[] = [];

export const mockChatConversations: ChatConversation[] = [];