export type SignalStatus =
  | "UNVERIFIED"
  | "WATCH"
  | "PUBLICLY_CONFIRMED"
  | "INVALIDATED";

export interface SignalSource {
  id: string;
  alias: string;
  observations: number;
  confirmed: number;
  invalidated: number;
  score: number;
  restricted: boolean;
}

export interface SignalObservation {
  id: string;
  sourceId: string;
  claim: string;
  observedAt: string;
  status: SignalStatus;
  publicConfirmationAt?: string;
  outcome?: string;
}

export function canInfluenceTrade(source: SignalSource, signal: SignalObservation): boolean {
  return !source.restricted && signal.status === "PUBLICLY_CONFIRMED";
}
