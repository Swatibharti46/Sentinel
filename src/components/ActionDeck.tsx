/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Siren, ShieldAlert, Radio, Landmark, ToggleLeft, ToggleRight, MapPin, Activity, HelpCircle } from "lucide-react";

interface ActionDeckProps {
  onTriggerAction: (actionId: string) => void;
  evacuationActive: boolean;
  heatmapActive: boolean;
  onToggleHeatmap: () => void;
  blockedGatesCount: number;
}

export default function ActionDeck({
  onTriggerAction,
  evacuationActive,
  heatmapActive,
  onToggleHeatmap,
  blockedGatesCount
}: ActionDeckProps) {
  return (
    <div id="action_deck_component" className="bg-[#11111a] border border-[#1e1e2d] rounded-xl p-4 shadow-xl text-white">
      {/* Action Deck Header */}
      <div className="flex items-center gap-2 mb-3 border-b border-[#1e1e2d] pb-2">
        <ShieldAlert className="w-4 h-4 text-[#ff4444]" />
        <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-300 font-sans animate-pulse">
          Tactical Operations Override Deck
        </h3>
      </div>

      {/* Button Rail grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        
        {/* Evacuation emergency protocol */}
        <button
          onClick={() => onTriggerAction("ACTION_EVAC")}
          className={`flex flex-col justify-between p-3.5 rounded-lg border text-left transition-all group cursor-pointer ${
            evacuationActive
              ? "bg-[rgba(255,68,68,0.08)] border-[#ff4444]/50 text-[#ff4444] shadow-[0_0_15px_rgba(255,68,68,0.2)]"
              : "bg-[#050507]/45 border-[#1e1e2d] hover:border-slate-700 hover:bg-[#0a0a0f]/40 text-slate-200"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <Siren className={`w-5 h-5 ${evacuationActive ? "text-red-500 animate-spin" : "text-[#ff4444]"}`} />
            <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${
              evacuationActive ? "bg-red-950 text-red-300 border-[#ff4444]/40" : "bg-slate-900 text-slate-500 border-slate-800"
            }`}>
              {evacuationActive ? "ENGAGED" : "OFFLINED"}
            </span>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-tight font-sans leading-none">Emergency Evac Code</h4>
            <span className="text-[9px] text-slate-500 font-mono block mt-1">Deploy Exits & Reroute Flow</span>
          </div>
        </button>

        {/* Dynamic Stadium Heatmap toggle */}
        <button
          onClick={onToggleHeatmap}
          className={`flex flex-col justify-between p-3.5 rounded-lg border text-left transition-all group cursor-pointer ${
            heatmapActive
              ? "bg-[rgba(242,125,38,0.08)] border-[#f27d26]/45 text-[#f27d26]"
              : "bg-[#050507]/45 border-[#1e1e2d] hover:border-slate-700 hover:bg-[#0a0a0f]/40 text-slate-200"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <Radio className="w-5 h-5 text-amber-500" />
            <span>
              {heatmapActive ? (
                <ToggleRight className="w-6 h-6 text-amber-400" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-slate-500" />
              )}
            </span>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-tight font-sans leading-none">Sensor Density Overlay</h4>
            <span className="text-[9px] text-slate-500 font-mono block mt-1">Toggle Hotspot Thermal Plot</span>
          </div>
        </button>

        {/* Dispatch emergency response units */}
        <button
          onClick={() => onTriggerAction("ACTION_DISPATCH")}
          className="flex flex-col justify-between p-3.5 rounded-lg border bg-[#050507]/45 border-[#1e1e2d] hover:border-[#00d4ff]/40 hover:bg-[#0a0a0f]/40 text-slate-200 text-left transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <ShieldAlert className="w-5 h-5 text-[#00d4ff]" />
            <span className="text-[8px] font-mono bg-slate-900 text-slate-500 border border-slate-800 px-1.5 py-0.5 rounded">READY</span>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-tight font-sans leading-none">Dispatch Mobile Teams</h4>
            <span className="text-[9px] text-slate-500 font-mono block mt-1">QRT Security & Paramedics deployment</span>
          </div>
        </button>

        {/* Gate B Relief bypass toggle */}
        <button
          onClick={() => onTriggerAction("ACTION_GATE_B_TOGGLE")}
          className={`flex flex-col justify-between p-3.5 rounded-lg border text-left transition-all group cursor-pointer ${
            blockedGatesCount > 0
              ? "bg-[rgba(255,68,68,0.08)] border-[#ff4444]/40 text-[#ff4444]"
              : "bg-[#050507]/45 border-[#1e1e2d] hover:border-slate-700 hover:bg-[#0a0a0f]/40 text-slate-200"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <MapPin className="w-5 h-5 text-[#ff4444]" />
            <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${
              blockedGatesCount > 0 ? "bg-rose-950 text-rose-300 border-[#ff4444]/40" : "bg-slate-900 text-slate-500 border-slate-800"
            }`}>
              {blockedGatesCount > 0 ? "GATE_B CLOSED" : "ALL OPEN"}
            </span>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-tight font-sans leading-none">Bypass Gate Bstile</h4>
            <span className="text-[9px] text-slate-500 font-mono block mt-1">Force close turnstile / open Gate C</span>
          </div>
        </button>

        {/* Public Warning alerts broadcast dispatch */}
        <button
          onClick={() => onTriggerAction("ACTION_ALERTS")}
          className="flex flex-col justify-between p-3.5 rounded-lg border bg-[#050507]/45 border-[#1e1e2d] hover:border-[#00ff00]/40 hover:bg-[#0a0a0f]/40 text-slate-200 text-left transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <Radio className="w-5 h-5 text-[#00ff00] stroke-[2.5]" />
            <span className="text-[8px] font-mono bg-slate-900 text-slate-500 border border-slate-800 px-1.5 py-0.5 rounded">ONLINE</span>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-tight font-sans leading-none">Broadcast Public Announcement</h4>
            <span className="text-[9px] text-slate-500 font-mono block mt-1">Inject Audio Loops to Stadium Screens</span>
          </div>
        </button>

      </div>
    </div>
  );
}
