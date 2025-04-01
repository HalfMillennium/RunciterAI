import AuthAwareHome from './AuthAwareHome';

export default function UnauthHome() {
  return <AuthAwareHome isAuthenticated={false} />;
}