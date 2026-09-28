# Live Activity Console: build status

Branch `feat/live-activity-console`. Work paused on 2026-09-28, partway through step 3 of 7.

Sources: Figma frame `uqnoX7e1psML7i9b7KGgwy` node `1:2` (visuals) and `../ux-prompts/01-live-activity-exceptions-console.md` (behavior).

Agreed decisions:
- Lucide icons instead of the Figma SVG exports
- Figma's navigation replaces the scaffold's
- Dark theme only
- No single-key decision shortcuts
- Geist Mono for data text

## Done

- [x] **1. Tokens and theme** (`a160f7b`)
  - Console palette and severity/status tokens in `src/index.css`
  - Subtle text lightened to `#85858f` so it passes WCAG AA
  - Geist Mono, forced dark theme, reduced-motion support
  - shadcn checkbox, switch, textarea and collapsible added
- [x] **2. Data and logic** (`9a2271b`)
  - Domain types in `src/types`
  - Figma scenario in `src/mocks/data/console.ts`, with the missing Dock 4 exception added
  - Live-stream simulator behind `api.subscribe`
  - Pure reducer and selectors in `src/lib/console/`: pausing, queuing, decisions, 30 s reverse, overrides, filters, roles, privacy
  - 36 passing tests

## In progress: stopped here

- [ ] **3. Shared components.** Started only:
  - `src/lib/console/context.ts` (context type)
  - `src/hooks/useConsole.ts`
  - `src/hooks/useNow.ts`

  **Next:**
  - `ConsoleProvider`: loads `api.console`, runs the reducer, subscribes to the stream, sends decisions to `api.recordAudit`, and provides the screen-reader announcer
  - Components in `src/components/console/`:
    - `SeverityBadge`, `OutcomeBadge`, `Kbd`, `NoticePill`, `ConfidenceMeter`, `SignalList`
    - `KpiCard`, `Sparkline`, `ActionButton`

## Not started

- [ ] **4. Lanes and drawer**
  - Needs You: `ExceptionCard`, `ClassifiedCard`, `WhyDisclosure`, filters
  - Handled: `EventRow`, stream filters, lane footer
  - `EventDrawer` with override panel
  - `DecisionToast` with a 30 s countdown
- [ ] **5. Page assembly**
  - `LiveActivityPage` as the home route
  - Figma navigation: People & Credentials and Visitors as placeholders; Alerts and Dashboard removed
  - Top bar: site switcher, privacy toggle
  - Dev toolbar: role, loading, empty, connection lost, inject critical
- [ ] **6. Quality pass**
  - Keyboard: J/K, Enter, Esc, P, focus return
  - Live-region announcements
  - Responsive: tabs at 1024–1279px, unsupported below 1024px
  - 40% text-expansion check
- [ ] **7. Verification**
  - Screenshots next to the Figma frame
  - Demo walkthrough
  - Report of what works and what doesn't

The screen can't be viewed in the app yet. Nothing is wired into a route.
