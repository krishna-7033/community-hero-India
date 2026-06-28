import React, { useState } from "react";
import { Lock, User, Eye, EyeOff, Loader2, ShieldCheck, AlertCircle } from "lucide-react";

interface AdminLoginViewProps {
  onLoginSuccess: (token: string) => void;
  onNavigate: (view: string) => void;
}

export default function AdminLoginView({ onLoginSuccess, onNavigate }: AdminLoginViewProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!username || !password) {
      setErrorMessage("Please enter both username and password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed. Incorrect credentials.");
      }

      // Store token securely
      localStorage.setItem("adminToken", data.token);
      onLoginSuccess(data.token);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Something went wrong during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="login-view" className="min-h-[calc(100vh-160px)] flex items-center justify-center pt-24 pb-12 px-4 relative overflow-hidden">
      {/* Background decoration elements */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl -z-10"></div>

      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl border border-slate-100 space-y-6">
        
        {/* Card Header Badge */}
        <div className="text-center space-y-3">
          <div className="mx-auto bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4 rounded-3xl shadow-lg w-fit">
            <Lock className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="font-display font-black text-2xl text-slate-900 tracking-tight">Admin Portal</h2>
          <p className="text-xs text-slate-400">Provide credentials below to access the administrative dashboard.</p>
        </div>

        {/* Demo Credentials Alert Helper 
         <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider block">DEMONSTRATION ACCESS</span>
          <div className="text-xs text-slate-600 font-mono space-y-0.5">
            <div>Username: <span className="font-bold text-blue-700">admin</span></div>
            <div>Password: <span className="font-bold text-blue-700">admin123</span></div>
          </div>
        </div> */}

        {/* Error Notification */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-red-700 flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Username Field */}
          <div>
            <label htmlFor="login-username" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                id="login-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-slate-50/50"
              />
              <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-slate-50/50"
              />
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Gradient Submission Button */}
          <button
            type="submit"
            id="btn-login-submit"
            disabled={isLoading}
            className={`w-full py-3.5 rounded-2xl text-white font-bold text-sm shadow-md transition-all ${
              isLoading
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating Portal...</span>
              </span>
            ) : (
              <span>Sign In Securely</span>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
