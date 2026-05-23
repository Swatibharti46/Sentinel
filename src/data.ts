/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StadiumZone, LocationType, GateStatus, SafetyIncident, EvacuationRoute } from "./types";

export const INITIAL_ZONES: StadiumZone[] = [
  // Stands
  { id: "STAND_A", name: "North Stand (Block A)", type: LocationType.STAND, cx: 500, cy: 180, radius: 60, capacity: 15000, currentCrowd: 11200, riskFactor: 0.15, statusText: "Normal spectator density." },
  { id: "STAND_B", name: "VIP Pavilion (Block B)", type: LocationType.STAND, cx: 280, cy: 330, radius: 55, capacity: 8000, currentCrowd: 6400, riskFactor: 0.1, statusText: "Secure climate-controlled zone." },
  { id: "STAND_C", name: "East Stand (Block C)", type: LocationType.STAND, cx: 720, cy: 330, radius: 60, capacity: 18000, currentCrowd: 15400, riskFactor: 0.28, statusText: "Active cheering sections." },
  { id: "STAND_D", name: "South Stand (Block D)", type: LocationType.STAND, cx: 500, cy: 620, radius: 60, capacity: 16000, currentCrowd: 13200, riskFactor: 0.2, statusText: "Outflow ready." },
  { id: "STAND_E", name: "West Stand (Block E)", type: LocationType.STAND, cx: 280, cy: 470, radius: 55, capacity: 10000, currentCrowd: 7800, riskFactor: 0.12, statusText: "Family Stand." },

  // Gates
  { id: "GATE_A", name: "Entry Gate A (North)", type: LocationType.GATE, cx: 500, cy: 50, width: 60, height: 35, capacity: 5000, currentCrowd: 450, riskFactor: 0.1, gateStatus: GateStatus.OPEN, statusText: "Flow smooth." },
  { id: "GATE_B", name: "Entry Gate B (North-East)", type: LocationType.GATE, cx: 800, cy: 150, width: 60, height: 35, capacity: 6000, currentCrowd: 4800, riskFactor: 0.75, gateStatus: GateStatus.OVERLOADED, statusText: "Heavy stiles compression." },
  { id: "GATE_C", name: "Main Exit Gate C (East)", type: LocationType.GATE, cx: 930, cy: 380, width: 35, height: 60, capacity: 8000, currentCrowd: 1200, riskFactor: 0.2, gateStatus: GateStatus.OPEN, statusText: "Evac path prime." },
  { id: "GATE_D", name: "Exit Gate D (South)", type: LocationType.GATE, cx: 500, cy: 750, width: 60, height: 35, capacity: 7000, currentCrowd: 900, riskFactor: 0.15, gateStatus: GateStatus.OPEN, statusText: "Clear exit corridor." },
  { id: "GATE_E", name: "VIP Exit Gate E (West)", type: LocationType.GATE, cx: 70, cy: 380, width: 35, height: 60, capacity: 4000, currentCrowd: 150, riskFactor: 0.05, gateStatus: GateStatus.OPEN, statusText: "Escort lane active." },

  // Emergency Exits
  { id: "EMERGENCY_ALPHA", name: "Emergency Exit Alpha", type: LocationType.GATE, cx: 200, cy: 140, width: 50, height: 25, capacity: 8000, currentCrowd: 0, riskFactor: 0.0, gateStatus: GateStatus.CLOSED, statusText: "Secured. Prepared for trigger." },
  { id: "EMERGENCY_BETA", name: "Emergency Exit Beta", type: LocationType.GATE, cx: 800, cy: 650, width: 50, height: 25, capacity: 8000, currentCrowd: 0, riskFactor: 0.0, gateStatus: GateStatus.CLOSED, statusText: "Secured." },

  // Medical & Security
  { id: "MEDICAL_1", name: "Medical Clinic NW", type: LocationType.MEDICAL, cx: 210, cy: 230, radius: 25, capacity: 100, currentCrowd: 5, riskFactor: 0.05, statusText: "Paramedics active." },
  { id: "MEDICAL_2", name: "Emergency Medical Bay SE", type: LocationType.MEDICAL, cx: 790, cy: 570, radius: 25, capacity: 100, currentCrowd: 12, riskFactor: 0.1, statusText: "Triage prepped." },
  { id: "SEC_ALPHA", name: "Security Gate-house Alpha", type: LocationType.SECURITY, cx: 400, cy: 120, radius: 22, capacity: 200, currentCrowd: 45, riskFactor: 0.05, statusText: "QRT Staged." },
  { id: "SEC_BETA", name: "Command Center Beta", type: LocationType.SECURITY, cx: 600, cy: 680, radius: 22, capacity: 200, currentCrowd: 60, riskFactor: 0.08, statusText: "Operational monitoring." },

  // Amenities & Corridors
  { id: "FOOD_OASIS", name: "Oasis Food & Dining Plaza", type: LocationType.FOOD_COURT, cx: 830, cy: 280, radius: 45, capacity: 5000, currentCrowd: 4100, riskFactor: 0.45, statusText: "High density queuing." },
  { id: "FOOD_BOUNDARY", name: "Boundary Food Street", type: LocationType.FOOD_COURT, cx: 170, cy: 480, radius: 45, capacity: 4000, currentCrowd: 1200, riskFactor: 0.15, statusText: "Medium traffic." }
];

export const INITIAL_ROUTES: EvacuationRoute[] = [
  { id: "ROUTE_N_E", name: "Route North-East Corridor (Block A -> Gate B/C)", fromZoneId: "STAND_A", toGateId: "GATE_C", status: "CONGESTED", alternateGateId: "GATE_A", flowEfficiencyScore: 48, estimatedEvacTimeMinutes: 16 },
  { id: "ROUTE_E_SE", name: "Route East Concourse (Block C -> Gate C)", fromZoneId: "STAND_C", toGateId: "GATE_C", status: "OPTIMAL", alternateGateId: "GATE_D", flowEfficiencyScore: 82, estimatedEvacTimeMinutes: 9 },
  { id: "ROUTE_S", name: "Route South Plaza (Block D -> Exit Gate D)", fromZoneId: "STAND_D", toGateId: "GATE_D", status: "OPTIMAL", flowEfficiencyScore: 91, estimatedEvacTimeMinutes: 7 },
  { id: "ROUTE_W_NW", name: "Route West VIP Promenade (Block B/E -> Gate E)", fromZoneId: "STAND_B", toGateId: "GATE_E", status: "OPTIMAL", flowEfficiencyScore: 88, estimatedEvacTimeMinutes: 8 }
];

export interface IncidentTemplate {
  id: string;
  title: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  category: "CROWD_SURGE" | "SECURITY_THREAT" | "WEATHER_IMPACT" | "VIP_MOVEMENT" | "INFRASTRUCTURE" | "MEDICAL";
  targetZoneId: string;
  narrative: string;
}

export const INCIDENT_TEMPLATES: IncidentTemplate[] = [
  {
    id: "INCIDENT_VICTORY_SURGE",
    title: "Post-Match Victory Crowd Surge",
    description: "Match ends in dramatic win. Over 25,000 spectators exiting concurrently from East Stand towards Gate B & Main Gate C, spawning severe bottleneck pressure.",
    severity: "HIGH",
    category: "CROWD_SURGE",
    targetZoneId: "STAND_C",
    narrative: "Spectators are singing and rushing exits. Density on the East Concourse has spiked past 5.2 people per square meter. Risk index at Gate B is at Critical."
  },
  {
    id: "INCIDENT_CLOUDBURST",
    title: "Sudden Monsoonal Rain Alert",
    description: "Heavy thunderstorm starts over stadium. Exposed open stands Block C & North Stand spectators panic-rushing the covered corridors of Oasis Food Plaza & VIP stands.",
    severity: "CRITICAL",
    category: "WEATHER_IMPACT",
    targetZoneId: "FOOD_OASIS",
    narrative: "Violent rain causing rapid physical slipping hazards and visual congestion. Main walkway bottlenecks peaking around Food Court and Entry Gate B. Spectators pushing to stay dry."
  },
  {
    id: "INCIDENT_GATE_LOCKOUT",
    title: "Entry Gate Bstile Hardware Outage",
    description: "E-ticket validation turnstiles at Gate B suffer power-surge trip, blocking entry scan. Over 5,000 fans arriving for second innings are pressed tightly at holding pens.",
    severity: "CRITICAL",
    category: "INFRASTRUCTURE",
    targetZoneId: "GATE_B",
    narrative: "Manual ticket scanning failing to absorb crowd flow. Pressure index has triggered automated crush warnings. Immediate routing detour required."
  },
  {
    id: "INCIDENT_SUSPICIOUS_BAG",
    title: "Abandoned Pack: Boundary Food Street",
    description: "Unattended visual rucksack spotted behind food stalls near West Stand corridor. Security Threat Agent triggers evacuation perimeter protocol.",
    severity: "HIGH",
    category: "SECURITY_THREAT",
    targetZoneId: "FOOD_BOUNDARY",
    narrative: "Bomb squad and K9 units alerted. Restricting West stand exit lanes and routing crowd outward to Gates A and E to isolate the corridor."
  },
  {
    id: "INCIDENT_VIP_ARRIVAL",
    title: "High-Profile Diplomatic Convoy",
    description: "VIP political delegation arrival requiring tight transit corridor sealing at Gate E and exclusive Pavilion standby routing. Minor spectator redirection.",
    severity: "MEDIUM",
    category: "VIP_MOVEMENT",
    targetZoneId: "STAND_B",
    narrative: "VIP Gate E briefly restricted for general access. General spectators diverted through Southern Promenade routing to prevent delay."
  },
  {
    id: "INCIDENT_EXIT_D_CLOSURE",
    title: "What-If: Exit Gate D Structural Blockage",
    description: "Exit Gate D suffers structural failure/closure. Predicts immediate ripple congestion spreading to South Stand and East Stand exit paths, increasing evacuation times.",
    severity: "HIGH",
    category: "INFRASTRUCTURE",
    targetZoneId: "GATE_D",
    narrative: "Dynamic testing of Gate D failure. Commencing emergency crowd routing redirects immediately, directing traffic to Gate C."
  }
];
