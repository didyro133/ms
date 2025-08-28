import React from 'react';
import { Calendar } from 'lucide-react';

const Sessions: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="backdrop-blur-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl p-6 border border-white/20">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center space-x-3">
          <Calendar className="text-purple-400" size={32} />
          <span>Sessions</span>
        </h1>
        <p className="text-white/80">View your mentoring sessions and progress</p>
      </div>
    </div>
  );
};

export default Sessions;