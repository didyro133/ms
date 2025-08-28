import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mockShopItems } from '../data/mockData';
import { ShoppingBag, Coins, Sparkles, Check, X, Zap, Star } from 'lucide-react';

const Shop: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [purchaseStatus, setPurchaseStatus] = useState<{ [key: string]: 'success' | 'error' | null }>({});

  const { currentUser, updateUser } = useAuth();
  const categories = [
    { id: 'all', name: 'All Items', icon: ShoppingBag },
    { id: 'nameEffect', name: 'Name Effects', icon: Sparkles },
    { id: 'avatar', name: 'Avatars', icon: '🎨' },
    { id: 'badge', name: 'Badges', icon: '🏆' },
  ];

  const filteredItems = selectedCategory === 'all' 
    ? mockShopItems 
    : mockShopItems.filter(item => item.type === selectedCategory);

  const handlePurchase = async (item: any) => {
    if (!currentUser) return;

    if (currentUser.coins < item.price) {
      setPurchaseStatus({ ...purchaseStatus, [item.id]: 'error' });
      setTimeout(() => {
        setPurchaseStatus({ ...purchaseStatus, [item.id]: null });
      }, 2000);
      return;
    }

    // Simulate purchase
    const newCoins = currentUser.coins - item.price;
    const newInventory = [...(currentUser.inventory || []), item.id];
    
    updateUser({
      coins: newCoins,
      inventory: newInventory
    });

    setPurchaseStatus({ ...purchaseStatus, [item.id]: 'success' });
    setTimeout(() => {
      setPurchaseStatus({ ...purchaseStatus, [item.id]: null });
    }, 2000);
  };

  const isOwned = (itemId: string) => {
    return currentUser?.inventory?.includes(itemId) || false;
  };

  const isEquipped = (itemId: string) => {
    return currentUser?.equippedEffects?.includes(itemId) || false;
  };

  const handleEquipToggle = (itemId: string) => {
    if (!currentUser) return;

    const currentEquipped = currentUser.equippedEffects || [];
    const newEquipped = isEquipped(itemId)
      ? currentEquipped.filter(id => id !== itemId)
      : [...currentEquipped, itemId];

    updateUser({ equippedEffects: newEquipped });
  };

  const getRarityColor = (type: string) => {
    switch (type) {
      case 'nameEffect': return 'from-purple-500/20 to-pink-500/20 border-purple-400/30';
      case 'avatar': return 'from-blue-500/20 to-cyan-500/20 border-blue-400/30';
      case 'badge': return 'from-yellow-500/20 to-orange-500/20 border-yellow-400/30';
      default: return 'from-gray-500/20 to-slate-500/20 border-gray-400/30';
    }
  };

  const getEffectPreview = (item: any) => {
    if (item.type !== 'nameEffect') return null;
    
    switch (item.effect) {
      case 'animated-gradient':
        return (
          <div className="text-sm font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse bg-[length:200%_100%]">
            Preview
          </div>
        );
      case 'glow':
        return (
          <div className="text-sm font-bold text-blue-400" style={{ textShadow: '0 0 10px #60a5fa' }}>
            Preview
          </div>
        );
      case 'rainbow':
        return (
          <div className="text-sm font-bold bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
            Preview
          </div>
        );
      case 'waving-dots':
        return (
          <div className="text-sm font-bold text-white relative waving-dots-container">
            Preview
            <span className="waving-dot dot-1">.</span>
            <span className="waving-dot dot-2">.</span>
            <span className="waving-dot dot-3">.</span>
            <span className="waving-dot dot-4">.</span>
          </div>
        );
      default:
        return <div className="text-sm font-bold text-white">Preview</div>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="backdrop-blur-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center space-x-3">
              <ShoppingBag className="text-purple-400" size={32} />
              <span>Shop</span>
            </h1>
            <p className="text-white/80">Customize your profile and unlock new features</p>
          </div>
          <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-4 py-2">
            <Coins className="text-yellow-400" size={20} />
            <span className="text-white font-bold">{currentUser?.coins || 0}</span>
          </div>
        </div>

        {/* Categories */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? 'bg-purple-500/30 text-white border border-purple-400/50'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {typeof category.icon === 'string' ? (
                <span className="text-lg">{category.icon}</span>
              ) : (
                <category.icon size={16} />
              )}
              <span className="text-sm font-medium">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Shop Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`backdrop-blur-xl bg-gradient-to-br ${getRarityColor(item.type)} rounded-2xl p-6 border transition-all hover:scale-105`}
          >
            <div className="flex items-start space-x-4 mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">{item.name}</h3>
                <p className="text-white/70 text-sm">{item.description}</p>
                {item.type === 'nameEffect' && (
                  <div className="mt-2 p-2 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-white/60 text-xs mb-1">Preview:</p>
                    {getEffectPreview(item)}
                  </div>
                )}
              </div>
              {item.type === 'nameEffect' && item.effect === 'gradient' && (
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${item.preview} border border-white/20`} />
              )}
              {item.type === 'nameEffect' && item.effect === 'animated-gradient' && (
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 border border-white/20 animate-pulse bg-[length:200%_100%]" />
              )}
              {item.type === 'nameEffect' && item.effect === 'glow' && (
                <div className="w-12 h-12 rounded-lg bg-blue-400/20 border border-blue-400/50 flex items-center justify-center">
                  <Zap className="text-blue-400" size={20} />
                </div>
              )}
              {item.type === 'nameEffect' && item.effect === 'rainbow' && (
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400 border border-white/20 flex items-center justify-center animate-pulse">
                  <Star className="text-white" size={20} />
                </div>
              )}
              {item.type === 'nameEffect' && item.effect === 'waving-dots' && (
                <div className="w-12 h-12 rounded-lg bg-purple-400/20 border border-purple-400/50 flex items-center justify-center relative waving-dots-container">
                  <span className="text-white font-bold text-xs">Name</span>
                  <span className="waving-dot dot-1">.</span>
                  <span className="waving-dot dot-2">.</span>
                  <span className="waving-dot dot-3">.</span>
                  <span className="waving-dot dot-4">.</span>
                </div>
              )}
              {item.type === 'badge' && (
                <div className="text-2xl">{item.preview}</div>
              )}
              {item.type === 'avatar' && (
                <img src={item.preview} alt={item.name} className="w-12 h-12 rounded-full border-2 border-white/20" />
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Coins className="text-yellow-400" size={16} />
                <span className="text-white font-bold">{item.price}</span>
              </div>

              {isOwned(item.id) ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEquipToggle(item.id)}
                    className={`flex items-center space-x-2 px-3 py-1 rounded-lg border text-sm font-medium transition-all ${
                      isEquipped(item.id)
                        ? 'bg-purple-500/30 text-purple-400 border-purple-400/50 hover:bg-purple-500/40'
                        : 'bg-gray-500/20 text-gray-400 border-gray-400/30 hover:bg-gray-500/30'
                    }`}
                  >
                    {isEquipped(item.id) ? (
                      <>
                        <Check size={16} />
                        <span>Equipped</span>
                      </>
                    ) : (
                      <>
                        <span>Equip</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handlePurchase(item)}
                  disabled={!currentUser || currentUser.coins < item.price}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    !currentUser || currentUser.coins < item.price
                      ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                      : 'bg-purple-500/30 text-white hover:bg-purple-500/50 border border-purple-400/50'
                  } ${
                    purchaseStatus[item.id] === 'success'
                      ? 'bg-green-500/30 border-green-400/50'
                      : purchaseStatus[item.id] === 'error'
                      ? 'bg-red-500/30 border-red-400/50'
                      : ''
                  }`}
                >
                  {purchaseStatus[item.id] === 'success' ? (
                    <div className="flex items-center space-x-1">
                      <Check size={16} />
                      <span>Purchased!</span>
                    </div>
                  ) : purchaseStatus[item.id] === 'error' ? (
                    <div className="flex items-center space-x-1">
                      <X size={16} />
                      <span>Not enough coins</span>
                    </div>
                  ) : (
                    'Purchase'
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBag className="mx-auto text-white/30 mb-4" size={48} />
          <p className="text-white/60">No items found in this category</p>
        </div>
      )}
    </div>
  );
};

export default Shop;