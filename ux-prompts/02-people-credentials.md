# UX Prompt 02: People & Credentials

*As of 2026-10-06 · Draft v0.1 · Works in Google Stitch or Figma AI (structured default format)*

> **Design system notice:** SmartAccess still has no `design.md`, but the built console now has **real tokens in `web/src/index.css`** (a dark-only palette read off the Figma "Live Activity Console" frame: near-black surfaces, a violet brand, Geist type). This prompt uses those values, **not** the light, blue-primary placeholders in prompt 01. The built Live Activity screen already uses the dark tokens, so this screen will match it. Prompt 01's Visual Specs should be updated to match. Token names are given next to each hex value so the design tool and the code stay aligned.
>
> **Grounding:** `01-strategic-overview.md`, `02-personas-jtbd.md`, `03-competitive-analysis.md`, `ux-prompts/01-live-activity-exceptions-console.md`, and the domain types in `web/src/types/index.ts` (`Person`, `Credential`, `CredentialKind`). SmartAccess is fictitious. Anything these sources don't state is marked **[Assumption]**. Fields that extend the existing types are marked **[Assumption: type extension]**. All building, tenant and person names are invented. People who also appear in the Live Activity mock data (Tomás Reyes, Kenji Watanabe, Dmitri Volkov, Guadalupe Ramírez-Castellanos de la Fuente, Rahul M., Priya S.) keep the same organizations and credentials here, so the two screens tell one story.

---

## Screen: Site Console > People & Credentials

This is the directory of everyone who can get into one building. It shows each person's **credentials** (badges, mobile credentials, PINs, biometrics, contractor QR passes) and **what they can access** (access groups, schedules, and an answer to "can this person open this door, and why?"). Most changes happen without anyone touching this screen: tenant rosters add and remove people, contractor passes expire on schedule, and lost badges are suspended the moment they are reported. A person only steps in for the few credential problems the system can't settle on its own. The screen applies the product promise to identity: **the people list keeps itself up to date, and you only handle the exceptions.**

**Emotional register:** orderly, trustworthy and quick. The screen is a reference tool used dozens of times a day ("Is Kenji's badge active?", "Why can't the HVAC contractor get into the mechanical room?"), so search and the person detail drawer must be instant and obvious. The small "Needs review" list sits above the directory, presented like Live Activity's "Needs you" lane, as a short to-do list rather than an alarm. Changes that remove access are deliberate and confirmed. Changes that restore access are fast. Optimize for the 100th visit: find a person and answer an access question in under 10 seconds.

---

## Context

- **Application area:** Site Console (per-building) > People & Credentials. The second item in the left nav. The route exists today as a placeholder with the subtitle "Badges, mobile credentials and who can go where".
- **Primary user: Maria Alvarez, Director of Property Operations.** Role: **Operations**. Expert, daily user. She and her front-desk and facilities team use this screen to answer access questions, fix badge problems, onboard building staff and contractors, and clear credential exceptions. She can add and edit people, issue, suspend, replace and revoke badge, mobile, PIN and QR credentials, and assign **standard** access groups. She **cannot** assign restricted access groups (server rooms, security operations, labs marked restricted), **cannot** manage biometric credentials, **cannot** see security-classified review items or events, and **cannot** edit access-group definitions (that's policy).
- **Secondary user: David Okafor, Director of Security & IT.** Role: **Security**. He sees and can do everything Maria can, plus restricted access groups, biometric enrollment, security-classified review items, and the "Manage access groups" link to Access Policy & Autonomy Controls. His jobs on this screen: make sure offboarding actually removed access, approve restricted-zone access, and check who can reach sensitive areas.
- **Tertiary (implied):** front-desk staff with a view-only role **[Assumption: view-only role, as in prompt 01]**. They look up people and credential status but can't change anything.
- **Entry points:**
  - The "People & Credentials" nav item.
  - Global search in the top bar: choosing a person result opens this screen with that person's drawer open.
  - From Live Activity: a person's name in an exception card or a handled row, or the "View person" overflow action, deep-links here with the drawer open on the Credentials tab **[Assumption: cross-link]**.
  - From a notification such as "Contractor access for Dmitri Volkov expires tomorrow" **[Assumption]**.
- **Task:** Find a person and check their status. Fix a credential (renew, replace, suspend, revoke). Grant or remove access. Add a building-staff member or contractor. Clear the "Needs review" list.
- **Next action:** Go back to Live Activity (often via the "Also open in Live Activity" link). Go to Access Policy & Autonomy Controls to change what an access group contains. Go to the Audit Log for a person's full history beyond 30 days.
- **Device:** Desktop-primary (designed at 1440px, supported down to 1024px). Often open at the front desk and sometimes screen-shared with tenant admins. Privacy mode matters here even more than on Live Activity, because this screen is a list of named people.

---

## Layout

**App shell (identical to prompt 01 and the built console)**

- **Left sidebar** (256px, collapsible to a 64px icon rail). Brand block "SmartAccess / SITE CONSOLE" with a shield icon. Small uppercase "NAVIGATION" label. Items with icon + label: Live Activity (with live status dot), **People & Credentials (active: 2px violet leading-edge bar, `--surface-5` fill)**, Visitors, Doors & Devices, Access Policy & Autonomy, Audit Log. User card at the bottom: initials avatar, "Maria Alvarez", "Operations · Meridian".
- **Top bar** (56px): site switcher "Harborview Tower ▾" with the secondary line "200 Harbor Street · Boston, MA · EDT"; global search ("Search people, doors, events…"); **Privacy** toggle (eye-slash icon + "Privacy" label); notification bell; help (`?`); account menu.
- **Main content area:** `--background` `#0C0C0F`, max-width 1440px, 24px page padding.

**Main content, top to bottom**

1. **Page header row.** Left: title "People & Credentials" and subtitle "Badges, mobile credentials and who can go where". Right, in this order:
   - A **roster sync status chip**: "Tenant rosters · 4 of 4 synced · 6:00 AM" with a check icon. It opens a popover listing each roster **[Assumption: tenant roster integration, as in prompt 01]**.
   - Secondary button "View access groups". Its label is "Manage access groups" for Security. It opens Access Policy & Autonomy Controls in a new tab.
   - Primary button "Add person".

2. **Summary strip.** One row of 3 cards on the 12-column grid, 16px gaps, column spans 5 / 4 / 3.
   - **Card 1, Kept current automatically (hero, 5 columns).** Large number "41", label "credential changes handled automatically in the last 7 days", breakdown line "26 mobile credentials issued from tenant rosters · 11 revoked on offboarding · 4 contractor passes expired on schedule". Caption: "0 needed a person." This card is the visual anchor of the strip: largest number, subtle brand-tinted background.
   - **Card 2, Active credentials (4 columns).** "2,411" with a text breakdown (no chart): "Mobile 69% · Badge 26% · QR pass 3% · PIN & biometric 2%", and a second line "for 1,912 people".
   - **Card 3, Needs review (3 columns).** "5" with a segmented row "1 High · 2 Medium · 2 Low". Each segment has a severity icon and label. Clicking the card moves focus to the Needs review section.
   - Caption under the strip, right-aligned: "As of 9:15 AM EDT · Updates every 60s".

3. **"Needs review" section (full width, collapsible).** Header: "Needs review" with count badge "5", subtext "Credential problems the system routed to a person. Everything else is kept up to date automatically.", and a collapse chevron (state remembered per user). Shows the top 3 items as compact expandable rows (~64px each), sorted by severity and then age, with "Show 2 more" at the bottom. Same card anatomy and fixed action slots as Live Activity's "Needs you" lane, in a denser form.

4. **Directory.** A full-width table card that fills the remaining height, with a sticky toolbar and a sticky column header.
   - **Toolbar row 1:** a large search field (left, ~480px): "Search by name, email, organization or last 4 digits of a credential". A person-type segmented control: "All 1,912 · Tenant employees 1,684 · Building staff 46 · Contractors 182".
   - **Toolbar row 2:** filter dropdowns (Organization, Credential status, Credential type, Access group, Source), a "Columns" chooser, a density toggle (Comfortable / Compact), and the result count "Showing 1–50 of 1,912".
   - **Active filters bar** (only when filters are applied): removable chips plus "Clear all".
   - **Table**, then **pagination** (50 / 100 / 200 per page, server-side).
   - **Bulk action bar:** sticky at the bottom of the table card when 1 or more rows are selected.

5. **Person detail drawer (on demand).** A 560px drawer from the right that overlays the directory (it doesn't push it), so the list keeps its scroll position. Tabs: Credentials · Access · Activity · History. It opens on row click and closes with Escape. Next/previous arrows in the drawer header step through the current result list.

6. **Add person drawer.** Same 560px drawer, form content (see Content).

7. **Toast region.** Bottom-left in LTR, bottom-right in RTL, as in prompt 01.

---

## Content

### Data model used by this screen

These fields are consistent with `web/src/types/index.ts`:

- **Person:** `givenName`, `familyName`, `roleLabel` (shown instead of the name in privacy mode, for example "Tenant employee", "IT contractor"), `org` (optional).
- **Credential:** `kind` (one of `badge`, `mobile`, `biometric`, `pin`, `visitor-pass`, `qr-pass`), `last4` (optional; **only the last 4 ever leave the backend, so the UI never offers "reveal full number"**), `note` (optional, for example "pre-registered", "one-time").
- **Kind labels:**

| `kind` | UI label | Icon |
|---|---|---|
| badge | Badge | id-card |
| mobile | Mobile credential | smartphone |
| biometric | Biometric | fingerprint |
| pin | PIN | keypad (grid of dots) |
| qr-pass | QR pass | qr-code |
| visitor-pass | Visitor pass | ticket. **Not managed here**; visitor passes live on the Visitors screen. A person's history may still list one. |

**[Assumption: type extensions]** The screen also needs these fields, which aren't in the types yet:

- **Person:** `id` ("PER-008812"), `personType` (tenant-employee / building-staff / contractor), `status` (active / pending-activation / suspended / offboarded), `source` (tenant-roster / manual / contractor-pre-registration), `sponsor` (for contractors), `email` and `phone` (masked), `accessStart` and `accessEnd`, `accessGroups[]`, `nameOrder` (given-first / family-first).
- **Credential:** `id`, `status` (active / expiring / expired / suspended / lost-reported / revoked / pending-activation), `issuedAt`, `expiresAt`, `lastUsedAt` and `lastUsedDoor`, `device` (for mobile), `syncState` (applied to N of M doors).
- **Access group:** `name`, `doors[]`, `schedule`, `restricted` (boolean), `grantedBy`, `grantedAt`, `expiresAt`. Access groups are **defined** on Access Policy & Autonomy Controls and only **assigned** here.

### Roster sync popover

| Roster | People | Last sync | Status |
|---|---|---|---|
| Kestrel Analytics | 512 | Today 6:00 AM | ✓ Synced · 3 added, 1 removed |
| Castellan Insurance | 698 | Today 6:00 AM | ✓ Synced · 0 changes |
| Lumen Biotech | 262 | Today 6:00 AM | ✓ Synced · 2 added |
| Northwind Legal | 212 | Today 6:00 AM | ✓ Synced · 0 changes |

Footer: "Building staff and contractors are added in SmartAccess. Rosters sync daily at 6:00 AM EDT."

### Needs review (5 items; Maria sees 4 in full plus 1 restricted)

Row anatomy (collapsed, ~64px): severity badge (icon + label) · title (14px semibold) · person (name · org) · one-line summary · age ("2h ago") · action buttons in fixed slots. Expanding a row reveals **"Why this needs you"**, with the same structure as prompt 01's "Why the system did this": policy applied (name + version, "View policy" link), signals, confidence or "Rule-based", why it came to you, and what was already done automatically.

**Fixed action slots** (positions never change, as in prompt 01): **Approve slot · Deny slot · Ask slot · overflow (⋯: Assign, Add note, Open person)**. Labels are verbs specific to each item type. A slot with nothing meaningful to do is left out rather than disabled.

**1. High · Restricted access extension · Dmitri Volkov · IT contractor · sponsored by Castellan Insurance**
- Security sees:
  - Summary: "Castellan Insurance asked to extend 'Server rooms – Tier 2' access from Oct 7 to Nov 6, 2026."
  - Requester: "Hannah Becker, IT Manager, Castellan Insurance".
  - Why:
    - Policy "Restricted zones: Security approves every grant and extension" (v2).
    - Signals: work order CAS-IT-2291 runs to Nov 6, 2026 **[Assumption: work-order reference]**; 14 server-room entries in 30 days, all within the 7 AM–7 PM window; 1 denied attempt today outside the window at 9:05 AM (links to the Live Activity event).
    - Confidence: Rule-based.
    - Why it came to you: "Restricted-zone access changes always need a Security approval."
  - Actions: **Approve extension** · **Let it expire Oct 7** · **Ask sponsor** · ⋯
- Operations sees a **restricted row**: lock icon, "Security-reviewed access request · Contractor sponsored by Castellan Insurance", and "Routed to the Security team. Details are limited to Security roles." No actions. **[Open question carried from prompt 01: should Ops see a placeholder at all?]**

**2. Medium · Roster and badge disagree · Kenji Watanabe · Castellan Insurance**
- Summary: "Badge ••••4821 expired Oct 5, 2026, but the Castellan roster lists Kenji as active. Denied 3 times this morning."
- Link: "Also open in Live Activity as 'Badge denied 3 times' (EXC-4463). Deciding here resolves both."
- Why:
  - Policy "Expired credentials: deny and route when roster disagrees" (v1).
  - Signals: badge status Expired Oct 5, 2026; Castellan roster Active (synced 6:00 AM); 3 denied attempts at Lobby A turnstile 2 between 8:58 and 9:04 AM.
  - Confidence: Rule-based.
  - Why it came to you: "The badge and the tenant roster disagree, so a person must decide."
- Actions: **Renew badge to Jan 3, 2027** (default 90 days; the date is editable in a popover) · **Keep expired** · **Ask Castellan admin** · ⋯ (overflow also has "Issue mobile credential instead").

**3. Medium · Possible duplicate person · Ahmed Al-Rashid / Ahmed Alrashid**
- Summary: "Two records may be the same person: Ahmed Al-Rashid (Tenant employee · Kestrel Analytics, from roster) and Ahmed Alrashid (Contractor · Acme HVAC Services, added manually Sep 30, 2026)."
- Why:
  - Signals: names match after normalization; both mobile credentials are registered to a phone ending 0142; no overlapping access groups.
  - Confidence: 87% · Medium.
  - Why it came to you: "People are never merged automatically."
- Actions: **Compare and merge** (opens a side-by-side compare dialog) · **Keep separate** · ⋯

**4. Low · Unused badge · Wen Li-Hartmann · Lumen Biotech**
- Summary: "Badge ••••1176 hasn't been used in 94 days. Wen uses Mobile credential ••••5021 daily."
- Why:
  - Policy "Dormant credentials: suggest revoke after 90 days" (v1).
  - Why it came to you: "Dormant-badge cleanup is set to 'Suggest only' at Harborview Tower." Add a "Change in Autonomy Controls" link (Security only).
- Actions: **Revoke badge** (opens a confirmation) · **Keep badge** · ⋯

**5. Low · Lost badge reported · Lars Henriksen · Northwind Legal**
- Summary: "Reported lost by Northwind Legal's tenant admin at 8:30 AM."
- Already done automatically: "Badge ••••2207 suspended at 48 of 48 doors at 8:30 AM. Mobile credential ••••8815 still works."
- Actions: **Issue replacement badge** · **Mobile only: revoke badge** · **Ask Northwind admin** · ⋯

**After a decision:** the row collapses to a one-line record, for example "✓ Badge ••••4821 renewed to Jan 3, 2027 by Maria Alvarez · 9:16 AM · Logged to audit trail (AUD-1006-002214)", then leaves the list after 5 seconds (instantly under reduced motion, with focus moving to the next row).

### Directory table

| Column | Width | Content and behavior |
|---|---|---|
| Checkbox | 44px | Row selection. The header checkbox selects the current page; a banner then offers "Select all 1,912 matching". |
| Person | 260px, fluid | Initials avatar (32px), full name (14px medium), and a second line with `roleLabel` · org (12px muted). Names truncate with an ellipsis and a full-name tooltip. Sortable (by family name). |
| Type | 128px | "Tenant employee", "Building staff" or "Contractor" as plain text. Contractors add a second line: "Sponsor: Castellan Insurance". |
| Credentials | 240px | Up to 2 credential chips (kind icon + label + `••••last4` in mono), each with a small state icon if it isn't active, then "+1" overflow. A person with no credential shows "No credential" in muted text. |
| Access | 220px, fluid | Access-group names separated by " · ", truncated, then "+2". Restricted groups show a lock icon. Operations sees a restricted group's name but not the doors it contains. |
| Status | 168px | Status badge (icon + label; see Visual Specs). Sortable. |
| Last access | 168px | Line 1: time or date (for example "9:08 AM" or "Oct 2, 2026"). Line 2: outcome and door ("Admitted · Lobby B turnstile"). "Never" if there is no access yet. Sortable. |
| Source | 160px | **Hidden by default**; turned on with the Columns chooser. Values: "Kestrel roster", "Added by Olumide Adeyemi", "Contractor pre-registration". |
| Actions | 48px | Kebab menu: Open, Suspend all credentials, Add credential, Add access group, Copy person ID. Security also gets "View in Audit Log". |

**Sample rows (sorted by Last access, newest first; Maria's view, privacy mode off):**

| Person | Type | Credentials | Access | Status | Last access |
|---|---|---|---|---|---|
| Priya Shah · Operations lead · Kestrel Analytics | Tenant employee | Mobile ••••2290 | Kestrel – Staff · Tenant parking | Active | 9:14 AM · Admitted · Lobby A turnstile 1 |
| Guadalupe Ramírez-Castellanos de la Fuente · Senior research scientist · Lumen Biotech *(long name, truncates)* | Tenant employee | Mobile ••••6604 · Badge ••••1902 · +1 (Biometric) | Lumen – Staff · 🔒 Lumen – Lab 9B · +1 | Active | 9:10 AM · Admitted · Parking P1 gate |
| Tomás Reyes · Tenant employee · Kestrel Analytics | Tenant employee | Mobile ••••7731 | Kestrel – Staff · Tenant parking | Active, plus an "Open exception" link chip pointing to Live Activity (possible tailgating) | 9:08 AM · Admitted · Lobby B turnstile |
| Dmitri Volkov · IT contractor · Castellan Insurance | Contractor · Sponsor: Castellan Insurance | Badge ••••0917 | Castellan – Contractor (Floor 7) · 🔒 Server rooms – Tier 2 | Expires tomorrow · Oct 7, 2026 | Operations sees "Restricted event · details limited to Security". Security sees "9:05 AM · Denied · Server Room 2F". |
| Kenji Watanabe · Tenant employee · Castellan Insurance | Tenant employee | Badge ••••4821 (expired icon) | Castellan – Staff | Expired · roster says active | 9:04 AM · Denied · Lobby A turnstile 2 |
| Carlos Mendoza · Facilities technician · Harborview Facilities | Building staff | Badge ••••5560 · PIN (Mailroom & docks) | Facilities – Common areas · Docks · Mechanical rooms | Active | 8:52 AM · Admitted · Mechanical room B1 |
| Rahul Mehta · HVAC technician · Acme HVAC Services | Contractor · Sponsor: Harborview Facilities | QR pass ••••3107 (pre-registered) | Contractor – Dock 3 & Mechanical 22F (today 7:30–11:30 AM) | Expires today · 11:30 AM | 7:42 AM · Admitted · Dock 3 |
| Lars Henriksen · Partner · Northwind Legal | Tenant employee | Mobile ••••8815 · Badge ••••2207 (suspended icon) | Northwind – Staff · Tenant parking | Active · 1 credential suspended | Oct 5, 2026 · Admitted · Lobby A turnstile 1 |
| Tanaka Yuki · Associate · Northwind Legal *(family-name-first order)* | Tenant employee | Mobile (invite sent Oct 5, not activated) | Northwind – Staff | Pending activation | Never |

**Offboarded people** are hidden by default and shown with the "Include offboarded" option in the Status filter. Example row: "Sofia Brandt · Kestrel Analytics · Offboarded Oct 3, 2026 (removed from roster) · 2 credentials revoked automatically".

**Filter options:**
- Organization (multi-select with search; tenants, Harborview Facilities and contractor firms)
- Credential status (Active, Expiring within 14 days, Expired, Suspended, Lost reported, Pending activation, Revoked)
- Credential type (the kinds above, excluding visitor pass)
- Access group (multi-select with search; restricted groups are listed for Security only)
- Source (Tenant roster, Added manually, Contractor pre-registration)

### Person detail drawer (Tomás Reyes example)

**Header:**
- Initials avatar, name "Tomás Reyes" (20px semibold), "Tenant employee · Kestrel Analytics".
- Status badge "Active".
- Meta line: "PER-008812 · From Kestrel Analytics roster · last synced today 6:00 AM".
- Masked contact line: "t•••••@kestrel-analytics.com · •••-•••-4410", with a "Reveal" eye button. Each reveal is logged.
- Header actions: "Suspend access" (secondary) and ⋯ (Offboard person, Copy person ID).
- Next/previous arrows and Close.
- Banner when relevant: "1 open exception in Live Activity · Possible tailgating at Lobby B turnstile, 9:08 AM → View".

**Credentials tab:**
- One card per credential, active first.
- Example: "Mobile credential ••••7731 · Active · Phone wallet key on iPhone · Issued Mar 2, 2026 from Kestrel roster · No expiry while on roster · Last used today 9:08 AM at Lobby B turnstile · Applied to 48 of 48 doors" **[Assumption: device and wallet detail]**.
- Card actions: Suspend · Replace · Revoke (destructive, in the overflow).
- Expired credentials offer "Renew". Suspended credentials offer "Restore".
- Below the cards: "Add credential ▾" (Badge, Mobile credential, PIN, QR pass for contractors; Biometric for Security only).
- **Biometric card**, Guadalupe example. Security sees: "Biometric · Fingerprint · Enrolled Jan 14, 2026 by David Okafor · Template stored encrypted on the Lumen Lab 9B controller only · Never shown or exported". Operations sees: "Biometric · Managed by Security". **[Assumption: on-device template storage; the brief lists biometric privacy as an open regulatory question]**. No images or templates are ever displayed.

**Access tab ("who can go where"):**
- **Access groups list:** each row shows group name, doors count, schedule, granted by and expiry. Examples:
  - "Kestrel Analytics – Staff · 9 doors (Lobby A & B turnstiles, Elevator bank B, Floors 14–15 suite doors) · Every day 5:00 AM–11:00 PM · From Kestrel roster · No expiry"
  - "Harborview – Tenant parking · 1 door (Parking P1 gate) · 24/7 · From Kestrel parking list · Expires Dec 31, 2026"
- "Add access group" opens a searchable picker. For Operations, restricted groups appear locked with "Security role required". Removing a group asks for a one-step confirmation.
- **Effective access summary**, grouped by zone: "Lobbies & elevators · 5 doors", "Kestrel suite, Floors 14–15 · 4 doors", "Parking · 1 gate". Each zone expands to list its doors, with a "Not allowed" count for context ("38 other doors at this site").
- **"Check a door"** combobox (search across all 48 doors). It returns a plain-language answer with an icon and text label, so the "why" is visible here the same way it is on Live Activity:
  - ✓ "**Allowed now** · Lobby B turnstile · via 'Kestrel Analytics – Staff' (from Kestrel roster, Mar 2, 2026) · Every day 5:00 AM–11:00 PM"
  - ◷ "**Allowed, but not right now** · Floor 15 suite door · schedule allows every day 5:00 AM–11:00 PM; it's outside that window"
  - ⊘ "**Not allowed** · Server Room 2F · requires 'Server rooms – Tier 2' (restricted). Ask Security to grant it."
- **Other sites:** "Also has access at 1180 Mercer Plaza (Kestrel Analytics – Staff) →". This is read-only and links to that site's console **[Assumption: people span sites in the same firm]**.

**Activity tab:** the person's last 30 days of access events, newest first. Example: "9:08:14 AM · Admitted · Lobby B turnstile · Possible tailgating (open exception) → View in Live Activity". Operations sees security-classified events as "Restricted event". Footer: "Showing 30 days. Full history in the Audit Log →".

**History tab:** changes to this person and their credentials. Examples:
- "Oct 3, 2026 · Added to 'Harborview – Tenant parking' · Kestrel parking list sync · SmartAccess"
- "Mar 2, 2026 · Mobile credential ••••7731 issued · Kestrel roster sync · SmartAccess"

Every entry shows its audit ID. Footer: shield icon, "Logged to audit trail", plus a classification tag "Internal · Confidential".

### Add person drawer

- Intro helper: "Most tenant employees are added automatically from tenant rosters. Add people here for building staff, contractors, or tenants without a roster connection."
- **Fields** (visible labels, required fields marked with "Required" text, not only an asterisk):
  - Person type (radio cards: Building staff / Contractor / Tenant employee)
  - Given name, Family name (separate fields, `autocomplete="given-name"` and `"family-name"`)
  - "Show family name first" checkbox (for names like Tanaka Yuki)
  - Organization (combobox)
  - Sponsor (required for contractors; for example "Harborview Facilities – Olumide Adeyemi")
  - Work email (`autocomplete="email"`)
  - Mobile phone (optional; needed to send a mobile credential, `autocomplete="tel"`)
  - Role label, used in privacy mode (for example "HVAC technician")
  - Access groups (multi-select; restricted groups locked for Operations)
  - Access starts / Access ends (end date required for contractors; the default suggestion is the work-order end) **[Assumption: contractors always have an end date]**
  - First credential (Mobile credential invite as the default; Badge "pick up at the Lobby A front desk"; PIN; QR pass for contractors; None for now)
- **Duplicate check** on blur of name or email: an inline notice "A similar person already exists: Ahmed Al-Rashid · Kestrel Analytics. [Open] [Continue anyway]".
- **Footer:** "Add person and send invite" (primary; the label changes with the first-credential choice) and "Cancel".

### Bulk action bar

"3 people selected" · Add access group · Remove access group · Suspend credentials · Send mobile invites · Extend end date (contractors only) · ⋯ (Revoke credentials). Revoking shows a count and uses type-to-confirm (see Interactions).

### Empty-state copy

- **Needs review, empty:** a single calm line in place of the section: shield-check icon, "All credentials are in order. 41 changes were handled automatically this week." No call to action.
- **Directory, new site with no people:** "No people at Harborview Tower yet", "Connect a tenant roster to add tenant employees automatically, or add building staff and contractors yourself." Actions: "Add person" (primary) and "How roster sync works" (link).
- **Search, no results:** "No one matches 'Okafor-Ba'. Check the spelling, or search by the last 4 digits of a credential." Plus a "Clear search" link.
- **Filtered, no results:** "No people match these filters." Plus "Clear filters".
- **Person with no credentials:** in the Credentials tab, "Tanaka Yuki has no active credential. A mobile invite was sent Oct 5, 2026 and hasn't been activated." Actions: "Resend invite" and "Issue badge instead".

---

## Visual Specs (from `web/src/index.css`, dark only)

- **Surfaces** (token → hex):
  - Page `--background` / `--surface-1` `#0C0C0F`
  - Sidebar and table card `--surface-2` `#0F0F12`
  - Cards, inputs and drawer body `--surface-3` `#121215`
  - Secondary buttons, chips, drawer header and popovers `--surface-4` `#18181B`
  - Hover, selected and neutral badges `--surface-5` `#1E1E22`
  - Inset areas (signal lists in "Why", the effective-access list) `--surface-0` `#09090B`
- **Borders:** decorative card and divider borders use `--border` `#27272A`. **Interactive control boundaries** (inputs, checkboxes, radio cards, segmented control) use `#71717A` (the `--sev-low` value) to meet 3:1. `#27272A` is only about 1.3:1 against the surfaces, so it must not be the only edge of a control **[token gap: suggest a `--control-border` token]**.
- **Text:**
  - Primary `--foreground` `#FAFAFA`
  - Secondary `--muted-foreground` `#A1A1AA`
  - Tertiary and captions `--subtle-foreground` `#85858F` (minimum 12px; never used for essential content on `--surface-5`, where it is close to the 4.5:1 limit)
  - Links and brand text `--brand-text` `#C4B5FD`
- **Typography:** Geist Variable (`--font-sans`) for all text. Geist Mono (`--font-mono`) for `••••last4`, person IDs, audit IDs and times in tables. Use tabular numerals everywhere numbers align.
  - Page title 24px semibold
  - Section headings ("Needs review", directory) 16px semibold
  - Drawer person name 20px semibold
  - Table cells 14px, with 12px secondary lines
  - Eyebrow labels 11px bold uppercase, 0.1em tracking, `--subtle-foreground` (as in the sidebar)
  - Hero number 40px semibold; other summary numbers 28px semibold
- **Primary action:** `--brand` `#A78BFA` fill with `--brand-foreground` `#0A0012` text ("Add person", drawer primary buttons). **Secondary:** `--surface-4` fill, `#71717A` 1px border, `#FAFAFA` text. **Destructive confirm:** `--sev-critical` `#EF4444` border with `--sev-critical-fg` `#FCA5A5` text on `--sev-critical-bg` `#3B1111`. Red is used only for destructive confirmations and High/Critical severity, never for routine statuses.
- **Severity badges** (same scale as Live Activity; always icon + label, plus a 3px leading-edge bar on review rows):
  - High: `--sev-high-fg` `#FCD34D` on `--sev-high-bg` (amber 15%), triangle-alert, bar `--sev-high` `#F59E0B`
  - Medium: `--sev-medium-fg` `#7DD3FC` on `--sev-medium-bg` (sky 15%), circle-info, bar `--sev-medium` `#0EA5E9`
  - Low: `--sev-low-fg` `#A1A1AA` on `--surface-5`, circle-dot, bar `--sev-low` `#71717A`
  - Critical is defined (`#FCA5A5` on `#3B1111`, octagon-alert) but isn't expected on this screen.
- **Status badges** (calm by default; most rows are Active, so Active must be the quietest):
  - Active: no fill; check-circle icon in `--ok` `#34D399` and label in `--muted-foreground`.
  - Active · 1 credential suspended: the same as Active, plus a pause icon and secondary text.
  - Expiring (within 14 days, or today): `--sev-medium-fg` on `--sev-medium-bg`, clock icon.
  - Expired: `--sev-high-fg` on `--sev-high-bg`, calendar-x icon.
  - Suspended / Lost reported: `--sev-low-fg` on `--surface-5`, pause-circle icon.
  - Pending activation: `--sev-low-fg` on `--surface-5`, hourglass icon.
  - Revoked / Offboarded: `--subtle-foreground` on `--surface-4`, ban icon.
- **Credential chips:** 28px tall, `--surface-4` fill, `#27272A` border (they are display-only, not controls), kind icon, label, and mono `••••last4`. A state icon at the trailing edge appears when the credential isn't active.
- **Restricted elements:** lock icon, dashed `#71717A` border, `--surface-3` fill, `--muted-foreground` text (the dark equivalent of prompt 01's restricted card).
- **Hero summary card:** `--surface-3` with a brand tint (`#A78BFA` at 8% over the surface) and a 1px `#A78BFA` border at 35% opacity.
- **Audit reinforcement:** shield-with-list icon plus "Logged to audit trail" in 12px `--ok` `#34D399`, on every decided review row, toast and History entry.
- **Spacing:** 4px base. Page sections are 24px apart. Summary cards and the table use 16px gaps. Table rows are 56px (comfortable, two-line person cell) or 44px (compact, one line, with the role and org line moving into a tooltip). Drawer padding is 24px, with 16px between credential cards.
- **Radius:** `--radius` 8px for cards, drawer and inputs; 6px (`--radius-md`) for buttons; 4–5px (`--radius-sm`) for badges and chips; full round for avatars.
- **Shadows:** the drawer and popovers use a dark shadow `0 8px 24px rgba(0,0,0,0.5)` plus their `#27272A` border. Cards have no shadow.
- **Calm rules (from prompt 01):** no flashing or pulsing (the only pulse is the existing Live Activity nav dot), no full-screen red, no sound. Motion is a 150ms fade/slide for the drawer and review-row removal, turned off under reduced motion.

---

## Component Specs

- **Roster sync chip:** 32px tall, icon + text, with a 44px hit area. States: synced (check icon), syncing ("Syncing Kestrel roster…" with a spinner), failed (`--sev-high` triangle-alert icon, "1 roster didn't sync"), focus.
- **Summary card:** min-width 220px, fluid. Label, value, breakdown line. The Needs review card is clickable (chevron, hover border `--brand`). States: default, hover, focus, loading (skeleton), stale (value in `--subtle-foreground`, "as of" time appended).
- **Review row:** collapsed ~64px, expanded ~260px. Its states mirror prompt 01's exception card: default, hover (`--surface-5`), expanded, deciding ("Recording decision…", other buttons disabled), decided (collapses to the audit line), failed (inline error with Retry), assigned (assignee chip), resolved elsewhere ("Resolved by David Okafor at 9:16 AM", buttons removed).
- **Search field:** 40px tall, 44px hit area, search icon, clear button, `/` shortcut hint. Search runs on the server after a 250ms debounce, and "Searching…" appears in the result count. It matches given name, family name, email, organization and `last4` (exact).
- **Segmented control (person type):** 4 segments, each with a label and count, `aria-pressed`. Counts reflow when filters change.
- **Data table:** sticky header (`--surface-4`, 12px semibold uppercase `--muted-foreground`). Row hover `--surface-5`. Selected rows: `--surface-5` with a 3px `--brand` leading-edge bar. The row opened in the drawer gets a 2px `--brand` outline. Sort indicators are arrows with text announced to screen readers. Column widths can be resized and the Columns chooser choice persists per user.
- **Credential card (drawer):** full drawer width, 16px padding. A header row (kind icon, label, mono last4, status badge, overflow), a definition list (Issued, Expires, Last used, Device, Applied to doors), and an action row. States: active, expiring, expired, suspended, revoked (collapsed by default under "Show 3 revoked credentials"), and syncing ("Applying to doors… 31 of 48").
- **Check-a-door combobox:** ARIA combobox with list-box results grouped by zone, typeahead, and a "Recent doors" section. The result block appears below in a `role="status"` region.
- **Access group picker:** popover, 400px, with search, group rows (name, door count, schedule) and restricted rows that are locked with the reason. Selected groups add to the list with an "Unsaved" tag until the user selects "Save changes".
- **Confirmation dialogs:** 480px modal, title, consequence text, a reason dropdown (required for suspend and revoke), an optional note, and the buttons. Type-to-confirm input for bulk revoke and offboarding.
- **Drawer:** 560px (480px at laptop widths). Sticky header with tabs, a scrollable body, and a sticky footer when there are unsaved changes ("Save changes" / "Discard").
- **Toast:** 360px, auto-dismisses after 8s (pauses on hover and focus). Reversible changes get "Undo" for 30s. Example: "Badge ••••2207 suspended for Lars Henriksen · Applied to 48 of 48 doors · Logged to audit trail · [Undo] [View]".

---

## States

- **Loading (first load):** the header, the summary-card frames and the toolbar render immediately. Summary values, review rows (3 skeleton rows) and table rows (12 skeleton rows matching column widths) use skeletons. There is no full-page spinner.
- **Populated:** as in Content: 1,912 people, 5 review items, 50 rows per page.
- **Empty:** a new site, the Needs review list empty, no search results, no filter results, and a person with no credentials, each as described in Content.
- **Change propagating to doors** (this screen's version of "the building handles itself"):
  - After any credential or access change, the affected credential card and the toast show "Applying to doors… 31 of 48".
  - On completion: "Applied to 48 of 48 doors".
- **Partial: a controller is offline** (Dock 4, as on Live Activity):
  - The result reads "Applied to 47 of 48 doors · Dock 4 is offline and will update when it reconnects. Until then it uses its last synced access list." **[Assumption: controllers cache access lists, as in prompt 01]**
  - For **revocations and suspensions**, this is shown as a warning (`--sev-high` treatment): "Dock 4 may still accept badge ••••2207 until it reconnects. [Open Doors & Devices]".
  - For grants it is informational.
- **Partial: a roster sync failed:**
  - Warning banner under the summary strip: "Northwind Legal roster didn't sync at 6:00 AM. Statuses for its 212 people are as of yesterday 6:00 AM. People removed from that roster today still have access until the next successful sync. [Retry sync] [View details]".
  - The roster chip shows "1 roster didn't sync". Affected rows carry a small "Roster stale" tag.
- **Partial: summary unavailable:** the card shows "—" with "Temporarily unavailable. [Retry]". The table still works.
- **Stale: console connection lost:** the same banner pattern as prompt 01: "Connection lost. Showing people as of 9:14:32 AM. Doors keep enforcing their last synced access lists. Reconnecting in 10s… [Retry now]". Every action that changes access is disabled, with the tooltip "Can't change access while disconnected." The directory and drawer stay readable.
- **Error:**
  - Table failed to load: an inline error in the table body, "Couldn't load people. [Retry]". The Needs review section stays usable.
  - Action failed: inline on the card or row, "Couldn't suspend badge ••••2207. Nothing was changed at the doors. [Retry]". Focus moves to the error.
- **Permission-restricted:**
  - **Operations:** restricted review row; restricted access groups shown by name with a lock, but without their door list or an Add option; biometric cards read "Managed by Security"; security-classified events in Last access and Activity read "Restricted event"; "View access groups" is read-only. Operations can't offboard someone who holds a restricted group without Security: the dialog says "Dmitri Volkov has restricted access. Offboarding will notify Security to remove it." **[Assumption]**
  - **Security:** sees and can do everything on this screen.
  - **View-only [Assumption]:** search, the table and the drawer are visible. All action buttons are replaced by "View only · Ask an Operations or Security admin to make changes." Contact details aren't revealable.
- **Edge cases:**
  - Long names ("Guadalupe Ramírez-Castellanos de la Fuente") and long group names ("Riverside Commerce Center – East Wing Loading Dock 12 contractors") truncate with a tooltip.
  - Family-name-first names (Tanaka Yuki) and mononyms (a single-name person shows only `givenName`; `familyName` may be empty) **[Assumption]**.
  - A person with 6 credentials (chips show 2 plus "+4").
  - A person with 12 access groups.
  - A contractor whose access expires in 2 hours (the "Expires today · 11:30 AM" badge).
  - Two people with the same name in different organizations (the org line disambiguates; the duplicate check doesn't fire if the emails differ).
  - A person selected in the drawer gets offboarded by roster sync while the drawer is open: the drawer shows "Removed from Kestrel roster at 9:20 AM · Credentials revoked automatically" and the actions disappear.
  - Selecting all 1,912 people for a bulk action.
  - A `last4` search that matches several people (show all of them).

---

## Interactions

- **Row click** (outside the checkbox and kebab) opens the drawer on the Credentials tab. Focus moves to the drawer title. Escape or Close returns focus to the row. The URL updates (`/people?person=PER-008812&tab=credentials`) for deep links and multi-tab work.
- **Review-row decisions:**
  - Actions that restore or extend access ("Renew badge", "Issue replacement badge", "Approve extension") commit in one click, because people may be waiting at a door. The toast offers Undo for 30s.
  - Actions that remove access ("Revoke badge", "Mobile only: revoke badge") open a confirmation dialog.
  - "Ask [sponsor/admin]" opens a popover with the recipient pre-filled, an optional message and Send. The row then shows "Waiting on Castellan admin · asked 9:16 AM".
- **Suspend credential:** a confirmation with a required reason ("Reported lost", "Left the company", "Security concern", "Other"). It is reversible with "Restore", so there is no type-to-confirm.
- **Revoke credential:**
  - Confirmation text: "Revoke badge ••••4821 for Kenji Watanabe? It stops working at all 48 doors within a few seconds. This can't be undone. To restore access you'll need to issue a new credential." Requires a reason.
  - The button reads "Revoke badge" in the destructive style. Focus starts on Cancel.
- **Offboard person:** removes every credential and access group. Type-to-confirm with the person's full name, plus a summary: "2 credentials and 3 access groups will be removed." People synced from a roster show a hint: "This person is still on the Kestrel roster and may be re-added at the next sync. Ask Kestrel's admin to remove them there."
- **Bulk actions:** select rows with the checkbox, Shift+click for a range, or the header checkbox for the page and then "Select all 1,912 matching". The bar always shows the count. Bulk revoke and offboard need a typed count ("Type 3 to confirm"). Results come back as a summary toast: "Suspended credentials for 3 people · 1 couldn't be changed (restricted) · [View details]".
- **Grant or remove access group:** pick a group in the drawer, then the sticky footer "Save changes" applies it. Navigating away with unsaved changes prompts "Discard changes to Tomás Reyes's access?".
- **Check a door:** choosing a door shows the answer instantly. The last 5 doors checked are remembered per user.
- **Search:** `/` focuses search. Results replace the table, keeping the segment and filters. Enter on a single result opens its drawer.
- **Sorting:** Person (family name), Status, and Last access (the default, newest first). Clicking a column header cycles ascending, descending, then none.
- **Filters:** shown as chips with "Clear all". State lives in the URL.
- **Privacy:** the top-bar toggle (`Shift+P`, as in prompt 01) applies immediately to the table, drawer, review rows and toasts.
- **Live data:** the directory doesn't re-sort or insert rows while the user is looking at it. When roster sync or other users change data, a pill appears above the table, "↑ 3 people updated · Refresh", and is announced politely. Rows that are visible update in place only for status changes, so stale "Active" badges aren't trusted.
- **Keyboard shortcuts** (listed under `?`, disabled while typing):
  - `/`: search
  - `J` / `K`: next / previous row (also in the drawer)
  - `Enter`: open drawer
  - `X`: select row
  - `1`–`4`: drawer tabs
  - `G` then `R`: jump to Needs review
  - `Esc`: close popover, dialog or drawer
  - There are no single-key shortcuts for destructive actions.
- **Tab order:** top bar → page header actions → summary cards → Needs review rows (within a row: expand toggle, action slots, overflow) → search → segments → filters → table (header checkbox, sortable headers, then rows) → pagination. When the drawer is open, focus is trapped inside it (header actions → tabs → tab panel → footer).

---

## Accessibility (WCAG 2.2 AA minimum)

- **Contrast** (approximate, against `--surface-3` `#121215` unless noted):
  - `#FAFAFA` ≈ 17.8:1. `--muted-foreground` `#A1A1AA` ≈ 7.2:1. `--subtle-foreground` `#85858F` ≈ 5.1:1, and ≈ 4.6:1 on `--surface-5`.
  - `--brand-text` `#C4B5FD` ≈ 10:1. `--brand` `#A78BFA` ≈ 6.8:1, and `#0A0012` on `#A78BFA` ≈ 7.6:1.
  - `#FCD34D` on amber-15% ≈ 10:1. `#7DD3FC` on sky-15% ≈ 9:1. `#FCA5A5` on `#3B1111` ≈ 8.7:1. `--ok` `#34D399` as text or icon ≈ 9.7:1.
  - Control borders `#71717A` ≈ 3.8:1 (meets 1.4.11). The focus ring `--ring` `#A78BFA` ≈ 6.8:1 against the surfaces.
  - Verify all of these in tooling before shipping.
- **Color independence:** every severity, status, credential state and "Check a door" answer pairs an icon with a text label. Locks always come with the word "Restricted". Expiry is always written out as text ("Expires tomorrow · Oct 7, 2026").
- **Landmarks:**
  - `banner` (top bar), `navigation` "Main" (sidebar), `main`.
  - Inside `main`: labeled `region`s "Needs review, 5 items" and "People directory".
  - The drawer is a `dialog` with `aria-labelledby` pointing to the person's name.
  - `status` and `alert` live regions.
- **Structure:**
  - The directory is a real `<table>` with `<th scope="col">`, `aria-sort` on sortable headers, and a caption "People at Harborview Tower, 1,912 results".
  - Credential chips are text inside the cell, not separate tab stops. The row's accessible name reads, for example, "Tomás Reyes, Tenant employee, Kestrel Analytics, Mobile credential ending 7731, Active".
  - `••••` is announced as "ending 7731" (visually hidden text), never as "bullet bullet bullet bullet".
  - Review rows are `<article>`s with an h3. "Why this needs you" uses `aria-expanded`.
  - Drawer tabs follow the ARIA tabs pattern (arrow keys between tabs).
- **Live regions:**
  - Polite: "50 results", "3 people selected", "Badge suspended, applied to 48 of 48 doors, logged to audit trail", "3 people updated".
  - Assertive only for "Connection lost" and for a revoke or suspend that couldn't reach a door ("Dock 4 may still accept this badge").
  - Door-sync progress is announced once at start and once at completion, not on every count.
- **Focus management:**
  - After a review decision, focus moves to the next row's title (or the empty-state line).
  - After a revoke, it moves to the next credential card. After offboarding, it moves to the next table row and the drawer closes.
  - Dialogs open with focus on the first field (or on Cancel for destructive dialogs), and return focus to the trigger on close.
  - Focus ring: 2px `--ring` `#A78BFA` with a 2px offset, never removed.
- **Target size:** all controls are at least 44×44px, including checkboxes (the hit area extends to the cell), chips that act as links, the kebab, the drawer arrows and the pagination controls. Compact density keeps 44px rows for this reason.
- **Forms:** visible labels, required fields marked with text, errors shown under the field and linked with `aria-describedby`, and an error summary at the top on submit that links to each field. Validation runs on blur after the first edit. `autocomplete` is set on name, email and phone.
- **Timing:** Undo has a 30s window, and every change can also be reversed later from the drawer (restore, re-grant) or by issuing a new credential, so no one loses the ability to act because of time. Toasts pause on hover and focus.
- **Motion:** only the drawer slide and the review-row collapse. Under `prefers-reduced-motion`, both are instant.
- **Screen-reader order** matches visual order: summary → Needs review → directory → drawer.

---

## Privacy & Data Sensitivity

- **Default display:**
  - This is an administration screen, so full names are shown by default to roles with people-management rights. This differs from Live Activity, which masks to given name + family initial **[Assumption: confirm with Security]**.
  - Email and phone are always masked ("t•••••@kestrel-analytics.com", "•••-•••-4410") and can be revealed one at a time. Each reveal is logged ("Email revealed by Maria Alvarez").
  - Credentials only ever show `last4`; there is nothing more to reveal.
- **Privacy mode (screen sharing):**
  - Names become `roleLabel` · org ("Tenant employee · Castellan Insurance", "HVAC technician · Acme HVAC Services"). Avatars become a generic person icon.
  - `last4` suffixes are hidden (the chip just reads "Badge").
  - Contact details and Reveal buttons are removed.
  - Activity shows doors and times without names. Biometric cards show only "Biometric".
  - Search still works, but results are masked.
  - The persistent banner from the top bar is shown: "Privacy mode is on: names, contact details and credential numbers are hidden."
- **Biometrics:** no templates, images or scores are ever displayed or exported. Only the enrollment fact, date, enrolling user and storage location are shown, and only to Security. **[Open question: biometric regulations (for example BIPA in Illinois, GDPR in the EU) may require a consent record; whether to show "Consent on file · Jan 14, 2026" needs legal input.]**
- **Photos:** no person photos in this version. Initials only. **[Open question: front desks may want badge photos for visual verification; this has privacy and storage implications.]**
- **Data classification:** the drawer footer shows "Internal · Confidential". Restricted access groups carry a "Restricted" tag.
- **Session timeout:** the same as prompt 01. A warning appears 2 minutes before timeout, and unsaved drawer edits and Add person form data are kept as a draft.

---

## Internationalization

- **Text expansion (30–40%):**
  - Credential kind labels ("Mobile credential" → "Mobiler Zugangsnachweis") and status badges ("Pending activation" → "Aktivierung ausstehend") use flexible widths and may wrap to 2 lines in the drawer. In the table they truncate with a tooltip.
  - Review action buttons wrap to a second row rather than truncate. Segment labels and counts may wrap.
  - The person-type segmented control turns into a dropdown if it overflows.
- **RTL:**
  - The whole layout mirrors: the drawer opens from the left, the leading-edge bars and active-nav bar move to the right, chevrons and next/previous arrows flip, and the toast sits bottom-right.
  - Credential suffixes ("••••4821"), person IDs and email addresses are wrapped in bidi isolation so they stay LTR inside RTL text.
  - Example Arabic-script name for testing: "يوسف الحداد · Lumen Biotech".
- **Names:**
  - Given and family names are separate fields, matching the `Person` type. Display order follows the per-person `nameOrder` [Assumption] and the locale ("Tanaka Yuki" family-first).
  - Sorting by family name uses locale-aware collation ("Ramírez" sorts under R; "Åkesson" sorts correctly per locale).
  - Initials avatars use the first grapheme of each name field, not the first byte.
- **Dates, times and schedules:**
  - All times are in the site's time zone ("EDT", shown in the top bar). Dates always include the year in drawers, review rows and history ("Oct 7, 2026" / "07.10.2026").
  - Schedules are localized ("Every day 5:00 AM–11:00 PM" / "Täglich 05:00–23:00"). Weekday ranges respect the locale's first day of the week.
  - Relative times ("Expires tomorrow") always come with an absolute date.
- **Numbers:** counts and percentages use locale separators ("1,912" / "1.912"; "69%" / "69 %").
- **Phone and email masking** works on any format. Mask by character position, keeping the last 4 digits and the email domain.

---

## Responsive Behavior

- **Desktop (1440px+):** the full layout. Sidebar expanded, 3 summary cards, 8 visible columns, 560px drawer overlaying the table.
- **Laptop (1024–1439px):**
  - Sidebar collapses to the 64px rail. The summary strip keeps 3 cards, but the breakdown lines wrap.
  - Below 1280px, the Type column merges into the Person cell's second line and the Access column hides (it stays available in the drawer and the Columns chooser).
  - The drawer is 480px.
- **Tablet (768–1023px):** best effort, read-mostly. Summary cards stack, Needs review stays, and the table shows Person, Status and Last access. The drawer is full width. Bulk actions are hidden.
- **Below 768px:** not supported. Show "People & Credentials is designed for screens 1024px or wider." **[Open question carried from prompt 01: a mobile lookup ("is this person's badge active?") for roaming facilities staff may be worth a separate prompt.]**

---

## What NOT to Include

- **No access-group or policy editing.** No door lists, schedule builders or rule editors here. Groups are assigned on this screen and defined in Access Policy & Autonomy Controls.
- **No visitor management.** No guest invites, visitor passes or kiosk check-ins. Those belong on the Visitors screen. Contractors appear here because they have recurring or work-order access.
- **No door-centric "who can open Server Room 2F" report.** That belongs to Doors & Devices. This screen only answers per-person "Check a door".
- **No live event feed.** Last access and the Activity tab are summaries. Live Activity owns the stream.
- **No badge designer or printing workflow** **[Assumption: badge printing is out of scope for v1]**.
- **No HR fields** (department hierarchy, manager, employee ID, job history) beyond `roleLabel` and organization.
- **No person photos and no biometric images or templates.**
- **No export or download.** Compliance exports belong in the Audit Log.
- **No portfolio-wide people directory.** Other sites appear only as a read-only line in the drawer.
- **No charts, gamification or celebratory animations.**

---

## Assumptions & Open Questions (for the reviewer, not the design tool)

1. **Tokens.** This prompt uses the real dark tokens from `web/src/index.css`, which supersede prompt 01's light placeholders. Prompt 01's Visual Specs should be updated. A `--control-border` token (`#71717A`) is proposed because `--border` `#27272A` fails 3:1 for control edges.
2. **Type extensions.** Person `id`, `personType`, `status`, `source`, `sponsor`, `email`, `phone`, `accessStart` / `accessEnd`, `nameOrder`, `accessGroups`; Credential `id`, `status`, `issuedAt`, `expiresAt`, `lastUsedAt`, `device`, `syncState`; and a new `AccessGroup` type. None of these exist in `web/src/types/index.ts` yet. `Credential.last4` being the only identifier is kept as a hard rule, so there is no "reveal full number" control.
3. **Tenant roster sync** (daily at 6:00 AM, auto-provisioning and auto-revoking) is carried over from prompt 01's assumption. The brief doesn't confirm any HR or roster integration.
4. **Access groups** as named bundles of doors and schedules, with a `restricted` flag that only Security can assign, are not described in the brief. They are inferred from "centralized security policy management" and David's job of "update policy once and have it apply everywhere".
5. **Role split.** Operations can issue, suspend and revoke non-restricted credentials. Security alone handles restricted groups and biometrics. Confirm whether Operations should be allowed to revoke at all, or only suspend.
6. **Full names shown by default here** (but masked on Live Activity). Contact details are always masked.
7. **Controllers cache access lists**, so an offline door may still honor a revoked credential until it reconnects. This follows from "internal networks / edge AI" and prompt 01's offline assumption. Verify the architecture, since it determines how loud the revocation warning should be.
8. **Biometric storage on the controller, consent records and photos** are open regulatory and privacy questions (the brief flags biometric privacy).
9. **Autonomy settings for credential hygiene** ("Dormant-badge cleanup: Suggest only") are assumed to live in Access Policy & Autonomy Controls, alongside the access-event autonomy dial.
10. **Site list mismatch.** Prompt 01 lists 6 Meridian sites (1180 Mercer Plaza, Canal Street Exchange, and others), but the built mock (`web/src/mocks/data/console.ts`) lists Harborview Tower, Riverside Plant 3 and Northgate Logistics Hub. This prompt follows prompt 01 and only references 1180 Mercer Plaza. The two should be reconciled.
11. **All people, tenants, work orders and audit IDs are fictitious.** Kenji Watanabe's badge expiry is dated Oct 5, 2026 to fit this prompt's as-of date. Prompt 01 used Sep 27, 2026, and the mock says "yesterday".
