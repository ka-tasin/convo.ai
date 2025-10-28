import type { FC } from "react";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  id: string;
  username: string;
  email?: string;
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  isOnline: boolean;
  lastSeen?: number;
  createdAt: number;
}

const Profile: FC = () => {
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<number | null>(null);
  const [createdAt, setCreatedAt] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from token and initialize
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const decoded = jwtDecode<TokenPayload>(token);
        setUserId(decoded.id);
        setUsername(decoded.username);
        
        // Load additional user data
        await loadUserProfile(decoded.id);
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const loadUserProfile = async (userId: string) => {
    // Try to load from localStorage first
    const savedProfile = localStorage.getItem(`userProfile_${userId}`);
    if (savedProfile) {
      const profile: UserProfile = JSON.parse(savedProfile);
      setEmail(profile.email);
      setIsOnline(profile.isOnline);
      setLastSeen(profile.lastSeen as number);
      setCreatedAt(profile.createdAt);
    } else {
      // Default data based on user info
      const defaultProfile: UserProfile = {
        id: userId,
        username: username,
        email: `${username.toLowerCase()}@example.com`,
        isOnline: true,
        createdAt: Date.now(),
      };
      
      setEmail(defaultProfile.email);
      setIsOnline(defaultProfile.isOnline);
      setCreatedAt(defaultProfile.createdAt);
      
      // Save to localStorage
      localStorage.setItem(`userProfile_${userId}`, JSON.stringify(defaultProfile));
    }
  };

  const formatDate = (timestamp: number | null): string => {
    if (!timestamp) return "Unknown";
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatLastSeen = (timestamp: number | null): string => {
    if (!timestamp) return "Active now";
    
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return "Just now";
  };

  const getStatusColor = () => {
    return isOnline ? "text-green-400" : "text-amber-400";
  };

  const getStatusIcon = () => {
    return isOnline ? "🟢" : "🟡";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 max-w-md w-full">
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-300">Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl font-bold text-white">
              {username.charAt(0).toUpperCase()}
            </span>
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">{username}</h1>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className={getStatusColor()}>{getStatusIcon()}</span>
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {isOnline ? 'Online' : 'Away'}
            </span>
          </div>

          <p className="text-gray-400 text-sm">Member since {formatDate(createdAt)}</p>
        </div>

        {/* Profile Information Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <span className="mr-2">📋</span>
            Profile Information
          </h2>

          {/* Username */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 flex items-center">
              <span className="mr-2">👤</span>
              Username
            </label>
            <div className="text-white font-medium px-4 py-3 bg-gray-700/30 rounded-xl border border-gray-600/30">
              {username}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 flex items-center">
              <span className="mr-2">📧</span>
              Email Address
            </label>
            <div className="text-white font-medium px-4 py-3 bg-gray-700/30 rounded-xl border border-gray-600/30">
              {email}
            </div>
          </div>

          {/* User ID */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 flex items-center">
              <span className="mr-2">🆔</span>
              User ID
            </label>
            <div className="text-white font-mono text-sm px-4 py-3 bg-gray-700/30 rounded-xl border border-gray-600/30 truncate">
              {userId}
            </div>
          </div>
        </div>

        {/* Activity Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <span className="mr-2">📊</span>
            Activity
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">Status</span>
              <span className={`font-medium ${getStatusColor()}`}>
                {isOnline ? 'Active now' : formatLastSeen(lastSeen)}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">Member since</span>
              <span className="text-white font-medium">{formatDate(createdAt)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">Account type</span>
              <span className="text-blue-400 font-medium">Standard</span>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default Profile;