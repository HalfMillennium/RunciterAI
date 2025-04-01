import UnauthHome from './UnauthHome';

export default function HomePage() {
  // We're displaying the unauthenticated version of the homepage
  // since the HomePage component is rendered outside the auth provider
  return <UnauthHome />;
}