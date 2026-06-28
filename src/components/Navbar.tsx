import { useState, useEffect } from "react";
import { Shield, MapPin, MessageSquare, LayoutDashboard, Lock, LogOut, Menu, X, PlusCircle, Sparkles, Home } from "lucide-react";

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isAdmin: boolean;
  onLogout: () => void;
}

export default function Navbar({ currentView, onNavigate, isAdmin, onLogout }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "report", label: "Report Issue", icon: PlusCircle },
    { id: "map", label: "Community Map", icon: MapPin },
    { id: "assistant", label: "AI Assistant", icon: MessageSquare },
  ];

  return (
    <nav
      id="main-nav"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-md border-b border-slate-100 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <div
            id="logo-container"
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => onNavigate("home")}
          >
            <div className="bg-white p-1.5 rounded-xl shadow-md border border-slate-100 flex items-center justify-center transition-transform hover:scale-105 overflow-hidden w-11 h-11">
              <img
                src="/src/assets/images/community_logo_1782575199269.jpg"
                alt="Community Hero"
                className="w-full h-full object-cover rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="font-display font-bold text-xl tracking-tight text-slate-900 flex items-center gap-1.5">
                Community <span className="text-blue-600">Hero</span>
              </span>
              <span className="block text-[10px] font-mono text-slate-400 tracking-widest uppercase -mt-1">
                AI Civic Action
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-500/5"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Admin Dashboard (Visible only if logged in) */}
            {isAdmin && (
              <div className="flex items-center space-x-2 bg-amber-50/60 border border-amber-200/60 px-3 py-1.5 rounded-2xl shadow-sm shadow-amber-500/5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span className="text-[10px] font-mono text-amber-700 font-bold uppercase tracking-widest mr-1">Admin</span>
                <button
                  id="nav-item-dashboard"
                  onClick={() => onNavigate("dashboard")}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    currentView === "dashboard"
                      ? "bg-amber-600 text-white shadow-md shadow-amber-600/10"
                      : "text-amber-800 hover:text-amber-950 hover:bg-amber-100/60"
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </button>
              </div>
            )}

            {/* Divider */}
            <span className="h-5 w-px bg-slate-200 mx-2"></span>

            {/* Admin Auth Button */}
            {isAdmin ? (
              <button
                id="btn-logout"
                onClick={() => {
                  onLogout();
                  onNavigate("home");
                }}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all cursor-pointer shadow-sm shadow-red-500/5"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                id="btn-login"
                onClick={() => onNavigate("login")}
                className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
                  currentView === "login"
                    ? "bg-amber-600 text-white shadow-lg shadow-amber-600/25"
                    : "bg-slate-900 text-slate-100 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 shadow-md"
                }`}
              >
                <Lock className={`w-3.5 h-3.5 ${currentView === "login" ? "text-white" : "text-amber-400 animate-pulse"}`} />
                <span>Admin Login</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700 uppercase font-mono tracking-wider font-bold">Staff</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              id="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-600 hover:text-slate-900 focus:outline-none p-2 rounded-lg hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden bg-white/95 backdrop-blur-md shadow-lg border-b border-slate-100 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-item-${item.id}`}
                onClick={() => {
                  onNavigate(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-base font-medium ${
                  isActive ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-5 h-5 text-slate-400" />
                <span>{item.label}</span>
              </button>
            );
          })}

          {isAdmin && (
            <div className="mx-2 p-2 rounded-2xl bg-amber-50 border border-amber-100 flex flex-col space-y-1">
              <div className="flex items-center space-x-2 px-2 py-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span className="text-[10px] font-mono text-amber-800 font-bold uppercase tracking-wider">Administrative Zone</span>
              </div>
              <button
                id="mobile-nav-item-dashboard"
                onClick={() => {
                  onNavigate("dashboard");
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-base font-medium ${
                  currentView === "dashboard"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-amber-950 hover:bg-amber-100/50"
                }`}
              >
                <LayoutDashboard className={`w-5 h-5 ${currentView === "dashboard" ? "text-white" : "text-amber-600"}`} />
                <span>Dashboard</span>
              </button>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2">
            {isAdmin ? (
              <button
                id="mobile-btn-logout"
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                  onNavigate("home");
                }}
                className="flex items-center justify-center space-x-2 w-full px-4 py-2.5 rounded-xl text-base font-semibold border border-red-200 text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                id="mobile-btn-login"
                onClick={() => {
                  onNavigate("login");
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center justify-center space-x-2 w-full px-4 py-2.5 rounded-xl text-base font-semibold transition-all duration-300 ${
                  currentView === "login"
                    ? "bg-amber-600 text-white"
                    : "bg-slate-900 text-slate-100 border border-slate-800"
                }`}
              >
                <Lock className={`w-4 h-4 ${currentView === "login" ? "text-white" : "text-amber-400 animate-pulse"}`} />
                <span>Admin Login</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 font-mono tracking-wider font-bold">Staff</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
