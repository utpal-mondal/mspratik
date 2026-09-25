import { createContext, useContext, useState, useEffect } from 'react';
import Loader from '../components/Loader';
import BackendDown from '../components/BackendDown';
import type { ReactNode } from 'react';
import { useRouter } from 'next/router';
import apiService from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  is_cadmin:string;
  permissions?: string[];
  company_id?: number;
  company_name?:string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  backendDown: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [backendDown, setBackendDown] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();
  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('token');
      try {
        if (token) {
          const response = await apiService.getCurrentUser();
          setUser(response.data);
          setBackendDown(false);
          setRetryCount(0);
        } else {
          setUser(null);
          setBackendDown(false);
        }
      } catch (error: any) {
        console.error('Failed to verify user:', error);
        
        // Handle network errors gracefully - prevent them from bubbling up
        if (error.isNetworkError || error.code === 'NETWORK_ERROR' || error.message === 'Network Error' || !error.response) {
          // Network error - backend is down
          console.log('Backend is currently unavailable.');
          setBackendDown(true);
          
          // Don't clear token on network errors, keep user state
          // Only redirect to login if there's no token
          if (!token) {
            setUser(null);
          }
        } else {
          // Other errors (401, 403, etc.) - clear token
          localStorage.removeItem('token');
          setUser(null);
          setBackendDown(false);
        }
      } finally {
        setLoading(false);
      }
    };

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLoading(false);
      if (backendDown) {
        // Keep trying if backend is down
        verifyUser();
      }
    }, 5000); // 5 second timeout

    verifyUser().finally(() => {
      clearTimeout(timeoutId);
    });

    // Set up retry interval when backend is down
    let retryInterval: NodeJS.Timeout;
    if (backendDown) { // Unlimited retries
      retryInterval = setInterval(() => {
        console.log(`Retrying backend connection... Attempt ${retryCount + 1}`);
        setRetryCount(prev => prev + 1);
        verifyUser();
      }, 5000); // Retry every 5 seconds
    }

    return () => {
      clearTimeout(timeoutId);
      if (retryInterval) clearInterval(retryInterval);
    };
  }, [backendDown, retryCount]);

  // Sync auth state across browser tabs via localStorage events
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== 'token') return;

      if (e.newValue) {
        // Logged in from another tab - verify the token and load the user
        apiService.getCurrentUser()
          .then((response) => {
            setUser(response.data);
            if (router.pathname === '/login' || router.pathname === '/') {
              router.push('/dashboard');
            }
          })
          .catch(() => setUser(null));
      } else {
        // Logged out from another tab
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [router]);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login({ username: email, password });
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      setUser(userData);
      router.push('/dashboard');
    } catch (error: any) {
      // Handle network errors gracefully
      if (error.isNetworkError || error.code === 'NETWORK_ERROR' || error.message === 'Network Error' || !error.response) {
        throw new Error('Backend is currently unavailable. Please check if the server is running and try again.');
      } else if (error.response?.status === 401) {
        throw new Error('Invalid username/email or password');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(error.response?.data?.message || 'Login failed. Please try again.');
      }
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await apiService.register({ username, email, password });
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      setUser(userData);
      router.push('/dashboard');
    } catch (error: any) {
      // Handle network errors gracefully
      if (error.isNetworkError || error.code === 'NETWORK_ERROR' || error.message === 'Network Error' || !error.response) {
        throw new Error('Backend is currently unavailable. Please check if the server is running and try again.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Invalid registration data');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(error.response?.data?.message || 'Registration failed. Please try again.');
      }
    }
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint (optional, but good for tracking)
      await apiService.logout();
    } catch (error: any) {
      // Continue with client-side logout even if backend call fails
      if (error.isNetworkError || error.code === 'NETWORK_ERROR' || error.message === 'Network Error' || !error.response) {
        console.log('Backend is currently unavailable, proceeding with client-side logout.');
      } else {
        console.log('Backend logout call failed:', error);
      }
    }
    
    // Remove token and user data
    localStorage.removeItem('token');
    setUser(null);
    setBackendDown(false);
    setRetryCount(0);
    router.push('/login');
  };

  const retryConnection = () => {
    setRetryCount(0);
    setLoading(true);
    // Trigger a new verification
    const verifyUser = async () => {
      const token = localStorage.getItem('token');
      try {
        if (token) {
          const response = await apiService.getCurrentUser();
          setUser(response.data);
          setBackendDown(false);
          setRetryCount(0);
        }
      } catch (error: any) {
        console.log('Retry failed:', error);
      } finally {
        setLoading(false);
      }
    };
    verifyUser();
  };

  if (loading) {
    return <Loader />;
  }

  // Show BackendDown component if backend is down but user has a token (session preserved)
  if (backendDown && localStorage.getItem('token')) {
    return <BackendDown retryCount={retryCount} onRetry={retryConnection} />;
  }

  const publicPaths = ['/login', '/register'];
  const isPublic = publicPaths.includes(router.pathname);

  if (!loading && !user && !isPublic) {
    router.push('/login');
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, loading, backendDown, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
