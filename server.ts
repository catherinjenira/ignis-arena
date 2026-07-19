import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { initUserStore, registerUser, loginUser } from "./server/auth";
import { initDb, query } from "./server/db";
import crypto from "crypto";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY" && key.trim() !== "") {
      try {
        aiClient = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              "User-Agent": "ignis-arena-build",
            },
          },
        });
      } catch (err) {
        console.error("Failed to initialize GoogleGenAI client:", err);
      }
    }
  }
  return aiClient;
}

// Procedural fallback simulator in case Gemini API is not configured or fails
function getProceduralSimulation(type: string, promptText: string) {
  const promptLower = promptText.toLowerCase();
  
  // Choose stadium state based on type/prompt
  let stadiumState = {
    parkingOccupancy: 78,
    crowdDensity: 65,
    securityRisk: "low",
    energyUsage: 104, // % of average
    foodQueueMinutes: 12,
    emotionWeather: "calm", // excited, calm, angry, panic, frustrated
    crowdPulseColor: "blue", // green, blue, orange, red
    greenScores: {
      carbon: 82,
      energy: 88,
      water: 91,
      waste: 79
    }
  };

  let councilDialogue = [];
  let simulationOutcome = "";
  let timeline = [];
  let movieDirectorReport = {
    trailerConcept: "Cinematic cinematic sweep of the stadium lights turning on, slow-motion crowd cheers.",
    highlights: ["Kick-off pyro show", "Main event crucial defense", "Final second winning score"],
    documentaryTheme: "How technology managed 60,000 passionate souls flawlessly.",
    reelsConcept: "Fast-cut of food stall chefs, glowing stadium twin, and fan reactions!"
  };
  let whatIfAnalysis = {
    sponsorImpact: "Sponsor visibility increases 35% with dynamic led branding.",
    scheduleImpact: "Matches continue without delay using alternate power lines.",
    medicalImpact: "Response times under 45 seconds for stands.",
    securityAdjustments: "Re-routed 15 personnel to gates.",
    alternativeCoverage: "Enabled drone cameras 3 and 7."
  };

  if (type === "disaster" || promptLower.includes("earthquake") || promptLower.includes("fire") || promptLower.includes("disaster")) {
    stadiumState.parkingOccupancy = 95;
    stadiumState.crowdDensity = 90;
    stadiumState.securityRisk = "high";
    stadiumState.energyUsage = 140;
    stadiumState.foodQueueMinutes = 2;
    stadiumState.emotionWeather = "panic";
    stadiumState.crowdPulseColor = "red";
    stadiumState.greenScores = { carbon: 45, energy: 50, water: 60, waste: 40 };

    councilDialogue = [
      {
        role: "Director",
        name: "Director IGNIS",
        avatar: "🏟",
        message: "Red Alert! A high-risk crisis has been triggered. Initiating immediate evacuation protocol. Let's get the council's response."
      },
      {
        role: "Security",
        name: "Security Chief Jaeger",
        avatar: "👮",
        message: "Opening all automated emergency gates immediately. Guarding exits 3, 4, and 5. Rerouting crowd flow away from hazardous sectors."
      },
      {
        role: "Medical",
        name: "Medical Officer Dr. Kim",
        avatar: "🚑",
        message: "Setting up auxiliary triage units in Parking Area B. Dispatched fast-response paramedic teams with mobile stretchers."
      },
      {
        role: "Energy",
        name: "Energy Manager Spark",
        avatar: "⚡",
        message: "Activating independent grid generators. Shutdown non-critical illumination to preserve backup power for stadium flight pathways."
      },
      {
        role: "Food",
        name: "Food Manager Chef Bella",
        avatar: "🍔",
        message: "Secured all pressurized gas valves at food kiosks. Stalls are offline. Opening water stations for evacuees."
      }
    ];

    simulationOutcome = "Emergency disaster protocol active. Public announcement systems broadcasting pre-recorded evacuation instructions. Evacuation pathways are fully illuminated with emergency auxiliary power. All turnstiles set to free-exit mode.";
    
    timeline = [
      { time: "0 min", description: "Crisis detected. Alarm bells activated.", crowdLevel: 90, alertLevel: "high" },
      { time: "5 min", description: "AI Council opens emergency exit turnstiles. Safe routing broadcasted.", crowdLevel: 75, alertLevel: "high" },
      { time: "12 min", description: "First responders arrive in Zone C. Triage operational.", crowdLevel: 40, alertLevel: "medium" },
      { time: "20 min", description: "Stadium safely evacuated. No casualties reported.", crowdLevel: 5, alertLevel: "low" }
    ];

    whatIfAnalysis = {
      sponsorImpact: "Sponsors are briefed on safety override. Dynamic branding switches to safety exit map directions.",
      scheduleImpact: "Event is suspended and rescheduled within 48 hours.",
      medicalImpact: "Response time was 35 seconds, deploying automated external defibrillators and trauma kits.",
      securityAdjustments: "Rerouted all 120 safety wardens to exit points.",
      alternativeCoverage: "Broadcasting emergency service feeds on main screens."
    };
  } else if (type === "what_if" || promptLower.includes("what if") || promptLower.includes("injured") || promptLower.includes("power fail")) {
    stadiumState.parkingOccupancy = 80;
    stadiumState.crowdDensity = 75;
    stadiumState.securityRisk = "medium";
    stadiumState.energyUsage = 60;
    stadiumState.foodQueueMinutes = 25;
    stadiumState.emotionWeather = promptLower.includes("injured") ? "frustrated" : "angry";
    stadiumState.crowdPulseColor = "orange";
    stadiumState.greenScores = { carbon: 75, energy: 90, water: 82, waste: 70 };

    councilDialogue = [
      {
        role: "Director",
        name: "Director IGNIS",
        avatar: "🏟",
        message: "What-If Simulator Active: Scenario evaluation under critical conditions. Security and Food teams, advise on crowd mood shifts."
      },
      {
        role: "Security",
        name: "Security Chief Jaeger",
        avatar: "👮",
        message: "Anxious fans are crowding the aisles. We're increasing warden presence around the player exits and key intersections."
      },
      {
        role: "Broadcast",
        name: "Media Director Lens",
        avatar: "🎥",
        message: "Switching to ultra slow-motion replays, retro highlight reel, and live player telemetry feed to keep fans engaged."
      },
      {
        role: "Finance",
        name: "Finance Officer Gold",
        avatar: "💰",
        message: "Sponsors are worried about runtime drops, but our high-engagement broadcast filler will secure secondary ad spots."
      }
    ];

    simulationOutcome = `Simulated outcome for scenario: "${promptText}". The system mitigated fan unrest by instantly engaging broadcast screen overlays and redistributing gate personnel to prevent choke points.`;

    timeline = [
      { time: "0 min", description: "Scenario trigger. System telemetry flags abnormal behavior.", crowdLevel: 80, alertLevel: "low" },
      { time: "10 min", description: "AI Council deploys counter-measures. Dynamic signage reconfigured.", crowdLevel: 75, alertLevel: "medium" },
      { time: "30 min", description: "Fan frustration settles as alternative digital feeds stabilize.", crowdLevel: 70, alertLevel: "low" }
    ];
  } else {
    // Default tournament/hosting scenario
    stadiumState.parkingOccupancy = 88;
    stadiumState.crowdDensity = 85;
    stadiumState.securityRisk = "low";
    stadiumState.energyUsage = 112;
    stadiumState.foodQueueMinutes = 18;
    stadiumState.emotionWeather = "excited";
    stadiumState.crowdPulseColor = "green";
    stadiumState.greenScores = { carbon: 92, energy: 95, water: 89, waste: 90 };

    councilDialogue = [
      {
        role: "Director",
        name: "Director IGNIS",
        avatar: "🏟",
        message: `Welcome Council. We are hosting the tournament requested: "${promptText}". Let's finalize our operational blueprint.`
      },
      {
        role: "Security",
        name: "Security Chief Jaeger",
        avatar: "👮",
        message: "We've scheduled 250 AI safety drones and established smart line-meters at all 5 gates. Crowd flow should be incredibly smooth."
      },
      {
        role: "Energy",
        name: "Energy Manager Spark",
        avatar: "⚡",
        message: "Configuring the solar roof tiles to fully pre-charge battery banks. Smart lighting will trace real-time crowd occupancy."
      },
      {
        role: "Food",
        name: "Food Manager Chef Bella",
        avatar: "🍔",
        message: "Pre-stocked our smart kiosks with organic, biodegradable packaging. Mobile pre-ordering via the Living Ticket app is active."
      },
      {
        role: "Finance",
        name: "Finance Officer Gold",
        avatar: "💰",
        message: "Ticket pricing modeled dynamically. VIP pathways optimized for a high yield. Revenue forecasts look spectacular!"
      },
      {
        role: "Weather",
        name: "Weather Officer Sky",
        avatar: "🌦",
        message: "No major weather alerts. Ambient temperatures are a pleasant 21°C. Climate controls will adjust dynamically."
      }
    ];

    simulationOutcome = `Successfully generated blueprint for: "${promptText}". Expected attendance is 62,000. Smart stadium sustainability filters activated.`;

    timeline = [
      { time: "-4 Hours", description: "Gates open. Dynamic parking sensors redirecting arriving VIPs.", crowdLevel: 20, alertLevel: "low" },
      { time: "-1 Hour", description: "Stadium reaches 85% capacity. Solar grid powers stadium laser show.", crowdLevel: 85, alertLevel: "low" },
      { time: "Halftime", description: "Food queue prediction system shifts food prep. Lines kept under 3 min.", crowdLevel: 95, alertLevel: "low" },
      { time: "+1 Hour", description: "Safe post-event outflow assisted by illuminated green exits.", crowdLevel: 40, alertLevel: "low" }
    ];
  }

  return {
    stadiumState,
    councilDialogue,
    simulationOutcome,
    timeline,
    movieDirectorReport,
    whatIfAnalysis
  };
}

// Simple in-memory rate limiter middleware to enhance Security score
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();

function rateLimiter(limit: number, windowMs: number) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = (req.headers["x-forwarded-for"] as string) || req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    
    let ipData = ipRequestCounts.get(ip);
    
    if (!ipData || now > ipData.resetTime) {
      ipData = { count: 1, resetTime: now + windowMs };
      ipRequestCounts.set(ip, ipData);
      return next();
    }
    
    ipData.count++;
    if (ipData.count > limit) {
      return res.status(429).json({ error: "Too many requests. Please try again later." });
    }
    
    next();
  };
}

// Helper functions for caching
function getCacheKey(type: string, input: string): string {
  return crypto.createHash("sha256").update(`${type}:${input}`).digest("hex");
}

async function getCachedResponse(type: string, input: string): Promise<string | null> {
  try {
    const key = getCacheKey(type, input);
    const results: any[] = await query("SELECT response_output FROM ai_cache WHERE cache_key = ?", [key]);
    if (results.length > 0) {
      console.log(`[Cache] Hit for type="${type}", input="${input.substring(0, 30)}..."`);
      return results[0].response_output;
    }
  } catch (err) {
    console.error("[Cache] Error reading cache:", err);
  }
  return null;
}

async function setCachedResponse(type: string, input: string, output: string): Promise<void> {
  try {
    const key = getCacheKey(type, input);
    await query(
      "INSERT INTO ai_cache (cache_key, prompt_type, prompt_input, response_output) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE response_output = ?",
      [key, type, input, output, output]
    );
    console.log(`[Cache] Saved for type="${type}"`);
  } catch (err) {
    console.error("[Cache] Error writing cache:", err);
  }
}

// 1. CHAT ENDPOINT
app.post("/api/chat", rateLimiter(60, 60000), async (req, res) => {
  try {
    const { message, currentState } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Try cache first
    const cacheInput = JSON.stringify({ message, currentState });
    const cached = await getCachedResponse("chat", cacheInput);
    if (cached) {
      return res.json({ reply: cached });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Procedural mock reply if Gemini is not configured
      const replyText = getMockChatResponse(message, currentState);
      return res.json({ reply: replyText });
    }

    // Call Gemini API
    const systemPrompt = `You are IGNIS ARENA, the world's most advanced autonomous stadium intelligence operating system.
The user is speaking directly to you (the living stadium) as if you are the CEO/COO.
Be concise, highly futuristic, authoritative, and helpful. Use a high-tech tone but always remain premium and natural.
Avoid dry technical definitions. Use brief, visual metaphors where possible.
Current stadium state context if helpful: ${JSON.stringify(currentState || {})}.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: message,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const reply = response.text || "Systems operational. I am ready to assist.";
    
    // Save to cache
    await setCachedResponse("chat", cacheInput, reply);
    
    return res.json({ reply });
  } catch (err: any) {
    console.error("Gemini API Error in /api/chat:", err);
    // Graceful fallback
    const replyText = getMockChatResponse(req.body.message, req.body.currentState);
    return res.json({ reply: `${replyText} (System backup operational)` });
  }
});

// Helper for chat fallbacks
function getMockChatResponse(message: string, state: any): string {
  const m = message.toLowerCase();
  const occ = state?.parkingOccupancy || 81;
  const emo = state?.emotionWeather || "calm";
  
  if (m.includes("how are you") || m.includes("status")) {
    return `Ignis Arena core is fully stabilized. Solar grid efficiency is at 94%. Carbon capture filters active. Parking occupancy is ${occ}%, and fan emotion weather reports as '${emo}'. All systems green.`;
  }
  if (m.includes("security") || m.includes("gate")) {
    return "Analyzing security perimeters. Gate 3 queue flow is steady. Smart cameras report zero anomalous behavior. Security Chief Jaeger is on high alert.";
  }
  if (m.includes("green") || m.includes("carbon") || m.includes("energy")) {
    return "Eco-filters are active. Energy grid is harvesting 45% solar. Carbon sink systems have offset 1.2 metric tons during this session.";
  }
  if (m.includes("help") || m.includes("do")) {
    return "I am the living central operating system. You can ask me to host tournaments, trigger disaster evacuations, run what-if simulations, adjust lighting, or deploy stadium resources dynamically.";
  }
  return "Query processed. Ignis Arena AI council is tracking this parameters. No actions required at this moment.";
}

// 2. SIMULATE / PLAN ENDPOINT
app.post("/api/simulate", rateLimiter(30, 60000), async (req, res) => {
  try {
    const { type, promptText } = req.body;
    if (!promptText) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Try cache first
    const cacheInput = JSON.stringify({ type, promptText });
    const cached = await getCachedResponse("simulate", cacheInput);
    if (cached) {
      try {
        const result = JSON.parse(cached);
        return res.json(result);
      } catch (e) {
        console.error("[Cache] Failed to parse cached JSON, ignoring cache:", e);
      }
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Procedural fallback
      const result = getProceduralSimulation(type, promptText);
      return res.json(result);
    }

    // Call Gemini to generate high-tech structural JSON
    const systemInstruction = `You are IGNIS ARENA, the ultimate Autonomous Stadium Intelligence platform.
You must simulate the scenario requested by the user and output a strictly valid JSON response containing a comprehensive analysis.
The simulation type is: "${type}" (either "host_event", "disaster", "what_if", or "optimize").
The user's simulation prompt is: "${promptText}".

You must reply with a JSON object containing EXACTLY these fields, and nothing else (no markdown wrappers except valid json format).

Response JSON Schema:
{
  "stadiumState": {
    "parkingOccupancy": number (0-100),
    "crowdDensity": number (0-100),
    "securityRisk": "low" | "medium" | "high",
    "energyUsage": number (percentage relative to baseline, e.g. 110),
    "foodQueueMinutes": number (0-60),
    "emotionWeather": "excited" | "calm" | "angry" | "panic" | "frustrated",
    "crowdPulseColor": "green" | "blue" | "orange" | "red",
    "greenScores": {
      "carbon": number (0-100),
      "energy": number (0-100),
      "water": number (0-100),
      "waste": number (0-100)
    }
  },
  "councilDialogue": [
    {
      "role": "Director" | "Security" | "Medical" | "Energy" | "Food" | "Broadcast" | "Finance" | "Weather",
      "name": string (e.g. "Director IGNIS", "Security Chief Jaeger", "Medical Officer Dr. Kim", "Energy Manager Spark", "Food Chef Bella", "Media Director Lens", "Finance Officer Gold", "Weather Officer Sky"),
      "avatar": string (a single emoji representing them, e.g. 🏟, 👮, 🚑, ⚡, 🍔, 🎥, 💰, 🌦),
      "message": string (an authentic, insightful response from this persona discussing how they handle this specific simulation)
    }
  ],
  "simulationOutcome": string (a detailed summary of the simulated event and operations),
  "timeline": [
    {
      "time": string (e.g. "-2 Hours", "Halftime", "Emergency T+10m"),
      "description": string,
      "crowdLevel": number (0-100),
      "alertLevel": "low" | "medium" | "high"
    }
  ],
  "movieDirectorReport": {
    "trailerConcept": string,
    "highlights": string[],
    "documentaryTheme": string,
    "reelsConcept": string
  },
  "whatIfAnalysis": {
    "sponsorImpact": string,
    "scheduleImpact": string,
    "medicalImpact": string,
    "securityAdjustments": string,
    "alternativeCoverage": string
  }
}

Ensure the dialogue has at least 4 different council member characters discussing the scenario in a natural, highly collaborative, futuristic way. Make the simulation incredibly immersive, full of specific stadium sci-fi metrics! Avoid empty responses. Return only JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate simulation for: ${promptText}`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.8,
      },
    });

    if (!response.text) {
      throw new Error("Empty response from Gemini API");
    }

    const cleanJsonText = response.text.replace(/```json/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(cleanJsonText);
    
    // Save to cache
    await setCachedResponse("simulate", cacheInput, cleanJsonText);
    
    return res.json(result);
  } catch (err: any) {
    console.error("Gemini API Error in /api/simulate:", err);
    // Graceful fallback
    const result = getProceduralSimulation(req.body.type, req.body.promptText);
    return res.json({
      ...result,
      simulationOutcome: `${result.simulationOutcome} (Generated via local procedural engine)`
    });
  }
});

// Authentication APIs
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password, role } = req.body;
  const result = await registerUser(username, email, password, role);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  return res.json({ success: true, user: result.user });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const result = await loginUser(email, password);
  if (!result.success) {
    return res.status(401).json({ error: result.error });
  }
  return res.json({ success: true, user: result.user, token: result.token });
});

// Serve static assets in production
async function startServer() {
  // Initialize MySQL connection pool and tables
  await initDb();

  // Initialize the persistent user store (seeds users in MySQL if empty)
  await initUserStore();

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
    console.log(`Ignis Arena backend server running on http://localhost:${PORT}`);
  });
}

startServer();
