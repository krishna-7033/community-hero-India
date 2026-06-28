import { useState, useEffect } from "react";
import { Shield, Map, BrainCircuit, Activity, Eye, ShieldCheck, HelpCircle, ArrowRight, ActivitySquare, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { motion } from "motion/react";

interface HomeViewProps {
  onNavigate: (view: string) => void;
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
  };
}

// Custom hook to animate counters
function useAnimatedCount(target: number, duration: number = 1000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = target;
    if (end === 0) return;
    
    const incrementTime = Math.abs(Math.floor(duration / end));
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      }
    }, Math.max(incrementTime, 20));

    return () => clearInterval(timer);
  }, [target, duration]);

  return count;
}

export default function HomeView({ onNavigate, stats }: HomeViewProps) {
  const totalCount = useAnimatedCount(stats.total);
  const pendingCount = useAnimatedCount(stats.pending);
  const inProgressCount = useAnimatedCount(stats.inProgress);
  const resolvedCount = useAnimatedCount(stats.resolved);

  const features = [
    {
      title: "AI Powered Classification",
      description: "Automatically analyzes report titles and descriptions to predict Category, Severity, and the exact Responsible Department instantly using Gemini AI.",
      icon: BrainCircuit,
      color: "from-blue-500 to-cyan-500",
      badge: "Gemini AI"
    },
    {
      title: "Interactive Community Map",
      description: "Displays reported community complaints on an interactive Leaflet openstreetmap. Color-coded markers quickly show resolution states.",
      icon: Map,
      color: "from-indigo-500 to-purple-500",
      badge: "Real-time Map"
    },
    {
      title: "Smart Admin Dashboard",
      description: "Enables city administrators and municipal staff to view statistics, review civic reports, update resolution progress, and filter out spams.",
      icon: ShieldCheck,
      color: "from-emerald-500 to-teal-500",
      badge: "Staff Tools"
    },
    {
      title: "24/7 AI Civic Assistant",
      description: "Features an interactive ChatGPT-style helper ready to address inquiries about pothole repairs, waste guidelines, and municipal reporting workflows.",
      icon: HelpCircle,
      color: "from-orange-500 to-amber-500",
      badge: "AI Help"
    }
  ];

  return (
    <div id="home-view" className="space-y-24">
      {/* Hero Section */}
      <section
        id="hero-section"
        className="relative pt-32 pb-16 overflow-hidden"
      >
        {/* Abstract Background Accents */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl -z-10"></div>
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-cyan-200/20 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
                <span className="text-xs font-mono font-semibold text-blue-700 uppercase tracking-wider">
                  Next-Gen Civic Engagement
                </span>
              </div>

              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-slate-900 leading-tight tracking-tight">
                Empowering Communities <br className="hidden sm:inline" />
                Through{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                  AI
                </span>
              </h1>

              <p className="text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Report civic issues, track their progress, and let AI
                intelligently classify every complaint for faster action. Join
                us in building safer, cleaner, and smarter neighborhoods.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  id="btn-hero-report"
                  onClick={() => onNavigate("report")}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all hover:-translate-y-0.5 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Report an Issue</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  id="btn-hero-map"
                  onClick={() => onNavigate("map")}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-slate-700 font-semibold border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all hover:-translate-y-0.5 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>View Community Map</span>
                </button>
              </div>
            </div>

            {/* Right Graphic */}
            <div className="lg:col-span-6">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                {/* Decorative borders */}
                <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl opacity-10 blur-xl"></div>
                <div className="relative bg-white p-4 rounded-3xl shadow-2xl border border-slate-100 overflow-hidden group">
                  <img
                    id="hero-city-graphic"
                    src="images/city_hero_illustration_.png"
                    alt="Community Hero Smart City illustration"
                    className="w-full h-auto rounded-2xl object-cover transform hover:scale-[1.02] transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />

                  {/* Floating AI badge */}
                  <div className="absolute bottom-8 left-8 bg-slate-900/90 backdrop-blur-md border border-slate-700/50 p-4 rounded-2xl text-white flex items-center space-x-3 shadow-xl">
                    <div className="bg-blue-500 p-2 rounded-lg">
                      <BrainCircuit className="w-5 h-5 text-white animate-pulse" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-mono tracking-wider text-cyan-400 uppercase">
                        Analysis Engine
                      </span>
                      <span className="font-display font-semibold text-sm text-slate-100">
                        AI Classification Live
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section
        id="stats-section"
        className="bg-white py-16 border-y border-slate-100 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-display font-bold text-3xl text-slate-900">
              Platform Real-time Activity
            </h2>
            <p className="text-slate-500 mt-2 text-sm">
              Active records synchronized across local municipalities and
              community channels.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Total */}
            <div className="bg-[#F8FAFC] rounded-[28px] p-6 border border-slate-100/80 text-center flex flex-col justify-between shadow-soft hover:shadow-md transition-all">
              <div className="mx-auto bg-blue-100 text-blue-600 p-3 rounded-2xl w-fit">
                <Activity className="w-6 h-6" />
              </div>
              <div className="mt-4">
                <span className="block text-4xl font-display font-extrabold text-slate-900">
                  {totalCount}
                </span>
                <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mt-1">
                  Total Reports
                </span>
              </div>
            </div>

            {/* Pending */}
            <div className="bg-[#F8FAFC] rounded-[28px] p-6 border border-slate-100/80 text-center flex flex-col justify-between shadow-soft hover:shadow-md transition-all">
              <div className="mx-auto bg-red-100 text-red-600 p-3 rounded-2xl w-fit">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div className="mt-4">
                <span className="block text-4xl font-display font-extrabold text-slate-900">
                  {pendingCount}
                </span>
                <span className="block text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider mt-1">
                  Pending Review
                </span>
              </div>
            </div>

            {/* In Progress */}
            <div className="bg-[#F8FAFC] rounded-[28px] p-6 border border-slate-100/80 text-center flex flex-col justify-between shadow-soft hover:shadow-md transition-all">
              <div className="mx-auto bg-amber-100 text-amber-600 p-3 rounded-2xl w-fit">
                <ActivitySquare className="w-6 h-6" />
              </div>
              <div className="mt-4">
                <span className="block text-4xl font-display font-extrabold text-slate-900">
                  {inProgressCount}
                </span>
                <span className="block text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider mt-1">
                  In Progress
                </span>
              </div>
            </div>

            {/* Resolved */}
            <div className="bg-[#F8FAFC] rounded-[28px] p-6 border border-slate-100/80 text-center flex flex-col justify-between shadow-soft hover:shadow-md transition-all">
              <div className="mx-auto bg-emerald-100 text-emerald-600 p-3 rounded-2xl w-fit">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="mt-4">
                <span className="block text-4xl font-display font-extrabold text-slate-900">
                  {resolvedCount}
                </span>
                <span className="block text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider mt-1">
                  Resolved Civic Issues
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features-section"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-blue-600 font-mono font-bold uppercase tracking-wider text-[10px] px-3 py-1 bg-blue-50 rounded-full">
            What We Do
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900">
            Smart Solutions for Civic Management
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed max-w-2xl mx-auto">
            We bridge the communication gap between citizens and local
            authorities using modern artificial intelligence capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, idx) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={idx}
                id={`feature-card-${idx}`}
                className="bg-white border border-slate-100/80 rounded-[32px] p-8 shadow-soft hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div
                      className={`p-4 rounded-2xl bg-gradient-to-br ${feature.color} text-white shadow-md`}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono bg-slate-50 border border-slate-100 text-slate-500 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {feature.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-display font-bold text-slate-900 mt-6 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed mt-3">
                    {feature.description}
                  </p>
                </div>
                {/* <div className="mt-8 flex items-center text-blue-600 text-xs font-semibold group-hover:underline cursor-pointer">
                  <span>Learn more about this system</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </div> */}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
