# Live Activity Console: build status

Sources: Figma frame `uqnoX7e1psML7i9b7KGgwy` node `1:2` (visuals) and `../ux-prompts/01-live-activity-exceptions-console.md` (behavior).

Agreed decisions:
- Lucide icons instead of the Figma SVG exports
- Figma's navigation replaces the scaffold's
- Dark theme only
- No single-key decision shortcuts
- Geist Mono for data text

## Done

- [x] **1. Tokens and theme**
- [x] **2. Data and logic**
  - Domain types, the Figma scenario, the live-stream simulator
  - Reducer and selectors in `src/lib/console/`
- [x] **3. Shared components**
  - `ConsoleProvider`, primitives, `KpiStrip`
- [x] **4. Lanes and drawer**
  - `ExceptionCard`, `NeedsYouLane`, `HandledLane`, `EventDrawer`, `DecisionToast`
- [x] **5. Page assembly**
  - `LiveActivityPage` is the home route
  - Figma navigation; Doors & Devices and Audit Log show live session data
  - People & Credentials, Visitors and Policies are placeholders
  - Top bar: site switcher, global search, privacy, recent activity, help, view-as
  - Demo controls in the footer: role, loading/empty, connection lost, critical exception, resolve elsewhere

## Partly done

- [~] **6. Quality pass**
  - Done:
    - Keyboard: J/K, Enter, P, Esc, focus return
    - Live-region announcements
    - Responsive: two lanes at 1280px and up, tabs at 1024–1279px, notice below 1024px
    - Privacy mode
    - Reduced motion
  - Not done:
    - Screen-reader walkthrough with VoiceOver
    - Right-to-left layout check
    - 40% text-expansion check
- [~] **7. Verification**
  - Done:
    - 41 tests (36 logic, 5 UI)
    - Headless screenshots at 900, 1100, 1280 and 1440px
    - Demo path checked: decide → toast with Reverse countdown and audit ID → count updates
  - Not done:
    - Formal side-by-side diff against Figma

## Known gaps

- At 1280px the Handled lane rows truncate names and locations (full text on hover).
- The JS bundle is about 960 kB before compression (Recharts + Base UI). Code-splitting is the next step.
- Camera stills are placeholders; there is no imagery in the demo.
- The audit trail is in-memory and resets on reload; `api.recordAudit` posts to the mock API.
