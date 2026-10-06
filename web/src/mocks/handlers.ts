import { http, HttpResponse } from 'msw'
import { buildings } from './data/buildings'
import { buildSnapshot, sites } from './data/console'
import { buildPeopleSnapshot } from './data/people'

export const handlers = [
  http.get('/api/buildings', () => HttpResponse.json(buildings)),
  http.get('/api/sites', () => HttpResponse.json(sites)),
  http.get('/api/sites/:siteId/console', () =>
    HttpResponse.json(buildSnapshot(new Date())),
  ),
  http.get('/api/sites/:siteId/people', () =>
    HttpResponse.json(buildPeopleSnapshot(new Date())),
  ),
  http.post('/api/audit', () => new HttpResponse(null, { status: 201 })),
]
