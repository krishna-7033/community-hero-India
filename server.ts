import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { MongoClient, Collection, ObjectId } from "mongodb";

dotenv.config();

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "reports_db.json");

// MongoDB Client & State Management
let mongoClient: MongoClient | null = null;
let reportsCollection: Collection | null = null;
let isMongoConnected = false;


// Middleware to parse body with higher limit for image base64 strings
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Initialize Gemini Client Lazily/Gracefully
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. AI features will fallback to rule-based or mock responses.");
    }
    ai = new GoogleGenAI({
      apiKey: key || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return ai;
}

// Initial Mock Reports for richer interface upon initial load (centered in San Francisco)
const initialReports = [
  {
    id: "rep-101",
    title: "Major Pothole on Market Street",
    description: "There is an extremely deep pothole in the middle lane of Market St near 4th St. Multiple cars have swerved to avoid it, causing near-accidents. It is a major hazard, especially for motorcyclists and cyclists.",
    category: "Road Hazards",
    severity: "High",
    department: "Department of Transportation",
    status: "Pending",
    location: {
      lat: 37.7845,
      lng: -122.4082,
      city: "San Francisco"
    },
    image: "", // empty or base64
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString() // 2 days ago
  },
  {
    id: "rep-102",
    title: "Burst Water Main Leak",
    description: "Water is bubbling up rapidly from the sidewalk and flooding the street corner at Post St & Powell St. The water level is starting to reach the store doorsteps. Needs immediate public works intervention.",
    category: "Public Utilities",
    severity: "Critical",
    department: "Department of Public Works",
    status: "In Progress",
    location: {
      lat: 37.7882,
      lng: -122.4086,
      city: "San Francisco"
    },
    image: "",
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString() // 12 hours ago
  },
  {
    id: "rep-103",
    title: "Overflowing Commercial Trash Bins",
    description: "Several restaurant trash bins behind the alley are completely overflowing with garbage bags, spreading onto the pedestrian walkway. It is attracting rodents and creating a very bad smell.",
    category: "Sanitation",
    severity: "Medium",
    department: "Department of Sanitation",
    status: "Resolved",
    location: {
      lat: 37.7954,
      lng: -122.4028,
      city: "San Francisco"
    },
    image: "",
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString() // 3 days ago
  },
  {
    id: "rep-104",
    title: "Flickering/Damaged Streetlights",
    description: "Three consecutive streetlights are completely out on Valencia St between 16th and 17th. This makes the street pitch black at night, which raises safety concerns for pedestrians walking home.",
    category: "Public Safety",
    severity: "Medium",
    department: "Department of Transportation",
    status: "In Progress",
    location: {
      lat: 37.7648,
      lng: -122.4219,
      city: "San Francisco"
    },
    image: "",
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString() // 24 hours ago
  }
];

// Helper to read database
function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialReports, null, 2));
      return initialReports;
    }
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database:", error);
    return initialReports;
  }
}

// Helper to write database
function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing database:", error);
  }
}

// Initialize MongoDB Connection lazily and handle missing URI or connection errors gracefully
async function getMongoDBCollection(): Promise<Collection | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return null;
  }
  if (reportsCollection) {
    return reportsCollection;
  }
  try {
    if (!mongoClient) {
      mongoClient = new MongoClient(uri);
      await mongoClient.connect();
      console.log("[MongoDB] Connected successfully to cloud database.");
      isMongoConnected = true;
    }
    const db = mongoClient.db("communityhero");
    reportsCollection = db.collection("issues");

    // Seed collection with initial mock reports if it is completely empty
    const count = await reportsCollection.countDocuments();
    if (count === 0) {
      console.log("[MongoDB] Reports collection is empty, seeding initial mock reports...");
      await reportsCollection.insertMany(initialReports);
    }
    return reportsCollection;
  } catch (err) {
    console.error("[MongoDB] Failed to connect to MongoDB, falling back to local file system:", err);
    isMongoConnected = false;
    return null;
  }
}

// Robust helper to extract any image URL or base64 data from a string, nested object, or Buffer
function extractImage(obj: any): string {
  if (!obj) return "";
  if (typeof obj === "string") {
    const trimmed = obj.trim();
    if (trimmed.startsWith("data:image/") || trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    // Check if it's a raw base64 string
    if (trimmed.length > 100 && /^[A-Za-z0-9+/=]+$/.test(trimmed.replace(/[\s\r\n]+/g, ""))) {
      return "data:image/jpeg;base64," + trimmed.replace(/[\s\r\n]+/g, "");
    }
    return trimmed;
  }
  
  if (typeof obj === "object") {
    // Node.js Buffer JSON representation { type: "Buffer", data: [...] }
    if (obj.type === "Buffer" && Array.isArray(obj.data)) {
      try {
        const buf = Buffer.from(obj.data);
        return "data:image/jpeg;base64," + buf.toString("base64");
      } catch (e) {
        console.error("[extractImage] Error parsing serialized Buffer:", e);
      }
    }
    if (Buffer.isBuffer(obj)) {
      try {
        return "data:image/jpeg;base64," + obj.toString("base64");
      } catch (e) {
        console.error("[extractImage] Error parsing Buffer:", e);
      }
    }

    // Common keys used to store image URLs or content
    const commonKeys = ["url", "secure_url", "secureUrl", "data", "base64", "image", "img", "src", "path", "href"];
    for (const key of commonKeys) {
      if (obj[key]) {
        const extracted = extractImage(obj[key]);
        if (extracted) return extracted;
      }
    }

    // Deep search in all nested keys of the object
    for (const key of Object.keys(obj)) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const val = obj[key];
        if (val && typeof val !== "function") {
          const extracted = extractImage(val);
          if (extracted) return extracted;
        }
      }
    }
  }

  return "";
}

// Get all reports from either MongoDB or fallback local storage
async function getAllReports(): Promise<any[]> {
  try {
    const col = await getMongoDBCollection();
    if (col) {
      const mongoReports = await col.find({}).sort({ createdAt: -1 }).toArray();
      return mongoReports.map((r: any) => {
        const { _id, ...rest } = r;

        // 1. Coordinate normalization (supports top-level latitude/longitude or nested location.lat/lng)
        let latitude = 37.7749;
        let longitude = -122.4194;
        if (typeof r.latitude === "number") {
          latitude = r.latitude;
        } else if (r.location && typeof r.location === "object" && typeof r.location.lat === "number") {
          latitude = r.location.lat;
        }

        if (typeof r.longitude === "number") {
          longitude = r.longitude;
        } else if (r.location && typeof r.location === "object" && typeof r.location.lng === "number") {
          longitude = r.location.lng;
        }

        // 2. City name and full address translation
        let city = "Guwahati";
        let fullAddress = "Guwahati, Kamrup Metropolitan, Assam, India";
        if (typeof r.location === "string") {
          fullAddress = r.location;
          // Extract first segment as city, e.g. "Guwahati"
          const parts = r.location.split(",");
          city = parts[0]?.trim() || r.location;
        } else if (r.location && typeof r.location === "object") {
          city = r.location.city || "San Francisco";
          fullAddress = r.location.city || "San Francisco";
        }

        const normLocation = {
          lat: latitude,
          lng: longitude,
          city: city,
          address: fullAddress
        };

        // 3. Category normalizer (maps lowercase like "sanitation" to standard capitalization "Sanitation")
        let category = r.category || "Other";
        if (typeof category === "string") {
          const lower = category.toLowerCase();
          if (lower.includes("road") || lower.includes("hazard")) category = "Road Hazards";
          else if (lower.includes("utilit")) category = "Public Utilities";
          else if (lower.includes("sanitat") || lower.includes("drain")) category = "Sanitation";
          else if (lower.includes("safe")) category = "Public Safety";
          else if (lower.includes("environ")) category = "Environmental";
          else {
            category = category.charAt(0).toUpperCase() + category.slice(1);
          }
        }

        // 4. Severity normalizer (maps lowercase like "critical" to "Critical")
        let severity = r.severity || "Medium";
        if (typeof severity === "string") {
          const lower = severity.toLowerCase();
          if (lower === "low") severity = "Low";
          else if (lower === "medium") severity = "Medium";
          else if (lower === "high") severity = "High";
          else if (lower === "critical") severity = "Critical";
          else {
            severity = severity.charAt(0).toUpperCase() + severity.slice(1);
          }
        }

        // 5. Status normalizer
        let status = r.status || "Pending";
        if (typeof status === "string") {
          const lower = status.toLowerCase();
          if (lower === "pending") status = "Pending";
          else if (lower === "in progress" || lower === "in_progress") status = "In Progress";
          else if (lower === "resolved") status = "Resolved";
          else {
            status = status.charAt(0).toUpperCase() + status.slice(1);
          }
        }

        // 6. Image normalizer
        const img = extractImage(r.image);

        return {
          id: r.id || _id.toString(),
          title: r.title || "Untitled Issue",
          description: r.description || "No description provided.",
          category,
          severity,
          department: r.department || "Guwahati Municipal Corporation",
          status,
          location: normLocation,
          latitude,
          longitude,
          image: img,
          createdAt: r.createdAt || new Date().toISOString()
        };
      });
    }
  } catch (err) {
    console.error("[MongoDB] Failed to query reports, falling back to local file database:", err);
  }
  return readDB();
}

// Admin Authorization middleware
function authorizeAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.headers.authorization;
  if (token === "Bearer admin-super-token-12345") {
    next();
  } else {
    res.status(401).json({ success: false, error: "Unauthorized access. Admin privileges required." });
  }
}

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// Admin Login
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin123") {
    return res.json({
      success: true,
      token: "admin-super-token-12345",
      username: "admin"
    });
  }
  return res.status(400).json({
    success: false,
    error: "Invalid admin username or password."
  });
});

// Get all reports
app.get("/api/reports", async (req, res) => {
  const reports = await getAllReports();
  res.json(reports);
});

// Submit a report
app.post("/api/reports", async (req, res) => {
  const { title, description, category, severity, department, location, image } = req.body;

  if (!title || !description) {
    return res.status(400).json({ success: false, error: "Title and description are required." });
  }

  // Determine latitude, longitude, and custom city / location string
  let latVal = 37.7749;
  let lngVal = -122.4194;
  let cityVal = "Guwahati";
  let locationStr = "Guwahati, Kamrup Metropolitan, Assam, India";

  if (location && typeof location === "object") {
    latVal = typeof location.lat === "number" ? location.lat : latVal;
    lngVal = typeof location.lng === "number" ? location.lng : lngVal;
    cityVal = location.city || cityVal;
    locationStr = location.city || "Guwahati";
  } else if (typeof location === "string") {
    locationStr = location;
    cityVal = location.split(",")[0]?.trim() || location;
  }

  const newReportId = "rep-" + Date.now();

  // Create document using your precise MongoDB format
  const mongoReport = {
    title,
    description,
    location: locationStr,
    category: (category || "Sanitation").toLowerCase(),
    severity: (severity || "Medium").toLowerCase(),
    department: department || "Guwahati Municipal Corporation",
    latitude: latVal,
    longitude: lngVal,
    image: image || "", // base64 or object
    status: "Pending",
    createdAt: new Date().toISOString()
  };

  // Local sync representation for fallback JSON compatibility
  const newReport = {
    id: newReportId,
    title,
    description,
    category: category || "Sanitation",
    severity: severity || "Medium",
    department: department || "Guwahati Municipal Corporation",
    status: "Pending",
    location: {
      lat: latVal,
      lng: lngVal,
      city: cityVal
    },
    image: image || "",
    createdAt: mongoReport.createdAt
  };

  let savedToMongo = false;
  try {
    const col = await getMongoDBCollection();
    if (col) {
      await col.insertOne({ id: newReportId, ...mongoReport });
      savedToMongo = true;
    }
  } catch (err) {
    console.error("[MongoDB] Failed to write report to MongoDB:", err);
  }

  // Always sync with local database as a seamless secondary preview fallback
  const reports = readDB();
  reports.unshift(newReport);
  writeDB(reports);

  res.json({ success: true, report: newReport, savedToMongo });
});

// Update report status (Admin protected)
app.patch("/api/reports/:id/status", authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["Pending", "In Progress", "Resolved"].includes(status)) {
    return res.status(400).json({ success: false, error: "Invalid status value." });
  }

  let updatedMongo = false;
  try {
    const col = await getMongoDBCollection();
    if (col) {
      // Find by custom 'id' or native ObjectId '_id'
      let query: any = { id };
      if (id && id.length === 24) {
        try {
          query = { $or: [{ id }, { _id: new ObjectId(id) }] };
        } catch (e) {
          console.error("[MongoDB] Error building ObjectId query:", e);
        }
      }
      const result = await col.updateOne(query, { $set: { status } });
      if (result.matchedCount > 0) {
        updatedMongo = true;
      }
    }
  } catch (err) {
    console.error("[MongoDB] Failed to update report status in MongoDB:", err);
  }

  const reports = readDB();
  const index = reports.findIndex((r: any) => r.id === id);

  if (index === -1 && !updatedMongo) {
    return res.status(404).json({ success: false, error: "Report not found." });
  }

  if (index !== -1) {
    reports[index].status = status;
    writeDB(reports);
    return res.json({ success: true, report: reports[index], updatedMongo });
  }

  res.json({ success: true, report: { id, status }, updatedMongo });
});

// Delete a report (Admin protected)
app.delete("/api/reports/:id", authorizeAdmin, async (req, res) => {
  const { id } = req.params;

  let deletedMongo = false;
  try {
    const col = await getMongoDBCollection();
    if (col) {
      // Find by custom 'id' or native ObjectId '_id'
      let query: any = { id };
      if (id && id.length === 24) {
        try {
          query = { $or: [{ id }, { _id: new ObjectId(id) }] };
        } catch (e) {
          console.error("[MongoDB] Error building ObjectId query:", e);
        }
      }
      const result = await col.deleteOne(query);
      if (result.deletedCount > 0) {
        deletedMongo = true;
      }
    }
  } catch (err) {
    console.error("[MongoDB] Failed to delete report from MongoDB:", err);
  }

  const reports = readDB();
  const filtered = reports.filter((r: any) => r.id !== id);

  if (reports.length === filtered.length && !deletedMongo) {
    return res.status(404).json({ success: false, error: "Report not found." });
  }

  writeDB(filtered);
  res.json({ success: true, message: "Report deleted successfully.", deletedMongo });
});

// AI analysis for reports
app.post("/api/analyze-issue", async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ success: false, error: "Title and description are required for AI analysis." });
  }

  const fallbackResult = {
    category: "Road Hazards",
    severity: "Medium",
    department: "Department of Transportation",
    explanation: "Fallback classification due to missing AI configuration."
  };

  if (!process.env.GEMINI_API_KEY) {
    // Basic rules to simulate the classification if Gemini is missing
    const content = (title + " " + description).toLowerCase();
    let category = "Other";
    let severity = "Medium";
    let department = "Department of Public Works";

    if (content.includes("pothole") || content.includes("street") || content.includes("road") || content.includes("traffic") || content.includes("light")) {
      category = "Road Hazards";
      department = "Department of Transportation";
      if (content.includes("accident") || content.includes("crash") || content.includes("danger")) {
        severity = "High";
      }
    } else if (content.includes("water") || content.includes("leak") || content.includes("pipe") || content.includes("flood")) {
      category = "Public Utilities";
      department = "Department of Public Works";
      severity = "High";
    } else if (content.includes("trash") || content.includes("garbage") || content.includes("dump") || content.includes("litter")) {
      category = "Sanitation";
      department = "Department of Sanitation";
    } else if (content.includes("fire") || content.includes("smoke") || content.includes("hazard") || content.includes("wire")) {
      category = "Public Safety";
      department = "Emergency Services";
      severity = "Critical";
    } else if (content.includes("tree") || content.includes("park") || content.includes("pollution") || content.includes("spill")) {
      category = "Environmental";
      department = "Environmental Protection Agency";
    }

    return res.json({
      category,
      severity,
      department,
      explanation: "Classified using rules-based offline backup logic."
    });
  }

  try {
    const client = getGeminiClient();
    const prompt = `Analyze the following civic issue report title and description.
Title: "${title}"
Description: "${description}"

Determine the most appropriate:
1. Category: Must be one of ["Road Hazards", "Public Utilities", "Sanitation", "Public Safety", "Environmental", "Other"]
2. Severity Level: Must be one of ["Low", "Medium", "High", "Critical"]
3. Responsible Department: Select or invent the municipal department that should resolve this (e.g., "Department of Transportation", "Department of Public Works", "Department of Sanitation", "Emergency Services", "Environmental Protection Agency").
4. A brief, 1-sentence explanation of why you classified it this way.

Return ONLY a structured JSON response matching this schema. Do not include markdown formatting or backticks outside the json structure.`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              description:
                "Must be one of ['Road Hazards', 'Public Utilities', 'Sanitation', 'Public Safety', 'Environmental', 'Other']",
            },
            severity: {
              type: Type.STRING,
              description:
                "Must be one of ['Low', 'Medium', 'High', 'Critical']",
            },
            department: {
              type: Type.STRING,
              description: "The department name responsible for this issue",
            },
            explanation: {
              type: Type.STRING,
              description: "Brief sentence explaining classification decision",
            },
          },
          required: ["category", "severity", "department", "explanation"],
        },
      },
    });

    const resultText = response.text || "";
    const parsed = JSON.parse(resultText.trim());
    res.json(parsed);

  } catch (error: any) {
    console.error("Gemini AI classification error, falling back to local parsing rules:", error);
    // Automatically apply our offline rule-based classification so the user is never blocked or shown a server error
    const content = (title + " " + description).toLowerCase();
    let category = "Other";
    let severity = "Medium";
    let department = "Department of Public Works";

    if (content.includes("pothole") || content.includes("street") || content.includes("road") || content.includes("traffic") || content.includes("light")) {
      category = "Road Hazards";
      department = "Department of Transportation";
      if (content.includes("accident") || content.includes("crash") || content.includes("danger")) {
        severity = "High";
      }
    } else if (content.includes("water") || content.includes("leak") || content.includes("pipe") || content.includes("flood")) {
      category = "Public Utilities";
      department = "Department of Public Works";
      severity = "High";
    } else if (content.includes("trash") || content.includes("garbage") || content.includes("dump") || content.includes("litter")) {
      category = "Sanitation";
      department = "Department of Sanitation";
    } else if (content.includes("fire") || content.includes("smoke") || content.includes("hazard") || content.includes("wire")) {
      category = "Public Safety";
      department = "Emergency Services";
      severity = "Critical";
    } else if (content.includes("tree") || content.includes("park") || content.includes("pollution") || content.includes("spill")) {
      category = "Environmental";
      department = "Environmental Protection Agency";
    }

    res.json({
      category,
      severity,
      department,
      explanation: "Classified using rules-based offline engine (AI service is currently experiencing high demand)."
    });
  }
});

// AI Assistant Chatbot
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, error: "Message is required." });
  }

  const reports = await getAllReports();
  const totalCount = reports.length;
  const pendingCount = reports.filter((r: any) => r.status === "Pending").length;
  const inProgressCount = reports.filter((r: any) => r.status === "In Progress").length;
  const resolvedCount = reports.filter((r: any) => r.status === "Resolved").length;

  // Let's feed some state context to the assistant
  const currentCityStatus = `Current Platform Stats: Total reported issues is ${totalCount} (${pendingCount} Pending, ${inProgressCount} In Progress, ${resolvedCount} Resolved). Latest issues reported include: ${reports.slice(0, 3).map((r: any) => `"${r.title}" (${r.category}, Severity: ${r.severity}, Status: ${r.status})`).join("; ")}.`;

  if (!process.env.GEMINI_API_KEY) {
    // Offline / Mock assistant response
    let reply = "Hello! I am your offline Community Hero Assistant. I don't have a Gemini API key configured, but I can help you with basic questions! To report an issue, go to the 'Report Issue' page. Severity is determined automatically based on public safety hazards, and local departments receive your complaints. Let me know if you have any questions!";
    const msgLower = message.toLowerCase();
    if (msgLower.includes("pothole")) {
      reply = "To report a pothole, click on 'Report Issue' in the menu. Enter a description and location, then click 'Analyze with AI' to automatically categorize it under 'Road Hazards'. Finally, upload an optional photo and hit Submit!";
    } else if (msgLower.includes("severity")) {
      reply = "Our AI system determines severity level based on critical safety factors. 'Critical' is assigned for immediate safety or environmental hazards like live wires, fires, or water main ruptures. 'High' for substantial road or utility blocks. 'Medium' or 'Low' for secondary issues.";
    } else if (msgLower.includes("who receives") || msgLower.includes("department")) {
      reply = "Our system assigns your complaints to the appropriate municipal department based on its category. For example, sanitation reports go to the 'Department of Sanitation', and road repairs go to the 'Department of Transportation'.";
    } else if (msgLower.includes("track") || msgLower.includes("status")) {
      reply = `You can track all submitted reports directly on the 'Community Map' or look at the admin panel. Currently, our city has ${totalCount} reports with ${pendingCount} pending, ${inProgressCount} in progress, and ${resolvedCount} resolved.`;
    }

    return res.json({ reply });
  }

  try {
    const client = getGeminiClient();
    
    // Construct the context instructions
    const systemInstruction = `You are "Community Hero Assistant", a friendly, professional AI chatbot integrated into the Community Hero civic platform.
Your purpose is to answer citizens' questions about civic services, community reporting, pothole repairs, street utilities, waste management, and how the platform works.
Keep your answers helpful, clean, informative, and engaging.
${currentCityStatus}
Explain clearly how severity is determined by AI (Critical, High, Medium, Low) and which municipal departments receive the complaints.
Be concise and avoid overly technical jargon. Always be polite and encouraging of citizen participation!`;

    // Map conversation history to ChatMessage structures if history exists
    // The chats.create endpoint from @google/genai supports systemInstruction in config
    const chat = client.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    // In @google/genai, chat.sendMessage expects an object: { message: string }
    const response = await chat.sendMessage({ message });
    res.json({ reply: response.text });

  } catch (error: any) {
    console.error("Gemini Assistant Error, falling back to offline assistant:", error);
    // Offline / Mock assistant response integrated beautifully as a fallback response
    let reply =
      "Hello! The AI assistant is temporarily busy due to high demand. You can still use all Community Hero features while I automatically retry your request. However, I can still assist you offline: ";
    const msgLower = message.toLowerCase();
    if (msgLower.includes("pothole")) {
      reply += "To report a pothole, click on 'Report Issue' in the menu. Enter a description and location, then click 'Analyze with AI' to automatically categorize it under 'Road Hazards'. Finally, upload an optional photo and hit Submit!";
    } else if (msgLower.includes("severity")) {
      reply += "Our AI system determines severity level based on critical safety factors. 'Critical' is assigned for immediate safety or environmental hazards like live wires, fires, or water main ruptures. 'High' for substantial road or utility blocks. 'Medium' or 'Low' for secondary issues.";
    } else if (msgLower.includes("who receives") || msgLower.includes("department")) {
      reply += "Our system assigns your complaints to the appropriate municipal department based on its category. For example, sanitation reports go to the 'Department of Sanitation', and road repairs go to the 'Department of Transportation'.";
    } else if (msgLower.includes("track") || msgLower.includes("status")) {
      reply += `You can track all submitted reports directly on the 'Community Map' or look at the admin panel. Currently, our city has ${totalCount} reports with ${pendingCount} pending, ${inProgressCount} in progress, and ${resolvedCount} resolved.`;
    } else {
      reply += "You can submit any issue on our 'Report Issue' page. Let me know if you have questions about specific issues like potholes, street utilities, severity ratings, or tracking reports!";
    }
    res.json({ reply });
  }
});

// Serve Vite dev server or static distribution files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Community Hero Server] running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();
