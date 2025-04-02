import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../App";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      //return login(credentials.username, credentials.password);
    },
    onSuccess: () => {
      toast({
        title: "Login successful",
        description: "You have been logged in successfully",
      });
      setLocation("/document/1");
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 flex items-center justify-center p-4">
      {/* Radial gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-1/2 h-1/2 bg-blue-500 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-full h-1/2 bg-purple-500 rounded-full opacity-5 blur-3xl -translate-y-1/2"></div>
      </div>

      {/* Grid pattern background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="w-full max-w-md">
        <div className="absolute top-8 left-8">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="bg-black/30 backdrop-blur-lg border border-white/10 p-8 rounded-2xl shadow-xl">
          <div className="flex justify-center mb-6">
            <div className="h-12 w-12 relative">
              <div className="h-full w-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 absolute blur opacity-70"></div>
              <img
                src="/generated-icon.png"
                alt="AI Writing Assistant"
                className="h-full w-full object-contain relative z-10"
              />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-white mb-8">
            Log in to your account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white/70">
                Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white/5 border-white/10 text-white focus:border-blue-400 focus:ring-blue-400/10"
                placeholder="Enter your username"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white/70">
                  Password
                </Label>
                <Link href="/forgot-password">
                  <span className="text-xs text-blue-400 hover:text-blue-300">
                    Forgot password?
                  </span>
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-white/10 text-white focus:border-blue-400 focus:ring-blue-400/10"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/50 text-sm">
              Don't have an account?{" "}
              <Link href="/register">
                <span className="text-blue-400 hover:text-blue-300">
                  Create an account
                </span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
