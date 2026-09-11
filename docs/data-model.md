# Data model

## Account
- id
- name
- broker
- base_currency
- status

## CashBalance
- id
- account_id
- currency
- amount
- as_of

## Position
- id
- account_id
- instrument_id
- quantity
- average_cost
- currency
- opened_at

## Transaction
- id
- account_id
- instrument_id
- type
- quantity
- price
- fees
- currency
- executed_at

## InvestmentIdea
- id
- instrument_id
- direction
- status
- thesis
- catalysts
- horizon
- entry_plan
- target_plan
- invalidation
- confidence
- risk_level
- proposed_size_pct
- max_loss_pct
- approved_at
- opened_at
- closed_at

## ResearchUpdate
- id
- investment_idea_id
- source_type
- summary
- impact
- confidence_delta
- created_at

## SignalSource
- id
- name_or_alias
- channel_type
- observations
- confirmed
- invalidated
- score
- restricted

## SignalObservation
- id
- source_id
- claim
- observed_at
- status
- public_confirmation_at
- outcome
- notes

## RiskSnapshot
- id
- portfolio_value
- gross_exposure
- long_exposure
- short_exposure
- cash_pct
- concentration_metrics
- created_at
