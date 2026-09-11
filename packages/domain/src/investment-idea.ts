export type IdeaDirection = "LONG" | "SHORT";
export type IdeaStatus =
  | "WATCH"
  | "RESEARCH"
  | "PROPOSED"
  | "APPROVED"
  | "OPEN"
  | "EXITED"
  | "REJECTED";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "SPECULATIVE";

export interface InvestmentIdea {
  id: string;
  instrumentId: string;
  direction: IdeaDirection;
  status: IdeaStatus;
  thesis: string;
  catalysts: string[];
  horizon: string;
  entryPlan: string;
  targetPlan: string;
  invalidation: string;
  confidence: number;
  riskLevel: RiskLevel;
  proposedSizePct: number;
  maxLossPct: number;
  manualApprovalRequired: boolean;
}

export function requiresManualApproval(idea: InvestmentIdea): boolean {
  return idea.direction === "SHORT" || idea.manualApprovalRequired;
}
