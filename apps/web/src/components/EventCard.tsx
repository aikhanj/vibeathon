import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { EventCard, EventType, ClubType, Atmosphere } from '../types';

interface Props {
  card: EventCard;
  index: number;
  scheduled?: boolean;
}

const badgeMap: Record<EventCard['type'], string> = {
  event: 'bg-brand-500/20 text-brand-100',
  club: 'bg-accent/20 text-orange-100',
};

const eventTypeLabels: Record<EventType, string> = {
  workshop: 'Workshop',
  speaker: 'Speaker Event',
  practice: 'Practice & Rehearsal',
  social: 'Social Gathering',
  competition: 'Competition',
  meeting: 'Meeting',
};

const clubTypeLabels: Record<ClubType, string> = {
  academic: 'Academic / Educational',
  professional: 'Professional & Career',
  sports: 'Sports & Fitness',
  arts: 'Arts & Performance',
  cultural: 'Cultural & Identity-Based',
  volunteer: 'Volunteer & Community Service',
  social: 'Social & Casual',
  stem: 'STEM',
  entrepreneurship: 'Entrepreneurship & Startups',
  media: 'Media & Publications',
};

const atmosphereLabels: Record<Atmosphere, string> = {
  chill: 'Chill & Low-Stress',
  'high-energy': 'High Energy',
  'tight-knit': 'Tight-Knit',
  'large-social': 'Large & Social',
  'skill-building': 'Skill-Building',
  'just-for-fun': 'Just for Fun',
};

export const EventCardView = ({ card, index, scheduled }: Props) => (
  <motion.article
    layout
    initial={{ opacity: 0, y: 40, rotate: -2 }}
    animate={{ opacity: 1, y: 0, rotate: 0 }}
    exit={{ opacity: 0, y: -30 }}
    transition={{ delay: index * 0.03, duration: 0.5, ease: 'easeOut' }}
    className="relative h-[480px] w-full max-w-md overflow-hidden rounded-3xl bg-slate-900/80 p-6 shadow-card backdrop-blur flex flex-col"
  >
    <div className="flex items-center justify-between text-xs uppercase tracking-widest text-slate-400">
      <span className={clsx('rounded-full px-3 py-1 text-[11px] font-semibold', badgeMap[card.type])}>
        {card.type === 'event' ? 'Live Event' : 'Community Club'}
      </span>
      <span className="flex items-center gap-2">
        {scheduled && <span className="text-[11px] font-semibold text-brand-200">Scheduled</span>}
        {new Date(card.receivedAt).toLocaleDateString()}
      </span>
    </div>
    <h2 className="mt-4 font-display text-2xl text-white">{card.subject}</h2>
    <p className="mt-1 text-sm text-slate-400">From {card.sender}</p>
    {card.eventDate && (
      <p className="mt-4 text-sm font-medium text-brand-200">
        {card.eventDate} {card.location ? `· ${card.location}` : ''}
      </p>
    )}
    <p className="mt-4 flex-1 overflow-hidden text-base text-slate-200 opacity-90">{card.preview}</p>
    <div className="mt-6 flex flex-wrap gap-2 text-xs">
      {card.eventType && (
        <span className="rounded-full bg-brand-500/10 px-3 py-1 text-brand-100">
          {eventTypeLabels[card.eventType]}
        </span>
      )}
      {card.clubType && (
        <span className="rounded-full bg-accent/10 px-3 py-1 text-orange-100">
          {clubTypeLabels[card.clubType]}
        </span>
      )}
      {card.atmosphere && (
        <span className="rounded-full bg-white/5 px-3 py-1 text-slate-200">
          {atmosphereLabels[card.atmosphere]}
        </span>
      )}
    </div>
  </motion.article>
);
