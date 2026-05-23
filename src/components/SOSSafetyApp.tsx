import React, { useState } from "react";
import { MessageSquare, Smartphone, Send, AlertTriangle, ShieldCheck, Zap, Radio, Check } from "lucide-react";

interface SOSSafetyAppProps {
  evacuationActive: boolean;
  blockedGates: string[];
  simulationMinutes: number;
  speakText: (text: string) => void;
  onActivateEvacuation: () => void;
  onDeactivateEvacuation: () => void;
  onResetAll?: () => void;
}

export default function SOSSafetyApp({
  evacuationActive,
  blockedGates,
  simulationMinutes,
  speakText,
  onActivateEvacuation,
  onDeactivateEvacuation,
  onResetAll
}: SOSSafetyAppProps) {
  const [mobileSkin, setMobileSkin] = useState<"ipl_app" | "whatsapp">("ipl_app");
  const [alertText, setAlertText] = useState<string>("");
  const [publishedNotification, setPublishedNotification] = useState<string>(
    "⚠️ EMERGENCY ADVISORY: Potential crowding near Exit B. All fans in Stand C please exit via Gate 2 instead of Gate 5. Walk calmly. Dynamic safe vectors are illuminated in green."
  );
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendingLogs, setSendingLogs] = useState<string[]>([]);
  const [isDelivered, setIsDelivered] = useState<boolean>(true);

  // Triggering SOS preset advisories
  const handleApplyPresetSms = (presetType: "rain" | "gate_b" | "concourse") => {
    let msg = "";
    if (presetType === "rain") {
      msg = "⛈️ WEATHER EVACUATION CALL: Match delayed due to sudden cloudburst. Please evacuate Stand A & B through Exit corridors North calmly and steadily.";
    } else if (presetType === "gate_b") {
      msg = "⚠️ BOTTLENECK REDIRECT: Turnstiles offline at Gate B. All fans proceed to alternate Exit D. Estimated walking duration: 3 minutes.";
    } else {
      msg = "🚨 WALKWAY HOLDING ORDER: High excitement concourse congestion detected. Hold position in Stand C for 5 minutes. Security detail Unit Alpha dispatched.";
    }
    setAlertText(msg);
    setIsDelivered(false); // user has unsubmitted change
    speakText(`Preloaded preset message: ${msg.substring(0, 45)}... Enter any custom adjustments, then press Publish Broadcast to dispatch.`);
  };

  // Submit dynamic Alert Text
  const handlePublishBroadcastSms = (e: React.FormEvent) => {
    e.preventDefault();
    const finalMsg = alertText.trim() || "⚠️ STADIUM EMERGENCY ORDER — Please proceed calm, follow safety stewards towards your nearest marked green exit way.";
    
    setIsSending(true);
    speakText(`Broadcasting emergency safety alert to all active spectators inside Modi Stadium.`);
    
    setTimeout(() => {
      setPublishedNotification(finalMsg);
      setIsSending(false);
      setIsDelivered(true);
      const currentTime = new Date().toLocaleTimeString();
      setSendingLogs([
        `${currentTime}: DISPATCHED Alert to IPL App Subscriber Pool Successfully.`,
        `${currentTime}: Broadcasted WhatsApp safety message to Stand C users.`,
        ...sendingLogs
      ]);
      onActivateEvacuation(); // Toggle map flow lines!
    }, 1200);
  };

  const handleDeactivateSOS = () => {
    setPublishedNotification("⚠️ STATUS NORMAL: Emergency cleared. Stadium operates under baseline procedures.");
    setAlertText("");
    setIsDelivered(true);
    const currentTime = new Date().toLocaleTimeString();
    setSendingLogs([
      `${currentTime}: DEACTIVATION SIGNAL: Cancelled all broadcasts. Sent baseline status alerts.`,
      ...sendingLogs
    ]);
    onDeactivateEvacuation();
    if (onResetAll) {
      onResetAll();
    }
    speakText("Emergency alert deactivated. Broadcasting safety resolution update. Resetted all stadium map twin lines.");
  };

  return (
    <div className="bg-[#0b0c16]/95 border border-[#1e1e2d] rounded-xl p-4 md:p-5 shadow-2xl space-y-5">
      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-red-500 animate-pulse" />
            Active Fan SOS &amp; Broadcast Channel
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Simulate fans receiving personalized GPS alerts via WhatsApp or the official IPL mobile app.
          </p>
        </div>
        <div className="bg-red-950/40 px-2 rounded border border-red-900 text-[9px] text-red-400 font-mono uppercase py-0.5 tracking-wider font-semibold animate-pulse">
          APIs CONNECTED &bull; LIVE BROADCAST SIM
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Curved Smartphone Frame Mockup - 5 Cols */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-[280px] h-[525px] bg-[#020205] border-[6px] border-[#181829] rounded-[36px] overflow-hidden shadow-2xl relative flex flex-col justify-between font-sans">
            
            {/* Speaker Camera Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#181829] rounded-b-xl z-20 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
              <span className="w-8 h-1 bg-slate-800 rounded-full"></span>
            </div>

            {/* Mobile Status Header */}
            <div className="bg-[#0b0b14] px-4 pt-6 pb-2 border-b border-slate-900 flex justify-between items-center text-[9px] font-mono text-slate-500 select-none z-10">
              <span className="font-semibold text-slate-400">05:22 PM</span>
              <div className="flex items-center gap-1">
                <span>5G LTE</span>
                <span className="w-3.5 h-2 border border-slate-600 rounded-sm flex p-0.5"><span className="h-full w-2 bg-emerald-500 rounded-2xs"></span></span>
              </div>
            </div>

            {/* INTERACTIVE DEVICE CONTENT BODY */}
            <div className="flex-1 bg-slate-950/80 p-3 overflow-y-auto space-y-3 flex flex-col justify-start relative scrollbar-none">
              
              {/* App Selector inside device */}
              <div className="flex bg-[#050510] border border-slate-900 p-1 rounded-md text-[8px] font-mono text-center gap-1">
                <button
                  onClick={() => setMobileSkin("ipl_app")}
                  className={`flex-1 py-1 rounded transition-colors ${
                    mobileSkin === "ipl_app" ? "bg-cyan-950 text-cyan-400 font-bold" : "text-slate-500 hover:text-slate-350"
                  }`}
                >
                  🏏 IPL APP SKIN
                </button>
                <button
                  onClick={() => setMobileSkin("whatsapp")}
                  className={`flex-1 py-1 rounded transition-colors ${
                    mobileSkin === "whatsapp" ? "bg-emerald-950 text-emerald-400 font-bold" : "text-slate-500 hover:text-slate-350"
                  }`}
                >
                  💬 WHATSAPP SKIN
                </button>
              </div>

              {/* IPL Flagship layout mockup */}
              {mobileSkin === "ipl_app" && (
                <div className="space-y-3">
                  {/* Official ipl header bar inside phone */}
                  <div className="bg-[#0c0d29] px-2.5 py-1.5 rounded border border-[#1b1d42] flex justify-between items-center text-[9px] uppercase tracking-wider font-bold">
                    <span className="text-[#3b82f6]">🏏 MI VS KKR</span>
                    <span className="text-amber-400">Live Match</span>
                  </div>

                  {/* Golden Emergency Warning Card */}
                  <div className="bg-gradient-to-br from-[#1b0d0c]/90 to-[#020205] border border-red-800 rounded-xl p-3 shadow-lg relative overflow-hidden animate-[pulse_2s_infinite]">
                    <div className="absolute top-1 right-2 animate-ping font-mono text-[8px] text-red-500 font-black">SOS</div>
                    
                    <span className="text-[8px] text-red-400 font-mono tracking-widest uppercase block mb-1">
                      ⚠️ CRITICAL ALERT UPDATE
                    </span>
                    <h5 className="text-[11px] font-black text-white font-sans uppercase mb-1 flex items-center gap-1">
                      Safe Evacuation Route
                    </h5>
                    
                    <p className="text-[10px] text-slate-300 leading-relaxed font-sans mt-1.5 border-t border-red-950 pt-1.5">
                      {publishedNotification}
                    </p>

                    {/* Compact map visualization on display */}
                    <div className="mt-3 bg-[#0d0a0d] border border-red-950 p-2 rounded-lg flex flex-col gap-1 items-center justify-center">
                      <span className="text-[7.5px] font-mono text-slate-500">RECOMMENDED EGRESS VECTOR</span>
                      
                      {/* Simple SVG arrow routing on screen */}
                      <svg className="h-10 w-32" viewBox="0 0 100 40">
                        <line x1="10" y1="20" x2="80" y2="20" stroke="#ff4444" strokeWidth="2.5" strokeDasharray="3 3" />
                        <polygon points="80,15 92,20 80,25" fill="#ff4444" />
                        <text x="35" y="12" fill="#00d4ff" textAnchor="middle" className="text-[8px] font-mono">GATE 2 DIRECT</text>
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Whatsapp green brand mockup */}
              {mobileSkin === "whatsapp" && (
                <div className="space-y-2.5">
                  {/* WhatsApp brand header */}
                  <div className="bg-[#0b2b1d] px-2 py-1.5 rounded border border-emerald-900 flex justify-between items-center text-[9px] text-[#00ff99] font-mono uppercase tracking-wider">
                    <span>💬 Modi Stadium Control ✅</span>
                    <span className="text-[7px] text-slate-400 lowercase">online</span>
                  </div>

                  {/* Chat bubbles */}
                  <div className="bg-[#05050f]/80 p-2 rounded-lg border border-slate-900 text-[8.5px] text-slate-400 font-mono text-center">
                    This is official broadcast from security warden command. Message sent via IPL App APIs.
                  </div>

                  {/* Main chat bubble dispatch */}
                  <div className="bg-[#0b291d] border border-emerald-950 p-2.5 rounded-lg text-slate-200 text-[10px] leading-relaxed relative ml-4 font-sans shadow-md">
                    <span className="text-[8px] text-slate-400 font-mono mb-1 block">Modi Safety Broadcast</span>
                    {publishedNotification}
                    <span className="text-[7.5px] font-mono block text-right mt-1.5 text-slate-400">05:22 PM</span>
                  </div>
                </div>
              )}

            </div>

            {/* Mobile Footer Area */}
            <div className="bg-[#06060c] py-2 border-t border-slate-900 text-center text-slate-600 text-[7px] font-mono uppercase">
              Swipe to unlock emergency guidelines
            </div>

          </div>
        </div>

        {/* Right Column: Simulator Broadcast Control Deck - 7 Cols */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Preset Buttons */}
          <div className="bg-slate-950 p-3 rounded-lg border border-[#1e1e2d] space-y-2">
            <span className="text-[10px] text-slate-500 font-mono block uppercase">
              ⚡ Pre-Programmed Advisory Presets
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              <button
                onClick={() => handleApplyPresetSms("rain")}
                className="py-1.5 px-2 bg-slate-900 hover:bg-[#15162a] text-slate-300 text-[9px] font-semibold border border-slate-800 rounded uppercase tracking-wider text-left block cursor-pointer"
              >
                ⛈️ Rain Delays
              </button>
              <button
                onClick={() => handleApplyPresetSms("gate_b")}
                className="py-1.5 px-2 bg-slate-900 hover:bg-[#15162a] text-slate-300 text-[9px] font-semibold border border-slate-800 rounded uppercase tracking-wider text-left block cursor-pointer"
              >
                🎟️ Gate B Offline
              </button>
              <button
                onClick={() => handleApplyPresetSms("concourse")}
                className="py-1.5 px-2 bg-slate-900 hover:bg-[#15162a] text-slate-300 text-[9px] font-semibold border border-slate-800 rounded uppercase tracking-wider text-left block cursor-pointer"
              >
                🚨 Stand C Hold
              </button>
            </div>
          </div>

          {/* Broadcast Form (Strict Custom Alert Input) */}
          <form onSubmit={handlePublishBroadcastSms} className="bg-slate-950/60 p-4 rounded-xl border border-[#1e1e2d] space-y-3.5">
            <span className="text-[10px] text-slate-500 font-mono block uppercase">
              ✍️ Custom SMS / Notification Broadcast Editor
            </span>
            
            <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans font-normal">
              Type any custom emergency instruction below. Clicking "Publish SOS Broadcast" pushes the text onto active subscriber phone feeds and triggers dynamic exit routing on the map digital twin!
            </p>

            <textarea
              rows={4}
              value={alertText}
              onChange={(e) => setAlertText(e.target.value)}
              placeholder="E.g., WARNING: High congestion at Gate 5 turnstiles. Spectators please redirect through Gate 2 Exit lanes. Estimated walking clearance: 2 minutes..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded p-2.5 text-xs text-white outline-none font-sans leading-relaxed"
            />

            <div className="flex justify-between items-center pt-2 border-t border-slate-900">
              <span className="text-[9px] text-[#00ffff] font-mono uppercase tracking-wider flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                Target Pool: Stand C &amp; G-B (42,000 Fans)
              </span>
              
              <button
                type="submit"
                disabled={isSending}
                className={`py-1.5 px-5 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isSending
                    ? "bg-red-950 text-red-400 font-mono animate-pulse cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.3)] active:scale-95 flex items-center gap-1.5"
                }`}
              >
                {isSending ? (
                  "Sending App Pushes..."
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Publish SOS Broadcast
                  </>
                )}
              </button>
            </div>
          </form>

          {/* SIMULATOR OUTPUT LOGS */}
          <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900 space-y-2">
            <span className="text-[8px] text-slate-500 font-mono block uppercase">
              📶 Subscriber API Broadcast Logs
            </span>
            <div className="bg-slate-950 h-16 rounded overflow-y-auto font-mono text-[9px] text-slate-500 space-y-1 p-2 border border-slate-950">
              {sendingLogs.length > 0 ? (
                sendingLogs.map((log, index) => (
                  <div key={index} className="flex gap-1.5 items-center select-none truncate">
                    <span className="text-emerald-500">✓</span>
                    <span className="text-slate-400">{log}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-650 italic text-center pt-3 select-none">No active broadcasts logged. Enter text above to trigger.</div>
              )}
            </div>
          </div>

          {/* EMERGENCY DEACTIVATION / RESOLUTION TOOLBAR */}
          <div className="bg-red-950/15 border border-red-900/30 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-red-400 font-mono uppercase block">Emergency Resolution System</span>
              <p className="text-[9.5px] text-slate-400 font-sans">
                Deactivate active SOS broadcast, restore stadium parameters and silence safety announcements.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDeactivateSOS}
              className="py-1.5 px-4 bg-red-950/85 hover:bg-red-900 text-red-200 hover:text-white border border-red-800 rounded font-mono text-[10px] font-bold uppercase transition-all tracking-wider flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Clear &amp; Reset Nominals
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
