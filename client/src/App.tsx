import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Editor from "@/pages/Editor";
import Home from "@/pages/Home";
import UnauthHome from "@/pages/UnauthHome";
import HomePage from "@/pages/HomePage";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiRequest } from "./lib/queryClient";

// Auth context
interface AuthContextType {
  user: { id: number; username: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: number; username: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [_, setLocation] = useLocation();

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest('GET', '/api/auth/me');
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const response = await apiRequest('POST', '/api/auth/login', { username, password });
    
    if (response.ok) {
      const userData = await response.json();
      setUser(userData);
      return userData;
    } else {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = async () => {
    const response = await apiRequest('POST', '/api/auth/logout');
    
    if (response.ok) {
      setUser(null);
      setLocation('/');
    } else {
      const error = await response.json();
      throw new Error(error.message || 'Logout failed');
    }
  };

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Protected route component
function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType<any>, [key: string]: any }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [_, setLocation] = useLocation();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isAuthenticated, isLoading, setLocation]);
  
  if (isLoading) {
    return <div className="flex h-screen w-screen items-center justify-center">Loading...</div>;
  }
  
  return isAuthenticated ? <Component {...rest} /> : null;
}

function App() {
  // Initialize dark mode based on saved preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/document/:id">
            {params => <ProtectedRoute component={Editor} key={params.id} documentId={parseInt(params.id, 10)} />}
          </Route>
          {/* Fallback to 404 */}
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
