import React, { useRef, useState, useEffect } from "react";
import {
  Camera,
  CameraOff,
  Sparkles,
  RefreshCw,
  Eye,
  Scan,
  Activity,
  AlertTriangle,
  Flame,
  UserCheck,
  Compass,
  Zap,
  CheckCircle2,
  Tv,
  Globe
} from "lucide-react";

interface VisionMonitorProps {
  currentStadiumState: {
    overallRiskLevel: string;
    crowdStabilityScore: number;
    blockedGates: string[];
    congestedGates: string[];
    evacuationActive: boolean;
  };
  onApplySystemAdjustments: (adjustments: {
    overallRiskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    crowdStabilityScore: number;
    advice?: string;
  }) => void;
  speakText: (text: string) => void;
}

interface OverlayBox {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: "cyan" | "red" | "green" | "amber";
}

interface VisionResult {
  density: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  flowRate: "FLUID" | "SLOW" | "STAGNANT" | "STAMPEDE_WARNING";
  detectedHazards: string[];
  crowdCountEstimate: number;
  safetyIndex: number;
  overlays: OverlayBox[];
  crowdManagementAdvice: string;
  systemMessage?: string;
}

export default function VisionMonitor({
  currentStadiumState,
  onApplySystemAdjustments,
  speakText
}: VisionMonitorProps) {
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [useSyntheticFeed, setUseSyntheticFeed] = useState<boolean>(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [autoAnalyze, setAutoAnalyze] = useState<boolean>(false);
  const [scanPulse, setScanPulse] = useState<boolean>(true);

  // Analysis result
  const [analysis, setAnalysis] = useState<VisionResult>({
    density: "LOW",
    flowRate: "FLUID",
    detectedHazards: ["None detected — flow patterns are fluid."],
    crowdCountEstimate: 38,
    safetyIndex: 96,
    overlays: [
      { id: "ov1", label: "Spectator Stream A (Nominal - Flowing)", x: 20, y: 30, w: 25, h: 50, color: "green" },
      { id: "ov2", label: "Sector Exit Door B (Fluid Outflow)", x: 70, y: 20, w: 20, h: 65, color: "cyan" }
    ],
    crowdManagementAdvice: "Corridor computer-vision density registers at normal green limits. Outflow channels remain unobstructed."
  });

  const [panicSurgeActive, setPanicSurgeActive] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const autoIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-patrol loop triggers analysis periodically
  useEffect(() => {
    if (autoAnalyze && streamActive) {
      autoIntervalRef.current = setInterval(() => {
        performFrameAnalysis();
      }, 5000);
    } else {
      if (autoIntervalRef.current) {
        clearInterval(autoIntervalRef.current);
      }
    }
    return () => {
      if (autoIntervalRef.current) {
        clearInterval(autoIntervalRef.current);
      }
    };
  }, [autoAnalyze, streamActive, useSyntheticFeed, panicSurgeActive]);

  const handleSimulateSurge = () => {
    setPanicSurgeActive(true);
    speakText("WARNING! Injecting synthetic crowd surge anomaly. Initiating optical flow stress test sequence.");
    
    // Set simulated vision response parameters
    setAnalysis({
      density: "CRITICAL",
      flowRate: "STAMPEDE_WARNING",
      detectedHazards: [
        "⚠️ Stampede Risk: Sudden speed increase detected inside Exit Corridor B.",
        "⚠️ Human Pressure Limit Exceeded: Vector velocities register at 2.9m/s.",
        "⚠️ Sudden Running: Staged panic behaviors detected near Seat Sector 3."
      ],
      crowdCountEstimate: 142,
      safetyIndex: 38,
      overlays: [
        { id: "ov_panic_1", label: "STAMPEDE DANGER DETECTED (Exit B Corridor)", x: 10, y: 15, w: 50, h: 70, color: "red" },
        { id: "ov_panic_2", label: "CROWD PRESSURE BOTTLE-NECK", x: 65, y: 40, w: 30, h: 45, color: "amber" }
      ],
      crowdManagementAdvice: "CRITICAL ACTION RECOMMENDATION: Immediately unlock Auxiliary Gate C to divide exit velocity streams! Redirect Stand C crowds away from Door B walkway via PA audio dispatch."
    });

    onApplySystemAdjustments({
      overallRiskLevel: "CRITICAL",
      crowdStabilityScore: 38,
      advice: "CRITICAL WARNING: Computer-Vision detected stampede risk highly elevated near Exit B corridor. Initiate auxiliary stanchion corridors immediately!"
    });
  };

  const handleResetSurgeNominals = () => {
    setPanicSurgeActive(false);
    speakText("CCTV telemetry reset. Crowd parameters returned to stable baseline.");
    setAnalysis({
      density: "LOW",
      flowRate: "FLUID",
      detectedHazards: ["None detected — flow patterns are fluid."],
      crowdCountEstimate: 42,
      safetyIndex: 95,
      overlays: [
        { id: "ov1_res", label: "Spectator Stream A (Nominal - Flowing)", x: 20, y: 30, w: 25, h: 50, color: "green" },
        { id: "ov2_res", label: "Sector Exit Door B (Fluid Outflow)", x: 70, y: 20, w: 20, h: 65, color: "cyan" }
      ],
      crowdManagementAdvice: "Corridor computer-vision density registers at normal green limits. Outflow channels remain unobstructed."
    });

    onApplySystemAdjustments({
      overallRiskLevel: "LOW",
      crowdStabilityScore: 95,
      advice: ""
    });
  };

  // Sync state text announcements
  const densityColors = {
    LOW: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    MEDIUM: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    HIGH: "text-[#f27d26] border-[#f27d26]/30 bg-[#f27d26]/10",
    CRITICAL: "text-[#ff4444] border-[#ff4444]/30 bg-[#ff4444]/10"
  };

  const flowColors = {
    FLUID: "text-[#00ff00] border-[#00ff00]/30 bg-[#00ff00]/10",
    SLOW: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    STAGNANT: "text-[#f27d26] border-[#f27d26]/30 bg-[#f27d26]/10",
    STAMPEDE_WARNING: "text-[#ff4444] border-red-500/40 bg-red-500/10 animate-pulse"
  };

  // Turn on/off standard HTML5 Camera webcam
  const startCamera = async () => {
    setVideoError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStreamActive(true);
      setUseSyntheticFeed(false);
      speakText("Webcam Computer Vision monitoring channel established.");
    } catch (err: any) {
      console.error("Camera startup error:", err);
      setVideoError("WebCamera block. Defaulting to high-fidelity CCTV twin simulation feed.");
      setUseSyntheticFeed(true);
      setStreamActive(true);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
    setAutoAnalyze(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Trigger one-off processing
  const performFrameAnalysis = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);

    try {
      let base64Image = "";

      if (useSyntheticFeed || videoError) {
        // Fallback or Synthetic Feed: We generate a small transparent or stylized Canvas frame
        const canvas = document.createElement("canvas");
        canvas.width = 320;
        canvas.height = 240;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Draw a stylized cyber-mesh concourse grid to symbolize synthetic cctv scanning
          ctx.fillStyle = "#0a0a14";
          ctx.fillRect(0, 0, 320, 240);
          ctx.strokeStyle = "#1e1e2d";
          ctx.lineWidth = 1;
          for (let i = 0; i < 320; i += 20) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 240);
            ctx.stroke();
          }
          for (let j = 0; j < 240; j += 20) {
            ctx.beginPath();
            ctx.moveTo(0, j);
            ctx.lineTo(320, j);
            ctx.stroke();
          }
          // Stylized text inside synthetic snapshot
          ctx.fillStyle = "#00d4ff";
          ctx.font = "bold 12px Courier";
          ctx.fillText("SYNTHETIC CCTV MON-04", 15, 30);
          ctx.fillStyle = "#475569";
          ctx.fillText(`RISK STAGE: ${currentStadiumState.overallRiskLevel}`, 15, 60);
          ctx.fillText(`EVAC ACTIVE: ${currentStadiumState.evacuationActive ? "YES" : "NO"}`, 15, 80);
        }
        base64Image = canvas.toDataURL("image/jpeg");
      } else {
        // Capture frame from active Webcam element
        if (videoRef.current) {
          const video = videoRef.current;
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            base64Image = canvas.toDataURL("image/jpeg", 0.7);
          }
        }
      }

      if (!base64Image) {
        throw new Error("Unable to capture video snapshot frame.");
      }

      const res = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64Image,
          currentStadiumState
        })
      });

      if (!res.ok) {
        throw new Error(`Computer vision API failure: ${res.statusText}`);
      }

      const parsed: VisionResult = await res.json();
      setAnalysis(parsed);

      // Speak key instruction updates
      if (parsed.crowdManagementAdvice) {
        speakText(`Live Computer Vision Alert: ${parsed.crowdManagementAdvice}`);
      }

      // Automatically adjust overall simulation state parameters based on real camera
      if (parsed && (parsed as any).stadiumAdjustments) {
        const adjustments = (parsed as any).stadiumAdjustments;
        onApplySystemAdjustments({
          overallRiskLevel: adjustments.overallRiskLevel,
          crowdStabilityScore: adjustments.crowdStabilityScore
        });
      }

    } catch (err) {
      console.error("Frame analysis process exception:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Implement auto-analyze loops for real time reports updates
  useEffect(() => {
    if (autoAnalyze && streamActive) {
      performFrameAnalysis(); // run first
      autoIntervalRef.current = setInterval(() => {
        performFrameAnalysis();
      }, 5000); // scan every 5 seconds
    } else {
      if (autoIntervalRef.current) {
        clearInterval(autoIntervalRef.current);
        autoIntervalRef.current = null;
      }
    }

    return () => {
      if (autoIntervalRef.current) {
        clearInterval(autoIntervalRef.current);
      }
    };
  }, [autoAnalyze, streamActive, useSyntheticFeed, currentStadiumState]);

  // Handle subtle visual pulse
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setScanPulse(prev => !prev);
    }, 2500);
    return () => clearInterval(pulseInterval);
  }, []);

  return (
    <div
      id="computer_vision_realtime_analytics"
      className="bg-[#11111a] border border-[#1e1e2d] rounded-xl p-4 shadow-2xl relative"
    >
      {/* Visual cyber elements decor */}
      <div className="absolute top-2 right-2 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00ff00] animate-pulse"></span>
        <span className="text-[7.5px] font-mono text-slate-500 uppercase">CV_PROSTHESIS</span>
      </div>

      <div className="flex items-center justify-between mb-3.5 border-b border-[#1e1e2d] pb-2">
        <div className="flex items-center gap-2">
          <span className="p-1 bg-[#00d4ff]/10 rounded border border-[#00d4ff]/30 text-[#00d4ff]">
            <Activity className="w-4 h-4 animate-pulse" />
          </span>
          <div>
            <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-300 font-sans">
              Sentinel-Vision Live CCTV / Camera Analyzer
            </h3>
            <p className="text-[9px] text-slate-500 font-mono">
              REAL-TIME COMPUTER VISION PATROL FEED
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              if (streamActive) {
                stopCamera();
              } else {
                startCamera();
              }
            }}
            className={`px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider font-semibold rounded border transition-all flex items-center gap-1 ${
              streamActive
                ? "bg-red-950/40 text-red-400 border-red-500/40 hover:bg-red-900/40"
                : "bg-emerald-950 text-emerald-400 border-emerald-500/40 hover:bg-emerald-900"
            }`}
          >
            {streamActive ? (
              <>
                <CameraOff className="w-3.5 h-3.5" /> Deactivate
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5" /> Start Camera
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Video window wrapper */}
        <div id="video_monitor_view" className="md:col-span-7 flex flex-col space-y-2">
          <div className="relative aspect-video w-full rounded-lg bg-[#050507] border border-[#1e1e2d] overflow-hidden flex items-center justify-center">
            {streamActive ? (
              <>
                {!useSyntheticFeed ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : (
                  <div className="w-full h-full relative overflow-hidden bg-[#07070f] flex flex-col justify-between p-4">
                    {/* Glowing circular heat sectors in bg */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(242,125,38,0.06),transparent_60%)] pointer-events-none"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,68,68,0.07),transparent_55%)] pointer-events-none"></div>

                    {/* Cyber grids overlay */}
                    <div
                      className="absolute inset-0 bg-[linear-gradient(to_right,#141424_1px,transparent_1px),linear-gradient(to_bottom,#141424_1px,transparent_1px)] bg-[size:16px_16px]"
                      style={{ opacity: 0.6 }}
                    ></div>

                    {/* Simulating crowd specs */}
                    <div className="absolute top-1/3 left-1/4 flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#f27d26] animate-ping opacity-60"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#f27d26]"></div>
                    </div>
                    <div className="absolute top-[55%] left-2/3 flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff4444] animate-ping opacity-60"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#ff4444]"></div>
                    </div>
                    <div className="absolute top-[40%] left-[80%] flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-[#00ff00]"></div>
                    </div>

                    <div className="flex items-center justify-between text-[#00d4ff] font-mono text-[9px] z-10">
                      <div className="flex items-center gap-1.5">
                        <Tv className="w-3.5 h-3.5 text-[#00d4ff] animate-pulse" />
                        <span className="font-bold uppercase tracking-wider">CCTV_STADIUM_ZONE_C3 (SIMULATED)</span>
                      </div>
                      <span className="text-slate-500 font-normal">SEC_SYS_B_ON</span>
                    </div>

                    <div className="flex flex-col items-center justify-center my-auto py-12">
                      <Sparkles className="w-7 h-7 text-[#00d4ff]/40 animate-pulse mb-2" />
                      <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wide">
                        CCTV Simulator Engine Active
                      </span>
                      <span className="text-[8px] text-slate-600 font-mono mt-0.5">
                        Analyzing static vector buffers contextualized by simulation
                      </span>
                    </div>

                    <div className="flex justify-between items-end text-slate-500 font-mono text-[8px] tracking-tight z-10 border-t border-[#1e1e2d] pt-1">
                      <span>ANGLE: CONCOURSE OUTFLOW 14</span>
                      <span>FPS: 18.2HZ</span>
                    </div>
                  </div>
                )}

                {/* Scanline animation sweep overlays */}
                <div
                  className={`absolute left-0 w-full h-0.5 bg-[#00d4ff]/40 z-10 pointer-events-none transition-all duration-700 ${
                    scanPulse ? "top-full" : "top-0"
                  }`}
                  style={{ boxShadow: "0 0 12px 2px #00d4ff" }}
                ></div>

                {/* Draw AI Bounding Overlays */}
                {analysis.overlays &&
                  analysis.overlays.map(box => (
                    <div
                      key={box.id}
                      className="absolute border rounded transition-all duration-500 pointer-events-none z-20 flex flex-col justify-between"
                      style={{
                        top: `${box.y}%`,
                        left: `${box.x}%`,
                        width: `${box.w}%`,
                        height: `${box.h}%`,
                        borderColor:
                          box.color === "red"
                            ? "rgba(255, 68, 68, 0.7)"
                            : box.color === "amber"
                            ? "rgba(242, 125, 38, 0.7)"
                            : box.color === "green"
                            ? "rgba(0, 255, 0, 0.7)"
                            : "rgba(0, 212, 255, 0.7)",
                        backgroundColor:
                          box.color === "red"
                            ? "rgba(255, 68, 68, 0.05)"
                            : box.color === "amber"
                            ? "rgba(242, 125, 38, 0.05)"
                            : box.color === "green"
                            ? "rgba(0, 255, 0, 0.05)"
                            : "rgba(0, 212, 255, 0.05)"
                      }}
                    >
                      <span
                        className="text-[7.5px] font-mono font-bold leading-none px-1 py-0.5 text-black absolute top-0 left-0 tracking-tighter uppercase"
                        style={{
                          backgroundColor:
                            box.color === "red"
                              ? "rgba(255, 68, 68, 0.9)"
                              : box.color === "amber"
                              ? "rgba(242, 125, 38, 0.9)"
                              : box.color === "green"
                              ? "rgba(0, 255, 0, 0.9)"
                              : "rgba(0, 212, 255, 0.9)"
                        }}
                      >
                        {box.label}
                      </span>
                    </div>
                  ))}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center text-slate-500 font-sans min-h-[180px]">
                <CameraOff className="w-10 h-10 text-slate-700 mb-2.5" />
                <h4 className="text-xs font-semibold uppercase text-slate-400">
                  CV Camera Channel Suspended
                </h4>
                <p className="text-[10px] text-slate-600 max-w-[280px] mt-1 mb-4">
                  Activate webcam stream or CCTV digital twin proxy to analyze crowd density parameters.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 w-full max-w-[340px]">
                  <button
                    onClick={() => startCamera()}
                    className="flex-1 py-1.5 px-3 bg-emerald-950/75 border border-emerald-500/40 hover:bg-emerald-900 text-emerald-400 font-mono text-[10px] rounded uppercase font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Camera className="w-3.5 h-3.5" /> Activate Webcam
                  </button>
                  <button
                    onClick={() => {
                      setUseSyntheticFeed(true);
                      setStreamActive(true);
                      setVideoError(null);
                      speakText("CCTV Twin Simulation Proxy engaged successfully.");
                    }}
                    className="flex-1 py-1.5 px-3 bg-cyan-950/75 border border-[#00d4ff]/40 hover:bg-cyan-900 text-[#00d4ff] font-mono text-[10px] rounded uppercase font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Tv className="w-3.5 h-3.5" /> CCTV Proxy Stream
                  </button>
                </div>
              </div>
            )}
          </div>

          {streamActive && (
            <div className="space-y-3.5 mt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setUseSyntheticFeed(!useSyntheticFeed)}
                  disabled={!!videoError}
                  className={`flex-1 py-1 border rounded text-[10px] font-mono uppercase font-bold tracking-wider transition-all cursor-pointer ${
                    useSyntheticFeed
                      ? "bg-[#11111a] border-[#1e1e2d] text-[#00d4ff] hover:bg-slate-900"
                      : "bg-[#050507] border-[#00ff00]/40 text-[#00ff00] hover:bg-[#00ff00]/10"
                  }`}
                >
                  {useSyntheticFeed ? "Use Real Camera" : "Switch to CCTV Twin"}
                </button>

                <button
                  onClick={performFrameAnalysis}
                  disabled={isAnalyzing}
                  className="flex-1 py-1 rounded bg-[#00d4ff] text-neutral-950 hover:bg-cyan-400 transition-colors font-mono text-[10px] uppercase font-extrabold tracking-widest flex items-center justify-center gap-1.5"
                  title="Send current camera frame to Gemini AI computer vision parser"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" /> Analyzing Frame...
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3" /> Execute Real-time CV Scan
                    </>
                  )}
                </button>
              </div>

              {/* 4-PILLS CV TELEMETRY METRICS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#05050a] border border-[#1e1e2d] p-2.5 rounded-lg">
                <div className="bg-[#0c0c14] border border-slate-900 p-2 rounded flex flex-col justify-between">
                  <span className="text-[8px] text-slate-500 font-mono uppercase">Avg Speed</span>
                  <span className={`text-[11px] font-mono font-bold ${panicSurgeActive ? "text-red-400" : "text-emerald-400"}`}>
                    {panicSurgeActive ? "8.2 m/s" : "1.4 m/s"}
                  </span>
                </div>
                <div className="bg-[#0c0c14] border border-slate-900 p-2 rounded flex flex-col justify-between">
                  <span className="text-[8px] text-slate-500 font-mono uppercase">Local Density</span>
                  <span className={`text-[11px] font-mono font-bold ${panicSurgeActive ? "text-red-400" : "text-emerald-400"}`}>
                    {panicSurgeActive ? "9.2 fans/m²" : "1.2 fans/m²"}
                  </span>
                </div>
                <div className="bg-[#0c0c14] border border-slate-900 p-2 rounded flex flex-col justify-between">
                  <span className="text-[8px] text-slate-500 font-mono uppercase">Flow Vector</span>
                  <span className="text-[11px] font-mono font-bold text-slate-300 truncate">
                    {panicSurgeActive ? "BOTTLE-NECK B" : "NW EX-GATE A"}
                  </span>
                </div>
                <div className="bg-[#0c0c14] border border-slate-900 p-2 rounded flex flex-col justify-between">
                  <span className="text-[8px] text-slate-500 font-mono uppercase">Tracker Flags</span>
                  <span className="text-[10px] font-mono font-medium text-cyan-400">
                    YOLOv11, Pose
                  </span>
                </div>
              </div>

              {/* CAMERA STAMPEDE / PANIC STRESS TEST ACTIONS */}
              <div className="bg-red-950/10 border border-red-900/20 rounded-lg p-3 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[9.5px] font-bold text-slate-400 font-mono uppercase tracking-wider block">
                    ⚙️ CV Stress Testing &amp; Ingress Injection
                  </span>
                  <span className="text-[8px] font-mono text-red-500/80 tracking-widest font-black uppercase animate-pulse">TESTBED</span>
                </div>
                <p className="text-[9.5px] text-slate-400 font-sans leading-relaxed">
                  Override baseline vectors and inject a high-velocity stampede/panic crowd surge anomaly near Seat Sector B.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={handleSimulateSurge}
                    className={`flex-1 py-1.5 px-3 rounded text-[10px] uppercase font-bold tracking-wider font-mono border transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 ${
                      panicSurgeActive
                        ? "bg-red-950/80 border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.25)]"
                        : "bg-[#1a0c0e] border-red-900/40 hover:bg-red-950/60 text-red-400"
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                    Simulate Panic Surge Anomaly
                  </button>
                  <button
                    type="button"
                    onClick={handleResetSurgeNominals}
                    className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded font-mono text-[10px] uppercase font-bold tracking-wider transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reset Baseline Metrics
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right CV Analysis Report panel */}
        <div id="cv_analysis_panel" className="md:col-span-5 flex flex-col justify-between">
          <div className="bg-[#050507]/45 border border-[#1e1e2d] rounded-lg p-3 space-y-3.5 h-full">
            <div className="flex items-center justify-between border-b border-[#1e1e2d] pb-2">
              <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-semibold">
                AI Vision Diagnostics Report
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] font-mono text-slate-500 uppercase">AUTO PATROL</span>
                <button
                  onClick={() => setAutoAnalyze(!autoAnalyze)}
                  disabled={!streamActive}
                  className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                    autoAnalyze && streamActive ? "bg-[#00ff00]" : "bg-slate-800"
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full bg-white transition-transform duration-200 ${
                      autoAnalyze && streamActive ? "translate-x-3.5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Core telemetry state row */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#11111a] p-2 rounded border border-[#1e1e2d]/60 flex flex-col justify-between">
                <span className="text-[8.5px] text-slate-500 font-mono uppercase font-bold">CROWD DENSITY</span>
                <span className={`text-xs font-bold leading-none mt-1 uppercase px-1.5 py-0.5 rounded border text-center ${densityColors[analysis.density]}`}>
                  {analysis.density}
                </span>
              </div>
              <div className="bg-[#11111a] p-2 rounded border border-[#1e1e2d]/60 flex flex-col justify-between">
                <span className="text-[8.5px] text-slate-500 font-mono uppercase font-bold">FLOW DYNAMICS</span>
                <span className={`text-[10px] font-mono font-bold leading-none mt-1 uppercase px-1.5 py-0.5 rounded border text-center truncate ${flowColors[analysis.flowRate]}`}>
                  {analysis.flowRate.replace("_", " ")}
                </span>
              </div>
            </div>

            {/* Core counters list */}
            <div className="space-y-2 border-t border-[#1e1e2d] pt-2">
              <div className="flex items-center justify-between text-xs font-mono py-0.5">
                <span className="text-slate-500 font-bold uppercase tracking-wider">CROWD COUNT:</span>
                <span className="text-white font-bold">{analysis.crowdCountEstimate} Spectators</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono py-0.5">
                <span className="text-slate-500 font-bold uppercase tracking-wider">SAFETY INDEX:</span>
                <span className={`font-bold ${analysis.safetyIndex > 80 ? "text-[#00ff00]" : analysis.safetyIndex > 50 ? "text-amber-500" : "text-[#ff4444]"}`}>
                  {analysis.safetyIndex}/100
                </span>
              </div>
            </div>

            {/* Detected Hazards indicators */}
            <div className="border-t border-[#1e1e2d] pt-2.5">
              <span className="text-[8.5px] text-slate-500 font-mono uppercase font-bold tracking-wider block mb-1">
                Detected Physical Hazards
              </span>
              <div className="space-y-1">
                {analysis.detectedHazards && analysis.detectedHazards.map((hz, idx) => (
                  <div key={idx} className="flex items-start gap-1 text-[10px] text-slate-300">
                    <AlertTriangle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${analysis.safetyIndex < 60 ? "text-[#ff4444]" : "text-amber-500"}`} />
                    <span className="leading-tight">{hz}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tactical advice block */}
            <div className="border-t border-[#1e1e2d] pt-2.5 bg-[#0a0a0f]/40 p-2 rounded border border-[#1e1e2d]">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Compass className="w-3.5 h-3.5 text-[#00d4ff] animate-pulse" />
                <span className="text-[9px] text-[#00d4ff] font-mono uppercase tracking-wider font-extrabold">
                  Tactical Action Directive
                </span>
              </div>
              <p className="text-[10.5px] text-slate-300 font-normal leading-relaxed font-sans">
                {analysis.crowdManagementAdvice}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Google Advanced Geospatial Platform & Multi-Camera Fusion Segment */}
      <div className="mt-4 pt-4 border-t border-[#1e1e2d] bg-[#07070f]/75 rounded-lg p-3.5 border border-[#1e1e2d]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1 px-1.5 bg-[#00ffcc]/10 border border-[#00ffcc]/30 rounded text-[#00ffcc] font-mono text-[9px] font-bold">
              GPS OVERLAY ACTIVE
            </span>
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#00ffcc]" />
                Google Geospatial Spatial Intelligence System
              </h4>
              <p className="text-[9px] text-slate-500 font-mono">
                CENTIMETER-LEVEL SPECTATOR COORDINATE TRANSFORMATION & MOVEMENT RECONSTRUCTION (WGS-84 TO PIXEL LOC)
              </p>
            </div>
          </div>
          <div className="text-[9px] text-slate-400 font-mono bg-[#0e0e18] px-2.5 py-1 rounded border border-[#1e1e2d] flex items-center gap-1">
            <Scan className="w-3 h-3 text-[#00d4ff] animate-pulse" />
            <span>GEO-REF: 23.0919° N, 72.5971° E (Narendra Modi Stadium)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Spatial Transformation Specs */}
          <div className="bg-[#050552]/10 border border-[#00ffcc]/20 rounded-lg p-2.5 flex flex-col justify-between">
            <span className="text-[9px] text-[#00ffcc] font-mono font-bold uppercase tracking-wide">
              Coordinate Transformation
            </span>
            <div className="my-1.5">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>WGS-84 Lat:</span>
                <span className="text-white font-medium">23.091914° N</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>WGS-84 Lng:</span>
                <span className="text-white font-medium">72.597148° E</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-300 font-mono mt-1 border-t border-[#1e1e2d]/60 pt-1">
                <span>Pixel X, Y:</span>
                <span className="text-[#00ffcc] font-bold">342.15, 688.42</span>
              </div>
            </div>
            <span className="text-[8px] text-slate-500 font-mono">
              Homography Accuracy: ±2.4cm
            </span>
          </div>

          {/* Movement Reconstruction */}
          <div className="bg-[#0c0c14]/80 border border-[#1e1e2d] rounded-lg p-2.5 flex flex-col justify-between">
            <span className="text-[9px] text-slate-400 font-mono font-bold uppercase tracking-wide">
              Movement Reconstruction
            </span>
            <div className="my-1 text-[10px] space-y-1 text-slate-400">
              <div className="flex justify-between">
                <span>Core Velocity:</span>
                <span className="text-[#00d4ff] font-mono">1.1 m/s (Nominal)</span>
              </div>
              <div className="flex justify-between">
                <span>Vector Angle:</span>
                <span className="text-amber-500 font-mono">312.4° (NW Flow)</span>
              </div>
              <div className="flex justify-between">
                <span>Flow Density:</span>
                <span className="text-white font-mono">1.4 spectators/m²</span>
              </div>
            </div>
            <div className="w-full bg-[#050507] h-1.5 rounded-full overflow-hidden mt-1">
              <div className="h-full bg-[#00d4ff] w-[45%]"></div>
            </div>
          </div>

          {/* Multi-Camera Fusion Matrix */}
          <div className="bg-[#0c0c14]/80 border border-[#1e1e2d] rounded-lg p-2.5 flex flex-col justify-between">
            <span className="text-[9px] text-slate-400 font-mono font-bold uppercase tracking-wide">
              Multi-Camera Stitching (Fusion)
            </span>
            <div className="my-1 text-[10px] space-y-0.5 font-mono text-slate-400">
              <div className="flex justify-between text-[9px]">
                <span>CAM-01 (South Promenade):</span>
                <span className="text-green-400">MUTUAL MATCH 89%</span>
              </div>
              <div className="flex justify-between text-[9px]">
                <span>CAM-04 (Concourse West):</span>
                <span className="text-green-400">MUTUAL MATCH 94%</span>
              </div>
              <div className="flex justify-between text-[9px]">
                <span>CAM-07 (Lot Blue Staging):</span>
                <span className="text-red-400">STITCH OVERLAP 11%</span>
              </div>
            </div>
            <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest text-[#00ffcc]">
              3 Cameras Fused Live
            </span>
          </div>

          {/* Live GIS Matrix projection */}
          <div className="bg-[#0c0c14]/80 border border-[#1e1e2d] rounded-lg p-2.5 flex flex-col justify-between">
            <span className="text-[9px] text-slate-400 font-mono font-bold uppercase tracking-wide">
              Projection Orthomosaic Mesh
            </span>
            <div className="bg-black/40 p-1.5 rounded font-mono text-[9px] text-slate-400 grid grid-cols-3 gap-1 text-center">
              <span className="text-emerald-450 border border-slate-900/40">1.034</span>
              <span className="text-rose-450 border border-slate-900/40">-0.12</span>
              <span className="text-slate-500 border border-slate-900/40">23.09</span>
              <span className="text-slate-500 border border-slate-900/40">0.081</span>
              <span className="text-emerald-450 border border-slate-900/40">0.992</span>
              <span className="text-slate-500 border border-slate-900/40">72.59</span>
              <span className="text-[#00ffcc] border border-slate-900/40 font-bold">Fused</span>
              <span className="text-[#00ffcc] border border-slate-900/40 font-bold">Active</span>
              <span className="text-[#00ffcc] border border-slate-900/40 font-bold">Proj</span>
            </div>
            <span className="text-[8px] text-slate-500 text-right leading-none block">
              3D coordinate system dynamic lookup
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
