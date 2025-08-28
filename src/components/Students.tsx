import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Plus, Search, UserPlus, X, Check, AlertCircle } from 'lucide-react';

const Students: React.FC = () => {
  const { currentUser, users, updateUser } = useAuth();
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [addStatus, setAddStatus] = useState<'idle' | 'success' | 'error' | 'already-added'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Get mentor's students
  const myStudents = users.filter(u => 
    u.role === 'student' && currentUser?.studentIds?.includes(u.id)
  ) || [];

  const handleAddStudent = () => {
    if (!inviteCode.trim() || !currentUser) return;

    // Find student by invite code
    const student = users.find(u => 
      u.role === 'student' && u.inviteCode === inviteCode.trim()
    );

    if (!student) {
      setAddStatus('error');
      setStatusMessage('Invalid invite code. Please check and try again.');
      setTimeout(() => setAddStatus('idle'), 3000);
      return;
    }

    // Check if student is already added
    if (currentUser.studentIds?.includes(student.id)) {
      setAddStatus('already-added');
      setStatusMessage(`${student.name} is already your student.`);
      setTimeout(() => setAddStatus('idle'), 3000);
      return;
    }

    // Add student to mentor's list
    const updatedStudentIds = [...(currentUser.studentIds || []), student.id];
    updateUser({ studentIds: updatedStudentIds });

    setAddStatus('success');
    setStatusMessage(`Successfully added ${student.name} as your student!`);
    setInviteCode('');
    
    setTimeout(() => {
      setAddStatus('idle');
      setShowAddStudentModal(false);
    }, 2000);
  };

  const handleRemoveStudent = (studentId: string) => {
    if (!currentUser) return;
    
    const updatedStudentIds = currentUser.studentIds?.filter(id => id !== studentId) || [];
    updateUser({ studentIds: updatedStudentIds });
  };

  const filteredStudents = myStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="backdrop-blur-xl bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center space-x-3">
              <Users className="text-green-400" size={32} />
              <span>My Students</span>
            </h1>
            <p className="text-white/80">Manage and track your students' progress</p>
          </div>
          <button
            onClick={() => setShowAddStudentModal(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Student</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <Users className="text-green-400" size={24} />
              <div>
                <p className="text-white/70 text-sm">Total Students</p>
                <p className="text-2xl font-bold text-white">{myStudents.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <span className="text-blue-400 text-lg">⚡</span>
              </div>
              <div>
                <p className="text-white/70 text-sm">Total Student XP</p>
                <p className="text-2xl font-bold text-white">
                  {myStudents.reduce((total, student) => total + student.xp, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <span className="text-purple-400 text-lg">📈</span>
              </div>
              <div>
                <p className="text-white/70 text-sm">Avg Level</p>
                <p className="text-2xl font-bold text-white">
                  {myStudents.length > 0 
                    ? Math.round(myStudents.reduce((total, student) => total + student.level, 0) / myStudents.length)
                    : 0
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      {myStudents.length > 0 && (
        <div className="backdrop-blur-xl bg-white/10 rounded-xl p-4 border border-white/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 pl-10 text-white placeholder-white/50 focus:outline-none focus:border-green-400 focus:bg-white/10 transition-all duration-300"
              placeholder="Search students by name or username..."
            />
          </div>
        </div>
      )}

      {/* Students List */}
      <div className="space-y-4">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <div
              key={student.id}
              className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-16 h-16 rounded-full ring-2 ring-green-400/50"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{student.name}</h3>
                    <p className="text-green-400 text-sm mb-1">@{student.username}</p>
                    <p className="text-white/70 text-sm">Invite Code: {student.inviteCode}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1">
                        <span className="text-blue-400">⚡</span>
                        <span className="text-white text-sm">{student.xp} XP</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-purple-400">📊</span>
                        <span className="text-white text-sm">Level {student.level}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-400">🏆</span>
                        <span className="text-white text-sm">{student.achievements.length} achievements</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">Level {student.level}</div>
                    <div className="text-sm text-white/70">
                      Joined {new Date(student.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveStudent(student.id)}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-lg transition-all duration-300 border border-red-400/30"
                    title="Remove student"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : myStudents.length > 0 ? (
          <div className="text-center py-12">
            <Search className="text-white/30 mx-auto mb-4" size={48} />
            <p className="text-white/60">No students found matching your search</p>
          </div>
        ) : (
          <div className="backdrop-blur-xl bg-white/10 rounded-xl p-12 border border-white/20 text-center">
            <Users className="text-white/30 mx-auto mb-6" size={64} />
            <h3 className="text-xl font-bold text-white mb-4">No Students Yet</h3>
            <p className="text-white/70 mb-6">
              Start building your mentoring network by adding students using their invitation codes.
            </p>
            <button
              onClick={() => setShowAddStudentModal(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 mx-auto"
            >
              <UserPlus size={20} />
              <span>Add Your First Student</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <UserPlus className="text-green-400" size={24} />
                <span>Add Student</span>
              </h3>
              <button
                onClick={() => {
                  setShowAddStudentModal(false);
                  setInviteCode('');
                  setAddStatus('idle');
                }}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Student Invitation Code
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => {
                    setInviteCode(e.target.value);
                    setAddStatus('idle');
                  }}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-green-400 focus:bg-white/10 transition-all duration-300"
                  placeholder="Enter 5-digit invitation code"
                  maxLength={5}
                />
                <p className="text-white/50 text-xs mt-1">
                  Students can find their invitation code in their profile
                </p>
              </div>

              {addStatus !== 'idle' && (
                <div className={`flex items-center space-x-2 p-3 rounded-lg border ${
                  addStatus === 'success' 
                    ? 'bg-green-500/20 border-green-400/50 text-green-400'
                    : addStatus === 'already-added'
                    ? 'bg-yellow-500/20 border-yellow-400/50 text-yellow-400'
                    : 'bg-red-500/20 border-red-400/50 text-red-400'
                }`}>
                  {addStatus === 'success' ? (
                    <Check size={16} />
                  ) : (
                    <AlertCircle size={16} />
                  )}
                  <span className="text-sm">{statusMessage}</span>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddStudentModal(false);
                    setInviteCode('');
                    setAddStatus('idle');
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddStudent}
                  disabled={!inviteCode.trim() || addStatus === 'success'}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none"
                >
                  {addStatus === 'success' ? 'Added!' : 'Add Student'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;