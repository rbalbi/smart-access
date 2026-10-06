import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { api } from '@/api/client'
import { routes } from '@/app/router'

function renderApp(path = '/') {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(<RouterProvider router={router} />)
}

describe('Live Activity console', () => {
  it('renders the console inside the app shell', async () => {
    renderApp()
    expect(
      await screen.findByRole('heading', { name: 'Live Activity', level: 1 }),
    ).toBeInTheDocument()
    expect(screen.getAllByText('SmartAccess').length).toBeGreaterThan(0)
    expect(
      screen.getByRole('heading', { name: 'Needs you' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Handled automatically' }),
    ).toBeInTheDocument()
  })

  it('hides classified details from Operations', async () => {
    renderApp()
    await screen.findByRole('heading', { name: 'Needs you' })
    expect(
      screen.getByText('Security-classified event at Server Room 2F'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Badge used outside clearance hours')).toBeNull()
  })

  it('a decision removes the card and is logged', async () => {
    const user = userEvent.setup()
    renderApp()
    const heading = await screen.findByRole('heading', {
      name: 'Badge denied 3 times',
    })
    const card = heading.closest('article')!
    await user.click(
      within(card).getByRole('button', { name: 'Grant one-time entry' }),
    )
    expect(
      screen.queryByRole('heading', { name: 'Badge denied 3 times' }),
    ).toBeNull()
  })

  it('forced door needs a note before it can be resolved', async () => {
    const user = userEvent.setup()
    renderApp()
    const heading = await screen.findByRole('heading', { name: 'Forced door' })
    const card = heading.closest('article')!
    await user.click(
      within(card).getByRole('button', { name: /Mark resolved/ }),
    )
    const confirm = within(card).getByRole('button', {
      name: 'Confirm and resolve',
    })
    expect(confirm).toBeDisabled()
    await user.type(
      within(card).getByLabelText('Resolution note (required)'),
      'Checked on camera',
    )
    expect(confirm).toBeEnabled()
  })
})

describe('mock api', () => {
  it('serves the console snapshot', async () => {
    const snapshot = await api.console('harborview')
    expect(snapshot.exceptions.length).toBeGreaterThan(0)
  })
})
