import { http, HttpResponse } from 'msw'
import { accessEvents } from './data/accessEvents'
import { alerts } from './data/alerts'
import { buildings } from './data/buildings'

export const handlers = [
  http.get('/api/buildings', () => HttpResponse.json(buildings)),
  http.get('/api/access-events', () => HttpResponse.json(accessEvents)),
  http.get('/api/alerts', () => HttpResponse.json(alerts)),
]
