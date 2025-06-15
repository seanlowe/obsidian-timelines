import { Timeline } from './timeline'

const exampleEvents = [
  {
    'id': '02018-00001-00010-00012',
    'classes': '',
    'color': '#FF7F50',
    'endDate': {
      'cleanedDateString': '2019-9-2-1',
      'normalizedDateString': '02019-00009-00002-00001',
      'originalDateString': '2019-09-02',
      'readableDateString': '2019-9-2-1',
      'year': 2019,
      'month': 8,
      'day': 2,
      'hour': 1
    },
    'era': 'BDT',
    'group': '',
    'img': '',
    'body': 'ajhdjaghdjkhakdhakjdhkad',
    'path': '/customer-tests/only-year/only-year-frontmatter.md',
    'pointsTo': '2022-01-01',
    'startDate': {
      'cleanedDateString': '2018-1-10-12',
      'normalizedDateString': '02018-00001-00010-00012',
      'originalDateString': '2018-1-10-12',
      'readableDateString': '2018-1-10-12',
      'year': 2018,
      'month': 0,
      'day': 10,
      'hour': 12
    },
    'title': 'year frontmatter dope',
    'type': 'range'
  },
  {
    'id': '02024-00005-00024-00001',
    'classes': '',
    'color': '',
    'endDate': {
      'cleanedDateString': '2024-5-24-1',
      'normalizedDateString': '02024-00005-00024-00001',
      'originalDateString': '2024-5-24',
      'readableDateString': '2024-5-24-1',
      'year': 2024,
      'month': 4,
      'day': 24,
      'hour': 1
    },
    'era': '',
    'group': '',
    'img': '',
    'body': '\n  Event Number One\n',
    'path': '/customer-tests/bad-render-vertical/test.md',
    'pointsTo': '',
    'startDate': {
      'cleanedDateString': '2024-5-24-1',
      'normalizedDateString': '02024-00005-00024-00001',
      'originalDateString': '2024-5-24',
      'readableDateString': '2024-5-24-1',
      'year': 2024,
      'month': 4,
      'day': 24,
      'hour': 1
    },
    'title': 'Our First Event',
    'type': 'box'
  }
]

export const ExampleTimelineV2 = () => {
  return <Timeline events={exampleEvents} />
}