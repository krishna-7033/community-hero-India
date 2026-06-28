import { Shield } from "lucide-react";

interface FooterProps {
  onNavigate: (view: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer id="app-footer" className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800 rounded-t-[40px] mt-16 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-slate-800 pb-12">
          {/* Column 1 - Brand info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-white p-1 rounded-lg border border-slate-800 flex items-center justify-center overflow-hidden w-9 h-9">
                <img
                  src="/src/assets/images/community_logo_1782575199269.jpg"
                  alt="Community Hero"
                  className="w-full h-full object-cover rounded-md"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-display font-extrabold text-xl tracking-tight text-white">
                Community <span className="text-blue-400">Hero</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              AI Powered Civic Reporting Platform. Empowers citizens and optimizes municipal responses through intelligent machine analysis.
            </p>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 tracking-wider uppercase mb-4">Quick Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate("home")} className="hover:text-white transition-colors cursor-pointer text-left">Home Landing Page</button>
              </li>
              <li>
                <button onClick={() => onNavigate("report")} className="hover:text-white transition-colors cursor-pointer text-left">File Incident Report</button>
              </li>
              <li>
                <button onClick={() => onNavigate("map")} className="hover:text-white transition-colors cursor-pointer text-left">Interactive OSM Map</button>
              </li>
              <li>
                <button onClick={() => onNavigate("assistant")} className="hover:text-white transition-colors cursor-pointer text-left">24/7 AI Chatbot Assistant</button>
              </li>
            </ul>
          </div>

          {/* Column 3 - Technical Stack info */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 tracking-wider uppercase mb-4">Under the Hood</h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              This software engineering project showcases full-stack web integration:
            </p>
            <div className="flex flex-wrap gap-2">
              {["React", "Express", "NodeJS", "Leaflet Maps", "Gemini AI", "MongoDB"].map((tech) => (
                <span key={tech} className="bg-slate-800 text-slate-300 text-[10px] font-mono px-2.5 py-1 rounded-md border border-slate-700/50">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Copy section */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 space-y-4 sm:space-y-0">
          <span>&copy; {new Date().getFullYear()} Community Hero. Open-source municipal software initiative.</span>
          <span className="flex items-center space-x-1.5 text-slate-400">
            {/* <span className="bg-blue-900/40 text-blue-400 px-2.5 py-1 rounded-full font-mono text-[9px] border border-blue-800/30">
              PROTOTYPE v1.0.0
            </span> */}
          </span>
        </div>
      </div>
    </footer>
  );
}
