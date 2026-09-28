import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { api } from '@/api/client'
import { routes } from '@/app/router'

describe('app shell', () => {
  it('renders the dashboard inside the layout', () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/'] })
    render(<RouterProvider router={router} />)
    expect(
      screen.getByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument()
    expect(screen.getByText('SmartAccess')).toBeInTheDocument()
  })
})

describe('mock api', () => {
  it('serves buildings', async () => {
    const buildings = await api.buildings()
    expect(buildings.length).toBeGreaterThan(0)
  })
})
