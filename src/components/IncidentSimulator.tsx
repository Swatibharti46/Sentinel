/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AlertCircle, CloudLightning, Bomb, Users, UserCheck, Settings, Landmark } from "lucide-react";
import { INCIDENT_TEMPLATES, IncidentTemplate } from "../data";

interface IncidentSimulatorProps {
  onTriggerIncident: (template: IncidentTemplate) => void;
  activeIncidentId: string | null;
  onResetIncident: () => void;
}

export default function IncidentSimulator({
  onTriggerIncident,
  activeIncidentId,
  onResetIncident
}: IncidentSimulatorProps) {
  
  const getIcon = (category: string) => {
    switch (category) {
      case "CROWD_SURGE":
        return <Users className="w-4 h-4 text-orange-400" />;
      case "WEATHER_IMPACT":
        return <CloudLightning className="w-4 h-4 text-sky-400" />;
      case "SECURITY_THREAT":
        return <Bomb className="w-4 h-4 text-red-400" />;
      case "VIP_MOVEMENT":
        return <Landmark className="w-4 h-4 text-teal-400" />;
      case "INFRASTRUCTURE":
        return <Settings className="w-4 h-4 text-amber-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div id="incident_simulator_component" className="bg-[#11111a] border border-[#1e1e2d] rounded-xl p-4 shadow-xl flex flex-col h-full text-white">
      <div className="flex items-center justify-between mb-4 border-b border-[#1e1e2d] pb-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#ff4444] animate-pulse" />
          <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-300 font-sans">
            Incident Injector Console
          </h3>
        </div>
        {activeIncidentId && (
          <button
            onClick={onResetIncident}
            className="text-[10px] bg-[rgba(0,255,0,0.08)] text-[#00ff00] border border-[#00ff00]/40 px-2 py-1 rounded hover:bg-[rgba(0,255,0,0.15)] transition-colors font-mono uppercase font-semibold"
          >
            STABILIZE ALL / NORMAL
          </button>
        )}
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
        {INCIDENT_TEMPLATES.map(item => {
          const isActive = activeIncidentId === item.id;
          const severityClass =
            item.severity === "CRITICAL"
              ? "border-red-500 text-red-400 bg-red-950/20"
              : item.severity === "HIGH"
              ? "border-orange-500 text-orange-400 bg-orange-950/20"
              : "border-sky-500 text-sky-450 bg-sky-950/20";

          return (
            <div
              key={item.id}
              onClick={() => onTriggerIncident(item)}
              className={`border rounded-lg p-3 cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                isActive
                  ? "bg-gradient-to-r from-[#171a2d] to-[#11111a] border-[#00d4ff] shadow-[0_0_15px_rgba(0,212,255,0.15)] scale-[1.01]"
                  : "bg-[#050507]/45 border-[#1e1e2d] hover:border-slate-700 hover:bg-[#0a0a0f]/40"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className={`p-1.5 rounded-md border ${severityClass}`}>
                    {getIcon(item.category)}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-tight">{item.title}</h4>
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{item.category}</span>
                  </div>
                </div>
                <span className={`text-[8px] px-1.5 py-0.5 rounded border font-mono font-bold tracking-wider ${
                  item.severity === "CRITICAL"
                    ? "bg-red-950 text-red-400 border-red-800/60"
                    : "bg-orange-950 text-orange-400 border-orange-850/60"
                }`}>
                  {item.severity}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 font-sans line-clamp-2">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
