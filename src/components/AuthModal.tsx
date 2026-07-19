import React, { useState } from "react";
import { Lock, Mail, User as UserIcon, Shield, Sparkles, Flame, Eye, EyeOff, Check, ArrowRight } from "lucide-react";
import { User, UserRole } from "../types";
import { isFirebaseConfigured, authenticateWithFirebase, registerWithFirebase } from "../lib/firebase";

interface AuthModalProps {
  onAuthSuccess: (user: User, token: string) => void;
  onClose?: () => void;
  isClosable?: boolean;
}

export default function AuthModal({ onAuthSuccess, onClose, isClosable = false }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<UserRole>("fan");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authenticateWithFirebase(demoEmail, demoPass);
      if (!result.success || !result.user) {
        throw new Error(result.error || "Login failed");
      }
      onAuthSuccess(result.user, result.token || "demo-token");
    } catch (err: any) {
      setError(err.message || "An error occurred during demo login.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isLogin) {
        const result = await authenticateWithFirebase(email, password);
        if (!result.success || !result.user) {
          throw new Error(result.error || "Authentication failed");
        }
        onAuthSuccess(result.user, result.token || "session-token");
      } else {
        const result = await registerWithFirebase(username, email, password, role);
        if (!result.success || !result.user) {
          throw new Error(result.error || "Registration failed");
        }
        setSuccessMsg(
          isFirebaseConfigured 
            ? "Account created in Firebase! Authenticating session..." 
            : "Account registered in local ledger! Logging you in..."
        );
        // Auto log in after register
        setTimeout(() => {
          handleDemoLogin(email, password);
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/10">
        
        {/* Glow effect at top */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
        
        {/* Main Content */}
        <div className="p-8 sm:p-10 space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-2">
              <Flame size={26} className="animate-pulse" />
            </div>
            <h2 className="text-2xl font-display font-black text-white tracking-tight uppercase">
              Ignis Arena Platform
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-slate-400 font-mono tracking-wider uppercase">
                Autonomous Stadium Intelligence
              </span>
              <span className="h-1 w-1 rounded-full bg-slate-700 hidden sm:inline" />
              {isFirebaseConfigured ? (
                <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-widest bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 animate-pulse">
                  🔥 Firebase Connected
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-widest bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
                  📁 Local Ledger
                </span>
              )}
            </div>
          </div>

          {/* Form switch */}
          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800/80">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                isLogin
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                !isLogin
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Register ID
            </button>
          </div>

          {/* Error and Success alerts */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-mono flex gap-2">
              <span className="font-bold">⚠️ ERROR:</span>
              <p className="flex-1">{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 font-mono flex gap-2">
              <span className="font-bold">✓ SUCCESS:</span>
              <p className="flex-1">{successMsg}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username for registration */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label htmlFor="reg-fullname" className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <UserIcon size={15} />
                  </span>
                  <input
                    type="text"
                    required
                    id="reg-fullname"
                    placeholder="Enter full name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800/80 rounded-xl py-3 pl-10 pr-4 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-1.5">
              <label htmlFor="sys-email" className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                System Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Mail size={15} />
                </span>
                <input
                  type="email"
                  required
                  id="sys-email"
                  placeholder="name@ignis.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800/80 rounded-xl py-3 pl-10 pr-4 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="access-pass" className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Access Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock size={15} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  id="access-pass"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800/80 rounded-xl py-3 pl-10 pr-10 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Role Selection (Only on Sign Up) */}
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Designated Department Access
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "director", name: "Director", desc: "Stadium Control", icon: <Sparkles size={13} /> },
                    { id: "security", name: "Security", desc: "Patrol & Risk", icon: <Shield size={13} /> },
                    { id: "fan", name: "Fan Node", desc: "Show & Order", icon: <Flame size={13} /> },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id as UserRole)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        role === r.id
                          ? "bg-indigo-500/10 border-indigo-500 text-white shadow-md shadow-indigo-500/5"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-1 font-mono font-bold text-[11px]">
                        {r.icon}
                        {r.name}
                      </div>
                      <span className="text-[9px] text-slate-500 font-sans block">{r.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-4 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20 disabled:bg-indigo-800 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing Ledger...
                </>
              ) : (
                <>
                  {isLogin ? "Authenticate System Credentials" : "Create System Access Record"}
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Quick Login Section */}
          <div className="pt-6 border-t border-slate-800/80 space-y-3">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block text-center">
              🛡️ Instant Simulation Tour Logins (Quick-Access)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin("director@ignis.com", "director123")}
                disabled={loading}
                className="py-2 px-3 bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-900/60 rounded-xl text-[10px] font-mono font-semibold text-indigo-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>🏟</span> Director Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("security@ignis.com", "security123")}
                disabled={loading}
                className="py-2 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-[10px] font-mono font-semibold text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>👮</span> Security Officer
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("fan@ignis.com", "fan123")}
                disabled={loading}
                className="py-2 px-3 bg-amber-950/40 hover:bg-amber-900/40 border border-amber-900/60 rounded-xl text-[10px] font-mono font-semibold text-amber-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>🍔</span> Stadium Fan Node
              </button>
            </div>
          </div>

          {/* Optional Guest bypass if closable */}
          {isClosable && (
            <div className="text-center">
              <button
                type="button"
                onClick={onClose}
                className="text-[11px] font-mono text-slate-500 hover:text-slate-300 underline cursor-pointer"
              >
                Continue as anonymous viewer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
