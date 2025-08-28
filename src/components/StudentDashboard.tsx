import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mockGoals, mockSessions, mockAchievements } from '../data/mockData';
import { Calendar, Target, Trophy, TrendingUp, Clock, Star } from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const { currentUser, users } = useAuth();
  
  const userGoals = mockGoals.filter(g => g.studentId === currentUser?.id) || [];
  const userSessions = mockSessions.filter(s => s.studentId === currentUser?.id) || [];
  const completedGoals = userGoals.filter(g => g.completed) || [];
  const recentAchievements = mockAchievements.filter(a => 
    currentUser?.achievements.includes(a.id)
  ).slice(0, 3) || [];

  const levelProgress = ((currentUser?.xp || 0) % 500) / 500 * 100;
  const nextLevelXP = Math.ceil((currentUser?.level || 1) * 500);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="backdrop-blur-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {currentUser?.name}! 👋
            </h1>
            <p className="text-white/80">Ready to level up your skills today?</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white mb-1">Level {currentUser?.level}</div>
            <div className="text-sm text-purple-400">@{currentUser?.username}</div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/80">Progress to Level {(currentUser?.level || 1) + 1}</span>
            <span className="text-sm text-white/80">{currentUser?.xp} / {nextLevelXP} XP</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3 backdrop-blur-xl">
            <div 
              className="bg-gradient-to-r from-purple-400 to-pink-400 h-3 rounded-full transition-all duration-500 shadow-lg shadow-purple-400/25"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Target className="text-green-400" size={24} />
            </div>
            <div>
              <p className="text-white/70 text-sm">Goals Completed</p>
              <p className="text-2xl font-bold text-white">{completedGoals.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Calendar className="text-blue-400" size={24} />
            </div>
            <div>
              <p className="text-white/70 text-sm">Sessions</p>
              <p className="text-2xl font-bold text-white">{userSessions.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Trophy className="text-purple-400" size={24} />
            </div>
            <div>
              <p className="text-white/70 text-sm">Achievements</p>
              <p className="text-2xl font-bold text-white">{currentUser?.achievements.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <TrendingUp className="text-yellow-400" size={24} />
            </div>
            <div>
              <p className="text-white/70 text-sm">Current Level</p>
              <p className="text-2xl font-bold text-white">{currentUser?.level}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Goals and Recent Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Goals */}
        <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <Target className="text-purple-400" size={24} />
            <span>Active Goals</span>
          </h2>
          <div className="space-y-4">
            {userGoals.filter(g => !g.completed).length > 0 ? (
              userGoals.filter(g => !g.completed).slice(0, 3).map((goal) => (
                <div key={goal.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="font-semibold text-white mb-2">{goal.title}</h3>
                  <p className="text-white/70 text-sm mb-3">{goal.description}</p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/80">Progress</span>
                    <span className="text-sm text-white/80">{goal.currentValue}/{goal.targetValue}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-400 to-blue-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(goal.currentValue / goal.targetValue) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Target className="text-white/30 mx-auto mb-3" size={32} />
                <p className="text-white/50">No active goals yet</p>
                <p className="text-white/30 text-sm">Set your first goal to start tracking progress</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <Trophy className="text-yellow-400" size={24} />
            <span>Recent Achievements</span>
          </h2>
          <div className="space-y-4">
            {recentAchievements.length > 0 ? (
              recentAchievements.map((achievement) => (
                <div key={achievement.id} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{achievement.name}</h3>
                      <p className="text-white/70 text-sm">{achievement.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-yellow-400 font-semibold">+{achievement.coinReward} coins</div>
                      <div className="text-blue-400 text-sm">+{achievement.xpReward} XP</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Trophy className="text-white/30 mx-auto mb-3" size={32} />
                <p className="text-white/50">No achievements yet</p>
                <p className="text-white/30 text-sm">Complete goals and sessions to earn achievements</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
          <Calendar className="text-blue-400" size={24} />
          <span>Upcoming Sessions</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userSessions.filter(s => !s.completed).length > 0 ? (
            userSessions.filter(s => !s.completed).map((session) => (
              <div key={session.id} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
                <h3 className="font-semibold text-white mb-2">{session.title}</h3>
                <p className="text-white/70 text-sm mb-3">{session.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 text-white/80">
                    <Clock size={16} />
                    <span>{session.scheduledAt.toLocaleDateString()}</span>
                  </div>
                  <span className="text-purple-400 font-medium">{session.duration} min</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-8">
              <Calendar className="text-white/30 mx-auto mb-3" size={32} />
              <p className="text-white/50">No upcoming sessions</p>
              <p className="text-white/30 text-sm">Your mentor will schedule sessions with you</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;