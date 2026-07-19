import React, { useState, useEffect } from "react";
import {
  Flame,
  Bell,
  Cpu,
  Power,
  Sliders,
  HelpCircle,
  Radio,
  Tv,
  Zap,
  Globe,
  RefreshCw,
  Sun,
  Shield,
  Activity,
  Sparkles,
  Bot,
  Ticket,
  UserCheck,
  Leaf,
  Film,
  Compass,
  Timer,
  SendHorizontal,
  Cloud,
  ChevronRight,
  Database,
  ArrowRight,
  DollarSign
} from "lucide-react";
import { FullSimulationResult, StadiumState, HeatmapType, GodModeMarker, User } from "./types";
import StadiumDigitalTwin from "./components/StadiumDigitalTwin";
import AICouncilTheater from "./components/AICouncilTheater";
import StadiumBrainChat from "./components/StadiumBrainChat";
import AuthModal from "./components/AuthModal";
import { logoutUserFromFirebase } from "./lib/firebase";

// Default startup stadium state
const INITIAL_STADIUM_STATE: StadiumState = {
  parkingOccupancy: 81,
  crowdDensity: 60,
  securityRisk: "low",
  energyUsage: 106,
  foodQueueMinutes: 14,
  emotionWeather: "calm", // excited, calm, angry, panic, frustrated
  crowdPulseColor: "blue", // green, blue, orange, red
  greenScores: {
    carbon: 81,
    energy: 85,
    water: 90,
    waste: 78,
  }
};

const INITIAL_MARKERS: GodModeMarker[] = [
  { id: "sec-1", type: "security", name: "Security Team Echo", x: 440, y: 130, label: "👮 Patrol Echo" },
  { id: "sec-2", type: "security", name: "Security Team Omega", x: 420, y: 470, label: "👮 Patrol Omega" },
  { id: "med-1", type: "medical", name: "Paramedic Response Station", x: 130, y: 460, label: "🚑 Triage B" },
  { id: "food-1", type: "food", name: "Smart F&B Distribution Truck", x: 670, y: 140, label: "🍔 Mobile Hub" },
  { id: "stage-1", type: "stage", name: "Holographic Projection Stage", x: 440, y: 300, label: "🎆 Center Stage" },
];

const INITIAL_ALERTS = [
  { id: "alt-1", time: "08:31", title: "Gate 3 Congestion Spike", description: "Smart line-meters predict +5 min queue delay.", type: "warning" },
  { id: "alt-2", time: "08:24", title: "Cloud Coverage Incoming", description: "Vapor mapping predicts rain in 15 mins. Solar harvesting declining.", type: "info" },
  { id: "alt-3", time: "08:15", title: "Medical Alert in East Stand", description: "Paramedics responded to heat exhaustion in Sec 22. Status secure.", type: "success" },
  { id: "alt-4", time: "08:02", title: "Kiosk F2 Heavy Load", description: "Subway stall reporting beverage restock needed.", type: "warning" },
  { id: "alt-5", time: "07:45", title: "VIP Escalation Active", description: "Underground route cleared for Team Coach Arrival.", type: "info" }
];

const TEMPLATES = [
  {
    label: "🏆 Host FIFA Final",
    type: "host_event",
    prompt: "Host the World Cup Final tomorrow for 75,000 people with high eco-friendly logistics, crowd pulse glowing blue, and maximum solar power pre-charge.",
    description: "Simulate tournament with high attendance under maximum green parameters.",
  },
  {
    label: "🌦 Simulate Rainstorm",
    type: "disaster",
    prompt: "Heavy rainfall alert at halftime. Solar power offline. Crowd shifts to covered stands. Food queues peak.",
    description: "Analyze weather hazards and automatic roof climate countermeasures.",
  },
  {
    label: "🚨 Earthquake Evacuation",
    type: "disaster",
    prompt: "Emergency Earthquake evacuation. Gates open immediately, triage set in Parking B, announcements active.",
    description: "Evaluate public safety exit pathways and emergency personnel coordinates.",
  },
  {
    label: "⚽ Captain Injured",
    type: "what_if",
    prompt: "What happens if the team captain gets injured during the final?",
    description: "Observe sponsor adjustments, schedule delays, and fan mood shifts.",
  },
  {
    label: "🔌 Power Outage Halftime",
    type: "what_if",
    prompt: "What if critical power fails at halftime? Initiate emergency backup generators and safety guidance.",
    description: "Test critical backup power grid and emergency broadcast operations.",
  },
  {
    label: "🌱 Max Green Optimization",
    type: "optimize",
    prompt: "Optimize energy grid, water recycling, and trash waste collection to target maximum sustainability score.",
    description: "Initiate maximum eco-reclamation systems for zero carbon output.",
  }
];

export default function App() {
  const [stadiumState, setStadiumState] = useState<StadiumState>(INITIAL_STADIUM_STATE);
  const [heatmapType, setHeatmapType] = useState<HeatmapType>("crowd");
  const [markers, setMarkers] = useState<GodModeMarker[]>(INITIAL_MARKERS);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [simulationResult, setSimulationResult] = useState<FullSimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [systemUptime, setSystemUptime] = useState("02:44:12");
  const [isMuted, setIsMuted] = useState(true);
  
  // Halftime Laser & Pyro show states
  const [laserCount, setLaserCount] = useState(4);
  const [laserColor, setLaserColor] = useState("cyan");
  const [dryIceActive, setDryIceActive] = useState(true);
  const [pyroActive, setPyroActive] = useState(false);

  // Concessions Ordering simulator states
  const [concessionsOrder, setConcessionsOrder] = useState<{
    item: string;
    stall: string;
    status: "queuing" | "preparing" | "ready";
    progress: number;
  } | null>(null);
  const [staffingBoost, setStaffingBoost] = useState(false);

  // Kinetic energy wave states
  const [kineticCharge, setKineticCharge] = useState(30);
  const [jumpCount, setJumpCount] = useState(12);
  const [waveTriggerActive, setWaveTriggerActive] = useState(false);

  // Multi-Page tab state
  const [activeTab, setActiveTab] = useState<"twin" | "council" | "sandbox" | "green" | "tickets" | "chat">("twin");

  // Authentication state
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("ignis_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("ignis_token"));
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  const handleAuthSuccess = (authenticatedUser: User, sessionToken: string) => {
    setUser(authenticatedUser);
    setToken(sessionToken);
    localStorage.setItem("ignis_user", JSON.stringify(authenticatedUser));
    localStorage.setItem("ignis_token", sessionToken);
    setShowAuthModal(false);

    // Dynamic notification alert
    const welcomeAlert = {
      id: Math.random().toString(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      title: "Security Clearance Authorized",
      description: `Welcome, ${authenticatedUser.username}! Assigned role: [${authenticatedUser.role.toUpperCase()}]. Access verified.`,
      type: "success" as const
    };
    setAlerts((prev) => [welcomeAlert, ...prev.slice(0, 5)]);

    if (!isMuted && "speechSynthesis" in window) {
      const utter = new SpeechSynthesisUtterance(`Access granted. Welcome back, ${authenticatedUser.username}`);
      window.speechSynthesis.speak(utter);
    }
  };

  const handleLogout = () => {
    logoutUserFromFirebase().catch((err) => console.error("Firebase logout error:", err));
    setUser(null);
    setToken(null);
    localStorage.removeItem("ignis_user");
    localStorage.removeItem("ignis_token");

    const logoutAlert = {
      id: Math.random().toString(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      title: "Security Ledger Disconnected",
      description: "User successfully logged out. Credentials cleared from secure local state.",
      type: "info" as const
    };
    setAlerts((prev) => [logoutAlert, ...prev.slice(0, 5)]);

    if (!isMuted && "speechSynthesis" in window) {
      const utter = new SpeechSynthesisUtterance("System disconnected. Goodbye.");
      window.speechSynthesis.speak(utter);
    }
  };

  // What-If Custom Input Form state
  const [sandboxInput, setSandboxInput] = useState("");
  const [futureTimeOffset, setFutureTimeOffset] = useState(0);

  // Simple clock / uptime updater
  useEffect(() => {
    const timer = setInterval(() => {
      const parts = systemUptime.split(":").map(Number);
      let s = parts[2] + 1;
      let m = parts[1];
      let h = parts[0];
      if (s >= 60) {
        s = 0;
        m += 1;
      }
      if (m >= 60) {
        m = 0;
        h += 1;
      }
      const pad = (n: number) => String(n).padStart(2, "0");
      setSystemUptime(`${pad(h)}:${pad(m)}:${pad(s)}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [systemUptime]);

  // Concessions pre-order tracking simulator effect
  useEffect(() => {
    if (!concessionsOrder) return;
    if (concessionsOrder.status === "ready") return;

    const interval = setInterval(() => {
      setConcessionsOrder((prev) => {
        if (!prev) return null;
        const step = staffingBoost ? 25 : 12; // Double preparation speed with staff drone assistants
        const nextProg = prev.progress + step;
        
        if (nextProg >= 100) {
          if (prev.status === "queuing") {
            return { ...prev, status: "preparing", progress: 0 };
          } else if (prev.status === "preparing") {
            // Trigger pre-order ready alert
            const alertItem = {
              id: Math.random().toString(),
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              title: "Pre-order Ready!",
              description: `Smart pre-order parsed: ${prev.item} is ready at Kiosk ${prev.stall}. Scan biometric face code now.`,
              type: "success"
            };
            setAlerts((a) => [alertItem, ...a.slice(0, 5)]);

            if (!isMuted && "speechSynthesis" in window) {
              const utter = new SpeechSynthesisUtterance(`Your ${prev.item} is ready for pick up at ${prev.stall}`);
              window.speechSynthesis.speak(utter);
            }

            return { ...prev, status: "ready", progress: 100 };
          }
        }
        return { ...prev, progress: nextProg };
      });
    }, 600);

    return () => clearInterval(interval);
  }, [concessionsOrder, staffingBoost, isMuted]);

  // Execute a stadium simulation / plan generator
  const runSimulation = async (type: string, promptText: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, promptText }),
      });
      const data: FullSimulationResult = await response.json();

      setSimulationResult(data);
      setStadiumState(data.stadiumState);
      
      // Auto-toggle appropriate heatmap modes to visualize response instantly
      if (type === "disaster" || promptText.toLowerCase().includes("evacuation") || promptText.toLowerCase().includes("earthquake")) {
        setHeatmapType("emergency");
      } else if (type === "optimize" || promptText.toLowerCase().includes("solar") || promptText.toLowerCase().includes("green")) {
        setHeatmapType("energy");
      } else if (promptText.toLowerCase().includes("captain") || promptText.toLowerCase().includes("injured") || promptText.toLowerCase().includes("mood")) {
        setHeatmapType("emotion");
      } else {
        setHeatmapType("crowd");
      }

      // Append custom alerts depending on outcome
      const newAlert = {
        id: Math.random().toString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: `Event Simulated: ${type.toUpperCase()}`,
        description: data.simulationOutcome.slice(0, 75) + "...",
        type: type === "disaster" ? "danger" : "success"
      };
      setAlerts((prev) => [newAlert, ...prev.slice(0, 5)]);

      // Direct the user to the Council Dialogue or Sandbox page so they see details immediately
      if (type === "host_event" || type === "disaster") {
        setActiveTab("council");
      } else {
        setActiveTab("sandbox");
      }

    } catch (err) {
      console.error("Simulation run failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Voice Interaction / general chat proxy to server
  const handleVoiceMessage = async (message: string): Promise<string> => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, currentState: stadiumState }),
      });
      const data = await response.json();
      
      // If voice audio speech is unmuted, speak back
      if (!isMuted && "speechSynthesis" in window) {
        const text = data.reply;
        const synth = window.speechSynthesis;
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 1.1;
        synth.speak(utter);
      }

      return data.reply;
    } catch (err) {
      console.error("Chat failed:", err);
      return "Central intelligence backup operational. Local sensors reports stable parameters.";
    }
  };

  // Recalculate simulation state momentarily when God Mode elements are moved
  const triggerGodModeRecalculation = (actionMessage: string) => {
    // Dynamically update some values to represent "AI recalculating on the fly"
    setStadiumState((prev) => {
      const randOffset = Math.floor(Math.random() * 8) - 4;
      const updatedCrowd = Math.max(10, Math.min(100, prev.crowdDensity + randOffset));
      const updatedQueue = Math.max(1, Math.min(60, prev.foodQueueMinutes - 2)); // Dragging should optimize wait!
      return {
        ...prev,
        crowdDensity: updatedCrowd,
        foodQueueMinutes: updatedQueue,
        securityRisk: prev.securityRisk === "high" ? "medium" : "low" // mitigates high risk
      };
    });

    // Add a re-route notification alert
    const newAlert = {
      id: Math.random().toString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: "Tactical Redirection",
      description: `${actionMessage}. Security grid remapped on-the-fly. Wait times optimized.`,
      type: "success"
    };
    setAlerts((prev) => [newAlert, ...prev.slice(0, 5)]);
  };

  // Slide future vision state updater
  const handleFutureSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setFutureTimeOffset(value);

    if (value === 0) {
      setStadiumState(simulationResult?.stadiumState || INITIAL_STADIUM_STATE);
      return;
    }

    // Generate predictive stats for the slider
    setStadiumState((prev) => {
      let multiplier = 1;
      let emotion = prev.emotionWeather;
      let pulse = prev.crowdPulseColor;

      if (value === 15) {
        multiplier = 1.15;
        emotion = "excited";
        pulse = "green";
      } else if (value === 30) {
        multiplier = 1.25;
        emotion = "excited";
        pulse = "orange";
      } else if (value === 45) {
        multiplier = 0.9;
        emotion = "calm";
        pulse = "blue";
      } else {
        multiplier = 0.6;
        emotion = "calm";
        pulse = "blue";
      }

      return {
        ...prev,
        parkingOccupancy: Math.min(100, Math.round((simulationResult?.stadiumState?.parkingOccupancy || prev.parkingOccupancy) * multiplier)),
        crowdDensity: Math.min(100, Math.round((simulationResult?.stadiumState?.crowdDensity || prev.crowdDensity) * multiplier)),
        foodQueueMinutes: Math.min(60, Math.round((simulationResult?.stadiumState?.foodQueueMinutes || prev.foodQueueMinutes) * multiplier)),
        emotionWeather: emotion,
        crowdPulseColor: pulse
      };
    });
  };

  const handleSandboxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sandboxInput.trim()) {
      runSimulation("custom", sandboxInput);
    }
  };

  // Extract green values
  const greenScores = stadiumState.greenScores || {
    carbon: 81,
    energy: 85,
    water: 90,
    waste: 78
  };

  // Extract What If analyses
  const whatIfAnalysis = simulationResult?.whatIfAnalysis || {
    sponsorImpact: "Adaptive digital ledger boards adjust instantly, preserving ad impressions during interruptions.",
    scheduleImpact: "Tournament calendar safe with 2 pre-blocked standby backup windows.",
    medicalImpact: "Fast triage dispatched to Zone B to clear stands within 45 seconds.",
    securityAdjustments: "Rerouting security wardens to Gate exits to handle crowd flow redistribution.",
    alternativeCoverage: "Holographic dome cameras active to capture gameplay angles safely."
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-cyan-100 selection:text-cyan-900">
      
      {/* HEADER BAR */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md z-40 sticky top-0 px-4 py-3.5 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl flex items-center justify-center shadow-md border border-indigo-400/20">
              <Flame size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-display font-black tracking-wider text-slate-900 uppercase">
                  IGNIS ARENA
                </h1>
                <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-600 font-mono px-1.5 py-0.5 rounded uppercase font-semibold">
                  Light Twin OS
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-500 tracking-wider uppercase">
                Autonomous Stadium Digital Intelligence platform
              </p>
            </div>
          </div>

          {/* Core System Telemetry */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] font-mono">
            <div className="hidden sm:flex items-center gap-1.5 text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
              <Cpu size={12} className="text-indigo-600 animate-pulse" />
              <span>CORE GATEWAY:</span>
              <span className="text-emerald-600 font-bold">ONLINE</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
              <Sliders size={12} className="text-pink-600" />
              <span>UPTIME:</span>
              <span className="text-slate-800 font-bold tracking-widest">{systemUptime}</span>
            </div>

            {/* Stadium Voice Audio Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`px-3 py-1 rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer text-[11px] font-semibold font-mono ${
                isMuted
                  ? "bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-200"
                  : "bg-cyan-50 border-cyan-200 text-cyan-700 font-bold"
              }`}
            >
              <Radio size={11} className={!isMuted ? "animate-pulse" : ""} />
              VOICE REPLIES: {isMuted ? "MUTED" : "SPEECH ACTIVE"}
            </button>
            
            <button
              onClick={() => {
                setStadiumState(INITIAL_STADIUM_STATE);
                setMarkers(INITIAL_MARKERS);
                setAlerts(INITIAL_ALERTS);
                setSimulationResult(null);
                setHeatmapType("crowd");
                setFutureTimeOffset(0);
                setActiveTab("twin");
              }}
              title="Reset Simulator Settings"
              className="p-1 hover:bg-slate-100 border border-slate-200 bg-white rounded-lg transition-colors text-slate-500 hover:text-slate-900 cursor-pointer h-[26px] w-[26px] flex items-center justify-center"
            >
              <RefreshCw size={13} />
            </button>

            {/* User Account / Identity Section */}
            <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />

            {user ? (
              <div className="flex items-center gap-2">
                {/* Role Badge Indicator */}
                <div className={`px-2 py-0.5 rounded-md border text-[9px] font-bold tracking-wider uppercase flex items-center gap-1 ${
                  user.role === "director"
                    ? "bg-purple-50 border-purple-200 text-purple-700 font-black"
                    : user.role === "security"
                      ? "bg-sky-50 border-sky-200 text-sky-700"
                      : "bg-amber-50 border-amber-200 text-amber-700"
                }`}>
                  {user.role === "director" && <Sparkles size={10} className="animate-pulse" />}
                  {user.role === "security" && <Shield size={10} />}
                  {user.role === "fan" && <Flame size={10} />}
                  {user.role}
                </div>

                {/* Username and Logout */}
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-xl">
                  <div className="h-4.5 w-4.5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black uppercase shadow-inner">
                    {user.username.slice(0, 1)}
                  </div>
                  <span className="text-slate-800 font-bold hidden md:inline">{user.username}</span>
                  <button
                    onClick={handleLogout}
                    title="Sign Out System ID"
                    className="text-[10px] text-red-600 hover:text-red-700 hover:underline cursor-pointer font-bold border-l border-slate-200 pl-2 ml-1"
                  >
                    DISCONNECT
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-[10px] rounded-xl border border-indigo-700 hover:border-indigo-600 transition-all cursor-pointer shadow-sm flex items-center gap-1.5 uppercase tracking-wider animate-bounce"
              >
                <UserCheck size={11} />
                🔒 Authenticate ID
              </button>
            )}

          </div>

        </div>

        {/* SPACES & TABS NAVIGATION DECK */}
        <div className="max-w-7xl mx-auto mt-4 pt-1 border-t border-slate-100">
          <nav className="flex flex-wrap gap-1.5" aria-label="Page Tabs">
            <button
              onClick={() => setActiveTab("twin")}
              className={`px-4 py-2.5 rounded-xl font-medium text-xs tracking-wide flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "twin"
                  ? "bg-indigo-600 text-white shadow-md font-semibold"
                  : "bg-transparent text-slate-600 hover:text-slate-950 hover:bg-slate-100/80"
              }`}
            >
              <Compass size={14} />
              🏟 DIGITAL TWIN MAP
            </button>

            <button
              onClick={() => setActiveTab("council")}
              className={`px-4 py-2.5 rounded-xl font-medium text-xs tracking-wide flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "council"
                  ? "bg-indigo-600 text-white shadow-md font-semibold"
                  : "bg-transparent text-slate-600 hover:text-slate-950 hover:bg-slate-100/80"
              }`}
            >
              <Bot size={14} />
              👥 OPERATIONAL COUNCIL
            </button>

            <button
              onClick={() => setActiveTab("sandbox")}
              className={`px-4 py-2.5 rounded-xl font-medium text-xs tracking-wide flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "sandbox"
                  ? "bg-indigo-600 text-white shadow-md font-semibold"
                  : "bg-transparent text-slate-600 hover:text-slate-950 hover:bg-slate-100/80"
              }`}
            >
              <Sparkles size={14} />
              🔮 SCENARIO SANDBOX
            </button>

            <button
              onClick={() => setActiveTab("green")}
              className={`px-4 py-2.5 rounded-xl font-medium text-xs tracking-wide flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "green"
                  ? "bg-indigo-600 text-white shadow-md font-semibold"
                  : "bg-transparent text-slate-600 hover:text-slate-950 hover:bg-slate-100/80"
              }`}
            >
              <Leaf size={14} />
              🌿 GREEN STADIUM
            </button>

            <button
              onClick={() => setActiveTab("tickets")}
              className={`px-4 py-2.5 rounded-xl font-medium text-xs tracking-wide flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "tickets"
                  ? "bg-indigo-600 text-white shadow-md font-semibold"
                  : "bg-transparent text-slate-600 hover:text-slate-950 hover:bg-slate-100/80"
              }`}
            >
              <Ticket size={14} />
              🎟 VIP & LIVING TICKETS
            </button>

            <button
              onClick={() => setActiveTab("chat")}
              className={`px-4 py-2.5 rounded-xl font-medium text-xs tracking-wide flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "chat"
                  ? "bg-indigo-600 text-white shadow-md font-semibold"
                  : "bg-transparent text-slate-600 hover:text-slate-950 hover:bg-slate-100/80"
              }`}
            >
              <Bot size={14} />
              🎙 VOICE CONCIERGE CHAT
            </button>
          </nav>
        </div>
      </header>

      {/* CORE CONTROL DECK CONTENT (Separated on separate pages so that it is NEVER clumsy) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 z-10 animate-fadeIn">
        
        {/* ==================== PAGE 0: DIGITAL TWIN ==================== */}
        {activeTab === "twin" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Telemetry Sidebar (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Vitals Summary Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-mono font-bold tracking-wider text-slate-500 uppercase">
                    Stadium Vitals Monitor
                  </h3>
                  <span className="text-[9px] bg-slate-100 text-slate-500 font-mono px-2 py-0.5 rounded font-bold uppercase">
                    Live
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Parking */}
                  <div>
                    <div className="flex justify-between text-xs font-mono text-slate-600 mb-1">
                      <span>PARKING OCCUPANCY</span>
                      <span className={stadiumState.parkingOccupancy > 90 ? "text-red-600 font-bold" : "text-slate-800 font-semibold"}>
                        {stadiumState.parkingOccupancy}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className={`h-full transition-all duration-500 ${
                          stadiumState.parkingOccupancy > 90 ? "bg-red-500" : "bg-indigo-600"
                        }`}
                        style={{ width: `${stadiumState.parkingOccupancy}%` }}
                      />
                    </div>
                  </div>

                  {/* Crowd Density */}
                  <div>
                    <div className="flex justify-between text-xs font-mono text-slate-600 mb-1">
                      <span>CROWD DENSITY INDEX</span>
                      <span className={stadiumState.crowdDensity > 85 ? "text-red-600 font-bold" : "text-slate-800 font-semibold"}>
                        {stadiumState.crowdDensity}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className={`h-full transition-all duration-500 ${
                          stadiumState.crowdDensity > 85 ? "bg-red-500" : "bg-cyan-600"
                        }`}
                        style={{ width: `${stadiumState.crowdDensity}%` }}
                      />
                    </div>
                  </div>

                  {/* Grid Power Usage */}
                  <div>
                    <div className="flex justify-between text-xs font-mono text-slate-600 mb-1">
                      <span>STADIUM GRID ENERGY</span>
                      <span className="text-slate-800 font-semibold">{stadiumState.energyUsage}% OF BASELINE</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-amber-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, stadiumState.energyUsage / 1.5)}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats Highlights Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-[9px] font-mono text-slate-500 uppercase block font-semibold">FOOD STALL QUEUES</span>
                      <div className="text-base font-bold font-mono text-slate-800 mt-1">
                        {stadiumState.foodQueueMinutes} <span className="text-xs font-normal text-slate-500">Mins</span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-[9px] font-mono text-slate-500 uppercase block font-semibold">EMOTION WEATHER</span>
                      <div className="text-sm font-bold font-mono text-indigo-700 mt-1 uppercase tracking-wide">
                        {stadiumState.emotionWeather === "excited" ? "😊 EXCITED" : stadiumState.emotionWeather === "panic" ? "😰 PANIC" : stadiumState.emotionWeather === "angry" ? "😡 ANGRY" : stadiumState.emotionWeather === "frustrated" ? "😭 FRUSTRATED" : "😐 CALM"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Telemetry Logger */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col h-[280px]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <Bell size={14} className="text-red-500 animate-bounce" />
                    <h3 className="text-xs font-mono font-bold tracking-wider text-slate-700">
                      LIVE EVENTS TELEMETRY FEED
                    </h3>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 font-bold">REAL-TIME</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="text-xs flex gap-2.5 items-start">
                      <span
                        className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                          alert.type === "danger"
                            ? "bg-red-500 animate-pulse"
                            : alert.type === "warning"
                            ? "bg-amber-500"
                            : alert.type === "success"
                            ? "bg-emerald-500"
                            : "bg-blue-500"
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono text-slate-400">{alert.time}</span>
                          <h4 className="font-bold text-slate-800 tracking-tight">{alert.title}</h4>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-normal">{alert.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Central Living Map Section (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Heatmap Filters */}
              <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm flex flex-wrap sm:flex-nowrap gap-1">
                <button
                  onClick={() => setHeatmapType("crowd")}
                  className={`flex-1 py-2 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
                    heatmapType === "crowd"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  👥 CROWD PULSE
                </button>
                <button
                  onClick={() => setHeatmapType("energy")}
                  className={`flex-1 py-2 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
                    heatmapType === "energy"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  ⚡ ENERGY GRID
                </button>
                <button
                  onClick={() => setHeatmapType("emotion")}
                  className={`flex-1 py-2 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
                    heatmapType === "emotion"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  💖 EMOTION WEATHER
                </button>
                <button
                  onClick={() => setHeatmapType("emergency")}
                  className={`flex-1 py-2 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
                    heatmapType === "emergency"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  🚪 ESCAPE PLANS
                </button>
              </div>

              {/* Digital Twin Render */}
              <StadiumDigitalTwin
                stadiumState={stadiumState}
                heatmapType={heatmapType}
                markers={markers}
                onUpdateMarkers={setMarkers}
                onTriggerRecalculate={triggerGodModeRecalculation}
                laserCount={laserCount}
                laserColor={laserColor}
                dryIceActive={dryIceActive}
                pyroActive={pyroActive}
              />

              {/* Blueprint Timeline */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4 shrink-0">
                  <Compass size={14} className="text-indigo-600 animate-spin" style={{ animationDuration: "12s" }} />
                  <h3 className="text-xs font-mono font-bold tracking-wider text-slate-700 uppercase">
                    STADIUM LOGISTICS BLUEPRINT TIMELINE
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                  {(simulationResult?.timeline || [
                    { time: "Gates Open", description: "Dynamic parking routing initiated, biometric sensors activated.", crowdLevel: 10 },
                    { time: "Pre-match", description: "Solar grid batteries pre-charged. Laser coordinates active.", crowdLevel: 45 },
                    { time: "Halftime", description: "Food queue predictions active. Smart kiosks speed set.", crowdLevel: 95 },
                    { time: "Post-match", description: "Illuminated green escape pathways safe dispersion.", crowdLevel: 25 }
                  ]).map((t, idx) => (
                    <div key={`${t.time}-${idx}`} className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 relative">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-2">
                        <span className="font-mono text-[10px] text-indigo-600 font-bold uppercase">{t.time}</span>
                        <span className="text-[9px] font-mono text-slate-500 font-bold">Crowd: {t.crowdLevel}%</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-normal">{t.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ==================== INTERACTIVE HALFTIME SHOW DESIGNER ==================== */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
                  <div className="flex items-center gap-2.5">
                    <Sparkles size={18} className="text-violet-600 animate-pulse" />
                    <div>
                      <h3 className="text-sm font-display font-bold text-slate-800 uppercase">
                        Holographic Laser & Pyro Designer
                      </h3>
                      <p className="text-xs text-slate-500 font-mono">Control dynamic stadium light shows in real-time</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full uppercase tracking-wider">
                    Show Mode: {laserCount > 0 ? "Active" : "Standby"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Column 1: Laser slider */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono font-semibold text-slate-600 uppercase">Laser Projectors</span>
                      <span className="text-xs font-bold font-mono text-indigo-600">{laserCount} Beams</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="12"
                      value={laserCount}
                      onChange={(e) => setLaserCount(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                    />
                    <p className="text-[10px] text-slate-500 font-sans leading-normal">
                      Adjusts the number of rotating holographic laser streams emitting from Center Stage. Drag the Center Stage marker on the map to re-route them!
                    </p>
                  </div>

                  {/* Column 2: Color picker and toggles */}
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-mono font-semibold text-slate-600 uppercase block mb-2">Laser Colorway</span>
                      <div className="flex gap-2">
                        {[
                          { id: "cyan", name: "Cyan", color: "bg-sky-400 border-sky-300" },
                          { id: "rose", name: "Rose", color: "bg-rose-500 border-rose-300" },
                          { id: "lime", name: "Lime", color: "bg-emerald-500 border-emerald-300" },
                          { id: "gold", name: "Gold", color: "bg-amber-500 border-amber-300" },
                          { id: "violet", name: "Violet", color: "bg-purple-500 border-purple-300" },
                        ].map((c) => (
                          <button
                            key={c.id}
                            onClick={() => setLaserColor(c.id)}
                            title={c.name}
                            className={`h-6 w-6 rounded-full cursor-pointer border-2 transition-all ${c.color} ${
                              laserColor === c.id ? "scale-125 shadow-md border-slate-900" : "opacity-60 hover:opacity-100"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-slate-600 font-medium">
                      <input
                        type="checkbox"
                        checked={dryIceActive}
                        onChange={(e) => setDryIceActive(e.target.checked)}
                        className="h-4 w-4 accent-indigo-600 cursor-pointer rounded border-slate-300"
                      />
                      <span>Deploy Ambient Dry Ice Fog</span>
                    </label>
                  </div>

                  {/* Column 3: Pyro Trigger */}
                  <div className="flex flex-col justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div>
                      <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase block">Special Pyro Show</span>
                      <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                        Flashes high-intensity pyrotechnic sparks from the pitch corners. Increases energy index briefly.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setPyroActive(true);
                        setStadiumState((prev) => ({ ...prev, energyUsage: prev.energyUsage + 15 }));
                        
                        const pyroAlert = {
                          id: Math.random().toString(),
                          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                          title: "Pyro Sparks Initiated!",
                          description: "Halftime pyro flame cannons fired on playfield corners. Stadium grid load spiked +15%.",
                          type: "warning"
                        };
                        setAlerts((prevAlerts) => [pyroAlert, ...prevAlerts.slice(0, 5)]);

                        if (!isMuted && "speechSynthesis" in window) {
                          const utter = new SpeechSynthesisUtterance("Detonating stadium pyrotechnic show.");
                          window.speechSynthesis.speak(utter);
                        }
                        
                        setTimeout(() => {
                          setPyroActive(false);
                          setStadiumState((prev) => ({ ...prev, energyUsage: Math.max(100, prev.energyUsage - 15) }));
                        }, 3500);
                      }}
                      disabled={pyroActive}
                      className={`w-full mt-3 py-2 px-4 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                        pyroActive
                          ? "bg-amber-100 border border-amber-200 text-amber-700 animate-pulse cursor-not-allowed"
                          : "bg-amber-500 border border-amber-600 text-white hover:bg-amber-600"
                      }`}
                    >
                      <Zap size={13} className={pyroActive ? "animate-spin" : ""} />
                      {pyroActive ? "FIRE CANNONS ACTIVE..." : "🔥 DETONATE STADIUM PYRO"}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== PAGE 1: OPERATIONAL COUNCIL ==================== */}
        {activeTab === "council" && (
          <div className="w-full">
            {!user || (user.role !== "director" && user.role !== "security") ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-xl mx-auto shadow-sm space-y-4 my-8">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mb-2">
                  <Shield size={22} className="animate-pulse" />
                </div>
                <h3 className="text-base font-display font-black text-slate-800 uppercase tracking-tight">
                  Operational Council Locked
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                  Consensus coordination with autonomous stadium chiefs requires **Security** or **Director** security clearance. 
                  Your current system clearance is: <span className="font-mono font-bold text-indigo-700 uppercase bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-[10px]">{user?.role || "anonymous guest"}</span>.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold rounded-xl transition-all cursor-pointer shadow-md uppercase"
                  >
                    🔐 Authenticate High Clearance
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* The Dialogue Theater Box (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              <AICouncilTheater dialogues={simulationResult?.councilDialogue || []} />
            </div>

            {/* Side Briefing notes (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Core Consensus summary */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-3">
                  <Bot size={14} className="text-purple-600" />
                  <h3 className="text-xs font-mono font-bold tracking-wider text-slate-700">
                    COUNCIL ALIGNED BLUEPRINT SUMMARY
                  </h3>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {simulationResult?.simulationOutcome || "The autonomous chiefs are currently on standby. Trigger an operating event or customized template to run high-intelligence scenarios and view full dialogue transcripts."}
                </p>

                {simulationResult && (
                  <div className="space-y-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                      <span className="font-mono text-[10px] text-purple-600 block font-bold uppercase">Consensus Status</span>
                      <p className="text-slate-700 mt-1 font-semibold">✓ 100% Core Synchronized</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                      <span className="font-mono text-[10px] text-purple-600 block font-bold uppercase">Dynamic Dispatch</span>
                      <p className="text-slate-700 mt-1">Autonomous systems have aligned and redistributed guards, paramedic triage slots, and sustainable power loops accordingly.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick summon buttons */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h4 className="text-xs font-mono font-bold tracking-wider text-slate-700 mb-3 uppercase">
                  Summon Operational Council
                </h4>
                <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
                  Trigger an immediate, high-fidelity scenario simulation. The AI council members will debate their respective response strategies in real-time.
                </p>

                <div className="space-y-2">
                  {TEMPLATES.slice(0, 3).map((item) => (
                    <button
                      key={item.label}
                      onClick={() => runSimulation(item.type, item.prompt)}
                      disabled={isLoading}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <span>{item.label}</span>
                      <ChevronRight size={13} className="text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>

            </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== PAGE 2: SCENARIO SANDBOX ==================== */}
        {activeTab === "sandbox" && (
          <div className="space-y-6">
            {!user || user.role !== "director" ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-xl mx-auto shadow-sm space-y-4 my-8">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 mb-2">
                  <Shield size={22} className="animate-pulse" />
                </div>
                <h3 className="text-base font-display font-black text-slate-800 uppercase tracking-tight">
                  Tactical Sandbox Locked
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                  Scenario sandboxing and AI consensus generation require supreme **Director Admin** security clearance. 
                  Your current system clearance is: <span className="font-mono font-bold text-indigo-700 uppercase bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-[10px]">{user?.role || "anonymous guest"}</span>.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold rounded-xl transition-all cursor-pointer shadow-md uppercase"
                  >
                    🔐 Authenticate as Director
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Main Command & Prompt Box */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-100/40 blur-2xl rounded-full pointer-events-none" />

              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-indigo-600" />
                <h3 className="text-xs font-mono font-bold tracking-widest text-slate-700">
                  IGNIS ARENA INTELLIGENCE COMMAND SANDBOX
                </h3>
              </div>

              <p className="text-xs text-slate-500 mb-4 max-w-2xl leading-relaxed">
                Trigger complex "What If" parameters. Custom prompts generate structural forecasts for security coordinates, sponsor ad board adjustments, schedule delays, and fan psychology.
              </p>

              {/* Templates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                {TEMPLATES.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setSandboxInput(item.prompt);
                      runSimulation(item.type, item.prompt);
                    }}
                    disabled={isLoading}
                    className="p-3 text-left rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-300 transition-all text-xs disabled:opacity-50 cursor-pointer"
                  >
                    <span className="font-bold text-slate-800 block mb-1">{item.label}</span>
                    <span className="text-[10px] text-slate-500 leading-normal block">{item.description}</span>
                  </button>
                ))}
              </div>

              {/* Custom Input form */}
              <form onSubmit={handleSandboxSubmit} className="relative">
                <input
                  type="text"
                  value={sandboxInput}
                  onChange={(e) => setSandboxInput(e.target.value)}
                  disabled={isLoading}
                  placeholder='Enter stadium crisis scenario, e.g., "Critical solar storage fails at minute 45. Broadcast emergency advisory."'
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-4 pr-14 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={isLoading || !sandboxInput.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white transition-colors cursor-pointer"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 border-2 border-slate-300 border-t-white rounded-full animate-spin" />
                  ) : (
                    <SendHorizontal size={16} />
                  )}
                </button>
              </form>
            </div>

            {/* Sandbox Results and Time Slider */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Future Time Slider (5 cols) */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Timer size={16} className="text-pink-600 animate-pulse" />
                    <h3 className="text-xs font-mono font-bold tracking-wider text-slate-700">
                      FUTURE VISION TIME-MACHINE
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-pink-700 font-bold bg-pink-50 border border-pink-200 px-2 py-0.5 rounded">
                    {futureTimeOffset === 0 ? "LIVE OS STATE" : `+${futureTimeOffset} MINUTES`}
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Adjust the slider to trigger algorithmic projections. Stadium vitals recalculate to predict peak queue delays and solar charging declines.
                </p>

                <div className="flex items-center gap-4 pt-2">
                  <span className="text-[10px] font-mono text-slate-400 font-bold">NOW</span>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="15"
                    value={futureTimeOffset}
                    onChange={handleFutureSliderChange}
                    className="w-full accent-pink-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-slate-400 font-bold">+1 HOUR</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[9px] font-mono text-slate-500 block uppercase">Expected Crowd</span>
                    <div className="text-xs font-bold text-slate-800 mt-1">
                      {futureTimeOffset === 0 ? "Normal" : futureTimeOffset === 15 ? "+12% Incoming" : futureTimeOffset === 30 ? "Peak Capacity" : "Outflow Safe"}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[9px] font-mono text-slate-500 block uppercase">Solar Efficiency</span>
                    <div className="text-xs font-bold text-slate-800 mt-1">
                      {futureTimeOffset === 0 ? "95% (Peak)" : futureTimeOffset === 15 ? "85%" : futureTimeOffset === 30 ? "70%" : "50% (Covered)"}
                    </div>
                  </div>
                </div>
              </div>

              {/* What-If Impacts Detail Sheet (7 cols) */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
                  <Sliders size={14} className="text-indigo-600" />
                  <h3 className="text-xs font-mono font-bold tracking-wider text-slate-700 uppercase">
                    SCENARIO WHAT-IF LOGISTICS ANALYSIS
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-mono text-indigo-700 font-bold uppercase block mb-1">Sponsor Board Impact</span>
                    <p className="text-xs text-slate-600 leading-normal">{whatIfAnalysis.sponsorImpact}</p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-mono text-indigo-700 font-bold uppercase block mb-1">Schedule Continuity</span>
                    <p className="text-xs text-slate-600 leading-normal">{whatIfAnalysis.scheduleImpact}</p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-mono text-indigo-700 font-bold uppercase block mb-1">Medical Response Priority</span>
                    <p className="text-xs text-slate-600 leading-normal">{whatIfAnalysis.medicalImpact}</p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-mono text-indigo-700 font-bold uppercase block mb-1">Security Guards Reroute</span>
                    <p className="text-xs text-slate-600 leading-normal">{whatIfAnalysis.securityAdjustments}</p>
                  </div>

                </div>
              </div>

            </div>

              </>
            )}
          </div>
        )}

        {/* ==================== PAGE 3: GREEN STADIUM ==================== */}
        {activeTab === "green" && (
          <div className="space-y-6">
            
            {/* Sustainability Metrics Scoreboard */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Leaf size={18} className="text-emerald-600" />
                  <div>
                    <h3 className="text-sm font-display font-bold text-slate-800 uppercase">
                      Living Stadium Sustainability Ledger
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">Real-time Zero-Emission tracking values</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  Net-Zero Status: Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Carbon Offset */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 font-semibold">
                    <span>CARBON SAVED</span>
                    <Globe size={14} className="text-emerald-600" />
                  </div>
                  <div className="text-3xl font-bold font-mono text-emerald-600 my-4">
                    {greenScores.carbon}%
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${greenScores.carbon}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-3">✓ 2.3 Metric tons sequestered</p>
                </div>

                {/* Solar power harvesting */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 font-semibold">
                    <span>SOLAR HARVEST</span>
                    <Zap size={14} className="text-amber-500 animate-pulse" />
                  </div>
                  <div className="text-3xl font-bold font-mono text-amber-600 my-4">
                    {greenScores.energy}%
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: `${greenScores.energy}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-3">✓ 2,400 kW high-output glass dome</p>
                </div>

                {/* Water Reclamation */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 font-semibold">
                    <span>WATER RECLAIMED</span>
                    <Activity size={14} className="text-blue-500" />
                  </div>
                  <div className="text-3xl font-bold font-mono text-blue-600 my-4">
                    {greenScores.water}%
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{ width: `${greenScores.water}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-3">✓ Rainwater filtration active</p>
                </div>

                {/* Waste Automation */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 font-semibold">
                    <span>WASTE AUTOMATION</span>
                    <Leaf size={14} className="text-teal-500" />
                  </div>
                  <div className="text-3xl font-bold font-mono text-teal-600 my-4">
                    {greenScores.waste}%
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-teal-500 h-full" style={{ width: `${greenScores.waste}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-3">✓ Compost robotics deployed</p>
                </div>

              </div>
            </div>

            {/* In-depth Sustainability features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Piezo-electric Floor metrics */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
                  <Zap size={14} className="text-emerald-600" />
                  <h4 className="text-xs font-mono font-bold tracking-wider text-slate-700 uppercase">
                    Piezo-electric Fan Floor Panel array
                  </h4>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Ignis Arena maps kinetic vibration from fans walking the corridors and jumping in the stands, recycling raw kinetic energy back into the broadcast screen arrays.
                </p>

                <div className="space-y-3.5">
                  <div className="flex justify-between text-xs border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-medium">Active panels map count:</span>
                    <span className="font-mono text-slate-800 font-bold">14,200 panels</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-medium">Kinetic energy output:</span>
                    <span className="font-mono text-slate-800 font-bold">{(45.2 + (jumpCount * 0.4)).toFixed(1)} Kilowatt-hours</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-medium">Grid recycling efficiency:</span>
                    <span className="font-mono text-emerald-600 font-bold">98.4% (Ultra efficient)</span>
                  </div>
                </div>

                {/* Interactive Wave Trigger Sub-panel */}
                <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono font-bold text-slate-600">LOCAL CAPACITOR STATE</span>
                    <span className="font-mono text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {kineticCharge}% CHARGED
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className={`h-full bg-emerald-500 transition-all duration-300 ${
                        waveTriggerActive ? "animate-pulse" : ""
                      }`}
                      style={{ width: `${kineticCharge}%` }}
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => {
                        setWaveTriggerActive(true);
                        setJumpCount(prev => prev + 1);
                        setKineticCharge(prev => {
                          const next = prev + 14;
                          if (next >= 100) {
                            // Overcharge alert!
                            const overchargeAlert = {
                              id: Math.random().toString(),
                              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                              title: "Capacitor Array Full!",
                              description: "Fan kinetic jumps overcharged local battery banks. Stadium carbon offset score increased by +3%.",
                              type: "success"
                            };
                            setAlerts(a => [overchargeAlert, ...a.slice(0, 5)]);
                            setStadiumState((st) => ({
                              ...st,
                              greenScores: {
                                ...st.greenScores,
                                energy: Math.min(100, st.greenScores.energy + 2),
                                carbon: Math.min(100, st.greenScores.carbon + 3)
                              }
                            }));
                            return 10; // Reset charge to 10% after dump
                          }
                          return next;
                        });

                        setTimeout(() => setWaveTriggerActive(false), 800);

                        // Audio Synth sound effect if voice unmuted
                        if (!isMuted && "speechSynthesis" in window) {
                          const utter = new SpeechSynthesisUtterance("Fan jump wave captured.");
                          window.speechSynthesis.speak(utter);
                        }
                      }}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700 rounded-xl text-xs font-mono font-bold uppercase transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Zap size={12} className={waveTriggerActive ? "animate-bounce" : ""} />
                      📣 Sim Fan Wave Jump
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono text-center">
                    ✓ Jumps recorded: <span className="font-bold text-slate-800">{jumpCount} waves</span>
                  </p>
                </div>
              </div>

              {/* Rainwater collection stats */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
                  <Globe size={14} className="text-blue-600" />
                  <h4 className="text-xs font-mono font-bold tracking-wider text-slate-700 uppercase">
                    Recycled Rainwater pitch hydration
                  </h4>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Natural rainwater falls on the solar dome glass roof, flowing directly to dual underground filtration banks to hydrate the natural playfield turf without consuming city tap water.
                </p>

                <div className="space-y-3.5">
                  <div className="flex justify-between text-xs border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-medium">Filtration Tank A Volume:</span>
                    <span className="font-mono text-slate-800 font-bold">45,000 Liters (Full)</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-medium">Pitch irrigation status:</span>
                    <span className="font-mono text-slate-800 font-bold">Moisture levels optimized</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">City grid water savings offset:</span>
                    <span className="font-mono text-blue-600 font-bold">✓ 3,200 Liters today</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==================== PAGE 4: VIP & LIVING TICKETS ==================== */}
        {activeTab === "tickets" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Living Ticket Interaction (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-display font-bold text-slate-800 uppercase">
                    Your Living AI ticket Assistant
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">Dynamic queue and seat escort assistance</p>
                </div>
                <span className="text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono font-bold px-2.5 py-1 rounded-lg">
                  Gate 3 Seat 44B
                </span>
              </div>

              {/* Dynamic status boxes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block font-semibold">NEAREST WASHROOM</span>
                  <p className="text-slate-800 mt-1 font-bold">West Corridor [30m]</p>
                  <p className="text-[10px] text-slate-500 mt-1">Zero queue delay detected.</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block font-semibold">FOOD STALL QUEUES</span>
                  <p className="text-slate-800 mt-1 font-bold">Stall F2: 2 min wait</p>
                  <p className="text-[10px] text-slate-500 mt-1">Subway beverage stock normal.</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block font-semibold">PRE-ORDER MEAL</span>
                  {concessionsOrder ? (
                    <>
                      <p className="text-indigo-600 mt-1 font-bold truncate">{concessionsOrder.item}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5 font-mono uppercase font-semibold">
                        {concessionsOrder.status === "queuing" ? "⏳ Queue ledger..." : concessionsOrder.status === "preparing" ? "⚡ Preparing..." : "✅ READY AT KIOSK"}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-slate-400 mt-1 font-bold">No active pre-order</p>
                      <p className="text-[10px] text-slate-500 mt-1">Submit order below.</p>
                    </>
                  )}
                </div>

              </div>

              {/* Holographic Seat Finder SVG */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] font-mono text-indigo-600 block mb-2 font-bold uppercase">
                  🏟 Gate 3 Walkway Path Finder
                </span>
                
                <div className="h-40 bg-white rounded-lg border border-slate-200 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-radial-[circle_at_center,rgba(99,102,241,0.03)_0%,transparent_80%] pointer-events-none" />
                  {/* Miniature diagram map */}
                  <div className="text-center">
                    <p className="text-xs text-slate-600 font-medium">Walkway corridor cleared. Enter via Gate 3.</p>
                    <p className="text-[10px] text-slate-400 mt-1">Follow the flashing blue floor guide on-the-fly.</p>
                    <div className="flex gap-2 justify-center mt-3">
                      <span className="h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
                      <span className="h-2 w-2 rounded-full bg-indigo-600" />
                      <span className="h-2 w-2 rounded-full bg-indigo-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ==================== SMART CONCESSIONS & F&B OUTLET ==================== */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Flame size={14} className="text-indigo-600 animate-pulse" />
                  <span className="text-xs font-mono font-bold tracking-wider text-slate-700 uppercase">
                    🍔 SMART CONCESSIONS & F&B OUTLET
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Pre-order zero-emission concessions and skip lines. Active staff drones optimize food prep delays.
                </p>

                {/* Pre-order menu selector */}
                {!concessionsOrder ? (
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase block">Select Concession Meal</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                      {[
                        { id: "burger", name: "Ignis Bio-Burger", stall: "F1", desc: "Soy-protein, zero-carbon wrap", wait: "3 min" },
                        { id: "taco", name: "Avocado Eco-Taco", stall: "F2", desc: "Organic corn shells, local greens", wait: "2 min" },
                        { id: "drink", name: "Glitch Energy Nectar", stall: "F3", desc: "Ginseng dynamic energy drop", wait: "1 min" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setConcessionsOrder({
                              item: item.name,
                              stall: item.stall,
                              status: "queuing",
                              progress: 0,
                            });
                            // Trigger dynamic alert
                            const preAlert = {
                              id: Math.random().toString(),
                              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                              title: "Biometric Pre-order Submitted",
                              description: `Order queued: 1x ${item.name} at Kiosk ${item.stall}. Processing ledger...`,
                              type: "info"
                            };
                            setAlerts(a => [preAlert, ...a.slice(0, 5)]);
                          }}
                          className="p-3 bg-white border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/20 rounded-xl text-left cursor-pointer transition-all flex flex-col justify-between"
                        >
                          <div>
                            <span className="font-semibold text-xs text-slate-800 block leading-tight">{item.name}</span>
                            <span className="text-[10px] text-slate-500 block mt-1 leading-normal">{item.desc}</span>
                          </div>
                          <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100 text-[10px] font-mono">
                            <span className="text-indigo-600 font-bold">Kiosk {item.stall}</span>
                            <span className="text-slate-500">{item.wait}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Active Order tracking card */
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
                    <div className="flex justify-between items-start text-xs border-b border-slate-100 pb-2">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block">ACTIVE ORDER</span>
                        <h4 className="font-bold text-slate-800 mt-0.5">{concessionsOrder.item}</h4>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg uppercase">
                        KIOSK {concessionsOrder.stall}
                      </span>
                    </div>

                    {/* Progress details */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-mono text-slate-500 uppercase">
                          {concessionsOrder.status === "queuing" ? "Step 1/3: Queue Ledger validation" : concessionsOrder.status === "preparing" ? "Step 2/3: Solar Induction cooking" : "Step 3/3: Collected at Kiosk"}
                        </span>
                        <span className="font-mono font-bold text-indigo-600">{concessionsOrder.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className="h-full bg-indigo-600 transition-all duration-300"
                          style={{ width: `${concessionsOrder.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-2 text-[11px]">
                      {concessionsOrder.status === "ready" ? (
                        <button
                          onClick={() => setConcessionsOrder(null)}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold uppercase rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          ✓ COLLECT MEAL & CLOSE RECORD
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => setStaffingBoost(!staffingBoost)}
                            className={`flex-1 py-2 font-mono font-bold uppercase rounded-xl transition-all border flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                              staffingBoost
                                ? "bg-amber-500 border-amber-600 text-white"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <Bot size={13} className={staffingBoost ? "animate-spin" : ""} />
                            {staffingBoost ? "🤖 Drone Assist Active (2x speed)" : "🤖 Summon Staff Drone Assistant"}
                          </button>
                          <button
                            onClick={() => {
                              setConcessionsOrder(null);
                              // Trigger cancel alert
                              const cancelAlert = {
                                id: Math.random().toString(),
                                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                title: "Pre-order Cancelled",
                                description: "Biometric food order cancelled. Refund processed back to ticket ledger.",
                                type: "info"
                              };
                              setAlerts(a => [cancelAlert, ...a.slice(0, 5)]);
                            }}
                            className="py-2 px-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-mono font-bold uppercase rounded-xl transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: VIP Celebrity Concierge Escorts (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-display font-bold text-slate-800 uppercase">
                  VIP Celebrity Escort Engine
                </h3>
                <p className="text-xs text-slate-500 font-mono">Secure underground route orchestration</p>
              </div>

              {/* Concierge stats card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5">
                <div className="flex justify-between items-center text-xs border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Secured VIP Escort:</span>
                  <span className="text-indigo-600 font-bold font-mono">Active escort path</span>
                </div>
                <div className="flex justify-between items-center text-xs border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Assigned route:</span>
                  <span className="text-slate-800 font-mono">Tunnel Route Delta [Secured]</span>
                </div>
                <div className="flex justify-between items-center text-xs border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Biometric clearings:</span>
                  <span className="text-emerald-600 font-bold">✓ Door 5 Approved</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Drone Bodyguard Sync:</span>
                  <span className="text-indigo-600 font-mono">D-07 Synchronized</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                💡 The system orchestrates VIP routes automatically by analyzing crowd density at Gate entrypoints, safely redirecting bodyguards underground.
              </p>

            </div>

          </div>
        )}

        {/* ==================== PAGE 5: VOICE CONCIERGE CHAT ==================== */}
        {activeTab === "chat" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-display font-bold text-slate-800 uppercase mb-2">
                Talk to Ignis Arena Intelligence
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our autonomous digital stadium operating system answers questions about resource allocation, parking occupancy, climate-control solar roofs, and real-time medical perimeters. Speak to it naturally below.
              </p>
            </div>

            <div className="h-[550px]">
              <StadiumBrainChat onSendMessage={handleVoiceMessage} stadiumState={stadiumState} />
            </div>
          </div>
        )}

      </main>

      {/* FOOTER METRIC BANNER */}
      <footer className="border-t border-slate-200 bg-white/50 p-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-500">
          <div>
            <span>SYSTEM CONTEXT: </span>
            <span className="text-indigo-600 font-bold">LIGHT THEME INTERACTIVE WORKSPACE</span>
          </div>
          <div>
            <span>AUTONOMOUS AGENT VERSION: </span>
            <span className="text-slate-800 font-bold">3.5.2</span>
          </div>
        </div>
      </footer>

      {/* Conditionally Render Auth Gate */}
      {(showAuthModal || !user) && (
        <AuthModal
          onAuthSuccess={handleAuthSuccess}
          onClose={() => {
            setShowAuthModal(false);
            // If they close, we can let them browse as Guest, but print a warning
            if (!user) {
              const guestAlert = {
                id: Math.random().toString(),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                title: "Anonymous Guest Mode Active",
                description: "Viewing platform as Guest. Authenticate with an Admin ID to unlock full tactical controls.",
                type: "warning" as const
              };
              setAlerts(prev => [guestAlert, ...prev.slice(0, 5)]);
            }
          }}
          isClosable={true}
        />
      )}

    </div>
  );
}
