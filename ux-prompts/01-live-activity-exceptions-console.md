# UX Prompt 01: Live Activity & Exceptions Console

*As of 2026-09-28 · Draft v0.1 · Works in Google Stitch or Figma AI (structured default format)*

> **Design system notice:** SmartAccess does not have a design-token file yet. Every color, type size, spacing value and radius below is a **placeholder enterprise default** (neutral light gray and white, with a blue primary action). Replace these values when a SmartAccess token file exists (suggested path: `/Users/rafaelbalbi/Documents/Smart Access/design.md`).
>
> **Grounding:** `01-strategic-overview.md`, `02-personas-jtbd.md`, `03-competitive-analysis.md`. SmartAccess is fictitious. Anything these docs don't state is marked **[Assumption]**. All building, tenant and person names are invented.

---

## Screen: Site Console > Live Activity & Exceptions

This is the home screen for one building. It shows a live stream of access events in two lanes: **"Needs you"**, for exceptions that need a human decision, and **"Handled automatically"**, for decisions the system made on its own within policy. The operator can decide exceptions in one click, see why the system acted, and reverse any automatic decision. The screen makes the product promise visible: **people only step in for true exceptions.**

**Emotional register:** calm and in control, not an alarm wall. The screen is quiet by default. Color and emphasis are reserved for the few things that need attention. The autonomy rate is the most prominent number on the screen, so the user sees first that the building is handling itself. Exceptions are presented as a short, manageable to-do list, not a flood of alerts. Optimize for the 100th visit: an experienced operator should clear an exception in under 10 seconds.

---

## Context

- **Application area:** Site Console (per-building operations). This is the default landing screen after login.
- **Primary user: Maria Alvarez, Director of Property Operations.** She works at a property management firm with 6 multi-tenant commercial buildings. She is an expert, daily user who checks the screen several times an hour between other work. She wants fewer tickets and a sense of control. Role: **Operations**. She can decide access exceptions, but **cannot change policy** and **cannot see security-classified events or camera context**.
- **Secondary user: David Okafor, Director of Security & IT.** Role: **Security**. He sees everything Maria sees, plus security-classified events, camera still-frame context and the "Edit policy" link. He also has the Escalate-to-incident path. He cares about signal over noise and a complete audit trail.
- **Entry point:** Default landing after login, the "Live Activity" item in the left nav, or a deep link from a notification (for example, a push or email alert for a Critical exception opens this screen with that exception selected).
- **Task:** Scan the building's health, confirm the system is handling routine traffic, clear the "Needs you" lane, and spot-check or reverse automatic decisions when something looks wrong.
- **Next action:** Return to other work once the lane is empty. Open **Access Policy & Autonomy Controls** (separate screen) to change the rule that caused an exception. Open the **Audit Log** (separate screen) for full history.
- **Device:** Desktop-primary (designed at 1440px, supported down to 1024px). Often shown on a large monitor at a security or front desk, and sometimes screen-shared on calls with owners or tenants. This drives the privacy requirements below.

---

## Layout

**App shell**

- **Left sidebar** (256px, collapsible to 64px icon rail). Items: Live Activity (active), People & Credentials, Visitors, Doors & Devices, Access Policy & Autonomy Controls, Audit Log. User menu at the bottom with name and role ("Maria Alvarez · Operations"). Every icon has a visible text label when expanded and a tooltip when collapsed.
- **Top bar** (56px, full width):
  - Left: **site switcher**, a dropdown button reading "Harborview Tower ▾" with a secondary line "200 Harbor Street · Boston, MA · EDT".
  - Center-right: global search ("Search people, doors, events").
  - Right: **Privacy mode toggle** (eye-slash icon plus "Privacy mode" label), notification bell, help.
- **Main content area:** `#F5F5F5` background, max-width 1440px, 24px page padding.

**Main content, top to bottom**

1. **Page header row (48px).** Left: page title "Live Activity" with a live-status indicator beside it ("● Live · updated 2s ago"; the dot is paired with the text "Live", never color alone). Right: a read-only chip "Autonomy level: Balanced" that links to Access Policy & Autonomy Controls, a **Pause live updates** toggle button, and a "View audit log" text link.

2. **KPI strip.** One row of 4 cards on a 12-column grid, 16px gaps. Column spans are 4 / 3 / 3 / 2: the hero card is widest and the Doors card is narrowest.
   - **Card 1, Resolved automatically (hero KPI, 4 columns).** Large number "96.8%", label "of today's access events resolved without human intervention", supporting line "1,284 of 1,326 events · 7-day average 95.2% ▲ 1.6 pts". Includes a small inline sparkline of the last 7 days with a text alternative. This card must be the visual anchor of the strip: largest number, subtle primary-tint background (`#F3F7FC`).
   - **Card 2, Open exceptions.** "7" with a segmented breakdown row: "1 Critical · 2 High · 3 Medium · 1 Low". Each segment has a severity icon and label. Clicking a segment filters the "Needs you" lane.
   - **Card 3, Median time to resolve.** "4m 12s", "Today · 7-day median 5m 40s ▼ 1m 28s (faster)". The direction arrow always comes with a word ("faster" or "slower") so good or bad is never shown by arrow or color alone.
   - **Card 4, Doors.** "47 of 48 online" with sub-lines "1 offline (Dock 4 roll-up door)" and "1 on battery (Parking P1 gate)". The whole card links to Doors & Devices.
   - Caption under the strip, right-aligned: "Today = since 12:00 AM EDT · KPIs refresh every 60s · as of 9:15 AM".

3. **Two-lane work area.** The main body sits below the KPI strip on the 12-column grid and fills the remaining viewport height. Each lane scrolls independently and has a sticky lane header.
   - **Left lane: "Needs you" (7 columns).** Comfortable spacing. Stacked exception cards, sorted by severity and then by age (oldest first within a severity).
   - **Right lane: "Handled automatically" (5 columns).** Compact spacing. A reverse-chronological feed of dense rows, newest at the top.
   - In LTR layouts "Needs you" is on the left because it is the actionable lane and reading starts there. In RTL layouts the lanes mirror.

4. **Detail drawer (on demand).** A 480px right-side drawer that overlays the "Handled automatically" lane. It opens when the user clicks an exception card's title or any handled row. It shows the full "Why the system did this" breakdown, an event timeline, related events and decision history. It has a close button and closes with Escape. It overlays rather than pushes, so the "Needs you" lane stays still while the user triages.

5. **Toast region.** Bottom-left in LTR (bottom-right in RTL), away from the drawer. Shows decision confirmations such as "Approved · Logged to audit trail".

---

## Content

### Site switcher (dropdown)

| Site | Open exceptions badge |
|---|---|
| Harborview Tower (current, checkmark) | 7 |
| 1180 Mercer Plaza | 2 |
| Canal Street Exchange | 0 |
| Riverside Commerce Center | 4 |
| Ashford Park, Building B | 1 |
| Lindell Square | 0 |
| *Divider* | |
| All sites (portfolio view): shown disabled with a "Coming soon" tag and the helper text "Portfolio rollup isn't available yet." | |

The switcher has a search field at the top (the firm has 6 sites now, but the component must scale to 50+). Maria's firm, **Meridian Property Partners [Assumption: fictitious firm name]**, appears as a small caption at the top of the dropdown.

### "Needs you" lane header

- Title: "Needs you" with count badge "7".
- Subtext: "Exceptions the system routed to a person. Everything else is handled automatically."
- Filter controls: severity (multi-select chips), type (dropdown: Tailgating, Forced door, Door held open, Denied access, Visitor, Device & power), door or zone (dropdown with search), and "Assigned to me" toggle.

### Exception card anatomy (top to bottom)

1. **Header row:** severity badge (icon + label), exception type as the card title (16px semibold), door name, and relative time with absolute time on hover ("6 min ago · 9:08:14 AM").
2. **Summary line:** one plain-language sentence saying what happened and what the system already did.
3. **People and credential line** (if relevant): masked person name, tenant and credential type (see Privacy rules).
4. **"Why the system did this" disclosure** (collapsed by default; expands inline). Contents:
   - **Policy applied:** policy name and version, with a "View policy" link that opens Access Policy & Autonomy Controls in a new tab. Operations users get the policy read-only; Security users also get "Edit policy".
   - **Signals used:** a list of 2 to 4 sensor readings, each with source, reading and timestamp.
   - **Confidence:** a percentage plus a text band and a horizontal bar, for example "82% · Medium confidence". Band thresholds: High ≥ 90%, Medium 70–89%, Low < 70% **[Assumption: real thresholds come from the Autonomy Controls screen]**.
   - **Why it came to you:** for example, "Confidence 82% is below this door's auto-action threshold of 90%."
   - **Already done automatically:** for example, "Turnstile locked for the next entry. No audible alarm."
5. **Action row:** primary decision buttons plus an overflow menu (Assign, Add note, View details). Button labels are type-specific verbs, but **positions are fixed in every card**: Approve slot first, Deny slot second, Escalate third, overflow last. See the per-type mapping below.
6. **Footer (after a decision):** the card collapses to a one-line record, "✓ Entry approved by Maria Alvarez · 9:15 AM · Logged to audit trail (AUD-0928-004517)", then moves out of the lane after 5 seconds. With reduced motion it is removed instantly and focus moves to the next card.

### Per-type action mapping

| Exception type | Approve slot | Deny slot | Escalate slot |
|---|---|---|---|
| Possible tailgating | "Mark as legitimate" | "Confirm violation" | "Escalate to Security" |
| Badge denied repeatedly | "Grant one-time entry" | "Keep denied" | "Escalate to Security" |
| Forced door | "Mark resolved" (note required) | — (hidden) | "Escalate to Security" |
| Door held open | "Allow for 15 min" | "Request door closed" | "Escalate to Security" |
| Visitor without invite | "Issue visitor pass" | "Decline entry" | "Escalate to Security" |
| Controller on battery / offline | "Acknowledge" | — (hidden) | "Escalate to Security" |

When a slot has no applicable action, it is omitted rather than disabled so that meaningless buttons aren't shown. The remaining buttons keep their order.

### Sample exception cards (Needs you, 7 open; Maria sees 6 in full plus 1 restricted)

**1. Critical · Forced door · Stairwell C, Level 4 door · 9:12:03 AM**

- Summary: "Door opened without a credential or exit request. Door auto-relocked at 9:12:41 AM."
- Why:
  - Policy "Stairwell C: egress only, alarm on forced entry" (v2).
  - Signals: door position sensor OPEN 9:12:03; no credential read; no request-to-exit button press; lock state LOCKED at time of opening.
  - Confidence 97% (High).
  - Why it came to you: "Forced-door events always require a person under this site's policy."
- Security role only: camera still frame "Stairwell C Cam 1 · 9:12:05 AM" (static thumbnail, 160×90, opens larger in the drawer). No live video.
- Actions: Mark resolved (note required) · Escalate to Security · ⋯

**2. High · Possible tailgating · Lobby B turnstile · 9:08:14 AM**

- Summary: "2 people passed on 1 credential. Turnstile locked for the next entry."
- Person: "Tomás R. · Kestrel Analytics · Mobile credential ••••7731"
- Why:
  - Policy "Lobby B: one entry per credential" (v3, edited Sep 12, 2026 by David Okafor).
  - Signals: turnstile beam count 2; credential reads 1; overhead occupancy sensor count +2 people.
  - Confidence 82% (Medium).
  - Why it came to you: "Below 90% auto-action threshold."
- Actions: Mark as legitimate · Confirm violation · Escalate to Security · ⋯

**3. High · Security-classified event · Server Room 2F**

- Security role sees: "Unrecognized credential attempted 4 times in 3 min. Door held locked." Credential "Badge ••••0192 (not enrolled at this site)". Confidence 91%. Camera still frame. Actions: Keep denied · Escalate to incident · ⋯
- Operations role sees a **restricted card**: lock icon, "Security-classified event at Server Room 2F", "Routed to the Security team. Details are limited to Security roles." No actions except "View status". This tells Maria something exists without exposing details. **[Open question: should Ops see this placeholder at all, or only a count?]**

**4. Medium · Badge denied 3 times · Lobby A turnstile 2 · 8:58–9:04 AM**

- Summary: "Active employee denied 3 times in 6 min. Badge expired Sep 27, 2026, but the tenant roster lists the person as active."
- Person: "Kenji W. · Castellan Insurance · Badge ••••4821"
- Why:
  - Policy "Tenant badge validity" (v5).
  - Signals: 3 denied reads (reason: credential expired); tenant roster status Active (synced 6:00 AM).
  - Confidence 88% that this is a legitimate employee (Medium).
  - Tenant roster sync is **[Assumption: integration not confirmed in brief]**.
- Actions: Grant one-time entry · Keep denied · Escalate to Security · ⋯

**5. Medium · Door held open · Dock 3 · started 9:10:30 AM**

- Summary: "Held open 4m 12s. Limit is 2 min outside the scheduled delivery window." The duration counts up. When motion is reduced, it updates at most every 15 seconds and is announced only on request.
- Why:
  - Policy "Dock 3: 2 min hold limit outside delivery windows" (v1).
  - Signals: door position OPEN; dock motion sensor active; no scheduled delivery 9:00–10:00.
  - Confidence 95% (High).
  - Why it came to you: "Door-held exceptions at docks always go to a person."
- Actions: Allow for 15 min · Request door closed · Escalate to Security · ⋯

**6. Medium · Visitor without invite · Lobby A kiosk · 9:03:47 AM**

- Summary: "Visitor checked in at the kiosk, but no invite was found. Host was notified at 9:03 AM and hasn't responded."
- Visitor: "Chiamaka E. · says visiting Lars Henriksen, Northwind Legal (Floor 11)".
- Why:
  - Policy "Visitors require a host invite" (v4).
  - Signals: kiosk check-in; no matching invite; host notification sent, no reply after 11 min.
  - Confidence: not applicable, because this is a policy rule rather than an inference. Show "Rule-based" instead of a percentage.
- Actions: Issue visitor pass · Decline entry · Escalate to Security · ⋯

**7. Low · Controller on battery power · Parking P1 gate · since 8:51 AM**

- Summary: "Mains power lost. Battery at 64%, about 2h 10m remaining. Gate is processing credentials locally and will fail secure (stay locked) if the battery is depleted."
- Why:
  - Policy "Parking P1: fail-secure on power loss" (v1).
  - Signals: controller input voltage 0 V since 8:51:12; battery 64% and falling ~0.5%/min.
- Actions: Acknowledge · Escalate to Security · ⋯ (overflow: Assign to "Harborview Facilities – Carlos Mendoza", Add note).

### "Handled automatically" lane

**Lane header:** "Handled automatically", count "1,284 today", outcome filter (All / Admitted / Denied / Door & device actions), and a small search field.

**Row anatomy (compact, 2 lines, ~56px):**
- Line 1: time (tabular numerals), outcome badge (icon + label: "Admitted", "Denied", "Relocked", "Alert suppressed") and door.
- Line 2: who or what (masked), credential type, and policy name as a muted link.
- Right edge: confidence "99%" and a chevron that opens the drawer.

**Sample rows (newest first):**

| Time | Outcome | Door | Who / what | Credential | Policy | Confidence |
|---|---|---|---|---|---|---|
| 9:14:08 AM | Admitted | Lobby A turnstile 1 | Priya S. · Kestrel Analytics | Mobile credential ••••2290 | Tenant weekday access | 99% |
| 9:13:40 AM | Denied | Lobby A turnstile 2 | Visitor pass expired (issued Sep 25) · host re-invite sent to Ana Lima, Lumen Biotech | Visitor pass ••••5518 | Visitor pass validity | Rule-based |
| 9:13:02 AM | Admitted | Mailroom | Courier · Northwind Legal delivery | PIN (one-time) | Courier PIN window 8–11 AM | Rule-based |
| 9:12:41 AM | Relocked | Stairwell C, Level 4 | Auto-relock after forced-door event (links to exception #1) | — | Stairwell C egress only | 97% |
| 9:11:30 AM | Alert suppressed | Dock 2 | Door held open during scheduled delivery window 9:00–10:00 | — | Dock 2 delivery schedule | 96% |
| 9:10:15 AM | Admitted | Parking P1 gate | Guadalupe Ramírez-Castellanos de la Fuente · Lumen Biotech (edge case: long name, truncate with tooltip) · "Decided locally, controller on battery" tag | Mobile credential ••••6604 | Tenant parking access | 98% |
| 7:42:19 AM | Admitted | Dock 3 | Pre-registered contractor · Acme HVAC (Rahul M.) · work order window 7:30–11:30 AM | Visitor pass ••••3107 | Contractor pre-registration | 99% |

**Feed length:** the lane holds today's events in a virtualized list and loads earlier events in batches of 200 as the user scrolls. At the bottom: "Showing today only. See full history in the Audit log →".

### Detail drawer: handled item (for example, the 7:42 AM Acme HVAC admit)

- Title: "Admitted · Dock 3 · 7:42:19 AM".
- Sections: What happened · Why the system did this (same structure as exceptions) · Timeline (pre-registration by "Olumide Adeyemi, Harborview Facilities" on Sep 26 → pass issued → credential read 7:42:19 → door unlocked 7:42:20 → door closed 7:42:31) · Decision record ("Decided automatically by SmartAccess · Logged to audit trail AUD-0928-000981").
- **Override area (human override guardrail):**
  - For "Admitted" rows: "Revoke today's access for this credential" and "Flag for review".
  - For "Denied" rows: "Grant one-time entry". Show this only if the person is likely still at the door (within 5 min); otherwise show "Send new invite to host".
  - Every override requires a reason (dropdown: "Policy too strict", "Policy too permissive", "Wrong person identified", "Sensor fault", "Other") plus an optional note. Confirmation text: "This reverses an automatic decision. It will be logged to the audit trail under your name."
  - "Was this decision right? Yes / No" feedback control **[Assumption: operator feedback informs autonomy tuning]**.

### Pause and new-events elements

- **Pause toggle** (page header): "Pause live updates" ⇄ "Resume live updates". When paused, a neutral info bar appears across the top of both lanes: "Live updates paused. New events are waiting below the header. [Resume]".
- **New-events pill:** a floating pill centered under each lane header, for example "↑ 12 new events" (Handled lane) and "↑ 1 new exception" (Needs you lane). If a new item is Critical, the pill reads "↑ 1 new Critical exception", with the critical icon, and is announced assertively.

### Empty-state copy

- **Needs you, empty:** shield-check icon (muted green), "Nothing needs you right now", "The system is handling all activity at Harborview Tower within your policies. Last exception resolved 9:21 AM by Maria Alvarez." No call to action.
- **Needs you, filtered to nothing:** "No exceptions match these filters." with a "Clear filters" link.
- **Handled, empty** (for example, just after midnight): "No access events yet today." with a caption "Events appear here as people use doors."

---

## Visual Specs (placeholder enterprise defaults, pending SmartAccess tokens)

- **Page background:** `#F5F5F5`. **Cards and lanes:** `#FFFFFF`, `1px solid #E0E0E0`, radius 8px, shadow `0 1px 3px rgba(0,0,0,0.08)`. **Drawer:** `#FFFFFF`, shadow `0 4px 12px rgba(0,0,0,0.12)`.
- **Typography:** system font stack `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`. Page title 24px semibold `#212121`. Lane headings 18px semibold. Exception card titles 16px semibold. Body 14px regular. Row metadata and captions 12px `#616161`. Hero KPI number 40px semibold. Other KPI numbers 28px semibold. Use tabular numerals for all times, counts, percentages and credential suffixes.
- **Primary action:** `#1565C0` (white text). **Secondary buttons:** white with `#1565C0` 1px border and text. **Escalate** is a secondary button, not red. Red is reserved for Critical severity and destructive confirmations.
- **Severity badges** (each always includes icon + text label; the card also gets a 4px leading-edge border in the severity color):
  - Critical: `#C62828` on `#FFEBEE`, octagon-alert icon.
  - High: `#8A5300` text on `#FFF8E1`, triangle-alert icon, border `#F57F17`. The default amber `#F57F17` fails 4.5:1 as text on `#FFF8E1`, so a darker text value is used.
  - Medium: `#1565C0` on `#E3F2FD`, circle-info icon.
  - Low: `#616161` on `#F5F5F5`, circle-dot icon.
- **Outcome badges (Handled lane):** Admitted `#2E7D32` on `#E8F5E9` (check icon); Denied `#616161` on `#F5F5F5` (minus-circle icon). Automatic denials are routine, not alarming, so they are not red. Relocked and Alert suppressed use `#616161` on `#F5F5F5` with a lock and bell-off icon respectively.
- **Restricted card:** `#FAFAFA` background, dashed `#BDBDBD` border, lock icon, `#616161` text.
- **Hero KPI card:** `#F3F7FC` background with a 1px `#BBD3EE` border to set it apart from the others without shouting.
- **Audit reinforcement:** a small shield-with-list icon plus "Logged to audit trail" in 12px `#2E7D32`, on every decided card, toast and drawer decision record.
- **Spacing:** 4px base. KPI strip and lanes use a 16px gap. Exception cards have 16px padding and 12px between cards. Handled rows use 8px vertical padding with a `#EEEEEE` divider. Page sections are 24px apart.
- **Radius:** cards and inputs 8px, buttons 6px, badges 4px, avatars full-round (avatars are not used in lanes; initials only in the drawer).
- **Calm rules:** no flashing, pulsing or siren motifs. No full-screen red. No sound by default. The only motion is a 150ms fade/slide for new items (disabled under reduced motion).

---

## Component Specs

- **Site switcher:** dropdown button with a 320px menu, a search input, a scrollable list (max 8 visible) with per-site open-exception count badges, a divider and the disabled "All sites" item with its tooltip reason. States: default, hover, focus, open.
- **KPI card:** min-width 200px, fluid. Contains a label, a large value, a comparison line and an optional sparkline (40px tall). The whole card is clickable where it links (Open exceptions filters the lane; Doors goes to Doors & Devices). Clickable cards show a chevron and a hover border of `#1565C0`. States: default, hover, focus, loading (skeleton), stale (value dimmed to `#757575` with "as of 9:15 AM" appended).
- **Exception card:** fluid width in the lane, min-height 120px collapsed, expands to ~280px with "Why" open. States: default, hover (border `#BDBDBD`), selected (2px `#1565C0` outline, shown in the drawer), deciding (buttons show a spinner, other buttons disabled, "Recording decision…"), decided (collapses to the audit line), failed ("Couldn't record decision. [Retry]" inline in red with an icon), assigned ("Assigned to Carlos Mendoza" chip).
- **Decision buttons:** height 36px, hit area 44×44px minimum, labels never truncated (buttons wrap to a second row if the text expands).
- **Handled row:** full-width button semantics, 56px, hover `#F5F9FF`, selected `#E3F2FD` with a 3px `#1565C0` leading-edge bar, focus ring.
- **Confidence meter:** 80px bar, 6px tall, with the percentage and band as text. Never shown without the text.
- **Pause toggle:** secondary button with pause and play icons. Pressed state `#E3F2FD` background, `aria-pressed`.
- **New-events pill:** 32px tall, `#1565C0` background, white text, 16px radius, shadow `0 4px 12px rgba(0,0,0,0.12)`. The Critical variant uses `#C62828` with the critical icon.
- **Privacy mode toggle:** switch with label "Privacy mode". When on, a persistent 32px banner appears under the top bar: "Privacy mode on. Names and credential details are hidden for screen sharing."
- **Toast:** 360px, auto-dismiss after 8s (pauses on hover and focus), with a "Reverse" action for 30s on access decisions. For example: "Entry approved for Kenji W. at Lobby A turnstile 2 · Logged to audit trail · [Reverse] [View]".

---

## States

- **Loading (first load):** the header and site switcher render immediately. The KPI strip shows 4 skeleton cards. The "Needs you" lane shows 3 skeleton cards (title bar, two text lines, button row). The "Handled" lane shows 8 skeleton rows. There is no spinner overlay.
- **Populated:** as described in Content. 7 exceptions and 1,284 handled events.
- **Empty (Needs you):** the calm "Nothing needs you right now" state. This is the ideal state and should feel like a reward, not a void.
- **Live, paused:** both lanes freeze in place. The info bar is shown, the new-events pills accumulate counts, and KPIs keep updating (they don't move the list). The header status reads "⏸ Paused · 12 new events".
- **Stale: console connection lost** (browser to the SmartAccess server): a warning banner above the lanes with a `#8A5300` / `#FFF8E1` treatment and a cloud-off icon. Text: "Connection lost. Showing activity as of 9:14:32 AM. Doors keep enforcing policy locally. Reconnecting in 10s… [Retry now]". The live indicator changes to "○ Offline · last update 9:14:32 AM". Decision buttons are disabled with the tooltip "Can't record decisions while disconnected." Reason: decisions must reach the audit trail. **[Open question: should decisions queue locally instead?]** KPIs are dimmed with an "as of" time.
- **Partial: edge controller unreachable** (realistic, because the platform runs on internal networks with no IP exposure, so site links and controllers can drop):
  - The Doors KPI shows the offline count.
  - A Device & power exception card appears: "Dock 4 controller unreachable since 8:47 AM. The door is enforcing its last synced policy locally. Events from this door will appear when the connection returns."
  - After reconnection, the Handled lane shows a sync note: "Synced 14 events from Dock 4 (8:47–9:02 AM)". Those rows carry a "Recorded offline" tag. **[Assumption: controllers decide locally and sync later]**
- **Partial: KPIs unavailable:** a KPI card shows "—" with "Metric temporarily unavailable. [Retry]". The lanes still work.
- **Error (lane failed to load):** an inline error inside the lane: "Couldn't load exceptions. [Retry]". The other lane stays usable.
- **Decision failed:** inline on the card, "Couldn't record decision. Nothing was changed at the door. [Retry]". Focus stays on the card.
- **Permission-restricted:**
  - Operations: sees the restricted card for security-classified events. Camera stills are not rendered. "View policy" is read-only, with no "Edit policy". "Escalate to incident" is not shown. Overrides of security-classified automatic decisions are hidden.
  - Security: sees everything.
  - Any role without decision rights **[Assumption: e.g., a front-desk viewer]**: cards show but the action row is replaced by "View only · Ask an Operations or Security admin to decide."
- **Edge cases:**
  - 50+ open exceptions: the lane header shows "50+" and a banner offers "Filter by severity" (the system should rarely get here; if it does, it is a signal to review policy, so link "Review autonomy settings").
  - Long names and door names ("Guadalupe Ramírez-Castellanos de la Fuente", "Riverside Commerce Center, East Wing Loading Dock 12 roll-up door") truncate with an ellipsis and a full-text tooltip.
  - An exception resolved by another user while this user is viewing it: the card updates to "Resolved by David Okafor at 9:16 AM" and the buttons disappear.
  - Door held open with a counter running past 1 hour.
  - 0 events today.
  - 100% autonomy rate (show "100%", no confetti).

---

## Interactions

- **Decision buttons:** one click commits the decision immediately (people may be waiting at a door). The card shows "Recording decision…", then collapses to the audit line. A toast confirms and offers **Reverse** for 30s. Reversing is itself a logged decision; nothing is silently undone.
- **Decisions that require a note:** "Mark resolved" on a Forced door opens a small inline note field (required, min 10 chars) with a "Mark resolved" confirm button.
- **Escalate to Security:** a popover to choose the recipient (default: "Security on-call · David Okafor"), an optional note and a Send button. For Security users there is also "Escalate to incident", which opens the incident flow (separate screen, out of scope).
- **Assign:** searchable people picker (site team). The assigned person's name appears as a chip on the card.
- **Add note:** inline text area. Notes appear in the drawer timeline and are logged.
- **"Why the system did this":** a disclosure toggle, with state remembered per session. A user preference, "Always expand Why", lives in the overflow.
- **Card title or handled row click:** opens the detail drawer. Focus moves into the drawer title. Escape or Close returns focus to the originating card or row.
- **Pause live updates:** manual toggle (keyboard: `P`). It also **auto-pauses** when the pointer or keyboard focus is inside the "Needs you" lane, when a card's "Why" is expanded, or when the drawer is open. It auto-resumes 5s after focus and pointer leave, unless the user paused manually. When auto-paused, the status reads "⏸ Paused while you work". Exceptions already on screen never reorder while paused. New ones wait behind the pill.
- **New-events pill:** click to insert the waiting items, scroll the lane to the top and announce "12 new events loaded". Resolved-elsewhere updates are the only changes applied in place while paused, because acting on an already-resolved item is worse than a small change.
- **Site switcher:** switching sites keeps filters and replaces lane contents. If the user has an open note draft, a "Discard note?" confirmation appears first.
- **Privacy mode:** toggled in the top bar (keyboard: `Shift+P`). It persists for the session and applies immediately to all names, credential suffixes and the drawer.
- **Reveal (outside privacy mode):** masked full names show a "Reveal" eye icon in the drawer. Each reveal is logged ("Name revealed by Maria Alvarez").
- **Filters:** severity chips, type, door or zone, and "Assigned to me". Active filters show as removable chips with "Clear all". Filter state is kept in the URL for sharing and deep links.
- **Keyboard shortcuts** (listed under `?`):
  - `J` / `K`: next / previous exception
  - `Enter`: open drawer
  - `W`: toggle Why
  - `A`: Approve slot, `D`: Deny slot, `E`: Escalate
  - `N`: add note, `G` then `H`: focus the Handled lane
  - `Esc`: close popover or drawer
  - Shortcuts are disabled while typing in inputs. Single-key decision shortcuts are **off by default** and enabled in preferences, to prevent accidental decisions.
- **Tab order:** top bar → page header controls → KPI cards → Needs you lane header → cards (within a card: title, Why toggle, action buttons, overflow) → Handled lane header → rows → drawer (when open, focus is trapped inside it).

---

## Accessibility (WCAG 2.2 AA minimum)

- **Contrast:**
  - `#212121` on `#FFFFFF` ≈ 16:1. `#616161` on `#FFFFFF` ≈ 6.2:1.
  - `#1565C0` on `#FFFFFF` ≈ 5.8:1, and white on `#1565C0` passes.
  - `#C62828` on `#FFEBEE` ≈ 5:1. `#8A5300` on `#FFF8E1` passes 4.5:1 (default `#F57F17` does not; do not use it for text). `#2E7D32` on `#E8F5E9` passes 4.5:1.
  - Severity border and pill colors meet 3:1 for UI components.
- **Color independence:** every severity, outcome, connection and live state pairs color with an icon **and** a text label. Confidence always shows a percentage and a band word. KPI trends use words ("faster", "▲ 1.6 pts").
- **Landmarks:** `banner` (top bar), `navigation` (sidebar), `main` (page), with two labeled `region`s ("Needs you, 7 exceptions" and "Handled automatically"), `complementary` for the drawer (a `dialog` when it overlays), and `status` / `alert` live regions.
- **Structure:** lanes are lists (`<ul>`). Each card is an `<article>` with a heading (h3) naming severity, type and door. The "Why" disclosure uses `aria-expanded`. The Handled feed uses `role="feed"` with `aria-busy` during loads.
- **Live regions:**
  - Polite: "1 new exception", "12 new events waiting", "Entry approved, logged to audit trail", "Live updates paused".
  - Assertive only for new Critical exceptions and connection lost.
  - Announcements are batched to at most one every 5s. The Handled lane's routine events are **never** auto-announced; only the pill count is.
- **Focus management:** after a decision, focus moves to the next card's title (or to the empty-state heading). Drawer open moves focus to its title; close returns it to the trigger. On a failed decision, focus goes to the inline error. Focus ring: `2px solid #1565C0`, 2px offset, never removed.
- **Target size:** all interactive elements are at least 44×44px, including chips, pill, toggles and row chevrons.
- **Motion:** the only motion is new-item fade/slide and drawer slide. Under `prefers-reduced-motion`, items appear instantly and the held-open counter updates in 15s steps. No information is conveyed only by animation.
- **Timing (WCAG 2.2.1):** the 30s Reverse window is also available afterwards through the drawer ("Reverse decision"), so no one loses the ability to act because of time. Toasts pause on hover and focus.
- **Screen-reader order** matches visual order: KPIs → Needs you → Handled.

---

## Privacy & Data Sensitivity

- **Default masking:** occupants and visitors show as given name + family initial ("Kenji W."). Credential IDs always show only the last 4 ("••••4821"). Visitor phone numbers and emails never appear on this screen.
- **Privacy mode (screen sharing):** names become role + tenant ("Employee · Castellan Insurance", "Visitor · host at Northwind Legal"). Credential suffixes are hidden. Camera stills are hidden even for Security. The persistent banner stays visible so the presenter knows it is on.
- **Reveal logging:** revealing a full name is a logged action.
- **Data classification:** security-classified events carry a "Security-classified" tag, and the drawer footer shows "Internal · Confidential".
- **Session timeout:** 2 minutes before timeout, a warning appears: "Your session ends in 2:00. [Stay signed in]". Unsaved notes are kept as drafts.
- **Open question:** local privacy regulations (for example GDPR for EU sites) and whether biometrics are ever shown. The brief flags biometric privacy as an open regulatory question.

---

## Internationalization

- **Text expansion (30–40%):** decision button labels ("Grant one-time entry" becomes "Einmaligen Zutritt gewähren") wrap to a second row rather than truncate. KPI labels wrap to 2 lines. Lane titles and badges use flexible widths. Exception summaries wrap. Only names and door names truncate (with a tooltip).
- **RTL:** the whole layout mirrors. "Needs you" lane is on the right, the drawer opens from the left, the toast is bottom-right, and the leading-edge severity border moves to the right. The new-events arrow stays "↑" (vertical). Trend arrows are vertical and do not flip. Chevrons flip.
- **Locale formats:**
  - Times use the site's time zone, not the viewer's, and the time zone is shown in the header ("EDT"). Use 12h or 24h per the user's locale (for example "9:08 AM" or "09:08").
  - Dates include the year in drawers and audit lines ("Sep 27, 2026" / "27.09.2026").
  - Percentages and counts use locale separators ("1,284" / "1.284"; "96.8%" / "96,8 %").
  - Durations are localized ("4 min 12 s").
- **Names:** support any script and order (for example "Tanaka Yuki" family-first). Mask by the name field the system holds, not by guessing initials from position. **[Assumption: the directory stores given and family names separately]**
- **Icons:** culturally neutral shields, locks, doors and alerts. No thumbs-up for "Mark as legitimate".

---

## Responsive Behavior

- **Desktop (1440px+):** full layout. Sidebar expanded, 4 KPI cards in a row, lanes split 7/5, drawer overlays the Handled lane.
- **Laptop (1024–1439px):** sidebar collapses to the 64px rail. KPI cards shrink (hero keeps its width priority, and sparklines hide below 1280px). Lanes split 7/5 down to 1280px. **From 1024 to 1279px, the lanes become tabs:** "Needs you (7)" (default) and "Handled automatically (1,284)". The drawer is 420px.
- **Tablet (768–1023px):** best effort. KPI strip is 2×2, lanes are tabs, the drawer is full width. **[Open question: is a tablet or mobile triage view needed for on-the-move property managers? Likely a separate prompt.]**
- **Below 768px:** not supported on this screen. Show "This console is designed for screens 1024px or wider."

---

## What NOT to Include

- **No policy editing.** Link to Access Policy & Autonomy Controls only; no inline rule or threshold editors.
- **No live video or video walls.** Security gets a single static still frame per event, nothing streaming.
- **No energy, HVAC, water or maintenance widgets** (Phase 2–3 scope).
- **No portfolio rollup or cross-site analytics.** The site switcher only anticipates it with a disabled "All sites" item.
- **No reports, charts beyond the single KPI sparkline, or export and download.** Full history lives in the Audit Log screen.
- **No map or floor-plan view.**
- **No chat or messaging panel.**
- **No gamification or celebratory animations.**
- **No red alarm banners for routine automatic denials.**

---

## Assumptions & Open Questions (for the reviewer, not the design tool)

1. **Per-type verbs vs. a literal "Approve / Deny / Escalate".** The prompt uses type-specific verbs in fixed slots, because "Approve" is meaningless for a forced door or a power warning. Confirm with the team.
2. **What Operations sees of security-classified events** (restricted placeholder vs. count only vs. nothing).
3. **Offline decisions.** Should console decisions queue while disconnected, or be blocked, as in this prompt, to keep the audit trail authoritative?
4. **Edge controllers decide locally and sync later** is assumed from "internal networks with no IP exposure" and "edge AI". Verify the architecture.
5. **Confidence bands and per-door auto-action thresholds** are illustrative. The real values belong to the Autonomy Controls screen.
6. **Tenant roster integration** (used in the badge-denied example) and **operator feedback ("Was this right?") informing autonomy tuning** are not in the brief.
7. **Reverse window of 30s plus a permanent "Reverse decision" in the drawer.** Confirm with Security that reversing a grant after the fact is meaningful (for example, revoking the day's access).
8. **Firm and site names** (Meridian Property Partners, Harborview Tower and the others) and all people are fictitious placeholders.
9. **Colors are enterprise defaults.** Replace them when SmartAccess tokens exist. Note the darker amber text value chosen to pass contrast.
