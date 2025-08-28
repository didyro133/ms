import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Achievement } from '../types';
import { mockAchievements } from '../data/mockData';
import { Trophy, Plus, Edit, Trash2, Target, Coins, User, Check, X, AlertCircle } from 'lucide-react';

const Achievements: React.FC = () => {
  const { currentUser, users, updateUser } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showManualAwardModal, setShowManualAwardModal] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '🏆',
    xpReward: 100,
    coinReward: 50,
    rarity: 'common' as 'common' | 'rare' | 'epic' | 'legendary',
    type: 'manual' as 'manual' | 'xp' | 'coins',
    targetValue: 0
  });

  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Get mentor's students
  const myStudents = users.filter(u => 
    u.role === 'student' && currentUser?.studentIds?.includes(u.id)
  ) || [];

  // Load achievements from localStorage (for mentors) or get all achievements (for students)
  useEffect(() => {
    if (currentUser?.role === 'mentor') {
      // Mentors see only their created achievements
      const stored = localStorage.getItem('mentorAchievements');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const mentorAchievements = parsed.filter((a: Achievement & { createdBy: string }) => 
            a.createdBy === currentUser?.id
          );
          setAchievements(mentorAchievements);
        } catch {
          setAchievements([]);
        }
      }
    } else if (currentUser?.role === 'student') {
      // Students see all achievements (default + mentor-created)
      const stored = localStorage.getItem('mentorAchievements');
      let mentorAchievements: Achievement[] = [];
      
      if (stored) {
        try {
          mentorAchievements = JSON.parse(stored);
        } catch {
          mentorAchievements = [];
        }
      }
      
      // Combine default achievements with mentor-created ones
      const allAchievements = [...mockAchievements, ...mentorAchievements];
      setAchievements(allAchievements);
    }
  }, [currentUser?.id]);

  // Save achievements to localStorage
  const saveAchievements = (newAchievements: Achievement[]) => {
    setAchievements(newAchievements);
    const stored = localStorage.getItem('mentorAchievements') || '[]';
    let allAchievements = [];
    try {
      allAchievements = JSON.parse(stored);
    } catch {
      allAchievements = [];
    }
    
    // Remove old achievements by this mentor
    allAchievements = allAchievements.filter((a: Achievement & { createdBy: string }) => 
      a.createdBy !== currentUser?.id
    );
    
    // Add new achievements with mentor ID
    const achievementsWithMentor = newAchievements.map(a => ({
      ...a,
      createdBy: currentUser?.id
    }));
    
    allAchievements.push(...achievementsWithMentor);
    localStorage.setItem('mentorAchievements', JSON.stringify(allAchievements));
  };

  // Check and award automatic achievements
  useEffect(() => {
    if (currentUser?.role !== 'mentor') return;
    
    const checkAutoAchievements = () => {
      achievements.forEach(achievement => {
        if (achievement.type === 'manual') return;
        
        myStudents.forEach(student => {
          if (student.achievements.includes(achievement.id)) return;
          
          let shouldAward = false;
          
          if (achievement.type === 'xp' && student.xp >= achievement.targetValue) {
            shouldAward = true;
          } else if (achievement.type === 'coins' && student.coins >= achievement.targetValue) {
            shouldAward = true;
          }
          
          if (shouldAward) {
            awardAchievement(student.id, achievement.id);
          }
        });
      });
    };
    
    checkAutoAchievements();
  }, [achievements, myStudents]);

  const awardAchievement = (studentId: string, achievementId: string) => {
    const student = users.find(u => u.id === studentId);
    const achievement = achievements.find(a => a.id === achievementId);
    
    if (!student || !achievement || student.achievements.includes(achievementId)) return;
    
    const updatedUsers = users.map(u => {
      if (u.id === studentId) {
        return {
          ...u,
          achievements: [...u.achievements, achievementId],
          xp: u.xp + achievement.xpReward,
          coins: u.coins + achievement.coinReward
        };
      }
      return u;
    });
    
    localStorage.setItem('allUsers', JSON.stringify(updatedUsers));
    window.location.reload(); // Force refresh to update all components
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: '🏆',
      xpReward: 100,
      coinReward: 50,
      rarity: 'common',
      type: 'manual',
      targetValue: 0
    });
  };

  const handleCreate = () => {
    if (!formData.name.trim() || !formData.description.trim()) return;
    
    const newAchievement: Achievement = {
      id: Math.random().toString(36).substring(2, 9),
      name: formData.name.trim(),
      description: formData.description.trim(),
      icon: formData.icon,
      xpReward: formData.xpReward,
      coinReward: formData.coinReward,
      rarity: formData.rarity,
      type: formData.type,
      targetValue: formData.type !== 'manual' ? formData.targetValue : undefined
    };
    
    const updatedAchievements = [...achievements, newAchievement];
    saveAchievements(updatedAchievements);
    
    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedAchievement || !formData.name.trim() || !formData.description.trim()) return;
    
    const updatedAchievement: Achievement = {
      ...selectedAchievement,
      name: formData.name.trim(),
      description: formData.description.trim(),
      icon: formData.icon,
      xpReward: formData.xpReward,
      coinReward: formData.coinReward,
      rarity: formData.rarity,
      type: formData.type,
      targetValue: formData.type !== 'manual' ? formData.targetValue : undefined
    };
    
    const updatedAchievements = achievements.map(a => 
      a.id === selectedAchievement.id ? updatedAchievement : a
    );
    saveAchievements(updatedAchievements);
    
    setShowEditModal(false);
    setSelectedAchievement(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedAchievement) return;
    
    const updatedAchievements = achievements.filter(a => a.id !== selectedAchievement.id);
    saveAchievements(updatedAchievements);
    
    setShowDeleteConfirm(false);
    setSelectedAchievement(null);
  };

  const handleManualAward = () => {
    if (!selectedAchievement || selectedStudents.length === 0) return;
    
    selectedStudents.forEach(studentId => {
      awardAchievement(studentId, selectedAchievement.id);
    });
    
    setShowManualAwardModal(false);
    setSelectedStudents([]);
    setSelectedAchievement(null);
  };

  const openEditModal = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setFormData({
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      xpReward: achievement.xpReward,
      coinReward: achievement.coinReward,
      rarity: achievement.rarity,
      type: achievement.type || 'manual',
      targetValue: achievement.targetValue || 0
    });
    setShowEditModal(true);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-500/20 to-slate-500/20 border-gray-400/30';
      case 'rare': return 'from-blue-500/20 to-cyan-500/20 border-blue-400/30';
      case 'epic': return 'from-purple-500/20 to-pink-500/20 border-purple-400/30';
      case 'legendary': return 'from-yellow-500/20 to-orange-500/20 border-yellow-400/30';
      default: return 'from-gray-500/20 to-slate-500/20 border-gray-400/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'xp': return <Target className="text-blue-400" size={16} />;
      case 'coins': return <Coins className="text-yellow-400" size={16} />;
      case 'manual': return <User className="text-green-400" size={16} />;
      default: return <Trophy className="text-purple-400" size={16} />;
    }
  };

  const filteredStudents = myStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Student view - show all achievements with earned status
  if (currentUser?.role === 'student') {
    return (
      <div className="space-y-8">
        <div className="backdrop-blur-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center space-x-3">
            <Trophy className="text-yellow-400" size={32} />
            <span>Achievements</span>
          </h1>
          <p className="text-white/80">Track your progress and unlock rewards</p>
          
          {/* Student Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-4 border border-white/20">
              <div className="flex items-center space-x-3">
                <Trophy className="text-yellow-400" size={24} />
                <div>
                  <p className="text-white/70 text-sm">Earned</p>
                  <p className="text-2xl font-bold text-white">{currentUser?.achievements.length || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 border border-white/20">
              <div className="flex items-center space-x-3">
                <Target className="text-blue-400" size={24} />
                <div>
                  <p className="text-white/70 text-sm">Available</p>
                  <p className="text-2xl font-bold text-white">{achievements.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <span className="text-purple-400 text-lg">📈</span>
                </div>
                <div>
                  <p className="text-white/70 text-sm">Progress</p>
                  <p className="text-2xl font-bold text-white">
                    {achievements.length > 0 ? Math.round((currentUser?.achievements.length || 0) / achievements.length * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => {
            const isEarned = currentUser?.achievements.includes(achievement.id) || false;
            
            return (
              <div
                key={achievement.id}
                className={`backdrop-blur-xl bg-gradient-to-br ${getRarityColor(achievement.rarity)} rounded-2xl p-6 border transition-all hover:scale-105 ${
                  isEarned ? 'ring-2 ring-yellow-400/50' : 'opacity-75'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`text-3xl ${isEarned ? '' : 'grayscale'}`}>{achievement.icon}</div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{achievement.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        {getTypeIcon(achievement.type || 'manual')}
                        <span className="text-white/70 text-sm capitalize">
                          {achievement.type || 'manual'}
                          {achievement.targetValue && ` (${achievement.targetValue})`}
                        </span>
                      </div>
                    </div>
                  </div>
                  {isEarned && (
                    <div className="bg-yellow-400/20 rounded-full p-2">
                      <Check className="text-yellow-400" size={16} />
                    </div>
                  )}
                </div>

                <p className="text-white/80 text-sm mb-4">{achievement.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <span className="text-blue-400">⚡</span>
                      <span className="text-white text-sm">{achievement.xpReward} XP</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Coins className="text-yellow-400" size={14} />
                      <span className="text-white text-sm">{achievement.coinReward}</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    achievement.rarity === 'common' ? 'bg-gray-500/20 text-gray-400' :
                    achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                    achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {achievement.rarity}
                  </span>
                </div>

                {/* Progress for automatic achievements */}
                {achievement.type === 'xp' && !isEarned && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/70 text-sm">XP Progress</span>
                      <span className="text-white/70 text-sm">{currentUser?.xp || 0}/{achievement.targetValue}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(((currentUser?.xp || 0) / (achievement.targetValue || 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {achievement.type === 'coins' && !isEarned && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/70 text-sm">Coins Progress</span>
                      <span className="text-white/70 text-sm">{currentUser?.coins || 0}/{achievement.targetValue}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(((currentUser?.coins || 0) / (achievement.targetValue || 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {achievements.length === 0 && (
          <div className="backdrop-blur-xl bg-white/10 rounded-xl p-12 border border-white/20 text-center">
            <Trophy className="text-white/30 mx-auto mb-6" size={64} />
            <h3 className="text-xl font-bold text-white mb-4">No Achievements Available</h3>
            <p className="text-white/70 mb-6">
              Your mentors haven't created any achievements yet.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Mentor view - achievement management dashboard
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="backdrop-blur-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center space-x-3">
              <Trophy className="text-yellow-400" size={32} />
              <span>Achievement Management</span>
            </h1>
            <p className="text-white/80">Create and manage achievements for your students</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Create Achievement</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <Trophy className="text-yellow-400" size={24} />
              <div>
                <p className="text-white/70 text-sm">Total Achievements</p>
                <p className="text-2xl font-bold text-white">{achievements.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <Target className="text-blue-400" size={24} />
              <div>
                <p className="text-white/70 text-sm">Auto Achievements</p>
                <p className="text-2xl font-bold text-white">
                  {achievements.filter(a => a.type !== 'manual').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <User className="text-green-400" size={24} />
              <div>
                <p className="text-white/70 text-sm">Manual Achievements</p>
                <p className="text-2xl font-bold text-white">
                  {achievements.filter(a => a.type === 'manual').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <span className="text-purple-400 text-lg">🎯</span>
              </div>
              <div>
                <p className="text-white/70 text-sm">Students</p>
                <p className="text-2xl font-bold text-white">{myStudents.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`backdrop-blur-xl bg-gradient-to-br ${getRarityColor(achievement.rarity)} rounded-2xl p-6 border transition-all hover:scale-105`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{achievement.icon}</div>
                <div>
                  <h3 className="text-lg font-bold text-white">{achievement.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    {getTypeIcon(achievement.type || 'manual')}
                    <span className="text-white/70 text-sm capitalize">
                      {achievement.type || 'manual'}
                      {achievement.targetValue && ` (${achievement.targetValue})`}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => openEditModal(achievement)}
                  className="text-white/70 hover:text-white p-1 rounded transition-colors"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => {
                    setSelectedAchievement(achievement);
                    setShowDeleteConfirm(true);
                  }}
                  className="text-red-400/70 hover:text-red-400 p-1 rounded transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <p className="text-white/80 text-sm mb-4">{achievement.description}</p>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <span className="text-blue-400">⚡</span>
                  <span className="text-white text-sm">{achievement.xpReward} XP</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Coins className="text-yellow-400" size={14} />
                  <span className="text-white text-sm">{achievement.coinReward}</span>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                achievement.rarity === 'common' ? 'bg-gray-500/20 text-gray-400' :
                achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {achievement.rarity}
              </span>
            </div>

            {achievement.type === 'manual' && (
              <button
                onClick={() => {
                  setSelectedAchievement(achievement);
                  setShowManualAwardModal(true);
                }}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
              >
                Award to Students
              </button>
            )}
          </div>
        ))}
      </div>

      {achievements.length === 0 && (
        <div className="backdrop-blur-xl bg-white/10 rounded-xl p-12 border border-white/20 text-center">
          <Trophy className="text-white/30 mx-auto mb-6" size={64} />
          <h3 className="text-xl font-bold text-white mb-4">No Achievements Yet</h3>
          <p className="text-white/70 mb-6">
            Create your first achievement to motivate and reward your students.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 mx-auto"
          >
            <Plus size={20} />
            <span>Create Your First Achievement</span>
          </button>
        </div>
      )}

      {/* Create Achievement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <Plus className="text-yellow-400" size={24} />
                <span>Create Achievement</span>
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 focus:bg-white/10 transition-all duration-300"
                  placeholder="Achievement name"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 focus:bg-white/10 transition-all duration-300 h-20 resize-none"
                  placeholder="Achievement description"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Icon</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 focus:bg-white/10 transition-all duration-300"
                  placeholder="🏆"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">XP Reward</label>
                  <input
                    type="number"
                    value={formData.xpReward}
                    onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 focus:bg-white/10 transition-all duration-300"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Coin Reward</label>
                  <input
                    type="number"
                    value={formData.coinReward}
                    onChange={(e) => setFormData({ ...formData, coinReward: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 focus:bg-white/10 transition-all duration-300"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Rarity</label>
                <select
                  value={formData.rarity}
                  onChange={(e) => setFormData({ ...formData, rarity: e.target.value as any })}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400 focus:bg-white/10 transition-all duration-300"
                >
                  <option value="common">Common</option>
                  <option value="rare">Rare</option>
                  <option value="epic">Epic</option>
                  <option value="legendary">Legendary</option>
                </select>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400 focus:bg-white/10 transition-all duration-300"
                >
                  <option value="manual">Manual (Award manually)</option>
                  <option value="xp">Automatic - XP Target</option>
                  <option value="coins">Automatic - Coins Target</option>
                </select>
              </div>

              {formData.type !== 'manual' && (
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Target {formData.type === 'xp' ? 'XP' : 'Coins'}
                  </label>
                  <input
                    type="number"
                    value={formData.targetValue}
                    onChange={(e) => setFormData({ ...formData, targetValue: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 focus:bg-white/10 transition-all duration-300"
                    min="1"
                    placeholder={`Target ${formData.type === 'xp' ? 'XP' : 'coins'} to unlock`}
                  />
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!formData.name.trim() || !formData.description.trim()}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Achievement Modal */}
      {showEditModal && selectedAchievement && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <Edit className="text-yellow-400" size={24} />
                <span>Edit Achievement</span>
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedAchievement(null);
                  resetForm();
                }}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 focus:bg-white/10 transition-all duration-300"
                  placeholder="Achievement name"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 focus:bg-white/10 transition-all duration-300 h-20 resize-none"
                  placeholder="Achievement description"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Icon</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 focus:bg-white/10 transition-all duration-300"
                  placeholder="🏆"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">XP Reward</label>
                  <input
                    type="number"
                    value={formData.xpReward}
                    onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 focus:bg-white/10 transition-all duration-300"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Coin Reward</label>
                  <input
                    type="number"
                    value={formData.coinReward}
                    onChange={(e) => setFormData({ ...formData, coinReward: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 focus:bg-white/10 transition-all duration-300"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Rarity</label>
                <select
                  value={formData.rarity}
                  onChange={(e) => setFormData({ ...formData, rarity: e.target.value as any })}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400 focus:bg-white/10 transition-all duration-300"
                >
                  <option value="common">Common</option>
                  <option value="rare">Rare</option>
                  <option value="epic">Epic</option>
                  <option value="legendary">Legendary</option>
                </select>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400 focus:bg-white/10 transition-all duration-300"
                >
                  <option value="manual">Manual (Award manually)</option>
                  <option value="xp">Automatic - XP Target</option>
                  <option value="coins">Automatic - Coins Target</option>
                </select>
              </div>

              {formData.type !== 'manual' && (
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Target {formData.type === 'xp' ? 'XP' : 'Coins'}
                  </label>
                  <input
                    type="number"
                    value={formData.targetValue}
                    onChange={(e) => setFormData({ ...formData, targetValue: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 focus:bg-white/10 transition-all duration-300"
                    min="1"
                    placeholder={`Target ${formData.type === 'xp' ? 'XP' : 'coins'} to unlock`}
                  />
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedAchievement(null);
                    resetForm();
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  disabled={!formData.name.trim() || !formData.description.trim()}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedAchievement && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <AlertCircle className="text-red-400" size={24} />
                <span>Delete Achievement</span>
              </h3>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedAchievement(null);
                }}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-white/80 mb-4">
                Are you sure you want to delete "{selectedAchievement.name}"?
              </p>
              <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">
                  This action cannot be undone. Students who have earned this achievement will keep it.
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedAchievement(null);
                }}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Award Modal */}
      {showManualAwardModal && selectedAchievement && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <Trophy className="text-yellow-400" size={24} />
                <span>Award Achievement</span>
              </h3>
              <button
                onClick={() => {
                  setShowManualAwardModal(false);
                  setSelectedStudents([]);
                  setSelectedAchievement(null);
                }}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{selectedAchievement.icon}</div>
                  <div>
                    <h4 className="font-bold text-white">{selectedAchievement.name}</h4>
                    <p className="text-white/70 text-sm">{selectedAchievement.description}</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 focus:bg-white/10 transition-all duration-300"
                  placeholder="Search students..."
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredStudents.map((student) => {
                  const hasAchievement = student.achievements.includes(selectedAchievement.id);
                  const isSelected = selectedStudents.includes(student.id);
                  
                  return (
                    <div
                      key={student.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                        hasAchievement
                          ? 'bg-green-500/20 border-green-400/50 opacity-50'
                          : isSelected
                          ? 'bg-yellow-500/20 border-yellow-400/50'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer'
                      }`}
                      onClick={() => {
                        if (hasAchievement) return;
                        
                        if (isSelected) {
                          setSelectedStudents(prev => prev.filter(id => id !== student.id));
                        } else {
                          setSelectedStudents(prev => [...prev, student.id]);
                        }
                      }}
                    >
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-8 h-8 rounded-full ring-2 ring-purple-400/50"
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-white">{student.name}</h5>
                        <p className="text-white/70 text-sm">@{student.username}</p>
                      </div>
                      {hasAchievement ? (
                        <Check className="text-green-400" size={20} />
                      ) : isSelected ? (
                        <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                          <Check className="text-black" size={14} />
                        </div>
                      ) : (
                        <div className="w-5 h-5 border-2 border-white/30 rounded-full" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => {
                  setShowManualAwardModal(false);
                  setSelectedStudents([]);
                  setSelectedAchievement(null);
                }}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleManualAward}
                disabled={selectedStudents.length === 0}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none"
              >
                Award to {selectedStudents.length} Student{selectedStudents.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Achievements;