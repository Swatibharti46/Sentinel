/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Cpu, CheckCircle2, AlertTriangle, ShieldCheck, Route, Eye, Users, Radio, MessageSquare, BrainCircuit } from "lucide-react";
import { AgentDiagnostics, RiskLevel } from "../types";

interface AgentTelemetryProps {
  diagnostics: AgentDiagnostics[];
}

export default function AgentTelemetry({ diagnostics }: AgentTelemetryProps) {
  
  const getAgentIcon = (agentId: string) => {
    switch (agentId) {
      case "AGENT_CROWD":
        return <Users className="w-4 h-4 text-sky-400 stroke-[1.5]" />;
      case "AGENT_ROUTING":
        return <Route className="w-4 h-4 text-[#00ff00] stroke-[1.5]" />;
      case "AGENT_EMERGENCY":
        return <ShieldCheck className="w-4 h-4 text-[#ff4444] stroke-[1.5]" />;
      case "AGENT_COMM":
        return <Radio className="w-4 h-4 text-[#00d4ff] stroke-[1.5]" />;
      case "AGENT_SECURITY":
        return <ShieldCheck className="w-4 h-4 text-[#f27d26] stroke-[1.5]" />;
      case "AGENT_PREDICTIVE":
        return <BrainCircuit className="w-4 h-4 text-indigo-400 stroke-[1.5]" />;
      case "AGENT_VISUALIZATION":
        return <Eye className="w-4 h-4 text-pink-400 stroke-[1.5]" />;
      case "AGENT_VOICE":
        return <MessageSquare className="w-4 h-4 text-purple-400 stroke-[1.5]" />;
      default:
        return <Cpu className="w-4 h-4 text-teal-400 stroke-[1.5]" />;
    }
  };

  return (
    <div id="multi_agent_telemetry_grid" className="bg-[#11111a] border border-[#1e1e2d] rounded-xl p-4 shadow-xl text-white">
      {/* Grid Title Header */}
      <div className="flex items-center gap-2 mb-4 border-b border-[#1e1e2d] pb-3">
        <Cpu className="w-4 h-4 text-[#00ff00] animate-pulse" />
        <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-300 font-sans">
          Sentinel Multi-Agent Pulse telemetry
        </h3>
      </div>

      {/* Grid Layout Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {diagnostics.map(agent => (
          <div
            key={agent.agentId}
            className="bg-[#050507]/45 border border-[#1e1e2d] hover:border-[#00d4ff]/30 p-3 rounded-lg flex flex-col justify-between transition-all hover:bg-[#0a0a0f]/40"
          >
            {/* Title & Status Block */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="p-1 bg-slate-900 border border-[#1e1e2d] rounded">
                    {getAgentIcon(agent.agentId)}
                  </span>
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-200 tracking-tight leading-none uppercase">
                      {agent.name.replace("Agent", "").trim()}
                    </h4>
                    <span className="text-[8px] text-slate-505 font-mono tracking-wide uppercase">Active Telemetry</span>
                  </div>
                </div>
                <span className={`text-[8px] px-2 py-0.5 rounded-full font-mono uppercase font-semibold border ${
                  agent.status === "ALERT"
                    ? "bg-[rgba(255,68,68,0.08)] text-[#ff4444] border-[#ff4444]/30"
                    : agent.status === "ANALYZING"
                    ? "bg-[rgba(242,125,38,0.08)] text-[#f27d26] border-[#f27d26]/30"
                    : "bg-[rgba(0,255,0,0.08)] text-[#00ff00] border-[#00ff00]/30"
                }`}>
                  {agent.status}
                </span>
              </div>

              {/* Core Analytical Output statement */}
              <p className="text-[11px] text-slate-400 font-sans italic my-2">
                "{agent.analysis}"
              </p>
            </div>

            {/* Bottom Metrics Bar */}
            <div className="border-t border-[#1e1e2d] pt-2.5 mt-2">
              <div className="flex justify-between items-center text-[10px] text-slate-500">
                <span className="font-mono">CONFIDENCE INDEX</span>
                <span className="font-mono text-[#00ff00] font-semibold">{agent.confidenceScore}%</span>
              </div>
              <div className="w-full bg-[#11111a] h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#00d4ff] to-[#00ff00] h-full rounded-full transition-all duration-500"
                  style={{ width: `${agent.confidenceScore}%` }}
                ></div>
              </div>

              {/* Priority Action Badge */}
              {agent.riskImpactCode && (
                <div className="mt-2.5 bg-[#050507] border border-[#1e1e2d] px-2 py-1 rounded text-[9px] text-sky-450 font-mono flex items-center justify-between">
                  <span className="truncate max-w-[140px]">{agent.riskImpactCode}</span>
                  <span className="text-[8px] text-slate-500 tracking-tighter uppercase font-semibold">Impact score</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
