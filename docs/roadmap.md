# Roadmap

## Sprint 0 — Foundation
Deliverables:
- architecture;
- investment policy;
- data model;
- Investment Idea lifecycle;
- risk policy;
- Signal Intelligence compliance boundary.

Exit criterion: project rules are explicit enough that implementation choices do not redefine investment policy.

## Sprint 1 — Portfolio Core
Deliverables:
- PostgreSQL schema;
- manual cash/account/transaction entry;
- position reconstruction;
- realized/unrealized P&L;
- allocation summary;
- first dashboard.

Exit criterion: the OS can represent the real portfolio without market-data automation.

## Sprint 2 — Market + Research + Risk
Deliverables:
- quote ingestion interface;
- fundamental/event/news adapters;
- Research Engine pipeline;
- structured research updates;
- Risk Engine;
- BUY/WATCH/HOLD/REDUCE/EXIT recommendation state.

Exit criterion: one investment idea can be analyzed end-to-end and produce a documented recommendation.

## Sprint 3 — Signal Intelligence + Speculative Shorts
Deliverables:
- source registry;
- source scoring;
- signal prediction log;
- public-confirmation status;
- speculative-short approval workflow;
- separate speculative exposure reporting.

Exit criterion: early signals can be monitored and scored without bypassing the decision/risk/compliance process.

## Later
- broker read-only integrations;
- broker order preparation;
- explicit human-in-the-loop order execution;
- portfolio optimization;
- scenario analysis;
- notifications only when thesis/decision materially changes.
