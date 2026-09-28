# SmartAccess — Strategic Overview

*As of 2026-09-28 · Draft v0.1*

> Sources: the SmartAccess case brief (Scenario Four). Anything not stated in the brief is marked **[Assumption]**.

---

## 1. Executive summary

SmartAccess is betting that building access control should **decide for itself**, not just automate. Today's systems unlock doors on a schedule or a badge swipe, but a person still has to interpret alarms, approve exceptions and respond to incidents. SmartAccess combines IoT sensors, software, AI and analytics to make access and building-system decisions on its own, within policies the operator sets.

The product ships as an **out-of-the-box, secure-by-design platform**. It runs on internal networks with no public IP exposure, encrypts its data and manages security policy centrally. It targets commercial building managers, property management firms, developers and surveillance companies running offices, factories and warehouses.

**The wedge:** secure, low-friction access. **The expansion:** using the same sensor and decision layer to run building operations such as HVAC, energy, water, maintenance and space use.

---

## 2. Market opportunity

| Signal | Figure (from brief) |
| --- | --- |
| Smart building market size | $160B projected by 2026 |
| Annual growth rate | ~15% |
| Sector revenue | $34B expected |

**Growth drivers:**
- More attention to how building space is used
- Wider adoption of IoT-enabled building management systems
- Urbanization and denser multi-tenant buildings
- Higher tenant expectations for tech-enabled experiences

**Why now:**
- IoT hardware has become cheap enough to deploy widely.
- Edge AI has matured enough to make decisions on-site.
- Rising concern about cyberattacks on building control systems has created demand for platforms that are secure by default.

> **Note on the figures:** The brief's "$160B market" and "$34B revenue" likely measure different things, such as total addressable market versus realized vendor revenue. The 2026 forecast year is also the current year. Before external use, validate both figures and restate them as current-year data. **[Open question]**

---

## 3. Target customers and core problems

**Primary segments:**
1. **Commercial building management organizations:** operate portfolios of office and mixed-use buildings.
2. **Property management firms:** manage buildings on behalf of owners and are measured on tenant satisfaction and operating cost.
3. **Developers:** new construction is the best moment to specify smart infrastructure from day one.
4. **Surveillance / security companies:** channel partners who could bundle SmartAccess into their security offerings.

**Facility types:** commercial buildings, factories, warehouses.

**The problems we solve:**

| Pain point | What it looks like today | Who feels it most |
| --- | --- | --- |
| Access friction | Residents, employees, guests and contractors can't get in when they need to. Lost badges, expired credentials, visitor queues. | Occupants, front desk, facility managers |
| Security concerns | Owners and operators don't trust legacy systems. Incidents are caught late or by a human reviewing logs. | Security / IT leaders, owners |
| Evolving tenant expectations | Tenants expect app-based, IoT- and AI-enabled experiences like the ones they have at home. | Property managers, developers (leasing appeal) |

---

## 4. Product vision and value proposition

**Vision:** Every building SmartAccess runs knows who should be where, keeps itself secure and runs itself efficiently, with people only stepping in for true exceptions.

**Value proposition:**
> For building operators who need better security and lower operating costs, SmartAccess is an intelligent access and building platform that **makes autonomous, sensor-driven decisions**, unlike legacy access systems that automate the routine but still depend on humans to act.

**Core capabilities (from brief):**
- Real-time monitoring across access points and building systems
- Internal networks with no IP exposure
- End-to-end data encryption
- Centralized security policy management
- Out-of-the-box deployment with high reliability

**Customer benefits:**

| Benefit | Outcome |
| --- | --- |
| Improved experience | Better physical safety and security; more comfort and satisfaction for tenants and visitors |
| Efficient operations | Preventative and predictive maintenance that lowers operating costs |
| Increased sustainability | Energy and water savings, a lower carbon footprint, better use of space |

**Differentiation:**
1. **Autonomy, not just automation:** sensor readings drive decisions without a human in the loop for routine cases.
2. **Secure by architecture:** no public IP exposure is a structural advantage over cloud-first competitors, not a feature toggle.
3. **Fast time to value:** out-of-the-box deployment, compared with the multi-month integration projects typical of large incumbents. **[Assumption: incumbents require long integrations]**

---

## 5. Strategic pillars and phased roadmap

**Pillar A — Frictionless, secure access (the wedge)**
Mobile and credential-based access, visitor management and autonomous exception handling, such as auto-granting a pre-registered contractor or flagging tailgating.

**Pillar B — Trusted security platform**
Central policy management, encryption, anomaly detection, audit trails and hardened edge devices.

**Pillar C — Intelligent building operations (expansion)**
Use occupancy and sensor data to drive HVAC, lighting, energy and water, predictive maintenance and space-use insights.

**Foundation:** reliable hardware supply and power resilience, an integration layer, and a partner channel.

**Phased roadmap [Assumption — timing illustrative]:**

| Phase | Focus | Exit criteria |
| --- | --- | --- |
| 1. Launch (0–12 mo) | Pillar A + core of Pillar B for commercial offices and warehouses | 10 paying sites; deployment under 2 weeks per site |
| 2. Expand (12–24 mo) | Anomaly detection, predictive maintenance, first HVAC/energy automations; surveillance-partner channel | Measurable energy savings at pilot sites; 2+ channel partners live |
| 3. Platform (24+ mo) | Full building operations, portfolio analytics, developer (new-build) packages | Multi-building portfolio customers; attach rate of ops modules |

---

## 6. Success metrics

| Area | Metric | Why it matters |
| --- | --- | --- |
| Adoption | Sites and doors under management; time to deploy | Tests whether "out-of-the-box" holds |
| Access experience | Denied-when-authorized rate; median entry time; visitor check-in time | Measures access friction directly |
| Autonomy | % of access events and exceptions resolved without human intervention | Our core differentiator |
| Security | Incidents detected; mean time to detect and respond; zero control-system breaches | Trust is the product |
| Operations | Maintenance cost per site; unplanned downtime | Proves the efficiency benefit |
| Sustainability | Energy and water use per sq ft vs. baseline | Proves the sustainability benefit |
| Business | ARR, net revenue retention, module attach rate | Tests whether the wedge-to-platform expansion works |

---

## 7. Risks, mitigations and open questions

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Power supply failures | Doors fail unsafe or unsecure; life-safety exposure | Battery backup and fail-safe/fail-secure policies per door; voltage regulation; power-health monitoring |
| Critical equipment availability (controllers, actuators, safety modules, voltage regulators) | Deployment delays, stalled growth | Dual-source key components; certify hardware from third parties; hold buffer stock |
| Security breaches / cyberattacks on control systems | Catastrophic trust loss; physical-security compromise | No IP exposure, encryption, signed firmware, least-privilege policies, pen testing, incident response plan |
| Digital vandalism | Service disruption, tampering | Tamper detection, anomaly alerts, secure device provisioning |
| Autonomous decisions going wrong | Wrongful lockouts or wrongful grants | Human override, confidence thresholds, full audit trail, a gradual autonomy dial per customer |
| Incumbent response (JCI, Siemens, Cisco) | Price pressure; bundling | Win on speed to deploy, autonomy and security architecture; partner rather than compete where possible |

**Open questions**
- Business model: hardware margin, SaaS subscription, or both? Price per door, per site or per sq ft?
- Build our own hardware or certify third-party hardware?
- Which segment first: owner-operators or property managers?
- How much should the product integrate with existing BMS/HVAC systems versus replace them?
- What regulatory and certification requirements apply (fire and life safety codes, data privacy for biometrics)?
