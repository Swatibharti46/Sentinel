import React, { useState } from "react";
import { ShieldAlert, Users, Radio, Sparkles, CheckCircle2, PlayCircle, ShieldCheck, Heart, FileText, Send } from "lucide-react";
import { RiskLevel, SafetyIncident } from "../types";

interface CommandPostViewProps {
  activeIncident: SafetyIncident | null;
  overallRiskLevel: string;
  evacuationActive: boolean;
  onApplyDirective: (id: string) => void;
  copilotDirectives: {
    id: string;
    message: string;
    applied: boolean;
    priority: "low" | "medium" | "high";
  }[];
  speakText: (text: string) => void;
}

export default function CommandPostView({
  activeIncident,
  overallRiskLevel,
  evacuationActive,
  onApplyDirective,
  copilotDirectives,
  speakText
}: CommandPostViewProps) {
  const [activeSubPost, setActiveSubPost] = useState<"security" | "medical" | "organizer" | "police">("organizer");
  const [tacticalLogs, setTacticalLogs] = useState<string[]>([
    "05:10 PM: All perimeter access gates checked normal.",
    "05:15 PM: Emergency evacuation vectors calibrated to 100% capacity.",
  ]);
  const [customDispatchUnit, setCustomDispatchUnit] = useState<string>("");

  const handleManualDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDispatchUnit.trim()) return;
    const msg = `05:22 PM: DISPATCHED -> ${customDispatchUnit} to Area Stadium Blue Corridor. Ready.`;
    setTacticalLogs([msg, ...tacticalLogs]);
    speakText(`Dispatching ${customDispatchUnit} emergency responder unit.`);
    setCustomDispatchUnit("");
  };

  return (
    <div className="bg-[#0b0c16]/95 border border-[#1e1e2d] rounded-xl p-4 md:p-5 shadow-2xl space-y-5">
      
      {/* Upper sub-selector tabs for Roles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3.5 gap-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#818cf8] animate-pulse" />
            Tactical Operations Command Post
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Select role checkpoint viewpoint for custom alerts and responses.</p>
        </div>

        <div className="flex flex-wrap gap-1 bg-[#05050f]/80 p-1 rounded-lg border border-[#1e1e2d]">
          {[
            { id: "organizer", label: "📋 AI Copilot / Org", color: "hover:text-amber-300" },
            { id: "security", label: "👮 Security Control", color: "hover:text-blue-300" },
            { id: "medical", label: "🏥 Medical Dispatch", color: "hover:text-red-300" },
            { id: "police", label: "🚓 Police & Responders", color: "hover:text-indigo-300" },
          ].map((post) => (
            <button
              key={post.id}
              onClick={() => {
                setActiveSubPost(post.id as any);
                speakText(`Pivoting to ${post.label.split(" ").slice(1).join(" ")} viewpoint.`);
              }}
              className={`py-1 px-2.5 rounded text-[10px] font-mono uppercase tracking-wide transition-all cursor-pointer ${
                activeSubPost === post.id
                  ? "bg-indigo-950 text-indigo-300 border border-indigo-700/60 font-bold"
                  : `text-slate-500 bg-transparent ${post.color}`
              }`}
            >
              {post.label}
            </button>
          ))}
        </div>
      </div>

      {/* RENDER ACTIVE ROLE MODULE */}
      {activeSubPost === "organizer" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* AI Safety Copilot - 7 Cols */}
          <div className="lg:col-span-7 bg-[#050510]/80 border border-[#1d1f3b] rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <span className="text-[11px] text-amber-400 font-mono font-bold uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 animate-[spin_4s_linear_infinite]" />
                AI Safety Copilot Advisor
              </span>
              <span className="text-[9px] text-[#00d4ff] font-mono uppercase">Sentinel-C Core v1.4</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans font-normal">
              Sentinel Core is scanning live visual spectator density patterns. Interactive recommendations generated based on recent IPL history to avoid stampedes and bottleneck build-ups:
            </p>

            <div className="space-y-2.5">
              {copilotDirectives.map((dir) => (
                <div
                  key={dir.id}
                  className={`p-3 rounded-lg border transition-all ${
                    dir.applied
                      ? "bg-emerald-950/40 border-emerald-800/80"
                      : "bg-[#11111a]/80 border-[#1e1e2d] hover:border-slate-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className={`text-[11px] font-sans leading-relaxed ${dir.applied ? "text-emerald-400 font-semibold" : "text-slate-200"}`}>
                      {dir.message}
                    </p>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-mono border ${
                      dir.priority === "high"
                        ? "bg-red-950 text-red-400 border-red-900"
                        : dir.priority === "medium"
                        ? "bg-amber-950 text-amber-500 border-amber-900"
                        : "bg-slate-900 text-slate-400 border-slate-800"
                    }`}>
                      {dir.priority}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-900">
                    <span className="text-[9px] font-mono text-slate-500">
                      ID: {dir.id} &bull; COHESIVE RELIEF POTENTIAL: {dir.priority === "high" ? "42%" : "25%"}
                    </span>
                    <button
                      onClick={() => onApplyDirective(dir.id)}
                      className={`py-1 px-3 rounded text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        dir.applied
                          ? "bg-emerald-500 text-black shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                          : "bg-amber-500 text-black hover:bg-amber-400 hover:scale-105 active:scale-95"
                      }`}
                    >
                      {dir.applied ? "✓ Solution Applied" : "⚡ Adopt Solution"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Organizer Stats & Info - 5 Cols */}
          <div className="lg:col-span-5 bg-[#050510]/80 border border-[#1e1e2d] rounded-xl p-4 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase block border-b border-[#1e1e2d] pb-2">
                📋 Stadium-wide Summary Logs
              </span>

              <div className="space-y-2.5">
                <div className="bg-slate-950/40 p-2.5 rounded border border-slate-900 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Eden Gardens Capacity:</span>
                  <span className="font-mono font-bold text-white">110,000 / 78,500 checked in</span>
                </div>
                <div className="bg-slate-950/40 p-2.5 rounded border border-slate-900 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Match Progress:</span>
                  <span className="font-mono font-bold text-amber-400">2nd Innings - 18.2 Overs</span>
                </div>
                <div className="bg-slate-950/40 p-2.5 rounded border border-slate-900 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Predicted Clearing Curve:</span>
                  <span className="font-mono font-bold text-[#00d4ff]">Critical Egress under 11 mins</span>
                </div>
              </div>

              <div className="p-3 bg-[#0c1a16]/40 border border-teal-900/40 rounded-lg">
                <span className="text-[9px] text-[#00ffcc] font-mono uppercase tracking-wider block mb-1">✓ Pre-Match exit checks</span>
                <p className="text-[10.5px] text-slate-300 font-sans leading-relaxed">
                  All 12 turnstile columns configured with Dynamic safe lanes. Automatic WhatsApp emergency push APIs calibrated to active subscriber databases.
                </p>
              </div>
            </div>

            <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest block text-right">MODI ORG CONTROL POST</span>
          </div>

        </div>
      )}

      {activeSubPost === "security" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#050510]/80 border border-[#1e1e2d] rounded-xl p-4 space-y-3">
            <span className="text-[11px] text-cyan-400 font-mono uppercase">👮 Security Cordon Actions</span>
            <p className="text-xs text-slate-400">Command security guards and deploy local check perimeters:</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => {
                  speakText("Deploying secondary stanchion perimeters to Stand B exits.");
                  setTacticalLogs(["05:22 PM: Security deployed auxiliary stanchions near Stand B corridor.", ...tacticalLogs]);
                }}
                className="p-2.5 bg-slate-900/80 hover:bg-[#15162a] border border-slate-800 hover:border-slate-700 text-left text-[11px] text-slate-200 tracking-wide font-medium rounded transition-colors uppercase"
              >
                ⚙️ Deploy Stanchions
              </button>
              <button
                onClick={() => {
                  speakText("Recalibrating high speed metal detectors at Gate B.");
                  setTacticalLogs(["05:22 PM: Gate B electromagnetic check columns recalibrated to high throughput.", ...tacticalLogs]);
                }}
                className="p-2.5 bg-slate-900/80 hover:bg-[#15162a] border border-slate-800 hover:border-slate-700 text-left text-[11px] text-slate-200 tracking-wide font-medium rounded transition-colors uppercase"
              >
                🎟️ Recalibrate Turnstiles
              </button>
              <button
                onClick={() => {
                  speakText("Cordoning off VIP East concourse pathway for ambulance transit.");
                  setTacticalLogs(["05:22 PM: Blue VIP East road is locked for express medical ambulance transit.", ...tacticalLogs]);
                }}
                className="p-2.5 bg-slate-900/80 hover:bg-[#15162a] border border-slate-800 hover:border-slate-700 text-left text-[11px] text-slate-200 tracking-wide font-medium rounded transition-colors uppercase col-span-1 sm:col-span-2"
              >
                🚧 Establish Ambulance Cordon
              </button>
            </div>
          </div>

          {/* Quick Dispatch Panel */}
          <div className="bg-[#050510]/80 border border-[#1e1e2d] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 font-mono uppercase block mb-2">⚡ Direct Tactical Dispatch</span>
            
            <form onSubmit={handleManualDispatch} className="space-y-3">
              <p className="text-[10px] text-slate-500 leading-relaxed uppercase">Enter unit label to stage at Gate walkways (e.g. 'Tactical Unit QRT-1'):</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Unit name..."
                  value={customDispatchUnit}
                  onChange={(e) => setCustomDispatchUnit(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded px-2.5 py-1.5 text-xs text-white outline-none"
                />
                <button
                  type="submit"
                  className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-1.5 rounded text-xs font-bold font-mono tracking-wider transition-colors cursor-pointer"
                >
                  DISPATCH
                </button>
              </div>
            </form>

            <span className="text-[7.5px] font-mono text-slate-650 tracking-wider block mt-4 uppercase">AUTONOMOUS PATROL RADIAL NETWORK</span>
          </div>
        </div>
      )}

      {activeSubPost === "medical" && (
        <div className="bg-[#050510]/80 border border-[#1e1e2d] rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2 text-rose-500">
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span className="text-xs font-bold uppercase font-mono text-red-400">🏥 SW and NW Clinics Active Staging</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { name: "Southwest Clinic", status: "FLUID", capacity: "02 / 10 cases", code: "Staged SW Stairwell" },
              { name: "Northwest Clinic", status: "NOMINAL", capacity: "00 / 10 cases", code: "Staged NW Access Road" },
              { name: "Ambulance Team 1", status: "TRANSIT", capacity: "En route SE Concourse", code: "Siren active" },
            ].map((clinic, idx) => (
              <div key={idx} className="bg-slate-950/60 p-3 rounded border border-slate-900">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-bold text-slate-200">{clinic.name}</span>
                  <span className="text-[8px] bg-red-950/70 text-red-400 border border-red-900 px-1.5 rounded font-mono uppercase font-semibold">{clinic.status}</span>
                </div>
                <div className="text-[9px] font-mono mt-2 text-slate-500 uppercase">{clinic.capacity}</div>
                <div className="text-[9px] font-mono text-slate-400 mt-1">{clinic.code}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              speakText("Dispatching SW Paramedic emergency unit to SE concession gate.");
              setTacticalLogs(["05:22 PM: SW First Aid responder dispatched to East concourse hot sector.", ...tacticalLogs]);
            }}
            className="w-full py-2 bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-900/60 text-xs font-bold uppercase tracking-widest rounded transition-colors"
          >
            🚑 Direct SE Concession Emergency Dispatch
          </button>
        </div>
      )}

      {activeSubPost === "police" && (
        <div className="bg-[#050510]/80 border border-[#1e1e2d] rounded-xl p-4 space-y-4">
          <span className="text-[11px] text-indigo-400 font-mono tracking-wider uppercase block">🚓 Police Force Direct Coordination</span>
          <p className="text-xs text-slate-350 leading-relaxed font-sans">
            Police responders coordinate stadium outer perimeters. Trigger primary broad-spectrum emergency soundings and public advisory notifications in worst-case events:
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                speakText("sound alarm is warning. Spectators proceed according to instruction lines.");
                setTacticalLogs(["05:22 PM: Emergency stadium siren triggers activated. Audio broadcasting online.", ...tacticalLogs]);
              }}
              className="flex-1 py-2.5 bg-indigo-950/30 hover:bg-indigo-900/30 border border-indigo-900/60 text-indigo-400 text-xs font-bold uppercase tracking-wider rounded transition-colors"
            >
              🚨 Sound PA Broad-Spectrum Alarm
            </button>
            <button
              onClick={() => {
                speakText("Flashing visual emergency indicators inside all stadium stands.");
                setTacticalLogs(["05:22 PM: High-visibility visual exit signboards flashed stadium-wide.", ...tacticalLogs]);
              }}
              className="flex-1 py-2.5 bg-slate-900/80 hover:bg-[#15162a] border border-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider rounded transition-colors"
            >
              💡 Flash High-Vis Walkway Exit Signage
            </button>
          </div>
        </div>
      )}

      {/* DISPATCH ACTION LOGS FEED (At the bottom of Dashboard Command component) */}
      <div className="border-t border-[#1e1e2d] pt-3.5 space-y-2">
        <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase block flex items-center gap-1">
          <FileText className="w-3.5 h-3.5" /> Direct Dispatch Logs
        </span>
        <div className="bg-[#030307] border border-slate-900 rounded p-2.5 h-20 overflow-y-auto font-mono text-[10px] space-y-1 text-slate-400">
          {tacticalLogs.map((log, index) => (
            <div key={index} className="truncate flex items-center gap-1.5">
              <span className="text-slate-600">&raquo;</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
