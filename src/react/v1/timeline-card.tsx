import React from 'react'

interface TimelineCardProps {
  title: string;
  link: string;
  description: string;
}

export const TimelineCard: React.FC<TimelineCardProps> = ({ title, link, description }) => {
  return (
    <div className="timeline-card">
      <article>
        <h3>
          <a className="internal-link" href={link}>{title}</a>
        </h3>
      </article>
      <p>{description}</p>
    </div>
  )
}
