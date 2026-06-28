export interface Location {
  lat: number;
  lng: number;
  city: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  category: "Road Hazards" | "Public Utilities" | "Sanitation" | "Public Safety" | "Environmental" | "Other";
  severity: "Low" | "Medium" | "High" | "Critical";
  department: string;
  status: "Pending" | "In Progress" | "Resolved";
  location: Location;
  image: string; // Base64 representation or empty
  createdAt: string;
}

export interface ChatMessage {
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

export interface AIAnalysisResult {
  category: "Road Hazards" | "Public Utilities" | "Sanitation" | "Public Safety" | "Environmental" | "Other";
  severity: "Low" | "Medium" | "High" | "Critical";
  department: string;
  explanation: string;
}
