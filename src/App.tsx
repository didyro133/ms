import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import Layout from './components/Layout';
import StudentDashboard from './components/StudentDashboard';
import MentorDashboard from './components/MentorDashboard';
import Goals from './components/Goals';
import Achievements from './components/Achievements';
import Shop from './components/Shop';
import Students from './components/Students';
import Sessions from './components/Sessions';
import Social from './components/Social';

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!currentUser) {
    return <Auth />;
  }

  const renderContent = () => {
    if (currentUser.role === 'student') {
      switch (activeTab) {
        case 'dashboard':
          return <StudentDashboard />;
        case 'goals':
          return <Goals />;
        case 'achievements':
          return <Achievements />;
        case 'sessions':
          return <Sessions />;
        case 'social':
          return <Social />;
        case 'shop':
          return <Shop />;
        default:
          return <StudentDashboard />;
      }
    } else {
      switch (activeTab) {
        case 'dashboard':
          return <MentorDashboard />;
        case 'students':
          return <Students />;
        case 'sessions':
          return <Sessions />;
        case 'social':
          return <Social />;
        case 'achievements':
          return <Achievements />;
        default:
          return <MentorDashboard />;
      }
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;