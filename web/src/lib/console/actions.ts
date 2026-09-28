import type { ExceptionType, Role } from '@/types'

export type ActionTone = 'primary' | 'secondary' | 'warning' | 'soft'

export type ExceptionAction = {
  id: string
  label: string
  tone: ActionTone
  /** Resolving without a note is blocked (e.g. forced door). */
  requiresNote?: boolean
  /** What the audit trail and the confirmation toast say happened. */
  pastTense: string
}

/**
 * Every exception card has the same three slots in the same order:
 * [primary decision] [alternative decision] [escalate]. The labels follow the
 * exception type because a literal "Approve" makes no sense for a forced door.
 */
const decisions: Record<
  ExceptionType,
  [ExceptionAction, ExceptionAction | null]
> = {
  'forced-door': [
    {
      id: 'resolve',
      label: 'Mark resolved',
      tone: 'primary',
      requiresNote: true,
      pastTense: 'Forced door marked resolved',
    },
    null,
  ],
  tailgating: [
    {
      id: 'legitimate',
      label: 'Mark as legitimate',
      tone: 'secondary',
      pastTense: 'Tailgating marked legitimate',
    },
    {
      id: 'violation',
      label: 'Confirm violation',
      tone: 'warning',
      pastTense: 'Tailgating violation confirmed',
    },
  ],
  'badge-denied': [
    {
      id: 'grant-once',
      label: 'Grant one-time entry',
      tone: 'primary',
      pastTense: 'One-time entry granted',
    },
    {
      id: 'keep-denied',
      label: 'Keep denied',
      tone: 'secondary',
      pastTense: 'Entry kept denied',
    },
  ],
  'door-held-open': [
    {
      id: 'allow-15',
      label: 'Allow for 15 min',
      tone: 'secondary',
      pastTense: 'Door allowed open for 15 min',
    },
    {
      id: 'request-close',
      label: 'Request door closed',
      tone: 'soft',
      pastTense: 'Door close requested',
    },
  ],
  'visitor-no-invite': [
    {
      id: 'issue-pass',
      label: 'Issue visitor pass',
      tone: 'primary',
      pastTense: 'Visitor pass issued',
    },
    {
      id: 'decline',
      label: 'Decline entry',
      tone: 'secondary',
      pastTense: 'Visitor entry declined',
    },
  ],
  'controller-battery': [
    {
      id: 'acknowledge',
      label: 'Acknowledge',
      tone: 'secondary',
      pastTense: 'Battery warning acknowledged',
    },
    null,
  ],
  'controller-offline': [
    {
      id: 'dispatch',
      label: 'Dispatch technician',
      tone: 'primary',
      pastTense: 'Technician dispatched',
    },
    {
      id: 'acknowledge',
      label: 'Acknowledge',
      tone: 'secondary',
      pastTense: 'Offline controller acknowledged',
    },
  ],
  'restricted-area': [
    {
      id: 'clear',
      label: 'Clear as authorized',
      tone: 'secondary',
      pastTense: 'Restricted-area event cleared',
    },
    {
      id: 'lock-zone',
      label: 'Lock down zone',
      tone: 'warning',
      pastTense: 'Zone locked down',
    },
  ],
}

/** Operations hands off to Security; Security opens a formal incident. */
export function escalateAction(role: Role): ExceptionAction {
  return role === 'security'
    ? {
        id: 'escalate',
        label: 'Escalate to incident',
        tone: 'secondary',
        pastTense: 'Escalated to incident',
      }
    : {
        id: 'escalate',
        label: 'Escalate to Security',
        tone: 'secondary',
        pastTense: 'Escalated to Security',
      }
}

export function actionsFor(type: ExceptionType, role: Role): ExceptionAction[] {
  const [primary, alternative] = decisions[type]
  return [primary, ...(alternative ? [alternative] : []), escalateAction(role)]
}

export function findAction(
  type: ExceptionType,
  role: Role,
  actionId: string,
): ExceptionAction | undefined {
  return actionsFor(type, role).find((a) => a.id === actionId)
}

export const overrideReasons = [
  'Credential shared or misused',
  'Person no longer authorized',
  'Security concern reported on site',
  'Policy applied incorrectly',
  'Other (explain in audit log)',
] as const
