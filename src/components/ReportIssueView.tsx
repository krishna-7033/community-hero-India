import React, { useState, useEffect, useRef } from "react";
import { Sparkles, MapPin, Search, Compass, Upload, Check, AlertCircle, Loader2, FileText, Camera, Brain, X, CheckSquare } from "lucide-react";
import L from "leaflet";

interface ReportIssueViewProps {
  onNavigate: (view: string) => void;
  onSubmitSuccess: () => void;
}

export default function ReportIssueView({ onNavigate, onSubmitSuccess }: ReportIssueViewProps) {
  // Card 1: Issue Details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Card 2: AI Analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<{
    category: string;
    severity: string;
    department: string;
    explanation: string;
  } | null>(null);
  const [aiError, setAiError] = useState("");

  // Card 3: Location
  const [searchCity, setSearchCity] = useState("New Delhi");
  const [lat, setLat] = useState(28.6138954);
  const [lng, setLng] = useState(77.2090057);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");

  // Card 4: Upload Evidence
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isDragActive, setIsDragActive] = useState(false);

  // General States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Map Ref for mini map
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Initialize and Update Leaflet Mini Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create map if it doesn't exist
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([lat, lng], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19
      }).addTo(mapInstanceRef.current);

      // Custom icon
      const customIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: `<div class="w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-md flex items-center justify-center text-white">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                 </svg>
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      markerRef.current = L.marker([lat, lng], { icon: customIcon }).addTo(mapInstanceRef.current);
    } else {
      // Move map and marker if they exist
      mapInstanceRef.current.setView([lat, lng], 13);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
    }

    // Clean up
    return () => {
      // We don't necessarily want to destroy on every re-render of coords,
      // only if component fully unmounts
    };
  }, [lat, lng]);

  // Clean up fully on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // AI Analyzer Function
  const handleAiAnalysis = async () => {
    if (!title || !description) {
      setAiError("Please fill in the Title and Description in Card 1 first, so our AI can analyze the content.");
      return;
    }

    setAiError("");
    setIsAnalyzing(true);
    setAiResult(null);

    try {
      const res = await fetch("/api/analyze-issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title, description })
      });

      if (!res.ok) {
        throw new Error("Analysis failed. Server returned error status.");
      }

      const data = await res.json();
      setAiResult(data);
    } catch (err: any) {
      console.error(err);
      setAiError("Unable to reach the server-side AI engine. Please choose values manually below or try again.");
      // Provide fallback manually so they are never blocked
      setAiResult({
        category: "Road Hazards",
        severity: "Medium",
        department: "Department of Transportation",
        explanation: "AI analysis was unavailable. Selected typical default values based on general templates."
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Location search using OpenStreetMap Nominatim
  const handleCitySearch = async () => {
    if (!searchCity) return;
    setIsSearchingLocation(true);
    setLocationStatus("Geocoding address...");

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchCity)}`);
      if (!res.ok) throw new Error("Search failed.");
      const data = await res.json();
      if (data && data.length > 0) {
        const first = data[0];
        setLat(parseFloat(first.lat));
        setLng(parseFloat(first.lon));
        setLocationStatus(`Located: ${first.display_name.split(",").slice(0, 3).join(",")}`);
      } else {
        setLocationStatus("City not found. Try searching for a country or another city name.");
      }
    } catch (err) {
      console.error(err);
      setLocationStatus("Error locating address. Standard fallback coordinates configured.");
    } finally {
      setIsSearchingLocation(false);
    }
  };

  // Browser Geolocation
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by your browser.");
      return;
    }

    setLocationStatus("Fetching GPS coordinates...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setLocationStatus("GPS Location acquired successfully.");
        // Try reverse geocoding to find city name
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.address) {
              const city = data.address.city || data.address.town || data.address.village || "Current Location";
              setSearchCity(city);
            }
          }).catch(err => console.log(err));
      },
      (error) => {
        console.error(error);
        setLocationStatus("Permission denied or GPS signal lost. Please search manually.");
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // File Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError("File exceeds the maximum limit of 5 MB.");
      return;
    }

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setSubmitError("Unsupported file type. Please upload a JPG, JPEG, or PNG image.");
      return;
    }

    setImageFile(file);
    setSubmitError("");

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Report Submission
  const handleSubmitReport = async () => {
    setSubmitError("");

    if (!title || !description) {
      setSubmitError("Please fill in Title and Description before submitting.");
      return;
    }

    if (!aiResult) {
      setSubmitError("Please analyze your complaint with AI first to ensure correct routing.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title,
      description,
      category: aiResult.category,
      severity: aiResult.severity,
      department: aiResult.department,
      location: {
        lat,
        lng,
        city: searchCity
      },
      image: imagePreview // Send base64 string
    };

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Server rejected your report. Please check required fields.");
      }

      // Show animated success popup
      setShowSuccessDialog(true);
      onSubmitSuccess(); // Update stats in App
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || "Something went wrong during report submission. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAiResult(null);
    setSearchCity("San Francisco");
    setLat(37.7749);
    setLng(-122.4194);
    setLocationStatus("");
    setImageFile(null);
    setImagePreview("");
    setShowSuccessDialog(false);
  };

  return (
    <div id="report-view" className="max-w-4xl mx-auto pt-24 pb-12 px-4 relative">
      {/* Page Title */}
      <div className="text-center mb-10 space-y-2">
        <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
          File an Incident Report
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto text-sm sm:text-base">
          Submit local issues securely. Our real-time AI classification system routes them immediately to the appropriate city officials.
        </p>
      </div>

      <div className="space-y-8">
        {/* Card 1: Issue Details */}
        <div id="card-details" className="bg-white rounded-[32px] p-6 sm:p-8 shadow-soft border border-slate-100/80 space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-slate-950">Card 1: Issue Details</h2>
              <p className="text-slate-400 text-xs">Explain the problem clearly with relevant facts.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="issue-title" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Issue Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="issue-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Deep dangerous pothole blocking left lane"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm placeholder-slate-400 transition-all bg-slate-50/50"
              />
            </div>

            <div>
              <label htmlFor="issue-desc" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="issue-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Please describe the issue in detail. Mention exactly what needs fixing, what hazard it poses to pedestrians or drivers, and how long it has been present..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm placeholder-slate-400 transition-all bg-slate-50/50 resize-y"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Card 2: AI Analysis */}
        <div id="card-ai" className="bg-white rounded-[32px] p-6 sm:p-8 shadow-soft border border-slate-100/80 space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <div className="bg-cyan-100 text-cyan-600 p-2 rounded-xl">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-slate-950">Card 2: AI Analysis</h2>
              <p className="text-slate-400 text-xs">Utilize Gemini AI to categorize and direct this report automatically.</p>
            </div>
          </div>

          {aiError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-700 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{aiError}</span>
            </div>
          )}

          <div className="space-y-4">
            {!aiResult && !isAnalyzing ? (
              <div className="text-center py-6">
                <p className="text-slate-500 text-sm mb-4">Click below to analyze your title and description above using Gemini AI.</p>
                <button
                  type="button"
                  id="btn-analyze-ai"
                  onClick={handleAiAnalysis}
                  className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md transition-all inline-flex items-center space-x-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Analyze with AI</span>
                </button>
              </div>
            ) : isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="text-sm font-semibold text-slate-700">Gemini AI is analyzing report content...</span>
                <span className="text-xs text-slate-400">Classifying severity, category and routing department...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* AI Result Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Category */}
                  <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 font-bold block mb-1">
                      Predicted Category
                    </span>
                    <span className="text-base font-bold text-slate-900 block">{aiResult.category}</span>
                  </div>

                  {/* Severity */}
                  <div className={`p-5 rounded-2xl border ${
                    aiResult.severity === "Critical" || aiResult.severity === "High"
                      ? "bg-red-50/50 border-red-100 text-red-700"
                      : "bg-amber-50/50 border-amber-100 text-amber-700"
                  }`}>
                    <span className={`text-[10px] font-mono uppercase tracking-wider font-bold block mb-1 ${
                      aiResult.severity === "Critical" || aiResult.severity === "High" ? "text-red-500" : "text-amber-500"
                    }`}>
                      Assessed Severity
                    </span>
                    <span className="text-base font-bold block text-slate-900">{aiResult.severity}</span>
                  </div>

                  {/* Department */}
                  <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 font-bold block mb-1">
                      Assigned Department
                    </span>
                    <span className="text-base font-bold text-slate-900 block">{aiResult.department}</span>
                  </div>
                </div>

                {/* Explanation Card */}
                <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                  <div className="flex items-start space-x-2.5">
                    <Sparkles className="w-4 h-4 text-cyan-500 shrink-0 mt-1" />
                    <div>
                      <span className="text-xs font-bold text-slate-700 block mb-1">AI Reasoning</span>
                      <p className="text-slate-600 text-sm italic">"{aiResult.explanation}"</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAiAnalysis}
                    className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Re-analyze content
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Location */}
        <div id="card-location" className="bg-white rounded-[32px] p-6 sm:p-8 shadow-soft border border-slate-100/80 space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <div className="bg-emerald-100 text-emerald-600 p-2 rounded-xl">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-slate-950">Card 3: Location</h2>
              <p className="text-slate-400 text-xs">Set the precise geographic center of this report.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Controls */}
            <div className="md:col-span-5 space-y-4">
              <div>
                <label htmlFor="search-city" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Search City or Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="search-city"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    placeholder="e.g. San Francisco"
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-slate-50/50"
                  />
                  <button
                    type="button"
                    onClick={handleCitySearch}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title="Search location"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  id="btn-search-location"
                  onClick={handleCitySearch}
                  disabled={isSearchingLocation}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Search Location
                </button>
                <button
                  type="button"
                  id="btn-current-location"
                  onClick={handleUseCurrentLocation}
                  className="py-2.5 px-4 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Use GPS</span>
                </button>
              </div>

              {locationStatus && (
                <div className="text-xs text-slate-500 font-mono italic">
                  {locationStatus}
                </div>
              )}

              {/* Coordinates display */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Latitude</span>
                  <span className="text-xs font-mono font-bold text-slate-700">{lat.toFixed(6)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Longitude</span>
                  <span className="text-xs font-mono font-bold text-slate-700">{lng.toFixed(6)}</span>
                </div>
              </div>
            </div>

            {/* Mini Map */}
            <div className="md:col-span-7 h-64 md:h-auto min-h-[250px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative">
              <div id="mini-map-container" ref={mapContainerRef} className="w-full h-full z-0"></div>
              {/* Overlay Marker Label */}
              <div className="absolute bottom-2.5 left-2.5 z-10 bg-slate-950/80 backdrop-blur-sm text-white text-[10px] font-mono px-2.5 py-1 rounded-md">
                INCIDENT GEOLOCATION
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Upload Evidence */}
        <div id="card-upload" className="bg-white rounded-[32px] p-6 sm:p-8 shadow-soft border border-slate-100/80 space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <div className="bg-amber-100 text-amber-600 p-2 rounded-xl">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-slate-950">Card 4: Upload Evidence</h2>
              <p className="text-slate-400 text-xs">Attach an optional visual image file to aid the inspectors.</p>
            </div>
          </div>

          <div className="space-y-4">
            {imagePreview ? (
              <div className="relative max-w-md mx-auto bg-slate-50 border border-slate-200 p-3 rounded-2xl flex flex-col items-center">
                <img
                  id="uploaded-preview"
                  src={imagePreview}
                  alt="Incident evidence preview"
                  className="max-h-60 rounded-xl object-contain shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview("");
                  }}
                  className="absolute top-5 right-5 p-2 rounded-full bg-red-600 text-white shadow hover:bg-red-700 cursor-pointer"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="text-xs text-slate-500 font-mono mt-3">
                  {imageFile?.name} ({(imageFile!.size / (1024 * 1024)).toFixed(2)} MB)
                </div>
              </div>
            ) : (
              <div
                id="dropzone"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  isDragActive
                    ? "border-blue-500 bg-blue-50/20"
                    : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                }`}
              >
                <input
                  type="file"
                  id="evidence-file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="evidence-file" className="cursor-pointer block">
                  <div className="bg-white p-4 rounded-full w-fit mx-auto shadow-sm border border-slate-100 mb-4">
                    <Upload className="w-6 h-6 text-slate-400" />
                  </div>
                  <span className="block text-sm font-semibold text-slate-700">Drag & drop your incident image here, or <span className="text-blue-600 underline">browse</span></span>
                  <span className="block text-slate-400 text-xs mt-1.5">Supports PNG, JPG, JPEG (Max size: 5 MB)</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Global Error message */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700 flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="text-center pt-4">
          <button
            type="button"
            id="btn-submit-report"
            onClick={handleSubmitReport}
            disabled={isSubmitting}
            className={`w-full sm:w-auto px-10 py-4 rounded-2xl text-white font-bold text-base shadow-lg shadow-blue-500/10 transition-all ${
              isSubmitting
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-0.5 cursor-pointer"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Submitting Incident...</span>
              </span>
            ) : (
              <span>Submit Civic Report</span>
            )}
          </button>
        </div>
      </div>

      {/* Animated Success Dialog */}
      {showSuccessDialog && (
        <div id="success-dialog" className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          {/* Backdrop shadow */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>

          {/* Dialog Container */}
          <div className="relative bg-white rounded-[32px] max-w-md w-full p-8 shadow-2xl border border-slate-100 text-center space-y-6 transform scale-100 transition-all">
            <div className="mx-auto bg-emerald-100 text-emerald-600 p-4 rounded-full w-fit animate-bounce">
              <Check className="w-8 h-8" strokeWidth={3} />
            </div>

            <div className="space-y-2">
              <h3 className="font-display font-black text-2xl text-slate-900">
                Report Submitted Successfully!
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Thank you for being a community hero. Your incident report has been securely registered in our system, analyzed by Gemini AI, and routed for municipal inspection.
              </p>
            </div>

            {/* Quick Summary of Route */}
            {aiResult && (
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-mono">Assigned Route:</span>
                  <span className="font-semibold text-slate-700">{aiResult.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-mono">Severity:</span>
                  <span className="font-bold text-red-600">{aiResult.severity}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  onNavigate("map");
                }}
                className="w-full py-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                View Map
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
              >
                Submit Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
