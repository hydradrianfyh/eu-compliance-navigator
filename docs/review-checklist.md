# Review Checklist

## Purpose
This document defines the minimum review standard before a rule or implementation change is accepted.

## A. Rule review checklist

### Identity
- [ ] `stable_id` exists and is unique
- [ ] title and short label are clear
- [ ] legal family is correct
- [ ] jurisdiction and jurisdiction level are correct
- [ ] framework group is correct

### Source review
- [ ] source reference exists
- [ ] source family is correct
- [ ] official URL is present for `ACTIVE`
- [ ] `last_verified_on` is present for `ACTIVE`
- [ ] no fabricated URL
- [ ] no fabricated date

### Temporal review
- [ ] temporal structure is present
- [ ] date model matches the regulation type
- [ ] new-type / all-new-vehicles / generic date logic is used correctly
- [ ] unknown dates are explicitly marked, not guessed

### Logic review
- [ ] trigger logic is declarative unless exception is justified
- [ ] custom evaluator is used only when necessary
- [ ] logic is explainable
- [ ] lifecycle guard is respected

### Output review
- [ ] obligation text is grounded
- [ ] owner hint is set
- [ ] ui package is set
- [ ] process stage is set

## B. Promotion checklist (`DRAFT` / `SEED_UNVERIFIED` -> `ACTIVE`)
- [ ] authoritative source confirmed
- [ ] legal reference matches source
- [ ] official URL verified
- [ ] last verified date recorded
- [ ] temporal fields checked
- [ ] vehicle scope checked
- [ ] trigger logic checked
- [ ] obligation text checked
- [ ] evidence tasks present if relevant
- [ ] human reviewer approves

## C. Engine / implementation checklist
- [ ] non-ACTIVE rules never return `APPLICABLE`
- [ ] `PLACEHOLDER` rules always return `UNKNOWN`
- [ ] explainability payload exists:
  - [ ] `matched_conditions`
  - [ ] `unmatched_conditions`
  - [ ] `missing_inputs`
  - [ ] `trigger_path`
- [ ] no rule logic inside UI components
- [ ] integrity tests exist

## D. Merge gate
A change is not ready if any of the following is true:
- missing source verification for an `ACTIVE` rule
- missing explainability
- fabricated certainty
- unclear lifecycle state
- logic hidden in UI