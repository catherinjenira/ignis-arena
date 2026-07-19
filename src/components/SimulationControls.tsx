import React, { useState } from "react";
import {
  Leaf,
  Film,
  Compass,
  Sparkles,
  Ticket,
  UserCheck,
  Zap,
  Globe,
  Timer,
  Sliders,
  SendHorizontal
} from "lucide-react";
import { FullSimulationResult, StadiumState } from "../types";

interface SimulationControlsProps {
  simulationResult: FullSimulationResult | null;
  onRunTemplate: (templateType: string, promptText: string) => void;
  onCustomPromptSubmit: (text: string) => void;
  isLoading: boolean;
  onUpdateFutureState: (futureOffsetMinutes: number) => void;
}

export default function SimulationControls({
  simulationResult,
  onRunTemplate,
  onCustomPromptSubmit,
  isLoading,
  onUpdateFutureState,
}: SimulationControlsProps) {
  const [customPrompt, setCustomPrompt] = useState("");
  const [futureTimeOffset, setFutureTimeOffset] = useState(0); // Offset in minutes
  const [activeDetailsTab, setActiveDetailsTab] = useState<"green" | "movie" | "whatif" | "vip">("green");

  const templates = [
    {
      label: "🏆 Host FIFA Final",
      type: "host_event",
      prompt: "Host the World Cup Final tomorrow for 75,000 people with high eco-friendly logistics, crowd pulse glowing blue, and maximum solar power pre-charge.",
    },
    {
      label: "🌦 Simulate Rainstorm",
      type: "disaster",
      prompt: "Heavy rainfall alert at halftime. Solar power offline. Crowd shifts to covered stands. Food queues peak.",
    },
    {
      label: "🚨 Earthquake Emergency",
      type: "disaster",
      prompt: "Emergency Earthquake evacuation. Gates open immediately, triage set in Parking B, announcements active.",
    },
    {
      label: "⚽ Captain Injured",
      type: "what_if",
      prompt: "What happens if the team captain gets injured during the final?",
    },
    {
      label: "🔌 Power Outage Halftime",
      type: "what_if",
      prompt: "What if critical power fails at halftime? Initiate emergency backup generators and safety guidance.",
    },
    {
      label: "🌱 Max Green Optimization",
      type: "optimize",
      prompt: "Optimize energy grid, water recycling, and trash waste collection to target maximum sustainability score.",
    }
  ];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPrompt.trim()) {
      onCustomPromptSubmit(customPrompt);
    }
  };

  const handleFutureSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setFutureTimeOffset(value);
    onUpdateFutureState(value);
  };

  // Extract variables for rendering
  const greenScores = simulationResult?.stadiumState?.greenScores || {
    carbon: 82,
    energy: 88,
    water: 91,
    waste: 79
  };

  const movieReport = simulationResult?.movieDirectorReport || {
    trailerConcept: "Cinematic twilight sweep of Ignis Arena lighting turning on, slow-motion player entrances.",
    highlights: ["Opening pre-match pyro show", "Main striker crucial diving defensive header", "Injury-time game winning bicycle kick"],
    documentaryTheme: "How digital intelligence orchestrated a major world-class cup final without a hitch.",
    reelsConcept: "Flickering neon fans, holographic stadium digital twin, and slow-mo crowd reaction pulse!"
  };

  const whatIfAnalysis = simulationResult?.whatIfAnalysis || {
    sponsorImpact: "Interactive digital boards adjust instantly, maximizing ad yields during high-tension scenarios.",
    scheduleImpact: "Tournament schedule remains unaffected with emergency reserve slots pre-blocked.",
    medicalImpact: "Fast paramedic triage ready at Zone B to assist with any stand incidents within 40 seconds.",
    securityAdjustments: "Rerouting security teams to Gate perimeters to handle crowd shifts.",
    alternativeCoverage: "Drone camera perimeters deployed automatically to capture action safely."
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* 1. PROMPT / CHIPS CONTAINER */}
      <div className="bg-slate-900/40 rounded-2xl border border-slate-800/80 p-5 shadow-xl relative overflow-hidden">
        
        {/* Floating background glowing orb */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-500/10 blur-xl rounded-full pointer-events-none" />

        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-cyan-400" />
          <h3 className="text-xs font-mono font-bold tracking-widest text-slate-300">
            IGNIS ARENA INTELLIGENCE COMMAND PROMPT
          </h3>
        </div>

        {/* Templates Scroll Chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {templates.map((t) => (
            <button
              key={t.label}
              onClick={() => onRunTemplate(t.type, t.prompt)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium border border-slate-800 bg-slate-950/80 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-400 transition-all duration-200 disabled:opacity-50"
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Custom Input Bar */}
        <form onSubmit={handleCustomSubmit} className="relative">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            disabled={isLoading}
            placeholder='Ask Ignis Arena anything, e.g., "What if power fails at halftime?" or "Host Champions League with green power..."'
            className="w-full bg-slate-950/90 border border-slate-800 focus:border-cyan-500/60 rounded-xl px-4 py-3.5 pr-12 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all duration-200 shadow-inner font-sans"
          />
          <button
            type="submit"
            disabled={isLoading || !customPrompt.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white transition-colors cursor-pointer"
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-slate-300 border-t-white rounded-full animate-spin" />
            ) : (
              <SendHorizontal size={16} />
            )}
          </button>
        </form>
      </div>

      {/* 2. FUTURE VISION TIME-MACHINE SLIDER */}
      <div className="bg-slate-900/40 rounded-2xl border border-slate-800/80 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Timer size={16} className="text-pink-400 animate-pulse" />
            <h3 className="text-xs font-mono font-bold tracking-widest text-slate-300">
              FUTURE VISION TIME-MACHINE
            </h3>
          </div>
          <span className="text-xs font-mono text-pink-400 font-bold bg-pink-950/40 border border-pink-900/30 px-2 py-0.5 rounded">
            {futureTimeOffset === 0 ? "LIVE STATE" : `+${futureTimeOffset} MINUTES`}
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed font-sans">
          Slide to peek into the future stadium state. Crowd densities, parking occupancy, energy storage, and food queue wait times recalculate dynamically.
        </p>

        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono text-slate-500">NOW</span>
          <input
            type="range"
            min="0"
            max="60"
            step="15"
            value={futureTimeOffset}
            onChange={handleFutureSliderChange}
            className="w-full accent-pink-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-[10px] font-mono text-slate-500">+1 HOUR</span>
        </div>

        {/* Dynamic telemetry predictions based on slider */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-900 text-center">
            <div className="text-[9px] font-mono text-slate-500">CROWDS</div>
            <div className="text-xs font-bold font-mono text-slate-300 mt-0.5">
              {futureTimeOffset === 0 ? "Nominal" : futureTimeOffset === 15 ? "+12% Growth" : futureTimeOffset === 30 ? "Peak Flow" : "Dispersing"}
            </div>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-900 text-center">
            <div className="text-[9px] font-mono text-slate-500">QUEUES</div>
            <div className="text-xs font-bold font-mono text-slate-300 mt-0.5">
              {futureTimeOffset === 0 ? "9-12 Min" : futureTimeOffset === 15 ? "15 Min" : futureTimeOffset === 30 ? "18 Min (Peak)" : "4 Min"}
            </div>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-900 text-center">
            <div className="text-[9px] font-mono text-slate-500">GRID RESERVES</div>
            <div className="text-xs font-bold font-mono text-slate-300 mt-0.5">
              {futureTimeOffset === 0 ? "95%" : futureTimeOffset === 15 ? "88%" : futureTimeOffset === 30 ? "81%" : "74% (Safe)"}
            </div>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-900 text-center">
            <div className="text-[9px] font-mono text-slate-500">EMOTION WEATHER</div>
            <div className="text-xs font-bold font-mono text-slate-300 mt-0.5">
              {futureTimeOffset === 0 ? "Calm" : "Excitement Peak"}
            </div>
          </div>
        </div>
      </div>

      {/* 3. MULTI-TAB DETAILS HUB (Green, Movie, What If, VIP/Ticket) */}
      <div className="bg-slate-900/40 rounded-2xl border border-slate-800/80 p-5 shadow-xl flex flex-col h-full min-h-[300px]">
        
        {/* Tab Headers */}
        <div className="flex border-b border-slate-800/80 pb-2 mb-4 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveDetailsTab("green")}
            className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold tracking-wider flex items-center gap-1.5 whitespace-nowrap transition-all duration-200 border ${
              activeDetailsTab === "green"
                ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30"
                : "bg-transparent text-slate-500 border-transparent hover:text-slate-300"
            }`}
          >
            <Leaf size={12} />
            GREEN METRICS
          </button>
          
          <button
            onClick={() => setActiveDetailsTab("movie")}
            className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold tracking-wider flex items-center gap-1.5 whitespace-nowrap transition-all duration-200 border ${
              activeDetailsTab === "movie"
                ? "bg-purple-950/40 text-purple-400 border-purple-500/30"
                : "bg-transparent text-slate-500 border-transparent hover:text-slate-300"
            }`}
          >
            <Film size={12} />
            AI MOVIE DIRECTOR
          </button>

          <button
            onClick={() => setActiveDetailsTab("whatif")}
            className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold tracking-wider flex items-center gap-1.5 whitespace-nowrap transition-all duration-200 border ${
              activeDetailsTab === "whatif"
                ? "bg-amber-950/40 text-amber-400 border-amber-500/30"
                : "bg-transparent text-slate-500 border-transparent hover:text-slate-300"
            }`}
          >
            <Compass size={12} />
            SCENARIO IMPACTS
          </button>

          <button
            onClick={() => setActiveDetailsTab("vip")}
            className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold tracking-wider flex items-center gap-1.5 whitespace-nowrap transition-all duration-200 border ${
              activeDetailsTab === "vip"
                ? "bg-cyan-950/40 text-cyan-400 border-cyan-500/30"
                : "bg-transparent text-slate-500 border-transparent hover:text-slate-300"
            }`}
          >
            <Ticket size={12} />
            VIP & TICKETS
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 flex flex-col justify-between">
          
          {/* TAB 1: GREEN SCORE */}
          {activeDetailsTab === "green" && (
            <div className="animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-slate-400">Sustainability Score Ledger</span>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/40">
                  NET ZERO TARGET ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                    <span>CARBON</span>
                    <Globe size={11} className="text-emerald-500" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
                    {greenScores.carbon}%
                  </div>
                  <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-emerald-400 h-full" style={{ width: `${greenScores.carbon}%` }} />
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                    <span>ENERGY</span>
                    <Zap size={11} className="text-amber-500" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-amber-400 mt-2">
                    {greenScores.energy}%
                  </div>
                  <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-amber-400 h-full" style={{ width: `${greenScores.energy}%` }} />
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                    <span>WATER</span>
                    <Sliders size={11} className="text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-blue-400 mt-2">
                    {greenScores.water}%
                  </div>
                  <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-blue-400 h-full" style={{ width: `${greenScores.water}%` }} />
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                    <span>RECYCLING</span>
                    <Leaf size={11} className="text-teal-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-teal-400 mt-2">
                    {greenScores.waste}%
                  </div>
                  <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-teal-400 h-full" style={{ width: `${greenScores.waste}%` }} />
                  </div>
                </div>
              </div>

              <p className="text-[10px] font-mono text-slate-500 mt-4 leading-normal">
                🍃 Ignis Arena utilizes piezo-electric floor panels, rainwater collectors, and a 2,400 kW high-output solar glass dome roof to run operations entirely grid-independent.
              </p>
            </div>
          )}

          {/* TAB 2: MOVIE DIRECTOR */}
          {activeDetailsTab === "movie" && (
            <div className="space-y-3 animate-fadeIn">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900">
                <span className="text-[10px] font-mono text-slate-500 uppercase block tracking-wider">AI Generated Trailer Concept</span>
                <p className="text-xs text-slate-300 mt-1 italic leading-relaxed">
                  "{movieReport.trailerConcept}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block tracking-wider">Documentary Theme</span>
                  <p className="text-xs text-slate-300 mt-1 font-medium">{movieReport.documentaryTheme}</p>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block tracking-wider">Instagram Reel Outline</span>
                  <p className="text-xs text-slate-300 mt-1 font-medium">{movieReport.reelsConcept}</p>
                </div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900">
                <span className="text-[10px] font-mono text-slate-500 uppercase block tracking-wider">Selected Highlight Frames</span>
                <div className="flex gap-2 mt-1.5">
                  {movieReport.highlights.map((hl, i) => (
                    <span key={i} className="text-[10px] font-mono bg-purple-950/30 text-purple-300 border border-purple-900/40 px-2 py-0.5 rounded truncate">
                      🎥 {hl}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SCENARIO WHAT-IF IMPACTS */}
          {activeDetailsTab === "whatif" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fadeIn">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900">
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase block tracking-wider">Sponsor Ad Adjustments</span>
                <p className="text-xs text-slate-300 mt-1 leading-normal">{whatIfAnalysis.sponsorImpact}</p>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900">
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase block tracking-wider">Schedule & Run-time Delay</span>
                <p className="text-xs text-slate-300 mt-1 leading-normal">{whatIfAnalysis.scheduleImpact}</p>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900">
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase block tracking-wider">Medical Response Strategy</span>
                <p className="text-xs text-slate-300 mt-1 leading-normal">{whatIfAnalysis.medicalImpact}</p>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900">
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase block tracking-wider">Security Warden Redirection</span>
                <p className="text-xs text-slate-300 mt-1 leading-normal">{whatIfAnalysis.securityAdjustments}</p>
              </div>
            </div>
          )}

          {/* TAB 4: VIP & LIVING TICKET */}
          {activeDetailsTab === "vip" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
              
              {/* Living Ticket Widget */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950/30 p-4 rounded-xl border border-slate-800 flex flex-col justify-between relative overflow-hidden shadow-lg">
                <div className="absolute top-2 right-2 opacity-10">
                  <Ticket size={64} />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800/40 px-2 py-0.5 rounded uppercase">
                      Living AI Ticket
                    </span>
                    <h4 className="text-xs font-bold text-slate-100 font-mono mt-2">GATE 3 SEAT 44B</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-mono text-slate-500 block">STATUS</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">ACTIVE</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-800 my-3" />

                <div className="space-y-1 text-[10px] font-mono text-slate-400">
                  <div className="flex justify-between">
                    <span>Nearest Washroom:</span>
                    <span className="text-slate-300">West Wing Corridor [30m]</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Queue at Stall 1:</span>
                    <span className="text-yellow-400">2 min wait time</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pre-order ready:</span>
                    <span className="text-emerald-400">Ready at Kiosk F2</span>
                  </div>
                </div>
              </div>

              {/* VIP AI Concierge Widget */}
              <div className="bg-gradient-to-br from-slate-900 to-purple-950/30 p-4 rounded-xl border border-slate-800 flex flex-col justify-between relative overflow-hidden shadow-lg">
                <div className="absolute top-2 right-2 opacity-10">
                  <UserCheck size={64} />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-mono bg-purple-950 text-purple-400 border border-purple-800/40 px-2 py-0.5 rounded uppercase">
                      VIP AI Concierge
                    </span>
                    <h4 className="text-xs font-bold text-slate-100 font-mono mt-2">Celebrity Escort Route</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-mono text-slate-500 block">RISK INDEX</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">0.02%</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-800 my-3" />

                <div className="space-y-1 text-[10px] font-mono text-slate-400">
                  <div className="flex justify-between">
                    <span>Rerouted Path:</span>
                    <span className="text-slate-300">Underground Tunnel Escort B</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lounge Entry:</span>
                    <span className="text-slate-300">Biometric Secured - Door 5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bodyguard Sync:</span>
                    <span className="text-purple-400">AI Drone Escort 07 Connected</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
