import type {
  AccessEvent,
  ConsoleSnapshot,
  Door,
  ExceptionItem,
  Site,
} from '@/types'

// The Figma scenario (a snapshot at 9:15:02 AM at Harborview Tower), with every
// timestamp expressed as an offset from "now" so live timers stay correct
// whenever the demo runs.

export const site: Site = {
  id: 'harborview',
  name: 'Harborview Tower',
  address: '200 Harbor Street · Boston, MA',
  timeZone: 'America/New_York',
  gateway: 'Meridian Edge Gateway (Node #4)',
}

export const sites: Pick<Site, 'id' | 'name' | 'address'>[] = [
  site,
  { id: 'riverside', name: 'Riverside Plant 3', address: 'Charlotte, NC' },
  { id: 'northgate', name: 'Northgate Logistics Hub', address: 'Columbus, OH' },
]

const doorNames = [
  'Lobby A turnstile 1',
  'Lobby A turnstile 2',
  'Lobby A kiosk',
  'Lobby B turnstile',
  'Stairwell C, Level 4 door',
  'Server Room 2F',
  'Mailroom',
  'Dock 2',
  'Dock 3',
  'Dock 4',
  'Parking P1 gate',
]

function buildDoors(): Door[] {
  const doors: Door[] = doorNames.map((name, i) => ({
    id: `door-${i + 1}`,
    name,
    state:
      name === 'Dock 4'
        ? 'offline'
        : name === 'Parking P1 gate'
          ? 'battery'
          : 'online',
  }))
  // The rest of the site's 48 access points (floors 3-24).
  for (let i = doors.length; i < 48; i++) {
    doors.push({
      id: `door-${i + 1}`,
      name: `Floor ${i - 8} suite door`,
      state: 'online',
    })
  }
  return doors
}

export function buildSnapshot(now: Date): ConsoleSnapshot {
  const ago = (seconds: number) =>
    new Date(now.getTime() - seconds * 1000).toISOString()

  const exceptions: ExceptionItem[] = [
    {
      id: 'EXC-4471',
      type: 'forced-door',
      severity: 'critical',
      title: 'Forced door',
      location: 'Stairwell C, Level 4 door',
      occurredAt: ago(179),
      summary:
        'Door opened without a credential or exit request. The door relocked automatically 38 seconds later.',
      classified: false,
      status: 'open',
      cameraId: 'CAM-SC-04',
      reasoning: {
        policy: 'Stairwell C: egress only, alarm on forced entry',
        policyShort: 'Stairwell egress',
        policyVersion: 'v2',
        confidence: 0.97,
        routedBecause:
          'Forced-door events require human acknowledgement under site policy.',
        signals: [
          { label: 'Door position sensor', value: 'Open', tone: 'bad' },
          {
            label: 'Credential reader',
            value: 'No badge presented',
            tone: 'neutral',
          },
          {
            label: 'Request-to-exit button',
            value: 'Not pressed',
            tone: 'neutral',
          },
          { label: 'Mechanical lock', value: 'Locked', tone: 'ok' },
        ],
      },
    },
    {
      id: 'EXC-4468',
      type: 'tailgating',
      severity: 'high',
      title: 'Possible tailgating',
      location: 'Lobby B turnstile',
      occurredAt: ago(408),
      summary:
        '2 people passed on 1 credential. The turnstile locked for the next entry.',
      subject: {
        givenName: 'Tomás',
        familyName: 'Reyes',
        roleLabel: 'Tenant employee',
        org: 'Kestrel Analytics',
      },
      credential: { kind: 'mobile', last4: '7731' },
      classified: false,
      status: 'open',
      cameraId: 'CAM-LB-01',
      reasoning: {
        policy: 'Lobby B: one person per credential',
        policyShort: 'Anti-tailgating',
        policyVersion: 'v3',
        confidence: 0.82,
        routedBecause:
          'Confidence is below the 90% threshold for acting automatically.',
        signals: [
          { label: 'Beam sensors', value: '2 broken', tone: 'warn' },
          { label: 'Credentials presented', value: '1', tone: 'neutral' },
          { label: 'Overhead LiDAR', value: '+2 people', tone: 'warn' },
        ],
      },
    },
    {
      id: 'EXC-4466',
      type: 'restricted-area',
      severity: 'high',
      title: 'Badge used outside clearance hours',
      location: 'Server Room 2F',
      occurredAt: ago(602),
      summary:
        'A Tier 2 badge was presented at Server Room 2F outside its 7 AM – 7 PM clearance window. The door stayed locked.',
      subject: {
        givenName: 'Dmitri',
        familyName: 'Volkov',
        roleLabel: 'IT contractor',
        org: 'Castellan Insurance',
      },
      credential: { kind: 'badge', last4: '0917' },
      classified: true,
      routingId: 'SEC-CONF-88219',
      status: 'open',
      cameraId: 'CAM-2F-03',
      reasoning: {
        policy: 'Server rooms: Tier 2 clearance, business hours only',
        policyShort: 'Server room clearance',
        policyVersion: 'v5',
        confidence: null,
        routedBecause: 'Restricted-zone events always route to Security.',
        signals: [
          { label: 'Clearance', value: 'Tier 2 (valid)', tone: 'ok' },
          { label: 'Clearance window', value: 'Outside hours', tone: 'bad' },
          { label: 'Door state', value: 'Held locked', tone: 'ok' },
        ],
      },
    },
    {
      id: 'EXC-4463',
      type: 'badge-denied',
      severity: 'medium',
      title: 'Badge denied 3 times',
      location: 'Lobby A turnstile 2',
      occurredAt: ago(662),
      summary:
        'An active employee was denied 3 times in 6 minutes. The badge expired yesterday, but the tenant roster lists the person as active.',
      subject: {
        givenName: 'Kenji',
        familyName: 'Watanabe',
        roleLabel: 'Tenant employee',
        org: 'Castellan Insurance',
      },
      credential: { kind: 'badge', last4: '4821' },
      classified: false,
      status: 'open',
      reasoning: {
        policy: 'Expired credentials: deny and route when roster disagrees',
        policyShort: 'Credential validity',
        policyVersion: 'v1',
        confidence: null,
        routedBecause:
          'The badge and the tenant roster disagree, so a person must decide.',
        signals: [
          { label: 'Badge status', value: 'Expired yesterday', tone: 'bad' },
          { label: 'Tenant roster', value: 'Active', tone: 'ok' },
          { label: 'Attempts', value: '3 in 6 min', tone: 'warn' },
        ],
      },
    },
    {
      id: 'EXC-4469',
      type: 'door-held-open',
      severity: 'medium',
      title: 'Door held open',
      location: 'Dock 3',
      occurredAt: ago(272),
      summary: 'Limit is 2 min outside the scheduled delivery window.',
      classified: false,
      status: 'open',
      heldOpen: { since: ago(272), limitSeconds: 120 },
      cameraId: 'CAM-D3-01',
      reasoning: {
        policy: 'Loading docks: 2 min hold outside delivery windows',
        policyShort: 'Dock schedule',
        policyVersion: 'v2',
        confidence: null,
        routedBecause: 'Hold time exceeded and no delivery is scheduled.',
        signals: [
          { label: 'Door position sensor', value: 'Open', tone: 'warn' },
          { label: 'Delivery schedule', value: 'None now', tone: 'neutral' },
        ],
      },
    },
    {
      id: 'EXC-4462',
      type: 'visitor-no-invite',
      severity: 'medium',
      title: 'Visitor without invite',
      location: 'Lobby A kiosk',
      occurredAt: ago(675),
      summary:
        "Visitor checked in at the kiosk, but no calendar invite was found. The host was notified and hasn't responded.",
      subject: {
        givenName: 'Chiamaka',
        familyName: 'Eze',
        roleLabel: 'Visitor',
      },
      visitor: {
        host: 'Lars Henriksen',
        hostOrg: 'Northwind Legal, Fl 11',
        notifiedAt: ago(675),
      },
      classified: false,
      status: 'open',
      reasoning: {
        policy: 'Visitors: admit only with a host invite',
        policyShort: 'Visitor invite',
        policyVersion: 'v4',
        confidence: null,
        routedBecause: 'No invite on file and the host has not responded.',
        signals: [
          { label: 'Calendar invite', value: 'Not found', tone: 'bad' },
          { label: 'Host response', value: 'Waiting', tone: 'warn' },
        ],
      },
    },
    {
      id: 'EXC-4455',
      type: 'controller-offline',
      severity: 'medium',
      title: 'Door controller unreachable',
      location: 'Dock 4',
      occurredAt: ago(1682),
      summary:
        'The controller stopped reporting. It keeps enforcing its last policy locally and will sync events when it reconnects.',
      classified: false,
      status: 'open',
      reasoning: {
        policy: 'Hardware health: route controllers silent for 5+ min',
        policyShort: 'Hardware health',
        policyVersion: 'v1',
        confidence: null,
        routedBecause: 'Hardware faults need a person to dispatch a fix.',
        signals: [
          { label: 'Last heartbeat', value: '28 min ago', tone: 'bad' },
          { label: 'Local enforcement', value: 'Active', tone: 'ok' },
        ],
      },
    },
    {
      id: 'EXC-4452',
      type: 'controller-battery',
      severity: 'low',
      title: 'Controller on battery power',
      location: 'Parking P1 gate',
      occurredAt: ago(1442),
      summary:
        'Mains power lost. The gate is processing credentials locally and will fail secure if the battery runs out.',
      classified: false,
      status: 'open',
      assignee: 'Carlos Mendoza',
      battery: { percent: 64, minutesRemaining: 130 },
      reasoning: {
        policy: 'Hardware health: notify on battery power',
        policyShort: 'Hardware health',
        policyVersion: 'v1',
        confidence: null,
        routedBecause: 'Power problems need facilities follow-up.',
        signals: [
          { label: 'Mains power', value: 'Lost', tone: 'bad' },
          { label: 'Battery', value: '64%', tone: 'warn' },
        ],
      },
    },
  ]

  const rahulAt = 5563
  const events: AccessEvent[] = [
    {
      id: 'EVT-00431',
      occurredAt: ago(54),
      outcome: 'admitted',
      location: 'Lobby A turnstile 1',
      subject: {
        givenName: 'Priya',
        familyName: 'Shah',
        roleLabel: 'Tenant employee',
        org: 'Kestrel Analytics',
      },
      credential: { kind: 'mobile', last4: '2290' },
      reasoning: {
        policy: 'Tenant employees: weekday access 6 AM – 10 PM',
        policyShort: 'Tenant weekday',
        policyVersion: 'v3',
        confidence: 0.99,
        signals: [
          { label: 'Credential', value: 'Valid', tone: 'ok' },
          { label: 'Schedule', value: 'Within hours', tone: 'ok' },
        ],
      },
      timeline: [
        {
          at: ago(54),
          text: 'Mobile credential verified at Lobby A turnstile 1',
          emphasis: 'current',
        },
        {
          at: ago(53),
          text: 'Turnstile released (autonomous grant)',
          emphasis: 'outcome',
        },
      ],
    },
    {
      id: 'EVT-00430',
      occurredAt: ago(82),
      outcome: 'denied',
      location: 'Lobby A turnstile 2',
      headline: 'Visitor pass expired',
      context: 'Host notified',
      credential: { kind: 'visitor-pass', last4: '5518' },
      reasoning: {
        policy: 'Visitor passes: valid for the invite window only',
        policyShort: 'Pass validity',
        policyVersion: 'v2',
        confidence: null,
        signals: [
          { label: 'Pass window', value: 'Ended 8:30 AM', tone: 'bad' },
        ],
      },
      timeline: [
        {
          at: ago(82),
          text: 'Expired visitor pass presented',
          emphasis: 'current',
        },
        {
          at: ago(81),
          text: 'Entry denied; host notified by SMS',
          emphasis: 'outcome',
        },
      ],
    },
    {
      id: 'EVT-00429',
      occurredAt: ago(120),
      outcome: 'admitted',
      location: 'Mailroom',
      headline: 'Courier delivery',
      context: 'Northwind Legal',
      credential: { kind: 'pin', note: 'one-time' },
      reasoning: {
        policy: 'Couriers: one-time PIN during delivery windows',
        policyShort: 'Courier window',
        policyVersion: 'v1',
        confidence: null,
        signals: [{ label: 'One-time PIN', value: 'Valid', tone: 'ok' }],
      },
      timeline: [
        {
          at: ago(120),
          text: 'One-time PIN entered at Mailroom',
          emphasis: 'current',
        },
        { at: ago(119), text: 'Mailroom door released', emphasis: 'outcome' },
      ],
    },
    {
      id: 'EVT-00428',
      occurredAt: ago(141),
      outcome: 'relocked',
      location: 'Stairwell C, Level 4 door',
      headline: 'Stairwell door relocked',
      context: 'After forced entry',
      relatedExceptionId: 'EXC-4471',
      reasoning: {
        policy: 'Stairwell C: egress only, alarm on forced entry',
        policyShort: 'Stairwell egress',
        policyVersion: 'v2',
        confidence: 0.97,
        signals: [
          { label: 'Door position sensor', value: 'Closed', tone: 'ok' },
        ],
      },
      timeline: [
        {
          at: ago(179),
          text: 'Door forced open (see the exception in Needs you)',
        },
        {
          at: ago(141),
          text: 'Door closed; relocked automatically',
          emphasis: 'outcome',
        },
      ],
    },
    {
      id: 'EVT-00427',
      occurredAt: ago(212),
      outcome: 'suppressed',
      location: 'Dock 2',
      headline: 'Door-held-open alarm suppressed',
      context: 'Delivery scheduled 9–10 AM',
      reasoning: {
        policy: 'Loading docks: 2 min hold outside delivery windows',
        policyShort: 'Dock schedule',
        policyVersion: 'v2',
        confidence: 0.96,
        signals: [
          { label: 'Delivery schedule', value: 'Active window', tone: 'ok' },
          { label: 'Bay occupancy', value: 'Truck present', tone: 'ok' },
        ],
      },
      timeline: [
        {
          at: ago(212),
          text: 'Dock 2 held open past 2 min',
          emphasis: 'current',
        },
        {
          at: ago(211),
          text: 'Alarm suppressed: inside the delivery window',
          emphasis: 'outcome',
        },
      ],
    },
    {
      id: 'EVT-00426',
      occurredAt: ago(287),
      outcome: 'admitted',
      location: 'Parking P1 gate',
      subject: {
        givenName: 'Guadalupe',
        familyName: 'Ramírez-Castellanos',
        roleLabel: 'Tenant employee',
        org: 'Lumen Biotech',
      },
      credential: { kind: 'mobile', last4: '6604' },
      recordedOffline: false,
      reasoning: {
        policy: 'Tenant employees: weekday access 6 AM – 10 PM',
        policyShort: 'Tenant weekday',
        policyVersion: 'v3',
        confidence: 0.98,
        signals: [
          { label: 'Credential', value: 'Valid', tone: 'ok' },
          {
            label: 'Gate power',
            value: 'Battery (local decision)',
            tone: 'warn',
          },
        ],
      },
      timeline: [
        {
          at: ago(287),
          text: 'Mobile credential verified at Parking P1 gate',
          emphasis: 'current',
        },
        {
          at: ago(286),
          text: 'Gate opened (decided locally on battery power)',
          emphasis: 'outcome',
        },
      ],
    },
    {
      id: 'EVT-00412',
      occurredAt: ago(rahulAt),
      outcome: 'admitted',
      location: 'Dock 3',
      subject: {
        givenName: 'Rahul',
        familyName: 'Mehta',
        roleLabel: 'Contractor',
        org: 'Acme HVAC Services',
      },
      context: 'HVAC maintenance',
      credential: { kind: 'qr-pass', last4: '3107', note: 'pre-registered' },
      authorizationWindow: '7:00 AM – 11:30 AM',
      cameraId: 'CAM-D3-01',
      reasoning: {
        policy: 'Contractor Pre-Registration & Loading Dock Protocol',
        policyShort: 'Contractor pre-reg',
        policyVersion: 'v2',
        confidence: 0.99,
        signals: [
          {
            label: 'Pass validation',
            value: 'Cryptographically signed · Valid',
            tone: 'ok',
          },
          {
            label: 'Dock 3 bay occupancy',
            value: 'Van detected (Plate #8K92L)',
            tone: 'neutral',
          },
          {
            label: 'Anti-passback',
            value: 'Pass (no prior entry)',
            tone: 'ok',
          },
          {
            label: 'Corridor context',
            value: 'Single individual observed',
            tone: 'ok',
          },
        ],
      },
      timeline: [
        {
          at: ago(rahulAt + 142039),
          text: 'Pre-registration created',
          actor: 'Olumide Adeyemi (Facilities Mgr)',
        },
        {
          at: ago(rahulAt + 85339),
          text: 'One-day pass sent to contractor phone +1 617-555-0192',
        },
        {
          at: ago(rahulAt),
          text: 'Credential presented and verified at Dock 3 scanner',
          emphasis: 'current',
        },
        {
          at: ago(rahulAt - 1),
          text: 'Pedestrian door unlocked (autonomous grant)',
          emphasis: 'outcome',
        },
        { at: ago(rahulAt - 12), text: 'Door closed; relocked automatically' },
      ],
    },
  ]

  return {
    site,
    doors: buildDoors(),
    exceptions,
    events,
    today: { handled: 1284, total: 1326 },
    // The previous seven days, oldest first (Mon ... Sun); average 95.2%.
    weekAutonomy: [0.94, 0.948, 0.951, 0.955, 0.953, 0.957, 0.96],
    resolutionSeconds: [96, 140, 188, 221, 252, 263, 301, 344, 410],
    baselineResolutionSeconds: 340,
  }
}
