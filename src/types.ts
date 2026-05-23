/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum RiskLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL"
}

export enum GateStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
  RESTRICTED = "RESTRICTED",
  OVERLOADED = "OVERLOADED"
}

export enum LocationType {
  GATE = "GATE",
  STAND = "STAND",
  PARKING = "PARKING",
  VIP = "VIP",
  FOOD_COURT = "FOOD_COURT",
  SECURITY = "SECURITY",
  MEDICAL = "MEDICAL",
  CORRIDOR = "CORRIDOR"
}

export interface StadiumZone {
  id: string;
  name: string;
  type: LocationType;
  cx: number; // coordinates for the SVG representation (0-1000)
  cy: number;
  width?: number;
  height?: number;
  radius?: number;
  points?: string; // For custom stand polygons if any
  capacity: number;
  currentCrowd: number;
  riskFactor: number; // 0 to 1
  statusText?: string;
  gateStatus?: GateStatus;
}

export interface SafetyIncident {
  id: string;
  title: string;
  description: string;
  severity: RiskLevel;
  zoneId: string;
  status: "ACTIVE" | "STABILIZING" | "RESOLVED";
  timestamp: string;
  category: "CROWD_SURGE" | "SECURITY_THREAT" | "WEATHER_IMPACT" | "VIP_MOVEMENT" | "INFRASTRUCTURE" | "MEDICAL";
}

export interface EvacuationRoute {
  id: string;
  name: string;
  fromZoneId: string;
  toGateId: string;
  status: "OPTIMAL" | "CONGESTED" | "BLOCKED";
  alternateGateId?: string;
  flowEfficiencyScore: number; // percentage 0-100
  estimatedEvacTimeMinutes: number;
}

export interface LiveTelemetry {
  overallRiskLevel: RiskLevel;
  crowdStabilityScore: number; // 0-100
  evacuationProbability: number; // 0-100
  stadiumCapacity: number;
  currentTotalCrowd: number;
  activeGateCount: number;
  stabilizationEstimateMinutes: number;
  sensorAlertCount: number;
}

export interface AgentDiagnostics {
  agentId: string;
  name: string;
  status: "MONITORING" | "ANALYZING" | "ALERT" | "RESOLVING";
  analysis: string;
  confidenceScore: number; // 0-100
  riskImpactCode: string; // e.g., "Rerouting reduces surge by 42%"
  priorityActions: string[];
}

export interface VoiceCommandMessage {
  id: string;
  sender: "USER" | "SYSTEM";
  text: string;
  timestamp: string;
  agentAnalysisText?: string; // The formatted standard response
}
