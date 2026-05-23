/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Shared Gemini SDK Client setup
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("SentinelOS X: Gemini AI SDK initialized successfully.");
  } catch (err) {
    console.error("SentinelOS X: Failed to initialize Gemini API Client:", err);
  }
} else {
  console.log("SentinelOS X: GEMINI_API_KEY is not defined. Initializing simulation in standalone local engine mode.");
}

// REST Client Command Route
app.post("/api/command", async (req, res) => {
  const { command, currentStadiumState } = req.body;

  if (!command) {
    return res.status(400).json({ error: "No voice or text command provided." });
  }

  const stadiumStateString = JSON.stringify(currentStadiumState || {}, null, 2);

  const systemPrompt = `You are SentinelOS X — an autonomous multi-agent AI operating system for cricket/sporting stadium intelligence and crowd safety.
Your orchestrator merges analytical intelligence to predict and prevent crowd disasters, bottleneck stampedes, coordinate emergencies, and control signage.
You coordinate 8 agents:
1. Crowd Intelligence Agent (Density, surges, risks)
2. Routing Optimization Agent (Exits, evacuation routes, bottleneck relief)
3. Emergency Response Agent (SOPs, medical dispatch, security)
4. Public Communication Agent (Multilingual alert scripts, calm announcements)
5. Security Threat Agent (Suspicious bags, fights, aggressive behavior)
6. Predictive Simulation Agent (Next 1, 5, 10 min forecasts, risk maps)
7. Visualization Intelligence Agent (Digital Twin Heatmaps / arrows)
8. Voice Command Intelligence Agent (Natural voice handling)

Below is the CURRENT LIVE STATE of the stadium simulation. Integrate this directly into your analysis:
${stadiumStateString}

In your response, you MUST provide an explicit, realistic analysis based on the command and current state. If the user commands an action (e.g. "Simulate evacuation", "What happens if Gate B closes?", "Dispatch emergency response", "Show safest evacuation route"), execute it in the simulation output state and explain why.

You must reply with a JSON object containing the exact following keys:
1. "rawResponseText": A string containing the exact requested format with all headings, equal signs "====", and markdown structure intact:
====================================================
CURRENT STADIUM STATUS
====================================================
- Overall Risk Level: [LOW / MEDIUM / HIGH / CRITICAL]
- Crowd Stability Score: [0-100]
- Active Incidents: [List incidents or None]
- High-Risk Zones: [List high-risk areas]
- Weather Impact: [Dry / Slow movement / Rain, etc]
- Operational Status: [Normal / Evacuation Phase, etc]

====================================================
LIVE VISUALIZATION SUMMARY
====================================================
- Heatmap Status: [e.g. Severe red cluster at Gate B]
- Congestion Visualization: [Descriptive details]
- Safe Routes: [Safest exits]
- Blocked Zones: [List blocked zones/gates]
- Crowd Flow Direction: [Directions]
- Emergency Team Locations: [Where medical and security sit]
- Digital Twin Updates: [What changes on screen]

====================================================
AGENT ANALYSIS
====================================================
1. Crowd Intelligence Agent: [Analysis]
2. Routing Optimization Agent: [Rerouting instructions]
3. Emergency Response Agent: [Dispatches]
4. Public Communication Agent: [Multilingual calm announcement script]
5. Security Threat Agent: [Security level evaluation]
6. Predictive Simulation Agent: [Bottleneck forecast risk score & confidence score, evacuation minutes]
7. Visualization Intelligence Agent: [Dashboard overlay status]
8. Voice Command Intelligence Agent: [Concisely transcribe intention]
9. Orchestrator Agent: [Strategic resolution master plan]

====================================================
PREDICTIVE SIMULATION
====================================================
- Expected crowd movement:
- Predicted congestion:
- Potential panic zones:
- Risk propagation:
- Estimated evacuation feasibility: [Scale of 0-100%]
- Predicted stabilization time: [Minutes]

====================================================
AUTONOMOUS ACTIONS
====================================================
- Crowd rerouting actions:
- Security deployment:
- Emergency dispatch:
- Public announcements:
- Dynamic signage updates:
- Escalation procedures:

====================================================
VOICE RESPONSE MODE
====================================================
[Interpret and execute the command logically. Provide a concise spoken operational answer, and explain reasoning clearly.]

====================================================
EXPLAINABLE AI REASONING
====================================================
- Why decisions were made:
- Confidence score: [e.g., 94%]
- Estimated risk reduction: [e.g., reduces stampede risk by 42%]
- Strategic tradeoffs:
- Expected outcomes:

====================================================
FINAL COMMAND CENTER SUMMARY
====================================================
- Immediate priorities:
- Highest risk zones:
- Recommended actions:
- System confidence:
- Safety stabilization estimate: [minutes]

2. "stadiumAdjustments": A nested JSON object defining simulated changes to apply to the frontend state:
{
  "overallRiskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "crowdStabilityScore": number (0 to 100),
  "stabilizationMinutes": number,
  "blockedGates": string[] (e.g. ["GATE_B"]),
  "congestedGates": string[] (e.g. ["GATE_C"]),
  "routeHighlight": string (id of recommended route),
  "alertCount": number
}

3. "voiceSynthesisText": A clear, concise, direct speech text (maximum 2 sentences) for text-to-speech feedback. (e.g. "Gate B is closed due to high bottleneck density. Rerouting crowd to Gate C immediately to prevent a stampede.").

Ensure that your explanation uses professional military, high-level sporting security or civilian safety terminology, maintaining absolute calm.`;

  // Standard Programmatic Fallback Response Creator
  const getSimulatedFallback = (cmd: string) => {
    const cleanCmd = cmd.toLowerCase();
    
    let risk = "MEDIUM";
    let stability = 84;
    let blockedGates: string[] = [];
    let congestedGates: string[] = [];
    let voiceText = "";
    let descriptionDetail = "Command received. Optimizing crowd safety factors stadium-wide.";

    if (cleanCmd.includes("gate b") || cleanCmd.includes("gate b closes") || (cleanCmd.includes("gate b") && cleanCmd.includes("close"))) {
      risk = "HIGH";
      stability = 68;
      blockedGates = ["GATE_B"];
      congestedGates = ["GATE_A", "GATE_C"];
      voiceText = "SentinelOS X Alert: Gate B turnstiles closed. Rerouting North Stand crowd flow to Gate C approach walkways to prevent severe stile congestion.";
      descriptionDetail = "Gate B experiencing high pressure bottlenecks. Redirecting North stand crowds.";
    } else if (cleanCmd.includes("post-match") || cleanCmd.includes("post match") || cleanCmd.includes("congestion")) {
      risk = "HIGH";
      stability = 74;
      congestedGates = ["GATE_B", "GATE_C"];
      voiceText = "Simulating full post-match spectator egress. High risk of turnstile compaction at Gate B and C. Activating dynamic scoreboard routing guidelines to bypass parking Lot Blue and shift segment traffic towards Gate D.";
      descriptionDetail = "Simulated post-match crowd outflow. Commencing sequential discharge stanchion controls.";
    } else if (cleanCmd.includes("exit d") || cleanCmd.includes("exit d closes") || cleanCmd.includes("gate d") || cleanCmd.includes("exit d close")) {
      risk = "CRITICAL";
      stability = 45;
      blockedGates = ["GATE_D"];
      congestedGates = ["GATE_B", "GATE_C"];
      voiceText = "Dynamic simulation of Exit Gate D sudden closure active. Escape lanes closed in South-East quadrants. Spectator clearing times increase by 3.8 minutes with heavy bottlenecks expected at VIP Plaza turnstiles. Wardens deployed to redirect crowd.";
      descriptionDetail = "What-If Simulation: South exit shutdown. Modeling pressure propagation on East and West pathways.";
    } else if (cleanCmd.includes("rain") || cleanCmd.includes("heavy rain") || cleanCmd.includes("weather") || cleanCmd.includes("monsoon")) {
      risk = "CRITICAL";
      stability = 51;
      congestedGates = ["GATE_B", "FOOD_OASIS"];
      voiceText = "Weather override active: heavy monsoon rainfall simulated. 12,000 spectators shifting from open Stand C and North Stand into covered Oasis Concourse. Spiking slip hazards at dining stalls. Emergency crews dispatched to lay utility grit.";
      descriptionDetail = "What-If Simulation: sudden cloudburst storm. Modeling concourse influx and footing stress levels.";
    } else if (cleanCmd.includes("highest risk") || cleanCmd.includes("highest risk zone") || cleanCmd.includes("risk zone") || cleanCmd.includes("risk")) {
      risk = "HIGH";
      stability = 65;
      congestedGates = ["GATE_B", "FOOD_OASIS"];
      voiceText = "Dynamic thermal sensor scans complete. Gate B turnstile approach and the Central Food Oasis concourse are flagged as highest risk zones. Recommendation: restrict stiles and activate detour banners.";
      descriptionDetail = "Real-time density risk profiling isolated. Live safety layers mapped.";
    } else if (cleanCmd.includes("evacu") || cleanCmd.includes("safety") || cleanCmd.includes("simulat")) {
      risk = "HIGH";
      stability = 62;
      congestedGates = ["GATE_B", "GATE_C"];
      blockedGates = [];
      voiceText = "Full Stadium Evacuation model engaged. Optimizing all alternate exit channels. Evacuation clearing time estimated at seven point four minutes.";
      descriptionDetail = "Active simulated evacuation route optimized through North-East Concourses.";
    } else if (cleanCmd.includes("response") || cleanCmd.includes("dispatch")) {
      risk = "LOW";
      stability = 92;
      voiceText = "Paramedics and Security Patrol Alpha dispatched to Medical Bay One corridor. Stabilization time estimate: three minutes.";
      descriptionDetail = "Emergency personnel deployed. Live tracking active on digital twin.";
    } else {
      voiceText = `Command executed: ${cmd}. System status parameters updated and normal operations are maintained.`;
    }

    const mockText = `====================================================
CURRENT STADIUM STATUS
====================================================
- Overall Risk Level: ${risk}
- Crowd Stability Score: ${stability}%
- Active Incidents: ${cleanCmd.includes("gate") ? "Gate B Blockage" : "None Detected"}
- High-Risk Zones: Gate B Bottleneck, Food Court Promenade
- Weather Impact: Dry (Fine Conditions)
- Operational Status: ${cleanCmd.includes("evacu") ? "EVACUATION DRILL" : "MONITORING ACTIVE"}

====================================================
LIVE VISUALIZATION SUMMARY
====================================================
- Heatmap Status: Congestion focal point at North-East gate approach
- Congestion Visualization: Yellow density warnings at food outlets, Red spike at Entry B
- Safe Routes: Exit A (South Promenade), Exit D (VIP Plaza)
- Blocked Zones: ${blockedGates.length > 0 ? blockedGates.join(", ") : "None"}
- Crowd Flow Direction: Staggered unidirectional outflow
- Emergency Team Locations: Checkpoints Alpha & Beta, Medical Stations 1 & 2
- Digital Twin Updates: Vector overlay highlighting safe path redirects

====================================================
AGENT ANALYSIS
====================================================
1. Crowd Intelligence Agent: Detected a local flow imbalance on the Walkway. Expected bottleneck forms in 2 minutes.
2. Routing Optimization Agent: Rerouted 18% of spectators to Exit D. Reduces bottleneck overload by 42% at Gate B.
3. Emergency Response Agent: Dispatched Mobile Response Teams to stand-by positions.
4. Public Communication Agent: Displaying 'Use Alternate Gate C' alerts on LED screens. Calming SMS sent.
5. Security Threat Agent: Threat context normal. Crowd style is cohesive with minor friction.
6. Predictive Simulation Agent: Disaster propagation simulation confidence index 94%. Clear timeline: 12 minutes.
7. Visualization Intelligence Agent: Rendering 2D stadium layout overlay with routing nodes.
8. Voice Command Intelligence Agent: Successfully parsed: "${cmd}". Dispatching tactical directives.
9. Orchestrator Agent: Pre-emptively balanced crowd flow. Strategic safety priorities established.

====================================================
PREDICTIVE SIMULATION
====================================================
- Expected crowd movement: Parallel outflow towards parking zones
- Predicted congestion: Secondary delay at outer ticket stiles
- Potential panic zones: Concourse Bottlenecks (Mitigated)
- Risk propagation: Under control
- Evacuation Feasibility: 92%
- Stabilization Time: 4.5 minutes

====================================================
AUTONOMOUS ACTIONS
====================================================
- Crowd rerouting actions: Re-orienting directional stanchions
- Security deployment: Shifted 12 wardens to Entry A corridor
- Emergency dispatch: Ambulances staged at Promenade West
- Public announcements: Audio Loop 4 (Calming Directions) broadcast
- Dynamic signage updates: LED signboards updated to GREEN for Exit D
- Escalation procedures: Standard level-two safety alert

====================================================
VOICE RESPONSE MODE
====================================================
SentinelOS X Command Center: "${voiceText}"

====================================================
EXPLAINABLE AI REASONING
====================================================
- Why decisions were made: Dynamic bottlenecks formed due to uneven corridor distributions. Shift balances routing loads.
- Confidence score: 91%
- Estimated risk reduction: 42% stampede propagation reduction.
- Strategic tradeoffs: Minor walking detour for VIP section.
- Expected outcomes: Complete safety corridor preservation.

====================================================
FINAL COMMAND CENTER SUMMARY
====================================================
- Immediate priorities: Maintain crowd flow speed, clear Exit B approach stiles.
- Highest risk zones: Gate B Entrance Area (High density cluster).
- Recommended actions: Hold incoming gates, release egress barriers sequentially.
- System confidence: 94%
- Safety stabilization estimate: 5 minutes`;

    return {
      rawResponseText: mockText,
      stadiumAdjustments: {
        overallRiskLevel: risk as any,
        crowdStabilityScore: stability,
        stabilizationMinutes: cleanCmd.includes("gate") ? 12 : 5,
        blockedGates,
        congestedGates,
        routeHighlight: cleanCmd.includes("evacu") ? "ROUTE_N_E" : "ROUTE_MAIN",
        alertCount: cleanCmd.includes("gate") ? 3 : 1
      },
      voiceSynthesisText: voiceText
    };
  };

  if (!ai) {
    // Return mock response immediately if Gemini API not configured
    return res.json(getSimulatedFallback(command));
  }

  try {
    const contents = [
      {
        role: "user" as const,
        parts: [{ text: `Command query: "${command}"` }]
      }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["rawResponseText", "stadiumAdjustments", "voiceSynthesisText"],
          properties: {
            rawResponseText: {
              type: Type.STRING,
              description: "Full formatted analysis with headings, following exactly the output rules in the system prompt."
            },
            stadiumAdjustments: {
              type: Type.OBJECT,
              description: "Frontend layout configurations based on voice directive.",
              required: ["overallRiskLevel", "crowdStabilityScore", "stabilizationMinutes", "blockedGates", "congestedGates"],
              properties: {
                overallRiskLevel: { type: Type.STRING },
                crowdStabilityScore: { type: Type.INTEGER },
                stabilizationMinutes: { type: Type.INTEGER },
                blockedGates: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                congestedGates: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                routeHighlight: { type: Type.STRING },
                alertCount: { type: Type.INTEGER }
              }
            },
            voiceSynthesisText: {
              type: Type.STRING,
              description: "A short, beautiful spoken operational summary of 1-2 sentences."
            }
          }
        }
      }
    });

    const bodyText = response.text;
    if (bodyText) {
      const parsed = JSON.parse(bodyText.trim());
      return res.json(parsed);
    } else {
      throw new Error("Empty Gemini response");
    }
  } catch (err: any) {
    console.error("SentinelOS X Server Error during Gemini API handling:", err.message);
    const fallback = getSimulatedFallback(command);
    return res.json({
      ...fallback,
      systemMessage: "Fallback local rules activated due to server API connection state."
    });
  }
});

// Helper for Vision simulation fallback
function getSimulatedVisionResponse(state: any) {
  const isEvac = state?.evacuationActive;
  const isGateBlocked = state?.blockedGates && state?.blockedGates.includes("GATE_B");
  const overallRisk = state?.overallRiskLevel || "LOW";
  
  let density = "LOW";
  let flowRate = "FLUID";
  let safetyIndex = 95;
  let detectedHazards = ["None detected — flow patterns are fluid."];
  let overlays = [
    { id: "ov1", label: "Spectator Stream A (Nominal - Flowing)", x: 20, y: 30, w: 25, h: 50, color: "green" },
    { id: "ov2", label: "Sector Exit Door B (Fluid Outflow)", x: 70, y: 20, w: 20, h: 65, color: "cyan" }
  ];
  let advice = "Corridor computer-vision density registers at comfortable green limits. Outflow channels remain unobstructed.";
  let crowdCount = 38;

  if (isEvac) {
    density = "HIGH";
    flowRate = "SLOW";
    safetyIndex = 65;
    crowdCount = 194;
    detectedHazards = ["Urgent evacuation outflow surge", "High density queuing at Gate C/D concourse"];
    overlays = [
      { id: "ov1", label: "Evacuating Group (Active Flow Surge)", x: 15, y: 40, w: 45, h: 50, color: "amber" },
      { id: "ov2", label: "Emergency Clearance Channel (Dispersing)", x: 65, y: 15, w: 25, h: 80, color: "green" }
    ];
    advice = "Manual evacuation signals are active. Crowd egress is running smoothly. Support flow with live scoreboard flashing arrows.";
  } else if (isGateBlocked) {
    density = "CRITICAL";
    flowRate = "STAGNANT";
    safetyIndex = 42;
    crowdCount = 340;
    detectedHazards = ["Stationary corridor bottlenecks", "Compaction risk at main concourse turnstiles", "Spectators backing up in flight zones"];
    overlays = [
      { id: "ov1", label: "Stationary Crowd Block (Crush Warning)", x: 10, y: 20, w: 65, h: 65, color: "red" },
      { id: "ov2", label: "Gate B Approach (Blocked Turnstile)", x: 78, y: 30, w: 18, h: 55, color: "red" }
    ];
    advice = "Turnstile lockout detected. Live video feed indicates safety degradation. Deploy safety wardens to initiate a side detour to Gate C/D.";
  } else if (overallRisk === "HIGH" || overallRisk === "CRITICAL") {
    density = "HIGH";
    flowRate = "SLOW";
    safetyIndex = 75;
    crowdCount = 148;
    detectedHazards = ["Elevated density in local stands corridors"];
    overlays = [
      { id: "ov1", label: "High Density Spectator Cluster", x: 25, y: 35, w: 35, h: 55, color: "amber" },
      { id: "ov2", label: "Security Warden Patrol on Duty", x: 70, y: 45, w: 15, h: 45, color: "cyan" }
    ];
    advice = "Local sector capacity holding in safe orange state. High surveillance warning active for next 5 minutes.";
  }

  return {
    density,
    flowRate,
    detectedHazards,
    crowdCountEstimate: crowdCount,
    safetyIndex,
    overlays,
    crowdManagementAdvice: advice,
    stadiumAdjustments: {
      overallRiskLevel: isGateBlocked ? "HIGH" : (isEvac ? "MEDIUM" : overallRisk),
      crowdStabilityScore: safetyIndex,
      simulationMinutes: 0
    }
  };
}

// REST Computer Vision / Live Camera analysis Route
app.post("/api/vision", async (req, res) => {
  const { image, currentStadiumState } = req.body;

  if (!image) {
    return res.status(400).json({ error: "No image frame provided for Computer Vision analysis." });
  }

  const stateString = JSON.stringify(currentStadiumState || {}, null, 2);

  // Fallback if SDK is not initialized
  if (!ai) {
    return res.json(getSimulatedVisionResponse(currentStadiumState));
  }

  try {
    // Standard data:image/jpeg;base64,... strip
    let cleanBase64 = image;
    let mimeType = "image/jpeg";
    
    if (image.startsWith("data:")) {
      const splitArr = image.split(";base64,");
      cleanBase64 = splitArr[1] || image;
      const mimeMatch = image.match(/data:(.*?);/);
      if (mimeMatch) mimeType = mimeMatch[1];
    }

    const visionPrompt = `You are the SentinelOS X Vision-AI Engine, an automated computer vision subsystem monitoring live sporting stadium security, corridors, spectator crowds, exits, and stands.
Review the webcam snapshot provided, which represents a live CCTV camera stream from Narendra Modi / Eden Gardens Stadium corridors or portals.

Perform a crowd security, objects, and hazard evaluation in real-time.
Identify:
1. Crowd density ("LOW", "MEDIUM", "HIGH", "CRITICAL")
2. Spectator flow rate ("FLUID", "SLOW", "STAGNANT", "STAMPEDE_WARNING")
3. Real safety hazards or physical concerns (e.g. blocked doors, bottleneck, compaction, people falling or running, slip hazards).
4. Crowd count estimate in this frame.
5. Overall safety performance rating (0 to 100).
6. Generate 1-2 bounding box overlays pointing to clusters of people, exits, hazards, or wardens. Deliver coordinate percentages relative to top-left (x: 0-100, y: 0-100, w: 0-100, h: 0-100) and choose appropriate visual colors ("green" for fluid/clearing exits, "cyan" for patrols/gates, "amber" for flowing crowd, "red" for stagnant/bottlenecks/hazards).
7. Crowd management advice: 1-2 concise sentences for stadium controllers.

Integrate the current simulation state metrics contextually:
${stateString}

You MUST return a JSON object containing the exact following schema:
{
  "density": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "flowRate": "FLUID" | "SLOW" | "STAGNANT" | "STAMPEDE_WARNING",
  "detectedHazards": string[],
  "crowdCountEstimate": number,
  "safetyIndex": number,
  "overlays": Array<{ id: string, label: string, x: number, y: number, w: number, h: number, color: "cyan" | "red" | "green" | "amber" }>,
  "crowdManagementAdvice": string,
  "stadiumAdjustments": {
    "overallRiskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    "crowdStabilityScore": number,
    "simulationMinutes": number
  }
}`;

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: cleanBase64
      }
    };

    const textPart = {
      text: visionPrompt
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["density", "flowRate", "detectedHazards", "crowdCountEstimate", "safetyIndex", "overlays", "crowdManagementAdvice", "stadiumAdjustments"],
          properties: {
            density: { type: Type.STRING },
            flowRate: { type: Type.STRING },
            detectedHazards: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            crowdCountEstimate: { type: Type.INTEGER },
            safetyIndex: { type: Type.INTEGER },
            overlays: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["id", "label", "x", "y", "w", "h", "color"],
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  x: { type: Type.INTEGER },
                  y: { type: Type.INTEGER },
                  w: { type: Type.INTEGER },
                  h: { type: Type.INTEGER },
                  color: { type: Type.STRING }
                }
              }
            },
            crowdManagementAdvice: { type: Type.STRING },
            stadiumAdjustments: {
              type: Type.OBJECT,
              required: ["overallRiskLevel", "crowdStabilityScore"],
              properties: {
                overallRiskLevel: { type: Type.STRING },
                crowdStabilityScore: { type: Type.INTEGER },
                simulationMinutes: { type: Type.INTEGER }
              }
            }
          }
        }
      }
    });

    const outputText = response.text;
    if (outputText) {
      return res.json(JSON.parse(outputText.trim()));
    } else {
      throw new Error("Empty computer vision response returned by Gemini model.");
    }

  } catch (err: any) {
    console.error("SentinelOS X Computer Vision Error:", err.message);
    const mockBack = getSimulatedVisionResponse(currentStadiumState);
    return res.json({
      ...mockBack,
      systemMessage: "Fallback local vision analysis active due to network connectivity state."
    });
  }
});

// Start server initialization with Vite support
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SentinelOS X Control Server successfully launched on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical: SentinelOS X Server Boot Failure:", err);
});
