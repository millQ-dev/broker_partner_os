export interface Money {
  amount: number;
  currency: string;
}

export interface Position {
  instrumentId: string;
  quantity: number;
  averageCost: Money;
  marketPrice?: Money;
}

export interface PortfolioSnapshot {
  asOf: string;
  totalValue: Money;
  cashPct: number;
  longExposurePct: number;
  shortExposurePct: number;
  positions: Position[];
}
