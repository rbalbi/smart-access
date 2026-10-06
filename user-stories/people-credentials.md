# User Stories: People & Credentials

*Source: SmartAccess-Live-Activity-Console (Figma) · [People & Credentials frame, node 9:2][n9-2] · read 2026-10-06*
*Grounding: `01-strategic-overview.md`, `02-personas-jtbd.md`, `03-competitive-analysis.md`, `ux-prompts/02-people-credentials.md` (the design brief), `web/src/types/index.ts` (domain terms, including the uncommitted People & Credentials types), and `user-stories/live-activity-console.md` (cross-screen dependencies only)*

> **What the design shows.** Frame 9:2 ("Html → Body", 1280 × 1599) is one populated state. Maria Alvarez (Operations) is at Harborview Tower at about 9:15 AM. It shows the page header and roster-sync chip, three summary cards, the "Needs review" list (3 of 5 items visible), the directory with 9 rows (page 1 of 39), and the person drawer open on Tomás Reyes (PER-008812) at the Credentials tab. The file has no other state variants, no prototype links and no designer annotations. The Access Groups, Activity Log and Audit History tabs, the Add person drawer, the bulk action bar, popovers, dialogs, toasts, the Security-role view, privacy-on and all empty, loading and error states appear only in the brief. Stories for those are tagged **Not shown in the design**.
>
> **Live Activity (frame 1:2) is out of scope.** It is covered by `user-stories/live-activity-console.md`, and its STORY-xx IDs are referenced here only where the two screens depend on each other.

## Summary
- **7 epics, 49 stories (31 Must, 17 Should, 1 Could).**
- **In scope:** everything inside node 9:2. That covers the page header, roster sync, summary strip, "Needs review" list, directory toolbar, table and pagination, and the person drawer (header, masked contact, Live Activity banner, tabs, credential card, Add credential, "Check a door" and the sticky footer). It also includes the behaviour the brief specifies for the same screen and that the screen needs in order to work (other drawer tabs, Add person, bulk actions, roles, privacy, states, i18n). Those stories are marked "Not shown in the design".
- **Deliberately out of scope:** the app shell's own behaviour (site switcher, global search, notifications; covered by Live Activity STORY-05 and STORY-06), access-group and policy *definition* (Access Policy & Autonomy screen), the Visitors screen and visitor passes, door-centric "who can open this door" reports (Doors & Devices), the Audit Log screen, badge printing, person photos, exports, and a portfolio-wide directory.
- **Big caveat:** the design's sample data, colors and drawer action model differ from the brief in several places (see Open questions 1–6). Those differences are flagged on the stories they affect instead of being resolved silently.

---

## Epic 1: Trust that the people list keeps itself current
The product promise for identity is "the people list keeps itself up to date, and you only handle the exceptions". Before Maria touches anything, she needs to see that rosters synced, how much changed without her, and how much is left for a person. This is the autonomy proof the strategic overview treats as the core differentiator (§6, "% resolved without human intervention").

### PC-01: See how many credential changes were handled automatically
**As** Maria Alvarez, Director of Property Operations (Operations role)
**I want** to see how many credential changes the system made on its own in the last 7 days, and how many needed a person
**So that** I can trust that onboarding and offboarding happen without my team, and show owners the saving

**Design reference:** [Card 1: Automated changes][n9-57]
**Priority:** Must · **Size:** S
**Dependencies:** none

**Acceptance criteria**
1. **Given** 41 automatic credential changes in the last 7 days, **when** the page loads, **then** the card shows "Kept current automatically", a "7D AUTONOMY" tag, "41", "credential changes handled automatically in the last 7 days" and the breakdown "26 mobile credentials issued · 11 revoked offboarding · 4 passes expired".
2. **Given** none of those changes needed a person, **then** the card shows "0 needed a person" as text, not just as a color.
3. The three breakdown numbers add up to the large number. The 7-day window ends at the "As of" time shown under the strip and is calculated in the site's time zone (EDT).
4. **Given** the breakdown line is wider than the card (for example in German), **then** it wraps instead of being cut off. The design currently clips it with an ellipsis.
5. **Given** the metric service fails, **then** the card shows "—" with "Temporarily unavailable. [Retry]" and the rest of the page still works (brief, **not shown in the design**).
6. Numbers use locale separators ("1,912" / "1.912").

**Out of scope:** drill-down into the individual changes (Audit Log).
**Notes / open questions:** [Question] The card has an unlabeled icon at the top right. What does it do (refresh, link to Audit Log)? If it's interactive, it needs an accessible name. [Question] The brief's breakdown wording is "11 revoked on offboarding · 4 contractor passes expired on schedule". The design shortens it. Confirm the copy.

### PC-02: See active credentials by type
**As** Maria Alvarez (Operations)
**I want** to see how many active credentials exist and the mix of mobile, badge, QR and other types
**So that** I can track the move to mobile credentials and plan badge stock

**Design reference:** [Card 2: Active credentials breakdown][n9-77]
**Priority:** Should · **Size:** S
**Dependencies:** none

**Acceptance criteria**
1. The card shows "Active credentials", "for 1,912 people", "2,411", "Mobile 69% · Badge 26% · QR pass 3%" and "PIN & biometric 2%".
2. The proportional bar has a text legend with absolute counts ("Mobile 1,664", "Badge 627", "Guest QR 72", "Other 48"), so the mix never relies on segment color alone. The bar has a text alternative such as "Mobile 69 percent, Badge 26 percent…".
3. Percentages are rounded so they sum to 100%, and the counts sum to the total.
4. Only credentials with status Active are counted. Expired, suspended and revoked credentials are excluded.
5. Percentages follow the locale ("69%" / "69 %").

**Out of scope:** trends over time.
**Notes / open questions:** [Question] The brief says "text breakdown (no chart)". The design adds a bar. [Question] The legend says "Guest QR", but visitor/guest passes are not managed on this screen. Should it be "QR pass" (contractor), matching line 1? See OQ-10.

### PC-03: See the review count by severity and jump to the list
**As** Maria Alvarez (Operations)
**I want** to see how many credential problems are waiting for a person, by severity
**So that** I know at a glance whether anything needs me before I start looking people up

**Design reference:** [Card 3: Needs review quick metric][n9-35]
**Priority:** Must · **Size:** S
**Dependencies:** PC-30

**Acceptance criteria**
1. **Given** 5 open review items, **then** the card shows "Needs review", "5", "exceptions require human signoff" and the segments "1 High", "2 Medium", "2 Low".
2. Each severity segment shows an icon and a text label. Severity is never shown by a colored dot alone (the design currently uses dots only).
3. **When** Maria activates the card, **then** focus moves to the "Needs review" section heading and the section expands if it was collapsed.
4. The card count always equals the "Needs review" section badge. Security-classified items count for Operations users too, without revealing details.
5. **Given** 0 items, **then** the card shows "0" without the red alert dot. [Assumption: zero state not drawn.]
6. The card is a single focusable control with a hit area of at least 44 × 44px and an accessible name such as "Needs review, 5 items: 1 high, 2 medium, 2 low. Go to list."

**Out of scope:** filtering the list by severity from the card.
**Notes / open questions:** [Question] The large "5" and "1 High" are red, and Medium is violet. The brief asks for a calm screen with amber for High and sky for Medium. See OQ-4.

### PC-04: Check that tenant rosters synced
**As** Maria Alvarez (Operations)
**I want** to see whether every tenant roster synced this morning, and what changed
**So that** I know the people list is current before I answer an access question

**Design reference:** [Roster sync status chip][n9-18]. **Popover, syncing and failed states are not shown in the design.**
**Priority:** Must · **Size:** M
**Dependencies:** none

**Acceptance criteria**
1. **Given** all 4 rosters synced at 6:00 AM, **then** the chip reads "Tenant rosters · 4 of 4 synced · 6:00 AM" with a status dot paired with the words "synced".
2. **When** Maria activates the chip, **then** a popover lists each roster with people count, last sync and result (for example "Kestrel Analytics · 512 · Today 6:00 AM · ✓ Synced · 3 added, 1 removed"), plus the footer "Building staff and contractors are added in SmartAccess. Rosters sync daily at 6:00 AM EDT." (brief).
3. **Given** a sync is running, **then** the chip reads "Syncing Kestrel roster…" with a spinner. **Given** one roster failed, **then** it reads "1 roster didn't sync" with a warning icon.
4. **Given** the Northwind Legal roster failed, **then** a warning banner under the summary strip reads "Northwind Legal roster didn't sync at 6:00 AM. Statuses for its 212 people are as of yesterday 6:00 AM. People removed from that roster today still have access until the next successful sync. [Retry sync] [View details]". Affected directory rows carry a "Roster stale" tag.
5. "Retry sync" is available to Operations and Security. The retry and its result are logged to the audit trail.
6. The chip has a hit area of at least 44 × 44px. The popover traps focus, closes with Escape and returns focus to the chip.

**Out of scope:** configuring roster integrations.
**Notes / open questions:** [Assumption] Tenant roster sync (daily, auto-provision and auto-revoke) is carried over from the brief. The case brief doesn't confirm an HR or roster integration. [Question] The drawer says "Managed via SCIM Roster Integration". Is SCIM the integration mechanism? Engineering should confirm, because it changes sync timing (SCIM can push changes in near real time instead of a daily batch).

### PC-05: Orient on the page and reach access-group definitions
**As** Maria Alvarez (Operations)
**I want** a clear page header with the directory size and a link to where access groups are defined
**So that** I know I'm in the right building and can check what a group contains without editing it

**Design reference:** [Header row][n9-6], [View access groups][n9-24], [Sidebar][n9-794], [Top bar][n9-754]
**Priority:** Should · **Size:** S
**Dependencies:** none (app shell behaviour: Live Activity STORY-05)

**Acceptance criteria**
1. The header shows "People & Credentials", a count chip "1,912 active profiles" and the subtitle "Badges, mobile credentials and who can go where across Harborview Tower".
2. The sidebar marks "People & Credentials" as the current page (`aria-current="page"`).
3. For Operations, the secondary button reads "View access groups" and opens Access Policy & Autonomy in a new tab, read-only. For Security, it reads "Manage access groups" (brief, **Security variant not shown in the design**). The external-link icon has visually hidden text "opens in a new tab".
4. The "1,912 active profiles" count matches the "All" segment and the table total, and excludes offboarded people.
5. "Add person" opens the Add person drawer (PC-40). It is hidden for view-only users (PC-44).

**Out of scope:** site switching, global search, notifications (Live Activity STORY-05, STORY-06).
**Notes / open questions:** [Question] The chip says "active profiles" while the table shows Suspended and Expired people among the 1,912. Is "active" the right word? See OQ-8.

---

## Epic 2: Find a person and answer "is their access OK?"
The brief's bar is that Maria or a front-desk colleague finds a person and answers an access question in under 10 seconds, dozens of times a day ("Is Kenji's badge active?"). The directory is a reference tool. It has to be fast, scannable and honest about each person's state.

### PC-06: Browse the people directory
**As** Maria Alvarez (Operations)
**I want** a table of everyone with access to this building, with type, credentials, access, status and last access in one row
**So that** I can answer most questions about a person without opening anything

**Design reference:** [Data table][n9-309], [Header row][n9-311], rows [Tomás Reyes][n9-327], [Guadalupe Ramírez-Castellanos de la Fuente][n9-420], [Dmitri Volkov][n9-514], [Tanaka Yuki][n9-556]
**Priority:** Must · **Size:** M
**Dependencies:** none

**Acceptance criteria**
1. The table has the columns checkbox, "PERSON", "CLASSIFICATION", "CREDENTIALS", "ACCESS GROUPS", "STATUS", "LAST ACCESS EVENT" and a row actions menu. It is a real `<table>` with `<th scope="col">` and the caption "People at Harborview Tower, 1,912 results".
2. The Person cell shows an initials avatar, the full name and a second line. Long names ("Guadalupe Ramírez-Castellanos de la F…") truncate with an ellipsis and show the full name in a tooltip that also opens on keyboard focus.
3. The Classification cell shows "Tenant employee", "Building staff" or "Contractor", with the organization below. Contractors show "Sponsor: Castellan" in place of the organization.
4. The Last access cell shows the time or date ("9:08 AM", "Yesterday 5:42 PM", "Oct 2, 2026"), an outcome with icon and text ("● Admitted", "✕ Denied") and the door ("Lobby B turnstile 03"). Administrative entries show the reason without an outcome ("Manual hold by HR"). People with no access yet show "Never" (brief).
5. Names display in each person's stored order. "Tanaka Yuki" shows family name first and the avatar reads "TY". Initials use the first grapheme of each name field.
6. Each row's accessible name summarizes it, for example "Tomás Reyes, Tenant employee, Kestrel Analytics, Mobile credential ending 7731, Active".
7. **Given** an Operations user and a security-classified last event, **then** the cell reads "Restricted event · details limited to Security" (brief, **not shown in the design**).
8. The row actions menu offers Open, Suspend all credentials, Add credential, Add access group and Copy person ID, plus "View in Audit Log" for Security (brief, **menu not shown in the design**). The menu button has an accessible name ("More actions for Tomás Reyes").

**Out of scope:** inline editing in the table.
**Notes / open questions:** [Question] The Person cell's second line shows the full, unmasked work email ("t.reyes@kestrel-analytics.com"), but the drawer masks the same email behind "Reveal" with logging. The brief puts `roleLabel` · org on this line. This is a privacy conflict (OQ-1). [Question] The brief's column is "Type", the design says "CLASSIFICATION". The brief also has a hidden "Source" column that the design doesn't show.

### PC-07: Read credential, access and status state at a glance
**As** Maria Alvarez (Operations)
**I want** each row to show which credentials a person has, what groups they're in, and whether anything is wrong
**So that** I can spot an expired badge or a suspended person without opening the drawer

**Design reference:** rows [Priya Shah][n9-371], [Guadalupe][n9-420], [Kenji Watanabe][n9-469], [Dmitri Volkov][n9-514], [Carlos Mendoza][n9-646], [Lars Henriksen][n9-689]
**Priority:** Must · **Size:** M
**Dependencies:** PC-06

**Acceptance criteria**
1. Credential chips show a kind icon and the mono suffix ("••••7731"). A person with several credentials shows up to 2 chips, then "+N". A person with none shows "No credential". Chips are display text, not separate tab stops, and "••••" is announced as "ending 7731".
2. A credential that isn't active shows its state as an icon **and** a word, for example Kenji's expired badge chip and Lars's chip "Suspended". Color is never the only signal.
3. Access-group chips show group names, then "+N" for more ("Kestrel – Staff +1"). Restricted groups show a lock icon with the word "Restricted" available to screen readers. Elevated groups ("Meridian Ops · All Doors Master") show a distinct icon with a text label such as "Elevated".
4. **Given** an Operations user and a restricted group, **then** the chip shows a placeholder ("[Restricted Policy]") or the group name with a lock, but never the doors inside it.
5. The status badge always pairs an icon with a label. The design shows "Active", "Expired badge", "Pending extension", "Expiring in 2d" and "Suspended". Relative expiry ("Expiring in 2d") always has the absolute date in its tooltip and accessible name ("Expires Oct 8, 2026").
6. **Given** a person has an open review item or Live Activity exception, **then** the row shows an indicator with a text alternative (Kenji's warning icon reads "Needs review: roster and badge disagree").
7. **Given** a group was removed by a suspension, **then** the chip shows the group struck through **and** a text cue ("Nordic Trade Staff, paused"), not strikethrough alone.

**Out of scope:** editing from chips.
**Notes / open questions:** [Question] "Expired badge" and "Suspended" are red, while "Pending extension" and "Expiring in 2d" are gray. The brief makes Active the quietest, Expired amber, Suspended neutral and Expiring sky, and says red is never used for routine statuses (OQ-4). [Question] Status values in the design ("Expired badge", "Pending extension") mix person and credential state. The `CredentialStatus` type has only active, expired, suspended and revoked (OQ-15). [Question] Lars: the brief says "Active · 1 credential suspended" (mobile still works), the design says the whole person is "Suspended". Which is correct?

### PC-08: Search for a person by name, email, organization or credential digits
**As** Maria Alvarez (Operations), at the front desk with someone waiting
**I want** one search box that finds a person by any of the things people tell me
**So that** I can answer "is my badge working?" in seconds

**Design reference:** [Search field][n9-233]
**Priority:** Must · **Size:** M
**Dependencies:** PC-06

**Acceptance criteria**
1. The field's placeholder reads "Search by name, email, organization or last 4 digits..." and shows a "/" shortcut hint. Pressing `/` anywhere (except while typing) focuses it.
2. Search matches given name, family name, email, organization and an exact `last4`, case- and accent-insensitive ("Ramirez" finds "Ramírez"). It runs on the server after a 250ms pause in typing, and the result count shows "Searching…" in the meantime.
3. Results keep the current person-type segment and filters, and the result count updates ("Showing 1–3 of 3").
4. **Given** a `last4` that matches several people, **then** all of them are shown.
5. **Given** exactly one result, **when** Maria presses Enter, **then** that person's drawer opens.
6. A clear button empties the field and restores the full list. The field has a visible label or an accessible name ("Search people").
7. **Given** privacy mode is on, **then** search still works but results are masked (PC-45), and search never matches hidden fields in a way that reveals them.

**Out of scope:** global search in the top bar (Live Activity STORY-05).
**Notes / open questions:** none.

### PC-09: Narrow the directory by person type
**As** Maria Alvarez (Operations)
**I want** one-click segments for tenant employees, building staff and contractors
**So that** I can focus on contractors (whose access expires) or my own staff

**Design reference:** [Segmented type selector][n9-241]
**Priority:** Should · **Size:** S
**Dependencies:** PC-06

**Acceptance criteria**
1. Segments read "All 1,912", "Tenant employees 1,684", "Building staff 46" and "Contractors 182", and "All" is selected by default.
2. Selecting a segment filters the table and the result count. The selected segment is exposed with `aria-pressed` (or as a radio group).
3. Segment counts reflect the other active filters and search.
4. The selection is stored in the URL with the other filters.
5. **Given** the labels overflow (long translations or narrow widths), **then** the control turns into a dropdown (brief).

**Out of scope:** custom person types.
**Notes / open questions:** [Question] The counts add up (1,684 + 46 + 182 = 1,912), but the status filter defaults to "Active (1,842)" (OQ-8).

### PC-10: Filter the directory by organization, credential status, credential type and access group
**As** David Okafor, Director of Security & IT (Security role)
**I want** to combine filters such as "Contractors with credentials expiring soon" or "everyone in Server rooms – Tier 2"
**So that** I can check who can reach sensitive areas and confirm offboarding removed access

**Design reference:** [Toolbar row 2][n9-258]: [Org][n9-260], [Status][n9-268], [Type][n9-276], [Group][n9-284], [Reset][n9-292]
**Priority:** Must · **Size:** M
**Dependencies:** PC-06

**Acceptance criteria**
1. Dropdowns read "Org: All organizations", "Status: Active (1,842)", "Type: Any credential" and "Group: All groups". Organization and Access group are searchable multi-selects.
2. Credential status options are Active, Expiring within 14 days, Expired, Suspended, Lost reported, Pending activation and Revoked. Offboarded people are hidden unless "Include offboarded" is chosen (brief).
3. Credential type options are Badge, Mobile credential, PIN, QR pass and Biometric. Visitor pass is excluded.
4. **Given** an Operations user, **then** restricted access groups are not listed in the Group filter (brief).
5. Filters combine with AND. Applied filters appear as removable chips with "Clear all" (brief), and "Reset" restores the defaults. Filter state lives in the URL so a filtered view can be shared.
6. **Given** filters that match nothing, **then** the table shows "No people match these filters." with "Clear filters" (PC-13).
7. Each dropdown has a visible label and its options show counts where available.

**Out of scope:** saved views.
**Notes / open questions:** [Question] The design's default status filter is "Active (1,842)", yet the table shows 1,912 records including Expired and Suspended people. Which is the default (OQ-8)? [Question] The brief's "Source" filter (Tenant roster, Added manually, Contractor pre-registration) and the active-filter chips are missing from the design.

### PC-11: Page through large result sets
**As** Maria Alvarez (Operations)
**I want** to page through 1,912 people with a page size I choose
**So that** the table stays fast and I can scan a filtered list completely

**Design reference:** [Pagination footer][n9-729], [Result count][n9-258]
**Priority:** Must · **Size:** S
**Dependencies:** PC-06

**Acceptance criteria**
1. The footer shows "Rows per page: 50", "1–50 of 1,912 records", "1 / 39" and first, previous, next and last controls. The toolbar shows "Showing 1–50 of 1,912".
2. Page size can be 50, 100 or 200. Paging and sorting run on the server.
3. First and previous are disabled on page 1, and next and last are disabled on the final page. Disabled state is exposed to assistive technology.
4. Each pagination control has an accessible name ("Next page") and a hit area of at least 44 × 44px.
5. Changing page keeps filters, search and sort, and updates the URL.
6. Changing page moves focus to the top of the table and announces "Page 2 of 39" politely.

**Out of scope:** infinite scroll.
**Notes / open questions:** none.

### PC-12: Sort and tailor the table
**As** Maria Alvarez (Operations)
**I want** to sort by name, status or last access, choose columns and switch density
**So that** the table fits how I work at the front desk versus at my desk

**Design reference:** [Columns chooser][n9-295], [Density toggle][n9-300], [Header row][n9-311]. **Sort indicators and the Columns menu are not shown in the design.**
**Priority:** Should · **Size:** M
**Dependencies:** PC-06

**Acceptance criteria**
1. Person (sorted by family name, using locale-aware collation), Status and Last access are sortable. The default is Last access, newest first. Clicking a header cycles ascending, descending, then none, and `aria-sort` reflects the state.
2. "Columns" lets the user show or hide optional columns, including "Source" (hidden by default). The choice persists per user.
3. The density toggle switches between Comfortable (56px rows, two-line person cell) and Compact (one line, with the second line moving into a tooltip). Rows never go below a 44px hit target.
4. The toggle exposes its state (`aria-pressed` or radio group) and both buttons have text labels for screen readers ("Comfortable", "Compact").
5. Column widths can be resized, and the header stays sticky while scrolling.

**Out of scope:** reordering columns.
**Notes / open questions:** [Question] The design draws no sort arrows on any header. Confirm which columns are sortable.

### PC-13: Get clear guidance when the directory is empty or nothing matches
**As** Maria Alvarez (Operations)
**I want** helpful messages when a site has no people yet or my search finds nothing
**So that** I know whether to fix my search, clear filters or connect a roster

**Design reference:** **Not shown in the design** (brief: Empty-state copy)
**Priority:** Must · **Size:** S
**Dependencies:** PC-08, PC-10

**Acceptance criteria**
1. **Given** a site with no people, **then** the table shows "No people at Harborview Tower yet", "Connect a tenant roster to add tenant employees automatically, or add building staff and contractors yourself.", "Add person" (primary) and "How roster sync works" (link).
2. **Given** a search with no results, **then** it shows "No one matches 'Okafor-Ba'. Check the spelling, or search by the last 4 digits of a credential." and a "Clear search" link. The search term is shown as plain text, never interpreted as HTML.
3. **Given** filters with no results, **then** it shows "No people match these filters." and "Clear filters".
4. Each empty message is announced politely when it appears, and the summary strip and "Needs review" stay usable.

**Out of scope:** onboarding wizard.
**Notes / open questions:** none.

---

## Epic 3: Inspect and fix one person's credentials
Lost badges, expired credentials and contractors without access are Maria's most common tickets (personas, "access friction"). The drawer is where they get fixed. Changes that restore access must be fast because someone may be waiting at a door. Changes that remove access must be deliberate, confirmed and logged.

### PC-14: Open a person's details without losing my place
**As** Maria Alvarez (Operations)
**I want** to open a person from the list in a side drawer and step to the next result
**So that** I can check several people in a row without losing my scroll position or filters

**Design reference:** [Selected row (Tomás Reyes)][n9-327], [Drawer][n9-860], [Drawer header][n9-861], [Backdrop][n9-753]
**Priority:** Must · **Size:** M
**Dependencies:** PC-06

**Acceptance criteria**
1. **When** Maria clicks a row (outside the checkbox and actions menu) or presses Enter on it, **then** a 560px drawer opens from the right over the directory on the Credentials tab, and the row shows a selected state. The directory keeps its scroll position.
2. The drawer header shows the person ID ("PER-008812"), the sync state ("● Synced 6:00 AM"), previous and next arrows and a close button, each with an accessible name ("Previous person", "Next person", "Close").
3. The arrows (and `J` / `K`) step through the current result list, including across pages, and stop at the ends.
4. Focus moves to the person's name on open and is trapped inside the drawer. Escape or Close returns focus to the originating row.
5. The URL updates (for example `/people?person=PER-008812&tab=credentials`) so the drawer can be deep-linked, opened from global search, or opened from Live Activity (cross-screen: Live Activity STORY-07 and STORY-19 "View person" links land here).
6. The drawer is a `dialog` labelled by the person's name. Under reduced motion it appears without sliding.
7. **Given** the person is offboarded by a roster sync while the drawer is open, **then** the drawer shows "Removed from Kestrel roster at 9:20 AM · Credentials revoked automatically" and its actions disappear (brief, **not shown in the design**).

**Out of scope:** opening two people side by side.
**Notes / open questions:** [Question] The design dims the page with a backdrop. Does clicking the backdrop close the drawer? If so, unsaved changes must trigger the discard prompt (PC-27).

### PC-15: See who a person is and where their record comes from
**As** Maria Alvarez (Operations)
**I want** the drawer to show the person's name, status, type, organization, record source and masked contact details
**So that** I know I have the right person and whether a change should happen here or in the tenant's roster

**Design reference:** [Person summary header][n9-884], [Masked contact line][n9-901]
**Priority:** Must · **Size:** M
**Dependencies:** PC-14

**Acceptance criteria**
1. The header shows the initials avatar ("TR"), "Tomás Reyes", a status badge ("Active", icon plus text), "Tenant employee · Kestrel Analytics" and "Managed via SCIM Roster Integration · Tenant ID: KST-9044".
2. Contact details are masked by default: "t•••••@kestrel-analytics.com · •••-•••-4410". Masking keeps the email domain and the last 4 phone digits, and works for any phone format.
3. **When** Maria selects "Reveal", **then** the contact details are shown for that drawer session, and an audit entry "Email revealed by Maria Alvarez" (or phone) is written with person ID and time.
4. View-only users don't see "Reveal". In privacy mode the contact line and "Reveal" are removed (PC-45).
5. **Given** a roster-managed person, **then** fields that come from the roster (name, organization, email) are read-only here, with a hint that changes are made in the tenant's roster. [Assumption]
6. Email, phone and person ID are wrapped in bidi isolation so they stay left-to-right in RTL layouts.

**Out of scope:** editing contact details (not designed).
**Notes / open questions:** [Question] The directory row shows the same email unmasked (OQ-1). [Question] Should "Reveal" show email and phone together or one at a time? The brief says "one at a time", the design has one button for both.

### PC-16: See an open Live Activity exception for this person
**As** Maria Alvarez (Operations)
**I want** the drawer to tell me when this person has an open exception in Live Activity
**So that** I don't change their credentials without knowing about an active incident

**Design reference:** [Live Activity banner][n9-913]
**Priority:** Should · **Size:** S
**Dependencies:** PC-14; cross-screen Live Activity STORY-07 (tailgating card) and STORY-16 (resolved elsewhere)

**Acceptance criteria**
1. **Given** Tomás has an open tailgating exception, **then** the drawer shows "1 open exception in Live Activity", "Possible tailgating detected at Lobby B turnstile 03 (Today 9:08 AM)" and "View →".
2. "View" opens Live Activity with that exception's detail drawer open (and its "Why" visible).
3. **Given** the exception is resolved in Live Activity while this drawer is open, **then** the banner disappears without a reload.
4. **Given** several open exceptions, **then** the banner shows the count ("2 open exceptions") and links to Live Activity filtered to this person. [Assumption]
5. The banner has a warning icon plus text and is not a live region. It is read in normal order.
6. **Given** an Operations user and a security-classified exception, **then** the banner shows only "1 restricted exception · details limited to Security" with no link to details.

**Out of scope:** deciding the exception from this drawer.
**Notes / open questions:** [Question] In the design the banner overlaps the tab row (layout defect). [Question] The brief wording is "Possible tailgating at Lobby B turnstile, 9:08 AM". The design uses "Lobby B turnstile 03" here, while Live Activity says "Lobby B turnstile". Door names must match across screens (OQ-2).

### PC-17: Review a person's credentials
**As** Maria Alvarez (Operations)
**I want** one card per credential showing type, device, status, issue date, door coverage and last use
**So that** I can tell immediately whether a credential works and where it was last used

**Design reference:** [Credentials tab][n9-946], [Credential card: Mobile][n9-947]
**Priority:** Must · **Size:** M
**Dependencies:** PC-14

**Acceptance criteria**
1. The Credentials tab label shows a count ("Credentials 1"). Cards list active credentials first.
2. The mobile card shows "Mobile Wallet Key", "••••7731", "Apple Wallet (iPhone 15 Pro)", the status "Active" (icon plus text), "Issued: Mar 2, 2026 · Auto-provisioned", "Scope: Applied to 48 of 48 doors" and "Last verified tap: Today, 9:08 AM @ Lobby B turnstile 03".
3. Expiring credentials show their expiry date. Expired credentials show "Renew" (PC-21) and suspended ones show "Restore" (PC-18). Revoked credentials are collapsed under "Show N revoked credentials" (brief).
4. **Given** a biometric credential and a Security user, **then** the card shows "Biometric · Fingerprint · Enrolled Jan 14, 2026 by David Okafor · Template stored encrypted on the Lumen Lab 9B controller only · Never shown or exported". Operations sees "Biometric · Managed by Security". No template, image or score is ever displayed (brief, **not shown in the design**).
5. Dates always include the year and use the site's time zone. Only `last4` is ever displayed. There is no "reveal full number".
6. **Given** a person with no credential, **then** the tab shows "Tanaka Yuki has no active credential. A mobile invite was sent Oct 5, 2026 and hasn't been activated." with "Resend invite" and "Issue badge instead" (brief, **not shown in the design**).

**Out of scope:** device management for phones.
**Notes / open questions:** [Question] The design calls the kind "Mobile Wallet Key". The brief's label table uses "Mobile credential" (OQ-10). [Question] Tanaka Yuki is "Active" with mobile ••••9022 in the design but "Pending activation" in the brief, so the no-credential state has no sample person in the design.

### PC-18: Suspend and restore a credential
**As** Maria Alvarez (Operations)
**I want** to suspend a credential with a reason and restore it later
**So that** a lost or misused credential stops working immediately, but can be brought back without reissuing

**Design reference:** ["Suspend" on the credential card][n9-979]. **Confirmation dialog, toast and Restore are not shown in the design.**
**Priority:** Must · **Size:** M
**Dependencies:** PC-17, PC-24

**Acceptance criteria**
1. **When** Maria selects "Suspend", **then** a dialog asks for a required reason ("Reported lost", "Left the company", "Security concern", "Other") and an optional note. There is no type-to-confirm, because suspension can be reversed.
2. **When** she confirms, **then** the credential stops working at all doors, the card shows "Suspended" (icon plus text) with a "Restore" action, and a toast reads, for example, "Badge ••••2207 suspended for Lars Henriksen · Applied to 48 of 48 doors · Logged to audit trail · [Undo] [View]".
3. Undo is available for 30 seconds from the toast. After that, "Restore" in the drawer does the same thing. Restore commits in one click, because it restores access.
4. Suspend, Undo and Restore each write their own audit entry with actor, reason, time and audit ID.
5. **Given** the action fails, **then** the card shows "Couldn't suspend badge ••••2207. Nothing was changed at the doors. [Retry]" and focus moves to the error.
6. Dialog focus starts on the reason field and returns to "Suspend" on close. The toast is announced politely.

**Out of scope:** suspending all credentials at once (PC-23, PC-42).
**Notes / open questions:** none.

### PC-19: Replace a lost or broken credential
**As** Maria Alvarez (Operations)
**I want** to replace a credential in one flow, so the old one stops and a new one is issued
**So that** a person who lost a badge or changed phones is back in without two separate steps

**Design reference:** ["Replace" on the credential card][n9-979]. **The replace flow is not shown in the design.**
**Priority:** Must · **Size:** M
**Dependencies:** PC-17, PC-22, PC-24

**Acceptance criteria**
1. **When** Maria selects "Replace", **then** a dialog asks for the reason and what to issue (same kind by default, for example a new mobile invite or a badge for pick-up at the Lobby A front desk).
2. **When** she confirms, **then** the old credential is revoked, the new one is issued with the same access groups, and both show on the card list (the old one under revoked).
3. **Given** the new credential is a mobile invite, **then** the new card shows "Pending activation" until the person activates it, and the old credential is revoked immediately, not on activation. [Assumption: confirm with Security]
4. The replacement is logged as one audit entry that links the old and new credentials.
5. **Given** an Operations user, **then** Replace is not offered on biometric credentials.

**Out of scope:** badge printing.
**Notes / open questions:** [Question] Should the old credential stop before or after the new one is activated? Revoking first is safer but can lock someone out while they wait (OQ-13).

### PC-20: Revoke a single credential
**As** Maria Alvarez (Operations)
**I want** to permanently revoke one credential after a clear warning
**So that** a credential that should never work again (lost for good, person left) is shut off for certain

**Design reference:** Card overflow "⋯" on the [credential card][n9-979]. **Menu and dialog are not shown in the design.**
**Priority:** Must · **Size:** M
**Dependencies:** PC-17, PC-24

**Acceptance criteria**
1. Revoke lives in the card's overflow menu, not as a primary button.
2. The dialog reads, for example, "Revoke badge ••••4821 for Kenji Watanabe? It stops working at all 48 doors within a few seconds. This can't be undone. To restore access you'll need to issue a new credential." A reason is required.
3. The confirm button reads "Revoke badge" in the destructive style, and focus starts on "Cancel".
4. **When** confirmed, **then** the credential moves to the revoked list, an audit entry is written with reason and audit ID, and focus moves to the next credential card.
5. No Undo is offered for revocation. The toast says so plainly ("Revoked. Issue a new credential to restore access.").
6. Users without revoke rights don't see the option (PC-44).

**Out of scope:** bulk revoke (PC-43).
**Notes / open questions:** [Question] Should Operations be allowed to revoke at all, or only suspend (brief open question 5, OQ-13)?

### PC-21: Renew an expired credential
**As** Maria Alvarez (Operations)
**I want** to renew an expired credential to a new date in one click
**So that** someone who is still entitled to access gets back in immediately

**Design reference:** **Not shown in the design** on a credential card. The same action appears on the review row "Renew badge to Jan 3, 2027" ([Row 2][n9-162]).
**Priority:** Should · **Size:** S
**Dependencies:** PC-17

**Acceptance criteria**
1. Expired credential cards show "Renew" with a default end date (90 days, for example "Jan 3, 2027"). The date can be changed in a popover with a date picker.
2. Renewal commits in one click and shows a toast with Undo for 30 seconds.
3. The card returns to Active with the new expiry, and the change propagates to the doors (PC-24).
4. Renewal is logged with old and new expiry dates.
5. **Given** the person is offboarded or off the roster, **then** Renew is unavailable, with the reason shown.

**Out of scope:** automatic renewal rules (Access Policy & Autonomy).
**Notes / open questions:** none.

### PC-22: Add a credential to a person
**As** Maria Alvarez (Operations)
**I want** to issue a new badge, mobile credential, PIN or contractor QR pass from the drawer
**So that** someone who needs an extra or different credential gets it without a ticket

**Design reference:** ["Add credential (Physical Badge, PIN, Temp Pass)"][n9-988]. **Menu and forms are not shown in the design.**
**Priority:** Must · **Size:** M
**Dependencies:** PC-17, PC-24

**Acceptance criteria**
1. The dropdown offers Badge, Mobile credential, PIN, QR pass (contractors only) and Biometric (Security only). Visitor pass is never offered.
2. Mobile credential requires a mobile phone on file and sends an invite. The card then shows "Pending activation" with "Resend invite".
3. Badge issuance records the `last4` of the assigned card and the pick-up location. PIN issuance never displays the PIN in the console after it is set. [Assumption]
4. QR pass for contractors requires an end date no later than the contractor's access end.
5. **Given** an Operations user, **then** Biometric is not listed. A Security user enrolling a biometric credential sees the storage location, and no template is ever shown.
6. Each issued credential is logged, propagates to the doors (PC-24) and appears in History (PC-29).

**Out of scope:** biometric enrollment hardware flow.
**Notes / open questions:** [Question] The button label lists "Physical Badge, PIN, Temp Pass". "Temp Pass" is not a `CredentialKind`. Is it the contractor QR pass (OQ-10)? [Question] Biometric consent records (BIPA, GDPR) need legal input (OQ-14).

### PC-23: Remove all of a person's access
**As** Maria Alvarez (Operations)
**I want** to remove all of a person's credentials at once with a strong confirmation
**So that** someone who has left or is a security concern loses every way in, in one step

**Design reference:** ["Revoke all credentials" in the drawer footer][n9-1022]. **The confirmation is not shown in the design.**
**Priority:** Must · **Size:** M
**Dependencies:** PC-17, PC-24

**Acceptance criteria**
1. The action is styled as destructive and visually separated from "Done" and "Save changes".
2. The confirmation summarizes the impact ("2 credentials and 3 access groups will be removed.") and requires typing the person's full name plus a reason.
3. **Given** the person is roster-managed, **then** the dialog warns "This person is still on the Kestrel roster and may be re-added at the next sync. Ask Kestrel's admin to remove them there."
4. **Given** an Operations user and a person with a restricted group, **then** the dialog says "Dmitri Volkov has restricted access. Offboarding will notify Security to remove it." [Assumption, from the brief]
5. **When** confirmed, **then** every credential is revoked, the change propagates (PC-24), one audit entry lists everything removed, the drawer closes and focus moves to the next table row.
6. Users without revoke rights don't see the action. View-only users see "View only · Ask an Operations or Security admin to make changes." instead.

**Out of scope:** HR offboarding integration.
**Notes / open questions:** [Question] The brief has a reversible "Suspend access" in the header and "Offboard person" in an overflow menu. The design has neither and puts an irreversible "Revoke all credentials" in the always-visible footer. Does "Revoke all" also remove access groups and mark the person offboarded? Should a reversible "Suspend access" exist (OQ-5)?

### PC-24: See a credential change reach the doors, and get warned when a door is offline
**As** Maria Alvarez (Operations)
**I want** to see when a change has been applied to every door, and which doors haven't received it yet
**So that** I never assume a lost badge is dead when an offline door may still accept it

**Design reference:** "Scope: Applied to 48 of 48 doors" on the [credential card][n9-947]. **Progress and offline states are not shown in the design.**
**Priority:** Must · **Size:** M
**Dependencies:** none (used by PC-18 to PC-23, PC-27)

**Acceptance criteria**
1. After any credential or access change, the card and toast show "Applying to doors… 31 of 48", then "Applied to 48 of 48 doors".
2. **Given** Dock 4 is offline, **then** the result reads "Applied to 47 of 48 doors · Dock 4 is offline and will update when it reconnects. Until then it uses its last synced access list."
3. **Given** the change was a suspension or revocation, **then** that message is a warning (icon plus text): "Dock 4 may still accept badge ••••2207 until it reconnects. [Open Doors & Devices]". It is announced assertively once. For grants it is informational and announced politely.
4. Progress is announced at start and at completion only, not on every count.
5. **When** the offline door reconnects and syncs, **then** the card updates to "Applied to 48 of 48 doors".

**Out of scope:** door diagnostics.
**Notes / open questions:** [Assumption] Controllers cache access lists, so an offline door can still honor a revoked credential. Engineering must confirm, because it decides how loud the warning should be. Related to Live Activity STORY-33 (offline controllers).

---

## Epic 4: Answer "who can go where" for a person
"Why can't the HVAC contractor get into the mechanical room?" is a daily question. David's job is to check who can reach sensitive areas (personas). Access groups are assigned here and defined in Access Policy & Autonomy.

### PC-25: Check whether a person can open a specific door, and why
**As** Maria Alvarez (Operations)
**I want** to pick a door and get a plain answer about whether this person can open it now, and which rule decides
**So that** I can answer "why can't I get in?" without opening the policy screen

**Design reference:** ["Check a door" module][n9-996], [Evaluation result][n9-1011]
**Priority:** Must · **Size:** M
**Dependencies:** PC-14

**Acceptance criteria**
1. The module is titled "Check a door (Access Simulator)" and has a door combobox (searchable across all 48 doors, grouped by zone, with "Recent doors" showing the last 5 checked).
2. **Given** Tomás and "Lobby B turnstile 03", **then** the result shows a check icon and "Allowed now · Lobby B turnstile 03", "Rule: Kestrel Analytics – Staff" and "Schedule: Every day 5:00 AM – 11:00 PM · Anti-passback: 180s strict".
3. **Given** a door that is allowed but outside the schedule, **then** it reads "Allowed, but not right now · Floor 15 suite door · schedule allows every day 5:00 AM–11:00 PM; it's outside that window" with a clock icon (brief).
4. **Given** a door that isn't allowed, **then** it reads "Not allowed · Server Room 2F · requires 'Server rooms – Tier 2' (restricted). Ask Security to grant it." with a blocked icon (brief).
5. Every answer pairs an icon with a text verdict. The result area is a `role="status"` region, so the answer is announced.
6. **Given** a suspended or expired credential, **then** the answer accounts for credential state as well as groups (for example "Not allowed · badge ••••4821 expired Oct 5, 2026"). [Assumption]
7. The combobox follows the ARIA combobox pattern and works fully from the keyboard.

**Out of scope:** door-centric reports (Doors & Devices).
**Notes / open questions:** [Question] The brief puts "Check a door" on the Access tab, the design on the Credentials tab. The design also calls it "Access Simulator" and shows "Policy Simulator v3". Is a "simulator" the right framing for a live answer (OQ-6)? [Question] Anti-passback isn't in the brief or the types. Is it a real group attribute?

### PC-26: See a person's access groups and effective access
**As** David Okafor (Security)
**I want** to see every access group a person holds, with doors, schedule, who granted it and when it expires, plus a summary of all doors they can open
**So that** I can confirm who can reach sensitive areas and that access matches the person's role

**Design reference:** ["Access Groups 2" tab label][n9-929]. **Tab content is not shown in the design.**
**Priority:** Must · **Size:** M
**Dependencies:** PC-14

**Acceptance criteria**
1. Each group row shows name, door count, schedule, source or granter, and expiry, for example "Kestrel Analytics – Staff · 9 doors (Lobby A & B turnstiles, Elevator bank B, Floors 14–15 suite doors) · Every day 5:00 AM–11:00 PM · From Kestrel roster · No expiry".
2. Restricted groups show a lock and the word "Restricted". **Given** an Operations user, **then** the group name shows but its doors don't.
3. An "Effective access" summary groups doors by zone ("Lobbies & elevators · 5 doors", "Kestrel suite, Floors 14–15 · 4 doors", "Parking · 1 gate"). Each zone expands to list its doors, with a "38 other doors at this site" count for context.
4. **Given** the person has access at other sites in the same firm, **then** a read-only line reads "Also has access at 1180 Mercer Plaza (Kestrel Analytics – Staff) →" linking to that site's console. [Assumption]
5. The tab count matches the number of groups ("Access Groups 2").
6. Schedules are localized ("Every day 5:00 AM–11:00 PM" / "Täglich 05:00–23:00").

**Out of scope:** editing group definitions.
**Notes / open questions:** [Question] The site list differs between the brief (1180 Mercer Plaza) and the built mock data (Riverside Plant 3, Northgate Logistics Hub). Reconcile before building item 4.

### PC-27: Grant or remove an access group
**As** Maria Alvarez (Operations)
**I want** to add or remove standard access groups for a person and save the change explicitly
**So that** I can give a contractor the mechanical rooms for a job, or take access away when it ends

**Design reference:** ["Save changes" and "Done" in the drawer footer][n9-1022]. **Picker, unsaved state and confirmation are not shown in the design.**
**Priority:** Must · **Size:** M
**Dependencies:** PC-26, PC-24

**Acceptance criteria**
1. "Add access group" opens a searchable 400px picker listing group name, door count and schedule. **Given** an Operations user, **then** restricted groups appear locked with "Security role required".
2. Added groups show an "Unsaved" tag. Nothing changes at the doors until "Save changes".
3. Removing a group asks for a one-step confirmation.
4. "Save changes" is disabled (or hidden) when nothing has changed. With unsaved changes, closing the drawer, stepping to another person or navigating away prompts "Discard changes to Tomás Reyes's access?".
5. **When** saved, **then** the change propagates (PC-24), each grant or removal writes an audit entry, and a grant to a contractor can have an end date.
6. **Given** the session is about to time out, **then** unsaved edits are kept as a draft (brief).

**Out of scope:** approving restricted groups (Security does this through PC-34 or directly).
**Notes / open questions:** [Question] "Done" and "Save changes" are both always shown. What does "Done" do when there are unsaved changes (OQ-5)?

### PC-28: See a person's recent access activity
**As** Maria Alvarez (Operations)
**I want** the last 30 days of this person's access events
**So that** I can see whether their credential is actually working and when they were last in

**Design reference:** ["Activity Log" tab label][n9-929]. **Tab content is not shown in the design.**
**Priority:** Should · **Size:** M
**Dependencies:** PC-14

**Acceptance criteria**
1. Events are listed newest first with time, outcome (icon plus text), door and any linked exception, for example "9:08:14 AM · Admitted · Lobby B turnstile · Possible tailgating (open exception) → View in Live Activity".
2. **Given** an Operations user, **then** security-classified events show as "Restricted event".
3. The footer reads "Showing 30 days. Full history in the Audit Log →".
4. In privacy mode, events show doors and times without names.
5. **Given** no events, **then** the tab reads "No access in the last 30 days." [Assumption: copy not in the brief]

**Out of scope:** history beyond 30 days (Audit Log).
**Notes / open questions:** The design calls this tab "Activity Log", the brief "Activity".

### PC-29: See the change history for a person
**As** David Okafor (Security)
**I want** every change to this person and their credentials, with who made it and its audit ID
**So that** I can confirm offboarding happened and answer auditors

**Design reference:** ["Audit History" tab label][n9-929]. **Tab content is not shown in the design.**
**Priority:** Should · **Size:** S
**Dependencies:** PC-14

**Acceptance criteria**
1. Entries show date (with year), change, source and actor, for example "Oct 3, 2026 · Added to 'Harborview – Tenant parking' · Kestrel parking list sync · SmartAccess" and "Mar 2, 2026 · Mobile credential ••••7731 issued · Kestrel roster sync · SmartAccess".
2. Every entry shows its audit ID.
3. Contact reveals ("Email revealed by Maria Alvarez") appear here too.
4. The footer shows a shield icon, "Logged to audit trail" and the classification "Internal · Confidential".
5. Entries are read-only. There is no edit or delete.

**Out of scope:** export (Audit Log screen).
**Notes / open questions:** none.

---

## Epic 5: Clear the "Needs review" list
Only a few credential problems need a person: a roster that disagrees with a badge, a possible duplicate, a restricted-zone extension. The list must be short, explain itself, and let Maria decide in a click, using the same patterns as Live Activity's "Needs you" lane so her muscle memory carries over.

### PC-30: See the credential problems routed to me, most important first
**As** Maria Alvarez (Operations)
**I want** a short list of credential problems the system couldn't settle, sorted by severity
**So that** I can clear them between front-desk requests

**Design reference:** [Needs review section][n9-114], [Section header][n9-116], [Footer][n9-222]
**Priority:** Must · **Size:** M
**Dependencies:** none

**Acceptance criteria**
1. The header shows "NEEDS REVIEW", a count badge "5", "— Credential anomalies routed to human operator. All standard workflows run autonomously." and a "Collapse" toggle. The collapsed state is remembered per user and exposed with `aria-expanded`.
2. Rows are sorted by severity (High, Medium, Low), then oldest first. The top 3 are shown, with "Show 2 more (Wen Li-Hartmann, Lars Henriksen) →" below.
3. Each row shows an avatar (or a lock tile for restricted items), the person, a severity-and-type tag with text ("HIGH · ACCESS EXTENSION", "MED · ROSTER/BADGE MISMATCH", "MED · POSSIBLE DUPLICATE"), context ("Tenant employee · Castellan Insurance"), a one-line summary, and actions in fixed slots (Approve, Deny, Ask, overflow "⋯"). Slots with nothing to do are left out, not disabled.
4. Each row shows its age ("2h ago", with the absolute time in a tooltip) (brief, **not shown in the design**).
5. The footer reads "All actions logged to immutable site audit trail".
6. Each row is an `<article>` with a heading, and the section is a labelled region ("Needs review, 5 items").
7. Action labels never truncate. With long translations they wrap onto a second row.

**Out of scope:** decisions (PC-32 to PC-38).
**Notes / open questions:** [Question] Severity tags use red for High and violet for Medium, with no icons (OQ-4). [Question] The brief's subtext is "Credential problems the system routed to a person. Everything else is kept up to date automatically." The design's wording ("anomalies", "human operator") is more technical. Confirm the copy.

### PC-31: Understand why an item needs me
**As** Maria Alvarez (Operations)
**I want** to expand a review row and see the policy, the signals, the confidence and what was already done automatically
**So that** I can decide without investigating in another tool

**Design reference:** **Not shown in the design.** No row has an expand control.
**Priority:** Must · **Size:** M
**Dependencies:** PC-30

**Acceptance criteria**
1. Each row has a "Why this needs you" disclosure with `aria-expanded`, operable from the keyboard.
2. Expanded, it shows the policy with version and a "View policy" link (for example "Expired credentials: deny and route when roster disagrees" (v1)), the signals ("Badge status Expired Oct 5, 2026", "Castellan roster Active (synced 6:00 AM)", "3 denied attempts at Lobby A turnstile 2 between 8:58 and 9:04 AM"), confidence or "Rule-based", and the routing reason ("The badge and the tenant roster disagree, so a person must decide.").
3. Confidence shows a percentage and a band word ("87% · Medium"), never a color or bar alone.
4. **Given** something was done automatically, **then** it is listed ("Badge ••••2207 suspended at 48 of 48 doors at 8:30 AM. Mobile credential ••••8815 still works.").
5. "View policy" opens Access Policy & Autonomy in a new tab, read-only for Operations. Security also sees "Change in Autonomy Controls" where relevant.
6. The structure matches Live Activity's "Why the system routed this to you" (Live Activity STORY-09).

**Out of scope:** policy editing.
**Notes / open questions:** [Question] The design has no expand control and shows none of these details (OQ-7).

### PC-32: Resolve a badge that disagrees with the tenant roster
**As** Maria Alvarez (Operations)
**I want** to renew, keep expired, or ask the tenant about an expired badge for someone the roster says is active
**So that** Kenji gets back in quickly if he's still employed, and stays out if he isn't

**Design reference:** [Row 2: Kenji Watanabe][n9-162], [Kenji's directory row][n9-469]
**Priority:** Must · **Size:** M
**Dependencies:** PC-30, PC-24; cross-screen Live Activity STORY-10 (Card 4 "Badge denied 3 times", EXC-4463) and STORY-16

**Acceptance criteria**
1. The row shows "Kenji Watanabe", "MED · ROSTER/BADGE MISMATCH", "Tenant employee · Castellan Insurance", "Badge ••••4821 expired Oct 5, 2026, but Castellan roster lists employee active" and a link "3 denied attempts today (EXC-4463)" that opens that exception in Live Activity.
2. Actions are "Renew badge to Jan 3, 2027" (Approve slot), "Keep expired" (Deny slot), "Ask tenant" (Ask slot) and "⋯". The overflow includes "Issue mobile credential instead".
3. "Renew badge to Jan 3, 2027" commits in one click (default 90 days, date editable in a popover). The badge becomes Active, the change propagates to the doors, and a toast offers Undo for 30 seconds.
4. **When** Maria decides here, **then** Live Activity exception EXC-4463 is resolved with the same decision and audit ID, and the reverse is also true: deciding EXC-4463 in Live Activity removes this row ("Resolved in Live Activity by David Okafor at 9:16 AM").
5. "Keep expired" records the decision and leaves the badge expired. It needs no confirmation because it doesn't change access.
6. After the decision, Kenji's directory row status and chip update without a reload.

**Out of scope:** changing the roster.
**Notes / open questions:** [Question] The brief says "Also open in Live Activity as 'Badge denied 3 times' (EXC-4463). Deciding here resolves both." The design shows only the link, so the user isn't told that both will resolve. [Question] The design says "Ask tenant", the brief says "Ask Castellan admin" (OQ-16).

### PC-33: Show Operations a restricted placeholder for a Security-only request
**As** Maria Alvarez (Operations)
**I want** to know a Security-only access request exists without seeing its details
**So that** I'm aware of it in my building while restricted-zone decisions stay with Security

**Design reference:** [Row 1: Dmitri Volkov (High / Restricted)][n9-133], [Dmitri's directory row][n9-514]
**Priority:** Must · **Size:** S
**Dependencies:** PC-30; pattern shared with Live Activity STORY-26

**Acceptance criteria**
1. **Given** an Operations user, **then** the row shows a lock tile, "HIGH · ACCESS EXTENSION", "Contractor · Castellan Insurance", "Security-reviewed access request · Sponsor: Castellan Facility Security Team", "Routed to Security console. Operational access details masked." and "REQ-9921".
2. The only action is "View status", which shows the status (open, approved, expired or declined) and nothing else.
3. The API never sends the request details (dates, signals, requester, restricted group doors) to an Operations session. This is enforced server-side.
4. The row uses the restricted treatment (dashed border, lock, muted text) and cannot be decided by keyboard shortcuts.
5. The lock tile has a text alternative ("Restricted").

**Out of scope:** Security's view (PC-34).
**Notes / open questions:** [Question] The design shows Dmitri's name to Operations and adds "View status". The brief shows no name and no actions, and asks whether Operations should see a placeholder at all (OQ-3). [Question] The sponsor differs: "Castellan Facility Security Team" (design) versus "Hannah Becker, IT Manager, Castellan Insurance" (brief).

### PC-34: Approve or let lapse a restricted-zone access extension
**As** David Okafor (Security)
**I want** to approve or decline a sponsor's request to extend a contractor's restricted-zone access, with the evidence in front of me
**So that** server-room access only continues when there is a real, current reason

**Design reference:** **Not shown in the design.** Only the Operations placeholder ([Row 1][n9-133]) is drawn.
**Priority:** Must · **Size:** M
**Dependencies:** PC-30, PC-31, PC-24

**Acceptance criteria**
1. **Given** a Security user, **then** the row shows "Castellan Insurance asked to extend 'Server rooms – Tier 2' access from Oct 7 to Nov 6, 2026." and "Requester: Hannah Becker, IT Manager, Castellan Insurance".
2. "Why" shows the policy "Restricted zones: Security approves every grant and extension" (v2), the signals (work order CAS-IT-2291 runs to Nov 6, 2026; 14 server-room entries in 30 days, all within 7 AM–7 PM; 1 denied attempt today at 9:05 AM outside the window, linked to its Live Activity event), "Rule-based" and "Restricted-zone access changes always need a Security approval."
3. Actions are "Approve extension", "Let it expire Oct 7", "Ask sponsor" and "⋯".
4. "Approve extension" commits in one click with Undo for 30 seconds. "Let it expire Oct 7" needs no confirmation because access ends on schedule.
5. The decision is logged with the request ID (REQ-9921), and the Operations placeholder updates to its final status.
6. Dmitri's directory status changes from "Pending extension" to Active with the new end date, or to "Expires Oct 7, 2026".

**Out of scope:** granting new restricted groups outside a request.
**Notes / open questions:** [Assumption] The work-order reference is illustrative. [Question] A Security-role variant of frame 9:2 is needed (OQ-9).

### PC-35: Decide whether two records are the same person
**As** Maria Alvarez (Operations)
**I want** to compare two possible duplicate records side by side and merge them or keep them separate
**So that** one person doesn't hold two sets of credentials that nobody tracks

**Design reference:** [Row 3: Ahmed Al-Rashid / Ahmed Alrashid][n9-198]. **The compare dialog is not shown in the design.**
**Priority:** Should · **Size:** L
**Dependencies:** PC-30, PC-31

**Acceptance criteria**
1. The row shows "Ahmed Al-Rashid / Ahmed Alrashid", "MED · POSSIBLE DUPLICATE", "Matching phone (•••-•••-0142)", "Roster 1: Kestrel Analytics (Employee) · Roster 2: Acme HVAC Services (Building Contractor)", "Compare & merge" and "Keep separate".
2. "Compare & merge" opens a side-by-side dialog showing both records' type, organization, source, credentials and access groups, with differences highlighted by text, not color alone.
3. Merging requires choosing which record survives, shows what will move (credentials, groups, history) and needs explicit confirmation. People are never merged automatically.
4. **Given** one record is roster-managed, **then** the roster record survives and the dialog explains that the other record's credentials move to it. [Assumption]
5. "Keep separate" records the decision so the same pair isn't flagged again, and it is logged.
6. Merge and keep-separate are both logged with both person IDs. A merge can be reversed by Security within a set period. [Assumption]

**Out of scope:** automatic merge rules.
**Notes / open questions:** [Question] The brief says the contractor record was "added manually Sep 30, 2026", but the design says it came from a second roster (Acme HVAC Services). It also omits the brief's "87% · Medium" confidence. [Question] What exactly happens to credentials and audit history on merge (OQ-11)?

### PC-36: Resolve dormant-badge and lost-badge items
**As** Maria Alvarez (Operations)
**I want** to clean up a badge nobody uses and finish handling a badge reported lost
**So that** unused credentials don't become a security gap, and people who lost a badge get a replacement fast

**Design reference:** ["Show 2 more (Wen Li-Hartmann, Lars Henriksen)"][n9-222]. **These rows are not shown in the design.**
**Priority:** Should · **Size:** M
**Dependencies:** PC-30, PC-19, PC-20

**Acceptance criteria**
1. Wen Li-Hartmann's row (Low) reads "Badge ••••1176 hasn't been used in 94 days. Wen uses Mobile credential ••••5021 daily." with "Revoke badge" (opens the PC-20 confirmation), "Keep badge" and "⋯".
2. Its Why shows "Dormant credentials: suggest revoke after 90 days" (v1) and "Dormant-badge cleanup is set to 'Suggest only' at Harborview Tower.", plus a "Change in Autonomy Controls" link for Security only.
3. Lars Henriksen's row (Low) reads "Reported lost by Northwind Legal's tenant admin at 8:30 AM." and "Already done automatically: Badge ••••2207 suspended at 48 of 48 doors at 8:30 AM. Mobile credential ••••8815 still works."
4. Lars's actions are "Issue replacement badge" (one click, restores access), "Mobile only: revoke badge" (confirmation required) and "Ask Northwind admin".
5. "Keep badge" records the decision and suppresses the same suggestion for a set period. [Assumption]

**Out of scope:** changing the dormant-credential policy.
**Notes / open questions:** [Question] The code's `ReviewKind` lists `mobile-not-activated` and `stale-suspension`, not dormant-badge or lost-badge. Which review types does v1 support (OQ-12)? [Question] Lars's organization is "Nordic Trade Partners" in the design and "Northwind Legal" in the brief (OQ-2).

### PC-37: Ask a tenant admin or sponsor, assign, or add a note
**As** Maria Alvarez (Operations)
**I want** to ask the tenant admin or sponsor a question from the row, or hand the item to a colleague
**So that** items I can't decide alone still move forward and have an owner

**Design reference:** "Ask tenant" on [Row 2][n9-162], "⋯" on all rows. **Popover and overflow menu are not shown in the design.**
**Priority:** Should · **Size:** M
**Dependencies:** PC-30

**Acceptance criteria**
1. "Ask [tenant / sponsor / admin]" opens a popover with the recipient pre-filled (for example "Castellan admin"), an optional message and "Send".
2. After sending, the row shows "Waiting on Castellan admin · asked 9:16 AM" and stays in the list.
3. The overflow offers "Assign", "Add note" and "Open person". Assigned rows show an assignee chip.
4. Asking, assigning and notes are logged.
5. Popovers trap focus, close with Escape and return focus to the trigger. The overflow button has an accessible name ("More actions for Kenji Watanabe").

**Out of scope:** tenant-admin portal where the answer comes back.
**Notes / open questions:** [Question] How is the tenant admin reached (email, tenant portal) and how does their answer get back to the row (OQ-16)?

### PC-38: See the outcome of a review decision, undo it, or recover from a failure
**As** Maria Alvarez (Operations)
**I want** clear confirmation that my decision was recorded, a short undo window, and honest errors
**So that** I never think a badge was renewed when it wasn't, and a mis-click doesn't lock someone out

**Design reference:** **Not shown in the design** (brief: Review row states, Toast)
**Priority:** Must · **Size:** M
**Dependencies:** PC-30; pattern shared with Live Activity STORY-10, STORY-13, STORY-16

**Acceptance criteria**
1. While saving, the row shows "Recording decision…" and its other buttons are disabled.
2. On success, the row collapses to a one-line record, for example "✓ Badge ••••4821 renewed to Jan 3, 2027 by Maria Alvarez · 9:16 AM · Logged to audit trail (AUD-1006-002214)", then leaves the list after 5 seconds (instantly under reduced motion).
3. Focus moves to the next row's title, or to the empty state (PC-39).
4. Actions that restore or extend access offer Undo for 30 seconds in the toast. The undo is its own audit entry. Actions that remove access are confirmed first and have no one-click undo.
5. **Given** the save fails, **then** the row shows an inline error "Couldn't record decision. Nothing was changed at the doors. [Retry]", announced as an alert. Retry is idempotent.
6. **Given** someone else resolves the item first, **then** the row shows "Resolved by David Okafor at 9:16 AM" and its buttons are removed.
7. Counts in the section badge, Card 3 and the top-bar chip update together.

**Out of scope:** bulk decisions on review items.
**Notes / open questions:** none.

### PC-39: See a calm message when nothing needs review
**As** Maria Alvarez (Operations)
**I want** a single calm line when the list is empty
**So that** I can move on, confident that credentials are in order

**Design reference:** **Not shown in the design** (brief: Empty-state copy)
**Priority:** Should · **Size:** S
**Dependencies:** PC-30

**Acceptance criteria**
1. **Given** 0 review items, **then** the section is replaced by a shield-check icon and "All credentials are in order. 41 changes were handled automatically this week." There is no call to action.
2. The "41" matches Card 1.
3. After the last decision, focus moves to this line.
4. There is no celebratory animation.

**Out of scope:** none.
**Notes / open questions:** none.

---

## Epic 6: Add people and act on many at once
Most tenant employees arrive through rosters. Building staff, contractors and tenants without a roster are added by hand, and contractors need an end date. Bulk actions serve changes such as "extend all Acme HVAC contractors by a week".

### PC-40: Add a building-staff member or contractor
**As** Maria Alvarez (Operations)
**I want** to add a person with their type, organization, access groups, access dates and first credential in one form
**So that** a new facilities technician or contractor can get in on their first day without a ticket

**Design reference:** ["Add person" button][n9-29]. **The Add person drawer is not shown in the design.**
**Priority:** Must · **Size:** L
**Dependencies:** PC-22, PC-27

**Acceptance criteria**
1. The drawer starts with "Most tenant employees are added automatically from tenant rosters. Add people here for building staff, contractors, or tenants without a roster connection."
2. Fields: Person type (Building staff / Contractor / Tenant employee), Given name, Family name, "Show family name first", Organization, Sponsor (required for contractors), Work email, Mobile phone (optional, needed for a mobile credential), Role label (used in privacy mode), Access groups (restricted groups locked for Operations), Access starts / Access ends (end date required for contractors), and First credential (Mobile credential invite by default, Badge, PIN, QR pass for contractors, None for now).
3. Required fields are marked with the word "Required". Fields have visible labels and `autocomplete` (given-name, family-name, email, tel).
4. Validation runs on blur after the first edit. Errors appear under the field (linked with `aria-describedby`), and an error summary at the top links to each field on submit.
5. The primary button's label follows the first-credential choice ("Add person and send invite"). Next to it is "Cancel".
6. **When** submitted, **then** the person appears in the directory, the credential is issued, the change propagates to the doors, and an audit entry is written.
7. A single-name person (mononym) can be saved with an empty family name. [Assumption]
8. Unsaved form data is kept as a draft if the session times out.

**Out of scope:** roster connection setup; badge printing.
**Notes / open questions:** [Assumption] Contractors always have an end date. Suggest splitting into "Add building staff" and "Add contractor (sponsor, end date, QR pass)" at estimation if it's too large.

### PC-41: Catch duplicates while adding a person
**As** Maria Alvarez (Operations)
**I want** to be told if the person I'm adding may already exist
**So that** I don't create a second record with its own credentials

**Design reference:** **Not shown in the design** (brief: Add person, duplicate check)
**Priority:** Should · **Size:** S
**Dependencies:** PC-40

**Acceptance criteria**
1. On blur of name or email, **given** a similar record exists, **then** an inline notice reads "A similar person already exists: Ahmed Al-Rashid · Kestrel Analytics." with "Open" and "Continue anyway".
2. "Open" opens the existing person's drawer and keeps the draft.
3. "Continue anyway" is logged, and the pair can still be flagged later (PC-35).
4. **Given** two people share a name but have different emails, **then** the notice doesn't appear.
5. The notice is announced politely and doesn't move focus.

**Out of scope:** fuzzy matching tuning.
**Notes / open questions:** none.

### PC-42: Select several people and apply a non-destructive bulk change
**As** Maria Alvarez (Operations)
**I want** to select many people and add or remove a group, suspend credentials, send mobile invites or extend contractor end dates
**So that** a change for a whole contractor crew takes one action instead of twenty

**Design reference:** Row checkboxes in the [data table][n9-309]. **The bulk action bar is not shown in the design.**
**Priority:** Should · **Size:** M
**Dependencies:** PC-06

**Acceptance criteria**
1. Rows can be selected with the checkbox, `X`, or Shift+click for a range. The header checkbox selects the page, and a banner then offers "Select all 1,912 matching".
2. A sticky bar shows "3 people selected", "Add access group", "Remove access group", "Suspend credentials", "Send mobile invites" and "Extend end date" (contractors only).
3. Suspension asks for a reason. Every action reports a summary toast, for example "Suspended credentials for 3 people · 1 couldn't be changed (restricted) · [View details]".
4. Each person's change is logged individually, with a shared batch ID.
5. Selection count changes are announced politely ("3 people selected"). Checkboxes have 44px hit areas and accessible names ("Select Tomás Reyes").
6. Bulk actions are hidden at tablet widths (brief).

**Out of scope:** bulk revoke (PC-43).
**Notes / open questions:** none.

### PC-43: Revoke credentials for several people at once
**As** David Okafor (Security)
**I want** to revoke credentials for a group of people with a typed confirmation
**So that** I can shut off access for an ended contract or a security incident in one step

**Design reference:** **Not shown in the design** (brief: Bulk action bar overflow)
**Priority:** Could · **Size:** M
**Dependencies:** PC-42, PC-20

**Acceptance criteria**
1. "Revoke credentials" lives in the bulk bar's overflow, not as a visible button.
2. The dialog shows the number of people and credentials affected and requires typing the count ("Type 3 to confirm") and a reason.
3. Focus starts on "Cancel". The confirm button is destructive in style.
4. Results report successes and failures per person, and offline doors trigger the PC-24 warning.
5. Each revocation is logged individually, with a shared batch ID.

**Out of scope:** scheduled revocation.
**Notes / open questions:** [Question] Should Operations have bulk revoke at all (OQ-13)?

---

## Epic 7: See only what my role and the room allow, and keep working when things go wrong
This screen is a list of named people that is often shown at a front desk or shared with tenant admins. Role limits and privacy mode are trust requirements (David holds a veto). The console runs on internal networks, so it must stay honest when data is stale.

### PC-44: Enforce what Operations, Security and view-only users can see and do
**As** David Okafor (Security)
**I want** restricted groups, biometrics and security-classified items limited to Security, and front-desk staff limited to viewing
**So that** least-privilege holds on the screen that controls who gets into the building

**Design reference:** The design shows the Operations view: [restricted review row][n9-133], [restricted group chip][n9-514], [sidebar user card][n9-794]. **Security and view-only variants are not shown.**
**Priority:** Must · **Size:** M
**Dependencies:** PC-06, PC-14, PC-30

**Acceptance criteria**
1. **Operations** can add and edit people, issue, suspend, replace and revoke badge, mobile, PIN and QR credentials, and assign standard groups. They cannot assign restricted groups, manage biometrics, see security-classified items or events, or edit group definitions.
2. **Security** sees and can do everything on this screen, including restricted groups, biometric enrollment, classified review items and "Manage access groups".
3. **View-only** users can search, browse and open drawers. All action buttons are replaced by "View only · Ask an Operations or Security admin to make changes.", and contact details can't be revealed. [Assumption: role not in `Role` type]
4. Every restriction is enforced by the API, not only hidden in the UI. Restricted data is never sent to a session that can't see it.
5. A blocked action never fails silently. The user sees why ("Security role required").

**Out of scope:** role administration.
**Notes / open questions:** [Question] `Role` in `web/src/types/index.ts` has only 'operations' | 'security'. A view-only role would need a type change. [Question] Should Operations see Guadalupe's elevated "All Doors Master" group and be able to remove it?

### PC-45: Turn on privacy mode on People & Credentials
**As** Maria Alvarez (Operations), who shares this screen with tenant admins
**I want** the Privacy toggle to hide names, contact details and credential numbers everywhere on this screen
**So that** I can screen-share or work at the front desk without exposing personal data

**Design reference:** ["Privacy" in the top bar][n9-754]. **Privacy-on state is not shown in the design.**
**Priority:** Must · **Size:** M
**Dependencies:** PC-06, PC-14, PC-30; shares the toggle with Live Activity STORY-28

**Acceptance criteria**
1. Turning on "Privacy" (or `Shift+P`) applies immediately to the table, drawer, review rows and toasts, and shows the banner "Privacy mode is on: names, contact details and credential numbers are hidden."
2. Names become role label · organization ("Tenant employee · Castellan Insurance", "HVAC technician · Acme HVAC Services"), and avatars become a generic person icon.
3. Emails in the table, the contact line and "Reveal" are removed. `last4` suffixes are hidden (chips read "Badge").
4. Activity shows doors and times without names. Biometric cards show only "Biometric".
5. Search still works, but results and tooltips are masked.
6. The toggle exposes its state (`aria-pressed` or switch) and persists for the session, shared with Live Activity.

**Out of scope:** per-field privacy settings.
**Notes / open questions:** [Question] Full names are shown by default here but masked on Live Activity ("Kenji W."). The brief marks this as an assumption to confirm with Security (OQ-1).

### PC-46: Load progressively and stay honest when data is stale or the connection drops
**As** Maria Alvarez (Operations)
**I want** the page to show structure immediately, retry parts that fail, and block access changes while disconnected
**So that** I never believe a change reached the doors when it didn't

**Design reference:** "As of 9:15 AM EDT · Real-time pipeline updates every 60s" ([timestamp][n9-110]). **Loading, error and offline states are not shown in the design.**
**Priority:** Must · **Size:** M
**Dependencies:** PC-01 to PC-03, PC-06, PC-30; pattern shared with Live Activity STORY-30 and STORY-32

**Acceptance criteria**
1. On first load, the header, card frames and toolbar render at once. Summary values, 3 review rows and 12 table rows show skeletons matching their layout. There is no full-page spinner, and loading regions set `aria-busy`.
2. **Given** the table fails, **then** it shows "Couldn't load people. [Retry]" and "Needs review" stays usable.
3. **Given** the connection drops, **then** a banner reads "Connection lost. Showing people as of 9:14:32 AM. Doors keep enforcing their last synced access lists. Reconnecting in 10s… [Retry now]", announced assertively once.
4. While disconnected, every action that changes access is disabled, with the tooltip "Can't change access while disconnected." The directory and drawer stay readable.
5. The caption under the summary strip shows when figures were last refreshed and dims when stale.

**Out of scope:** offline queueing of changes.
**Notes / open questions:** The design's caption reads "Real-time pipeline updates every 60s". The brief says "Updates every 60s". "Real-time" and "every 60s" contradict each other. Confirm the copy.

### PC-47: Keep the directory stable while data changes underneath
**As** Maria Alvarez (Operations)
**I want** changes from roster sync and colleagues to wait behind a pill instead of reshuffling the table
**So that** the row I'm about to click doesn't move

**Design reference:** **Not shown in the design** (brief: Live data)
**Priority:** Should · **Size:** S
**Dependencies:** PC-06

**Acceptance criteria**
1. The table never re-sorts, inserts or removes rows on its own while the user is looking at it.
2. **Given** 3 people changed, **then** a pill above the table reads "↑ 3 people updated · Refresh", announced politely.
3. Status changes to visible rows update in place, so a stale "Active" badge is never shown.
4. Refreshing keeps filters, sort, page and the open drawer.

**Out of scope:** real-time co-editing indicators.
**Notes / open questions:** none.

### PC-48: Work the screen fully from the keyboard and a screen reader
**As** Maria Alvarez (Operations), an expert daily user
**I want** shortcuts and a predictable focus order
**So that** I can answer a lookup in under 10 seconds without the mouse

**Design reference:** "/" hint in the [search field][n9-233]. **Shortcut list is not shown in the design.**
**Priority:** Should · **Size:** M
**Dependencies:** PC-06, PC-14, PC-30

**Acceptance criteria**
1. Shortcuts (listed under `?`, disabled while typing): `/` search, `J` / `K` next and previous row (also in the drawer), `Enter` open drawer, `X` select row, `1`–`4` drawer tabs, `G` then `R` jump to Needs review, `Esc` close. There are no single-key shortcuts for destructive actions.
2. Tab order: top bar → page header actions → summary cards → Needs review rows → search → segments → filters → table → pagination. Focus is trapped in the open drawer (header → tabs → panel → footer).
3. Drawer tabs follow the ARIA tabs pattern (arrow keys move between tabs).
4. The focus ring is a 2px `--ring` (#A78BFA) outline with a 2px offset, and is never removed.
5. All controls have at least a 44 × 44px target, including checkboxes, kebabs, drawer arrows and pagination. The design's 18px overflow buttons and 30px chips need larger hit areas.
6. Interactive control borders reach 3:1 contrast. The design's `#27272A` borders on inputs and dropdowns don't, so controls need `#71717A` or a `--control-border` token.

**Out of scope:** user-defined shortcuts.
**Notes / open questions:** none.

### PC-49: Use the screen at laptop widths, in other languages and in RTL
**As** Maria Alvarez (Operations), across a portfolio with international tenants
**I want** the screen to adapt down to 1024px and handle long translations, name orders and RTL
**So that** it works for every site team and every person's name

**Design reference:** **Not shown in the design.** The frame is drawn at 1280px, the brief at 1440px.
**Priority:** Should · **Size:** M
**Dependencies:** PC-06, PC-14

**Acceptance criteria**
1. From 1024 to 1439px, the sidebar collapses to a 64px rail and the drawer is 480px. Below 1280px, the Type column merges into the Person cell and the Access column hides (still available through Columns and the drawer).
2. From 768 to 1023px, the screen is read-mostly: summary cards stack, the table shows Person, Status and Last access, the drawer is full width and bulk actions are hidden. Below 768px it shows "People & Credentials is designed for screens 1024px or wider."
3. Labels, buttons and statuses tolerate 30–40% longer text: they wrap in the drawer and truncate with a tooltip in the table.
4. In RTL, the layout mirrors (drawer from the left, leading-edge bars on the right, arrows flipped, toast bottom right). Credential suffixes, IDs and emails stay LTR through bidi isolation. Test with "يوسف الحداد · Lumen Biotech".
5. Dates always include the year and use the site's time zone. Numbers and schedules are localized. Relative times ("Expiring in 2d") always have an absolute date.
6. Family-name sorting uses locale-aware collation ("Ramírez" under R, "Åkesson" per locale).

**Out of scope:** a mobile lookup view (brief open question).
**Notes / open questions:** [Question] Confirm the reference width. At 1280px the header subtitle and several labels already wrap (for example "7 / Exceptions" in the top bar).

---

## Traceability table

| Figma frame (node) | Stories |
|---|---|
| People & Credentials, whole frame ([9:2][n9-2]) | All stories |
| Top bar: site switcher, "7 Exceptions", search, Privacy, bell, help, avatar ([9:754][n9-754]) | PC-45; site switching, search and notifications are Live Activity STORY-05 and STORY-06 |
| Sidebar: nav, user card ([9:794][n9-794]) | PC-05, PC-44 |
| Page header: title, "1,912 active profiles", subtitle ([9:6][n9-6]) | PC-05 |
| Roster sync status chip ([9:18][n9-18]) | PC-04 |
| View access groups ([9:24][n9-24]) | PC-05 |
| Add person ([9:29][n9-29]) | PC-05, PC-40 |
| Card 1: Automated changes ([9:57][n9-57]) | PC-01, PC-39 |
| Card 2: Active credentials ([9:77][n9-77]) | PC-02 |
| Card 3: Needs review metric ([9:35][n9-35]) | PC-03 |
| Timestamp sub-strip ([9:110][n9-110]) | PC-01, PC-46 |
| Needs review section header, list, footer ([9:114][n9-114], [9:116][n9-116], [9:222][n9-222]) | PC-30, PC-36, PC-39 |
| Row 1: Dmitri Volkov, restricted ([9:133][n9-133]) | PC-33, PC-34, PC-44 |
| Row 2: Kenji Watanabe, roster/badge mismatch ([9:162][n9-162]) | PC-21, PC-32, PC-37, PC-38 |
| Row 3: Ahmed Al-Rashid, possible duplicate ([9:198][n9-198]) | PC-35, PC-41 |
| Toolbar row 1: search, type segments ([9:232][n9-232], [9:233][n9-233], [9:241][n9-241]) | PC-08, PC-09, PC-48 |
| Toolbar row 2: filters, Reset, Columns, density, count ([9:258][n9-258]) | PC-10, PC-11, PC-12 |
| Table header ([9:311][n9-311]) | PC-06, PC-12 |
| Row: Tomás Reyes, selected ([9:327][n9-327]) | PC-06, PC-14 |
| Row: Priya Shah ([9:371][n9-371]) | PC-07 |
| Row: Guadalupe Ramírez-Castellanos de la Fuente, long name, elevated group ([9:420][n9-420]) | PC-06, PC-07, PC-44 |
| Row: Kenji Watanabe, expired ([9:469][n9-469]) | PC-07, PC-32 |
| Row: Dmitri Volkov, restricted, pending extension ([9:514][n9-514]) | PC-07, PC-34, PC-44 |
| Row: Tanaka Yuki, family name first ([9:556][n9-556]) | PC-06, PC-49 |
| Row: Rahul Mehta ([9:598][n9-598]) | PC-06 (sample data conflict, OQ-2) |
| Row: Carlos Mendoza, expiring ([9:646][n9-646]) | PC-07 |
| Row: Lars Henriksen, suspended ([9:689][n9-689]) | PC-07, PC-36 |
| Pagination footer ([9:729][n9-729]) | PC-11 |
| Drawer backdrop ([9:753][n9-753]) | PC-14 |
| Drawer header: ID, sync, arrows, close ([9:861][n9-861]) | PC-14 |
| Person summary header ([9:884][n9-884]) | PC-15 |
| Masked contact line + Reveal ([9:901][n9-901]) | PC-15, PC-45 |
| Live Activity exception banner ([9:913][n9-913]) | PC-16 |
| Drawer tabs: Credentials, Access Groups, Activity Log, Audit History ([9:929][n9-929]) | PC-17, PC-26, PC-28, PC-29 |
| Credential card: Mobile Wallet Key ([9:947][n9-947]) | PC-17, PC-24 |
| Credential actions: Suspend, Replace, ⋯ ([9:979][n9-979]) | PC-18, PC-19, PC-20 |
| Add credential dropdown ([9:988][n9-988]) | PC-22 |
| Check a door / Access Simulator ([9:996][n9-996], [9:1011][n9-1011]) | PC-25 |
| Drawer footer: Revoke all credentials, Done, Save changes ([9:1022][n9-1022]) | PC-23, PC-27 |
| *Not in Figma:* roster popover and failure banner, Why disclosure, Security view, rows 4–5 of Needs review, compare/merge dialog, Ask popover, overflow menus, decided/failed review states, empty Needs review, Access/Activity/History tab content, confirmation dialogs, toasts, door-sync progress and offline warning, Add person drawer, duplicate check, bulk bar, view-only role, privacy-on, loading/error/offline, live-update pill, shortcut list, 1024px/1440px/RTL | PC-04, 13, 18–24, 26–29, 31, 34–49 (marked "Not shown in the design") |

---

## Open questions

1. **[Product + Security] Unmasked emails in the directory.** Every table row shows the full work email ("t.reyes@kestrel-analytics.com"), while the drawer masks the same email behind a logged "Reveal". The brief puts role label · organization on that line. Also confirm whether full names should be shown by default here when Live Activity masks them ("Kenji W."). *Blocks PC-06, PC-15, PC-45.*
2. **[Product + Design] Sample data contradicts the brief and Live Activity.** Priya Shah is Castellan Insurance with ••••1104/••••8841 here, but Kestrel Analytics with Mobile ••••2290 in the brief and on Live Activity. Rahul Mehta is a Nexus BioMed tenant employee here, but an Acme HVAC contractor with QR ••••3107 on Live Activity. Dmitri Volkov holds ••••3107 here, but badge ••••0917 in the brief. Guadalupe, Carlos Mendoza, Lars Henriksen (Nordic Trade Partners versus Northwind Legal) and Tanaka Yuki (Active versus Pending activation) also differ, and door names differ ("Lobby B turnstile 03" versus "Lobby B turnstile"). The brief says shared people must tell one story across both screens. *Blocks PC-16, PC-32, PC-36 and mock data for all stories.*
3. **[Product + Security] What Operations sees of a restricted request.** The design shows Dmitri's name, "REQ-9921" and a "View status" action to Operations. The brief shows no name and no actions, and asks whether Operations should see a placeholder at all. *Blocks PC-33, PC-44.*
4. **[Design] Color and severity treatment.** High is red and Medium is violet, and severity is shown with dots without icons (Card 3). "Expired badge" and "Suspended" statuses are red. The brief uses amber for High, sky for Medium, icons on every severity and status, and says red is never used for routine statuses. *Blocks PC-03, PC-07, PC-30.*
5. **[Product] Drawer action model.** The design has an always-visible "Revoke all credentials" (irreversible) plus "Done" and "Save changes" in the footer. The brief has a reversible "Suspend access" in the header, "Offboard person" in an overflow menu, and a footer that appears only with unsaved changes. What does "Revoke all" remove (credentials only, or groups and person status too)? Is there a reversible suspend-everything? *Blocks PC-23, PC-27.*
6. **[Design] "Check a door" placement and framing.** The brief puts it on the Access tab. The design puts it on the Credentials tab as "Access Simulator" / "Policy Simulator v3" and adds "Anti-passback: 180s strict", which no doc defines. *Blocks PC-25.*
7. **[Design] No "Why this needs you" disclosure and no age on review rows.** The brief requires both, matching Live Activity. *Blocks PC-30, PC-31.*
8. **[Product + Design] Default filter and counts.** The status filter defaults to "Active (1,842)", yet the table shows 1,912 records including Expired and Suspended people, and the header says "1,912 active profiles". The brief's Source filter and active-filter chips are missing, and "Reset" replaces "Clear all". *Blocks PC-05, PC-09, PC-10.*
9. **[Design] Missing frames needed before build:** Security-role view, Access Groups / Activity Log / Audit History tab content, Add person drawer, bulk bar, roster popover and failure banner, compare/merge dialog, Ask popover, overflow menus, confirmation dialogs, toasts, decided/failed review states, empty, loading, error and offline states, privacy-on, and 1024px/1440px widths. The Live Activity banner also overlaps the tab row. *Blocks PC-04, 13, 18–24, 26–29, 31, 34–49.*
10. **[Product] Credential vocabulary.** "Mobile Wallet Key" (design) versus "Mobile credential" (brief), "Temp Pass" in Add credential, and "Guest QR" in Card 2's legend, although visitor passes aren't managed here. One glossary is needed that matches `CredentialKind`. *Blocks PC-02, PC-17, PC-22.*
11. **[Product + Engineering] Duplicate merge semantics.** The design says the second record came from a roster ("Acme HVAC Services (Building Contractor)"), the brief says it was added manually. Which record survives? What happens to credentials, groups and audit history, and can a merge be reversed? *Blocks PC-35.*
12. **[Engineering + Product] Review item types.** `ReviewKind` in the code lists access-extension, roster-mismatch, possible-duplicate, mobile-not-activated and stale-suspension. The brief's items 4–5 are dormant badge and lost badge (Wen Li-Hartmann and Lars Henriksen, named in the design's "Show 2 more"). *Blocks PC-36.*
13. **[Product + Security] Operations' revoke rights.** Should Operations revoke at all (single, all, bulk), or only suspend? Should a replaced credential stop before or after the new one is activated? *Blocks PC-19, PC-20, PC-23, PC-43.*
14. **[Legal + Security] Biometric consent.** BIPA and GDPR may require a consent record ("Consent on file · Jan 14, 2026"). Is on-controller template storage the real architecture? *Blocks PC-17, PC-22.*
15. **[Engineering] Data model gaps.** `CredentialStatus` lacks expiring, lost-reported and pending-activation. There's no person status (active, pending extension, suspended, offboarded), `source` lacks contractor pre-registration, and there are no access start/end dates, no view-only role, and no `nameOrder` beyond `familyNameFirst`. The design's statuses ("Pending extension", "Expiring in 2d") need a home. *Blocks PC-07, PC-10, PC-40, PC-44.*
16. **[Product] "Ask" flow.** The design says "Ask tenant", the brief "Ask Castellan admin". How is the tenant admin or sponsor contacted, and how does the reply come back? *Blocks PC-32, PC-37.*
17. **[Engineering] Roster mechanism.** The drawer says "Managed via SCIM Roster Integration · Tenant ID: KST-9044", while the brief describes a daily 6:00 AM batch. SCIM could push changes in near real time. *Blocks PC-04, PC-15.*
18. **[Engineering] Offline doors and cached access lists.** Can an offline controller still accept a revoked credential? This decides how loud the PC-24 warning is. *Blocks PC-24.*

---

## Assumptions

- The design shows the **Operations** view (Maria Alvarez's user card, the restricted review row). Security and view-only behaviour follow `ux-prompts/02-people-credentials.md`.
- Personas are proto-personas: Maria Alvarez (Operations), David Okafor (Security), and a front-desk view-only role that exists only in the brief.
- Behaviour, copy and states not drawn in Figma follow the brief. Where the design and the brief differ, the stories quote the design and raise the difference as a question.
- Tenant rosters sync automatically and drive auto-provisioning and auto-revocation. The case brief doesn't confirm this.
- Access groups (named bundles of doors and schedules, with a restricted flag) are defined on Access Policy & Autonomy and only assigned here.
- Edge controllers cache access lists and keep enforcing them while offline.
- Deciding Kenji's review item resolves Live Activity exception EXC-4463 and vice versa, sharing one audit ID.
- Roster-managed fields are read-only on this screen. Merges keep the roster-managed record.
- The 90-day default renewal, 30-second undo window, 5-second row removal and 250ms search debounce come from the brief and are illustrative.
- All people, organizations, work orders, request IDs and audit IDs are fictitious.

---

## Suggested release slicing

- **MVP (look people up and fix credentials safely, for Operations and Security):** PC-01, 03, 04, 06, 07, 08, 10, 11, 13, 14, 15, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27, 30, 31, 32, 33, 34, 38, 40, 44, 45, 46
- **Next (efficiency, depth and hygiene):** PC-02, 05, 09, 12, 16, 21, 28, 29, 35, 36, 37, 39, 41, 42, 47, 48, 49
- **Later:** PC-43

[n9-2]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-2
[n9-6]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-6
[n9-18]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-18
[n9-24]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-24
[n9-29]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-29
[n9-35]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-35
[n9-57]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-57
[n9-77]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-77
[n9-110]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-110
[n9-114]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-114
[n9-116]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-116
[n9-133]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-133
[n9-162]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-162
[n9-198]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-198
[n9-222]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-222
[n9-232]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-232
[n9-233]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-233
[n9-241]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-241
[n9-258]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-258
[n9-260]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-260
[n9-268]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-268
[n9-276]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-276
[n9-284]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-284
[n9-292]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-292
[n9-295]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-295
[n9-300]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-300
[n9-309]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-309
[n9-311]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-311
[n9-327]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-327
[n9-371]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-371
[n9-420]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-420
[n9-469]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-469
[n9-514]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-514
[n9-556]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-556
[n9-598]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-598
[n9-646]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-646
[n9-689]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-689
[n9-729]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-729
[n9-753]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-753
[n9-754]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-754
[n9-794]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-794
[n9-860]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-860
[n9-861]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-861
[n9-884]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-884
[n9-901]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-901
[n9-913]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-913
[n9-929]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-929
[n9-946]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-946
[n9-947]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-947
[n9-979]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-979
[n9-988]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-988
[n9-996]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-996
[n9-1011]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-1011
[n9-1022]: https://www.figma.com/design/uqnoX7e1psML7i9b7KGgwy/SmartAccess-Live-Activity-Console?node-id=9-1022
