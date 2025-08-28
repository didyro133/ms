import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mockShopItems } from '../data/mockData';
import { MessageCircle, Search, Send, Users, Hash, Plus, X, User, AtSign, Gift, Coins } from 'lucide-react';

interface ChatMessage {
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

interface ChatConversation {
  id: string;
  participants: string[];
  lastMessage: ChatMessage | null;
  createdAt: Date;
}

const giftOptions = [
  { amount: 10, emoji: '🎁', name: 'Small Gift' },
  { amount: 25, emoji: '🌟', name: 'Star Gift' },
  { amount: 50, emoji: '💎', name: 'Diamond Gift' },
  { amount: 100, emoji: '👑', name: 'Royal Gift' },
  { amount: 250, emoji: '🏆', name: 'Trophy Gift' },
  { amount: 500, emoji: '🚀', name: 'Rocket Gift' },
];

const Social: React.FC = () => {
  const { currentUser, users, updateUser } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showUserListModal, setShowUserListModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Load conversations and messages from localStorage
  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    const stored = localStorage.getItem('chatConversations');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.filter((conv: ChatConversation) =>
          conv.participants.includes(currentUser?.id || '')
        );
      } catch {
        return [];
      }
    }
    return [];
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const stored = localStorage.getItem('chatMessages');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.map((message: any) => ({
          ...message,
          timestamp: new Date(message.timestamp)
        }));
      } catch {
        return [];
      }
    }
    return [];
  });

  // Save to localStorage whenever conversations or messages change
  const saveConversations = (newConversations: ChatConversation[]) => {
    setConversations(newConversations);
    localStorage.setItem('chatConversations', JSON.stringify(newConversations));
  };

  const saveMessages = (newMessages: ChatMessage[]) => {
    setMessages(newMessages);
    localStorage.setItem('chatMessages', JSON.stringify(newMessages));
  };

  // Show all users for discovery (including current user for testing)
  const allUsers = users || [];
  // Filter for chat creation (excluding current user)
  const otherUsers = allUsers.filter(u => u.id !== currentUser?.id);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;
    
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      conversationId: selectedConversation,
      senderId: currentUser?.id || '',
      content: messageInput.trim(),
      timestamp: new Date(),
      type: 'message'
    };

    const updatedMessages = [...messages, newMessage];
    saveMessages(updatedMessages);

    // Update conversation's last message
    const updatedConversations = conversations.map(conv =>
      conv.id === selectedConversation
        ? { ...conv, lastMessage: newMessage }
        : conv
    );
    saveConversations(updatedConversations);

    setMessageInput('');
  };

  const handleSendGift = (giftAmount: number) => {
    if (!currentUser || !selectedConversation || currentUser.coins < giftAmount) return;

    // Find the gift option details
    const selectedGift = giftOptions.find(g => g.amount === giftAmount);
    if (!selectedGift) return;

    // Deduct coins from sender
    updateUser({ coins: currentUser.coins - giftAmount });

    // Find recipient and add coins
    const conversation = conversations.find(c => c.id === selectedConversation);
    const recipientId = conversation?.participants.find(id => id !== currentUser.id);
    const recipient = users.find(u => u.id === recipientId);
    
    if (recipient) {
      // Create gift object for recipient
      const newGift = {
        id: Math.random().toString(36).substring(2, 9),
        giftType: selectedGift.name.toLowerCase().replace(' ', '_'),
        emoji: selectedGift.emoji,
        name: selectedGift.name,
        coinValue: giftAmount,
        fromUserId: currentUser.id,
        fromUserName: currentUser.name,
        message: giftMessage.trim() || undefined,
        receivedAt: new Date()
      };

      // Update recipient's gift inventory
      const updatedRecipient = {
        ...recipient,
        receivedGifts: [...(recipient.receivedGifts || []), newGift]
      };

      // Update users array and localStorage
      const updatedUsers = users.map(u => 
        u.id === recipientId ? updatedRecipient : u
      );
      localStorage.setItem('allUsers', JSON.stringify(updatedUsers));
      
      // Force re-render by updating the users state in AuthContext
      // This ensures the profile modal shows updated gifts immediately
      window.location.reload();
    }

    const giftMessageContent: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      conversationId: selectedConversation,
      senderId: currentUser.id,
      content: giftMessage.trim() || `Sent a gift!`,
      timestamp: new Date(),
      type: 'gift',
      giftData: {
        amount: giftAmount,
        message: giftMessage.trim()
      }
    };

    const updatedMessages = [...messages, giftMessageContent];
    saveMessages(updatedMessages);

    // Update conversation's last message
    const updatedConversations = conversations.map(conv =>
      conv.id === selectedConversation
        ? { ...conv, lastMessage: giftMessageContent }
        : conv
    );
    saveConversations(updatedConversations);

    setShowGiftModal(false);
    setGiftMessage('');
  };

  const findUserByUsernameOrName = (query: string) => {
    const searchTerm = query.toLowerCase();
    const searchWithoutAt = searchTerm.startsWith('@') ? searchTerm.slice(1) : searchTerm;
    
    return otherUsers.find(user => 
      user.username.toLowerCase() === searchWithoutAt ||
      user.name.toLowerCase() === searchTerm
    );
  };

  const handleStartChat = (query: string) => {
    
    const targetUser = findUserByUsernameOrName(query);
    
    if (!targetUser || !currentUser) return;
    
    // Check if conversation already exists
    const existingConversation = conversations.find(conv =>
      conv.participants.includes(targetUser.id) && conv.participants.includes(currentUser.id)
    );
    
    if (existingConversation) {
      setSelectedConversation(existingConversation.id);
    } else {
      // Create new conversation
      const newConversation: ChatConversation = {
        id: Math.random().toString(36).substring(2, 9),
        participants: [currentUser.id, targetUser.id],
        lastMessage: null,
        createdAt: new Date()
      };
      
      const updatedConversations = [...conversations, newConversation];
      saveConversations(updatedConversations);
      setSelectedConversation(newConversation.id);
    }
    
    setShowNewChatModal(false);
    setSearchQuery('');
  };

  const handleStartChatWithUser = (user: any) => {
    if (!currentUser) return;
    
    // Check if conversation already exists
    const existingConversation = conversations.find(conv =>
      conv.participants.includes(user.id) && conv.participants.includes(currentUser.id)
    );
    
    if (existingConversation) {
      setSelectedConversation(existingConversation.id);
    } else {
      // Create new conversation
      const newConversation: ChatConversation = {
        id: Math.random().toString(36).substring(2, 9),
        participants: [currentUser.id, user.id],
        lastMessage: null,
        createdAt: new Date()
      };
      
      const updatedConversations = [...conversations, newConversation];
      saveConversations(updatedConversations);
      setSelectedConversation(newConversation.id);
    }
    
    setShowUserListModal(false);
  };

  const getOtherParticipant = (conversation: any) => {
    const otherUserId = conversation.participants.find((id: string) => id !== currentUser?.id);
    return users.find(u => u.id === otherUserId);
  };

  const getConversationMessages = (conversationId: string) => {
    return messages.filter(m => m.conversationId === conversationId);
  };

  const renderStyledName = (name: string, inventory: string[]) => {
    const ownedEffects = mockShopItems.filter(item => 
      item.type === 'nameEffect' && inventory.includes(item.id)
    );

    let className = '';
    let style: React.CSSProperties = {};

    // Apply all owned effects
    ownedEffects.forEach(effect => {
      switch (effect.effect) {
        case 'animated-gradient':
          className += ' bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_100%]';
          break;
        case 'glow':
          style.textShadow = (style.textShadow || '') + ' 0 0 10px #60a5fa, 0 0 20px #60a5fa';
          className += ' text-blue-400';
          break;
        case 'rainbow':
          if (!className.includes('bg-gradient-to-r')) {
            className += ' bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400 bg-clip-text text-transparent animate-pulse';
          }
          break;
        case 'waving-dots':
          className += ' relative';
          break;
      }
    });

    // If no effects, use default white text
    if (ownedEffects.length === 0) {
      className = 'text-white';
    }

    // Check if waving dots effect is equipped
    const hasWavingDots = ownedEffects.some(effect => effect.effect === 'waving-dots');

    return (
      <span className={`${className} ${hasWavingDots ? 'waving-dots-container' : ''}`} style={style}>
        {name}
        {hasWavingDots && (
          <>
            <span className="waving-dot dot-1">.</span>
            <span className="waving-dot dot-2">.</span>
            <span className="waving-dot dot-3">.</span>
            <span className="waving-dot dot-4">.</span>
          </>
        )}
      </span>
    );
  };

  const formatXPDisplay = (xp: number) => {
    return `🔥${xp}`;
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex">
      {/* Sidebar */}
      <div className="w-80 backdrop-blur-xl bg-white/10 rounded-l-2xl border border-white/20 border-r-0 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <MessageCircle className="text-purple-400" size={24} />
              <span>Social</span>
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowUserListModal(true)}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white p-2 rounded-lg transition-all duration-300 transform hover:scale-105"
                title="Browse all users"
              >
                <Users size={16} />
              </button>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-2 rounded-lg transition-all duration-300 transform hover:scale-105"
                title="Start new chat"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={() => setShowGiftModal(true)}
                disabled={!selectedConversation}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none"
                title="Send gift"
              >
                <Gift size={16} />
              </button>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 pl-9 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:bg-white/10 transition-all duration-300 text-sm"
              placeholder="Search conversations..."
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length > 0 ? (
            <div className="p-2">
              {conversations.map((conversation) => {
                const otherUser = getOtherParticipant(conversation);
                if (!otherUser) return null;
                
                return (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`w-full p-3 rounded-lg mb-2 text-left transition-all duration-200 ${
                      selectedConversation === conversation.id
                        ? 'bg-purple-500/20 border border-purple-400/30'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={otherUser.avatar}
                        alt={otherUser.name}
                        className="w-10 h-10 rounded-full ring-2 ring-purple-400/50"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-yellow-400 text-xs">{formatXPDisplay(otherUser.xp)}</span>
                          <p className="font-medium truncate">
                            {renderStyledName(otherUser.name, otherUser.inventory || [])}
                          </p>
                        </div>
                        <p className="text-purple-400 text-xs">@{otherUser.username}</p>
                        <p className="text-white/60 text-sm truncate">
                          {conversation.lastMessage?.content || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <MessageCircle className="text-white/30 mx-auto mb-3" size={32} />
                <p className="text-white/50 text-sm">No conversations yet</p>
                <p className="text-white/30 text-xs">Start chatting with other students!</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 backdrop-blur-xl bg-white/5 rounded-r-2xl border border-white/20 border-l-0 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-white/20">
              {(() => {
                const conversation = conversations.find(c => c.id === selectedConversation);
                const otherUser = conversation ? getOtherParticipant(conversation) : null;
                
                return otherUser ? (
                  <div className="flex items-center space-x-3">
                    <img
                      src={otherUser.avatar}
                      alt={otherUser.name}
                      className="w-10 h-10 rounded-full ring-2 ring-purple-400/50"
                    />
                    <div 
                      className="cursor-pointer hover:bg-white/5 rounded-lg p-2 -m-2 transition-colors"
                      onClick={() => {
                        setSelectedUser(otherUser);
                        setShowUserProfile(true);
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-yellow-400 text-sm">{formatXPDisplay(otherUser.xp)}</span>
                        <h3 className="font-bold">
                          {renderStyledName(otherUser.name, otherUser.inventory || [])}
                        </h3>
                      </div>
                      <p className="text-white/60 text-sm">Level {otherUser.level} • {otherUser.role}</p>
                      <p className="text-purple-400 text-xs">@{otherUser.username}</p>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              {(() => {
                const conversationMessages = getConversationMessages(selectedConversation);
                
                if (conversationMessages.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <MessageCircle className="text-white/30 mx-auto mb-3" size={32} />
                      <p className="text-white/50">Start your conversation!</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {conversationMessages.map((message) => {
                      const sender = users.find(u => u.id === message.senderId);
                      const isOwnMessage = message.senderId === currentUser?.id;
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.type === 'gift'
                              ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30'
                              : isOwnMessage
                              ? 'bg-purple-500/20 border border-purple-400/30'
                              : 'bg-white/10 border border-white/20'
                          }`}>
                            {!isOwnMessage && (
                              <div className="flex items-center space-x-2 mb-1">
                                <img
                                  src={sender?.avatar}
                                  alt={sender?.name}
                                  className="w-4 h-4 rounded-full"
                                />
                                <span className="text-xs text-white/70">{sender?.name}</span>
                              </div>
                            )}
                            
                            {message.type === 'gift' ? (
                              <div className="text-center">
                                <div className="text-2xl mb-1">🎁</div>
                                <div className="text-yellow-400 font-bold">
                                  +{message.giftData?.amount} coins
                                </div>
                                <div className="text-white text-sm">{message.content}</div>
                              </div>
                            ) : (
                              <p className="text-white text-sm">{message.content}</p>
                            )}
                            
                            <p className="text-xs text-white/50 mt-1">
                              {message.timestamp.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
              </div>

            
            {/* Message Input */}
            <div className="p-4 border-t border-white/20">
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowGiftModal(true)}
                  disabled={!currentUser || currentUser.coins < 10}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none"
                  title="Send gift"
                >
                  <Gift size={16} />
                </button>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:bg-white/10 transition-all duration-300"
                  placeholder="Type your message..."
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="text-white/30 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold text-white mb-2">Welcome to Social</h3>
              <p className="text-white/70 mb-6">Connect with other students and mentors</p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
              >
                Start Your First Chat
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Start New Chat</h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Search by name or @username
                </label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={16} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        console.log('Enter pressed with query:', searchQuery.trim());
                        handleStartChat(searchQuery.trim());
                      }
                    }}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 pl-9 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:bg-white/10 transition-all duration-300"
                    placeholder="Type full @username or name and press Enter"
                  />
                </div>
              </div>

              {searchQuery && (
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-white/70 text-sm mb-2">
                    Start chat with:
                  </p>
                  <p className="text-purple-400 font-medium">
                    {searchQuery.startsWith('@') ? searchQuery : `"${searchQuery}"`}
                  </p>
                  <button
                    onClick={() => handleStartChat(searchQuery.trim())}
                    className="mt-3 w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300"
                  >
                    Start Chat
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User List Modal */}
      {showUserListModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <Users className="text-blue-400" size={24} />
                <span>All Users</span>
              </h3>
              <button
                onClick={() => setShowUserListModal(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[60vh] space-y-3">
              {allUsers.length > 0 ? allUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-full ring-2 ring-purple-400/50"
                      />
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-yellow-400 text-sm">{formatXPDisplay(user.xp)}</span>
                          <div className="font-bold">
                            {renderStyledName(user.name, user.inventory || [])}
                          </div>
                          {user.id === currentUser?.id && (
                            <span className="text-purple-400 text-xs bg-purple-500/20 px-2 py-1 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-purple-400 text-sm">@{user.username}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-white/60 text-xs">Level {user.level}</span>
                          <span className="text-white/40">•</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            user.role === 'student' 
                              ? 'bg-blue-500/20 text-blue-400' 
                              : 'bg-green-500/20 text-green-400'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </div>
                    {user.id !== currentUser?.id ? (
                      <button
                        onClick={() => handleStartChatWithUser(user)}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105"
                      >
                        Chat
                      </button>
                    ) : (
                      <span className="text-white/50 text-sm">That's you!</span>
                    )}
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <Users className="text-white/30 mx-auto mb-3" size={32} />
                  <p className="text-white/50">No users found</p>
                  <p className="text-white/30 text-sm">Register more accounts to see them here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Gift Modal */}
      {showGiftModal && selectedConversation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <Gift className="text-yellow-400" size={24} />
                <span>Send Gift</span>
              </h3>
              <button
                onClick={() => setShowGiftModal(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center space-x-2 bg-white/5 rounded-lg px-3 py-2 mb-4">
                <Coins className="text-yellow-400" size={16} />
                <span className="text-white text-sm">Your balance: {currentUser?.coins || 0} coins</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Choose Gift Amount
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {giftOptions.map((gift) => (
                    <button
                      key={gift.amount}
                      onClick={() => handleSendGift(gift.amount)}
                      disabled={!currentUser || currentUser.coins < gift.amount}
                      className={`flex flex-col items-center space-y-2 p-3 rounded-lg border transition-all duration-300 ${
                        !currentUser || currentUser.coins < gift.amount
                          ? 'bg-gray-500/20 border-gray-400/30 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/30 text-white hover:from-yellow-500/30 hover:to-orange-500/30 transform hover:scale-105'
                      }`}
                    >
                      <div className="text-2xl">{gift.emoji}</div>
                      <div className="text-center">
                        <div className="font-bold text-sm">{gift.name}</div>
                        <div className="text-yellow-400 text-xs">{gift.amount} coins</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Gift Message (Optional)
                </label>
                <input
                  type="text"
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 focus:bg-white/10 transition-all duration-300"
                  placeholder="Add a personal message..."
                  maxLength={100}
                />
                <p className="text-white/50 text-xs mt-1">
                  {giftMessage.length}/100 characters
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowGiftModal(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {showUserProfile && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <User className="text-purple-400" size={24} />
                <span>Profile</span>
              </h3>
              <button
                onClick={() => {
                  setShowUserProfile(false);
                  setSelectedUser(null);
                }}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile Header */}
            <div className="text-center mb-6">
              <img
                src={selectedUser.avatar}
                alt={selectedUser.name}
                className="w-20 h-20 rounded-full ring-4 ring-purple-400/50 mx-auto mb-4"
              />
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span className="text-yellow-400 text-lg">{formatXPDisplay(selectedUser.xp)}</span>
                <div className="text-xl font-bold">
                  {renderStyledName(selectedUser.name, selectedUser.inventory || [])}
                </div>
              </div>
              <p className="text-purple-400 text-sm mb-1">@{selectedUser.username}</p>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span className="text-white/70 text-sm">Level {selectedUser.level}</span>
                <span className="text-white/40">•</span>
                <span className={`text-sm px-3 py-1 rounded-full ${
                  selectedUser.role === 'student' 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'bg-green-500/20 text-green-400'
                }`}>
                  {selectedUser.role}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
                <div className="text-2xl font-bold text-white">{selectedUser.level}</div>
                <div className="text-white/60 text-sm">Level</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
                <div className="text-2xl font-bold text-yellow-400">{selectedUser.xp}</div>
                <div className="text-white/60 text-sm">XP</div>
              </div>
            </div>

            {/* Received Gifts */}
            {selectedUser?.receivedGifts && selectedUser.receivedGifts.length > 0 && (
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
                  <span className="text-lg">🎁</span>
                  <span>Received Gifts ({selectedUser.receivedGifts.length})</span>
                </h4>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 max-h-40 overflow-y-auto">
                  <div className="grid grid-cols-6 gap-2">
                    {selectedUser.receivedGifts.slice(0, 18).map((gift: any) => (
                      <div
                        key={gift.id}
                        className="text-2xl text-center hover:scale-110 transition-transform duration-200 cursor-pointer"
                        title={`${gift.name} from ${gift.fromUserName} (${gift.coinValue} coins)`}
                      >
                        {gift.emoji}
                      </div>
                    ))}
                    {selectedUser.receivedGifts.length > 18 && (
                      <div className="text-white/60 text-xs text-center flex items-center justify-center">
                        +{selectedUser.receivedGifts.length - 18}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Achievements */}
            {selectedUser?.achievements && selectedUser.achievements.length > 0 && (
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
                  <Trophy className="text-yellow-400" size={18} />
                  <span>Achievements ({selectedUser.achievements.length})</span>
                </h4>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.achievements.slice(0, 6).map((achievementId: string) => {
                      const achievement = mockAchievements?.find(a => a.id === achievementId);
                      return achievement ? (
                        <div
                          key={achievement.id}
                          className="text-lg hover:scale-110 transition-transform duration-200 cursor-pointer"
                          title={`${achievement.name}: ${achievement.description}`}
                        >
                          {achievement.icon}
                        </div>
                      ) : null;
                    })}
                    {selectedUser.achievements.length > 6 && (
                      <div className="text-white/60 text-xs flex items-center">
                        +{selectedUser.achievements.length - 6}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowUserProfile(false);
                  setSelectedUser(null);
                  setShowGiftModal(true);
                }}
                disabled={!currentUser || currentUser.coins < 10}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none flex items-center justify-center space-x-2"
              >
                <Gift size={18} />
                <span>Send Gift</span>
              </button>
              <button
                onClick={() => {
                  setShowUserProfile(false);
                  setSelectedUser(null);
                }}
                className="bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Social;