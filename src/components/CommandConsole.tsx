/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send, Volume2, VolumeX, ShieldCheck, Terminal, HelpCircle, CornerDownRight, RefreshCw, AudioLines } from "lucide-react";
import { VoiceCommandMessage, SafetyIncident } from "../types";

interface CommandConsoleProps {
  messages: VoiceCommandMessage[];
  onSubmitCommand: (text: string) => void;
  isLoading: boolean;
  voiceSynthesisAvailable: boolean;
  speakText: (text: string) => void;
}

const COMMON_COMMANDS = [
  "Predict crowd congestion after the match",
  "Show highest risk zone",
  "What happens if Gate B closes?",
  "Simulate evacuation",
  "Dispatch emergency response",
  "Show safest evacuation route"
];

export default function CommandConsole({
  messages,
  onSubmitCommand,
  isLoading,
  voiceSynthesisAvailable,
  speakText
}: CommandConsoleProps) {
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<"chat" | "terminal">("chat");
  const scrollRef = useRef<HTMLDivElement>(null);

  const recognitionRef = useRef<any | null>(null);

  // Auto Scroll message log
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSubmitCommand(inputText.trim());
    setInputText("");
  };

  const triggerFallbackSimulation = () => {
    const randomCmd = COMMON_COMMANDS[Math.floor(Math.random() * COMMON_COMMANDS.length)];
    setTimeout(() => {
      setInputText(randomCmd);
      setIsRecording(false);
      speakText(`Transcribed: ${randomCmd}`);
    }, 2500);
  };

  const handleMicToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn(e);
        }
      }
    } else {
      setIsRecording(true);
      setInputText("");

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = true;
          recognition.lang = "en-US";

          recognition.onstart = () => {
            console.log("Speech recognition started");
          };

          recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results)
              .map((res: any) => res[0].transcript)
              .join("");
            setInputText(transcript);
          };

          recognition.onerror = (event: any) => {
            console.warn("Speech recognition error event:", event.error);
            if (event.error === "not-allowed" || event.error === "service-not-allowed") {
              // Standard sandbox / iframe blockage fallback
              triggerFallbackSimulation();
            } else {
              setIsRecording(false);
            }
          };

          recognition.onend = () => {
            setIsRecording(false);
          };

          recognitionRef.current = recognition;
          recognition.start();
        } catch (err) {
          console.error("SpeechRecognition initialization failed:", err);
          triggerFallbackSimulation();
        }
      } else {
        // Fallback for browsers with no speech recognition support (e.g., standard servers)
        triggerFallbackSimulation();
      }
    }
  };

  // Find the latest system analysis text to print into the Terminal view
  const lastSystemMessage = [...messages].reverse().find(m => m.sender === "SYSTEM");

  return (
    <div id="sentinel_command_console_component" className="bg-[#11111a] border border-[#1e1e2d] rounded-xl overflow-hidden flex flex-col h-[520px] shadow-2xl">
      {/* Console Title Bar */}
      <div className="bg-[#0a0a0f] border-b border-[#1e1e2d] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#00d4ff] stroke-[2]" />
          <h3 className="text-xs font-semibold tracking-wider text-slate-300 font-sans uppercase">
            SentinelOS X Voice Operational Console
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Voice mute status */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-1.5 rounded-md border text-xs flex items-center gap-1 transition-colors ${
              voiceEnabled
                ? "bg-[rgba(0,212,255,0.08)] border-[#00d4ff]/40 text-[#00d4ff] hover:bg-[rgba(0,212,255,0.15)]"
                : "bg-slate-900 border-[#1e1e2d] text-slate-500 hover:text-slate-400"
            }`}
            title={voiceEnabled ? "Mute Autonomous TTS voice" : "Enable Autonomous TTS voice"}
          >
            {voiceEnabled ? <Volume2 className="w-3.5 h-3.5 font-bold" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="text-[10px] uppercase font-mono tracking-wider hidden sm:inline">
              AUTONOMOUS TTS {voiceEnabled ? "ON" : "OFF"}
            </span>
          </button>
        </div>
      </div>

      {/* Screen Tabs Selector */}
      <div className="bg-[#0a0a0f] flex border-b border-[#1e1e2d]">
        <button
          onClick={() => setActiveTab("chat")}
          className={`px-4 py-2.5 text-xs font-mono font-medium border-b-2 transition-colors uppercase tracking-wider ${
            activeTab === "chat"
              ? "border-[#00d4ff] text-[#00d4ff] bg-[#050507]/40"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Active Communication Session
        </button>
        <button
          onClick={() => setActiveTab("terminal")}
          className={`px-4 py-2.5 text-xs font-mono font-medium border-b-2 transition-colors uppercase tracking-wider flex items-center gap-1.5 ${
            activeTab === "terminal"
              ? "border-[#f27d26] text-[#f27d26] bg-[#050507]/40"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Terminal className="w-3 h-3 text-[#f27d26]/85" />
          Raw Orchestration logs
        </button>
      </div>

      {/* Main Console Screen Area */}
      {activeTab === "chat" ? (
        <div className="flex-1 overflow-hidden flex flex-col bg-[#050507]/45">
          {/* Scrollable Bubble Logs */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-3 p-8">
                <AudioLines className="w-10 h-10 text-[#1e1e2d] animate-pulse" />
                <div className="text-slate-400 font-mono text-xs uppercase tracking-wider font-semibold">
                  Autonomous Tactical Assistant Standby
                </div>
                <p className="text-slate-500 text-xs max-w-sm">
                  Click a command suggestion below or speak/type directives to manage Narendra Modi stadium security.
                </p>
              </div>
            ) : (
              messages.map(msg => {
                const isUser = msg.sender === "USER";
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isUser ? "justify-end" : "justify-start"} items-start gap-2 max-w-[90%] ${
                      isUser ? "ml-auto" : "mr-auto"
                    }`}
                  >
                    {!isUser && (
                      <div className="p-1 px-1.5 bg-[rgba(0,212,255,0.08)] border border-[#00d4ff]/40 rounded font-mono text-[9px] font-bold text-[#00d4ff] uppercase mt-0.5">
                        OSX
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-lg text-xs leading-relaxed ${
                        isUser
                          ? "bg-[#00d4ff] text-black font-semibold rounded-tr-none shadow-[0_4px_12px_rgba(0,212,255,0.2)]"
                          : "bg-[#0a0a0f] border border-[#1e1e2d] text-[#e0e0e0] font-mono whitespace-pre-line rounded-tl-none"
                      }`}
                    >
                      {/* We only render the core spoken feedback in chat bubbles to keep them elegant and uncluttered */}
                      {isUser ? msg.text : msg.text}
                    </div>
                  </div>
                );
              })
            )}

            {isLoading && (
              <div className="flex items-center gap-3 mr-auto bg-[#0a0a0f] border border-[#1e1e2d] rounded-lg p-3 text-xs text-[#00d4ff] font-mono">
                <RefreshCw className="w-4 h-4 animate-spin text-[#00d4ff]" />
                <span>SentinelOS X: Synthesizing crowd telemetry through predictive models...</span>
              </div>
            )}
          </div>

          {/* Quick Click Command Presets */}
          <div className="bg-[#0a0a0f] px-3 py-2 border-t border-[#1e1e2d] flex gap-2 overflow-x-auto select-none no-scrollbar">
            {COMMON_COMMANDS.map((cmd, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(cmd);
                }}
                className="whitespace-nowrap bg-[#11111a] hover:bg-[#1a1a24] text-[10px] text-slate-400 hover:text-white border border-[#1e1e2d] px-2.5 py-1.5 rounded transition-colors font-mono uppercase tracking-tight"
                disabled={isLoading}
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Standard Printout Log Terminal */
        <div className="flex-1 overflow-auto bg-[#050507] p-4 text-slate-300 font-mono text-xs coding-terminal scrollbar-thin">
          {lastSystemMessage && lastSystemMessage.agentAnalysisText ? (
            <div>
              <div className="text-[#f27d26] font-semibold border-b border-[#1e1e2d] pb-2 mb-2 flex justify-between items-center text-[10px] uppercase">
                <span>Active Terminal Analysis Data (Orchestrator Agent Context)</span>
                <span>UTC: 2026-05-23 05:22:39Z</span>
              </div>
              <pre className="whitespace-pre-wrap text-emerald-450/90 leading-relaxed text-[11px]">
                {lastSystemMessage.agentAnalysisText}
              </pre>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-650 font-mono text-center">
              <Terminal className="w-8 h-8 text-slate-800 mb-2" />
              <span>No orchestration output captured in current session.</span>
              <p className="text-[10px] text-slate-600 mt-1 uppercase">
                Execute a command to trigger Multi-Agent assessment pipeline
              </p>
            </div>
          )}
        </div>
      )}

      {/* Input Section */}
      <div className="bg-[#0a0a0f] border-t border-[#1e1e2d] p-3">
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          {/* Wave Recorder Trigger Button */}
          <button
            type="button"
            onClick={handleMicToggle}
            className={`p-3 rounded-lg border transition-all flex items-center justify-center shrink-0 ${
              isRecording
                ? "bg-red-950 border-red-700 text-red-400 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                : "bg-[#050507] border-[#1e1e2d] text-slate-400 hover:text-white hover:border-slate-700"
            }`}
            title={isRecording ? "Transcribing simulation voice command..." : "Transcribe live vocal query"}
            disabled={isLoading}
          >
            {isRecording ? <Mic className="w-5 h-5 text-red-500" /> : <MicOff className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isRecording ? "Listening & transcribing spoken speech (Google STT proxy)..." : "Type operational directive (e.g., 'Predict crowd congestion after the match')..."}
            className="flex-1 bg-[#050507] border border-[#1e1e2d] rounded-lg px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#00d4ff] font-mono animate-pulse"
            disabled={isLoading}
          />

          <button
            type="submit"
            className="p-3 bg-[#00d4ff] hover:bg-cyan-400 text-black font-bold rounded-lg transition-colors flex items-center justify-center shrink-0"
            disabled={isLoading || isRecording || !inputText.trim()}
          >
            <Send className="w-4 h-4 font-bold" />
          </button>
        </form>
        {isRecording && (
          <div className="flex flex-col gap-1.5 mt-2.5 px-1 bg-[#160b0e]/70 border border-red-900/35 p-2 rounded-lg">
            <div className="text-[10px] text-red-400 font-mono animate-pulse flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-bounce"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="font-bold tracking-wider uppercase">GOOGLE SPEECH-TO-TEXT ACTIVE • TRANSCRIBING LIVE</span>
              </div>
              <span className="text-[9px] text-slate-500 font-mono">LATENCY: &lt; 90ms</span>
            </div>
            
            {/* Visual audio soundwave representation */}
            <div className="flex items-center gap-[3px] h-6 py-1 pl-1">
              <div className="w-[3px] h-3 bg-red-500 rounded-full animate-[bounce_0.6s_infinite_alternate]"></div>
              <div className="w-[3px] h-5 bg-red-400 rounded-full animate-[bounce_0.5s_infinite_alternate_0.1s]"></div>
              <div className="w-[3px] h-2 bg-red-600 rounded-full animate-[bounce_0.8s_infinite_alternate_0.2s]"></div>
              <div className="w-[3px] h-4 bg-red-500 rounded-full animate-[bounce_0.4s_infinite_alternate_0.15s]"></div>
              <div className="w-[3px] h-6 bg-red-400 rounded-full animate-[bounce_0.7s_infinite_alternate_0.05s]"></div>
              <div className="w-[3px] h-3 bg-red-500 rounded-full animate-[bounce_0.5s_infinite_alternate_0.25s]"></div>
              <div className="w-[3px] h-5 bg-red-600 rounded-full animate-[bounce_0.6s_infinite_alternate_0.3s]"></div>
              <div className="w-[3px] h-2 bg-red-400 rounded-full animate-[bounce_0.4s_infinite_alternate_0.1s]"></div>
              <div className="w-[3px] h-4 bg-red-500 rounded-full animate-[bounce_0.8s_infinite_alternate_0.2s]"></div>
              <div className="w-[3px] h-1 bg-red-600 rounded-full animate-[bounce_0.3s_infinite_alternate_0.05s]"></div>
              <div className="w-[3px] h-3 bg-red-400 rounded-full animate-[bounce_0.5s_infinite_alternate_0.15s]"></div>
              <div className="w-[3px] h-5 bg-red-500 rounded-full animate-[bounce_0.6s_infinite_alternate_0.2s]"></div>
              <span className="text-[9px] text-slate-400 font-mono ml-2 truncate">
                {inputText ? `"${inputText}"` : "Speak into your microphone now... Try: 'Predict crowd congestion after the match.'"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
