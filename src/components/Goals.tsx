import React from 'react';
import { Target } from 'lucide-react';

const Goals: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="backdrop-blur-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl p-6 border border-white/20">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center space-x-3">
          <Target className="text-blue-400" size={32} />
          <span>Goals</span>
        </h1>
        <p className="text-white/80">Set targets and track your learning progress</p>
      </div>
    </div>
  );
};

export default Goals;