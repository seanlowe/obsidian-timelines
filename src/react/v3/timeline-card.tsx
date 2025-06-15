import { ReactCardContainer } from 'src/types'

interface TimelineCardProps {
  event: ReactCardContainer;
}

export const TimelineCard: React.FC<TimelineCardProps> = ({ event }) => {
  return (
    <div className="timeline-event-list" style={{ display: 'block' }}>
      <div className="timeline-card">
        <article>
          <h3>
            <a className="internal-link" href={event.path}>
              {event.title}
            </a>
          </h3>
        </article>
        <p>{event.body}</p>
      </div>
    </div>
  ) 
}
