import { Timeline } from './timeline'

const exampleEvents = [
  {
    'id': '02024-00007-00020-00001',
    'classes': '',
    'color': '',
    'endDate': {
      'cleanedDateString': '2025-8-1-1',
      'normalizedDateString': '02025-00008-00001-00001',
      'originalDateString': '2025-8-1',
      'readableDateString': '2025-8-1-1',
      'year': 2025,
      'month': 7,
      'day': 1,
      'hour': 1
    },
    'era': '',
    'group': '',
    'img': '',
    'body': 'testing to see if ...',
    'path': '/customer-tests/nesting/events.md',
    'pointsTo': '',
    'startDate': {
      'cleanedDateString': '2024-7-20-1',
      'normalizedDateString': '02024-00007-00020-00001',
      'originalDateString': '2024-7-20',
      'readableDateString': '2024-7-20-1',
      'year': 2024,
      'month': 6,
      'day': 20,
      'hour': 1
    },
    'title': 'unity poc',
    'type': 'range'
  },
  {
    'id': '02024-00008-00002-00001',
    'classes': '',
    'color': '',
    'endDate': {
      'cleanedDateString': '2024-10-1-1',
      'normalizedDateString': '02024-00010-00001-00001',
      'originalDateString': '2024-10-1-1',
      'readableDateString': '2024-10-1-1',
      'year': 2024,
      'month': 9,
      'day': 1,
      'hour': 1
    },
    'era': '',
    'group': '',
    'img': '',
    'body': 'the alpha build of the ....',
    'path': '/customer-tests/nesting/events.md',
    'pointsTo': '',
    'startDate': {
      'cleanedDateString': '2024-8-2-1',
      'normalizedDateString': '02024-00008-00002-00001',
      'originalDateString': '2024-8-2-1',
      'readableDateString': '2024-8-2-1',
      'year': 2024,
      'month': 7,
      'day': 2,
      'hour': 1
    },
    'title': 'alpha',
    'type': 'range'
  }
]

export const ExampleTimelineV4 = () => {
  return <Timeline events={exampleEvents} />
}