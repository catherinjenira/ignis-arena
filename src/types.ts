export interface StadiumState {
  parkingOccupancy: number;
  crowdDensity: number;
  securityRisk: string;
  energyUsage: number;
  foodQueueMinutes: number;
  emotionWeather: string; // excited, calm, angry, panic, frustrated
  crowdPulseColor: string; // green, blue, orange, red
  greenScores: {
    carbon: number;
    energy: number;
    water: number;
    waste: number;
  };
}

export interface CouncilDialogue {
  role: string;
  name: string;
  avatar: string;
  message: string;
}

export interface TimelineEvent {
  time: string;
  description: string;
  crowdLevel: number;
  alertLevel: "low" | "medium" | "high";
}

export interface MovieDirectorReport {
  trailerConcept: string;
  highlights: string[];
  documentaryTheme: string;
  reelsConcept: string;
}

export interface WhatIfAnalysis {
  sponsorImpact: string;
  scheduleImpact: string;
  medicalImpact: string;
  securityAdjustments: string;
  alternativeCoverage: string;
}

export interface FullSimulationResult {
  stadiumState: StadiumState;
  councilDialogue: CouncilDialogue[];
  simulationOutcome: string;
  timeline: TimelineEvent[];
  movieDirectorReport: MovieDirectorReport;
  whatIfAnalysis: WhatIfAnalysis;
}

export type HeatmapType = "crowd" | "energy" | "emotion" | "emergency";

export interface GodModeMarker {
  id: string;
  type: "security" | "medical" | "food" | "stage";
  name: string;
  x: number;
  y: number;
  label: string;
}

export type UserRole = "director" | "security" | "fan";

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}
