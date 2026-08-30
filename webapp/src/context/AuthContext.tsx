import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { initFirebaseApp } from '../services/firebaseConfig';
import { 
  OAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isHost: boolean;
  isLoading: boolean;
  loginWithDiscord: (discordTag: string, displayName?: string, role?: UserRole, avatarUrl?: string) => Promise<boolean>;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (email: string, pass: string, displayName: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  savedUsers: UserProfile[];
}

const DEFAULT_DISCORD_USERS: UserProfile[] = [
  {
    uid: 'discord-host-001',
    displayName: 'Master Crafter',
    discordTag: 'HostCrafter#0001',
    discordId: '109876543210987654',
    email: 'host@aegis.sc',
    role: 'host_crafter',
    orgRank: 'Grand Fabricant (Hôte)',
    balanceUEC: 4500000,
    avatar: 'https://cdn.discordapp.com/embed/avatars/0.png'
  },
  {
    uid: 'discord-member-001',
    displayName: 'StarPilot_Max',
    discordTag: 'StarPilot#4242',
    discordId: '209876543210987655',
    email: 'pilot1@discord.sc',
    role: 'member',
    orgRank: 'Pilote de Chasse',
    balanceUEC: 320000,
    avatar: 'https://cdn.discordapp.com/embed/avatars/1.png'
  },
  {
    uid: 'discord-member-002',
    displayName: 'Miner_Ghost',
    discordTag: 'MinerGhost#7777',
    discordId: '309876543210987656',
    email: 'miner@discord.sc',
    role: 'member',
    orgRank: 'Mineur MOLE',
    balanceUEC: 850000,
    avatar: 'https://cdn.discordapp.com/embed/avatars/2.png'
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('sc_discord_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_DISCORD_USERS[0];
      }
    }
    return DEFAULT_DISCORD_USERS[0]; // Default logged as host for immediate access
  });

  const [savedUsers, setSavedUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('sc_all_discord_users');
    return saved ? JSON.parse(saved) : DEFAULT_DISCORD_USERS;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sc_discord_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('sc_discord_auth_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('sc_all_discord_users', JSON.stringify(savedUsers));
  }, [savedUsers]);

  // Handle live Firebase auth if enabled
  useEffect(() => {
    const { auth, isLive } = initFirebaseApp();
    if (isLive && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          const matched = savedUsers.find(u => u.uid === fbUser.uid || u.email === fbUser.email);
          if (matched) {
            setCurrentUser(matched);
          } else {
            const newUser: UserProfile = {
              uid: fbUser.uid,
              displayName: fbUser.displayName || 'Pilote Discord',
              discordTag: fbUser.displayName ? `@${fbUser.displayName}` : '@PiloteSC',
              discordId: fbUser.uid,
              email: fbUser.email || undefined,
              avatar: fbUser.photoURL || 'https://cdn.discordapp.com/embed/avatars/0.png',
              role: 'member',
              orgRank: 'Membre Guilde',
              balanceUEC: 100000
            };
            setCurrentUser(newUser);
            setSavedUsers(prev => [...prev, newUser]);
          }
        }
      });
      return () => unsubscribe();
    }
  }, []);

  // Connect or Register with Discord
  const loginWithDiscord = async (
    discordTag: string, 
    displayName?: string, 
    role: UserRole = 'member',
    avatarUrl?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { auth, isLive } = initFirebaseApp();
      
      // If Firebase with Discord OAuth provider is active
      if (isLive && auth) {
        try {
          const provider = new OAuthProvider('discord.com');
          provider.addScope('identify');
          provider.addScope('email');
          const result = await signInWithPopup(auth, provider);
          const fbUser = result.user;
          
          const profile: UserProfile = {
            uid: fbUser.uid,
            displayName: fbUser.displayName || displayName || discordTag,
            discordTag: discordTag.startsWith('@') ? discordTag : `@${discordTag}`,
            discordId: fbUser.uid,
            email: fbUser.email || undefined,
            avatar: fbUser.photoURL || avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png',
            role,
            orgRank: role === 'host_crafter' ? 'Grand Fabricant (Hôte)' : 'Membre Guilde',
            balanceUEC: 150000
          };
          setCurrentUser(profile);
          setSavedUsers(prev => [...prev.filter(u => u.uid !== profile.uid), profile]);
          setIsLoading(false);
          return true;
        } catch (fbErr) {
          console.warn('Firebase Discord popup error, using direct flow', fbErr);
        }
      }

      // Local / Direct Discord flow
      const cleanTag = discordTag.startsWith('@') ? discordTag : `@${discordTag}`;
      const name = displayName || discordTag.replace(/^@/, '').split('#')[0];
      
      // Check if user already exists
      const existing = savedUsers.find(
        u => u.discordTag?.toLowerCase() === cleanTag.toLowerCase() || u.displayName.toLowerCase() === name.toLowerCase()
      );

      if (existing) {
        setCurrentUser(existing);
      } else {
        const randomAvatarIndex = Math.floor(Math.random() * 5);
        const newUser: UserProfile = {
          uid: `discord-${Date.now()}`,
          displayName: name,
          discordTag: cleanTag,
          discordId: String(Date.now()),
          avatar: avatarUrl || `https://cdn.discordapp.com/embed/avatars/${randomAvatarIndex}.png`,
          role,
          orgRank: role === 'host_crafter' ? 'Grand Fabricant (Hôte)' : 'Membre Guilde',
          balanceUEC: 150000
        };
        setSavedUsers(prev => [...prev, newUser]);
        setCurrentUser(newUser);
      }

      setIsLoading(false);
      return true;
    } catch (e) {
      console.error('Discord login error', e);
      setIsLoading(false);
      return false;
    }
  };

  // Fallback email methods (kept for compatibility)
  const login = async (email: string, pass: string): Promise<boolean> => {
    return loginWithDiscord(email.split('@')[0], email.split('@')[0]);
  };

  const register = async (email: string, pass: string, displayName: string, role: UserRole = 'member'): Promise<boolean> => {
    return loginWithDiscord(displayName || email.split('@')[0], displayName, role);
  };

  const logout = () => {
    const { auth, isLive } = initFirebaseApp();
    if (isLive && auth) {
      firebaseSignOut(auth);
    }
    setCurrentUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    if (currentUser) {
      const updated: UserProfile = {
        ...currentUser,
        role: newRole,
        orgRank: newRole === 'host_crafter' ? 'Grand Fabricant (Hôte)' : 'Membre Guilde'
      };
      setCurrentUser(updated);
      setSavedUsers(prev => prev.map(u => u.uid === updated.uid ? updated : u));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isHost: currentUser?.role === 'host_crafter',
        isLoading,
        loginWithDiscord,
        login,
        register,
        logout,
        switchRole,
        savedUsers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
