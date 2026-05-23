import React, { useState } from "react";
import { Search, MapPin, Calendar, Clock, Sparkles, RefreshCw, AlertTriangle, ShieldCheck, Check } from "lucide-react";

interface MissingEgressViewProps {
  speakText: (text: string) => void;
  stadiumCapacity: number;
  currentTotalCrowd: number;
}

export default function MissingEgressView({
  speakText,
  stadiumCapacity,
  currentTotalCrowd
}: MissingEgressViewProps) {
  // Missing Person states
  const [jerseyColor, setJerseyColor] = useState<string>("Blue");
  const [hatColor, setHatColor] = useState<string>("Yellow");
  const [lastSeenLoc, setLastSeenLoc] = useState<string>("Food Oasis Concourse");
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "found" | "not_found">("idle");
  const [isHatChecked, setIsHatChecked] = useState<boolean>(true);

  // Post match exit scheduler states
  const [phases, setPhases] = useState<{
    id: string;
    name: string;
    spectators: number;
    status: "HELD" | "COUNTDOWN" | "EXIT_PERMITTED" | "CLEARED";
    timerMins: number;
    gate: string;
  }[]>([
    { id: "PH_1", name: "Phase 1: VIP stands & North Club", spectators: 4120, status: "CLEARED", timerMins: 0, gate: "Exit A" },
    { id: "PH_2", name: "Phase 2: East Promenade seats", spectators: 8520, status: "EXIT_PERMITTED", timerMins: 4, gate: "Exit B & C" },
    { id: "PH_3", name: "Phase 3: SW concessions block", spectators: 14500, status: "COUNTDOWN", timerMins: 11, gate: "Exit D" },
    { id: "PH_4", name: "Phase 4: Upper level food courts", spectators: 6200, status: "HELD", timerMins: 18, gate: "Exit B bypass" },
  ]);

  // Handle clothing trajectory scan
  const handleTriggerTrajectoryScan = () => {
    setScanStatus("scanning");
    speakText(`Initiating neural trajectory scan for subject wearing ${jerseyColor} jersey and ${isHatChecked ? hatColor + " hat" : "no hat"}. Scanning all Modi Stadium CCTV channels.`);
    
    setTimeout(() => {
      setScanStatus("found");
      speakText(`Subject located. Match found with ninety-one percent confidence score at West Concourse area. Subject moving north-west.`);
    }, 2800);
  };

  // Turnstile Release override
  const handleToggleGateReleasePhase = (phaseId: string) => {
    const updated = phases.map(p => {
      if (p.id === phaseId) {
        let nextStatus: "HELD" | "COUNTDOWN" | "EXIT_PERMITTED" | "CLEARED" = "EXIT_PERMITTED";
        if (p.status === "EXIT_PERMITTED") {
          nextStatus = "CLEARED";
          speakText(`Phase cleared successfully.`);
        } else {
          speakText(`Opening turnstiles for ${p.name}. Directing flow.`);
        }
        return { ...p, status: nextStatus, timerMins: 0 };
      }
      return p;
    });
    setPhases(updated);
  };

  return (
    <div className="bg-[#0b0c16]/95 border border-[#1e1e2d] rounded-xl p-4 md:p-5 shadow-2xl space-y-6">
      
      {/* 2 Column subgrid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* SECTION A: Missing person trajectory scan */}
        <div className="bg-[#050510]/80 border border-[#1d1f3b] rounded-xl p-4 flex flex-col justify-between">
          
          <div className="space-y-4">
            <span className="text-[11px] text-purple-400 font-mono tracking-wider uppercase block border-b border-[#1e1e2d] pb-2 flex items-center gap-1.5">
              <Search className="w-4 h-4 text-purple-400" />
              CCTV AI Trajectory &amp; Missing Person clothes tracker
            </span>

            <p className="text-xs text-slate-350 leading-relaxed font-sans font-normal">
              Using multi-node color histogram segmentation, stadium wardens can track missing persons by matching jersey colors against real-time CCTV feeds:
            </p>

            {/* Inputs */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-mono uppercase block">Jersey Color Match</label>
                <select
                  value={jerseyColor}
                  onChange={(e) => setJerseyColor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white p-1.5 rounded outline-none"
                >
                  <option value="Blue">Blue Jersey</option>
                  <option value="Yellow">Yellow Jersey</option>
                  <option value="Red">Red Jersey</option>
                  <option value="OrangeOrHat">Orange shirt</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-mono uppercase block">Accessory / Hat</label>
                <div className="flex items-center gap-2 h-10">
                  <input
                    type="checkbox"
                    id="hat_checkbox"
                    checked={isHatChecked}
                    onChange={(e) => setIsHatChecked(e.target.checked)}
                    className="accent-cyan-500"
                  />
                  <select
                    disabled={!isHatChecked}
                    value={hatColor}
                    onChange={(e) => setHatColor(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 text-xs text-white p-1 rounded outline-none disabled:opacity-40"
                  >
                    <option value="Yellow">Yellow Hat</option>
                    <option value="Blue">Blue Cap</option>
                    <option value="Orange">Orange Turban</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-[10px] text-slate-500 font-mono uppercase block">Last Seen Location Node</label>
                <input
                  type="text"
                  value={lastSeenLoc}
                  onChange={(e) => setLastSeenLoc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white p-1.5 rounded outline-none"
                  placeholder="Food court stairwell 4..."
                />
              </div>
            </div>

            {/* Trajectory Outcome Dialog */}
            <div className={`p-3 rounded-lg border text-xs min-h-[75px] transition-all flex flex-col justify-center ${
              scanStatus === "scanning"
                ? "bg-indigo-950/20 border-indigo-900 animate-pulse text-indigo-300"
                : scanStatus === "found"
                ? "bg-purple-950/30 border-purple-800 text-purple-200"
                : "bg-slate-950 border-slate-900 text-slate-500 italic text-center"
            }`}>
              {scanStatus === "idle" && (
                <span>Baseline database loaded. Press scan below to engage CCTV trajectory models.</span>
              )}
              {scanStatus === "scanning" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span>SCANNING MODI DOME CCTV FEEDS...</span>
                    <span>72% MATCH DEPTH</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded overflow-hidden">
                    <div className="h-full bg-indigo-500 w-3/4 animate-[pulse_1s_infinite]"></div>
                  </div>
                </div>
              )}
              {scanStatus === "found" && (
                <div className="space-y-1 font-sans">
                  <span className="text-[#00ffff] font-mono font-bold uppercase block tracking-wide text-[10px]">
                    ★ 91.4% CLOTHING MATCH FOUND (CCTV_CAM_04)
                  </span>
                  <p className="text-[11px] text-slate-200 leading-normal">
                    Subject wearing <strong>{jerseyColor} Jersey</strong> was spotted exiting Southwest Concourse stairwell, travelling northwest at 0.9 m/s. Safe perimeter wardens pre-alerted.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleTriggerTrajectoryScan}
              disabled={scanStatus === "scanning"}
              className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold font-mono tracking-wider rounded uppercase hover:scale-102 transition-all cursor-pointer"
            >
              🚀 Engage AI CCTV Trajectory Scan
            </button>
            <button
              onClick={() => setScanStatus("idle")}
              className="py-1.5 px-3 bg-slate-800 text-slate-400 hover:text-white rounded text-xs font-mono uppercase cursor-pointer"
            >
              Clear
            </button>
          </div>

        </div>

        {/* SECTION B: Post match exit optimization */}
        <div className="bg-[#050510]/80 border border-[#1d1f3b] rounded-xl p-4 flex flex-col justify-between">
          
          <div className="space-y-4">
            <span className="text-[11px] text-teal-400 font-mono tracking-wider uppercase block border-b border-[#1e1e2d] pb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal-400" />
              Post-Match Exit Phase Optimization Scheduler
            </span>

            <p className="text-xs text-slate-350 leading-relaxed font-sans font-normal">
              To prevent stiles stampedes, release match spectators gradually in sequenced phases. Use overrides below to release zones:
            </p>

            <div className="space-y-2 h-44 overflow-y-auto pr-1">
              {phases.map((ph) => {
                let badgeColor = "bg-slate-900 text-slate-400 border-slate-800";
                if (ph.status === "CLEARED") badgeColor = "bg-emerald-950 text-emerald-400 border-emerald-900/60";
                else if (ph.status === "EXIT_PERMITTED") badgeColor = "bg-teal-950 text-teal-300 border-teal-800";
                else if (ph.status === "COUNTDOWN") badgeColor = "bg-amber-950 text-amber-500 border-amber-900 animate-pulse";

                return (
                  <div key={ph.id} className="p-2 bg-slate-950 rounded border border-slate-900 flex items-center justify-between text-xs gap-3">
                    <div className="truncate">
                      <div className="font-bold text-slate-200 uppercase truncate">{ph.name}</div>
                      <div className="text-[9px] text-slate-500 font-mono mt-0.5 truncate uppercase">
                        {ph.spectators.toLocaleString()} fans via {ph.gate}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 border rounded uppercase font-semibold ${badgeColor}`}>
                        {ph.status}
                      </span>
                      
                      {ph.status !== "CLEARED" && (
                        <button
                          onClick={() => handleToggleGateReleasePhase(ph.id)}
                          className="py-1 px-2.5 bg-slate-900 hover:bg-[#15162a] border border-slate-800 text-slate-300 font-mono text-[9px] uppercase tracking-wider rounded transition-colors cursor-pointer"
                        >
                          {ph.status === "EXIT_PERMITTED" ? "Clear phase" : "Release"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
          </div>

          <span className="text-[7.5px] font-mono text-slate-750 uppercase tracking-widest block text-right mt-3">
            AUTOMATIC RELEASING SEQUENCERS
          </span>
        </div>

      </div>

    </div>
  );
}
