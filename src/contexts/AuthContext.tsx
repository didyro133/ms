import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { mockUsers } from '../data/mockData';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, name: string, role: 'student' | 'mentor') => Promise<boolean>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const generateInviteCode = (): string => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

const generateUsername = (name: string): string => {
  const baseUsername = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${baseUsername}${randomSuffix}`;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Clear any existing fake data from localStorage
    const storedUsers = localStorage.getItem('allUsers');
    if (storedUsers) {
      try {
        const parsedUsers = JSON.parse(storedUsers);
        // Filter out any fake accounts (Alice, Bob, Carol)
        const realUsers = parsedUsers.filter((user: User) => 
          !['user1', 'user2', 'user3'].includes(user.id) &&
          !['alice1234', 'bobsmith567', 'caroldavis89'].includes(user.username) &&
          !['Alice Johnson', 'Bob Smith', 'Carol Davis'].includes(user.name)
        );
        setUsers(realUsers);
        localStorage.setItem('allUsers', JSON.stringify(realUsers));
      } catch (error) {
        console.error('Error parsing stored users:', error);
        setUsers([]);
        localStorage.removeItem('allUsers');
      }
    }

    // Check for stored session
    const storedUser = localStorage.getItem('currentUser');
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        // Check if current user is a fake account
        if (['user1', 'user2', 'user3'].includes(user.id) ||
            ['alice1234', 'bobsmith567', 'caroldavis89'].includes(user.username) ||
            ['Alice Johnson', 'Bob Smith', 'Carol Davis'].includes(user.name)) {
          // Log out fake user
          localStorage.removeItem('currentUser');
          setCurrentUser(null);
        } else {
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simple mock authentication
    const user = users.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const register = async (email: string, password: string, name: string, role: 'student' | 'mentor'): Promise<boolean> => {
    const newUser: User = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      username: generateUsername(name),
      email,
      role,
      inviteCode: role === 'student' ? generateInviteCode() : undefined,
      studentIds: role === 'mentor' ? [] : undefined,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      level: 1,
      xp: 0,
      coins: 1500,
      achievements: [],
      inventory: [],
      equippedEffects: [],
      receivedGifts: [],
      createdAt: new Date()
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    localStorage.setItem('allUsers', JSON.stringify([...users, newUser]));
    return true;
  };

  const updateUser = (updates: Partial<User>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Update users array
      setUsers(prevUsers => {
        const updatedUsers = prevUsers.map(u => u.id === currentUser.id ? updatedUser : u);
        localStorage.setItem('allUsers', JSON.stringify(updatedUsers));
        return updatedUsers;
      });
    }
  };

  const updateUsername = (newUsername: string): boolean => {
    if (!currentUser) return false;
    
    // Check if username is already taken
    const isUsernameTaken = users.some(u => 
      u.id !== currentUser.id && u.username.toLowerCase() === newUsername.toLowerCase()
    );
    
    if (isUsernameTaken) {
      return false;
    }
    
    updateUser({ username: newUsername });
    return true;
  };
  const value = {
    currentUser,
    users,
    login,
    logout,
    register,
    updateUser,
    updateUsername
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};