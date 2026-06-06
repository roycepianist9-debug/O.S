---
name: testing-royce-os
description: End-to-end runtime testing for Royce OS. Use when verifying Phase 1 Royce Data CRUD, localStorage persistence, or Dashboard metric propagation.
---

# Testing Royce OS

## Prerequisites

- Node.js installed
- Repository cloned at local path
- No external services needed for Phase 1 (localStorage only)

## Devin Secrets Needed

- `VERCEL_TOKEN` (only needed for production deployment verification, not local testing)

## Local Dev Server

```bash
cd /home/ubuntu/repos/royce-os
npm install
npm run dev -- --host 0.0.0.0
```

Server runs at `http://localhost:5173/`.

## Pre-Test Static Checks

```bash
npm run lint
npm run typecheck
npm run build
```

All must pass before runtime testing.

## Phase 1 Test Procedure (Royce Data)

### Setup

1. Open `http://localhost:5173/` in Chrome
2. Open browser console and run: `localStorage.removeItem('royce-os-phase-one-data')` to reset to seed data
3. Refresh the page

### Test 1: Navigation

- Click "Royce Data" in sidebar
- Verify: page title shows "Royce Data", hero shows "Phase 1 · Royce Data"
- Verify: seed stats display (cash €8,240, expenses €427, sponsors 231/1000, collabs 2)

### Test 2: Baseline Editing

- Edit Operating Baseline form fields (cash, budget, sponsor target, emails sent, current city)
- Verify: data stats update immediately without page reload
- Verify: current city dropdown changes the city pill in header and updates planned city statuses

### Test 3: Add/Remove Records

For each record type (expenses, cities, organizations, collaborations, concerts):
- Fill the "Add" form with test data
- Click submit
- Verify: new record card appears in the list
- Verify: relevant stat updates (e.g., adding expense increases monthly expenses total)
- Click "Remove" on the new record
- Verify: card disappears and stat decreases back

### Test 4: Persistence

- Make edits (baseline + add records)
- Press F5 to reload
- Navigate back to Royce Data
- Verify: all edits persist (baseline values, added records, removed records stay removed)
- Verify: localStorage key `royce-os-phase-one-data` contains valid JSON

### Test 5: Dashboard Propagation

- After editing Royce Data, click "Dashboard" in sidebar
- Verify: Cash Runway reflects edited cash value
- Verify: Daily Budget reflects edited monthly budget
- Verify: Current City reflects selected city
- Verify: Sponsor Outreach reflects edited emails sent / target

### Test 6: Budget Projection Regression

- On Dashboard, inspect the budget projection SVG polyline
- Run in console: check that SVG y-values are monotonically non-decreasing (balance never increases)
- This validates the fix from commit 5659d48

## Tips

- The Vercel preview URL might be protected (401). Always prefer local testing for Phase 1.
- Use `wmctrl -r :ACTIVE: -b add,maximized_vert,maximized_horz` to maximize Chrome before recording.
- Stats are computed reactively from `royceData` state — editing any form field triggers immediate recalculation.
- The localStorage key is `royce-os-phase-one-data`. Clearing it resets to seed data from `src/royceData.ts`.
- Budget projection uses an accumulation pattern (each month subtracts cost from previous balance). The SVG y-axis is inverted (higher y = lower balance).
