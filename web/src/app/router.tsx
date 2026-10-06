import { createBrowserRouter } from 'react-router'
import { AppLayout } from '@/layouts/AppLayout'
import { AuditLogPage } from '@/pages/AuditLogPage'
import { DoorsPage } from '@/pages/DoorsPage'
import { LiveActivityPage } from '@/pages/LiveActivityPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PeoplePage } from '@/pages/PeoplePage'
import { PoliciesPage } from '@/pages/PoliciesPage'
import { VisitorsPage } from '@/pages/VisitorsPage'

export const routes = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <LiveActivityPage /> },
      { path: 'people', element: <PeoplePage /> },
      { path: 'visitors', element: <VisitorsPage /> },
      { path: 'doors', element: <DoorsPage /> },
      { path: 'policies', element: <PoliciesPage /> },
      { path: 'audit-log', element: <AuditLogPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

export const router = createBrowserRouter(routes)
