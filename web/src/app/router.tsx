import { createBrowserRouter } from 'react-router'
import { AppLayout } from '@/layouts/AppLayout'
import { AccessLogPage } from '@/pages/AccessLogPage'
import { AlertsPage } from '@/pages/AlertsPage'
import { BuildingsPage } from '@/pages/BuildingsPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PoliciesPage } from '@/pages/PoliciesPage'

export const routes = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'buildings', element: <BuildingsPage /> },
      { path: 'access-log', element: <AccessLogPage /> },
      { path: 'policies', element: <PoliciesPage /> },
      { path: 'alerts', element: <AlertsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

export const router = createBrowserRouter(routes)
