import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './tabs/Home';
import Resume from './tabs/Resume';
import Preferences from './tabs/Preferences';
import Agent from './tabs/Agent';
import Interview from './tabs/Interview';
import Dashboard from './tabs/Dashboard';
import Profile from './tabs/Profile';
import Login from './tabs/Login';
import Register from './tabs/Register';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const { isAuthenticated } = useAuth();

  // Handle Auth State Changes
  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'login' || activeTab === 'register') {
        setActiveTab('home');
      }
    } else {
      if (activeTab !== 'login' && activeTab !== 'register' && activeTab !== 'home') {
        setActiveTab('home');
      }
    }
  }, [isAuthenticated, activeTab]);

  const renderTab = () => {
    switch (activeTab) {
      case 'home': return <Home onNavigate={setActiveTab} />;
      case 'login': return <Login onSuccess={() => setActiveTab('home')} onSwitchToRegister={() => setActiveTab('register')} />;
      case 'register': return <Register onSuccess={() => setActiveTab('login')} onSwitchToLogin={() => setActiveTab('login')} />;

      // Protected Routes
      case 'resume': return isAuthenticated ? <Resume /> : <Login onSuccess={() => setActiveTab('resume')} onSwitchToRegister={() => setActiveTab('register')} />;
      case 'preferences': return isAuthenticated ? <Preferences /> : <Login onSuccess={() => setActiveTab('preferences')} onSwitchToRegister={() => setActiveTab('register')} />;
      case 'agent': return isAuthenticated ? <Agent /> : <Login onSuccess={() => setActiveTab('agent')} onSwitchToRegister={() => setActiveTab('register')} />;
      case 'interview': return isAuthenticated ? <Interview /> : <Login onSuccess={() => setActiveTab('interview')} onSwitchToRegister={() => setActiveTab('register')} />;
      case 'dashboard': return isAuthenticated ? <Dashboard /> : <Login onSuccess={() => setActiveTab('dashboard')} onSwitchToRegister={() => setActiveTab('register')} />;
      case 'profile': return isAuthenticated ? <Profile /> : <Login onSuccess={() => setActiveTab('profile')} onSwitchToRegister={() => setActiveTab('register')} />;

      default: return <Home />;
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isAuthenticated={isAuthenticated}
      onLoginClick={() => setActiveTab('login')}
    >
      <div key={activeTab} className="animate-fall-in">
        {renderTab()}
      </div>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
