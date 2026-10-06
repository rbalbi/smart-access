import type { AccessEvent, ExceptionItem, Person } from '@/types'

// Generates plausible live traffic for the demo. Deterministic when given a
// seeded random function, so tests can rely on it.

export type Rng = () => number

export function seededRng(seed: number): Rng {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 2 ** 32
  }
}

const people: Person[] = [
  {
    givenName: 'Amara',
    familyName: 'Okonkwo',
    roleLabel: 'Tenant employee',
    org: 'Kestrel Analytics',
  },
  {
    givenName: 'Liang',
    familyName: 'Chen',
    roleLabel: 'Tenant employee',
    org: 'Northwind Legal',
  },
  {
    givenName: 'Sofia',
    familyName: 'Lindqvist',
    roleLabel: 'Tenant employee',
    org: 'Lumen Biotech',
  },
  {
    givenName: 'Mateus',
    familyName: 'Oliveira',
    roleLabel: 'Tenant employee',
    org: 'Castellan Insurance',
  },
  {
    givenName: 'Fatima',
    familyName: 'Al-Sayed',
    roleLabel: 'Tenant employee',
    org: 'Kestrel Analytics',
  },
  {
    givenName: 'Noah',
    familyName: 'Fischer',
    roleLabel: 'Contractor',
    org: 'Brightline Electric',
  },
  {
    givenName: 'Aiyana',
    familyName: 'Redcloud',
    roleLabel: 'Building staff',
    org: 'Meridian Property Partners',
  },
  {
    givenName: 'Wojciech',
    familyName: 'Kowalczyk-Nowak',
    roleLabel: 'Tenant employee',
    org: 'Lumen Biotech',
  },
]

const entries = [
  'Lobby A turnstile 1',
  'Lobby A turnstile 2',
  'Lobby B turnstile',
  'Parking P1 gate',
  'Floor 11 suite door',
  'Floor 7 suite door',
]

function pick<T>(rng: Rng, list: T[]): T {
  return list[Math.floor(rng() * list.length)]
}

function digits(rng: Rng) {
  return String(Math.floor(rng() * 10000)).padStart(4, '0')
}

let seq = 500

export function nextEvent(rng: Rng, now: Date): AccessEvent {
  const at = now.toISOString()
  const id = `EVT-${String(++seq).padStart(5, '0')}`
  const roll = rng()

  if (roll < 0.8) {
    const person = pick(rng, people)
    const location = pick(rng, entries)
    const confidence = 0.93 + Math.round(rng() * 6) / 100
    return {
      id,
      occurredAt: at,
      outcome: 'admitted',
      location,
      subject: person,
      credential: {
        kind: rng() < 0.7 ? 'mobile' : 'badge',
        last4: digits(rng),
      },
      reasoning: {
        policy: 'Tenant employees: weekday access 6 AM – 10 PM',
        policyShort: 'Tenant weekday',
        policyVersion: 'v3',
        confidence,
        signals: [
          { label: 'Credential', value: 'Valid', tone: 'ok' },
          { label: 'Schedule', value: 'Within hours', tone: 'ok' },
        ],
      },
      timeline: [
        { at, text: `Credential verified at ${location}`, emphasis: 'current' },
        { at, text: 'Access granted (autonomous grant)', emphasis: 'outcome' },
      ],
    }
  }

  if (roll < 0.93) {
    const location = pick(rng, entries)
    return {
      id,
      occurredAt: at,
      outcome: 'denied',
      location,
      headline: 'Credential outside schedule',
      context: 'Holder notified',
      credential: { kind: 'badge', last4: digits(rng) },
      reasoning: {
        policy: 'Tenant employees: weekday access 6 AM – 10 PM',
        policyShort: 'Tenant weekday',
        policyVersion: 'v3',
        confidence: null,
        signals: [{ label: 'Schedule', value: 'Outside hours', tone: 'bad' }],
      },
      timeline: [
        { at, text: `Badge presented at ${location}`, emphasis: 'current' },
        { at, text: 'Entry denied by schedule rule', emphasis: 'outcome' },
      ],
    }
  }

  return {
    id,
    occurredAt: at,
    outcome: 'suppressed',
    location: 'Dock 2',
    headline: 'Door-held-open alarm suppressed',
    context: 'Delivery window active',
    reasoning: {
      policy: 'Loading docks: 2 min hold outside delivery windows',
      policyShort: 'Dock schedule',
      policyVersion: 'v2',
      confidence: 0.95,
      signals: [
        { label: 'Delivery schedule', value: 'Active window', tone: 'ok' },
      ],
    },
    timeline: [
      {
        at,
        text: 'Alarm suppressed: inside the delivery window',
        emphasis: 'outcome',
      },
    ],
  }
}

let excSeq = 4500

export function nextException(
  rng: Rng,
  now: Date,
  opts: { critical?: boolean } = {},
): ExceptionItem {
  const at = now.toISOString()
  const id = `EXC-${++excSeq}`
  if (opts.critical) {
    return {
      id,
      type: 'forced-door',
      severity: 'critical',
      title: 'Forced door',
      location: 'Dock 2 side door',
      occurredAt: at,
      summary:
        'Door opened without a credential or exit request. Relock is pending until the door closes.',
      classified: false,
      status: 'open',
      cameraId: 'CAM-D2-02',
      reasoning: {
        policy: 'Loading docks: alarm on forced entry',
        policyShort: 'Dock security',
        policyVersion: 'v2',
        confidence: 0.95,
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
        ],
      },
    }
  }
  const person = pick(rng, people)
  return {
    id,
    type: 'tailgating',
    severity: 'high',
    title: 'Possible tailgating',
    location: pick(rng, entries),
    occurredAt: at,
    summary:
      '2 people passed on 1 credential. The turnstile locked for the next entry.',
    subject: person,
    credential: { kind: 'mobile', last4: digits(rng) },
    classified: false,
    status: 'open',
    reasoning: {
      policy: 'Lobby turnstiles: one person per credential',
      policyShort: 'Anti-tailgating',
      policyVersion: 'v3',
      confidence: 0.78 + Math.round(rng() * 10) / 100,
      routedBecause:
        'Confidence is below the 90% threshold for acting automatically.',
      signals: [
        { label: 'Beam sensors', value: '2 broken', tone: 'warn' },
        { label: 'Credentials presented', value: '1', tone: 'neutral' },
      ],
    },
  }
}
