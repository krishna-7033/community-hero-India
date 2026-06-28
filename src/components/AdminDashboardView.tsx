import { useState } from "react";
import { Activity, Clock, AlertTriangle, CheckCircle, Search, Trash2, Calendar, MapPin, Sparkles, Filter, Loader2, ArrowUpRight, HelpCircle } from "lucide-react";
import { Report } from "../types";

interface AdminDashboardViewProps {
  reports: Report[];
  onUpdateStatus: (id: string, newStatus: "Pending" | "In Progress" | "Resolved") => Promise<void>;
  onDeleteReport: (id: string) => Promise<void>;
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
  };
}

export default function AdminDashboardView({ reports, onUpdateStatus, onDeleteReport, stats }: AdminDashboardViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Filter logic
  const filteredReports = reports.filter((r) => {
    const matchesStatus = activeFilter === "All" || r.status === activeFilter;
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleAction = async (id: string, actionType: "status" | "delete", value?: any) => {
    setProcessingId(id);
    try {
      if (actionType === "status") {
        await onUpdateStatus(id, value);
      } else if (actionType === "delete") {
        if (confirm("Are you sure you want to delete this incident report permanently? This action cannot be undone.")) {
          await onDeleteReport(id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-500 text-white font-bold ring-2 ring-red-500/10";
      case "High":
        return "bg-rose-100 text-rose-800 border-rose-200 font-semibold";
      case "Medium":
        return "bg-amber-100 text-amber-800 border-amber-200 font-semibold";
      case "Low":
        return "bg-slate-100 text-slate-800 border-slate-200 font-semibold";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-red-50 text-red-700 border border-red-100";
      case "In Progress":
        return "bg-amber-50 text-amber-700 border border-amber-100";
      case "Resolved":
        return "bg-emerald-50 text-emerald-700 border border-emerald-100";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div id="admin-dashboard-view" className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Admin Management Panel
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Municipal control panel for updating incident lifecycles, auditing routing paths, and cleaning spam.
          </p>
        </div>
        <div className="inline-flex items-center space-x-2 bg-slate-900 text-slate-100 px-4 py-2 rounded-xl text-xs font-mono border border-slate-800">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>AUTHORIZED LEVEL: ADMINISTRATOR</span>
        </div>
      </div>

      {/* Top Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Reports */}
        <div className="bg-white border border-slate-100/80 p-5 rounded-[28px] flex items-center space-x-4 shadow-soft hover:shadow-md transition-shadow">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-2xl font-display font-bold text-slate-900">{stats.total}</span>
            <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Total Reports</span>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white border border-slate-100/80 p-5 rounded-[28px] flex items-center space-x-4 shadow-soft hover:shadow-md transition-shadow">
          <div className="bg-red-50 text-red-600 p-3 rounded-2xl">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="block text-2xl font-display font-bold text-slate-900">{stats.pending}</span>
            <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Pending</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white border border-slate-100/80 p-5 rounded-[28px] flex items-center space-x-4 shadow-soft hover:shadow-md transition-shadow">
          <div className="bg-amber-50 text-amber-600 p-3 rounded-2xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-2xl font-display font-bold text-slate-900">{stats.inProgress}</span>
            <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">In Progress</span>
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white border border-slate-100/80 p-5 rounded-[28px] flex items-center space-x-4 shadow-soft hover:shadow-md transition-shadow">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-2xl font-display font-bold text-slate-900">{stats.resolved}</span>
            <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Resolved</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-100/80 p-4 rounded-[32px] flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 shadow-soft">
        {/* Left Segmented Filter tabs */}
        <div className="flex flex-wrap gap-1.5 shrink-0">
          {["All", "Pending", "In Progress", "Resolved"].map((tab) => (
            <button
              key={tab}
              id={`filter-btn-${tab.toLowerCase().replace(" ", "-")}`}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === tab
                  ? "bg-slate-950 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Right Search Input */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reports by title, department, city..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs transition-all bg-slate-50/50"
          />
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <div className="bg-white border border-slate-100/80 p-12 text-center rounded-[32px] shadow-soft max-w-md mx-auto space-y-4">
          <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-display font-bold text-sm text-slate-900">No Incidents Found</h3>
            <p className="text-slate-400 text-xs leading-relaxed">No reports exist matching the selected parameters or searches.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              id={`admin-card-${report.id}`}
              className="bg-white rounded-[32px] overflow-hidden border border-slate-100/80 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 shadow-soft flex flex-col justify-between group"
            >
              
              {/* Card Body */}
              <div className="p-6 space-y-4">
                
                {/* Header status and labels */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[9px] font-mono bg-slate-100 text-slate-500 font-bold px-2.5 py-1 rounded uppercase tracking-wider border border-slate-200/50">
                      {report.category}
                    </span>
                    <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${getSeverityBadgeClass(report.severity)}`}>
                      {report.severity}
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${getStatusBadgeClass(report.status)}`}>
                    {report.status}
                  </span>
                </div>

                {/* Grid holding Image and Text content */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  {/* Photo or Fallback placeholder */}
                  <div className="sm:col-span-4 h-32 bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden flex items-center justify-center relative shadow-inner shrink-0">
                    {report.image ? (
                      <img
                        src={report.image}
                        alt="Report evidence thumbnail"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-center p-3 text-slate-300">
                        <MapPin className="w-8 h-8 mx-auto mb-1 text-slate-200" />
                        <span className="block text-[8px] font-mono font-bold uppercase tracking-wider">No photo</span>
                      </div>
                    )}
                  </div>

                  {/* Title and Description */}
                  <div className="sm:col-span-8 text-left space-y-1.5 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display font-black text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 leading-tight">
                        {report.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mt-1">
                        {report.description}
                      </p>
                    </div>

                    <div className="text-[10px] font-mono text-slate-400 space-y-0.5 mt-2">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-slate-300" />
                        <span>Date: {new Date(report.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1 font-bold text-slate-600">
                        <MapPin className="w-3 h-3 text-slate-300" />
                        <span>Location: {report.location.city} ({report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)})</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assigned Department Info Banner */}
                <div className="bg-[#F8FAFC] border border-slate-100 p-3 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-500 animate-pulse shrink-0" />
                    <span className="font-mono text-[9px] text-slate-400 font-bold uppercase">Routing:</span>
                    <span className="font-bold text-slate-700 truncate max-w-[200px]">{report.department}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100/60 px-2 py-0.5 rounded border border-slate-200/50">
                    ID: {report.id}
                  </span>
                </div>

              </div>

              {/* Card Actions (Admin Only buttons) */}
              <div className="bg-slate-50 border-t border-slate-100 p-4 px-6 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  {/* In Progress state trigger */}
                  {report.status === "Pending" && (
                    <button
                      type="button"
                      id={`btn-progress-${report.id}`}
                      onClick={() => handleAction(report.id, "status", "In Progress")}
                      disabled={processingId === report.id}
                      className="px-3.5 py-1.5 rounded-lg text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 shadow-sm transition-all cursor-pointer"
                    >
                      In Progress
                    </button>
                  )}

                  {/* Resolve state trigger */}
                  {report.status !== "Resolved" && (
                    <button
                      type="button"
                      id={`btn-resolve-${report.id}`}
                      onClick={() => handleAction(report.id, "status", "Resolved")}
                      disabled={processingId === report.id}
                      className="px-3.5 py-1.5 rounded-lg text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm transition-all cursor-pointer"
                    >
                      Resolve
                    </button>
                  )}
                </div>

                {/* Delete Spam action */}
                <button
                  type="button"
                  id={`btn-delete-${report.id}`}
                  onClick={() => handleAction(report.id, "delete")}
                  disabled={processingId === report.id}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-bold border border-red-200 text-red-600 hover:bg-red-50 transition-all flex items-center space-x-1 hover:border-red-300 cursor-pointer"
                  title="Delete report"
                >
                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Delete</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
