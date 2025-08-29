import React from 'react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mockShopItems } from '../data/mockData';
import { 
  Home, 
  Trophy, 
  Target, 
  ShoppingBag, 
  Settings, 
  LogOut,
  Users,
  Calendar,
  BookOpen,
  MessageCircle,
  ChevronDown,
  User,
  Sparkles,
  X
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const { currentUser, logout } = useAuth();
  const { updateUser } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [newName, setNewName] = useState(currentUser?.name || '');
  const [newUsername, setNewUsername] = useState(currentUser?.username || '');
  const [usernameError, setUsernameError] = useState('');
  const [showGiftInventory, setShowGiftInventory] = useState(false);

  const handleSaveName = () => {
    if (newName.trim() && newName !== currentUser?.name) {
      updateUser({ name: newName.trim() });
    }
    setShowEditProfile(false);
  };

  const handleSaveUsername = () => {
    if (!newUsername.trim()) {
      setUsernameError('Username cannot be empty');
      return;
    }

    if (newUsername.length < 3) {
      setUsernameError('Must be at least 3 characters');
      return;
    }

    if (newUsername.length > 20) {
      setUsernameError('Must be less than 20 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
      setUsernameError('Only letters, numbers, and underscores allowed');
      return;
    }

    if (newUsername !== currentUser?.username) {
      updateUser({ username: newUsername.trim() });
    }
    setUsernameError('');
  };

  const handleSellGift = (giftId: string) => {
    if (!currentUser) return;
    
    const gift = currentUser.receivedGifts?.find(g => g.id === giftId);
    if (!gift) return;
    
    // Add coins to user balance
    const newCoins = currentUser.coins + gift.coinValue;
    
    // Remove gift from inventory
    const newReceivedGifts = currentUser.receivedGifts?.filter(g => g.id !== giftId) || [];
    
    updateUser({ 
      coins: newCoins,
      receivedGifts: newReceivedGifts
    });
  };

  const renderStyledName = (name: string, inventory: string[]) => {
    const equippedEffects = mockShopItems.filter(item => 
      item.type === 'nameEffect' && (currentUser?.equippedEffects || []).includes(item.id)
    );

    let className = '';
    let style: React.CSSProperties = {};

    // Apply all equipped effects
    equippedEffects.forEach(effect => {
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

    // If no equipped effects, use default white text
    if (equippedEffects.length === 0) {
      className = 'text-white';
    }

    // Check if waving dots effect is equipped
    const hasWavingDots = equippedEffects.some(effect => effect.effect === 'waving-dots');

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

  const studentTabs = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'goals', name: 'Goals', icon: Target },
    { id: 'achievements', name: 'Achievements', icon: Trophy },
    { id: 'social', name: 'Social', icon: MessageCircle },
    { id: 'shop', name: 'Shop', icon: ShoppingBag },
  ];

  const mentorTabs = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'students', name: 'Students', icon: Users },
    { id: 'social', name: 'Social', icon: MessageCircle },
    { id: 'achievements', name: 'Achievements', icon: Trophy },
  ];

  const tabs = currentUser?.role === 'student' ? studentTabs : mentorTabs;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="backdrop-blur-3xl bg-black/20 min-h-screen">
        <nav className="backdrop-blur-xl bg-white/10 border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">AI</span>
                  </div>
                  <h1 className="text-xl font-bold text-white">MentorSpace</h1>
                </div>
                
                <div className="hidden md:flex space-x-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'bg-white/20 text-white backdrop-blur-xl'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Icon size={18} />
                        <span className="text-sm font-medium">{tab.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {currentUser?.role === 'student' && (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-xl rounded-full px-3 py-1 border border-yellow-400/30">
                      <span className="text-yellow-400">💰</span>
                      <span className="text-yellow-400 font-semibold">{currentUser.coins}</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-full px-3 py-1 border border-blue-400/30">
                      <span className="text-blue-400">⚡</span>
                      <span className="text-blue-400 font-semibold">{currentUser.xp} XP</span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-3">
                  <img
                    src={currentUser?.avatar}
                    alt={currentUser?.name}
                    className="w-8 h-8 rounded-full ring-2 ring-purple-400/50"
                  />
                  <div className="relative">
                    <button
                      onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                      className="text-white font-medium hidden sm:flex items-center space-x-2 hover:bg-white/10 px-2 py-1 rounded-lg transition-all duration-200"
                    >
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-400 text-sm">🔥{currentUser?.xp}</span>
                        {renderStyledName(currentUser?.name || '', currentUser?.equippedEffects || [])}
                      </div>
                      <ChevronDown 
                        size={16} 
                        className={`text-white/70 transition-transform duration-200 ${
                          showProfileDropdown ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>

                    {/* Profile Dropdown */}
                    {showProfileDropdown && (
                      <>
                        {/* Blurry Background Overlay */}
                        <div 
                          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" 
                          onClick={() => setShowProfileDropdown(false)}
                        />
                        <div 
                          {/* Profile Header */}
                          <div className="p-4 border-b border-white/20">
                            <div className="flex items-center space-x-3">
                              <img
                                src={currentUser?.avatar}
                                alt={currentUser?.name}
                                className="w-12 h-12 rounded-full ring-2 ring-purple-400/50"
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-yellow-400 text-sm">🔥{currentUser?.xp}</span>
                                  <div className="font-bold">
                                    {renderStyledName(currentUser?.name || '', currentUser?.equippedEffects || [])}
                                  </div>
                                </div>
                                <p className="text-white/70 text-sm">
                                  Level {currentUser?.level} • {currentUser?.role}
                                </p>
                                <p className="text-purple-400 text-xs">
                                  @{currentUser?.username}
                                </p>
                                {currentUser?.role === 'student' && currentUser?.inviteCode && (
                                  <p className="text-white/50 text-xs">
                                    Invite Code: {currentUser.inviteCode}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-3xl font-bold text-white mb-1">Level {currentUser?.level}</div>
                                <div className="text-sm text-purple-400">@{currentUser?.username}</div>
                                {/* Display received gifts */}
                                {currentUser?.receivedGifts && currentUser.receivedGifts.length > 0 && (
                                  <div className="flex items-center space-x-1 mt-1">
                                    {currentUser.receivedGifts.slice(0, 3).map((gift, index) => (
                                      <button
                                        key={gift.id}
                                        onClick={() => {
                                          setShowGiftInventory(true);
                                        }}
                                        className="text-lg hover:scale-110 transition-transform duration-200"
                                        title={`${gift.name} from ${gift.fromUserName}`}
                                      >
                                        {gift.emoji}
                                      </button>
                                    ))}
                                    {currentUser.receivedGifts.length > 3 && (
                                      <span className="text-white/60 text-xs">+{currentUser.receivedGifts.length - 3}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="p-2">
                            {currentUser?.receivedGifts && currentUser.receivedGifts.length > 0 && (
                              <button
                                onClick={() => {
                                  setShowGiftInventory(true);
                                  setShowProfileDropdown(false);
                                }}
                                className="w-full flex items-center justify-between px-3 py-2 text-left text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 mb-2"
                              >
                                <div className="flex items-center space-x-3">
                                  <span className="text-lg">🎁</span>
                                  <span>Gifts</span>
                                </div>
                                <span className="bg-purple-500/30 text-purple-400 text-xs px-2 py-1 rounded-full">
                                  {currentUser.receivedGifts.length}
                                </span>
                              </button>
                            )}
                            
                            <button
                              onClick={() => {
                                setShowEditProfile(true);
                                setShowProfileDropdown(false);
                              }}
                              className="w-full flex items-center space-x-3 px-3 py-2 text-left text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                            >
                              <User size={18} />
                              <span>Edit Profile</span>
                            </button>
                            
                            <button
                              onClick={() => {
                                onTabChange('shop');
                                setShowProfileDropdown(false);
                              }}
                              className="w-full flex items-center space-x-3 px-3 py-2 text-left text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                            >
                              <Sparkles size={18} />
                              <span>Customize Name</span>
                            </button>
                            
                            <div className="border-t border-white/20 my-2" />
                            
                            <button
                              onClick={() => {
                                logout();
                                setShowProfileDropdown(false);
                              }}
                              className="w-full flex items-center space-x-3 px-3 py-2 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                            >
                              <LogOut size={18} />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <button
                    onClick={logout}
                    className="text-white/70 hover:text-white transition-colors p-1"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-xl border-t border-white/20">
          <div className="flex justify-around py-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'text-purple-400'
                      : 'text-white/60'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
        {/* Edit Profile Modal */}
        {showEditProfile && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Edit Profile</h3>
                <button
                  onClick={() => setShowEditProfile(false)}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:bg-white/10 transition-all duration-300"
                    placeholder="Enter your display name"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 font-medium">@</span>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => {
                        setNewUsername(e.target.value);
                        setUsernameError('');
                      }}
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 pl-8 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:bg-white/10 transition-all duration-300"
                      placeholder="Enter your username"
                    />
                  </div>
                  {usernameError && (
                    <p className="text-red-400 text-sm mt-1">{usernameError}</p>
                  )}
                  <p className="text-white/50 text-xs mt-1">
                    3-20 characters, letters, numbers, and underscores only
                  </p>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowEditProfile(false)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleSaveName();
                      handleSaveUsername();
                    }}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gift Inventory Modal */}
        {showGiftInventory && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 max-w-md w-full max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <span className="text-2xl">🎁</span>
                  <span>Your Gifts</span>
                </h3>
                <button
                  onClick={() => setShowGiftInventory(false)}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[60vh] space-y-3">
                {currentUser?.receivedGifts && currentUser.receivedGifts.length > 0 ? (
                  currentUser.receivedGifts.map((gift) => (
                    <div
                      key={gift.id}
                      className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-4 border border-yellow-400/30"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{gift.emoji}</div>
                          <div>
                            <h4 className="font-bold text-white">{gift.name}</h4>
                            <p className="text-yellow-400 text-sm">Worth {gift.coinValue} coins</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSellGift(gift.id)}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105"
                        >
                          Sell
                        </button>
                      </div>
                      
                      <div className="text-white/70 text-sm mb-2">
                        From: <span className="text-purple-400 font-medium">{gift.fromUserName}</span>
                      </div>
                      
                      {gift.message && (
                        <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                          <p className="text-white/80 text-sm italic">"{gift.message}"</p>
                        </div>
                      )}
                      
                      <div className="text-white/50 text-xs mt-2">
                        Received: {new Date(gift.receivedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <span className="text-6xl mb-4 block">🎁</span>
                    <p className="text-white/50">No gifts received yet</p>
                    <p className="text-white/30 text-sm">Gifts from other users will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

    </div>
  );
};

export default Layout;