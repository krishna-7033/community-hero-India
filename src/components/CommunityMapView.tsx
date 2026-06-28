import { useState, useEffect, useRef } from "react";
import { Map, MapPin, Eye, Search, Filter, ShieldAlert, Sparkles, Navigation, ListFilter } from "lucide-react";
import L from "leaflet";
import { Report } from "../types";

interface CommunityMapViewProps {
  reports: Report[];
}

export default function CommunityMapView({ reports }: CommunityMapViewProps) {
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    const matchesStatus = filterStatus === "All" || r.status === filterStatus;
    const matchesCategory = filterCategory === "All" || r.category === filterCategory;
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let map: L.Map | null = null;

    // Create Leaflet Map Instance
    if (!mapInstanceRef.current) {
      map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView([37.7749, -122.4194], 12); // SF center

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;

      // Force instant resize check with minor delay to accommodate rendering
      setTimeout(() => {
        if (map) {
          map.invalidateSize();
        }
      }, 250);
    }

    return () => {
      // Clean up map instance on unmount to prevent memory leaks and "Map container already initialized" errors
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync and Update Markers when reports or filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    Object.values(markersRef.current).forEach((marker: any) => marker.remove());
    markersRef.current = {};

    if (filteredReports.length === 0) return;

    // Add markers for current filtered reports
    filteredReports.forEach((report) => {
      const lat = report.location.lat;
      const lng = report.location.lng;

      // Color coding
      let pinBgColor = "bg-red-600";
      let pinRingColor = "ring-red-500/30";
      let pulseColor = "bg-red-500 animate-ping";
      let badgeStyle = "bg-red-100 text-red-800 border-red-200";

      if (report.status === "In Progress") {
        pinBgColor = "bg-amber-500";
        pinRingColor = "ring-amber-500/30";
        pulseColor = "bg-amber-400 animate-ping";
        badgeStyle = "bg-amber-100 text-amber-800 border-amber-200";
      } else if (report.status === "Resolved") {
        pinBgColor = "bg-emerald-500";
        pinRingColor = "ring-emerald-500/30";
        pulseColor = "bg-emerald-400 hidden"; // no pulsing for resolved
        badgeStyle = "bg-emerald-100 text-emerald-800 border-emerald-200";
      }

      const markerHtml = `
        <div class="relative group">
          <div class="absolute -top-1 -left-1 w-10 h-10 rounded-full ${pulseColor} opacity-75"></div>
          <div class="w-8 h-8 rounded-full ${pinBgColor} border-2 border-white shadow-lg flex items-center justify-center text-white relative z-10 hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-map-pin",
        html: markerHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      // Assemble beautifully formatted HTML popup
      const imageHtml = report.image
        ? `<img src="${report.image}" class="w-full h-24 object-cover rounded-xl mb-3 shadow-inner" style="display:block; max-width:100%;" />`
        : `<div class="w-full h-16 bg-slate-100 rounded-xl mb-3 flex items-center justify-center text-slate-400 text-[10px] font-mono font-bold uppercase tracking-wider">No Photo Attached</div>`;

      const popupContent = `
        <div class="p-1 font-sans" style="width:230px; line-height:1.4;">
          ${imageHtml}
          <div class="text-xs font-mono font-bold uppercase text-slate-400 mb-1">${report.category}</div>
          <h3 class="font-bold text-sm text-slate-900 mb-1" style="margin:0 0 4px 0; font-family:'Space Grotesk', sans-serif;">${report.title}</h3>
          <p class="text-xs text-slate-500 mb-3" style="margin:0 0 12px 0; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${report.description}</p>
          
          <div style="display:grid; grid-template-columns:1fr; gap:6px; margin-bottom:10px;">
            <div style="display:flex; justify-between; align-items:center;">
              <span style="font-size:10px; color:#94a3b8; font-weight:600; font-family:monospace;">SEVERITY:</span>
              <span style="font-size:10px; font-weight:bold; color:#f43f5e; margin-left:auto;">${report.severity}</span>
            </div>
            <div style="display:flex; justify-between; align-items:center;">
              <span style="font-size:10px; color:#94a3b8; font-weight:600; font-family:monospace;">ROUTE:</span>
              <span style="font-size:10px; font-weight:bold; color:#475569; margin-left:auto;">${report.department.split(" ").slice(0, 3).join(" ")}</span>
            </div>
          </div>

          <div style="display:flex; align-items:center; border-top:1px solid #f1f5f9; padding-top:8px;">
            <span style="font-size:10px; font-weight:bold; background-color:#f8fafc; padding:3px 6px; border-radius:4px; color:#64748b; border:1px solid #e2e8f0;">
              📍 ${report.location.city || "SF"}
            </span>
            <span style="margin-left:auto; font-size:10px; font-weight:bold; padding:3px 6px; border-radius:4px;" class="${badgeStyle}">
              ${report.status}
            </span>
          </div>
        </div>
      `;

      const marker = L.marker([lat, lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(popupContent);

      markersRef.current[report.id] = marker;
    });

    // Fit map bounds to show all markers
    if (filteredReports.length > 0) {
      const group = L.featureGroup(Object.values(markersRef.current));
      map.fitBounds(group.getBounds().pad(0.15));
    }

    // Force size invalidation whenever filtered reports update to ensure rendering is synchronized
    setTimeout(() => {
      map.invalidateSize();
    }, 150);
  }, [filteredReports]);

  // Handle flying/focusing on specific report from sidebar
  const handleFocusReport = (report: Report) => {
    setSelectedReportId(report.id);
    const map = mapInstanceRef.current;
    if (map) {
      map.setView([report.location.lat, report.location.lng], 15);
      const marker = markersRef.current[report.id];
      if (marker) {
        marker.openPopup();
      }
    }
  };

  return (
    <div id="map-view" className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Community Map
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            View local reports in real-time, inspect resolution statuses, and verify assigned routes.
          </p>
        </div>

        {/* Legend */}
        <div className="bg-white border border-slate-100 p-3 rounded-2xl flex flex-wrap items-center gap-4 text-xs shadow-sm w-fit self-end md:self-auto">
          <span className="font-semibold text-slate-400 font-mono text-[10px] uppercase">Legend:</span>
          <div className="flex items-center space-x-1.5">
            <span className="h-3.5 w-3.5 rounded-full bg-red-500 border border-white shadow-sm block animate-pulse"></span>
            <span className="text-slate-600 font-semibold">Pending</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-3.5 w-3.5 rounded-full bg-amber-400 border border-white shadow-sm block animate-pulse"></span>
            <span className="text-slate-600 font-semibold">In Progress</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-3.5 w-3.5 rounded-full bg-emerald-500 border border-white shadow-sm block"></span>
            <span className="text-slate-600 font-semibold">Resolved</span>
          </div>
        </div>
      </div>

      {/* Grid Layout: Bento Sidebar + Leaflet Canvas Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[calc(100vh-230px)] lg:min-h-[500px]">
        
        {/* Sidebar Left: Search & Filter and Lists */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-[32px] p-5 flex flex-col justify-between overflow-hidden shadow-soft space-y-4">
          
          {/* Header Controls */}
          <div className="space-y-3 shrink-0">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by keyword, street, city..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs transition-all bg-slate-50/50"
              />
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-2 gap-2">
              {/* Status Filter */}
              <div>
                <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                  <ListFilter className="w-3 h-3" /> Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Category
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="All">All Categories</option>
                  <option value="Road Hazards">Road Hazards</option>
                  <option value="Public Utilities">Public Utilities</option>
                  <option value="Sanitation">Sanitation</option>
                  <option value="Public Safety">Public Safety</option>
                  <option value="Environmental">Environmental</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {filteredReports.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-slate-400 text-xs">No reports match your selected search or filter terms.</p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => handleFocusReport(report)}
                  className={`border p-3 rounded-2xl cursor-pointer text-left transition-all hover:border-blue-400 ${
                    selectedReportId === report.id
                      ? "border-blue-500 bg-blue-50/20 shadow-sm"
                      : "border-slate-100 bg-slate-50/30"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[9px] font-mono bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      {report.category}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                      report.status === "Pending"
                        ? "bg-red-50 text-red-700 border border-red-100"
                        : report.status === "In Progress"
                        ? "bg-amber-50 text-amber-700 border border-amber-100"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    }`}>
                      {report.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-xs text-slate-900 mt-2 truncate">{report.title}</h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{report.description}</p>
                  
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2.5 pt-2 border-t border-slate-100/60 font-mono">
                    <span>📍 {report.location.city}</span>
                    <span className="font-bold text-red-500">{report.severity}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Summary counts */}
          <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl shrink-0">
            <div className="flex justify-between text-xs font-semibold text-slate-600">
              <span>Showing:</span>
              <span>{filteredReports.length} / {reports.length} Reports</span>
            </div>
          </div>
        </div>

        {/* Map Right Canvas */}
        <div className="lg:col-span-8 bg-slate-100 rounded-[32px] overflow-hidden border border-slate-100 relative shadow-soft h-[450px] lg:h-full">
          <div id="osm-canvas" ref={mapContainerRef} className="w-full h-full z-0"></div>
          {/* Legend Banner Floating */}
          <div className="absolute top-3 left-12 z-10 bg-slate-900/80 backdrop-blur-md p-2 rounded-xl border border-slate-700/50 shadow-md pointer-events-none flex items-center space-x-1.5 text-white">
            <Navigation className="w-4.5 h-4.5 text-blue-400 animate-pulse" />
            <span className="font-display font-semibold text-xs tracking-tight">Interactive Map Active</span>
          </div>
        </div>

      </div>
    </div>
  );
}
