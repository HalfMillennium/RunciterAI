import { useAuth } from '../App';
import AuthAwareHome from './AuthAwareHome';

export default function Home() {
  const { isAuthenticated, logout } = useAuth();
  
  return <AuthAwareHome isAuthenticated={isAuthenticated} onLogout={logout} />;
}