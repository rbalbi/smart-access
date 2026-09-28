import type { Building } from '@/types'

export const buildings: Building[] = [
  {
    id: 'b1',
    name: 'Harborview Tower',
    type: 'office',
    city: 'Boston',
    occupancy: 842,
    capacity: 1200,
    devicesOnline: 214,
    devicesTotal: 218,
  },
  {
    id: 'b2',
    name: 'Riverside Plant 3',
    type: 'factory',
    city: 'Charlotte',
    occupancy: 310,
    capacity: 450,
    devicesOnline: 96,
    devicesTotal: 96,
  },
  {
    id: 'b3',
    name: 'Northgate Logistics Hub',
    type: 'warehouse',
    city: 'Columbus',
    occupancy: 128,
    capacity: 300,
    devicesOnline: 71,
    devicesTotal: 75,
  },
]
