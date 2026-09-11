# Architecture

## Goal
Broker Partner OS is a decision system first and a trading integration second. The system should preserve a complete audit trail of why capital was allocated, what would invalidate the thesis and what changed over time.

## Initial stack
- Web: Next.js + TypeScript
- Domain: TypeScript shared package
- Database: PostgreSQL
- Research/analytics: Python service
- API boundary: typed HTTP/JSON first; broker APIs later

## Core domains

### Portfolio
Tracks accounts, cash balances, positions, transactions, realized/unrealized P&L and allocation.

### Investment Idea
Central object of the system. Lifecycle:
`WATCH -> RESEARCH -> PROPOSED -> APPROVED -> OPEN -> EXITED | REJECTED`

### Research
Transforms public market/fundamental/event data into structured updates to Investment Ideas.

### Risk
Calculates suggested size, max loss, concentration, correlation exposure and thesis-break conditions.

### Decision Desk
Produces decision states:
`BUY`, `WATCH`, `HOLD`, `REDUCE`, `EXIT`, `SPECULATIVE_SHORT_REQUIRES_APPROVAL`.

### Signal Intelligence
Stores source/channel, claim, timestamp, confidence, later confirmation/invalidations and source score. Signals that may be material non-public information are not tradeable until cleared by the compliance gate.

## Safety boundaries
- No automatic order placement in MVP.
- Short trades always require manual approval.
- A signal cannot become an executable recommendation when its provenance suggests hacked, stolen or material non-public information.
