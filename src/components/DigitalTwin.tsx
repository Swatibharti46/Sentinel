/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Shield, Eye, HeartPulse, Activity, AlertTriangle, HelpCircle, CornerDownRight, CheckCircle2, Camera, Cpu, Layers, Tv, Sparkles, PlayCircle, Wand2 } from "lucide-react";
import { StadiumZone, LocationType, GateStatus, SafetyIncident } from "../types";

interface DigitalTwinProps {
  zones: StadiumZone[];
  activeIncident: SafetyIncident | null;
  onSelectZone: (zone: StadiumZone) => void;
  selectedZone: StadiumZone | null;
  blockedGates: string[];
  congestedGates: string[];
  simulationMinutes: number; // 0 (now), 1, 5, 10
  showHeatmap: boolean;
  evacuationActive: boolean;
  speakText: (text: string) => void;
  visibleLayers?: string[]; // ["crowd", "security", "medical", "ticketing", "exit_routes", "risk_zones"]
  onToggleGate?: (gateId: string) => void;
  onToggleCongestion?: (gateId: string) => void;
  onToggleEvacuation?: () => void;
}

interface MovingCrowdParticle {
  id: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
  speed: number;
  color: string;
}

const CAMERAS = [
  {
    id: "CAM_01",
    name: "CAM_01: Gate A Ingress",
    location: "Gate A Arena Entrance",
    zoneId: "GATE_A",
    status: "Fluid Dynamic Flow",
    risk: "Low (12% index)",
    streamType: "THERMAL IMAGING SCAN",
    prediction: "Spectator queues stable at Ticket Check 3. Dynamic ingress density is nominal.",
    plan: "Suggestion: Initiate auxiliary stanchion corridor lane 2 to avoid standard bunching.",
  },
  {
    id: "CAM_02",
    name: "CAM_02: Stand B Pavilion",
    location: "Lower Stand B Seats",
    zoneId: "STAND_B",
    status: "Steady Crowd Flow",
    risk: "Nominal (18% index)",
    streamType: "OPTICAL FLOW CALCULATION",
    prediction: "Row 12 aisle blocks clear. Staircase capacity flow rates remain nominal.",
    plan: "Suggestion: High-density standby; advise stand stewards to remain visible at exits.",
  },
  {
    id: "CAM_03",
    name: "CAM_03: Food Oasis Concourse",
    location: "Main Food Oasis Hub",
    zoneId: "FOOD_OASIS",
    status: "Corridor Congestion",
    risk: "Elevated (45% index)",
    streamType: "INFRA RED BODY SIGNATURE",
    prediction: "Crowds lingering near kiosk stands. Slower spectator velocity matches projection curves.",
    plan: "Suggestion: Rotate signage loop to divert approaching viewers to Side Stall Plaza D.",
  },
  {
    id: "CAM_04",
    name: "CAM_04: Gate B Stiles",
    location: "South Gate B Stiles",
    zoneId: "GATE_B",
    status: "High Jam Pressure",
    risk: "Critical (75% index)",
    streamType: "AI DENSITY VECTOR MAP",
    prediction: "Back pressure rising rapidly. Blockage forecasted at exit corridors within 4 minutes.",
    plan: "Suggestion: Unlock Gate C backup gates. Send automated PA directing spectators east.",
  },
  {
    id: "CAM_05",
    name: "CAM_05: West Promenade / VIP",
    location: "VIP Main Stand Plaza",
    zoneId: "VIP_PLAZA",
    status: "Staged Egress",
    risk: "Low (15% index)",
    streamType: "RADAR SPECTRAL GRAPH",
    prediction: "Egress velocity calculated at 1.45m/s. Clear walkways. Zero obstacles diagnosed.",
    plan: "Suggestion: Maintain standby routing, continue scheduling airport transit shuttles.",
  },
];

export default function DigitalTwin({
  zones,
  activeIncident,
  onSelectZone,
  selectedZone,
  blockedGates,
  congestedGates,
  simulationMinutes,
  showHeatmap,
  evacuationActive,
  speakText,
  visibleLayers = ["crowd", "security", "medical", "ticketing", "exit_routes", "risk_zones"],
  onToggleGate,
  onToggleCongestion,
  onToggleEvacuation
}: DigitalTwinProps) {
  const [particles, setParticles] = useState<MovingCrowdParticle[]>([]);
  const [splitScreen, setSplitScreen] = useState<boolean>(false);
  const [hoveredZone, setHoveredZone] = useState<StadiumZone | null>(null);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("CAM_01");
  const [planExecutedId, setPlanExecutedId] = useState<string | null>(null);

  // Operator Simulation Sliders State
  const [crowdScaler, setCrowdScaler] = useState<number>(1.0);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);

  // Link selected zone changes to focus the camera
  useEffect(() => {
    if (selectedZone) {
      const match = CAMERAS.find(c => c.zoneId === selectedZone.id);
      if (match && match.id !== selectedCameraId) {
        setSelectedCameraId(match.id);
      }
    }
  }, [selectedZone]);

  // Initialize crowd particles animating in stands and corridors
  useEffect(() => {
    const tempParticles: MovingCrowdParticle[] = [];
    let idCounter = 0;

    zones.forEach(zone => {
      // Create particles based on current crowd size multiplied by crowdScaler
      const count = Math.min(Math.ceil((zone.currentCrowd * crowdScaler) / 700), 32);
      for (let i = 0; i < count; i++) {
        // Random distribution inside radius or box
        let px = zone.cx;
        let py = zone.cy;
        const rad = zone.radius || 35;

        // Polar distribution
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * rad * 0.8;
        px += Math.cos(angle) * distance;
        py += Math.sin(angle) * distance;

        // Assign green, yellow, red based on risk
        let color = "#10b981"; // safe green
        if (zone.riskFactor > 0.6 || congestedGates.includes(zone.id) || blockedGates.includes(zone.id)) {
          color = "#ef4444"; // red
        } else if (zone.riskFactor > 0.25 || zone.id === "FOOD_OASIS") {
          color = "#f59e0b"; // yellow
        }

        tempParticles.push({
          id: idCounter++,
          startX: px,
          startY: py,
          targetX: px,
          targetY: py,
          currentX: px,
          currentY: py,
          speed: 0.5 + Math.random() * 1.5,
          color
        });
      }
    });

    setParticles(tempParticles);
  }, [zones, blockedGates, congestedGates, crowdScaler]);

  // Tick the animation of the particles moving along routing lanes if evacuation is active
  useEffect(() => {
    let timer: any;
    if (evacuationActive) {
      timer = setInterval(() => {
        setParticles(prev =>
          prev.map(p => {
            // Find nearby exit
            let tx = p.targetX;
            let ty = p.targetY;

            // If evacuating, drift particles outwards to safe exit gates (A, C, D)
            const exitGates = zones.filter(
              z => z.type === LocationType.GATE && !blockedGates.includes(z.id)
            );

            if (exitGates.length > 0) {
              // Find closest non-blocked gate
              let closest = exitGates[0];
              let minDist = Math.hypot(p.currentX - closest.cx, p.currentY - closest.cy);
              for (const g of exitGates) {
                const d = Math.hypot(p.currentX - g.cx, p.currentY - g.cy);
                if (d < minDist) {
                  minDist = d;
                  closest = g;
                }
              }

              // Set target near exit gate with some jitter
              tx = closest.cx + (Math.random() * 30 - 15);
              ty = closest.cy + (Math.random() * 20 - 10);
            }

            // Move current towards target
            const dx = tx - p.currentX;
            const dy = ty - p.currentY;
            const dist = Math.hypot(dx, dy);

            let newX = p.currentX;
            let newY = p.currentY;

            if (dist > 8) {
              // Drift with speedMultiplier
              newX += (dx / dist) * p.speed * 1.8 * speedMultiplier;
              newY += (dy / dist) * p.speed * 1.8 * speedMultiplier;
            } else {
              // Reset near stands or exits for continuous flow simulation
              newX = 500 + (Math.random() * 120 - 60);
              newY = 400 + (Math.random() * 120 - 60);
            }

            return {
              ...p,
              currentX: newX,
              currentY: newY,
              targetX: tx,
              targetY: ty
            };
          })
        );
      }, 50);
    } else {
      // Idle micro jitter animation to simulate standing/restless sporting crowd
      timer = setInterval(() => {
        setParticles(prev =>
          prev.map(p => {
            const rx = p.currentX + (Math.random() * 2 - 1) * speedMultiplier;
            const ry = p.currentY + (Math.random() * 2 - 1) * speedMultiplier;
            return {
              ...p,
              currentX: rx,
              currentY: ry
            };
          })
        );
      }, 100);
    }

    return () => clearInterval(timer);
  }, [evacuationActive, zones, blockedGates, speedMultiplier]);

  // Helper to render stadium SVG map for either live or projected view
  const renderStadiumMapSVG = (isFutureView: boolean) => {
    // Project future hazards/roles state if requested
    const mappedZones = zones.map(z => {
      if (isFutureView) {
        let fRisk = z.riskFactor;
        let fCrowd = z.currentCrowd;

        // In 5 mins, active incidents expand in risk factor
        if (activeIncident) {
          if (z.id === activeIncident.zoneId) {
            fRisk = Math.min(z.riskFactor + 0.35, 1.0);
            fCrowd = Math.round(z.currentCrowd * 1.3);
          } else if (z.id === "GATE_B" || z.id === "FOOD_OASIS" || z.id === "GATE_C") {
            fRisk = Math.min(z.riskFactor + 0.2, 0.95);
            fCrowd = Math.round(z.currentCrowd * 1.2);
          }
        } else {
          // Normal drifts or simulated slide forward
          if (z.id === "GATE_B" || z.id === "FOOD_OASIS") {
            fRisk = Math.min(z.riskFactor + 0.25, 0.9);
            fCrowd = Math.round(z.currentCrowd * 1.15);
          }
        }
        return {
          ...z,
          riskFactor: fRisk,
          currentCrowd: fCrowd,
          statusText: "[AI PROJECTION Model P-60]: Overload expected in +5 minutes."
        };
      }
      return z;
    });

    const activeBlocked = blockedGates;
    const activeCongested = isFutureView
      ? Array.from(new Set([...congestedGates, "GATE_B", "GATE_C", "FOOD_OASIS"]))
      : congestedGates;

    return (
      <svg
        viewBox="0 0 1000 800"
        className={`w-full h-full text-slate-400 select-none ${isFutureView ? "bg-[#04040a]" : "bg-[#050507]"}`}
      >
        <defs>
          <radialGradient id={`heat_cri-${isFutureView ? "future" : "live"}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff4444" stopOpacity={isFutureView ? 0.85 : 0.75} />
            <stop offset="60%" stopColor="#ff4444" stopOpacity={isFutureView ? 0.4 : 0.3} />
            <stop offset="100%" stopColor="#ff4444" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`heat_con-${isFutureView ? "future" : "live"}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f27d26" stopOpacity={isFutureView ? 0.75 : 0.65} />
            <stop offset="70%" stopColor="#f27d26" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#f27d26" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`heat_saf-${isFutureView ? "future" : "live"}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00ff00" stopOpacity="0.4" />
            <stop offset="80%" stopColor="#00ff00" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#00ff00" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#00d4ff" floodOpacity="0.5"/>
          </filter>
          <filter id="red-glow">
            <feDropShadow dx="0" dy="0" stdDeviation="7" floodColor="#ff4444" floodOpacity="0.8"/>
          </filter>
          <filter id="cyan-glow">
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#00ffff" floodOpacity="0.6"/>
          </filter>
        </defs>

        {/* BACKGROUND LAYOUT: Outer Grounds boundary */}
        <rect x="10" y="10" width="980" height="780" rx="16" fill="none" stroke={isFutureView ? "#1c3242" : "#1a1a24"} strokeWidth="2" strokeDasharray="6 4" />

        {/* PARKING AREAS */}
        <g id="zone_parking_blue" className="opacity-30">
          <rect x="50" y="50" width="220" height="80" rx="8" fill="#11111a" stroke="#1e1e2d" />
          <text x="160" y="95" textAnchor="middle" fill="#555566" className="font-mono text-xs tracking-wide uppercase">Lot Blue Egress</text>
        </g>
        <g id="zone_parking_green" className="opacity-30">
          <rect x="730" y="670" width="220" height="80" rx="8" fill="#11111a" stroke="#1e1e2d" />
          <text x="840" y="715" textAnchor="middle" fill="#555566" className="font-mono text-xs tracking-wide uppercase">Lot Green Egress</text>
        </g>

        {/* FIELD & PITCH */}
        <circle cx="500" cy="400" r="280" fill="#08080f" stroke={isFutureView ? "#0c1f2e" : "#1c1c28"} strokeWidth="3" />
        <circle cx="500" cy="400" r="278" fill="none" stroke={isFutureView ? "#00ffff" : "#00d4ff"} strokeWidth="1" strokeDasharray="4 8" className="opacity-20" />
        <circle cx="500" cy="400" r="210" fill="#040407" stroke="#1e1e2d" strokeWidth="1" strokeDasharray="3 3" />
        <rect x="475" y="360" width="50" height="80" fill="#0c0d12" stroke={isFutureView ? "#00ffff" : "#00d4ff"} strokeWidth="1.5" className="opacity-70" />
        <line x1="500" y1="365" x2="500" y2="435" stroke="#1e1e2d" strokeWidth="1" />
        <text x="500" y="270" textAnchor="middle" className="fill-slate-700 uppercase font-bold text-[9px] tracking-widest font-mono">Boundary Fence Limit</text>
        <text x="500" y="490" textAnchor="middle" className="fill-slate-650 font-medium text-[11px] tracking-[0.2em] font-mono">Modi Stadium Pitch</text>

        {/* HUD META TEXT LAYER */}
        <g className="opacity-85 pointer-events-none">
          <rect x="35" y="35" width="290" height="120" rx="6" fill="#030308" stroke={isFutureView ? "#00e5ff/30" : "#1e1e2d"} strokeWidth="1.5" />
          <text x="50" y="62" fill={isFutureView ? "#00ffff" : "#00ff00"} className="font-mono text-[12px] uppercase font-bold tracking-widest">
            {isFutureView ? "■ SYSTEM PROJECTION: T-SURGE" : "■ LIVE TELEMETRY: REAL-TIME"}
          </text>
          <text x="50" y="82" fill="#64748b" className="font-mono text-[9px] uppercase tracking-wider">
            {isFutureView ? "INDEX FORECAST MODE: +5.0 MIN" : "SURVEILLANCE MODE: STABLE"}
          </text>
          <circle cx="53" cy="110" r="4.5" fill={isFutureView ? "#ff3333" : "#3b82f6"} className={isFutureView ? "animate-pulse" : ""} />
          <text x="67" y="113" fill={isFutureView ? "#ff6b6b" : "#94a3b8"} className="font-mono text-[9px] uppercase font-semibold">
            {isFutureView ? "WARNING: BOTTLE-NECK PROJECTION" : "MONITOR SYSTEM METRICS NORMAL"}
          </text>
          <text x="50" y="138" fill="#475569" className="font-mono text-[8px] uppercase">
            {isFutureView ? "TRANSFORMER ACC_INDEX: 94.2%" : "COORDINATE FLOW SCANNING: READY"}
          </text>
        </g>

        {/* HEATMAP LAYER */}
        {showHeatmap && visibleLayers.includes("risk_zones") && (
          <g id="heatmap_overlay" className="pointer-events-none transition-all duration-500">
            {mappedZones.map(zone => {
              let grad = `heat_saf-${isFutureView ? "future" : "live"}`;
              let r = (zone.radius || 50) * 1.6;
              const isCrit = zone.id === activeIncident?.zoneId || zone.riskFactor > 0.65 || blockedGates.includes(zone.id);
              const isCong = zone.riskFactor > 0.25 || activeCongested.includes(zone.id) || zone.id === "FOOD_OASIS";

              if (isCrit) {
                grad = `heat_cri-${isFutureView ? "future" : "live"}`;
                r = (zone.radius || 50) * (isFutureView ? 2.6 : 2.3);
              } else if (isCong) {
                grad = `heat_con-${isFutureView ? "future" : "live"}`;
                r = (zone.radius || 50) * (isFutureView ? 2.1 : 1.9);
              }

              return (
                <circle
                  key={`heat-${zone.id}-${isFutureView ? "f" : "l"}`}
                  cx={zone.cx}
                  cy={zone.cy}
                  r={r}
                  fill={`url(#${grad})`}
                />
              );
            })}
          </g>
        )}

        {/* INTERACTIVE ZONES & STRUCTURAL UNITS */}
        <g id="stadium_zone_elements">
          {mappedZones.map(zone => {
            const isSelected = selectedZone?.id === zone.id;
            const isCrit = zone.id === activeIncident?.zoneId || zone.riskFactor > 0.65;
            const isCongested = activeCongested.includes(zone.id) || zone.riskFactor > 0.25;

            let fillCol = isFutureView ? "#0c111e" : "#11111a";
            let strokeCol = isFutureView ? "#1c2b3d" : "#1e1e2d";
            let strokeW = 1.5;

            if (isSelected) {
              strokeCol = isFutureView ? "#00ffff" : "#00d4ff";
              strokeW = 3;
            } else if (isCrit) {
              strokeCol = "#ff4444";
              strokeW = 2.5;
            } else if (isCongested) {
              strokeCol = "#f27d26";
              strokeW = 2;
            }

            return (
              <g
                key={`zone-g-${zone.id}-${isFutureView ? "f" : "l"}`}
                className="cursor-pointer group"
                onClick={() => {
                  if (!isFutureView) {
                    onSelectZone(zone);
                    const matchingCam = CAMERAS.find(c => c.zoneId === zone.id);
                    if (matchingCam) {
                      setSelectedCameraId(matchingCam.id);
                    }
                  }
                }}
                onMouseEnter={() => !isFutureView && setHoveredZone(zone)}
                onMouseLeave={() => !isFutureView && setHoveredZone(null)}
              >
                {/* Shapes based on Zone Location type */}
                {zone.type === LocationType.STAND ? (
                  <circle
                    cx={zone.cx}
                    cy={zone.cy}
                    r={zone.radius || 55}
                    fill={fillCol}
                    stroke={strokeCol}
                    strokeWidth={strokeW}
                    className="transition-colors duration-200 hover:fill-[#1e1e2d]"
                    filter={isCrit ? "url(#red-glow)" : undefined}
                  />
                ) : zone.type === LocationType.GATE ? (
                  <rect
                    x={zone.cx - (zone.width || 40) / 2}
                    y={zone.cy - (zone.height || 40) / 2}
                    width={zone.width || 40}
                    height={zone.height || 40}
                    rx="4"
                    fill={activeBlocked.includes(zone.id) ? "#1e0404" : fillCol}
                    stroke={activeBlocked.includes(zone.id) ? "#ff4444" : strokeCol}
                    strokeWidth={activeBlocked.includes(zone.id) ? 3 : strokeW}
                    className="transition-colors duration-200"
                  />
                ) : (
                  <circle
                    cx={zone.cx}
                    cy={zone.cy}
                    r={zone.radius || 25}
                    fill={fillCol}
                    stroke={strokeCol}
                    strokeWidth={strokeW}
                    className="transition-colors duration-200 hover:fill-[#1e1e2d]"
                  />
                )}

                {/* Red alert pulse for hot incident zone */}
                {isCrit && (
                  <circle
                    cx={zone.cx}
                    cy={zone.cy}
                    r={(zone.radius || 40) * (isFutureView ? 1.45 : 1.3)}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    className="animate-pulse"
                    strokeDasharray="4 4"
                  />
                )}

                {/* Text indicator overlay */}
                <text
                  x={zone.cx}
                  y={zone.cy - 10}
                  textAnchor="middle"
                  className={`font-sans font-medium text-[10px] uppercase pointer-events-none ${isFutureView ? "fill-slate-350" : "fill-slate-200"}`}
                >
                  {zone.name.split(" ")[0]}
                </text>

                {/* Density/Value stats mini pill */}
                <text
                  x={zone.cx}
                  y={zone.cy + 12}
                  textAnchor="middle"
                  className="fill-slate-400 font-mono text-[9px] pointer-events-none opacity-85"
                >
                  {zone.type === LocationType.STAND || zone.type === LocationType.FOOD_COURT
                    ? `${Math.round(zone.currentCrowd / 1000)}k fans`
                    : zone.gateStatus || (activeBlocked.includes(zone.id) ? "BLOCKED" : "ACTIVE")}
                </text>
              </g>
            );
          })}
        </g>

        {/* AI DECISION TRAILS (ONLY IN FUTURE PROJECTION MODE) */}
        {isFutureView && visibleLayers.includes("exit_routes") && (
          <g id="ai-decision-trails-overlay" className="pointer-events-none">
            {/* Draw detour lanes bypass arrows indicating active optimization paths */}
            <path
              d="M 280,330 Q 150,220 70,380" // Stand B to VIP Gate E safe bypass
              fill="none"
              stroke="#00ffff"
              strokeWidth="3.5"
              strokeDasharray="5 7"
              filter="url(#cyan-glow)"
              className="animate-[dash_1s_linear_infinite]"
            />
            <path
              d="M 720,330 Q 800,210 500,50" // Stand C bottleneck detour avoiding overloaded G-B towards Gate A
              fill="none"
              stroke="#00ffcc"
              strokeWidth="4"
              strokeDasharray="6 8"
              className="animate-[dash_2s_linear_infinite]"
            />
            <text x="150" y="240" fill="#00ffff" className="font-mono text-[9px] uppercase tracking-wider font-semibold">AI Decision Detour Route 2A</text>
            <text x="760" y="200" fill="#00ffcc" className="font-mono text-[9px] uppercase tracking-wider font-semibold">Gate B Overload Bypass</text>
          </g>
        )}

        {/* CROWD FLOW ARROWS */}
        {(evacuationActive || isFutureView) && visibleLayers.includes("exit_routes") && (
          <g id="evacuation_rerouting_arrows" className="pointer-events-none">
            <path
              d="M 720,330 Q 820,330 930,380"
              fill="none"
              stroke={isFutureView ? "#00e5ff" : "#00ff00"}
              strokeWidth="4"
              strokeDasharray="8 6"
              className="animate-[dash_1s_linear_infinite]"
            />
            <path
              d="M 500,180 Q 500,100 500,50"
              fill="none"
              stroke={isFutureView ? "#00e5ff" : "#00ff00"}
              strokeWidth="4"
              strokeDasharray="8 6"
              className="animate-[dash_1s_linear_infinite]"
            />
            <path
              d="M 500,620 Q 500,700 500,750"
              fill="none"
              stroke={isFutureView ? "#00e5ff" : "#00ff00"}
              strokeWidth="4"
              strokeDasharray="8 6"
              className="animate-[dash_1s_linear_infinite]"
            />
            <path
              d="M 800,150 Q 860,260 930,380"
              fill="none"
              stroke="#f27d26"
              strokeWidth="3.5"
              strokeDasharray="6 6"
              className="animate-[dash_1.5s_linear_infinite]"
            />
          </g>
        )}

        {/* EMERGENCY RESPONDRERS AND PATROLS */}
        <g id="emergency_personnel_badges" className="pointer-events-none">
          {/* Paramedics team markers - Medical Layer */}
          {visibleLayers.includes("medical") && (
            <>
              <circle cx="210" cy="230" r="14" fill="#ff4444" className="animate-ping opacity-20" />
              <circle cx="210" cy="230" r="8" fill="#ff4444" />
              <text x="210" y="233" textAnchor="middle" fill="#ffffff" className="font-sans font-extrabold text-[8px]">+</text>

              <circle cx="790" cy="570" r="14" fill="#ff4444" className="animate-ping opacity-20" />
              <circle cx="790" cy="570" r="8" fill="#ff4444" />
              <text x="790" y="573" textAnchor="middle" fill="#ffffff" className="font-sans font-extrabold text-[8px]">+</text>
            </>
          )}

          {/* Security details units - Security Layer */}
          {visibleLayers.includes("security") && (
            <>
              <circle cx="390" cy="120" r="9" fill={isFutureView ? "#00ffff" : "#3b82f6"} className="animate-pulse" />
              <rect x="387" y="117" width="6" height="6" fill="#fff" />
              <circle cx="610" cy="680" r="9" fill={isFutureView ? "#00ffff" : "#3b82f6"} />
              <rect x="607" y="677" width="6" height="6" fill="#fff" />
            </>
          )}
        </g>

        {/* SPECTOR CROWD MOVING PARTICLES */}
        {visibleLayers.includes("crowd") && (
          <g id="live_spectator_dots">
            {particles.map(particle => {
              // Future particles use custom high-vis neon tones to reflect ghost state
              let dotColor = particle.color;
              if (isFutureView) {
                if (particle.color === "#10b981") dotColor = "rgba(0, 255, 255, 0.65)"; // cyan ghost
                else if (particle.color === "#f59e0b") dotColor = "rgba(242, 125, 38, 0.75)"; // glowing amber
                else dotColor = "rgba(255, 68, 68, 0.85)"; // glowing crimson
              }
              const cx = isFutureView ? particle.currentX + (Math.sin(particle.id) * 12) : particle.currentX;
              const cy = isFutureView ? particle.currentY + (Math.cos(particle.id) * 12) : particle.currentY;
              
              return (
                <g
                  key={`avatar-${particle.id}-${isFutureView ? "fut" : "liv"}`}
                  transform={`translate(${cx}, ${cy})`}
                  className="transition-all duration-300 pointer-events-none opacity-90"
                >
                  {/* Human Head */}
                  <circle cx="0" cy="-3.2" r="1.5" fill={dotColor} />
                  {/* Rounded Human upper body */}
                  <path d="M -2,0 C -2,-1.5, 2,-1.5, 2,0 L 1.2,2.2 L -1.2,2.2 Z" fill={dotColor} />
                  {/* Little legs indicating moving or standing action */}
                  <line x1="-0.8" y1="2" x2={evacuationActive ? "-1.5" : "-0.6"} y2="4.2" stroke={dotColor} strokeWidth="0.7" />
                  <line x1="0.8" y1="2" x2={evacuationActive ? "1.5" : "0.6"} y2="4.2" stroke={dotColor} strokeWidth="0.7" />
                </g>
              );
            })}
          </g>
        )}

        {/* COMPASS GRID */}
        <g id="decorative_compass" className="opacity-30">
          <line x1="900" y1="100" x2="960" y2="100" stroke="#475569" strokeWidth="1" />
          <line x1="930" y1="70" x2="930" y2="130" stroke="#475569" strokeWidth="1" />
          <circle cx="930" cy="100" r="15" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="3 3"/>
          <text x="930" y="65" textAnchor="middle" fill="#475569" className="font-mono text-[9px]">N</text>
        </g>
      </svg>
    );
  };

  const currentCamera = CAMERAS.find(c => c.id === selectedCameraId) || CAMERAS[0];

  return (
    <div id="stadium_digital_twin_container" className="relative bg-[#11111a] border border-[#1e1e2d] rounded-xl overflow-hidden p-4 shadow-2xl space-y-4">
      {/* Top Header of the Twin, with Split-screen Toggle Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1e1e2d] pb-3 px-0.5 gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff4444] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff4444]"></span>
          </span>
          <h3 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase">
            Stadium Twin Sensor Mapping
          </h3>
        </div>
        
        {/* THE DEMO MASTER SPLIT TOGGLE */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSplitScreen(!splitScreen);
              speakText(
                splitScreen
                  ? "Returning to unified single screen digital twin."
                  : "Engaged split screen. Left side exhibits live stadium sensors. Right side computes predicted crowd conditions five minutes into the future."
              );
            }}
            id="split_screen_simulation_toggle"
            className={`font-mono text-[10px] px-3.5 py-1.5 rounded uppercase font-bold tracking-wider border flex items-center gap-2 transition-all cursor-pointer ${
              splitScreen
                ? "bg-cyan-950/80 text-[#00d4ff] border-[#00d4ff]/60 shadow-[0_0_12px_rgba(0,212,255,0.3)]"
                : "bg-[#050507] text-slate-400 border-[#1e1e2d] hover:text-white hover:border-slate-700"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${splitScreen ? "bg-[#00d4ff] animate-ping" : "bg-slate-500"}`}></span>
            AI SPLIT REPLAY + FUTURE PROJECTION (+5 MINS)
          </button>

          <div className="hidden md:flex items-center gap-3 select-none">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-sans">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff4444] inline-block"></span>
              <span>Critical</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-sans">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f27d26] inline-block"></span>
              <span>Congested</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-sans">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00ff00] inline-block"></span>
              <span>Clear</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage Grid */}
      {splitScreen ? (
        /* =================== SPLIT SCREEN MODE (REPLAY) =================== */
        <div className="space-y-4">
          <div className="relative w-full bg-[#050507] rounded-lg border border-[#1e1e2d] overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#1e1e2d] w-full items-stretch">
              
              {/* Left side: Live Twin */}
              <div className="relative p-2.5 flex flex-col justify-between w-full">
                <div className="absolute top-3 left-3 bg-[rgba(0,255,0,0.08)] border border-[#00ff00]/40 text-[#00ff00] font-mono text-[9px] py-1 px-2.5 rounded tracking-widest uppercase font-bold z-10 pointer-events-none">
                  LIVE COMPOSITE MAP
                </div>
                <div className="w-full flex items-center justify-center py-4">
                  {renderStadiumMapSVG(false)}
                </div>
              </div>

              {/* Right side: AI Future Forecast */}
              <div className="relative p-2.5 flex flex-col justify-between bg-[#030308] w-full">
                <div className="absolute top-3 left-3 bg-[rgba(239,68,68,0.1)] border border-red-500/40 text-red-400 font-mono text-[9px] py-1 px-2.5 rounded tracking-widest uppercase font-bold z-10 pointer-events-none animate-pulse">
                  AI PROJECTED REPLAY (+5 MINS)
                </div>
                <div className="w-full flex items-center justify-center py-4">
                  {renderStadiumMapSVG(true)}
                </div>
              </div>

            </div>

            {/* Evacuation flasher active indicator */}
            {evacuationActive && (
              <div className="absolute bottom-3 right-3 bg-red-950/90 border border-red-800 text-red-400 font-mono text-[9px] py-1 px-3 rounded flex items-center gap-1.5 animate-pulse uppercase tracking-wider font-semibold z-10 select-none">
                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                Dynamic Safety Evacuation Routing Enabled
              </div>
            )}
          </div>

          {/* CCTV Camera & Predictions Dashboard - Horizontal Multi-Panel style inside splits */}
          <div className="bg-[#0b0b14]/90 border border-[#1e1e2d] rounded-lg p-3.5 grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
            
            {/* Camera Options Tab Menu */}
            <div className="md:col-span-3 flex flex-col gap-2">
              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mb-1 flex items-center gap-1">
                <Camera className="w-3 h-3 text-cyan-400" /> Select Camera Feed
              </span>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-1.5 h-full max-h-[170px] overflow-y-auto pr-1">
                {CAMERAS.map((cam) => {
                  const isActive = cam.id === selectedCameraId;
                  const hasHighRisk = cam.id === "CAM_04" || (activeIncident && cam.zoneId === activeIncident.zoneId);
                  return (
                    <button
                      key={cam.id}
                      onClick={() => {
                        setSelectedCameraId(cam.id);
                        const matchingZone = zones.find(z => z.id === cam.zoneId);
                        if (matchingZone) {
                          onSelectZone(matchingZone);
                        }
                        speakText(`Focusing sensor view on ${cam.name}`);
                      }}
                      className={`p-2 rounded text-left border text-[10px] font-mono transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isActive
                          ? "bg-cyan-950/70 text-[#00d4ff] border-[#00d4ff]/80 shadow-[0_0_8px_rgba(0,212,255,0.25)]"
                          : "bg-[#050510]/50 text-slate-400 border-[#1e1e2d] hover:bg-[#151525]"
                      }`}
                    >
                      <span className="truncate flex items-center gap-1">
                        <span className={`w-1 h-1 rounded-full ${hasHighRisk ? "bg-red-500 animate-ping" : "bg-cyan-400"}`}></span>
                        {cam.id}: {cam.location.split(" ")[0]}
                      </span>
                      {hasHighRisk && <span className="text-[8px] bg-red-950 px-1 border border-red-900 rounded text-red-400 uppercase scale-90">Hot</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Video feed playback */}
            <div className="md:col-span-3 bg-[#020205] border border-slate-900/60 rounded-lg overflow-hidden flex flex-col justify-between p-2 min-h-[140px] relative">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-cyan-500/10 shadow-[0_0_10px_cyan] animate-[sweep_2.5s_linear_infinite] pointer-events-none"></div>
              <div className="flex justify-between items-center text-[8px] font-mono text-slate-500 z-10">
                <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500 animate-pulse"></span>LIVE</span>
                <span>{currentCamera.streamType}</span>
              </div>
              <div className="my-auto text-center z-10">
                <span className="text-xs font-black font-mono text-cyan-400 tracking-wider block">{currentCamera.id} COMPOSITE</span>
                <span className="text-[9px] text-slate-400 font-sans tracking-wide mt-0.5 block">{currentCamera.location}</span>
              </div>
              <div className="flex justify-between items-end text-[7px] font-mono text-slate-500 z-10">
                <span>RATING: {currentCamera.risk}</span>
                <span>30 FPS</span>
              </div>
            </div>

            {/* AI Room Predictions */}
            <div className="md:col-span-3 bg-[#05050d] border border-slate-900/60 rounded-lg p-3 flex flex-col justify-between min-h-[140px]">
              <div>
                <span className="text-[9px] text-[#00d4ff] font-mono tracking-widest uppercase block mb-1">
                  ▲ AI Live Room Prediction
                </span>
                <p className="text-[10px] text-slate-300 font-sans leading-relaxed">
                  {currentCamera.prediction}
                </p>
              </div>
              <span className="text-[8px] font-mono text-slate-650 block text-right mt-1">SENTINEL-P CORE</span>
            </div>

            {/* AI suggestions & manual overlay apply buttons */}
            <div className={`md:col-span-3 border rounded-lg p-3 flex flex-col justify-between min-h-[140px] transition-all duration-300 ${
              planExecutedId === currentCamera.id
                ? "bg-[#0b221d]/90 border-emerald-800"
                : "bg-[#180f0c]/90 border-amber-950/40"
            }`}>
              <div>
                <span className="text-[9px] text-amber-500 font-mono tracking-widest uppercase block mb-1">
                  ★ AI Safety Override suggestion
                </span>
                <p className="text-[10px] text-slate-300 font-sans leading-relaxed">
                  {currentCamera.plan}
                </p>
              </div>

              <button
                onClick={() => {
                  setPlanExecutedId(currentCamera.id);
                  speakText(`Executing Sentinel Tactical override plan for ${currentCamera.location}. Directives launched successfully.`);
                  setTimeout(() => setPlanExecutedId(null), 4000);
                }}
                disabled={planExecutedId === currentCamera.id}
                className={`w-full py-1.5 px-3 rounded mt-2 text-[9px] font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                  planExecutedId === currentCamera.id
                    ? "bg-emerald-500 text-white cursor-not-allowed"
                    : "bg-amber-500 text-[#0c0d12] hover:bg-amber-400 flex items-center justify-center gap-1 active:scale-95"
                }`}
              >
                {planExecutedId === currentCamera.id ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 stroke-2" />
                    Directive Deployed!
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-3 h-3" />
                    Deploy safety solution
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      ) : (
        /* =================== STANDARD FULL-DESKTOP SURVEILLANCE COMPACT MATRIX =================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Main Map Viewer Panel (Left: 8 columns out of 12) */}
          <div className="lg:col-span-8 bg-[#050507] rounded-lg border border-[#1e1e2d] relative overflow-hidden p-2 flex items-center justify-center min-h-[460px]">
            {renderStadiumMapSVG(false)}

            {/* Hover Zone details drawer */}
            {hoveredZone && (
              <div className="absolute bottom-3 left-3 bg-slate-950/95 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[10px] text-white shadow-lg pointer-events-none max-w-xs font-mono">
                <div className="font-bold text-cyan-400 border-b border-slate-800 pb-0.5 uppercase mb-1">{hoveredZone.name}</div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Live Crowd:</span>
                    <span>{hoveredZone.currentCrowd.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500 font-sans">Dynamic Risk:</span>
                    <span className={hoveredZone.riskFactor > 0.6 ? "text-red-400 font-bold" : hoveredZone.riskFactor > 0.25 ? "text-amber-400" : "text-green-400"}>
                      {Math.round(hoveredZone.riskFactor * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Evacuation indicator banner */}
            {evacuationActive && (
              <div className="absolute bottom-3 right-3 bg-red-950/90 border border-red-800 text-red-400 font-mono text-[9px] py-1 px-2.5 rounded flex items-center gap-1.5 animate-pulse uppercase tracking-wider font-semibold z-10 select-none">
                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                REROUTING VECTOR LINES ACTIVE
              </div>
            )}
          </div>

          {/* AI SURVEILLANCE CCTV CONTROLLER (Right: 4 columns out of 12) */}
          <div className="lg:col-span-4 flex flex-col gap-3.5 bg-[#080811]/40 border border-[#1e1e2d] rounded-lg p-3.5 justify-between">
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 border-b border-[#1e1e2d] pb-2 text-xs font-semibold uppercase tracking-wider font-mono text-slate-300">
                <Camera className="w-4 h-4 text-[#00d4ff]" />
                CCTV Control &amp; AI Room
              </div>

              {/* Grid selectors */}
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5">
                {CAMERAS.map((cam) => {
                  const isActive = cam.id === selectedCameraId;
                  const hasHighRisk = cam.id === "CAM_04" || (activeIncident && cam.zoneId === activeIncident.zoneId);
                  return (
                    <button
                      key={cam.id}
                      onClick={() => {
                        setSelectedCameraId(cam.id);
                        const matchingZone = zones.find(z => z.id === cam.zoneId);
                        if (matchingZone) {
                          onSelectZone(matchingZone);
                        }
                        speakText(`Pivoting thermal camera lens to monitor ${cam.location}`);
                      }}
                      className={`relative p-2 rounded text-left border text-[10px] font-mono transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isActive
                          ? "bg-cyan-950/70 text-[#00d4ff] border-[#00d4ff]/80 shadow-[0_0_8px_rgba(0,212,255,0.25)]"
                          : "bg-[#05050a]/80 text-slate-400 border-[#1e1e2d] hover:bg-[#111124]"
                      }`}
                    >
                      <span className="truncate flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${hasHighRisk ? "bg-red-400 animate-ping" : "bg-cyan-400"}`}></span>
                        {cam.id}: {cam.location.split(" ")[0]}
                      </span>
                      {hasHighRisk && (
                        <span className="bg-red-950 border border-red-900/40 text-red-400 text-[8px] px-1 rounded uppercase scale-90 flex-shrink-0 font-sans">
                          Hotspot
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* CCTV screen panel overlay */}
              <div className="relative bg-[#020205] border border-slate-900/80 aspect-video rounded-lg overflow-hidden flex flex-col justify-between p-2 shadow-inner">
                <div className="absolute inset-x-0 top-0 h-0.5 bg-cyan-500/10 shadow-[0_0_10px_cyan] animate-[sweep_2.5s_linear_infinite] pointer-events-none"></div>
                
                <div className="flex justify-between items-center text-[8px] font-mono text-slate-500">
                  <span className="flex items-center gap-1 tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    CCTV VIDEO COMPOSITE
                  </span>
                  <span className="text-[7.5px] uppercase">{currentCamera.streamType}</span>
                </div>

                {/* Radar sweep mesh */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
                  <circle cx="50%" cy="50%" r="20%" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx="50%" cy="50%" r="35%" fill="none" stroke="#22d3ee" strokeWidth="1" />
                  <line x1="5%" y1="50%" x2="95%" y2="50%" stroke="#22d3ee" strokeWidth="0.5" />
                  <line x1="50%" y1="5%" x2="50%" y2="95%" stroke="#22d3ee" strokeWidth="0.5" />
                </svg>

                <div className="my-auto text-center z-10 select-none">
                  <span className="text-xs font-black font-mono text-cyan-400 tracking-wider block">{currentCamera.id} COMPOSITE</span>
                  <span className="text-[9px] text-slate-400 font-sans mt-0.5 block">{currentCamera.location}</span>
                </div>

                <div className="flex justify-between items-end text-[7px] font-mono text-slate-500">
                  <span>Risk Status: {currentCamera.risk}</span>
                  <span>FPS: 30 // MONO</span>
                </div>
              </div>

              {/* AI Prediction block */}
              <div className="bg-[#050510]/50 border border-[#1e1e2d] rounded-lg p-2.5">
                <div className="flex items-center gap-1.5 text-[9.5px] uppercase font-mono tracking-wider text-[#00d4ff] mb-1 font-bold font-sans">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  AI Real-time Forecast
                </div>
                <p className="text-[10.5px] text-slate-350 font-sans leading-relaxed">
                  {currentCamera.prediction}
                </p>
              </div>

              {/* Suggestion Box */}
              <div className={`border rounded-lg p-2.5 transition-all duration-300 ${
                planExecutedId === currentCamera.id
                  ? "bg-[#0b241e]/90 border-emerald-800"
                  : "bg-[#18100a]/80 border-amber-950/40"
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1 text-[9.5px] uppercase font-mono tracking-wider font-bold text-amber-500">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Action Suggestion
                  </div>
                  <span className="text-[7.5px] font-mono text-slate-500 select-none">AUTONOMOUS</span>
                </div>
                <p className="text-[10.5px] text-slate-300 font-sans leading-relaxed">
                  {currentCamera.plan}
                </p>
              </div>
            </div>

            {/* Execute Suggestion Button */}
            <button
              onClick={() => {
                setPlanExecutedId(currentCamera.id);
                speakText(`Sentinel overriding stadium safety protocol. Directive initiated: ${currentCamera.plan}`);
                setTimeout(() => setPlanExecutedId(null), 4000);
              }}
              disabled={planExecutedId === currentCamera.id}
              className={`w-full py-2 px-3 rounded text-[10px] font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                planExecutedId === currentCamera.id
                  ? "bg-emerald-500 text-white cursor-not-allowed"
                  : "bg-amber-500 text-black hover:bg-amber-400 flex items-center justify-center gap-1.5 active:scale-95"
              }`}
            >
              {planExecutedId === currentCamera.id ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-2" />
                  Applying Suggestion...
                </>
              ) : (
                <>
                  <PlayCircle className="w-3.5 h-3.5" />
                  Deploy Safety Plan
                </>
              )}
            </button>

          </div>

        </div>
      )}

      {/* TACTICAL OPERATOR CROWD CONTROL PANEL (MOCK CROWD MANAGEMENT) */}
      <div className="mt-4 bg-[#07070f] border border-[#1e1e2d] rounded-xl p-4 space-y-4 shadow-[inset_0_1px_3px_rgba(255,255,255,0.05)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#1e1e2d]/80 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#00ffcc] animate-pulse"></span>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-sans flex items-center gap-1.5">
                Tactical Operator Crowd Control Deck
              </h4>
            </div>
            <p className="text-[10px] text-slate-500 font-sans font-normal">
              Directly influence spectator parameters, trigger emergency evac routings, and construct custom gait / turnstile blockades in real-time.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-[#00ffcc] font-mono uppercase bg-[#00ffcc]/10 border border-[#00ffcc]/30 px-2 py-0.5 rounded">
              Mock Engine: Synchronized
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          {/* Left Column: Multipliers and Speeds */}
          <div className="md:col-span-6 space-y-4">
            {/* Spectator Density Slider */}
            <div className="space-y-2 bg-[#0d0d18]/50 p-3 rounded-lg border border-slate-900">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400 font-bold uppercase tracking-wider">🧬 Spectator Density Scale</span>
                <span className="text-emerald-450 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">
                  {crowdScaler.toFixed(1)}x ({Math.round(crowdScaler * 42000)} Fans)
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                Adjusts the amount of dynamic spectators spawning inside simulated stands and corridors.
              </p>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-600 font-mono">0.2x</span>
                <input
                  type="range"
                  min="0.2"
                  max="2.5"
                  step="0.1"
                  value={crowdScaler}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setCrowdScaler(val);
                    speakText(`Simulated spectator density modified to ${val.toFixed(1)}x factor.`);
                  }}
                  className="flex-1 accent-[#00ffcc] h-1.5 bg-slate-950 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-slate-600 font-mono">2.5x</span>
              </div>
            </div>

            {/* Walk Speed Velocity Slider */}
            <div className="space-y-2 bg-[#0d0d18]/50 p-3 rounded-lg border border-slate-900">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400 font-bold uppercase tracking-wider">⚡ Walk Velocity Modifier</span>
                <span className="text-cyan-400 font-extrabold bg-[#00d4ff]/10 px-2 py-0.5 rounded border border-[#00d4ff]/10">
                  {speedMultiplier.toFixed(1)}x ({(speedMultiplier * 1.4).toFixed(1)} m/s avg)
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                Speeds up or slow-motions the animated vector dots to simulate crowd panic speeds or casual strolling.
              </p>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-600 font-mono">0.3x</span>
                <input
                  type="range"
                  min="0.3"
                  max="3.0"
                  step="0.1"
                  value={speedMultiplier}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setSpeedMultiplier(val);
                  }}
                  className="flex-1 accent-[#00d4ff] h-1.5 bg-slate-950 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-slate-600 font-mono">3.0x</span>
              </div>
            </div>
          </div>

          {/* Right Column: Gate Locks, Blockades and Manual Evacuation Dispatch */}
          <div className="md:col-span-6 space-y-4">
            {/* Gate Locks Selector */}
            <div className="bg-[#0d0d18]/50 p-3 rounded-lg border border-slate-900 space-y-3">
              <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider block">
                🚧 Gate Turnstile Closures (Click to Overrule / Lockout)
              </span>
              <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                Toggling a gate to "LOCKED" instantly lights its beacon crimson and diverts pedestrian algorithms to alternative gates on the live twin layout.
              </p>
              <div className="flex flex-wrap gap-2">
                {["gate_a", "gate_b", "gate_c", "gate_d", "gate_e"].map((gateId) => {
                  const isBlocked = blockedGates.includes(gateId);
                  const isCongested = congestedGates.includes(gateId);
                  const gateLabel = gateId.replace("_", " ").toUpperCase();
                  return (
                    <button
                      key={gateId}
                      type="button"
                      onClick={() => {
                        if (onToggleGate) {
                          onToggleGate(gateId);
                        }
                      }}
                      className={`text-[9px] font-mono font-bold tracking-wider rounded px-2.5 py-1.5 transition-all uppercase cursor-pointer ${
                        isBlocked
                          ? "bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800 animate-pulse"
                          : isCongested
                          ? "bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800"
                          : "bg-emerald-950/40 hover:bg-emerald-950 text-emerald-400 border border-emerald-800/40"
                      }`}
                    >
                      {gateLabel}: {isBlocked ? "🚫 LOCKED" : isCongested ? "⚠️ HEAVY" : "✓ NOMINAL"}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Evacuation Manual override */}
            <div className="bg-[#0c0c14] border border-slate-900 p-3 rounded-lg flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10.5px] font-bold text-slate-300 font-mono uppercase block">Emergency Evac Vectors Override</span>
                <p className="text-[9.5px] text-slate-500 font-sans">
                  Directly deploy or silence dynamic safe green evacuation flow lines.
                </p>
              </div>
              <button
                type="button"
                onClick={onToggleEvacuation}
                className={`py-1.5 px-3 rounded font-mono text-[9.5px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  evacuationActive
                    ? "bg-red-600 hover:bg-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.3)]"
                    : "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                }`}
              >
                {evacuationActive ? "🚨 EVAC ACTIVE" : "🟢 STANDBY"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Zone Quick Controls Card */}
      {selectedZone && !splitScreen && (
        <div className="mt-3 bg-slate-900/60 border border-slate-800 rounded-lg p-3 flex justify-between items-center transition-all duration-300">
          <div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-400" />
              <div className="text-xs font-semibold text-slate-300">
                Selected Node: <span className="text-white uppercase font-mono">{selectedZone.name}</span>
              </div>
            </div>
            <p className="text-slate-400 text-xs mt-1 italic font-sans white-space-normal">
              "{selectedZone.statusText || 'Normal parameters monitored.'}"
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectZone(null as any)}
              className="text-[11px] text-slate-400 hover:text-white bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-md transition-colors font-mono cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
