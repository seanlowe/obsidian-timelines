import { Timeline } from './timeline'
import { TimelineContainer } from './timeline-container'
import { TimelineEventList } from './timeline-event-list'
import { TimelineCard } from './timeline-card'
import { TimelineHeader } from './timeline-header'

export const ExampleTimelineV1 = () => {
  return (
    <Timeline>
      <TimelineContainer
        date="02018-00001-00010-00012"
        collapsed={false}
        indent={0}
        spanLength={190.359375}
        head
      >
        <TimelineEventList>
          <TimelineCard
            title="year frontmatter dope"
            link="customer-tests/only-year/only-year-frontmatter.md"
            description="ajhdjaghdjkhakdhakjdhkad"
          />
        </TimelineEventList>
        <TimelineHeader date="2018-1-10-12 BDT" />
      </TimelineContainer>

      <TimelineContainer
        date="02019-00009-00002-00001"
        indent={0}
        spanLength={82.75}
        tail
      >
        <TimelineHeader date="2019-9-2-1 BDT" />
      </TimelineContainer>

      <TimelineContainer
        date="02024-00005-00024-00001"
        collapsed={false}
        indent={0}
      >
        <TimelineEventList>
          <TimelineCard
            title="Our First Event"
            link="customer-tests/bad-render-vertical/test.md"
            description="Event Number One"
          />
        </TimelineEventList>
        <TimelineHeader date="2024-5-24-1" />
      </TimelineContainer>
    </Timeline>
  )
}