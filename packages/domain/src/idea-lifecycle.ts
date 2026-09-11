import type { InvestmentIdea, IdeaStatus } from "./investment-idea";

export interface IdeaApproval {
  approvedBy: string;
  approvedAt: string;
  note?: string;
}

export interface IdeaLifecycleEvent {
  from: IdeaStatus;
  to: IdeaStatus;
  actor: string;
  at: string;
}

const transitions: Record<IdeaStatus, readonly IdeaStatus[]> = {
  WATCH: ["RESEARCH", "REJECTED"],
  RESEARCH: ["WATCH", "PROPOSED", "REJECTED"],
  PROPOSED: ["RESEARCH", "APPROVED", "REJECTED"],
  APPROVED: ["RESEARCH", "OPEN", "REJECTED"],
  OPEN: ["EXITED"],
  EXITED: [],
  REJECTED: ["WATCH", "RESEARCH"],
};

export function canTransitionIdea(from: IdeaStatus, to: IdeaStatus): boolean {
  return transitions[from].includes(to);
}

function requiredText(value: string, field: string, errors: string[]): void {
  if (!value.trim()) errors.push(`${field} is required`);
}

export function validateIdeaForStatus(
  idea: InvestmentIdea,
  targetStatus: IdeaStatus,
): string[] {
  const errors: string[] = [];

  if (idea.confidence < 0 || idea.confidence > 100) {
    errors.push("confidence must be between 0 and 100");
  }
  if (idea.proposedSizePct < 0 || idea.proposedSizePct > 100) {
    errors.push("proposedSizePct must be between 0 and 100");
  }
  if (idea.maxLossPct < 0 || idea.maxLossPct > 100) {
    errors.push("maxLossPct must be between 0 and 100");
  }

  if (["PROPOSED", "APPROVED", "OPEN"].includes(targetStatus)) {
    requiredText(idea.thesis, "thesis", errors);
    requiredText(idea.horizon, "horizon", errors);
    requiredText(idea.entryPlan, "entryPlan", errors);
    requiredText(idea.targetPlan, "targetPlan", errors);
    requiredText(idea.invalidation, "invalidation", errors);
    if (idea.catalysts.length === 0) errors.push("at least one catalyst is required");
    if (idea.proposedSizePct <= 0) errors.push("proposedSizePct must be positive");
    if (idea.maxLossPct <= 0) errors.push("maxLossPct must be positive");
  }

  if (idea.direction === "SHORT" && ["PROPOSED", "APPROVED", "OPEN"].includes(targetStatus)) {
    if (idea.riskLevel !== "SPECULATIVE") {
      errors.push("SHORT ideas must use SPECULATIVE risk level");
    }
  }

  if (targetStatus === "OPEN" && idea.direction === "SHORT" && !idea.manualApproval) {
    errors.push("SHORT ideas require explicit manual approval before OPEN");
  }

  return errors;
}

export function approveIdea(
  idea: InvestmentIdea,
  approval: IdeaApproval,
): InvestmentIdea {
  const candidate: InvestmentIdea = { ...idea, manualApproval: approval };
  const errors = validateIdeaForStatus(candidate, "APPROVED");
  if (errors.length) throw new Error(errors.join("; "));
  if (!canTransitionIdea(idea.status, "APPROVED")) {
    throw new Error(`illegal idea transition ${idea.status} -> APPROVED`);
  }
  return { ...candidate, status: "APPROVED" };
}

export function transitionIdea(
  idea: InvestmentIdea,
  to: IdeaStatus,
  actor: string,
  at: string,
): { idea: InvestmentIdea; event: IdeaLifecycleEvent } {
  if (!canTransitionIdea(idea.status, to)) {
    throw new Error(`illegal idea transition ${idea.status} -> ${to}`);
  }
  const errors = validateIdeaForStatus(idea, to);
  if (errors.length) throw new Error(errors.join("; "));

  return {
    idea: { ...idea, status: to },
    event: { from: idea.status, to, actor, at },
  };
}
