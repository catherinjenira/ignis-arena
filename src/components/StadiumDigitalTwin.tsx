import React, { useState, useRef, useEffect } from "react";
import { Shield, Activity, Coffee, Music, Compass, AlertTriangle } from "lucide-react";
import { StadiumState, HeatmapType, GodModeMarker } from "../types";

interface StadiumDigitalTwinProps {
  stadiumState: StadiumState;
  heatmapType: HeatmapType;
  markers: GodModeMarker[];
  onUpdateMarkers: (markers: GodModeMarker[]) => void;
  onTriggerRecalculate: (message: string) => void;
  // Halftime Laser & Pyro show props
  laserCount?: number;
  laserColor?: string;
  dryIceActive?: boolean;
  pyroActive?: boolean;
}

export default function StadiumDigitalTwin({
  stadiumState,
  heatmapType,
  markers,
  onUpdateMarkers,
  onTriggerRecalculate,
  laserCount = 0,
  laserColor = "cyan",
  dryIceActive = false,
  pyroActive = false,
}: StadiumDigitalTwinProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [activePulse, setActivePulse] = useState(false);

  // Trigger a momentary visual flare when the state changes
  useEffect(() => {
    setActivePulse(true);
    const t = setTimeout(() => setActivePulse(false), 800);
    return () => clearTimeout(t);
  }, [stadiumState, heatmapType]);

  const handlePointerDown = (id: string, e: React.PointerEvent) => {
    e.preventDefault();
    setDraggedId(id);
    if (svgRef.current) {
      svgRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggedId || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    
    // Scale coordinates to the 800x600 viewBox of our SVG
    const x = Math.max(20, Math.min(780, ((e.clientX - rect.left) / rect.width) * 800));
    const y = Math.max(20, Math.min(580, ((e.clientY - rect.top) / rect.height) * 600));

    onUpdateMarkers(
      markers.map((m) => (m.id === draggedId ? { ...m, x, y } : m))
    );
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggedId) {
      const marker = markers.find((m) => m.id === draggedId);
      if (marker) {
        onTriggerRecalculate(`Relocated ${marker.name} to coordinates [${Math.round(marker.x)}, ${Math.round(marker.y)}]`);
      }
      if (svgRef.current) {
        svgRef.current.releasePointerCapture(e.pointerId);
      }
      setDraggedId(null);
    }
  };

  // Determine heatmap overlay colors and intensities based on stadiumState (Light theme safe, lower alpha, strong stroke)
  const getHeatmapColors = () => {
    switch (heatmapType) {
      case "crowd":
        const crowdLevel = stadiumState.crowdDensity;
        if (crowdLevel > 80) return { fill: "rgba(239, 68, 68, 0.16)", stroke: "#ef4444" };
        if (crowdLevel > 50) return { fill: "rgba(249, 115, 22, 0.14)", stroke: "#f97316" };
        return { fill: "rgba(34, 197, 94, 0.08)", stroke: "#22c55e" };

      case "energy":
        const energyUsage = stadiumState.energyUsage;
        if (energyUsage > 120) return { fill: "rgba(234, 179, 8, 0.14)", stroke: "#eab308" };
        return { fill: "rgba(6, 182, 212, 0.14)", stroke: "#06b6d4" };

      case "emotion":
        const emo = stadiumState.emotionWeather;
        if (emo === "excited") return { fill: "rgba(236, 72, 153, 0.14)", stroke: "#ec4899" };
        if (emo === "panic") return { fill: "rgba(220, 38, 38, 0.18)", stroke: "#dc2626" };
        if (emo === "angry") return { fill: "rgba(185, 28, 28, 0.16)", stroke: "#b91c1c" };
        if (emo === "frustrated") return { fill: "rgba(147, 51, 234, 0.14)", stroke: "#9333ea" };
        return { fill: "rgba(14, 165, 233, 0.1)", stroke: "#0ea5e9" };

      case "emergency":
        return { fill: "rgba(34, 197, 94, 0.08)", stroke: "#22c55e" };
    }
  };

  const overlay = getHeatmapColors();

  // Find Center Stage position dynamically based on marker dragging
  const stageMarker = markers.find((m) => m.type === "stage") || { x: 440, y: 300 };

  const getLaserHexColor = (colorName: string) => {
    switch (colorName) {
      case "cyan": return "#0ea5e9";
      case "rose": return "#f43f5e";
      case "lime": return "#10b981";
      case "gold": return "#eab308";
      case "violet": return "#8b5cf6";
      default: return "#0ea5e9";
    }
  };

  return (
    <div className="relative w-full aspect-[4/3] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl shadow-slate-100/80 group">
      
      {/* Absolute Light Overlay Effect */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,rgba(99,102,241,0.03)_0%,transparent_70%] pointer-events-none" />
      
      {/* Sci-Fi Scanner Lines (Faded for Light theme) */}
      <div className="absolute inset-0 opacity-[0.015] bg-[linear-gradient(rgba(0,0,0,1)_50%,transparent_50%)] bg-[length:100%_4px] pointer-events-none animate-pulse" />

      {/* Title Tag */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono tracking-wider text-slate-100 shadow-md">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
        LIVE TWIN: {heatmapType.toUpperCase()} MODE
      </div>

      {/* Floating Stadium Ambient Mood Tracker */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono shadow-sm">
        <span className="text-slate-500">GLOW PULSE:</span>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
            stadiumState.crowdPulseColor === "red"
              ? "bg-red-50 text-red-700 border border-red-200"
              : stadiumState.crowdPulseColor === "orange"
              ? "bg-orange-50 text-orange-700 border border-orange-200"
              : stadiumState.crowdPulseColor === "green"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-blue-50 text-blue-700 border border-blue-200"
          }`}
        >
          {stadiumState.crowdPulseColor}
        </span>
      </div>

      {/* Recalculating overlay indicator */}
      {activePulse && (
        <div className="absolute inset-0 bg-indigo-500/5 backdrop-blur-[1px] pointer-events-none flex items-center justify-center transition-all duration-300 z-20">
          <div className="bg-slate-900/95 border border-cyan-500/30 px-4 py-2 rounded-xl flex items-center gap-2 shadow-xl">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-mono text-xs text-cyan-400 tracking-widest uppercase">Twin Re-Calibrating...</span>
          </div>
        </div>
      )}

      {/* Interactive Stadium Map */}
      <svg
        id="stadium-digital-twin-svg"
        ref={svgRef}
        viewBox="0 0 800 600"
        className="w-full h-full cursor-crosshair select-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        aria-labelledby="twin-title twin-desc"
      >
        <title id="twin-title">Ignis Arena Live Digital Twin Map</title>
        <desc id="twin-desc">Visualizes real-time crowd density, energy grids, and resource locations on a digital layout of the stadium.</desc>
        {/* Grids */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(148, 163, 184, 0.12)" strokeWidth="1" />
          </pattern>
          <radialGradient id="smokeGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#e2e8f0" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f1f5f9" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="800" height="600" fill="url(#grid)" />

        {/* --- STADIUM ARCHITECTURE (LAYER 1) --- */}
        {/* Parking Lot A */}
        <rect x="50" y="80" width="160" height="120" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
        <text x="130" y="145" fill="#64748b" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">PARKING LOT A</text>

        {/* Parking Lot B */}
        <rect x="50" y="400" width="160" height="120" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
        <text x="130" y="465" fill="#64748b" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">PARKING LOT B</text>

        {/* Parking Lot C (VIP) */}
        <rect x="590" y="400" width="160" height="120" rx="8" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" />
        <text x="670" y="465" fill="#475569" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">VIP PARKING C</text>

        {/* Outer Arena Ring */}
        <ellipse cx="440" cy="300" rx="280" ry="210" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2.5" />
        <ellipse cx="440" cy="300" rx="260" ry="190" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="8 4" />

        {/* --- HEATMAP OVERLAY LAYER (DYNAMIC) --- */}
        <ellipse
          cx="440"
          cy="300"
          rx="250"
          ry="180"
          fill={overlay.fill}
          stroke={overlay.stroke}
          strokeWidth="2"
          className="transition-all duration-700 ease-out"
        />

        {/* Emergency Escape Routes (Bright flashing green arrows) */}
        {heatmapType === "emergency" && (
          <g className="animate-pulse">
            <path d="M 440 200 L 440 100" stroke="#16a34a" strokeWidth="4" markerEnd="url(#arrow)" fill="none" strokeDasharray="6 4" />
            <path d="M 440 400 L 440 500" stroke="#16a34a" strokeWidth="4" markerEnd="url(#arrow)" fill="none" strokeDasharray="6 4" />
            <path d="M 280 300 L 180 300" stroke="#16a34a" strokeWidth="4" markerEnd="url(#arrow)" fill="none" strokeDasharray="6 4" />
            <path d="M 600 300 L 700 300" stroke="#16a34a" strokeWidth="4" markerEnd="url(#arrow)" fill="none" strokeDasharray="6 4" />

            <circle cx="440" cy="110" r="10" fill="none" stroke="#16a34a" strokeWidth="2" className="animate-ping" />
            <circle cx="440" cy="490" r="10" fill="none" stroke="#16a34a" strokeWidth="2" className="animate-ping" />
            <circle cx="190" cy="300" r="10" fill="none" stroke="#16a34a" strokeWidth="2" className="animate-ping" />
            <circle cx="690" cy="300" r="10" fill="none" stroke="#16a34a" strokeWidth="2" className="animate-ping" />
          </g>
        )}

        {/* Solar Roof Grid Overlay */}
        {heatmapType === "energy" && (
          <g opacity="0.4" className="stroke-cyan-600 fill-none" strokeWidth="1">
            <ellipse cx="440" cy="300" rx="275" ry="205" strokeDasharray="2 2" />
            <ellipse cx="440" cy="300" rx="265" ry="195" />
            <line x1="165" y1="300" x2="185" y2="300" strokeWidth="2" />
            <line x1="715" y1="300" x2="695" y2="300" strokeWidth="2" />
            <line x1="440" y1="95" x2="440" y2="115" strokeWidth="2" />
            <line x1="440" y1="505" x2="440" y2="485" strokeWidth="2" />
          </g>
        )}

        {/* Stands (Inner Ring) */}
        <ellipse cx="440" cy="300" rx="210" ry="145" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" />

        {/* Playfield Pitch / Central Arena */}
        <rect x="330" y="210" width="220" height="180" rx="40" fill="#15803d" stroke="#166534" strokeWidth="2.5" opacity="0.9" />
        <rect x="350" y="230" width="180" height="140" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
        <line x1="440" y1="230" x2="440" y2="370" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
        <circle cx="440" cy="300" r="30" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />

        {/* --- INTERACTIVE HALFTIME SHOW DECK GRAPHICS --- */}
        {dryIceActive && (
          <g transform={`translate(${stageMarker.x}, ${stageMarker.y})`} className="pointer-events-none">
            <ellipse cx="0" cy="0" rx="90" ry="70" fill="url(#smokeGradient)" opacity="0.6" className="transition-all duration-500">
              <animate
                attributeName="rx"
                values="80;110;80"
                dur="7s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="ry"
                values="60;85;60"
                dur="7s"
                repeatCount="indefinite"
              />
            </ellipse>
            <circle cx="0" cy="0" r="45" fill="url(#smokeGradient)" opacity="0.4" />
          </g>
        )}

        {laserCount > 0 && (
          <g transform={`translate(${stageMarker.x}, ${stageMarker.y})`} className="pointer-events-none">
            <g>
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0"
                to="360"
                dur="20s"
                repeatCount="indefinite"
              />
              {Array.from({ length: Math.min(laserCount, 12) }).map((_, i) => {
                const countToUse = Math.min(laserCount, 12);
                const angle = (i * 2 * Math.PI) / countToUse;
                const rx = 240;
                const ry = 175;
                const targetX = rx * Math.cos(angle);
                const targetY = ry * Math.sin(angle);
                const hexColor = getLaserHexColor(laserColor);
                return (
                  <g key={i}>
                    <line
                      x1="0"
                      y1="0"
                      x2={targetX}
                      y2={targetY}
                      stroke={hexColor}
                      strokeWidth="2.5"
                      opacity="0.85"
                      strokeDasharray="10 6"
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        values="0;80"
                        dur="3s"
                        repeatCount="indefinite"
                      />
                    </line>
                    <circle
                      cx={targetX}
                      cy={targetY}
                      r="5"
                      fill={hexColor}
                      className="animate-ping"
                    />
                    <circle
                      cx={targetX}
                      cy={targetY}
                      r="2.5"
                      fill="#ffffff"
                    />
                  </g>
                );
              })}
            </g>
          </g>
        )}

        {pyroActive && (
          <g className="animate-pulse pointer-events-none">
            {/* Corner 1 */}
            <circle cx="340" cy="225" r="16" fill="#f97316" opacity="0.8" />
            <circle cx="340" cy="225" r="9" fill="#ef4444" />
            <circle cx="340" cy="225" r="25" fill="none" stroke="#f97316" strokeWidth="2.5" className="animate-ping" />
            
            {/* Corner 2 */}
            <circle cx="540" cy="225" r="16" fill="#f97316" opacity="0.8" />
            <circle cx="540" cy="225" r="9" fill="#ef4444" />
            <circle cx="540" cy="225" r="25" fill="none" stroke="#f97316" strokeWidth="2.5" className="animate-ping" />

            {/* Corner 3 */}
            <circle cx="340" cy="375" r="16" fill="#f97316" opacity="0.8" />
            <circle cx="340" cy="375" r="9" fill="#ef4444" />
            <circle cx="340" cy="375" r="25" fill="none" stroke="#f97316" strokeWidth="2.5" className="animate-ping" />

            {/* Corner 4 */}
            <circle cx="540" cy="375" r="16" fill="#f97316" opacity="0.8" />
            <circle cx="540" cy="375" r="9" fill="#ef4444" />
            <circle cx="540" cy="375" r="25" fill="none" stroke="#f97316" strokeWidth="2.5" className="animate-ping" />
          </g>
        )}

        {/* Stand Labels */}
        <text x="440" y="180" fill="#475569" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">NORTH STAND</text>
        <text x="440" y="430" fill="#475569" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">SOUTH STAND</text>
        <text x="260" y="305" fill="#475569" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold" transform="rotate(-90 260 305)">WEST STAND</text>
        <text x="620" y="305" fill="#475569" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold" transform="rotate(90 620 305)">EAST STAND</text>

        {/* Gates (Exits) */}
        {/* Gate 1 */}
        <g transform="translate(415, 75)" className="cursor-help">
          <rect width="50" height="25" rx="4" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" />
          <text x="25" y="16" fill="#1d4ed8" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">GATE 1</text>
        </g>
        {/* Gate 2 */}
        <g transform="translate(695, 200)" className="cursor-help">
          <rect width="50" height="25" rx="4" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" />
          <text x="25" y="16" fill="#1d4ed8" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">GATE 2</text>
        </g>
        {/* Gate 3 */}
        <g transform="translate(695, 375)" className="cursor-help">
          <rect width="50" height="25" rx="4" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" />
          <text x="25" y="16" fill="#1d4ed8" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">GATE 3</text>
        </g>
        {/* Gate 4 */}
        <g transform="translate(415, 500)" className="cursor-help">
          <rect width="50" height="25" rx="4" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" />
          <text x="25" y="16" fill="#1d4ed8" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">GATE 4</text>
        </g>
        {/* Gate 5 */}
        <g transform="translate(135, 290)" className="cursor-help">
          <rect width="50" height="25" rx="4" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" />
          <text x="25" y="16" fill="#1d4ed8" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">GATE 5</text>
        </g>

        {/* F&B Kiosks */}
        <g transform="translate(260, 120)">
          <circle r="12" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
          <text y="3" fill="#334155" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">F1</text>
        </g>
        <g transform="translate(620, 120)">
          <circle r="12" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
          <text y="3" fill="#334155" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">F2</text>
        </g>
        <g transform="translate(620, 480)">
          <circle r="12" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
          <text y="3" fill="#334155" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">F3</text>
        </g>
        <g transform="translate(260, 480)">
          <circle r="12" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
          <text y="3" fill="#334155" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">F4</text>
        </g>

        {/* Crowd Dots (Representing dynamic people density on heatmap modes) */}
        {stadiumState.crowdDensity > 30 && (
          <g opacity="0.8">
            <circle cx="440" cy="115" r="3" fill="#475569" />
            <circle cx="425" cy="120" r="2.5" fill="#475569" />
            <circle cx="455" cy="125" r="3" fill="#64748b" />
            <circle cx="430" cy="485" r="3" fill="#475569" />
            <circle cx="445" cy="490" r="2.5" fill="#64748b" />
            <circle cx="340" cy="170" r="3" fill="#64748b" />
            <circle cx="360" cy="165" r="2.5" fill="#475569" />
            <circle cx="510" cy="165" r="3.5" fill="#ef4444" className="animate-pulse" />
            <circle cx="530" cy="175" r="2" fill="#475569" />
            <circle cx="300" cy="220" r="3" fill="#64748b" />
            <circle cx="280" cy="380" r="3.5" fill="#64748b" />
            <circle cx="580" cy="240" r="2.5" fill="#475569" />
            <circle cx="600" cy="360" r="3" fill="#475569" />
          </g>
        )}

        {/* Emergency Disaster indicators */}
        {stadiumState.emotionWeather === "panic" && (
          <g>
            <circle cx="440" cy="300" r="230" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="5 5" className="animate-spin" style={{ transformOrigin: '440px 300px', animationDuration: '20s' }} />
            <g transform="translate(425, 270)">
              <rect width="30" height="30" rx="6" fill="#ef4444" className="animate-pulse" />
              <path d="M 440 282 L 440 288 M 440 292 L 440 292" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <text x="15" y="20" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">⚠️</text>
            </g>
          </g>
        )}

        {/* --- GOD MODE INTERACTIVE DRAGGABLE MARKERS --- */}
        {markers.map((marker) => {
          const isSelected = draggedId === marker.id;
          
          return (
            <g
              key={marker.id}
              transform={`translate(${marker.x}, ${marker.y})`}
              className="cursor-grab active:cursor-grabbing group/marker"
              onPointerDown={(e) => handlePointerDown(marker.id, e)}
              role="application"
              tabIndex={0}
              aria-label={`Draggable marker for ${marker.label}`}
            >
              <circle
                r={isSelected ? "25" : "18"}
                fill="none"
                stroke={
                  marker.type === "security"
                    ? "#2563eb"
                    : marker.type === "medical"
                    ? "#dc2626"
                    : marker.type === "food"
                    ? "#ca8a04"
                    : "#7c3aed"
                }
                strokeWidth="1.5"
                className="animate-ping opacity-60"
                style={{ animationDuration: isSelected ? '1s' : '2s' }}
              />

              <circle
                r="15"
                fill="#ffffff"
                stroke={
                  marker.type === "security"
                    ? "#2563eb"
                    : marker.type === "medical"
                    ? "#dc2626"
                    : marker.type === "food"
                    ? "#ca8a04"
                    : "#7c3aed"
                }
                strokeWidth={isSelected ? "3.5" : "2"}
                className="shadow-md transition-transform duration-200 group-hover/marker:scale-110"
              />

              <g transform="translate(-8, -8)" className="pointer-events-none">
                {marker.type === "security" && (
                  <Shield size={16} className="text-blue-600" />
                )}
                {marker.type === "medical" && (
                  <Activity size={16} className="text-red-600" />
                )}
                {marker.type === "food" && (
                  <Coffee size={16} className="text-yellow-600" />
                )}
                {marker.type === "stage" && (
                  <Music size={16} className="text-purple-600" />
                )}
              </g>

              {/* Floating Name Bubble */}
              <g transform="translate(0, -26)" className="opacity-0 group-hover/marker:opacity-100 transition-opacity pointer-events-none duration-150">
                <rect x="-60" y="-12" width="120" height="18" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                <text y="0" fill="#ffffff" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  {marker.label}
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      <svg className="absolute w-0 h-0">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#16a34a" />
          </marker>
        </defs>
      </svg>

      {/* Drag & Drop Assist Indicator at bottom */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 bg-slate-900/95 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-800 text-[10px] font-mono tracking-wider text-slate-100 shadow-xl flex items-center gap-2">
        <Compass size={12} className="text-indigo-400 animate-spin" style={{ animationDuration: '8s' }} />
        <span>⚡ GOD MODE ACTIVE: DRAG MARKERS ON THE TWIN MAP TO SHIFT SECURITY, FIRST AID & HUBS</span>
      </div>
    </div>
  );
}
