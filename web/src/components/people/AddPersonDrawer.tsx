import { Info, X } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { useConsole } from '@/hooks/useConsole'
import { usePeople } from '@/hooks/usePeople'
import { visibleGroups } from '@/lib/people/model'
import { issueDigits } from '@/lib/people/state'
import { cn } from '@/lib/utils'
import type { CredentialKind, DirectoryPerson, PersonType } from '@/types'
import { Sheet, SheetClose, SheetTitle } from './Sheet'
import { iconButton } from '@/lib/people/styles'

type Draft = {
  type: Exclude<PersonType, 'tenant'>
  givenName: string
  familyName: string
  email: string
  phone: string
  org: string
  sponsor: string
  endDate: string
  groupIds: string[]
  credential: CredentialKind | 'none'
}

const empty: Draft = {
  type: 'staff',
  givenName: '',
  familyName: '',
  email: '',
  phone: '',
  org: 'Meridian Property Management',
  sponsor: '',
  endDate: '',
  groupIds: [],
  credential: 'mobile',
}

const sponsors = [
  'Meridian Engineering',
  'Kestrel Analytics',
  'Castellan Insurance',
  'Nexus BioMed',
  'Nordic Trade Partners',
]

/** Building staff and contractors; tenant employees arrive via rosters. */
export function AddPersonDrawer() {
  const { state, dispatch } = usePeople()
  return (
    <Sheet
      open={state.adding}
      onClose={() => dispatch({ type: 'set-adding', adding: false })}
      label="Add person"
      header={
        <>
          <SheetTitle className="text-sm font-semibold">Add person</SheetTitle>
          <SheetClose aria-label="Close" className={iconButton}>
            <X aria-hidden />
          </SheetClose>
        </>
      }
    >
      {state.adding && <AddPersonForm />}
    </Sheet>
  )
}

function AddPersonForm() {
  const { state: c } = useConsole()
  const { state, dispatch, run, canEdit, now } = usePeople()
  const [draft, setDraft] = useState<Draft>(empty)
  const [touched, setTouched] = useState(false)
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))
  const groups = visibleGroups(state.groups, c.role)
  const contractor = draft.type === 'contractor'
  const today = now.slice(0, 10)

  const errors: Partial<Record<keyof Draft, string>> = {}
  if (!draft.givenName.trim()) errors.givenName = 'Enter a given name.'
  if (!draft.familyName.trim()) errors.familyName = 'Enter a family name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim()))
    errors.email = 'Enter an email address like name@company.com.'
  if (!draft.org.trim()) errors.org = 'Enter the company.'
  if (contractor && !draft.sponsor) errors.sponsor = 'Choose who sponsors them.'
  if (contractor && !draft.endDate)
    errors.endDate = 'Contractors need an end date.'
  else if (contractor && draft.endDate < today)
    errors.endDate = 'The end date can’t be in the past.'
  if (draft.groupIds.length === 0)
    errors.groupIds = 'Choose at least one access group.'
  const valid = Object.keys(errors).length === 0

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!valid) {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      return
    }
    const nextNumber =
      Math.max(...state.people.map((p) => Number(p.id.slice(4)) || 0)) + 1
    const id = `PER-${String(nextNumber).padStart(6, '0')}`
    const name = `${draft.givenName.trim()} ${draft.familyName.trim()}`
    const auditId = run({
      summary: `Added ${contractor ? 'contractor' : 'building staff member'} ${name} (${id})`,
      title: `${c.privacy ? (contractor ? 'Contractor' : 'Building staff') : name} added`,
      targetId: id,
      apply: (ctx) => {
        const person: DirectoryPerson = {
          id,
          person: {
            givenName: draft.givenName.trim(),
            familyName: draft.familyName.trim(),
            roleLabel: contractor ? 'Contractor' : 'Building staff',
            org: draft.org.trim(),
          },
          type: draft.type,
          email: draft.email.trim(),
          phone: draft.phone.trim() || '+1 000-000-0000',
          sponsor: contractor ? draft.sponsor : undefined,
          source: 'manual',
          sourceDetail: contractor
            ? `Sponsored by ${draft.sponsor} · added by ${c.actor}`
            : `Added by ${c.actor} · Building staff`,
          syncedAt: ctx.at,
          groupIds: draft.groupIds,
          credentials:
            draft.credential === 'none'
              ? []
              : [
                  {
                    id: `CRD-${issueDigits(id)}0`,
                    kind: draft.credential,
                    last4:
                      draft.credential === 'pin'
                        ? undefined
                        : issueDigits(id + ctx.auditId),
                    status: 'active',
                    device:
                      draft.credential === 'mobile'
                        ? 'Invite sent · not added to a wallet yet'
                        : draft.credential === 'badge'
                          ? 'HID iCLASS SE badge'
                          : undefined,
                    issuedAt: ctx.at,
                    autoProvisioned: false,
                    expiresAt: contractor
                      ? new Date(`${draft.endDate}T23:59:00`).toISOString()
                      : undefined,
                  },
                ],
        }
        return { type: 'add-person', person, ...ctx }
      },
    })
    if (auditId) dispatch({ type: 'open-person', id })
  }

  const show = (key: keyof Draft) => (touched ? errors[key] : undefined)

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-5 p-6">
      <p className="flex gap-2 rounded-lg border border-border bg-surface-3 p-3 text-[11px] leading-4 text-muted-foreground">
        <Info aria-hidden className="mt-px size-3.5 shrink-0 text-brand" />
        Tenant employees are added and removed automatically from tenant
        rosters. Add building staff and contractors here.
      </p>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="pb-1.5 text-xs font-medium">Person type</legend>
        <div className="flex w-fit rounded-lg border border-border bg-surface-3 p-[3px]">
          {(
            [
              ['staff', 'Building staff'],
              ['contractor', 'Contractor'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={draft.type === value}
              onClick={() =>
                set({
                  type: value,
                  org: value === 'staff' ? 'Meridian Property Management' : '',
                })
              }
              className={cn(
                'h-[26px] rounded px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring',
                draft.type === value
                  ? 'bg-surface-5 font-semibold'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Given name" error={show('givenName')}>
          {(props) => (
            <input
              {...props}
              autoComplete="off"
              value={draft.givenName}
              onChange={(e) => set({ givenName: e.target.value })}
            />
          )}
        </Field>
        <Field label="Family name" error={show('familyName')}>
          {(props) => (
            <input
              {...props}
              autoComplete="off"
              value={draft.familyName}
              onChange={(e) => set({ familyName: e.target.value })}
            />
          )}
        </Field>
        <Field label="Work email" error={show('email')}>
          {(props) => (
            <input
              {...props}
              type="email"
              autoComplete="off"
              value={draft.email}
              onChange={(e) => set({ email: e.target.value })}
            />
          )}
        </Field>
        <Field label="Mobile phone" optional>
          {(props) => (
            <input
              {...props}
              type="tel"
              autoComplete="off"
              value={draft.phone}
              onChange={(e) => set({ phone: e.target.value })}
            />
          )}
        </Field>
        <Field label={contractor ? 'Company' : 'Employer'} error={show('org')}>
          {(props) => (
            <input
              {...props}
              value={draft.org}
              onChange={(e) => set({ org: e.target.value })}
            />
          )}
        </Field>
        {contractor && (
          <Field label="Sponsor" error={show('sponsor')}>
            {(props) => (
              <select
                {...props}
                value={draft.sponsor}
                onChange={(e) => set({ sponsor: e.target.value })}
              >
                <option value="">Choose…</option>
                {sponsors.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            )}
          </Field>
        )}
        {contractor && (
          <Field
            label="Access ends"
            hint="Credentials expire automatically at 11:59 PM."
            error={show('endDate')}
          >
            {(props) => (
              <input
                {...props}
                type="date"
                min={today}
                value={draft.endDate}
                onChange={(e) => set({ endDate: e.target.value })}
              />
            )}
          </Field>
        )}
      </div>

      <fieldset
        className="flex flex-col gap-2"
        aria-describedby={show('groupIds') ? 'groups-error' : undefined}
      >
        <legend className="pb-1.5 text-xs font-medium">Access groups</legend>
        <div className="grid max-h-48 grid-cols-2 gap-x-3 gap-y-2 overflow-y-auto rounded-lg border border-border bg-surface-3 p-3">
          {groups.map((g) => (
            <label
              key={g.id}
              className="flex items-start gap-2 text-xs leading-4"
            >
              <Checkbox
                aria-invalid={!!show('groupIds')}
                checked={draft.groupIds.includes(g.id)}
                onCheckedChange={(on) =>
                  set({
                    groupIds: on
                      ? [...draft.groupIds, g.id]
                      : draft.groupIds.filter((id) => id !== g.id),
                  })
                }
              />
              <span>
                {g.name}
                <span className="block text-[10px] text-subtle-foreground">
                  {g.schedule}
                </span>
              </span>
            </label>
          ))}
        </div>
        {show('groupIds') && (
          <p id="groups-error" className="text-[11px] text-sev-critical-fg">
            {errors.groupIds}
          </p>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="pb-1.5 text-xs font-medium">First credential</legend>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ['mobile', 'Mobile credential invite'],
              ['badge', 'Physical badge'],
              ['pin', 'PIN code'],
              ['none', 'None for now'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={draft.credential === value}
              onClick={() => set({ credential: value })}
              className={cn(
                'rounded border px-2.5 py-1 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring',
                draft.credential === value
                  ? 'border-brand bg-brand/20 text-brand-text'
                  : 'border-border text-muted-foreground hover:bg-surface-5 hover:text-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={() => dispatch({ type: 'set-adding', adding: false })}
          className="inline-flex h-[30px] items-center rounded border border-border px-3 text-xs outline-none hover:bg-surface-5 focus-visible:ring-2 focus-visible:ring-ring"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canEdit}
          className="inline-flex h-[30px] items-center rounded bg-brand px-3.5 text-xs font-semibold text-brand-foreground outline-none hover:bg-brand/85 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          Add person
        </button>
      </div>
    </form>
  )
}

type FieldProps = {
  id: string
  className: string
  'aria-invalid': boolean
  'aria-describedby'?: string
  required?: boolean
}

function Field({
  label,
  hint,
  error,
  optional,
  children,
}: {
  label: string
  hint?: string
  error?: string
  optional?: boolean
  children: (props: FieldProps) => ReactNode
}) {
  const id = useId()
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`]
    .filter(Boolean)
    .join(' ')
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium">
        {label}
        {optional && (
          <span className="font-normal text-subtle-foreground">
            {' '}
            (optional)
          </span>
        )}
      </label>
      {children({
        id,
        required: !optional,
        'aria-invalid': !!error,
        'aria-describedby': describedBy || undefined,
        className: cn(
          'h-8 w-full rounded border bg-surface-3 px-2.5 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
          error ? 'border-sev-critical' : 'border-border',
        ),
      })}
      {hint && (
        <p id={`${id}-hint`} className="text-[10px] text-subtle-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-[11px] text-sev-critical-fg">
          {error}
        </p>
      )}
    </div>
  )
}
