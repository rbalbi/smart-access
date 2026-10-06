# User Stories: Live Activity & Exceptions Console

*Source: SmartAccess-Live-Activity-Console (Figma) · [Live Activity frame, node 1:2](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-2) · read 2026-10-06*
*Grounding: `01-strategic-overview.md`, `02-personas-jtbd.md`, `03-competitive-analysis.md`, `ux-prompts/01-live-activity-exceptions-console.md` (the design brief), `web/src/types/index.ts` (domain terms)*

> **Scope note: the link points at the wrong frame.** The link I was given points to node **9:2**. That node is a **People & Credentials** screen (directory table, "Needs review" list, person drawer for Tomás Reyes), not the Live Activity console. The Live Activity console is the other top-level frame on the same page, node **1:2** ("Html → Body", 1280px wide). This backlog is written from **1:2** because the brief, the file name and the output path all refer to Live Activity. Node 9:2 is listed in the traceability table as out of scope. It needs its own backlog, probably from `ux-prompts/02-people-credentials.md`.

> **What the design shows.** Frame 1:2 is one populated state: Maria Alvarez (Operations) at Harborview Tower at about 9:15 AM, with 7 open exceptions, the Handled lane, the detail drawer open on the 7:42:19 AM Acme HVAC admit, and a decision toast. The file has no other state variants, prototype links or designer annotations. Stories for states that appear only in the brief are tagged **Not shown in the design**.

## Summary
- **6 epics, 34 stories (23 Must, 10 Should, 1 Could).**
- **In scope:** the Live Activity page and its app shell (top bar, sidebar, page header), the KPI strip, the "Needs You" lane, the "Handled Automatically" lane, the event detail drawer with override guardrails, the decision toast and the keyboard hint footer. The brief also specifies states, roles and privacy behaviour that are needed for the screen to work but are not drawn. Those are included and marked "Not shown in the design".
- **Deliberately out of scope:** the People & Credentials screen (node 9:2), policy editing (Access Policy & Autonomy screen), the Audit Log screen, the incident flow behind "Escalate to incident", portfolio rollup, tablet and mobile triage, and the global search ("Search people, doors, events...") beyond its presence in the top bar.

---

## Epic 1: Know the building is handling itself
Maria opens this screen several times an hour. Within a few seconds she needs to know that routine traffic is being handled, how much is left for people, and whether any hardware is at risk. The autonomy rate is the product's core metric (strategic overview §6), so it has to be the first thing she reads.

### STORY-01: See today's autonomous resolution rate
**As** Maria Alvarez, Director of Property Operations (Operations role)
**I want** to see what share of today's access events the system resolved without a person
**So that** I can confirm at a glance that the building is handling itself and show owners proof of value

**Design reference:** [KPI 1: Resolved Automatically (Hero KPI)](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-110)
**Priority:** Must · **Size:** M
**Dependencies:** none

**Acceptance criteria**
1. **Given** 1,284 of 1,326 access events today were resolved without human intervention, **when** the page loads, **then** the hero card reads "AUTONOMOUS RESOLUTION", "96.8%", "of today's access events resolved without human intervention", "1,284 of 1,326 events" and "7-day avg: 95.2%".
2. **Given** today's rate is above the 7-day average, **when** the card renders, **then** the trend reads "+1.6 pts" with an up-arrow icon. Direction is never conveyed by color alone.
3. **Given** the 7-day sparkline is shown, **then** it has end labels ("Mon 94%", "Today 96.8%") and a text alternative a screen reader can announce (for example "7-day upward trend, ending at 96.8 percent").
4. **Given** "today" is defined by the site's time zone, **then** the caption under the strip reads "Today = since 12:00 AM EDT" and the counts reset at site-local midnight, not the viewer's.
5. **Given** KPIs recalculate every 60 seconds, **then** the caption reads "KPIs recalculate automatically every 60s" and "Snapshot as of 9:15:02 AM EDT" updates with each recalculation.
6. **Given** the rate is 100%, **then** "100%" is shown with no celebratory animation.
7. **Given** a non-US locale, **then** the percentage and counts use locale separators (for example "96,8 %", "1.284").

**Out of scope:** drill-down into the events behind the KPI, export.
**Notes / open questions:** [Question] The design labels the card "AUTONOMOUS RESOLUTION" and the brief says "Resolved automatically". Pick one term and use it in the drawer ("Autonomous Score") and the Handled lane ("0 manual touch") as well. See OQ-9.

### STORY-02: See open exceptions by severity and jump to them
**As** Maria Alvarez (Operations)
**I want** to see how many exceptions are waiting and how severe they are
**So that** I know how much attention the building needs right now

**Design reference:** [KPI 2: Open Exceptions](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-38), [Top bar exception chip](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-817)
**Priority:** Must · **Size:** S
**Dependencies:** STORY-07, STORY-08

**Acceptance criteria**
1. **Given** 7 open exceptions, **then** the card shows "OPEN EXCEPTIONS", "7", "routed to security & ops", a "Requires action" indicator and segments "1 Critical", "2 High", "3 Med", "1 Low", each with an icon and a text label.
2. **Given** the same data, **then** the top-bar chip next to the site switcher reads "7 Exceptions", and both counts always match the "Needs You" lane badge.
3. **When** Maria clicks a severity segment (for example "2 High"), **then** the "Needs You" lane filters to that severity and the matching filter chip shows as active.
4. **Given** 0 open exceptions, **then** the card shows "0" without the "Requires action" indicator. [Assumption: the 0 state is not drawn.]
5. **Given** the count includes a security-classified exception, **then** it is counted for Operations users too (the design counts the Server Room 2F placeholder in "7"), without revealing its details.
6. Each segment is keyboard-focusable, has at least a 44×44px hit area, and has an accessible name such as "Filter to 2 High exceptions".

**Out of scope:** trend for exceptions over time.
**Notes / open questions:** [Question] The large "7" is red and paired with a red "Requires action" label. The brief asks for a calm screen with red reserved for Critical. Confirm the treatment (OQ-10).

### STORY-03: See how fast exceptions are resolved compared with the baseline
**As** Maria Alvarez (Operations)
**I want** to see today's median time to resolve human-reviewed exceptions against the 7-day baseline
**So that** I can tell whether my team is keeping up and report response times to owners

**Design reference:** [KPI 3: Median Time to Resolve](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-65)
**Priority:** Should · **Size:** S
**Dependencies:** none

**Acceptance criteria**
1. **Given** exceptions resolved by people today have a median of 4m 12s, **then** the card shows "MEDIAN RESOLUTION", "4m 12s", "for human reviews" and "7-day baseline: 5m 40s".
2. **Given** today is faster than the baseline, **then** it shows "1m 28s faster" and "25.8% improved" with a direction icon. The words "faster" and "slower" are always present.
3. **Given** today is slower than the baseline, **then** the card says "slower" and uses a neutral or warning treatment, never the same green.
4. **Given** no exceptions have been resolved yet today, **then** the card shows "—" with an explanation instead of "0s". [Assumption: not drawn.]
5. **Given** a German locale, **then** durations are localized (for example "4 min 12 s").

**Out of scope:** per-person or per-type resolution times.
**Notes / open questions:** [Question] Is the median calculated over exceptions *resolved* today, or *opened* today? This affects exceptions that carry over from yesterday.

### STORY-04: See door and hardware health and go to Doors & Devices
**As** Maria Alvarez (Operations)
**I want** to see how many doors are online, and which are offline or on battery
**So that** I can send facilities staff before a hardware problem becomes an access problem

**Design reference:** [KPI 4: Doors & Hardware Status](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-87)
**Priority:** Should · **Size:** S
**Dependencies:** none

**Acceptance criteria**
1. **Given** 47 of 48 doors online, **then** the card shows "DOORS", "47 / 48", "98% operational", "1 offline: Dock 4" and "1 on battery: Gate P1". Each status line has a status dot **and** a text label.
2. **When** Maria activates the card or its link icon, **then** Doors & Devices opens. The link has an accessible name ("Open Doors & Devices").
3. **Given** more than 2 doors are in a non-online state, **then** the card summarizes them (for example "3 offline") instead of overflowing. [Assumption: overflow behaviour not drawn.]
4. **Given** long door names, **then** they truncate with an ellipsis and show the full name in a tooltip.

**Out of scope:** device management actions.
**Notes / open questions:** The brief uses "Dock 4 roll-up door" and "Parking P1 gate". The design shortens these to "Dock 4" and "Gate P1". Confirm the short-name source with Engineering.

### STORY-05: Know which site I'm on and that the console is live
**As** Maria Alvarez (Operations)
**I want** the header to show the site, its time zone, whether the data is live, and the site's autonomy level
**So that** I trust what I'm looking at, especially when it's on a shared monitor

**Design reference:** [Top bar](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-806), [Page header](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-5), [Footer strip](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-152), [Sidebar](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-846)
**Priority:** Must · **Size:** M
**Dependencies:** none

**Acceptance criteria**
1. **Given** Maria is on Harborview Tower, **then** the top bar shows "Harborview Tower", "200 Harbor Street · Boston, MA · EDT", and the page header shows "Live Activity", "Harborview Tower · Site Console".
2. **Given** the stream is connected, **then** the status pill reads "Live · updated 2s ago", with the elapsed time updating, and the dot always paired with the word "Live".
3. **Given** the site's autonomy level is Balanced, **then** a read-only chip "Autonomy level: Balanced" links to Access Policy & Autonomy. Operations users cannot change the level from this screen.
4. "View audit log" opens the Audit Log screen.
5. **Given** the edge gateway is connected, **then** the footer shows "Connected to Meridian Edge Gateway (Node #4)" with a status dot plus text.
6. The sidebar shows "Live Activity" as the current item (with `aria-current="page"`), plus People & Credentials, Visitors, Doors & Devices, Access Policy & Autonomy and Audit Log, and the user card "Maria Alvarez · Operations · Meridian" with a sign-out control that has an accessible name.
7. All times on the page render in the site's time zone (EDT), not the viewer's, using the viewer's 12h or 24h preference.

**Out of scope:** global search behaviour, notifications panel, help content.
**Notes / open questions:** [Question] Sidebar collapse to a 64px rail (brief) is not drawn. [Question] The top bar has both an avatar button and a sidebar user card. Confirm which one owns the user menu.

### STORY-06: Switch to another site
**As** Maria Alvarez (Operations), who manages 6 buildings
**I want** to switch the console to another building and see each building's open-exception count before I switch
**So that** I can go where I'm needed without signing in again

**Design reference:** [Site switcher button](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-808). **Dropdown not shown in the design.**
**Priority:** Should · **Size:** M
**Dependencies:** STORY-05

**Acceptance criteria**
1. **When** Maria opens the switcher, **then** a menu lists her sites with open-exception badges (Harborview Tower 7 with a checkmark, 1180 Mercer Plaza 2, Canal Street Exchange 0, Riverside Commerce Center 4, Ashford Park, Building B 1, Lindell Square 0), per the brief.
2. The menu has a search field and scrolls (maximum 8 visible) so it scales to 50+ sites.
3. "All sites" is shown disabled with "Coming soon" and the helper text "Portfolio rollup isn't available yet."
4. **When** she selects a site, **then** the lanes, KPIs and header switch to that site and active filters are kept.
5. **Given** an unsaved note draft exists, **when** she switches, **then** a "Discard note?" confirmation appears first.
6. The menu is fully keyboard-operable (arrow keys, Enter, Escape), and focus returns to the switcher button on close.

**Out of scope:** portfolio view.
**Notes / open questions:** [Question] The dropdown is not designed (OQ-6).

---

## Epic 2: Triage exceptions in "Needs You"
This is the core job: clear the short list of things the system routed to a person. The brief's bar is that an experienced operator can clear an exception in under 10 seconds, and that every decision is attributable and logged.

### STORY-07: See a prioritized list of exceptions that need me
**As** Maria Alvarez (Operations)
**I want** exceptions listed by severity and age, each with a plain-language summary of what happened and what the system already did
**So that** I always work the most important item first and don't have to investigate before deciding

**Design reference:** ["Needs You" lane](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-178), [Card 2: Tailgating](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-281)
**Priority:** Must · **Size:** M
**Dependencies:** none

**Acceptance criteria**
1. **Given** open exceptions, **then** the lane header shows "Needs You" with a count badge ("7"), "Rerouted by system rules & low confidence", and "Exceptions the system routed to a person. Everything else is handled automatically."
2. Cards are sorted Critical → High → Medium → Low, and oldest first within a severity (the design order is Forced door 9:12:03 → Tailgating 9:08:14 → Classified 9:05:00 → Badge denied → Door held open → Visitor → Battery).
3. Each card shows a severity badge with a text label ("CRITICAL", "HIGH", "MEDIUM", "LOW") and a colored leading edge, the exception type as title, the door ("· Lobby B turnstile"), the time ("9:08:14 AM"), and a one-sentence summary (for example "2 people passed on 1 credential. Turnstile locked for the next entry.").
4. **Given** a person is involved, **then** the card shows a masked name, tenant and credential ("Tomás R. · Kestrel Analytics · Mobile ••••7731").
5. **Given** time ranges or ongoing conditions, **then** the time reads as a range or start ("8:58–9:04 AM", "started 9:10:30 AM", "since 8:51 AM").
6. The lane is a list. Each card is an `<article>` with a heading that names severity, type and door, and the lane is a labelled region ("Needs you, 7 exceptions").
7. The lane scrolls independently with a sticky header.
8. **Given** 50+ open exceptions, **then** the badge shows "50+" with a banner offering "Filter by severity" and "Review autonomy settings" (brief, **not shown in the design**).

**Out of scope:** decisions (STORY-10 to STORY-12).
**Notes / open questions:** [Question] Relative time with absolute time on hover ("6 min ago · 9:08:14 AM") is in the brief. The design shows absolute time only.

### STORY-08: Filter the exception list
**As** Maria Alvarez (Operations)
**I want** to filter exceptions by severity, type and assignment
**So that** I can focus on my own items or one kind of problem during a busy moment

**Design reference:** [Filters strip](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-190)
**Priority:** Must · **Size:** M
**Dependencies:** STORY-07

**Acceptance criteria**
1. Severity chips read "All (7)", "Critical (1)", "High (2)", "Med (3)", "Low (1)", and their counts update live.
2. A type dropdown defaults to "All Types" and offers the exception types in use (Forced door, Tailgating, Badge denied, Door held open, Visitor, Device & power).
3. An "Assigned to me" checkbox limits the list to exceptions assigned to the signed-in user.
4. Filters combine with AND. Active filters are reflected in the URL so a filtered view can be shared or deep-linked.
5. **Given** filters that match nothing, **then** the lane shows "No exceptions match these filters." with a "Clear filters" link (brief, **not shown in the design**).
6. Chips expose their selected state to assistive technology (`aria-pressed`) and are at least 44×44px.

**Out of scope:** saved filter presets.
**Notes / open questions:** [Question] The brief's door/zone filter is missing from the design. Is it dropped or deferred (OQ-7)? [Question] Are severity chips single-select (as drawn, "All" active) or multi-select (brief)?

### STORY-09: Understand why the system routed an exception to me
**As** Maria Alvarez (Operations)
**I want** to expand a card and see the policy, the sensor signals, the confidence and why it came to a person
**So that** I can trust the routing and decide without opening another tool

**Design reference:** [Card 1: Forced door (Why expanded)](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-221), [Card 2: Tailgating (inline signals)](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-281)
**Priority:** Must · **Size:** M
**Dependencies:** STORY-07

**Acceptance criteria**
1. **When** Maria expands "WHY THE SYSTEM ROUTED THIS TO YOU", **then** it shows the policy applied with version ("\"Stairwell C: egress only, alarm on forced entry\" (v2)"), each signal with its reading ("Door position sensor: OPEN (09:12:03)", "Credential reader: NULL (No badge presented)", "REX (Request-to-Exit) button: INACTIVE", "Mechanical lock: LOCKED"), confidence ("System confidence: 97% (High)") and the routing reason ("Forced-door events require human acknowledgement under site policy").
2. The disclosure has `aria-expanded`, toggles from the keyboard, and the expanded state is remembered for the session.
3. Confidence always shows a percentage **and** a band word (High ≥ 90%, Medium 70–89%, Low < 70%). It is never shown as a color or bar alone.
4. **Given** a rule-based decision, **then** "Rule-based" is shown instead of a percentage (for example the visitor card: "Confidence: Rule-based routing").
5. **Given** a threshold-routed exception, **then** the reason names the threshold ("Confidence: 82% (Below 90% auto-threshold)").
6. A "View policy" link opens Access Policy & Autonomy in a new tab, read-only for Operations.
7. Signals are text, not color-coded only. Values like "OPEN" and "LOCKED" remain readable in high-contrast mode.

**Out of scope:** policy editing (Security only, STORY-27).
**Notes / open questions:** [Question] Cards 2, 4, 6 and 7 show no Why toggle, or only a short inline signal line. Should every card have the same collapsed "Why" disclosure (OQ-8)? [Question] The "View policy" link is not drawn.

### STORY-10: Decide an exception in one click
**As** Maria Alvarez (Operations)
**I want** type-specific decision buttons in fixed positions that commit with one click
**So that** someone waiting at a door gets an answer within seconds and I build muscle memory

**Design reference:** [Card 2: Tailgating](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-281), [Card 4: Badge denied](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-341), [Card 5: Door held open](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-378), [Card 6: Visitor](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-408), [Card 7: Battery](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-442)
**Priority:** Must · **Size:** L
**Dependencies:** STORY-07

**Acceptance criteria**
1. Buttons appear in a fixed slot order (Approve, Deny, Escalate, overflow "⋯") with these labels: Tailgating "Mark as legitimate" / "Confirm violation"; Badge denied "Grant one-time entry" / "Keep denied"; Door held open "Allow for 15 min" / "Request door closed"; Visitor "Issue visitor pass" / "Decline entry"; Battery "Acknowledge" (no Deny slot).
2. Slots with no applicable action are omitted, not disabled, and the remaining buttons keep their order.
3. **When** Maria clicks a decision, **then** it commits immediately (no confirm dialog). The card shows "Recording decision…" with other buttons disabled, then collapses to a one-line record such as "✓ Entry approved by Maria Alvarez · 9:15 AM · Logged to audit trail (AUD-…)" and leaves the lane after 5 seconds (instantly under reduced motion).
4. Every decision writes an audit entry with actor, time, action, target and audit ID, and the ID is shown to the user.
5. A toast confirms the decision (see STORY-13), for example "Entry approved for Kenji W. at Lobby A turnstile 2 · Logged to audit trail AUD-0928-000980".
6. After a decision, focus moves to the next card's title, or to the empty-state heading if the lane is now empty.
7. Button labels never truncate. With 30–40% longer translations (for example "Einmaligen Zutritt gewähren") buttons wrap to a second row. Hit areas are at least 44×44px.
8. Users without decision rights see "View only · Ask an Operations or Security admin to decide." instead of the action row ([Assumption] front-desk viewer role from the brief, **not shown in the design**).

**Out of scope:** forced-door resolve (STORY-11), escalation (STORY-12), reversal (STORY-13), failures (STORY-16).
**Notes / open questions:** [Question] Visual emphasis is inconsistent across cards. "Confirm violation" (Deny slot) is highlighted on tailgating, "Request door closed" on door held open, and the Approve slot on badge and visitor cards. Is emphasis meant to signal a system recommendation (OQ-3)? [Question] The Escalate label is "Escalate" on four cards and "Escalate to Security" on two. The brief uses "Escalate to Security" everywhere. [Question] The toast says Kenji W. was approved, yet his card is still in the lane. Is the mock showing the moment before collapse? [Question] What does "Request door closed" actually do: notify someone on site, trigger a door buzzer, or something else?

### STORY-11: Resolve a forced-door exception with a required note
**As** Maria Alvarez (Operations)
**I want** to mark a forced-door event resolved only after recording what happened
**So that** every forced entry has a human explanation in the audit trail

**Design reference:** [Card 1: Forced door](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-221). **Note field not shown in the design.**
**Priority:** Must · **Size:** S
**Dependencies:** STORY-10

**Acceptance criteria**
1. The forced-door card shows "Mark resolved (note required)" and "Escalate to Security", with no Deny slot.
2. **When** Maria clicks "Mark resolved", **then** an inline note field opens with a "Mark resolved" confirm button, and focus moves into the field.
3. **Given** fewer than 10 characters, **then** the confirm button is disabled and the field explains the minimum length.
4. **When** she confirms, **then** the decision and the note are saved to the audit trail together, and the card collapses as in STORY-10.
5. **Given** she navigates away or switches site with a draft note, **then** she is asked "Discard note?" first, and drafts survive a session-timeout warning.

**Out of scope:** incident creation.
**Notes / open questions:** [Question] Should the Critical forced-door card show the auto-relock as a link to the related Handled row ("Related to Ex #1" appears on the 9:12:41 Relocked row)?

### STORY-12: Escalate an exception to Security
**As** Maria Alvarez (Operations)
**I want** to hand an exception to the Security on-call with a note
**So that** threats get expert attention without me deciding something outside my remit

**Design reference:** Escalate buttons on [Cards 1, 2, 4–7](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-220), shortcut "E Escalate" in the [footer](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-152). **Popover not shown in the design.**
**Priority:** Must · **Size:** M
**Dependencies:** STORY-10

**Acceptance criteria**
1. **When** Maria clicks Escalate, **then** a popover opens with recipient defaulting to "Security on-call · David Okafor", an optional note and a "Send" button.
2. **When** she sends, **then** the exception status becomes escalated, the card shows who it was escalated to and when, and the action is logged to the audit trail.
3. The recipient is notified. [Assumption: notification channel (push or email) is not specified.]
4. The popover traps focus, closes with Escape, and returns focus to the Escalate button.
5. Escalate is a secondary (not red) button on every card type.

**Out of scope:** "Escalate to incident" (Security only, STORY-27).
**Notes / open questions:** [Question] Does an escalated exception stay in Maria's lane (for example with an "Escalated" state) or leave it?

### STORY-13: Reverse a decision I just made
**As** Maria Alvarez (Operations)
**I want** to undo a decision from the confirmation toast or later from the event details
**So that** a mis-click doesn't lock someone out or let the wrong person in

**Design reference:** [Toast region](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-912)
**Priority:** Must · **Size:** M
**Dependencies:** STORY-10

**Acceptance criteria**
1. After a decision, a toast appears at the bottom left (bottom right in RTL) with the outcome ("Entry approved for Kenji W. at Lobby A turnstile 2"), the audit ID ("Logged to audit trail AUD-0928-000980"), "Reverse (28s)" with a live countdown, "View" and a close button.
2. **When** Maria clicks Reverse within 30 seconds, **then** the reversal is recorded as its own audit entry under her name. Nothing is silently undone, and the exception returns to the lane in its prior position.
3. The toast auto-dismisses after 8 seconds unless hovered or focused, and the Reverse window is not cut short by dismissal.
4. After the window, a "Reverse decision" action stays available from the drawer, so no one loses the ability to act because of a time limit (WCAG 2.2.1).
5. "View" opens the detail drawer for the decided item.
6. The toast is announced politely ("Entry approved, logged to audit trail"), and its buttons are reachable by keyboard.

**Out of scope:** bulk undo.
**Notes / open questions:** [Question] What does reversing mean at the door for an entry that has already happened (for example, reversing "Grant one-time entry" after the person walked through)? Security should confirm (brief OQ-7).

### STORY-14: Assign an exception and add notes
**As** Maria Alvarez (Operations)
**I want** to assign an exception to a team member and add notes to it
**So that** work like a battery replacement is owned by someone and the history is clear

**Design reference:** [Card 7: Battery, "Assigned to Carlos Mendoza"](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-442), overflow "⋯" on all cards. **Overflow menu not shown in the design.**
**Priority:** Should · **Size:** M
**Dependencies:** STORY-07

**Acceptance criteria**
1. The overflow menu on each card offers "Assign", "Add note" and "View details". The overflow button has an accessible name ("More actions for Controller on battery power").
2. "Assign" opens a searchable people picker for the site team. Once assigned, the card shows "Assigned to Carlos Mendoza" with an icon.
3. "Add note" opens an inline text area. Saved notes appear in the drawer timeline and are logged to the audit trail.
4. Assignment does not resolve the exception. It stays in the lane and counts toward "Assigned to me" for the assignee.
5. Reassigning or unassigning is logged.

**Out of scope:** notifying assignees outside the console. [Question] Is the assignee notified?
**Notes / open questions:** The overflow contents and the user preference "Always expand Why" (brief) are not drawn.

### STORY-15: See live timers on time-sensitive exceptions
**As** Maria Alvarez (Operations)
**I want** door-held-open, battery and host-response timers to update on the card
**So that** I can see how urgent a situation is getting without refreshing

**Design reference:** [Card 5: Door held open](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-378), [Card 6: Visitor](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-408), [Card 7: Battery](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-442)
**Priority:** Should · **Size:** S
**Dependencies:** STORY-07

**Acceptance criteria**
1. The door-held-open card counts up: "Held open 4m 12s. Limit is 2 min outside the scheduled delivery window." and "Door propped timer: 04:12 (Exceeded by +2:12)".
2. The counter keeps working past 1 hour (for example "1h 03m 10s", "Exceeded by +1:01:10").
3. Under `prefers-reduced-motion`, timers update at most every 15 seconds, and they are never auto-announced to screen readers.
4. The battery card shows "Battery at 64% (~2h 10m remaining)", and the values refresh from the controller.
5. The visitor card shows "Host SLA timer: 12m elapsed", counting from the host notification.

**Out of scope:** auto-escalation when a timer passes a limit. [Question] Should it auto-escalate?
**Notes / open questions:** The brief's visitor example says "no reply after 11 min". The design says "12m elapsed". Treat it as a live value.

### STORY-16: Handle failed decisions and exceptions resolved by someone else
**As** Maria Alvarez (Operations)
**I want** to know clearly when my decision didn't save, or when a colleague already handled the item
**So that** I never assume a door was handled when it wasn't, and never act twice

**Design reference:** **Not shown in the design** (brief: States, Decision failed, resolved elsewhere).
**Priority:** Must · **Size:** M
**Dependencies:** STORY-10

**Acceptance criteria**
1. **Given** a decision fails to save, **then** the card shows inline "Couldn't record decision. Nothing was changed at the door. [Retry]" with an icon, focus moves to the error, and the card stays in the lane.
2. **When** Maria clicks Retry, **then** the same decision is resubmitted once (idempotent), so no duplicate audit entries are created.
3. **Given** David Okafor resolves the exception while Maria is viewing it, **then** the card updates in place to "Resolved by David Okafor at 9:16 AM" and its buttons disappear, even when live updates are paused.
4. **Given** Maria clicks a decision at the same moment someone else resolves it, **then** the server rejects the second decision and Maria sees who resolved it.
5. The failure message is announced through an alert live region.

**Out of scope:** offline queueing (OQ-4).
**Notes / open questions:** none beyond OQ-4.

---

## Epic 3: Spot-check and override automatic decisions
This is the trust half of the promise: autonomy with guardrails (competitive analysis, differentiator 1). Maria and David need to see what the system decided, understand why, and reverse it if it is wrong, with a full audit trail.

### STORY-17: Scan what the system handled automatically
**As** Maria Alvarez (Operations)
**I want** a compact, newest-first feed of automatic decisions
**So that** I can spot-check the system without it competing with my to-do list

**Design reference:** ["Handled Automatically" lane](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-471)
**Priority:** Must · **Size:** M
**Dependencies:** none

**Acceptance criteria**
1. The header shows "Handled Automatically", "1,284 today" and "0 manual touch" (status dot plus text).
2. Each 56px row shows the time ("09:14:08"), an outcome badge with icon and label ("Admitted", "Denied", "Relocked", "Suppressed"), who or what ("Priya S. · Kestrel Analytics", "Door held open alarm suppressed"), the door and credential ("Lobby A turnstile 1 · Mobile ••••2290"), confidence or "Rule-based", a short policy name ("Tenant weekday") and a chevron.
3. Rows are in reverse-chronological order. Today's events load in a virtualized list, and earlier batches of 200 load on scroll.
4. A related event links to its exception (for example "Stairwell C, Level 4 · Related to Ex #1").
5. Long names truncate with an ellipsis and show the full text in a tooltip ("Guadalupe Ramírez-Castellanos de la Fuente").
6. The footer reads "Showing today only (1,284 events)" and "See full history in Audit log", which opens the Audit Log.
7. The feed uses `role="feed"` with `aria-busy` during loads. Routine events are never auto-announced.
8. **Given** no events yet today, **then** the lane shows "No access events yet today." / "Events appear here as people use doors." (**not shown in the design**).

**Out of scope:** history beyond today.
**Notes / open questions:** [Question] The design uses a red treatment for "Denied". The brief says automatic denials are routine and must not be red (OQ-2). [Question] The brief's "Decided locally, controller on battery" tag on the Parking P1 row is missing from the design.

### STORY-18: Filter and search automatic decisions
**As** David Okafor, Director of Security & IT (Security role)
**I want** to filter the feed by outcome and search it
**So that** I can quickly review all denials or find one person's entry

**Design reference:** [Filter tabs & search](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-625)
**Priority:** Should · **Size:** S
**Dependencies:** STORY-17

**Acceptance criteria**
1. Outcome tabs "All", "Admitted", "Denied" and "Actions" filter the feed, and the selected tab is exposed to assistive technology.
2. "Actions" covers door and device actions (Relocked, Suppressed).
3. The "Filter stream..." field matches person (masked), tenant, door, credential suffix and policy name, and results update as the user types.
4. **Given** no matches, **then** an empty message with a way to clear the filter is shown. [Assumption: not drawn.]
5. Search never matches on hidden fields (for example full names in privacy mode).

**Out of scope:** cross-day search (Audit Log).
**Notes / open questions:** [Question] The brief calls the fourth tab "Door & device actions" and the design says "Actions". Confirm the label.

### STORY-19: Inspect an event in the detail drawer
**As** Maria Alvarez (Operations)
**I want** to open any handled row or exception and see what happened, why, and the full timeline
**So that** I can judge whether the system was right without leaving the console

**Design reference:** [Drawer](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-648), [Selected row](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-588)
**Priority:** Must · **Size:** M
**Dependencies:** STORY-17

**Acceptance criteria**
1. **When** Maria clicks a handled row (or presses Enter on it), **then** a drawer opens over the Handled lane. The "Needs You" lane does not move, and the row shows a selected state.
2. The drawer header shows the outcome badge, the place and time ("Admitted · Dock 3 · 7:42:19 AM") and "Event ID: EVT-20260928-00412".
3. "1. WHAT HAPPENED" shows the subject ("Rahul M. · Contractor · Acme HVAC Services", tag "HVAC Maintenance"), "Credential: QR Mobile Pass (••••3107)" and "Authorization Window: 07:00 AM – 11:30 AM EDT".
4. "2. WHY THE SYSTEM DID THIS" shows the policy ("Contractor Pre-Registration & Loading Dock Protocol v2"), confidence with band ("99% (High)") and labelled signals ("[PASS VALIDATION] Cryptographically Signed · Valid", "[ANTIPASSBACK] PASS (No prior entry recorded)" and so on).
5. "3. STEP-BY-STEP AUDIT TIMELINE" lists dated steps in order (Sep 26, 2026 4:15 PM pre-registration by Olumide Adeyemi → Sep 27 pass issued → Today 7:42:19 AM credential verified → 7:42:20 AM lock opened → 7:42:31 AM relocked). Dates include the year.
6. The decision record reads "✓ Decided automatically by SmartAccess · Logged to audit trail AUD-0928-000981".
7. Focus moves to the drawer title on open and is trapped inside. "Esc to close" and the close button return focus to the originating row or card.
8. Clicking an exception card title opens the same drawer for that exception (brief, **not shown in the design**).

**Out of scope:** camera stills (Security, STORY-27).
**Notes / open questions:** [Question] The timeline shows the contractor's phone number "(+1 617-555-0192)". The brief says phone numbers never appear on this screen (OQ-1). [Question] The drawer uses "Autonomous Score: 99%" and "Model confidence (Autonomy Balanced tier)" for the same value. Pick one term.

### STORY-20: Override an automatic decision with a reason
**As** Maria Alvarez (Operations)
**I want** to revoke access the system granted, giving a reason
**So that** I can correct a wrong automatic decision and the correction is accountable

**Design reference:** [Human Override Guardrails](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-747)
**Priority:** Must · **Size:** M
**Dependencies:** STORY-19

**Acceptance criteria**
1. **Given** an "Admitted" event, **then** the "Human Override Guardrails" section (marked "Audited") offers "Revoke today's access for this credential" with a destructive treatment.
2. "Override Reason / Note (Required if revoking)" offers the reasons "Policy too strict", "Policy too permissive", "Wrong person identified", "Sensor fault" and "Other", plus an optional note. Revoke cannot be confirmed without a reason.
3. Before committing, the user sees "This reverses an automatic decision. It will be logged to the audit trail under your name."
4. **When** confirmed, **then** the credential is denied at all doors for the rest of the site-local day, an audit entry with the reason is created, and the drawer decision record shows the override.
5. **Given** a "Denied" event within 5 minutes, **then** the override offered is "Grant one-time entry". After 5 minutes it is "Send new invite to host" (brief, **not shown in the design**).
6. **Given** an Operations user and a security-classified automatic decision, **then** override controls are hidden.
7. The override can be undone through the same reversal path as STORY-13, and the undo is also logged.

**Out of scope:** changing the policy itself.
**Notes / open questions:** [Question] The drawer is only drawn for an "Admitted" event. Variants for Denied, Relocked and Suppressed are needed (OQ-6). [Question] Does "revoke today's access" act on the credential only, or on the person's other credentials too?

### STORY-21: Flag an automatic decision for manager review
**As** Maria Alvarez (Operations)
**I want** to flag a questionable automatic decision without reversing it
**So that** a manager or Security can look at it later without me blocking anyone now

**Design reference:** ["Flag event for manager review"](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-763)
**Priority:** Should · **Size:** S
**Dependencies:** STORY-19

**Acceptance criteria**
1. The drawer offers "Flag event for manager review" as a non-destructive secondary action.
2. **When** Maria flags an event, **then** the flag is logged with her name and an optional reason or note, and the row shows a "Flagged" indicator.
3. Flagging does not change door state or the original decision.
4. A flagged event can be un-flagged, and that is logged too.

**Out of scope:** the review queue where flags land.
**Notes / open questions:** [Question] Who is the "manager", and where do flagged events appear (Audit Log? a queue on Access Policy & Autonomy)? [Question] Is a reason required for flagging? The label suggests only revoking needs one.

### STORY-22: Tell the system whether its decision was right
**As** David Okafor (Security)
**I want** to answer "Was this system decision right? Yes / No" on an automatic decision
**So that** the autonomy settings can be tuned from real operator judgement

**Design reference:** [Autonomy Feedback Control](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-774)
**Priority:** Could · **Size:** S
**Dependencies:** STORY-19

**Acceptance criteria**
1. The drawer shows "Was this system decision right?" with "Yes" and "No" buttons, each with an icon and a text label.
2. **When** a user answers, **then** the answer is stored with user, event and time, and the selected answer is shown as pressed.
3. **When** a user answers "No", **then** they are offered (not forced) the override reason list from STORY-20.
4. Icons are culturally neutral (no thumbs-up).

**Out of scope:** the tuning model.
**Notes / open questions:** [Assumption] Feedback informs autonomy tuning. This is not in the brief's source docs (brief OQ-6).

---

## Epic 4: Stay in control of a live stream
A live feed that reorders under the cursor causes mis-clicks on access decisions. Operators need to freeze it, see what is waiting, and work from the keyboard.

### STORY-23: Pause and resume live updates
**As** Maria Alvarez (Operations)
**I want** to pause the stream manually, and have it pause itself while I'm working on a card
**So that** the item I'm about to decide never moves out from under me

**Design reference:** ["Pause live updates" button with "P"](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-24). **Paused state not shown in the design.**
**Priority:** Must · **Size:** M
**Dependencies:** STORY-07, STORY-17

**Acceptance criteria**
1. Clicking "Pause live updates" or pressing `P` toggles to "Resume live updates" and the button is pressed (`aria-pressed`). The header status reads "⏸ Paused · 12 new events" and an info bar shows "Live updates paused. New events are waiting below the header. [Resume]".
2. The stream also auto-pauses while the pointer or focus is in "Needs You", while a Why panel is expanded or while the drawer is open. Status then reads "⏸ Paused while you work", and it resumes 5 seconds after leaving unless paused manually.
3. While paused, cards never reorder or disappear, except for "resolved elsewhere" updates (STORY-16), which apply in place.
4. KPIs keep updating while paused.
5. "Live updates paused" is announced politely.

**Out of scope:** per-lane pause.
**Notes / open questions:** The footer hint calls this "Pause stream". Align the wording.

### STORY-24: See and load new items waiting behind the pill
**As** Maria Alvarez (Operations)
**I want** a pill telling me how many new items are waiting, and to load them when I'm ready
**So that** I notice new exceptions, especially Critical ones, without the list jumping

**Design reference:** [Needs You pill](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-213), [Handled pill](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-641)
**Priority:** Must · **Size:** S
**Dependencies:** STORY-23

**Acceptance criteria**
1. The "Needs You" pill reads "↑ 1 new exception arrived (Stairwell C)" with "Click to jump". The Handled pill reads "↑ 12 new events processed automatically".
2. **When** the user clicks a pill, **then** the waiting items are inserted, the lane scrolls to the top, and "12 new events loaded" is announced.
3. **Given** a new item is Critical, **then** the pill says so ("↑ 1 new Critical exception") with the critical icon and is announced assertively. All other announcements are polite and batched to at most one every 5 seconds.
4. The pills are keyboard-focusable with at least a 44×44px target.
5. The top-bar count and lane badges include waiting items so the totals are never understated.

**Out of scope:** sound alerts (off by default per brief).
**Notes / open questions:** [Question] The Handled pill shows "Stream live" while also showing 12 waiting events. When are items held behind the pill in the live (unpaused) state (OQ-5)?

### STORY-25: Triage from the keyboard
**As** Maria Alvarez (Operations), an expert daily user
**I want** keyboard shortcuts to move between, open and escalate exceptions
**So that** I can clear an exception in under 10 seconds

**Design reference:** [Keyboard shortcuts footer](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-152)
**Priority:** Should · **Size:** M
**Dependencies:** STORY-07, STORY-19

**Acceptance criteria**
1. The footer shows "J / K Navigate exceptions", "Enter Inspect", "E Escalate" and "P Pause stream".
2. `J` and `K` move focus to the next and previous exception card. `Enter` opens the drawer. `Esc` closes the popover or drawer. `?` lists all shortcuts, including `W` (toggle Why), `N` (add note) and `G` then `H` (focus the Handled lane).
3. Shortcuts are ignored while typing in inputs.
4. Single-key **decision** shortcuts (`A`, `D`) are off by default and enabled in preferences to prevent accidental decisions.
5. Tab order follows top bar → page header → KPIs → Needs You header → cards (title, Why, actions, overflow) → Handled header → rows → drawer.
6. Focus rings are always visible and never removed.

**Out of scope:** user-defined shortcuts.
**Notes / open questions:** [Question] Is `E` (Escalate) on by default as the footer implies? It is a decision-like action that the brief puts behind the same opt-in as `A` and `D` (OQ-11).

---

## Epic 5: See only what my role and the room allow
David holds a veto on security (personas). Maria must not see security-classified details, and the console is often on a shared screen, so masking and privacy mode are trust requirements, not polish.

### STORY-26: Show Operations a restricted placeholder for security-classified events
**As** Maria Alvarez (Operations)
**I want** to know a security-classified event exists without seeing its details
**So that** I'm aware of activity in my building while sensitive details stay with Security

**Design reference:** [Card 3: Security-classified placeholder](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-323)
**Priority:** Must · **Size:** S
**Dependencies:** STORY-07

**Acceptance criteria**
1. **Given** an Operations user and a classified event, **then** the card shows a "CLASSIFIED" tag, a lock icon, "Security-classified event at Server Room 2F", "9:05:00 AM", "Routed to the Security team. Details, live sensor telemetry, and camera stills are restricted to Security Clearance Tier 2 roles." and "Routing ID: SEC-CONF-88219".
2. The only action is "View status (Read-only)", which shows the status (open, escalated or resolved) and nothing more.
3. The API never sends classified details (person, credential, signals, camera) to an Operations session. This is enforced server-side, not just hidden in the UI.
4. The card uses a distinct non-severity treatment (dashed border, muted text) and is not decidable by keyboard shortcuts.
5. The drawer footer for classified events (Security only) reads "Internal · Confidential".

**Out of scope:** Security's full view (STORY-27).
**Notes / open questions:** [Question] Should Operations see this placeholder at all, or only a count (brief OQ-2)? [Question] The design introduces "Security Clearance Tier 2", a role tier not defined in the personas, the brief or `Role` ('operations' | 'security'). Is there a tiered model (OQ-12)? [Question] The design drops the "High" severity badge the brief gave this card.

### STORY-27: Give Security the full view of classified events and Security-only actions
**As** David Okafor (Security)
**I want** full details, a camera still, "Escalate to incident" and "Edit policy"
**So that** I can respond to real threats with context and fix the rule that caused them

**Design reference:** **Not shown in the design.** The design only shows the Operations (Maria) view.
**Priority:** Must · **Size:** M
**Dependencies:** STORY-09, STORY-26

**Acceptance criteria**
1. **Given** a Security user, **then** the Server Room 2F card shows "Unrecognized credential attempted 4 times in 3 min. Door held locked.", "Badge ••••0192 (not enrolled at this site)", "Confidence 91%" and actions "Keep denied" · "Escalate to incident" · ⋯.
2. Forced-door and classified cards show a static still frame (for example "Stairwell C Cam 1 · 9:12:05 AM", 160×90) that opens larger in the drawer. There is no live video.
3. "View policy" offers "Edit policy" for Security users only.
4. "Escalate to incident" opens the incident flow (separate screen).
5. Operations users never receive camera stills or "Edit policy" or "Escalate to incident" controls, and the API rejects those actions from an Operations session.
6. Camera stills are hidden in privacy mode, even for Security.

**Out of scope:** the incident flow itself.
**Notes / open questions:** A Security-role variant of frame 1:2 is needed before build (OQ-6).

### STORY-28: Turn on privacy mode for screen sharing
**As** Maria Alvarez (Operations), who shares her screen on calls with owners
**I want** one toggle that hides names and credential details
**So that** I can present the console without exposing personal data

**Design reference:** ["Privacy" button in top bar](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-830). **Privacy-on state not shown in the design.**
**Priority:** Must · **Size:** M
**Dependencies:** STORY-07, STORY-17, STORY-19

**Acceptance criteria**
1. Clicking "Privacy" or pressing `Shift+P` turns privacy mode on. The control shows its state (`aria-pressed` or switch), and a persistent banner reads "Privacy mode on. Names and credential details are hidden for screen sharing."
2. In privacy mode, names become role and tenant ("Employee · Castellan Insurance", "Visitor · host at Northwind Legal") across cards, rows, the drawer and toasts, credential suffixes are hidden, and camera stills are hidden.
3. Privacy mode applies immediately without reload and persists for the session.
4. Turning it off restores masked names (not full names).
5. Search and tooltips never reveal hidden data while privacy mode is on.

**Out of scope:** per-field privacy settings.
**Notes / open questions:** The design label is "Privacy". The brief says "Privacy mode". Confirm the label.

### STORY-29: Mask personal data by default and log every reveal
**As** David Okafor (Security)
**I want** names masked and credentials truncated by default, with every full-name reveal logged
**So that** we meet privacy expectations and can audit who looked at what

**Design reference:** Masked names on [cards](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-220), [rows](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-472) and the [drawer](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-650). The Reveal control is not shown.
**Priority:** Must · **Size:** M
**Dependencies:** none

**Acceptance criteria**
1. People show as given name plus family initial ("Kenji W.", "Rahul M."), masked from the stored name fields (not guessed from word order), so "Tanaka Yuki" style family-first names are masked correctly.
2. Credentials only ever show the last 4 digits ("••••4821"). Only the last 4 leave the backend.
3. Visitor and contractor phone numbers and emails never appear on this screen.
4. In the drawer, a "Reveal" control shows the full name. Each reveal is logged ("Name revealed by Maria Alvarez").
5. The design's long-name case ("Guadalupe Ramírez-Castellanos") shows that a full name may appear in a Handled row. Rows must use the same masking rule as cards.

**Out of scope:** biometric data display.
**Notes / open questions:** [Question] The design shows "Guadalupe Ramírez-Castellanos" unmasked in a row and "+1 617-555-0192" in the drawer, which conflicts with the brief's masking rules (OQ-1). [Question] Do GDPR or biometric rules apply to EU sites (brief, strategic overview §7)?

---

## Epic 6: Keep working when things go wrong
The platform runs on internal networks, so connections drop. The console must never mislead someone about what has been recorded, and doors must keep enforcing policy.

### STORY-30: Load the console progressively and recover from a failed lane
**As** Maria Alvarez (Operations)
**I want** the page to show structure immediately and let me retry a part that failed
**So that** one slow or broken service doesn't block my whole console

**Design reference:** **Not shown in the design** (brief: Loading, Error, KPIs unavailable).
**Priority:** Must · **Size:** S
**Dependencies:** STORY-01, STORY-07, STORY-17

**Acceptance criteria**
1. On first load, the header and site switcher render at once. The KPI strip shows 4 skeleton cards, "Needs You" shows 3 skeleton cards and Handled shows 8 skeleton rows. There is no full-page spinner.
2. **Given** the exceptions lane fails to load, **then** it shows "Couldn't load exceptions. [Retry]" and the Handled lane stays usable (and the other way round).
3. **Given** a KPI fails, **then** that card shows "—" with "Metric temporarily unavailable. [Retry]" and the lanes still work.
4. **Given** KPI data is stale, **then** values are dimmed with "as of <time>".
5. Loading regions set `aria-busy`.

**Out of scope:** offline mode.
**Notes / open questions:** none.

### STORY-31: See a calm empty state when nothing needs me
**As** Maria Alvarez (Operations)
**I want** a clear "nothing needs you" message when the lane is empty
**So that** I can confidently go back to other work

**Design reference:** **Not shown in the design** (brief: Empty-state copy).
**Priority:** Must · **Size:** S
**Dependencies:** STORY-07

**Acceptance criteria**
1. **Given** no open exceptions, **then** the lane shows a shield-check icon, "Nothing needs you right now" and "The system is handling all activity at Harborview Tower within your policies. Last exception resolved 9:21 AM by Maria Alvarez." There is no call to action.
2. After the last decision, focus moves to the empty-state heading.
3. The top-bar chip and KPI 2 show 0 consistently.
4. The empty state has no celebratory animation.

**Out of scope:** none.
**Notes / open questions:** none.

### STORY-32: Know when the console has lost its connection
**As** Maria Alvarez (Operations)
**I want** an obvious warning when the console is disconnected, and decisions blocked until it reconnects
**So that** I never believe a decision was recorded when it wasn't

**Design reference:** **Not shown in the design.** The connected state is shown in the [footer](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-173) and [live pill](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-10).
**Priority:** Must · **Size:** M
**Dependencies:** STORY-05, STORY-10

**Acceptance criteria**
1. **Given** the browser loses the server connection, **then** a warning banner reads "Connection lost. Showing activity as of 9:14:32 AM. Doors keep enforcing policy locally. Reconnecting in 10s… [Retry now]" with a cloud-off icon.
2. The live pill changes to "○ Offline · last update 9:14:32 AM", and the footer gateway status changes to match (icon plus text).
3. Decision buttons are disabled with the tooltip "Can't record decisions while disconnected."
4. KPIs are dimmed with an "as of" time.
5. "Connection lost" is announced assertively once. On reconnect, the banner clears, data refreshes and "Live" returns.

**Out of scope:** local decision queueing.
**Notes / open questions:** [Question] Should decisions queue locally instead of being blocked (brief OQ-3, OQ-4 here)?

### STORY-33: See edge-controller outages and late-synced events
**As** David Okafor (Security)
**I want** to know when a door controller is unreachable, and to see the events it recorded offline once it reconnects
**So that** the audit trail is complete and I know which doors were running on their last-synced policy

**Design reference:** Partly shown: [Doors KPI "1 offline: Dock 4"](https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=1-102). The exception card and sync note are not shown.
**Priority:** Should · **Size:** M
**Dependencies:** STORY-04, STORY-17

**Acceptance criteria**
1. **Given** a controller is unreachable, **then** a Device & power exception appears: "Dock 4 controller unreachable since 8:47 AM. The door is enforcing its last synced policy locally. Events from this door will appear when the connection returns."
2. The Doors KPI counts the door as offline.
3. **When** the controller reconnects, **then** the Handled lane shows "Synced 14 events from Dock 4 (8:47–9:02 AM)", and those rows carry a "Recorded offline" tag, inserted in correct time order.
4. KPI counts include the synced events after the next recalculation.
5. Events decided locally while on battery are tagged "Decided locally, controller on battery".

**Out of scope:** controller diagnostics.
**Notes / open questions:** [Assumption] Controllers decide locally and sync later (brief OQ-4). Engineering should confirm. [Question] KPI 4 shows Dock 4 offline but there is no Dock 4 exception card in "Needs You". Is that intentional?

### STORY-34: Use the console at laptop widths and in other languages
**As** Maria Alvarez (Operations), who uses both a laptop and a front-desk monitor
**I want** the console to adapt down to 1024px and to work in other locales and RTL
**So that** the console works for every site team, whatever their screen or language

**Design reference:** **Not shown in the design.** Frame 1:2 is drawn at 1280px, while the brief designs at 1440px.
**Priority:** Should · **Size:** M
**Dependencies:** STORY-07, STORY-17, STORY-19

**Acceptance criteria**
1. From 1280px up, the lanes split 7/5. From 1024 to 1279px, the lanes become tabs "Needs you (7)" (default) and "Handled automatically (1,284)", the sidebar collapses to a 64px rail with tooltips, and the drawer is 420px.
2. Below 1024px a best-effort layout is shown. Below 768px the page shows "This console is designed for screens 1024px or wider."
3. In RTL, the layout mirrors: "Needs You" on the right, the drawer from the left, the toast bottom right, the severity edge on the right, and chevrons flipped. Vertical arrows (↑, trend) do not flip.
4. Only names and door names truncate (with a tooltip). Labels, summaries and buttons wrap.
5. Dates, times, numbers and durations follow the user's locale, in the site's time zone.

**Out of scope:** tablet and mobile triage view (brief open question).
**Notes / open questions:** [Question] The frame is drawn at 1280px with a 256px sidebar, so the lanes are narrower than in the brief and some text wraps or clips (for example "Live / Activity" breaks onto two lines). Confirm the reference width.

---

## Traceability table

| Figma frame (node) | Stories |
|---|---|
| Live Activity page, whole frame (1:2) | All Epic 1–6 stories |
| Top bar: site switcher, exception chip, search, Privacy, bell, help, avatar (1:806) | STORY-02, 05, 06, 28 |
| Sidebar: nav, user card (1:846) | STORY-05, 34 |
| Page header: title, live pill, autonomy chip, Pause, View audit log (1:5) | STORY-05, 23, 32 |
| KPI 1: Autonomous resolution (1:110) | STORY-01 |
| KPI 2: Open exceptions (1:38) | STORY-02 |
| KPI 3: Median resolution (1:65) | STORY-03 |
| KPI 4: Doors (1:87) | STORY-04, 33 |
| KPI timestamp row (1:142) | STORY-01, 30 |
| Needs You lane header (1:179) | STORY-07 |
| Needs You filters (1:190) | STORY-08 |
| Needs You new-exception pill (1:213) | STORY-24 |
| Card 1: Critical, Forced door, Why expanded (1:221) | STORY-07, 09, 11, 12 |
| Card 2: High, Possible tailgating (1:281) | STORY-07, 09, 10 |
| Card 3: Classified placeholder (1:323) | STORY-26, 27 |
| Card 4: Medium, Badge denied 3 times (1:341) | STORY-10, 13 |
| Card 5: Medium, Door held open (1:378) | STORY-10, 15 |
| Card 6: Medium, Visitor without invite (1:408) | STORY-10, 15 |
| Card 7: Low, Controller on battery, assigned (1:442) | STORY-10, 14, 15 |
| Handled lane header, filters, search, pill (1:615, 1:625, 1:641) | STORY-17, 18, 24 |
| Handled rows 1–7 (1:473 to 1:588) | STORY-17, 19, 29 |
| Handled lane footer (1:607) | STORY-17 |
| Drawer header and sections 1–3 (1:788, 1:650, 1:674, 1:717) | STORY-19 |
| Drawer: Human Override Guardrails (1:747) | STORY-20, 21 |
| Drawer: Autonomy feedback (1:774) | STORY-22 |
| Toast (1:912) | STORY-10, 13 |
| Keyboard hint and gateway footer (1:152) | STORY-05, 25, 32 |
| **People & Credentials screen (9:2), the node in the supplied link** | **Out of scope.** Different screen (directory, "Needs review", person drawer). Needs its own backlog. |
| *Not in Figma:* loading, empty, error, paused, offline, Security-role view, privacy-on, site dropdown, Escalate popover, overflow menu, decided and failed card states, Denied-event drawer, responsive and RTL | STORY-06, 12, 14, 16, 20, 23, 27, 28, 30–34 (marked "Not shown in the design") |

---

## Open questions

1. **[Product + Design] Personal data shown against the brief's privacy rules.** The drawer timeline shows a contractor phone number ("+1 617-555-0192"), and a Handled row shows "Guadalupe Ramírez-Castellanos" unmasked. The brief says phone numbers never appear and names are masked by default. *Blocks STORY-19, STORY-29.*
2. **[Design] Red "Denied" badge in the Handled lane.** The brief says automatic denials are routine and must not be red. *Blocks STORY-17.*
3. **[Design + Product] Inconsistent button emphasis.** The highlighted button changes slot by card type ("Confirm violation", "Request door closed" versus "Grant one-time entry"). Is this a system recommendation (which would then need explaining) or a mistake? Escalate labels also vary ("Escalate" versus "Escalate to Security"). *Blocks STORY-10.*
4. **[Product + Engineering] Decisions while disconnected.** Block them (brief) or queue them locally? *Blocks STORY-16, STORY-32.*
5. **[Design] New-events pill in the live state.** The Handled pill shows "12 new events" next to "Stream live". Are items held behind the pill only when paused, or always? *Blocks STORY-23, STORY-24.*
6. **[Design] Missing variants needed before build:** Security-role view, Denied, Relocked and Suppressed drawer variants, site switcher dropdown, Escalate popover, overflow menu, forced-door note entry, decided, failed and resolved-elsewhere card states, paused, offline, loading and empty states, privacy-on, and widths of 1024px and 1440px. *Blocks STORY-06, 12, 14, 16, 20, 23, 27, 28, 30–34.*
7. **[Product] Door/zone filter.** It is in the brief but missing from the design, and the severity chips may be single-select rather than multi-select. *Blocks STORY-08.*
8. **[Design] "Why" disclosure consistency.** Only the forced-door card has the expandable Why panel. Other cards show partial inline signals or none. *Blocks STORY-09.*
9. **[Product] Terminology.** "Autonomous resolution", "Resolved automatically", "Autonomous Score", "Model confidence" and "System confidence" are all used. One glossary is needed for UI, docs and data. *Affects STORY-01, 09, 19.*
10. **[Design] Calm register.** The large red "7" with "Requires action" in KPI 2 conflicts with the brief's calm rules (red for Critical only). *Affects STORY-02.*
11. **[Product] Keyboard decisions.** The footer advertises `E` Escalate. Is it on by default, given that `A` and `D` are opt-in to prevent accidental decisions? *Blocks STORY-25.*
12. **[Product + Security] "Security Clearance Tier 2".** The classified card introduces a role tier that is not in the personas, the brief or the `Role` type. Should Operations see the placeholder at all, or only a count? *Blocks STORY-26, STORY-27.*
13. **[Product] Wrong node in the supplied link.** The URL pointed at node 9:2 (People & Credentials). Confirm that 1:2 is the intended Live Activity source, and whether a People & Credentials backlog is wanted. *Affects all stories.*

---

## Assumptions

- The intended source is frame **1:2**, not the linked 9:2 (see scope note).
- Behaviour, copy and states not drawn in Figma follow `ux-prompts/01-live-activity-exceptions-console.md`.
- Personas are proto-personas: Maria Alvarez (Operations, cannot edit policy or see classified details) and David Okafor (Security, sees everything). A view-only "front-desk viewer" role exists only in the brief.
- Confidence bands (High ≥ 90%, Medium 70–89%, Low < 70%) and per-door thresholds are illustrative. Real values come from Access Policy & Autonomy.
- Edge controllers decide locally and sync later. The tenant roster sync (badge-denied example) exists.
- Operator "Was this right?" feedback feeds autonomy tuning.
- The Escalate notification channel (push or email) is not specified.
- Dark theme, colors and fonts in Figma are placeholders. Neither the brief nor the design has a SmartAccess token file.
- All firm, site and person names are fictitious.

---

## Suggested release slicing

- **MVP (trustworthy triage for one site, Operations and Security):** STORY-01, 02, 05, 07, 08, 09, 10, 11, 12, 13, 16, 17, 19, 20, 23, 24, 26, 27, 28, 29, 30, 31, 32
- **Next (efficiency and depth):** STORY-03, 04, 06, 14, 15, 18, 21, 25, 33, 34
- **Later (learning loop):** STORY-22
