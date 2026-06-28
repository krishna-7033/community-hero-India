import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import HomeView from "./components/HomeView";
import Footer from "./components/Footer";
import ReportIssueView from "./components/ReportIssueView";
import CommunityMapView from "./components/CommunityMapView";
import AIAssistantView from "./components/AIAssistantView";
import AdminLoginView from "./components/AdminLoginView";
import AdminDashboardView from "./components/AdminDashboardView";
import { Report } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { Loader2 } from "lucide-react";

export default function App() {
  const [currentView, setCurrentView] = useState<string>("home");
  const [reports, setReports] = useState<Report[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch reports from Express API
  const fetchReports = async () => {
    try {
      const res = await fetch("/api/reports");
      if (!res.ok) throw new Error("Failed to fetch reports database.");
      const data = await res.json();
      setReports(data);
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();

    // Check for existing Admin Token in LocalStorage on startup
    const token = localStorage.getItem("adminToken");
    if (token === "admin-super-token-12345") {
      setIsAdmin(true);
      setAdminToken(token);
    }
  }, []);

  const handleLoginSuccess = (token: string) => {
    setIsAdmin(true);
    setAdminToken(token);
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setIsAdmin(false);
    setAdminToken(null);
  };

  // Protected route check
  const handleNavigate = (view: string) => {
    if (view === "dashboard" && !isAdmin) {
      setCurrentView("login");
    } else {
      setCurrentView(view);
    }
  };

  // Update report status (PATCH API)
  const handleUpdateStatus = async (id: string, newStatus: "Pending" | "In Progress" | "Resolved") => {
    try {
      const res = await fetch(`/api/reports/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Status update failed.");
      }

      // Refresh database
      await fetchReports();
    } catch (err) {
      console.error(err);
      alert("Error updating report status. Administrator credentials may be stale.");
    }
  };

  // Delete spam report (DELETE API)
  const handleDeleteReport = async (id: string) => {
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${adminToken}`
        }
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Delete failed.");
      }

      // Refresh database
      await fetchReports();
    } catch (err) {
      console.error(err);
      alert("Error deleting report. Please try again.");
    }
  };

  // Compute stats on-the-fly from actual state
  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === "Pending").length,
    inProgress: reports.filter((r) => r.status === "In Progress").length,
    resolved: reports.filter((r) => r.status === "Resolved").length
  };

  const renderView = () => {
    switch (currentView) {
      case "home":
        return <HomeView onNavigate={handleNavigate} stats={stats} />;
      case "report":
        return <ReportIssueView onNavigate={handleNavigate} onSubmitSuccess={fetchReports} />;
      case "map":
        return <CommunityMapView reports={reports} />;
      case "assistant":
        return <AIAssistantView />;
      case "login":
        return <AdminLoginView onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />;
      case "dashboard":
        return (
          <AdminDashboardView
            reports={reports}
            onUpdateStatus={handleUpdateStatus}
            onDeleteReport={handleDeleteReport}
            stats={stats}
          />
        );
      default:
        return <HomeView onNavigate={handleNavigate} stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      {/* Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />

      {/* Main Core View Area with beautiful Transitions */}
      <main className="flex-grow">
        {isLoading ? (
          <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <span className="text-sm font-semibold text-slate-500 font-mono tracking-wide">
              SYNCHRONIZING CIVIC DATABASE...
            </span>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Global Footer (hidden on full-bleed interactive views like map and assistant) */}
      {currentView !== "map" && currentView !== "assistant" && (
        <Footer onNavigate={handleNavigate} />
      )}
    </div>
  );
}
