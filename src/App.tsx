/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Users,
  Compass,
  AlertOctagon,
  Clock,
  Volume2,
  Calendar,
  Layers,
  Sparkles,
  HelpCircle,
  TrendingUp,
  Sliders,
  Bell,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  MessageSquare,
  Smartphone,
  Eye,
  EyeOff,
  Search,
  Activity,
  UserCheck,
  Zap,
  Phone,
  Play,
  RotateCcw,
  AlertTriangle,
  MapPin,
  Cpu
} from "lucide-react";
import { StadiumZone, LocationType, GateStatus, SafetyIncident, RiskLevel, AgentDiagnostics, LiveTelemetry, VoiceCommandMessage } from "./types";
import { INITIAL_ZONES, INITIAL_ROUTES, INCIDENT_TEMPLATES, IncidentTemplate } from "./data";
import DigitalTwin from "./components/DigitalTwin";
import CommandConsole from "./components/CommandConsole";
import IncidentSimulator from "./components/IncidentSimulator";
import AgentTelemetry from "./components/AgentTelemetry";
import ActionDeck from "./components/ActionDeck";
import VisionMonitor from "./components/VisionMonitor";
import CommandPostView from "./components/CommandPostView";
import SOSSafetyApp from "./components/SOSSafetyApp";
import MissingEgressView from "./components/MissingEgressView";

export default function App() {
  // Application live State
  const [zones, setZones] = useState<StadiumZone[]>(INITIAL_ZONES);
  const [activeIncident, setActiveIncident] = useState<SafetyIncident | null>(null);
  const [selectedZone, setSelectedZone] = useState<StadiumZone | null>(null);
  const [blockedGates, setBlockedGates] = useState<string[]>([]);
  const [congestedGates, setCongestedGates] = useState<string[]>([]);
  const [simulationMinutes, setSimulationMinutes] = useState<number>(0);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [evacuationActive, setEvacuationActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [voiceSynthesisAvailable, setVoiceSynthesisAvailable] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(true);
  const [cvOverride, setCvOverride] = useState<{
    density: string;
    safetyIndex: number;
    advice: string;
  } | null>(null);
  
  // Terminal and Command State
  const [messages, setMessages] = useState<VoiceCommandMessage[]>([]);

  // Navigation Tabs State (Live Twin, Command Viewpoints, CV Analytics, Active SOS, Egress & Missing Search)
  const [activeTab, setActiveTab] = useState<"twin" | "command" | "anomaly" | "sos" | "missing">("twin");

  // Multi-layer filters checklist for high-fidelity Digital Twin mapping
  const [visibleLayers, setVisibleLayers] = useState<string[]>([
    "crowd", "security", "medical", "ticketing", "exit_routes", "risk_zones"
  ]);

  // Active Fan SOS system simulator states
  const [sosAlertChannel, setSosAlertChannel] = useState<"ipl_app" | "whatsapp">("ipl_app");
  const [sosSimulatedMessage, setSosSimulatedMessage] = useState<string>("");
  const [sosSimStatus, setSosSimStatus] = useState<string>("standby");
  const [sosSimTime, setSosSimTime] = useState<string>("now");

  // Missing person tracking states
  const [missingSearchColor, setMissingSearchColor] = useState<string>("blue");
  const [missingSearchHat, setMissingSearchHat] = useState<boolean>(true);
  const [missingSearchLocation, setMissingSearchLocation] = useState<string>("Stand B Outer Concourse");
  const [missingScanStatus, setMissingScanStatus] = useState<"idle" | "scanning" | "found" | "not_found">("idle");
  const [missingScanResults, setMissingScanResults] = useState<string>("");

  // Post-match Exit phase scheduler matrix states
  const [egressSchedules, setEgressSchedules] = useState<{
    zoneId: string;
    zoneName: string;
    status: "CLEARING" | "WAITING" | "HELD" | "EXIT_PERMITTED";
    timeLeft: number;
    headcountToClear: number;
  }[]>([
    { zoneId: "STAND_A", zoneName: "Stand A (VIP North)", status: "EXIT_PERMITTED", timeLeft: 8, headcountToClear: 4120 },
    { zoneId: "STAND_B", zoneName: "Stand B (East Promenade)", status: "EXIT_PERMITTED", timeLeft: 12, headcountToClear: 8520 },
    { zoneId: "STAND_C", zoneName: "Stand C (South Concourse)", status: "HELD", timeLeft: 22, headcountToClear: 14500 },
    { zoneId: "FOOD_OASIS", zoneName: "Food Court Main Plaza", status: "WAITING", timeLeft: 18, headcountToClear: 3200 },
    { zoneId: "VIP_GATE_E", zoneName: "VIP Gate E Entrance", status: "EXIT_PERMITTED", timeLeft: 3, headcountToClear: 120 },
  ]);

  // Active role post tabs
  const [activeCommandPost, setActiveCommandPost] = useState<"security" | "medical" | "organizer" | "police">("organizer");

  // AI Safety Copilot interactive organizers instructions list state
  const [copilotDirectives, setCopilotDirectives] = useState<{
    id: string;
    message: string;
    applied: boolean;
    priority: "low" | "medium" | "high";
  }[]>([
    { id: "DIR_1", message: "💡 Suggestion: Redirect 25% of crowd from Stand C bottleneck directly into Exit D route.", applied: false, priority: "high" },
    { id: "DIR_2", message: "💡 Suggestion: Deploy Medical Team Unit 2 SW Clinics to SE Concourse food stalls.", applied: false, priority: "medium" },
    { id: "DIR_3", message: "💡 Suggestion: Open auxiliary door bypass Gates C & F to decrease pressure.", applied: false, priority: "high" },
    { id: "DIR_4", message: "💡 Suggestion: Release Stand A spectators in 3 separate waves to avoid road locks.", applied: false, priority: "low" },
  ]);

  // Safety Telemetry State
  const [telemetry, setTelemetry] = useState<LiveTelemetry>({
    overallRiskLevel: RiskLevel.LOW,
    crowdStabilityScore: 98,
    evacuationProbability: 0,
    stadiumCapacity: 110000,
    currentTotalCrowd: 78500,
    activeGateCount: 5,
    stabilizationEstimateMinutes: 0,
    sensorAlertCount: 0
  });

  // Native HTML5 TTS voice syntheses pre-flight setup
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setVoiceSynthesisAvailable(true);
    }
  }, []);

  const speakText = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      // Prefer standard English female or deep robotic voice if available
      const voices = window.speechSynthesis.getVoices();
      const targetVoice = voices.find(v => v.lang.startsWith("en-") && v.name.includes("Google")) || voices[0];
      if (targetVoice) utterance.voice = targetVoice;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Automatically update safety telemetry scores whenever zones, incidents, or overrides fluctuate
  useEffect(() => {
    let rawAlertsCount = 0;
    let worstRiskFactor = 0.1;

    // Evaluate zones parameters
    zones.forEach(z => {
      if (z.riskFactor > 0.6) rawAlertsCount++;
      if (z.riskFactor > worstRiskFactor) worstRiskFactor = z.riskFactor;
    });

    // Check active incident impact
    let riskLevel = RiskLevel.LOW;
    let baseStability = 98;
    let evacProb = evacuationActive ? 85 : 0;

    if (activeIncident) {
      if (activeIncident.severity === RiskLevel.CRITICAL) {
        riskLevel = RiskLevel.CRITICAL;
        baseStability = 54;
      } else if (activeIncident.severity === RiskLevel.HIGH) {
        riskLevel = RiskLevel.HIGH;
        baseStability = 71;
      } else {
        riskLevel = RiskLevel.MEDIUM;
        baseStability = 82;
      }
      rawAlertsCount += activeIncident.severity === RiskLevel.CRITICAL ? 4 : 2;
    } else if (worstRiskFactor > 0.65) {
      riskLevel = RiskLevel.HIGH;
      baseStability = 74;
    } else if (worstRiskFactor > 0.25) {
      riskLevel = RiskLevel.MEDIUM;
      baseStability = 88;
    }

    // Adapt scores based on simulation timeline forecasts
    if (simulationMinutes > 0) {
      baseStability = Math.max(baseStability - (simulationMinutes * 4.5), 12);
      rawAlertsCount += Math.floor(simulationMinutes * 1.5);
      if (simulationMinutes >= 5 && riskLevel === RiskLevel.MEDIUM) {
        riskLevel = RiskLevel.HIGH;
      }
    }

    // Adapt based on evacuation control
    if (evacuationActive) {
      baseStability = Math.min(baseStability + 15, 95); // evacuating helps relieve pressure structures
      evacProb = 95;
    }

    // Integrate Camera Computer Vision Real-time Analyzes overrides
    if (cvOverride) {
      baseStability = Math.min(baseStability, cvOverride.safetyIndex);
      if (cvOverride.density === "CRITICAL") {
        riskLevel = RiskLevel.CRITICAL;
        rawAlertsCount += 2;
      } else if (cvOverride.density === "HIGH" && riskLevel !== RiskLevel.CRITICAL) {
        riskLevel = RiskLevel.HIGH;
        rawAlertsCount += 1;
      } else if (cvOverride.density === "MEDIUM" && riskLevel === RiskLevel.LOW) {
        riskLevel = RiskLevel.MEDIUM;
      }
    }

    setTelemetry({
      overallRiskLevel: riskLevel,
      crowdStabilityScore: Math.round(baseStability),
      evacuationProbability: evacProb,
      stadiumCapacity: 110000,
      currentTotalCrowd: 78500,
      activeGateCount: 5 - blockedGates.length,
      stabilizationEstimateMinutes: activeIncident ? (activeIncident.severity === RiskLevel.CRITICAL ? 14 : 7) : 0,
      sensorAlertCount: rawAlertsCount
    });

  }, [zones, activeIncident, evacuationActive, blockedGates, simulationMinutes, cvOverride]);

  // Handle triggering pre-programmed sporting incidents
  const handleTriggerIncident = (template: IncidentTemplate) => {
    // 1. Create Safety Incident Instance
    const newIncident: SafetyIncident = {
      id: `INCIDENT-${Date.now()}`,
      title: template.title,
      description: template.description,
      severity: template.severity as RiskLevel,
      zoneId: template.targetZoneId,
      status: "ACTIVE",
      timestamp: new Date().toLocaleTimeString(),
      category: template.category
    };

    setActiveIncident(newIncident);

    // 2. Adjust Corresponding Zone Risk Factors and Gate congestion
    const updatedZones = zones.map(z => {
      if (z.id === template.targetZoneId) {
        return { ...z, riskFactor: template.severity === "CRITICAL" ? 0.95 : 0.75, statusText: template.narrative };
      }
      // If it's a monsoonal rain cloudburst, also elevate surrounding food courts
      if (template.id === "INCIDENT_CLOUDBURST" && z.id === "FOOD_OASIS") {
        return { ...z, riskFactor: 0.85, statusText: "Slippery wet pathways. Hundreds of families seeking shelter concurrently." };
      }
      return z;
    });
    setZones(updatedZones);

    // Turnstile failures closes Gate B
    if (template.id === "INCIDENT_GATE_LOCKOUT") {
      setBlockedGates(["GATE_B"]);
      setCongestedGates(["GATE_A", "GATE_C"]);
    } else if (template.id === "INCIDENT_VICTORY_SURGE") {
      setCongestedGates(["GATE_B", "GATE_C"]);
    } else {
      setBlockedGates([]);
      setCongestedGates([]);
    }

    // 3. Inject voice response simulation alert
    const introAlert = `SentinelOS X High Alert: ${template.title} is now active at ${template.targetZoneId}. Initiating protective containment protocols.`;
    speakText(introAlert);

    // Create a new user & assist command node
    const msgId = Date.now().toString();
    const mockOrchestrationText = createMockSpeechTelemetry(`Inject Incident Scenario: ${template.title}`, template.id, evacuationActive, blockedGates);

    setMessages(prev => [
      ...prev,
      {
        id: `user-${msgId}`,
        sender: "USER",
        text: `Automated simulation trigger input: Deploy incident model "${template.title}"`,
        timestamp: new Date().toLocaleTimeString()
      },
      {
        id: `system-${msgId}`,
        sender: "SYSTEM",
        text: `SentinelOS X Security Protocol Activated.\nScenario: ${template.title}\nSeverity Level: ${template.severity}\nTarget Location: ${template.targetZoneId}\n\nInitiating multi-agent sensor sweep. Crowd systems redirected to safe bypass channels immediately.`,
        timestamp: new Date().toLocaleTimeString(),
        agentAnalysisText: mockOrchestrationText
      }
    ]);
  };

  const handleResetIncident = () => {
    setActiveIncident(null);
    setBlockedGates([]);
    setCongestedGates([]);
    setSimulationMinutes(0);
    setEvacuationActive(false);
    setCvOverride(null);
    
    // Restore all zones to original telemetry
    setZones(INITIAL_ZONES);
    const text = "SentinelOS X Status Restored. Stadium parameters under normal surveillance.";
    speakText(text);

    setMessages(prev => [
      ...prev,
      {
        id: `user-reset-${Date.now()}`,
        sender: "USER",
        text: "Reset system to safe standby operations",
        timestamp: new Date().toLocaleTimeString()
      },
      {
        id: `sys-reset-${Date.now()}`,
        sender: "SYSTEM",
        text: "Simulations reset and security parameters recalibrated to zero baseline level.",
        timestamp: new Date().toLocaleTimeString(),
        agentAnalysisText: `====================================================
CURRENT STADIUM STATUS
====================================================
- Overall Risk Level: LOW
- Crowd Stability Score: 98%
- Active Incidents: None
- High-Risk Zones: None
- Weather Impact: Dry (Optimal Conditions)
- Operational Status: STANDBY (surveillance active)`
      }
    ]);
  };

  // Submit vocal or written commands through Server REST Gemini API
  const handleSubmitCommand = async (commandText: string) => {
    setIsLoading(true);

    const stadiumPayload = {
      activeIncidentId: activeIncident?.id,
      overallRiskLevel: telemetry.overallRiskLevel,
      crowdStabilityScore: telemetry.crowdStabilityScore,
      blockedGates,
      congestedGates,
      evacuationActive,
      simulationTimelineForecastMinutes: simulationMinutes
    };

    try {
      const resp = await fetch("/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: commandText,
          currentStadiumState: stadiumPayload
        })
      });

      const data = await resp.json();

      if (data && data.rawResponseText) {
        // Apply adjustments from the Gemini master agent
        if (data.stadiumAdjustments) {
          const adj = data.stadiumAdjustments;
          if (adj.blockedGates && adj.blockedGates.length > 0) {
            setBlockedGates(adj.blockedGates);
          }
          if (adj.congestedGates && adj.congestedGates.length > 0) {
            setCongestedGates(adj.congestedGates);
          }
          if (commandText.toLowerCase().includes("evacu") || commandText.toLowerCase().includes("exit")) {
            setEvacuationActive(true);
          }
        }

        // Voice out the spoken synthesized text
        if (data.voiceSynthesisText) {
          speakText(data.voiceSynthesisText);
        }

        // Append to chat log
        setMessages(prev => [
          ...prev,
          {
            id: `user-cmd-${Date.now()}`,
            sender: "USER",
            text: commandText,
            timestamp: new Date().toLocaleTimeString()
          },
          {
            id: `sys-cmd-${Date.now()}`,
            sender: "SYSTEM",
            text: data.voiceSynthesisText || "Tactical security evaluation completed. Check raw orchestration output tab for multi-agent reports.",
            timestamp: new Date().toLocaleTimeString(),
            agentAnalysisText: data.rawResponseText
          }
        ]);
      }
    } catch (err: any) {
      console.error("SentinelOS X Client command processing error:", err);
      // Fallback fallback simulated handling
      speakText("Evaluating safety command locally. Security override adjustments applied.");
    } finally {
      setIsLoading(false);
    }
  };

  // Perform manual overrides from Action Deck buttons
  const handleTriggerAction = (actionId: string) => {
    const msgId = Date.now().toString();
    let commandText = "";
    let systemText = "";

    if (actionId === "ACTION_EVAC") {
      const nextEvacState = !evacuationActive;
      setEvacuationActive(nextEvacState);
      
      commandText = nextEvacState ? "Simulate evacuation" : "Cease emergency evacuation simulation";
      systemText = nextEvacState
        ? "Emergency Evacuation SOP active: Opening Emergency doors Alpha and Beta. Spectator routing lines highlighted. Directing security teams."
        : "Evacuation protocol disengaged. Restoring normal entry/exit gate balance.";
      
      speakText(nextEvacState ? "Evacuation model activated. Rerouting all blocks to safest exit channels." : "Evacuation drill suspended.");
    } else if (actionId === "ACTION_GATE_B_TOGGLE") {
      const isBlocked = blockedGates.includes("GATE_B");
      let nextBlocked: string[] = [];
      let nextCong: string[] = [];
      
      if (isBlocked) {
        nextBlocked = [];
        commandText = "Unlock Gate B and restore turnstile scanning";
        systemText = "Gate B turnstiles unlocked. Stiles pressure relieved. Normal operations restored.";
        speakText("Gate B open. Crowd flow is normalizing.");
      } else {
        nextBlocked = ["GATE_B"];
        nextCong = ["GATE_A", "GATE_C"];
        commandText = "What happens if Gate B closes?";
        systemText = "Tactical simulation check: Force closing Gate B. Diverting outer crowd traffic to Gate A and East Exit C.";
        speakText("Gate B turnstile failure simulated. Spectators redirected to Gate A.");
      }
      setBlockedGates(nextBlocked);
      setCongestedGates(nextCong);
    } else if (actionId === "ACTION_DISPATCH") {
      commandText = "Dispatch emergency response";
      systemText = "SOP Dispatch Engaged: Medical response team sent to stand standby at Medical Bay 1 and clinic NW corridor. Security Quick response teams deployed to Gate B gates.";
      speakText("Dispatched Emergency Quick Response Teams to Gate approach walkways.");
    } else if (actionId === "ACTION_ALERTS") {
      commandText = "Generate calming emergency announcement";
      systemText = "Broadcasting calming announcements to all central split-screens: 'Spectators please notice. All exits are open. Walk calmly to your corresponding color zone.'";
      speakText("Warning announce system loop initiated to primary displays.");
    }

    if (commandText) {
      setMessages(prev => [
        ...prev,
        {
          id: `user-act-${msgId}`,
          sender: "USER",
          text: `Manual Override Trigger: ${commandText}`,
          timestamp: new Date().toLocaleTimeString()
        },
        {
          id: `sys-act-${msgId}`,
          sender: "SYSTEM",
          text: systemText,
          timestamp: new Date().toLocaleTimeString(),
          agentAnalysisText: createMockSpeechTelemetry(commandText, activeIncident?.id || "IDLE", evacuationActive, blockedGates)
        }
      ]);
    }
  };

  // Dynamically map diagnostic explanations for the agent panel
  const getDynamicAgentDiagnostics = (): AgentDiagnostics[] => {
    const activeId = activeIncident?.id || "";

    if (activeIncident && activeId.includes("CLOUDBURST")) {
      return [
        { agentId: "AGENT_CROWD", name: "Crowd Intelligence", status: "ALERT", analysis: "Fans rushing from Stand C away from violent rain. Oasis Food Plaza density peaking.", confidenceScore: 92, riskImpactCode: "Local surge warning", priorityActions: ["Bypass Exit B"] },
        { agentId: "AGENT_ROUTING", name: "Routing Optimization", status: "ANALYZING", analysis: "Redirecting exposed Upper stand spectators to covered concourse corridors.", confidenceScore: 89, riskImpactCode: "Balances pavilion congestion", priorityActions: ["Route Oasis"] },
        { agentId: "AGENT_EMERGENCY", name: "Emergency Response", status: "RESOLVING", analysis: "Dispatched first aid units to corridor walkways to monitor slips.", confidenceScore: 95, riskImpactCode: "Clinic dispatch active", priorityActions: ["Clear NW Clinic"] },
        { agentId: "AGENT_COMM", name: "Public Comm", status: "ALERT", analysis: "Displaying 'Shelter calmly under structural stand overhangs' on screens.", confidenceScore: 91, riskImpactCode: "Mutes panic waves", priorityActions: ["Play loop 3"] },
        { agentId: "AGENT_SECURITY", name: "Security Threat", status: "MONITORING", analysis: "Corridor friction checks confirm no agitations. Crowd is cooperative.", confidenceScore: 97, riskImpactCode: "Post-panic normal checks", priorityActions: ["Surround checks"] },
        { agentId: "AGENT_PREDICTIVE", name: "Predictive Sim", status: "ALERT", analysis: "Monsoonal propagation simulation confirms 4 min bottle-neck under food courts.", confidenceScore: 86, riskImpactCode: "High casualty mitigation", priorityActions: ["Evac simulation"] },
        { agentId: "AGENT_VISUALIZATION", name: "Visualization", status: "MONITORING", analysis: "Overlaying rain thermal sensor points. Highlight safe shelter zones.", confidenceScore: 94, riskImpactCode: "Digital Twin sync active", priorityActions: ["Reroute arrows"] },
        { agentId: "AGENT_VOICE", name: "Voice Command", status: "MONITORING", analysis: "Processing commands for shelter routing and crowd dispersal.", confidenceScore: 99, riskImpactCode: "Vocal dispatch standby", priorityActions: ["Awaiting speak"] }
      ];
    }

    if (activeIncident && activeId.includes("GATE_LOCKOUT")) {
      return [
        { agentId: "AGENT_CROWD", name: "Crowd Intelligence", status: "ALERT", analysis: "Turnstiles crash causing 4.8k fans queue pressed at Entry B stiles.", confidenceScore: 94, riskImpactCode: "Crush surge imminent", priorityActions: ["Bypass Gate B"] },
        { agentId: "AGENT_ROUTING", name: "Routing Optimization", status: "RESOLVING", analysis: "Diverting incoming spectators away from Gate B towards Entry Gate A.", confidenceScore: 91, riskImpactCode: "Relieves bottleneck by 64%", priorityActions: ["Route Gate A"] },
        { agentId: "AGENT_EMERGENCY", name: "Emergency Response", status: "RESOLVING", analysis: "QRT Security sent to stiles to establish manual entry scanning gates.", confidenceScore: 93, riskImpactCode: "Physical stanchions deployed", priorityActions: ["Override turnstiles"] },
        { agentId: "AGENT_COMM", name: "Public Comm", status: "ALERT", analysis: "LED panels updated: 'Gate B turnstiles closed. Re-route north to Gate A'.", confidenceScore: 88, riskImpactCode: "Prevents tailback queues", priorityActions: ["SMS broadcast"] },
        { agentId: "AGENT_SECURITY", name: "Security Threat", status: "ANALYZING", analysis: "Agitation index rising at holding mesh. Gate crash risk monitored.", confidenceScore: 90, riskImpactCode: "Escalate cordon teams", priorityActions: ["Deploy Alpha unit"] },
        { agentId: "AGENT_PREDICTIVE", name: "Predictive Sim", status: "ALERT", analysis: "Crowd crush forecast warns of incident expansion if stiles hold for 10m.", confidenceScore: 95, riskImpactCode: "Stampede propagation test", priorityActions: ["Calculate timeline"] },
        { agentId: "AGENT_VISUALIZATION", name: "Visualization", status: "ALERT", analysis: "Red warning pulse drawn on stiles. Directing detour routing vectors.", confidenceScore: 92, riskImpactCode: "Mapping target zones", priorityActions: ["Highlight arrows"] },
        { agentId: "AGENT_VOICE", name: "Voice Command", status: "MONITORING", analysis: "Processing hardware emergency override requests. Standing by.", confidenceScore: 98, riskImpactCode: "SOP vocal guidance", priorityActions: ["Awaiting query"] }
      ];
    }

    if (activeIncident && activeId.includes("SUSPICIOUS_BAG")) {
      return [
        { agentId: "AGENT_CROWD", name: "Crowd Intelligence", status: "ANALYZING", analysis: "Clearing West perimeter stalls. Keeping spectators out of boundary walk.", confidenceScore: 96, riskImpactCode: "Isolates threat point", priorityActions: ["Clear stall walk"] },
        { agentId: "AGENT_ROUTING", name: "Routing Optimization", status: "RESOLVING", analysis: "Diverting adjacent Block E fans towards West Exit Gate E and Exit D.", confidenceScore: 92, riskImpactCode: "Prevents bottleneck delay", priorityActions: ["Route Gate E"] },
        { agentId: "AGENT_EMERGENCY", name: "Emergency Response", status: "ALERT", analysis: "Bomb sweep dispatched. Canine patrol checking unattended rucksack.", confidenceScore: 95, riskImpactCode: "Isolate corridor active", priorityActions: ["Emergency response"] },
        { agentId: "AGENT_COMM", name: "Public Comm", status: "RESOLVING", analysis: "Audio warning broadcast inside adjacent blocks. Directing exit paths.", confidenceScore: 90, riskImpactCode: "Mutes public agitations", priorityActions: ["Clear warning announcement"] },
        { agentId: "AGENT_SECURITY", name: "Security Threat", status: "ALERT", analysis: "Level 4 alert. Perimeter sealed. Incident zone locked.", confidenceScore: 98, riskImpactCode: "Secure cordon sweep", priorityActions: ["Deploy K9 squad"] },
        { agentId: "AGENT_PREDICTIVE", name: "Predictive Sim", status: "ANALYZING", analysis: "Simulated explosion zone isolation checks confirm 99% crowd clearance.", confidenceScore: 94, riskImpactCode: "Isolates blast zone impact", priorityActions: ["Check blast simulation"] },
        { agentId: "AGENT_VISUALIZATION", name: "Visualization", status: "MONITORING", analysis: "Drawing red safety circle on boundary street. Dynamic detour highlighted.", confidenceScore: 91, riskImpactCode: "Twin overlay updated", priorityActions: ["Draw hazard map"] },
        { agentId: "AGENT_VOICE", name: "Voice Command", status: "MONITORING", analysis: "Analyzing threats. Vocal briefs prepped for security commanders.", confidenceScore: 99, riskImpactCode: "Direct command standby", priorityActions: ["Wait instructions"] }
      ];
    }

    if (activeIncident && activeId.includes("VICTORY_SURGE")) {
      return [
        { agentId: "AGENT_CROWD", name: "Crowd Intelligence", status: "ALERT", analysis: "Spectators exiting East stands concurrently post stadium cricket win.", confidenceScore: 91, riskImpactCode: "High-level density check", priorityActions: ["Analyze stands"] },
        { agentId: "AGENT_ROUTING", name: "Routing Optimization", status: "RESOLVING", analysis: "Opening alternate emergency doors Alpha. Opening South Exit D.", confidenceScore: 88, riskImpactCode: "Relieves stile rush by 35%", priorityActions: ["Utilize Gate D"] },
        { agentId: "AGENT_EMERGENCY", name: "Emergency Response", status: "MONITORING", analysis: "Wardens dispatched to stanchions to organize parallel flow lanes.", confidenceScore: 94, riskImpactCode: "Maintains clear conduits", priorityActions: ["Secure crowd flow"] },
        { agentId: "AGENT_COMM", name: "Public Comm", status: "RESOLVING", analysis: "Displaying victory celebration guidelines and calm exit announcements.", confidenceScore: 95, riskImpactCode: "Mutes exit rushing", priorityActions: ["Display announcements"] },
        { agentId: "AGENT_SECURITY", name: "Security Threat", status: "ANALYZING", analysis: "Heightened excitement level causing minor stands rushing. Safe.", confidenceScore: 93, riskImpactCode: "Surveillance sweep active", priorityActions: ["Patrol stands"] },
        { agentId: "AGENT_PREDICTIVE", name: "Predictive Sim", status: "ALERT", analysis: "Simulation predicts 14 min gate stiles clearing timeline.", confidenceScore: 89, riskImpactCode: "Gate congestion projection", priorityActions: ["Evacuation models"] },
        { agentId: "AGENT_VISUALIZATION", name: "Visualization", status: "MONITORING", analysis: "Directing dynamic twin arrows post-match vectors. Red overlay mapping.", confidenceScore: 90, riskImpactCode: "Drawing stand outflows", priorityActions: ["Arrows overlay"] },
        { agentId: "AGENT_VOICE", name: "Voice Command", status: "MONITORING", analysis: "Awaiting routing commands for outer parking lot Blue.", confidenceScore: 97, riskImpactCode: "Operational standby", priorityActions: ["Awaiting voice"] }
      ];
    }

    // Default standby diagnostics if no incident
    return [
      { agentId: "AGENT_CROWD", name: "Crowd Intelligence", status: "MONITORING", analysis: "All stadium blocks currently under baseline density parameters.", confidenceScore: 99, riskImpactCode: "Scanning thermal metrics", priorityActions: ["Scan density"] },
      { agentId: "AGENT_ROUTING", name: "Routing Optimization", status: "MONITORING", analysis: "Evacuation paths open. Estimated clearing time: 8.5 minutes.", confidenceScore: 97, riskImpactCode: "Clear exit mapping", priorityActions: ["Calculate evacuation route"] },
      { agentId: "AGENT_EMERGENCY", name: "Emergency Response", status: "MONITORING", analysis: "Paramedics prepped at NW Clinic and Medical station SE. Standby.", confidenceScore: 98, riskImpactCode: "First aid ready", priorityActions: ["Medical diagnostic"] },
      { agentId: "AGENT_COMM", name: "Public Comm", status: "MONITORING", analysis: "General match scores and sponsors lists displaying on displays.", confidenceScore: 96, riskImpactCode: "Screens normal loop", priorityActions: ["Displays check"] },
      { agentId: "AGENT_SECURITY", name: "Security Threat", status: "MONITORING", analysis: "Crowd agitation levels normal. Metal detectors checking smoothly.", confidenceScore: 99, riskImpactCode: "Normal threat checks", priorityActions: ["checkpoint analysis"] },
      { agentId: "AGENT_PREDICTIVE", name: "Predictive Sim", status: "MONITORING", analysis: "Next 10 min projection shows no safety risk elements.", confidenceScore: 95, riskImpactCode: "Ideal crowd projections", priorityActions: ["Check tomorrow"] },
      { agentId: "AGENT_VISUALIZATION", name: "Visualization", status: "MONITORING", analysis: "Rendering 2D layout. No active danger markers detected.", confidenceScore: 98, riskImpactCode: "Normal wires render", priorityActions: ["Digital twin grid"] },
      { agentId: "AGENT_VOICE", name: "Voice Command", status: "MONITORING", analysis: "Voice engine online. Standard commands parsed instantly.", confidenceScore: 99, riskImpactCode: "Mic telemetry ready", priorityActions: ["Standby voice"] }
    ];
  };

  const handleApplyCopilotDirective = (dirId: string) => {
    setCopilotDirectives(prev =>
      prev.map(d => {
        if (d.id === dirId) {
          const nextApplied = !d.applied;
          if (nextApplied) {
            speakText(`Applying safety solution: ${d.message.replace("💡 Suggestion:", "")}`);
            if (dirId === "DIR_1") {
              setEvacuationActive(true); // Draw crowd routing detour
              setCongestedGates(["GATE_B"]);
            } else if (dirId === "DIR_2") {
              setZones(zones.map(z => z.id === "FOOD_OASIS" ? { ...z, riskFactor: 0.15 } : z)); // Medical deployed clears risk
            } else if (dirId === "DIR_3") {
              setBlockedGates(blockedGates.filter(g => g !== "GATE_B")); // Opens gates stiles issues
            }
          } else {
            speakText(`Rolling back safety solution index ${dirId}`);
          }
          return { ...d, applied: nextApplied };
        }
        return d;
      })
    );
  };

  const currentDiagnostics = getDynamicAgentDiagnostics();

  return (
    <div className="bg-[#050507] text-[#e0e0e0] min-h-screen flex flex-col font-sans transition-all selection:bg-[#00d4ff]/30">
      
      {/* Sentinel HEADER Bar */}
      <header className="bg-[#0a0a0f] border-b border-[#1a1a24] px-4 py-3 sticky top-0 z-40 shadow-lg select-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 bg-[#00d4ff] text-black font-extrabold rounded flex items-center justify-center text-lg shadow-[0_0_15px_rgba(0,212,255,0.4)] transition-transform hover:rotate-6">
              X
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-[rgba(0,255,0,0.1)] border border-[#00ff00] text-[#00ff00] px-2.5 py-0.5 rounded-full font-mono uppercase font-bold tracking-wider animate-pulse">
                  Active Surveillance
                </span>
              </div>
              <h1 className="text-lg font-bold tracking-wider text-white font-sans flex items-center gap-1.5 uppercase leading-tight mt-0.5">
                SentinelOS <span className="text-[#00d4ff] font-mono font-black">X</span>
              </h1>
            </div>
          </div>

          {/* Elegant header metadata display matches Sophisticated Dark */}
          <div className="flex items-center gap-6 md:gap-8">
            <div className="text-right">
              <div className="text-[9px] font-mono tracking-wider text-slate-500 uppercase">CRICKET WORLD CUP: FINAL</div>
              <div className="text-xs sm:text-sm font-bold text-white uppercase font-sans">EDEN GARDENS - KOLKATA</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] font-mono tracking-wider text-slate-500 uppercase">GLOBAL RISK</div>
              <div className={`text-xs sm:text-sm font-bold uppercase font-sans ${
                telemetry.overallRiskLevel === RiskLevel.CRITICAL
                  ? "text-[#ff4444] animate-pulse"
                  : telemetry.overallRiskLevel === RiskLevel.HIGH
                  ? "text-[#f27d26]"
                  : "text-[#00d4ff]"
              }`}>
                {telemetry.overallRiskLevel === RiskLevel.LOW
                  ? "14.2% - NOMINAL"
                  : telemetry.overallRiskLevel === RiskLevel.MEDIUM
                  ? "28.5% - ELEVATED"
                  : telemetry.overallRiskLevel === RiskLevel.HIGH
                  ? "54.0% - SEVERE"
                  : "89.4% - CRITICAL"}
              </div>
            </div>
            {/* Minimalist Clock */}
            <div className="hidden lg:flex flex-col items-end pl-4 border-l border-slate-800">
              <span className="text-[9px] text-slate-500 font-mono">UT MASTER TIME</span>
              <span className="text-xs text-slate-300 font-mono tracking-tight font-medium">05:22:39</span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Container Stage Grid */}
      <main className="flex-1 max-w-[1780px] w-full mx-auto p-4 flex flex-col lg:flex-row gap-6">
        
        {/* LEFT CONTROL SIDEBAR PANEL */}
        <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-4">
          
          {/* Main Modules Selection deck */}
          <div className="bg-[#0b0c16] border border-[#1d1f3b] rounded-xl p-3.5 space-y-1.5 shadow-xl">
            <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase block px-1.5 mb-2.5">
              📋 Control Modules
            </span>

            <button
              onClick={() => { setActiveTab("twin"); speakText("Switched to Narendra Modi digital twin view"); }}
              className={`w-full py-2.5 px-3 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
                activeTab === "twin"
                  ? "bg-cyan-950/85 text-[#00d4ff] border border-cyan-800/80 shadow-[0_0_12px_rgba(0,212,255,0.2)]"
                  : "bg-transparent text-slate-400 border border-transparent hover:bg-[#15162a] hover:text-slate-150"
              }`}
            >
              <span className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                🏟️ Live Twin Map
              </span>
              <span className="text-[8px] bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800 font-mono text-[#00d4ff]">LIVE</span>
            </button>

            <button
              onClick={() => { setActiveTab("command"); speakText("Switched to role based command post viewpoints Dashboard"); }}
              className={`w-full py-2.5 px-3 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
                activeTab === "command"
                  ? "bg-indigo-950/85 text-[#818cf8] border border-indigo-800/80 shadow-[0_0_12px_rgba(129,140,248,0.2)]"
                  : "bg-transparent text-slate-400 border border-transparent hover:bg-[#15162a] hover:text-slate-150"
              }`}
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                👥 command post
              </span>
              <span className="text-[8px] bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-800 font-mono text-indigo-300">ROLE</span>
            </button>

            <button
              onClick={() => { setActiveTab("anomaly"); speakText("Switched to YOLOv11 and computer vision anomaly trackers"); }}
              className={`w-full py-2.5 px-3 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
                activeTab === "anomaly"
                  ? "bg-amber-950/85 text-amber-400 border border-amber-850/80 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                  : "bg-transparent text-slate-400 border border-transparent hover:bg-[#15162a] hover:text-slate-150"
              }`}
            >
              <span className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-400" />
                📊 YOLOv11 Alerts
              </span>
              <span className="text-[8px] bg-amber-950 px-1.5 py-0.5 rounded border border-amber-900 font-mono text-amber-400">YOLO</span>
            </button>

            <button
              onClick={() => { setActiveTab("sos"); speakText("Switched to Whatsapp and IPL app SMS simulator"); }}
              className={`w-full py-2.5 px-3 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
                activeTab === "sos"
                  ? "bg-red-950/85 text-red-400 border border-red-800/80 shadow-[0_0_12px_rgba(239,68,68,0.2)]"
                  : "bg-transparent text-slate-400 border border-transparent hover:bg-[#15162a] hover:text-slate-150"
              }`}
            >
              <span className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-red-400 animate-pulse" />
                📱 Fan SOS portal
              </span>
              <span className="text-[8px] bg-red-950 px-1.5 py-0.5 rounded border border-red-900 font-mono text-red-300 animate-ping">SOS</span>
            </button>

            <button
              onClick={() => { setActiveTab("missing"); speakText("Switched to missing person tracker and post match egress timetable"); }}
              className={`w-full py-2.5 px-3 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
                activeTab === "missing"
                  ? "bg-purple-950/85 text-purple-400 border border-purple-800/80 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                  : "bg-transparent text-slate-400 border border-transparent hover:bg-[#15162a] hover:text-slate-300"
              }`}
            >
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4 text-purple-400" />
                🔍 Egress &amp; Search
              </span>
              <span className="text-[8px] bg-purple-950 px-1.5 py-0.5 rounded border border-purple-900 font-mono text-purple-300">TRAJ</span>
            </button>
          </div>

          {/* Interactive Layer Switches (Configurable map overlays) */}
          <div className="bg-[#0b0c16] border border-[#1d1f3b] rounded-xl p-3.5 space-y-3 shadow-xl">
            <div>
              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase block mb-1">
                ⚙️ Digital Twin Layers
              </span>
              <p className="text-[9.5px] text-slate-400 leading-normal">Uncheck layers to filter visuals on Narendra Modi map twin:</p>
            </div>
            
            <div className="space-y-2 select-none">
              {[
                { id: "crowd", label: "👥 Crowd Walk-Avatars", color: "text-emerald-400" },
                { id: "security", label: "👮 Security Cordons", color: "text-[#3b82f6]" },
                { id: "medical", label: "🏥 Medical Response Stations", color: "text-red-400" },
                { id: "ticketing", label: "🎟️ Gate Tickets & Stiles", color: "text-amber-500" },
                { id: "exit_routes", label: "🧭 Animated Safe Detours", color: "text-cyan-400" },
                { id: "risk_zones", label: "⚠️ Risk Heatmap Pulses", color: "text-rose-500" },
              ].map(layer => {
                const checked = visibleLayers.includes(layer.id);
                return (
                  <label key={layer.id} className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white font-medium">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        if (checked) {
                          setVisibleLayers(visibleLayers.filter(l => l !== layer.id));
                        } else {
                          setVisibleLayers([...visibleLayers, layer.id]);
                        }
                      }}
                      className="accent-cyan-500 rounded border-slate-700"
                    />
                    <span className={`${layer.color} truncate`}>{layer.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* System status summaries */}
          <div className="bg-[#0b0c16] border border-[#1d1f3b] rounded-xl p-3.5 shadow-xl space-y-2 text-[10px] font-mono">
            <span className="text-[9px] text-slate-500 tracking-widest uppercase block mb-2 font-sans font-semibold">
              📶 Global Stability Summary
            </span>
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span className="text-slate-500 font-sans">Index rating:</span>
              <span className={telemetry.crowdStabilityScore < 60 ? "text-red-400 font-bold animate-pulse" : "text-emerald-400"}>
                {telemetry.crowdStabilityScore}% safe
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Active Risk Level:</span>
              <span className={activeIncident ? "text-red-400 font-bold" : "text-cyan-400"}>
                {telemetry.overallRiskLevel}
              </span>
            </div>
          </div>

        </aside>

        {/* RIGHT ACTIVE VISUAL STAGE */}
        <section className="flex-1 min-w-0 space-y-5">
          
          {/* Onboarding playbook menu */}
          {showGuide ? (
            <div className="bg-gradient-to-r from-[#11111a] to-[#0a0a0f] border border-[#1d1f3b] rounded-xl p-4 md:p-5 shadow-2xl relative overflow-hidden">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 bg-[rgba(0,212,255,0.08)] border border-[#00d4ff]/40 rounded-lg text-[#00d4ff]">
                    <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-white tracking-wide uppercase font-sans">
                      SentinelOS X Interactive Playbook &amp; Orientation
                    </h2>
                    <p className="text-[11px] text-[#00d4ff] font-mono tracking-widest uppercase mt-0.5">
                      Tactical Digital Twin &bull; Live Security Simulation
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGuide(false)}
                  className="text-slate-400 hover:text-white bg-[#1e1e2d] px-2.5 py-1 rounded text-[10px] font-mono uppercase border border-transparent hover:border-slate-700 transition-colors"
                >
                  Dismiss Playbook
                </button>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed border-t border-slate-900/60 pt-2 font-sans font-normal">
                Observe the live <strong>Narendra Modi Stadium Digital Twin</strong>. Use the left sidebar to shift modules, simulate custom alert pushes, clothing tracking scopes, or click stand elements to activate overlay monitors.
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-[#0b0c16] border border-[#1e1e2d] rounded-xl px-4 py-2 text-xs shadow-md">
              <span className="text-slate-400 font-sans">Tactical Control Terminal operational. Switch modules on left to activate custom views.</span>
              <button onClick={() => setShowGuide(true)} className="text-[#00d4ff] hover:underline font-mono text-[10px] uppercase font-bold flex items-center gap-1">
                <HelpCircle className="w-3 focus:outline-none" /> Guidance Playbook
              </button>
            </div>
          )}

          {/* TAB 1: LIVE DIGITAL TWIN WITH SPECTATORS & CROWD FLOW ARROWS */}
          {activeTab === "twin" && (
            <div className="space-y-5">
              
              {/* Voice and speech entry core console */}
              <CommandConsole
                messages={messages}
                onSubmitCommand={handleSubmitCommand}
                isLoading={isLoading}
                voiceSynthesisAvailable={voiceSynthesisAvailable}
                speakText={speakText}
              />

              {/* Digital twin map */}
              <div className="bg-[#050510] border border-[#1e1e2d] rounded-xl p-1 shadow-2xl">
                <DigitalTwin
                  zones={zones}
                  activeIncident={activeIncident}
                  onSelectZone={setSelectedZone}
                  selectedZone={selectedZone}
                  blockedGates={blockedGates}
                  congestedGates={congestedGates}
                  simulationMinutes={simulationMinutes}
                  showHeatmap={showHeatmap}
                  evacuationActive={evacuationActive}
                  speakText={speakText}
                  visibleLayers={visibleLayers}
                  onToggleGate={(gateId) => {
                    if (blockedGates.includes(gateId)) {
                      setBlockedGates(blockedGates.filter(g => g !== gateId));
                      speakText(`Gate ${gateId.replace("_", " ").toUpperCase()} safety blockade removed. Flow pathways reopened.`);
                    } else {
                      setBlockedGates([...blockedGates, gateId]);
                      speakText(`Gate ${gateId.replace("_", " ").toUpperCase()} shut down by operator command. Rerouting algorithms activated.`);
                    }
                  }}
                  onToggleCongestion={(gateId) => {
                    if (congestedGates.includes(gateId)) {
                      setCongestedGates(congestedGates.filter(g => g !== gateId));
                    } else {
                      setCongestedGates([...congestedGates, gateId]);
                    }
                  }}
                  onToggleEvacuation={() => {
                    const nextVal = !evacuationActive;
                    setEvacuationActive(nextVal);
                    speakText(nextVal ? "WARNING: Emergency evacuation activated. Safe routing vectors highlighted on stadium model." : "Manual evacuation overridden. Stadium returned to normal operating level.");
                  }}
                />
              </div>

              {/* Decay timeline forecast range */}
              <div id="predictive_time_line_slider" className="bg-[#0b0c16] border border-[#1e1e2d] rounded-xl p-4 shadow-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-slate-300 uppercase font-mono flex items-center gap-1.5 animate-pulse">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    Crowd Decay &amp; Bottlenecks timeline slider
                  </span>
                  <span className="bg-slate-950 border border-slate-900 px-2.5 py-0.5 rounded text-xs text-[#00d4ff] font-mono leading-none">
                    Projections: +{simulationMinutes} Min
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={simulationMinutes}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setSimulationMinutes(val);
                    const updated = INITIAL_ZONES.map(z => {
                      let nextRisk = z.riskFactor;
                      if (val > 0) {
                        if (z.id === "STAND_C" || z.id === "GATE_B" || z.id === "FOOD_OASIS") {
                          nextRisk = Math.min(z.riskFactor + (val * 0.08), 1.0);
                        } else {
                          nextRisk = Math.min(z.riskFactor + (val * 0.03), 1.0);
                        }
                      }
                      return {
                        ...z,
                        riskFactor: nextRisk,
                        statusText: val > 0 ? `Simulated safety projection +${val}m active.` : undefined
                      };
                    });
                    setZones(updated);
                  }}
                  className="w-full accent-cyan-500 h-1.5 bg-slate-150 rounded cursor-pointer border border-slate-900"
                />
              </div>

              {/* Splitted detail panels at bottom of Live Twin layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                
                {/* Row 1: Agent Telemetry (Span full width across all 3 grid columns) */}
                <div className="lg:col-span-3">
                  <AgentTelemetry diagnostics={currentDiagnostics} />
                </div>

                {/* Row 2: Action Override Deck (Span full width across all 3 grid columns) */}
                <div className="lg:col-span-3">
                  <ActionDeck
                    onTriggerAction={handleTriggerAction}
                    evacuationActive={evacuationActive}
                    heatmapActive={showHeatmap}
                    onToggleHeatmap={() => setShowHeatmap(!showHeatmap)}
                    blockedGatesCount={blockedGates.length}
                  />
                </div>

                {/* Row 3: Incident Simulator (Takes up 2/3 of row width) */}
                <div className="lg:col-span-2 flex flex-col h-full">
                  <IncidentSimulator
                    onTriggerIncident={handleTriggerIncident}
                    activeIncidentId={activeIncident ? INCIDENT_TEMPLATES.find(t => activeIncident.title.includes(t.title))?.id || "CUSTOM" : null}
                    onResetIncident={handleResetIncident}
                  />
                </div>

                {/* Row 3: Threat Index Scores (Takes up 1/3 of row width, matching Incident Simulator height) */}
                <div className="lg:col-span-1 bg-[#0b0c16] border border-[#1e1e2d] rounded-xl p-4 shadow-xl flex flex-col justify-between">
                  <div className="space-y-3.5">
                    <span className="text-[11px] text-cyan-400 font-mono uppercase tracking-wider block border-b border-slate-900 pb-1.5 mb-2.5">
                      📊 Current Threat Index Scores
                    </span>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-[10px] font-mono text-slate-500">
                          <span>DYNAMIC RISK THREAT</span>
                          <span>{telemetry.overallRiskLevel}</span>
                        </div>
                        <div className="w-full bg-slate-950 h-1 rounded overflow-hidden mt-1 text-[2px]">
                          <div className={`h-full ${telemetry.overallRiskLevel === "CRITICAL" ? "bg-red-500 w-full" : "bg-cyan-500 w-1/3"}`}></div>
                        </div>
                      </div>

                      <div className="p-2.5 bg-slate-950/60 border border-slate-900 rounded text-xs">
                        <span className="text-[9px] text-slate-500 font-mono block uppercase mb-0.5 font-semibold">Predicted Bottlenecks (+5m)</span>
                        <p className="text-slate-400 leading-normal">
                          {blockedGates.includes("GATE_B") ? "Turnstiles offline at Gate B. Spectator tailbacks forming along Outer Lot." : "Clear baseline unidirectional movements recorded."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-950/20 border border-red-950/60 p-2.5 rounded flex justify-between items-center text-xs mt-4">
                    <span className="text-red-400 font-mono text-[9px]">EVAC COMPLETION TARGET</span>
                    <span className="font-mono font-bold text-slate-200">{evacuationActive ? "7.4 Mins" : "11.2 Mins"}</span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: TACTICAL ROLE COMMAND POST */}
          {activeTab === "command" && (
            <CommandPostView
              activeIncident={activeIncident}
              overallRiskLevel={telemetry.overallRiskLevel}
              evacuationActive={evacuationActive}
              copilotDirectives={copilotDirectives}
              onApplyDirective={handleApplyCopilotDirective}
              speakText={speakText}
            />
          )}

          {/* TAB 3: YOLOv11 COMPUTER VISION ANALYTICS */}
          {activeTab === "anomaly" && (
            <VisionMonitor
              currentStadiumState={{
                overallRiskLevel: telemetry.overallRiskLevel,
                crowdStabilityScore: telemetry.crowdStabilityScore,
                blockedGates,
                congestedGates,
                evacuationActive
              }}
              onApplySystemAdjustments={(adj) => {
                setCvOverride({
                  density: adj.overallRiskLevel,
                  safetyIndex: adj.crowdStabilityScore,
                  advice: adj.advice || ""
                });
              }}
              speakText={speakText}
            />
          )}

          {/* TAB 4: ACTIVE PARTITION FAN ALERT SYSTEM */}
          {activeTab === "sos" && (
            <SOSSafetyApp
              evacuationActive={evacuationActive}
              blockedGates={blockedGates}
              simulationMinutes={simulationMinutes}
              speakText={speakText}
              onActivateEvacuation={() => setEvacuationActive(true)}
              onDeactivateEvacuation={() => setEvacuationActive(false)}
              onResetAll={handleResetIncident}
            />
          )}

          {/* TAB 5: MINING HISTORIES & TRAJECTORY TRACKERS */}
          {activeTab === "missing" && (
            <MissingEgressView
              speakText={speakText}
              stadiumCapacity={telemetry.stadiumCapacity}
              currentTotalCrowd={telemetry.currentTotalCrowd}
            />
          )}

        </section>

      </main>

      {/* Corporate signature / aesthetic margins */}
      <footer className="bg-[#0a0a0f] border-t border-[#1a1a24] py-4 px-4 mt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-mono select-none">
        <div className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#00d4ff] animate-pulse" />
          <span>SentinelOS X operations platform — Developed for Cricket Ground authority.</span>
        </div>
        <div className="mt-2 sm:mt-0 uppercase">2026 UTC Sentinel Safety systems — All rights monitored.</div>
      </footer>

    </div>
  );
}

// Generate highly detailed operational simulated responses for safety overrides to feed chat command logs
function createMockSpeechTelemetry(cmd: string, incidentId: string, isEvac: boolean, blocked: string[]) {
  const cleanCmd = cmd.toLowerCase();
  
  let riskStr = "MEDIUM";
  let stability = "78%";
  let description = "Direct response simulation requested by command warden.";
  
  if (cleanCmd.includes("evacu") || isEvac) {
    riskStr = "HIGH";
    stability = "62%";
    description = "Full evacuation vector active. Diverting North Stand stream towards Exits C and D.";
  } else if (cleanCmd.includes("gate") || blocked.length > 0) {
    riskStr = "HIGH";
    stability = "68%";
    description = "Gate B turnstile lockout simulated. Stiles pressure index has tripped local alerts.";
  }

  return `====================================================
CURRENT STADIUM STATUS
====================================================
- Overall Risk Level: ${riskStr}
- Crowd Stability Score: ${stability}
- Active Incidents: ${incidentId !== "IDLE" ? incidentId : "None"}
- High-Risk Zones: Gate B bottleneck holding pens
- Weather Impact: Dry Conditions (Ambient monitor)
- Operational Status: ACTIVE OVERRIDE (Manual controls overridden)

====================================================
LIVE VISUALIZATION SUMMARY
====================================================
- Heatmap Status: Congestion focal point at North-East gate approach
- Congestion Visualization: Yellow density warnings at food outlets
- Safe Routes: Exit A, Exit D (VIP Section Plaza approach)
- Blocked Zones: ${blocked.length > 0 ? blocked.join(", ") : "None"}
- Crowd Flow Direction: Staggered unidirectional egress vectors
- Emergency Team Locations: Checkpoints Alpha & Beta, Medical Stations 1 & 2
- Digital Twin Updates: Evacuation paths and warning pulses overlaid in real time

====================================================
AGENT ANALYSIS
====================================================
1. Crowd Intelligence Agent: Local stand rush registered. High local pressure on walkway 4. Recommended diversion active.
2. Routing Optimization Agent: Closed Entry B scanning holding stiles. Shifted 18% of spectator outflow directly through exit D with zero congestion.
3. Emergency Response Agent: Dispatched Security Patrol Alpha to Gate B holding perimeter mesh. Paramedics staged at Clinic Northwest.
4. Public Communication Agent: Broadcasted calming announcements on split monitors: 'Spectators proceed according to color-coded safe lines.'
5. Security Threat Agent: Excitement agitation checks normal. Perimeter mesh verified sound.
6. Predictive Simulation Agent: Disaster propagation potential minimized by 42%. Egress time estimation settles at 11 minutes with 94% confidence.
7. Visualization Intelligence Agent: Drew warning pulses on stiles. Route flow lines updated to neon flash.
8. Voice Command Intelligence Agent: Extracted instructions: "${cmd}". Redirecting terminal feedback.
9. Orchestrator Agent: Pre-emptively balanced crowd flow. Strategic safety priorities successfully executed.

====================================================
PREDICTIVE SIMULATION
====================================================
- Expected crowd movement: Unidirectional egress towards parking Blue
- Predicted congestion: Moderate stiles queue
- Potential panic zones: Concourse bottlenecks (Mitigated)
- Risk propagation: Decaying safely under optimized bypass routing
- Estimated evacuation feasibility: 92%
- Predicted stabilization time: 4.5 minutes

====================================================
AUTONOMOUS ACTIONS
====================================================
- Crowd rerouting actions: Re-orienting stanchions, opening Emergency Alpha
- Security deployment: Shifted 12 wardens to Entry A corridor
- Emergency dispatch: Paramedics prepped at Medical Station 2
- Public announcements: Warning script loop 4 initiated
- Dynamic signage updates: LED signboards updated to GREEN for Exit D
- Escalation procedures: Standard level-two safety alert

====================================================
VOICE RESPONSE MODE
====================================================
Execution directive completed successfully. Crowd safety measures balanced stadium-wide: Emergency evac door Alpha opened to relief.

====================================================
EXPLAINABLE AI REASONING
====================================================
- Why decisions were made: stile delays at Gate B caused density to spike. Forcing bypass routing protects spectator safety zones from crush triggers.
- Confidence score: 91%
- Estimated risk reduction: Reduces bottleneck density by 42% at Gate B stiles
- Strategic tradeoffs: Minor walking detour for VIP stands
- Expected outcomes: Egress clearing settled safely inside eleven minutes

====================================================
FINAL COMMAND CENTER SUMMARY
====================================================
- Immediate priorities: Maintain crowd speed, clear stile tailbacks
- Highest risk zones: Entry B holding pens
- Recommended actions: Release exit gates sequentially, hold incoming flows
- System confidence: 94%
- Safety stabilization estimate: 5 minutes`;
}
