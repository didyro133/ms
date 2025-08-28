import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mockSessions, mockGoals } from '../data/mockData';
import { Users, Calendar, TrendingUp, BookOpen, Star, Clock } from 'lucide-react';

const MentorDashboard: React.FC = () => {
  const { currentUser, users } = useAuth();
  
  const myStudents = users.filter(u => 
    u.role === 'student' && currentUser?.studentIds?.includes(u.id)
  ) || [];
  
  const mySessions = mockSessions.filter(s => s.mentorId === currentUser?.id) || [];
  const completedSessions = mySessions.filter(s => s.completed) || [];
  const upcomingSessions = mySessions.filter(s => !s.completed) || [];

  const totalStudentXP = myStudents.reduce((total, student) => total + student.xp, 0) || 0;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="backdrop-blur-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome, {currentUser?.name}! 🎯
            </h1>
            <p className="text-white/80">Guide your students to success</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white mb-1">Level {currentUser?.level}</div>
            <div className="text-sm text-purple-400">@{currentUser?.username}</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Users className="text-blue-400" size={24} />
            </div>
            <div>
              <p className="text-white/70 text-sm">Active Students</p>
              <p className="text-2xl font-bold text-white">{myStudents.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Calendar className="text-green-400" size={24} />
            </div>
            <div>
              <p className="text-white/70 text-sm">Sessions Completed</p>
              <p className="text-2xl font-bold text-white">{completedSessions.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <TrendingUp className="text-purple-400" size={24} />
            </div>
            <div>
              <p className="text-white/70 text-sm">Student XP Total</p>
              <p className="text-2xl font-bold text-white">{totalStudentXP.toLocaleString() || '0'}</p>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <Star className="text-yellow-400" size={24} />
            </div>
            <div>
              <p className="text-white/70 text-sm">Mentor Rating</p>
              <p className="text-2xl font-bold text-white">4.9</p>
            </div>
          </div>
        </div>
      </div>

      {/* Students Overview and Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Student Progress */}
        <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <Users className="text-blue-400" size={24} />
            <span>Student Progress</span>
          </h2>
          <div className="space-y-4">
            {myStudents.length > 0 ? (
              myStudents.map((student) => {
                const studentGoals = mockGoals.filter(g => g.studentId === student.id);
                const completedStudentGoals = studentGoals.filter(g => g.completed);
                
                return (
                  <div key={student.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center space-x-3 mb-3">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-10 h-10 rounded-full ring-2 ring-purple-400/50"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{student.name}</h3>
                        <p className="text-white/70 text-sm">Level {student.level} • {student.xp} XP</p>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 text-sm font-medium">
                          {completedStudentGoals.length}/{studentGoals.length} goals
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full"
                        style={{ 
                          width: `${studentGoals.length > 0 ? (completedStudentGoals.length / studentGoals.length) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Users className="text-white/30 mx-auto mb-3" size={32} />
                <p className="text-white/50">No students yet</p>
                <p className="text-white/30 text-sm">Add students using their invite codes</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <BookOpen className="text-green-400" size={24} />
            <span>Upcoming Sessions</span>
          </h2>
          <div className="space-y-4">
            {upcomingSessions.length > 0 ? (
              upcomingSessions.slice(0, 3).map((session) => {
                const student = users.find(u => u.id === session.studentId);
                
                return (
                  <div key={session.id} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-center space-x-3 mb-2">
                      <img
                        src={student?.avatar}
                        alt={student?.name}
                        className="w-8 h-8 rounded-full ring-2 ring-blue-400/50"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{session.title}</h3>
                        <p className="text-white/70 text-sm">with {student?.name}</p>
                      </div>
                    </div>
                    <p className="text-white/70 text-sm mb-3">{session.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-white/80">
                        <Clock size={16} />
                        <span>{session.scheduledAt.toLocaleDateString()}</span>
                      </div>
                      <span className="text-purple-400 font-medium">{session.duration} min</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <BookOpen className="text-white/30 mx-auto mb-3" size={32} />
                <p className="text-white/50">No upcoming sessions</p>
                <p className="text-white/30 text-sm">Schedule sessions with your students</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;