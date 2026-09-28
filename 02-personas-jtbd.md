# SmartAccess — Personas & Jobs to Be Done

*As of 2026-09-28 · Draft v0.1*

> These personas are **proto-personas**. They are built from the case brief's target segments, pain points and benefits, not from primary research. Names, demographics and quotes are illustrative **[Assumption]**. Validate them through customer interviews before relying on them.

**The set at a glance**

| Persona | Role in the deal | Primary pain point | Primary benefit sought |
| --- | --- | --- | --- |
| Maria — Operations Manager | Buyer / daily admin | Access friction, operating cost | Efficient operations |
| David — Security & IT Director | Technical decision-maker / veto holder | Security concerns | Trustworthy, secure platform |
| Priya — Tenant / Occupant | End user; shapes renewals | Access friction, evolving expectations | Improved experience |

JTBD format: *When [situation], I want to [motivation], so I can [outcome].*

---

## Persona 1 — Maria Alvarez, Director of Property Operations

**Segment:** Property management firm
**Portfolio:** 6 multi-tenant commercial buildings, ~1.2M sq ft **[Assumption]**
**Reports to:** VP of Asset Management
**Measured on:** operating expense (OpEx) per sq ft, tenant satisfaction and retention, work-order response time

> "I spend my week chasing badge problems, HVAC complaints and vendor access. I want the building to handle the routine stuff so my team can focus on tenants."

**Context**
- Runs a lean on-site team across buildings; each building uses a mix of legacy access, HVAC and maintenance systems.
- Front desks deal with lost badges, visitor queues and contractors who arrive without access.
- Pressured by owners to cut OpEx and show sustainability progress.

**Pains**
- Access friction produces constant tickets and tenant complaints.
- Reactive maintenance: equipment fails before anyone notices.
- No single view across buildings; data is spread across disconnected systems.
- Energy costs are rising and she can't easily see where waste happens.

**Gains she wants**
- Fewer access tickets and faster, self-serve visitor and contractor entry
- Predictive alerts before equipment fails
- Portfolio-level dashboards of energy, occupancy and incidents
- Proof of savings to take to the owner

**Jobs to be done**

| Type | Job statement |
| --- | --- |
| Functional | When a contractor or visitor needs entry, I want access granted automatically within the rules I've set, so my team isn't pulled into every exception. |
| Functional | When equipment starts showing signs of failure, I want to be alerted and have a work order created before it breaks, so I avoid downtime and emergency repair costs. |
| Functional | When I report to the owner, I want clear numbers on energy, water and operating savings, so I can justify the investment and my budget. |
| Emotional | I want to feel in control of my buildings instead of constantly firefighting. |
| Social | I want owners and tenants to see my buildings as modern and well-run. |

**What wins her:** fast deployment, measurable OpEx savings, fewer tickets, and one pane of glass across the portfolio.

---

## Persona 2 — David Okafor, Director of Security & IT

**Segment:** Commercial building management org or industrial operator (factories, warehouses)
**Scope:** Physical security and the networks that building systems run on
**Measured on:** incidents, audit and compliance results, system uptime, zero breaches

> "Every connected device is another door a hacker can walk through. I won't approve anything that puts our control systems on the internet."

**Context**
- Signs off on any system that touches the network. He holds a veto in the buying process.
- Has seen building systems become attack vectors and is wary of IoT vendors.
- Oversees multiple sites with different access-control products and policies.

**Pains**
- Security concerns: legacy systems are hard to patch, poorly encrypted, and sometimes exposed to the internet.
- Inconsistent policies across sites; no central control or audit trail.
- Alarms need a human to review them, so real incidents get lost in the noise.
- Fear of digital vandalism and cyberattacks on control systems.

**Gains he wants**
- An architecture with no IP exposure, encryption everywhere and signed firmware
- Centralized security policy management across all sites
- Real-time monitoring with intelligent anomaly detection, not just raw alerts
- Complete, exportable audit logs for compliance

**Jobs to be done**

| Type | Job statement |
| --- | --- |
| Functional | When evaluating a new building system, I want proof it won't expose our network, so I can approve it without adding attack surface. |
| Functional | When access rules change (new hire, offboarding, new site), I want to update policy once and have it apply everywhere, so there are no gaps between sites. |
| Functional | When something abnormal happens (tailgating, forced door, odd access pattern), I want the system to detect it, act and notify me with context, so I respond to real threats, not noise. |
| Functional | When auditors ask, I want a complete record of who accessed what and when, so compliance reviews are painless. |
| Emotional | I want confidence that our physical and digital perimeter can't be quietly compromised. |
| Social | I want to be seen as the leader who modernized security without creating new risk. |

**What wins him:** a security architecture he can verify (no IP exposure, encryption, pen-test results), central policy control, and autonomy with human override and full audit trails.

---

## Persona 3 — Priya Shah, Tenant Employee / Building Occupant

**Segment:** End user in a commercial office. The equivalent in factories and warehouses is a shift worker.
**Role:** Operations lead at a tenant company **[Assumption]**
**Influence:** Doesn't buy the system, but her experience drives her company's satisfaction and lease-renewal decisions.

> "I just want to walk in. And when I have guests, I don't want them stuck at the front desk for ten minutes."

**Context**
- Uses her smartphone for everything; expects building access to work the same way.
- Often hosts visitors and occasionally works outside normal hours.
- Notices when rooms are too hot or cold or when spaces are hard to find.

**Pains**
- Access friction: forgotten badges, after-hours lockouts, slow visitor check-in.
- Building tech feels years behind her home and phone experience.
- Comfort issues (temperature, occupied rooms) with no easy way to fix them.

**Gains she wants**
- Hands-free or phone-based entry that just works
- Easy guest invites with automatic access
- A comfortable, well-run space
- Confidence that the building is safe

**Jobs to be done**

| Type | Job statement |
| --- | --- |
| Functional | When I arrive at the building, I want to get in without fumbling for a badge, so I can start my day without friction. |
| Functional | When I invite a guest, I want them to receive access automatically before they arrive, so they aren't stuck in the lobby. |
| Functional | When I need to come in after hours, I want access to work reliably within my permissions, so I'm never locked out. |
| Emotional | I want to feel safe and welcome in the building. |
| Social | I want my guests to be impressed by a modern, seamless workplace. |

**What wins her:** speed, reliability and a mobile-first experience. She mostly notices the system when it fails.

---

## Cross-persona implications for the product

| Theme | Maria (Ops) | David (Security) | Priya (Occupant) | Product implication |
| --- | --- | --- | --- | --- |
| Autonomy | Wants fewer exceptions to handle | Wants autonomy only with guardrails | Wants it to just work | Adjustable autonomy per policy, human override and full audit trail |
| Security | Assumes it's handled | Deal-breaker requirement | Wants to feel safe | Lead with architecture proof (no IP exposure, encryption) in the sales process |
| Visibility | Portfolio dashboards, savings | Central policy, incidents, audit | None needed | Role-based consoles: operations view vs. security view |
| Experience | Fewer tickets | Fewer false alarms | Seamless entry, guest invites | Mobile credentials and self-serve visitor flow in v1 |
| Proof of value | OpEx and energy savings | Detection and response metrics | Satisfaction | Built-in reporting on savings, security and experience |

**Buying dynamic:** Maria usually starts the purchase and owns the budget. David can veto on security. Priya's experience shows up in tenant satisfaction and renewals. Sales should arm Maria with ROI, give David verifiable security proof, and show Priya's experience in demos.
