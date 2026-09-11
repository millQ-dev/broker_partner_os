export interface Money {
  amount: number;
  currency: string;
}

export interface Account {
  id: string;
  name: string;
  broker: string;
  baseCurrency: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface CashBalance {
  accountId: string;
  currency: string;
  amount: number;
  asOf: string;
}

export type TransactionType =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "BUY"
  | "SELL"
  | "DIVIDEND"
  | "FEE";

export interface Transaction {
  id: string;
  accountId: string;
  instrumentId?: string;
  type: TransactionType;
  quantity?: number;
  price?: number;
  fees?: number;
  amount?: number;
  currency: string;
  executedAt: string;
}

export interface Position {
  accountId: string;
  instrumentId: string;
  quantity: number;
  averageCost: Money;
  realizedPnl: Money;
  marketPrice?: Money;
}

export interface PortfolioSnapshot {
  asOf: string;
  totalValue: Money;
  cashValue: Money;
  cashPct: number;
  longExposurePct: number;
  shortExposurePct: number;
  unrealizedPnl: Money;
  realizedPnl: Money;
  positions: Position[];
}

interface PositionState {
  accountId: string;
  instrumentId: string;
  quantity: number;
  averageCost: number;
  realizedPnl: number;
  currency: string;
}

function assertTrade(tx: Transaction): asserts tx is Transaction & {
  instrumentId: string;
  quantity: number;
  price: number;
} {
  if (!tx.instrumentId || !tx.quantity || tx.quantity <= 0 || tx.price === undefined || tx.price < 0) {
    throw new Error(`invalid trade transaction ${tx.id}`);
  }
}

/**
 * Reconstructs long positions using moving-average cost.
 * Short inventory is intentionally rejected here; approved shorts will use the dedicated risk workflow.
 */
export function reconstructLongPositions(transactions: Transaction[]): Position[] {
  const states = new Map<string, PositionState>();
  const ordered = [...transactions].sort((a, b) => a.executedAt.localeCompare(b.executedAt));

  for (const tx of ordered) {
    if (tx.type !== "BUY" && tx.type !== "SELL") continue;
    assertTrade(tx);

    const key = `${tx.accountId}:${tx.instrumentId}`;
    const state = states.get(key) ?? {
      accountId: tx.accountId,
      instrumentId: tx.instrumentId,
      quantity: 0,
      averageCost: 0,
      realizedPnl: 0,
      currency: tx.currency,
    };

    if (state.currency !== tx.currency) {
      throw new Error(`currency mismatch for ${tx.instrumentId}`);
    }

    const fees = tx.fees ?? 0;

    if (tx.type === "BUY") {
      const currentCost = state.quantity * state.averageCost;
      const addedCost = tx.quantity * tx.price + fees;
      const newQuantity = state.quantity + tx.quantity;
      state.averageCost = newQuantity === 0 ? 0 : (currentCost + addedCost) / newQuantity;
      state.quantity = newQuantity;
    } else {
      if (tx.quantity > state.quantity) {
        throw new Error(`SELL exceeds long position for ${tx.instrumentId}`);
      }
      state.realizedPnl += tx.quantity * (tx.price - state.averageCost) - fees;
      state.quantity -= tx.quantity;
      if (state.quantity === 0) state.averageCost = 0;
    }

    states.set(key, state);
  }

  return [...states.values()]
    .filter((state) => state.quantity !== 0 || state.realizedPnl !== 0)
    .map((state) => ({
      accountId: state.accountId,
      instrumentId: state.instrumentId,
      quantity: state.quantity,
      averageCost: { amount: state.averageCost, currency: state.currency },
      realizedPnl: { amount: state.realizedPnl, currency: state.currency },
    }));
}

export function calculateUnrealizedPnl(position: Position): Money {
  if (!position.marketPrice) {
    return { amount: 0, currency: position.averageCost.currency };
  }
  if (position.marketPrice.currency !== position.averageCost.currency) {
    throw new Error(`market-price currency mismatch for ${position.instrumentId}`);
  }
  return {
    amount: position.quantity * (position.marketPrice.amount - position.averageCost.amount),
    currency: position.averageCost.currency,
  };
}

export function calculateCashFromTransactions(
  transactions: Transaction[],
  accountId: string,
  currency: string,
): number {
  return transactions
    .filter((tx) => tx.accountId === accountId && tx.currency === currency)
    .reduce((cash, tx) => {
      const fees = tx.fees ?? 0;
      switch (tx.type) {
        case "DEPOSIT":
        case "DIVIDEND":
          return cash + (tx.amount ?? 0) - fees;
        case "WITHDRAWAL":
        case "FEE":
          return cash - (tx.amount ?? fees);
        case "BUY":
          assertTrade(tx);
          return cash - tx.quantity * tx.price - fees;
        case "SELL":
          assertTrade(tx);
          return cash + tx.quantity * tx.price - fees;
      }
    }, 0);
}
