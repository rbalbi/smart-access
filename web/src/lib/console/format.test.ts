import type { Person } from '@/types'
import {
  displayName,
  formatConfidence,
  formatCredential,
  formatDuration,
  formatTime,
  formatTimer,
  maskFreeText,
  maskPhone,
} from './format'

const kenji: Person = {
  givenName: 'Kenji',
  familyName: 'Watanabe',
  roleLabel: 'Tenant employee',
  org: 'Castellan Insurance',
}

describe('names', () => {
  it('shows given name and family initial by default', () => {
    expect(displayName(kenji, { privacy: false })).toBe('Kenji W.')
  })
  it('shows the full name only when revealed', () => {
    expect(displayName(kenji, { privacy: false, revealed: true })).toBe(
      'Kenji Watanabe',
    )
  })
  it('shows only the role in privacy mode, even if revealed', () => {
    expect(displayName(kenji, { privacy: true, revealed: true })).toBe(
      'Tenant employee',
    )
  })
})

describe('identifiers', () => {
  it('shows only the last four digits of a credential', () => {
    expect(formatCredential({ kind: 'badge', last4: '4821' })).toBe(
      'Badge ••••4821',
    )
    expect(formatCredential({ kind: 'pin', note: 'one-time' })).toBe(
      'PIN (one-time)',
    )
  })
  it('masks phone numbers', () => {
    expect(maskPhone('+1 617-555-0192')).toBe('+1 •••-•••-0192')
    expect(maskFreeText('Sent to +1 617-555-0192', false)).toBe(
      'Sent to +1 •••-•••-0192',
    )
  })
  it('masks plates only in privacy mode', () => {
    expect(maskFreeText('Van (Plate #8K92L)', false)).toBe('Van (Plate #8K92L)')
    expect(maskFreeText('Van (Plate #8K92L)', true)).toBe('Van (Plate #•••••)')
  })
})

describe('numbers and times', () => {
  it('formats durations and timers', () => {
    expect(formatDuration(252)).toBe('4m 12s')
    expect(formatDuration(45)).toBe('45s')
    expect(formatDuration(7800)).toBe('2h 10m')
    expect(formatTimer(252)).toBe('04:12')
  })
  it('names the confidence band', () => {
    expect(formatConfidence(0.97)).toBe('97% (High)')
    expect(formatConfidence(0.82)).toBe('82% (Medium)')
    expect(formatConfidence(null)).toBe('Rule-based')
  })
  it('renders times in the site time zone, not the viewer’s', () => {
    const iso = '2026-09-28T13:15:02Z'
    expect(formatTime(iso, 'America/New_York')).toMatch(/9:15:02/)
    expect(formatTime(iso, 'Asia/Tokyo')).toMatch(/10:15:02/)
  })
})
