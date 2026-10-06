import type {
  AccessGroup,
  CredentialKind,
  DirectoryPerson,
  IssuedCredential,
  PeopleSnapshot,
  PersonType,
  ReviewItem,
} from '@/types'
import { seededRng, type Rng } from '../stream'
import { buildDoors, site } from './console'

// The Figma "People & Credentials" scenario at Harborview Tower. The people the
// design names come first; a seeded generator fills the rest of the 1,912
// profiles so search, filters and paging work on realistic volume. Times are
// offsets from "now" (or site-local clock times) so they line up with the Live
// Activity snapshot whenever the demo runs.

const TZ = site.timeZone

/** UTC instant for a wall-clock time at the site, `dayOffset` days from now. */
function atSiteTime(now: Date, dayOffset: number, hh: number, mm = 0) {
  const day = new Date(now.getTime() + dayOffset * 86_400_000)
  const [y, m, d] = new Intl.DateTimeFormat('en-CA', { timeZone: TZ })
    .format(day)
    .split('-')
    .map(Number)
  const guess = Date.UTC(y, m - 1, d, hh, mm)
  // How far the site's clock is from UTC at that instant.
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).formatToParts(new Date(guess))
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value)
  const asSite = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
  )
  return new Date(guess - (asSite - guess)).toISOString()
}

const longDate = (iso: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: TZ,
  }).format(new Date(iso))

const shortDate = (iso: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: TZ,
  }).format(new Date(iso))

// ---------- Access groups ----------

/** Door id for a floor's suite door (see buildDoors). */
const floor = (n: number) => `door-${n + 9}`
const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => floor(from + i))

const LOBBIES = ['door-1', 'door-2', 'door-3', 'door-4']
const allDoorIds = buildDoors().map((d) => d.id)

export const groups: AccessGroup[] = [
  {
    id: 'kestrel-staff',
    name: 'Kestrel – Staff',
    restricted: false,
    schedule: 'Every day 5:00 AM – 11:00 PM',
    doorIds: [...LOBBIES, ...range(12, 14)],
  },
  {
    id: 'kestrel-after-hours',
    name: 'Kestrel – After hours',
    restricted: false,
    schedule: 'Every day, all hours',
    doorIds: ['door-4', ...range(12, 14)],
  },
  {
    id: 'castellan-all-floors',
    name: 'Castellan – All Floors',
    restricted: false,
    schedule: 'Weekdays 6:00 AM – 9:00 PM',
    doorIds: [...LOBBIES, ...range(15, 19)],
  },
  {
    id: 'castellan-staff',
    name: 'Castellan – Staff',
    restricted: false,
    schedule: 'Weekdays 6:00 AM – 9:00 PM',
    doorIds: [...LOBBIES, ...range(15, 16)],
  },
  {
    id: 'meridian-ops',
    name: 'Meridian Ops · All Doors Master',
    restricted: false,
    elevated: true,
    schedule: 'Every day, all hours',
    doorIds: allDoorIds.filter((id) => id !== 'door-6'),
  },
  {
    id: 'nexus-lab',
    name: 'Nexus Lab Access · Floor 9',
    restricted: false,
    schedule: 'Every day 6:00 AM – 10:00 PM',
    doorIds: [...LOBBIES, floor(9)],
  },
  {
    id: 'mep',
    name: 'MEP & Mechanical Rooms',
    restricted: false,
    schedule: 'Weekdays 6:00 AM – 6:00 PM',
    doorIds: ['door-8', 'door-9', floor(39)],
  },
  {
    id: 'nordic-staff',
    name: 'Nordic Trade Staff',
    restricted: false,
    schedule: 'Weekdays 7:00 AM – 8:00 PM',
    doorIds: [...LOBBIES, ...range(21, 22)],
  },
  {
    id: 'harbor-vale',
    name: 'Harbor & Vale – Staff',
    restricted: false,
    schedule: 'Weekdays 6:00 AM – 10:00 PM',
    doorIds: [...LOBBIES, ...range(25, 27)],
  },
  {
    id: 'lumen-staff',
    name: 'Lumen Biotech – Staff',
    restricted: false,
    schedule: 'Every day 6:00 AM – 10:00 PM',
    doorIds: [...LOBBIES, ...range(30, 31)],
  },
  {
    id: 'loading-dock',
    name: 'Loading Dock',
    restricted: false,
    schedule: 'Weekdays 6:00 AM – 6:00 PM',
    doorIds: ['door-8', 'door-9', 'door-10', 'door-7'],
  },
  {
    id: 'contractor-day',
    name: 'Contractor – Day Pass',
    restricted: false,
    schedule: 'Weekdays 7:00 AM – 5:00 PM',
    doorIds: [...LOBBIES, 'door-8'],
  },
  {
    id: 'server-room',
    name: 'Server Room 2F',
    restricted: true,
    schedule: 'Weekdays 7:00 AM – 7:00 PM',
    doorIds: ['door-6'],
  },
  {
    id: 'castellan-it',
    name: 'Castellan IT – Data Closets',
    restricted: true,
    schedule: 'Weekdays 7:00 AM – 7:00 PM',
    doorIds: ['door-6', floor(17)],
  },
]

// ---------- The people the design names ----------

function featured(now: Date): DirectoryPerson[] {
  const ago = (seconds: number) =>
    new Date(now.getTime() - seconds * 1000).toISOString()
  const at = (dayOffset: number, hh: number, mm = 0) =>
    atSiteTime(now, dayOffset, hh, mm)
  const synced = at(0, 6)
  const roster = (tenantId: string) =>
    `Managed via SCIM Roster Integration · Tenant ID: ${tenantId}`

  const cred = (
    c: Partial<IssuedCredential> & {
      id: string
      kind: CredentialKind
      issuedAt: string
    },
  ): IssuedCredential => ({ status: 'active', autoProvisioned: true, ...c })

  return [
    {
      id: 'PER-008812',
      person: {
        givenName: 'Tomás',
        familyName: 'Reyes',
        roleLabel: 'Tenant employee',
        org: 'Kestrel Analytics',
      },
      type: 'tenant',
      email: 't.reyes@kestrel-analytics.com',
      phone: '+1 617-555-4410',
      source: 'roster',
      sourceDetail: roster('KST-9044'),
      syncedAt: synced,
      credentials: [
        cred({
          id: 'CRD-77310',
          kind: 'mobile',
          last4: '7731',
          device: 'Apple Wallet (iPhone 15 Pro)',
          issuedAt: at(-218, 9, 12),
          lastTap: { at: ago(408), location: 'Lobby B turnstile' },
        }),
      ],
      groupIds: ['kestrel-staff', 'kestrel-after-hours'],
      lastAccess: {
        at: ago(408),
        outcome: 'admitted',
        location: 'Lobby B turnstile',
      },
      exceptionId: 'EXC-4468',
    },
    {
      id: 'PER-007431',
      person: {
        givenName: 'Priya',
        familyName: 'Shah',
        roleLabel: 'Tenant employee',
        org: 'Castellan Insurance',
      },
      type: 'tenant',
      email: 'p.shah@castellan-ins.com',
      phone: '+1 617-555-0288',
      source: 'roster',
      sourceDetail: roster('CST-1187'),
      syncedAt: synced,
      credentials: [
        cred({
          id: 'CRD-11040',
          kind: 'mobile',
          last4: '1104',
          device: 'Google Wallet (Pixel 8)',
          issuedAt: at(-402, 10, 3),
          lastTap: { at: ago(1268), location: 'Floor 14 South Core' },
        }),
        cred({
          id: 'CRD-88410',
          kind: 'badge',
          last4: '8841',
          device: 'HID iCLASS SE badge',
          issuedAt: at(-790, 14, 30),
          autoProvisioned: false,
          lastTap: { at: at(-41, 8, 2), location: 'Lobby A turnstile 1' },
        }),
      ],
      groupIds: ['castellan-all-floors', 'castellan-it'],
      lastAccess: {
        at: ago(1268),
        outcome: 'admitted',
        location: 'Floor 14 South Core',
      },
    },
    {
      id: 'PER-002219',
      person: {
        givenName: 'Guadalupe',
        familyName: 'Ramírez-Castellanos de la Fuente',
        roleLabel: 'Building staff',
        org: 'Meridian Property Management',
      },
      type: 'staff',
      email: 'g.ramirez-castellanos@meridian-partners.com',
      phone: '+1 617-555-0907',
      source: 'manual',
      sourceDetail: 'Added by Maria Alvarez · Building staff',
      syncedAt: synced,
      credentials: [
        cred({
          id: 'CRD-00190',
          kind: 'badge',
          last4: '0019',
          device: 'HID iCLASS SE badge',
          issuedAt: at(-1210, 11, 0),
          autoProvisioned: false,
          lastTap: { at: ago(3302), location: 'B2 Engineering' },
        }),
        cred({
          id: 'CRD-24900',
          kind: 'mobile',
          last4: '2490',
          device: 'Apple Wallet (iPhone 14)',
          issuedAt: at(-300, 9, 45),
          autoProvisioned: false,
        }),
      ],
      groupIds: ['meridian-ops'],
      lastAccess: {
        at: ago(3302),
        outcome: 'admitted',
        location: 'B2 Engineering',
      },
    },
    {
      id: 'PER-006120',
      person: {
        givenName: 'Kenji',
        familyName: 'Watanabe',
        roleLabel: 'Tenant employee',
        org: 'Castellan Insurance',
      },
      type: 'tenant',
      email: 'k.watanabe@castellan-ins.com',
      phone: '+1 617-555-6120',
      source: 'roster',
      sourceDetail: roster('CST-2240'),
      syncedAt: synced,
      credentials: [
        cred({
          id: 'CRD-48210',
          kind: 'badge',
          last4: '4821',
          status: 'expired',
          device: 'HID iCLASS SE badge',
          issuedAt: at(-366, 9, 0),
          expiresAt: at(-1, 23, 59),
          autoProvisioned: false,
          lastTap: { at: ago(662), location: 'Lobby A turnstile 2' },
        }),
      ],
      groupIds: ['castellan-staff'],
      lastAccess: {
        at: ago(662),
        outcome: 'denied',
        location: 'Lobby A turnstile 2',
      },
      exceptionId: 'EXC-4463',
    },
    {
      id: 'PER-009977',
      person: {
        givenName: 'Dmitri',
        familyName: 'Volkov',
        roleLabel: 'IT contractor',
        org: 'Castellan Insurance',
      },
      type: 'contractor',
      email: 'volkov-ext@castellan-ins.com',
      phone: '+1 857-555-3107',
      sponsor: 'Castellan',
      source: 'manual',
      sourceDetail: 'Sponsored by Castellan Facility Security Team',
      syncedAt: synced,
      credentials: [
        cred({
          id: 'CRD-31070',
          kind: 'qr-pass',
          last4: '3107',
          device: 'Contractor QR pass',
          issuedAt: at(-30, 8, 0),
          expiresAt: at(1, 23, 59),
          autoProvisioned: false,
          lastTap: { at: at(-1, 17, 42), location: 'Loading dock egress' },
        }),
      ],
      groupIds: ['server-room', 'castellan-it'],
      extensionRequested: true,
      lastAccess: { at: at(-1, 17, 42), location: 'Loading dock egress' },
      exceptionId: 'EXC-4466',
    },
    {
      id: 'PER-005508',
      person: {
        givenName: 'Yuki',
        familyName: 'Tanaka',
        roleLabel: 'Tenant employee',
        org: 'Kestrel Analytics',
      },
      familyNameFirst: true,
      type: 'tenant',
      email: 'y.tanaka@kestrel-analytics.com',
      phone: '+1 617-555-5508',
      source: 'roster',
      sourceDetail: roster('KST-8120'),
      syncedAt: synced,
      credentials: [
        cred({
          id: 'CRD-90220',
          kind: 'mobile',
          last4: '9022',
          device: 'Apple Wallet (Apple Watch)',
          issuedAt: at(-150, 10, 0),
          lastTap: { at: ago(5400), location: 'Fitness center turnstile' },
        }),
      ],
      groupIds: ['kestrel-staff'],
      lastAccess: {
        at: ago(5400),
        outcome: 'admitted',
        location: 'Fitness center turnstile',
      },
    },
    {
      id: 'PER-004410',
      person: {
        givenName: 'Rahul',
        familyName: 'Mehta',
        roleLabel: 'Tenant employee',
        org: 'Nexus BioMed',
      },
      type: 'tenant',
      email: 'r.mehta@nexus-biomed.com',
      phone: '+1 617-555-4401',
      source: 'roster',
      sourceDetail: roster('NXB-0419'),
      syncedAt: synced,
      credentials: [
        cred({
          id: 'CRD-62100',
          kind: 'mobile',
          last4: '6210',
          device: 'Apple Wallet (iPhone 13)',
          issuedAt: at(-90, 9, 0),
          lastTap: { at: ago(182), location: 'Service elevator 2' },
        }),
        cred({
          id: 'CRD-51030',
          kind: 'badge',
          last4: '5103',
          device: 'HID iCLASS SE badge',
          issuedAt: at(-600, 9, 0),
          autoProvisioned: false,
        }),
      ],
      groupIds: ['nexus-lab'],
      lastAccess: {
        at: ago(182),
        outcome: 'admitted',
        location: 'Service elevator 2',
      },
    },
    {
      id: 'PER-010233',
      person: {
        givenName: 'Carlos',
        familyName: 'Mendoza',
        roleLabel: 'Facilities contractor',
        org: 'Apex Facilities Maintenance',
      },
      type: 'contractor',
      email: 'c.mendoza@apex-facilities.com',
      phone: '+1 781-555-9182',
      sponsor: 'Meridian Engineering',
      source: 'manual',
      sourceDetail: 'Sponsored by Meridian Engineering · Work order WO-5521',
      syncedAt: synced,
      credentials: [
        cred({
          id: 'CRD-91820',
          kind: 'badge',
          last4: '9182',
          device: 'Temporary contractor badge',
          issuedAt: at(-12, 7, 30),
          expiresAt: new Date(now.getTime() + 2 * 86_400_000).toISOString(),
          autoProvisioned: false,
          lastTap: { at: at(0, 6, 30), location: 'Penthouse mechanical' },
        }),
      ],
      groupIds: ['mep'],
      lastAccess: {
        at: at(0, 6, 30),
        outcome: 'admitted',
        location: 'Penthouse mechanical',
      },
    },
    {
      id: 'PER-003377',
      person: {
        givenName: 'Lars',
        familyName: 'Henriksen',
        roleLabel: 'Tenant employee',
        org: 'Nordic Trade Partners',
      },
      type: 'tenant',
      email: 'l.henriksen@nordic-trade.com',
      phone: '+1 617-555-3377',
      source: 'roster',
      sourceDetail: roster('NTP-0077'),
      syncedAt: synced,
      credentials: [
        cred({
          id: 'CRD-33010',
          kind: 'badge',
          last4: '3301',
          status: 'suspended',
          device: 'HID iCLASS SE badge',
          issuedAt: at(-500, 9, 0),
          autoProvisioned: false,
        }),
      ],
      groupIds: ['nordic-staff'],
      lastAccess: { at: at(-4, 16, 5), location: 'Manual hold by HR' },
    },
    {
      id: 'PER-008001',
      person: {
        givenName: 'Ahmed',
        familyName: 'Al-Rashid',
        roleLabel: 'Tenant employee',
        org: 'Kestrel Analytics',
      },
      type: 'tenant',
      email: 'a.alrashid@kestrel-analytics.com',
      phone: '+1 617-555-0142',
      source: 'roster',
      sourceDetail: roster('KST-7710'),
      syncedAt: synced,
      credentials: [
        cred({
          id: 'CRD-20140',
          kind: 'mobile',
          last4: '2014',
          device: 'Google Wallet (Galaxy S24)',
          issuedAt: at(-60, 9, 0),
          lastTap: { at: at(-1, 8, 41), location: 'Lobby A turnstile 1' },
        }),
      ],
      groupIds: ['kestrel-staff'],
      lastAccess: {
        at: at(-1, 8, 41),
        outcome: 'admitted',
        location: 'Lobby A turnstile 1',
      },
    },
    {
      id: 'PER-010412',
      person: {
        givenName: 'Ahmed',
        familyName: 'Alrashid',
        roleLabel: 'HVAC contractor',
        org: 'Acme HVAC Services',
      },
      type: 'contractor',
      email: 'ahmed@acme-hvac.com',
      phone: '+1 617-555-0142',
      sponsor: 'Meridian Engineering',
      source: 'manual',
      sourceDetail: 'Acme HVAC Services contractor roster',
      syncedAt: synced,
      credentials: [
        cred({
          id: 'CRD-66020',
          kind: 'qr-pass',
          last4: '6602',
          device: 'Contractor QR pass',
          issuedAt: at(-3, 7, 0),
          expiresAt: at(25, 18, 0),
          autoProvisioned: false,
        }),
      ],
      groupIds: ['contractor-day', 'mep'],
    },
    {
      id: 'PER-010388',
      person: {
        givenName: 'Wen',
        familyName: 'Li-Hartmann',
        roleLabel: 'Tenant employee',
        org: 'Harbor & Vale LLP',
      },
      type: 'tenant',
      email: 'w.lihartmann@harborvale.com',
      phone: '+1 617-555-0388',
      source: 'roster',
      sourceDetail: roster('HVL-0388'),
      syncedAt: synced,
      credentials: [
        cred({
          id: 'CRD-03880',
          kind: 'mobile',
          last4: '0388',
          device: 'Invite sent · not added to a wallet yet',
          issuedAt: at(-8, 9, 30),
        }),
      ],
      groupIds: ['harbor-vale'],
    },
  ]
}

// ---------- Generated directory ----------

const givenNames = [
  'Amara',
  'Noah',
  'Sofia',
  'Liam',
  'Mei',
  'Omar',
  'Elena',
  'Kwame',
  'Hana',
  'Mateo',
  'Aisha',
  'Lucas',
  'Ingrid',
  'Ravi',
  'Chloe',
  'Tariq',
  'Nadia',
  'Diego',
  'Freya',
  'Jonah',
  'Leila',
  'Arjun',
  'Zoe',
  'Felix',
  'Imani',
  'Sven',
  'Lucia',
  'Kofi',
  'Yara',
  'Ethan',
  'Mina',
  'Paulo',
  'Greta',
  'Sami',
  'Olivia',
  'Hiro',
  'Adaeze',
  'Marco',
  'Priyanka',
  'Theo',
  'Fatima',
  'Jae',
  'Rosa',
  'Malik',
  'Astrid',
  'Nikhil',
  'Clara',
  'Bashir',
  'Eva',
  'Tomasz',
]
const familyNames = [
  'Okonkwo',
  'Larsen',
  'Nguyen',
  'Haddad',
  'Moreau',
  'Kowalski',
  'Mensah',
  'Ishikawa',
  'Fernández',
  'Patel',
  'Schneider',
  'Abara',
  'Lindqvist',
  'Costa',
  'Rahman',
  'Bianchi',
  'Osei',
  'Petrov',
  'Kim',
  'Duarte',
  'Novak',
  'Achebe',
  'Sato',
  'Rossi',
  'Iyer',
  'Brennan',
  'Castillo',
  'Weber',
  'Adeyemi',
  'Hoang',
  'Martins',
  'Kaur',
  'Dubois',
  'Yilmaz',
  'Park',
  'Gallagher',
  'Ndlovu',
  'Ortiz',
  'Sørensen',
  'Chen',
  'Mwangi',
  'Silva',
]

const tenants = [
  {
    org: 'Kestrel Analytics',
    domain: 'kestrel-analytics.com',
    group: 'kestrel-staff',
  },
  {
    org: 'Castellan Insurance',
    domain: 'castellan-ins.com',
    group: 'castellan-staff',
  },
  { org: 'Nexus BioMed', domain: 'nexus-biomed.com', group: 'nexus-lab' },
  {
    org: 'Nordic Trade Partners',
    domain: 'nordic-trade.com',
    group: 'nordic-staff',
  },
  { org: 'Harbor & Vale LLP', domain: 'harborvale.com', group: 'harbor-vale' },
  { org: 'Lumen Biotech', domain: 'lumenbio.com', group: 'lumen-staff' },
]
const contractorOrgs = [
  {
    org: 'Apex Facilities Maintenance',
    domain: 'apex-facilities.com',
    role: 'Facilities contractor',
    group: 'mep',
  },
  {
    org: 'Acme HVAC Services',
    domain: 'acme-hvac.com',
    role: 'HVAC contractor',
    group: 'mep',
  },
  {
    org: 'Brightline Electric',
    domain: 'brightline-electric.com',
    role: 'Electrical contractor',
    group: 'contractor-day',
  },
  {
    org: 'Swift Courier Co.',
    domain: 'swiftcourier.com',
    role: 'Courier',
    group: 'loading-dock',
  },
  {
    org: 'Clearview Window Cleaning',
    domain: 'clearview-wc.com',
    role: 'Window cleaning contractor',
    group: 'contractor-day',
  },
]
const locations = [
  'Lobby A turnstile 1',
  'Lobby A turnstile 2',
  'Lobby B turnstile',
  'Parking P1 gate',
  'Mailroom',
  'Fitness center turnstile',
  'Service elevator 2',
  'Dock 2',
]
const phones = [
  'iPhone 15',
  'iPhone 14',
  'Pixel 8',
  'Galaxy S24',
  'Apple Watch',
]

const ascii = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ø/g, 'o')
    .toLowerCase()
    .replace(/[^a-z]/g, '')

function pick<T>(rng: Rng, list: readonly T[]) {
  return list[Math.floor(rng() * list.length)]
}

function generated(now: Date, rng: Rng): DirectoryPerson[] {
  const plan: [PersonType, number][] = [
    ['tenant', 1676],
    ['staff', 45],
    ['contractor', 179],
  ]
  const syncedAt = atSiteTime(now, 0, 6)
  const out: DirectoryPerson[] = []
  let n = 0
  for (const [type, count] of plan) {
    for (let i = 0; i < count; i++, n++) {
      const id = `PER-${String(100 + n).padStart(6, '0')}`
      const givenName = pick(rng, givenNames)
      const familyName = pick(rng, familyNames)
      const tenant = pick(rng, tenants)
      const vendor = pick(rng, contractorOrgs)
      const org =
        type === 'tenant'
          ? tenant.org
          : type === 'staff'
            ? 'Meridian Property Management'
            : vendor.org
      const domain =
        type === 'tenant'
          ? tenant.domain
          : type === 'staff'
            ? 'meridian-partners.com'
            : vendor.domain
      const issuedAt = new Date(
        now.getTime() - (5 + rng() * 700) * 86_400_000,
      ).toISOString()
      const last4 = () => String(Math.floor(rng() * 10000)).padStart(4, '0')
      const credentials: IssuedCredential[] = []
      const roll = rng()

      if (type === 'contractor') {
        const qr = rng() < 0.4
        credentials.push({
          id: `CRD-${id.slice(4)}1`,
          kind: qr ? 'qr-pass' : 'badge',
          last4: last4(),
          status: 'active',
          device: qr ? 'Contractor QR pass' : 'Temporary contractor badge',
          issuedAt,
          autoProvisioned: false,
          expiresAt: new Date(
            now.getTime() +
              (roll < 0.06 ? 1 + rng() * 4 : 10 + rng() * 80) * 86_400_000,
          ).toISOString(),
        })
      } else {
        if (rng() < 0.9) {
          credentials.push({
            id: `CRD-${id.slice(4)}1`,
            kind: 'mobile',
            last4: last4(),
            status: 'active',
            device: `${rng() < 0.6 ? 'Apple' : 'Google'} Wallet (${pick(rng, phones)})`,
            issuedAt,
            autoProvisioned: type === 'tenant',
          })
        }
        if (credentials.length === 0 || rng() < 0.27) {
          credentials.push({
            id: `CRD-${id.slice(4)}2`,
            kind: 'badge',
            last4: last4(),
            status: 'active',
            device: 'HID iCLASS SE badge',
            issuedAt,
            autoProvisioned: false,
          })
        }
        if (rng() < 0.025) {
          credentials.push({
            id: `CRD-${id.slice(4)}3`,
            kind: type === 'staff' && rng() < 0.5 ? 'biometric' : 'pin',
            status: 'active',
            issuedAt,
            autoProvisioned: false,
          })
        }
        // A few people need attention: suspended or expired credentials.
        if (roll < 0.012) {
          for (const c of credentials) c.status = 'suspended'
        } else if (roll < 0.022) {
          credentials[0].status = 'expired'
          credentials[0].expiresAt = new Date(
            now.getTime() - (1 + rng() * 20) * 86_400_000,
          ).toISOString()
          credentials.splice(1)
        }
      }

      const location = pick(rng, locations)
      const active = credentials.some((c) => c.status === 'active')
      out.push({
        id,
        person: {
          givenName,
          familyName,
          roleLabel:
            type === 'tenant'
              ? 'Tenant employee'
              : type === 'staff'
                ? 'Building staff'
                : vendor.role,
          org,
        },
        type,
        email: `${ascii(givenName)[0]}.${ascii(familyName)}@${domain}`,
        phone: `+1 617-555-${String(Math.floor(rng() * 10000)).padStart(4, '0')}`,
        sponsor: type === 'contractor' ? 'Meridian Engineering' : undefined,
        source: type === 'tenant' ? 'roster' : 'manual',
        sourceDetail:
          type === 'tenant'
            ? `Managed via SCIM Roster Integration · ${tenant.org}`
            : type === 'staff'
              ? 'Building staff · Meridian HR'
              : `${vendor.org} contractor roster`,
        syncedAt,
        credentials,
        groupIds: [
          type === 'tenant'
            ? tenant.group
            : type === 'staff'
              ? pick(rng, ['meridian-ops', 'loading-dock', 'mep'])
              : vendor.group,
        ],
        lastAccess: active
          ? {
              at: new Date(
                now.getTime() - (600 + rng() * 3 * 86_400) * 1000,
              ).toISOString(),
              outcome: rng() < 0.97 ? 'admitted' : 'denied',
              location,
            }
          : undefined,
      })
    }
  }
  return out
}

// ---------- Needs review ----------

function review(now: Date): ReviewItem[] {
  const ago = (seconds: number) =>
    new Date(now.getTime() - seconds * 1000).toISOString()
  const expired = atSiteTime(now, -1, 23, 59)
  const renewTo = new Date(Date.parse(expired) + 90 * 86_400_000).toISOString()
  const extendTo = atSiteTime(now, 25, 23, 59)
  return [
    {
      id: 'REV-9921',
      kind: 'access-extension',
      severity: 'high',
      personId: 'PER-009977',
      context: 'Contractor · Castellan Insurance',
      detail: `Extension to ${longDate(extendTo)} for Server Room 2F and IT data closets. Sponsor: Castellan Facility Security Team. Current pass ends tomorrow.`,
      maskedDetail:
        'Security-reviewed access request · Sponsor: Castellan Facility Security Team',
      createdAt: ago(3 * 3600),
      classified: true,
      requestId: 'REQ-9921',
      exceptionId: 'EXC-4466',
      actions: [
        {
          id: 'approve-extension',
          label: `Approve to ${shortDate(extendTo)}`,
          tone: 'secondary',
        },
        {
          id: 'deny-extension',
          label: 'Deny',
          tone: 'outline',
          removesAccess: true,
        },
      ],
    },
    {
      id: 'REV-4463',
      kind: 'roster-mismatch',
      severity: 'medium',
      personId: 'PER-006120',
      context: 'Tenant employee · Castellan Insurance',
      detail: `Badge ••••4821 expired ${longDate(expired)}, but the Castellan roster lists this employee as active`,
      createdAt: ago(662),
      classified: false,
      exceptionId: 'EXC-4463',
      exceptionNote: '3 denied attempts today',
      actions: [
        {
          id: 'renew-badge',
          label: `Renew badge to ${longDate(renewTo)}`,
          tone: 'secondary',
        },
        { id: 'keep-expired', label: 'Keep expired', tone: 'outline' },
        { id: 'ask-tenant', label: 'Ask tenant', tone: 'outline' },
      ],
    },
    {
      id: 'REV-0142',
      kind: 'possible-duplicate',
      severity: 'medium',
      personId: 'PER-008001',
      title: 'Ahmed Al-Rashid / Ahmed Alrashid',
      context: 'Matching phone (•••-•••-0142)',
      detail:
        'Roster 1: Kestrel Analytics (Employee) · Roster 2: Acme HVAC Services (Building Contractor)',
      createdAt: ago(2 * 3600 + 1200),
      classified: false,
      actions: [
        { id: 'compare-merge', label: 'Compare & merge', tone: 'secondary' },
        { id: 'keep-separate', label: 'Keep separate', tone: 'outline' },
      ],
    },
    {
      id: 'REV-0388',
      kind: 'mobile-not-activated',
      severity: 'low',
      personId: 'PER-010388',
      context: 'Tenant employee · Harbor & Vale LLP',
      detail: `Mobile credential invite sent ${shortDate(atSiteTime(now, -8, 9, 30))} was never added to a wallet`,
      createdAt: ago(26 * 3600),
      classified: false,
      actions: [
        { id: 'resend-invite', label: 'Resend invite', tone: 'secondary' },
        {
          id: 'revoke-invite',
          label: 'Cancel invite',
          tone: 'outline',
          removesAccess: true,
        },
      ],
    },
    {
      id: 'REV-3377',
      kind: 'stale-suspension',
      severity: 'low',
      personId: 'PER-003377',
      context: 'Tenant employee · Nordic Trade Partners',
      detail: `Badge suspended ${shortDate(atSiteTime(now, -4, 16, 5))} on a manual HR hold, with no roster update since`,
      createdAt: ago(30 * 3600),
      classified: false,
      actions: [
        {
          id: 'revoke-badge',
          label: 'Revoke badge',
          tone: 'secondary',
          removesAccess: true,
        },
        { id: 'keep-suspended', label: 'Keep suspended', tone: 'outline' },
      ],
    },
  ]
}

export function buildPeopleSnapshot(now: Date): PeopleSnapshot {
  const rng = seededRng(20261006)
  const synced = atSiteTime(now, 0, 6)
  return {
    people: [...featured(now), ...generated(now, rng)],
    review: review(now),
    groups,
    rosters: [
      { tenant: 'Kestrel Analytics', syncedAt: synced, ok: true, people: 812 },
      {
        tenant: 'Castellan Insurance',
        syncedAt: synced,
        ok: true,
        people: 503,
      },
      { tenant: 'Nexus BioMed', syncedAt: synced, ok: true, people: 214 },
      {
        tenant: 'Nordic Trade Partners',
        syncedAt: synced,
        ok: true,
        people: 155,
      },
    ],
    automation: {
      issued: 26,
      revokedOnOffboarding: 11,
      expiredOnSchedule: 4,
      neededPerson: 0,
    },
  }
}
