import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowRight, Menu, X } from 'lucide-react';

interface AuthAwareHomeProps {
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

export default function AuthAwareHome({ isAuthenticated = false, onLogout }: AuthAwareHomeProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white overflow-hidden">
      {/* Radial gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-blue-500 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-1/2 h-1/2 bg-purple-500 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-black to-transparent opacity-20"></div>
      </div>

      {/* Grid lines background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 relative">
              <div className="h-full w-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 absolute blur opacity-70"></div>
              <img 
                src="/generated-icon.png" 
                alt="AI Writing Assistant" 
                className="h-full w-full object-contain relative z-10"
              />
            </div>
            <div className="font-bold text-lg">AI Writing Assistant</div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-8">
              <Link href="/"><span className="text-sm hover:text-blue-400 transition">Home</span></Link>
              <Link href="/features"><span className="text-sm hover:text-blue-400 transition">Features</span></Link>
              <Link href="/pricing"><span className="text-sm hover:text-blue-400 transition">Pricing</span></Link>
              <Link href="/about"><span className="text-sm hover:text-blue-400 transition">About</span></Link>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {isAuthenticated ? (
                <>
                  <Link href="/document/1">
                    <Button variant="outline" size="sm" className="border-white/20 text-sm">
                      Editor
                    </Button>
                  </Link>
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 text-sm"
                    onClick={handleLogout}
                  >
                    Log Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="border-white/20 text-sm">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="bg-gradient-to-r from-blue-500 to-cyan-400 text-sm">
                      Create Account
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-gray-900/95 backdrop-blur-md border-b border-white/10 p-4 z-50">
            <div className="flex flex-col space-y-4">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <span className="text-sm hover:text-blue-400 transition block py-2">Home</span>
              </Link>
              <Link href="/features" onClick={() => setMobileMenuOpen(false)}>
                <span className="text-sm hover:text-blue-400 transition block py-2">Features</span>
              </Link>
              <Link href="/pricing" onClick={() => setMobileMenuOpen(false)}>
                <span className="text-sm hover:text-blue-400 transition block py-2">Pricing</span>
              </Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)}>
                <span className="text-sm hover:text-blue-400 transition block py-2">About</span>
              </Link>
              <div className="pt-2 border-t border-white/10 flex flex-col space-y-3">
                {isAuthenticated ? (
                  <>
                    <Link href="/document/1" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full border-white/20">
                        Editor
                      </Button>
                    </Link>
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-400"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                    >
                      Log Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full border-white/20">
                        Log In
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-400">
                        Create Account
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-400/10 border border-blue-500/20 backdrop-blur-sm">
            <span className="text-sm bg-gradient-to-r from-blue-400 to-cyan-300 text-transparent bg-clip-text">
              AI-Powered Writing Assistant
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 text-transparent bg-clip-text">
            Transform Your Writing <br />with AI Suggestions
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 mb-10 mx-auto max-w-2xl">
            Enhance your documents with intelligent suggestions, generated content, and a seamless writing experience.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/document/1">
                  <Button className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-8 py-6 text-lg rounded-lg">
                    Go to Editor <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="border-white/20 text-white px-8 py-6 text-lg rounded-lg"
                  onClick={handleLogout}
                >
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-8 py-6 text-lg rounded-lg">
                    Try Now <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" className="border-white/20 text-white px-8 py-6 text-lg rounded-lg">
                    Create Account
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section (Floating Cards) */}
      <div className="relative z-10 container mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature Card 1 */}
          <div className="rounded-xl bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10 p-6 backdrop-blur-sm hover:shadow-xl hover:shadow-blue-500/5 transition">
            <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered Suggestions</h3>
            <p className="text-gray-400">Get intelligent content suggestions as you write, helping you overcome writer's block and enhance your documents.</p>
          </div>

          {/* Feature Card 2 */}
          <div className="rounded-xl bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10 p-6 backdrop-blur-sm hover:shadow-xl hover:shadow-blue-500/5 transition">
            <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Elegant Editor</h3>
            <p className="text-gray-400">A clean, distraction-free writing environment that lets you focus on your content with a minimal, beautiful interface.</p>
          </div>

          {/* Feature Card 3 */}
          <div className="rounded-xl bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10 p-6 backdrop-blur-sm hover:shadow-xl hover:shadow-blue-500/5 transition">
            <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Seamless Saving</h3>
            <p className="text-gray-400">Your documents are automatically saved as you type, ensuring you never lose your work and can access it from anywhere.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="h-7 w-7">
                <img src="/generated-icon.png" alt="AI Writing Assistant" className="h-full w-full object-contain" />
              </div>
              <div className="text-sm font-medium">AI Writing Assistant</div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <Link href="/terms"><span className="hover:text-white transition">Terms</span></Link>
              <Link href="/privacy"><span className="hover:text-white transition">Privacy</span></Link>
              <Link href="/contact"><span className="hover:text-white transition">Contact</span></Link>
              <span>© {new Date().getFullYear()} AI Writing Assistant</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}