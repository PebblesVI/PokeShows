export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'collection' | 'shows' | 'trading' | 'engagement';
  requirement: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_card', name: 'First Card', description: 'Added your first card to your collection', icon: 'Sparkles', category: 'collection', requirement: 'Add 1 card to collection' },
  { id: 'collector_10', name: 'Getting Started', description: 'Collected 10 cards', icon: 'Library', category: 'collection', requirement: 'Add 10 cards' },
  { id: 'collector_50', name: 'Dedicated Collector', description: 'Collected 50 cards', icon: 'Award', category: 'collection', requirement: 'Add 50 cards' },
  { id: 'collector_100', name: 'Century Club', description: 'Collected 100 cards', icon: 'Trophy', category: 'collection', requirement: 'Add 100 cards' },
  { id: 'multi_set', name: 'Set Explorer', description: 'Collected cards from 5 different sets', icon: 'Layers', category: 'collection', requirement: 'Collect from 5 sets' },
  { id: 'first_show', name: 'Show Day', description: 'Marked going to your first show', icon: 'MapPin', category: 'shows', requirement: 'Mark Going on a show' },
  { id: 'show_regular', name: 'Show Regular', description: 'Attended 5 or more shows', icon: 'Calendar', category: 'shows', requirement: 'Mark Going on 5 shows' },
  { id: 'show_veteran', name: 'Show Veteran', description: 'Attended 20 or more shows', icon: 'Star', category: 'shows', requirement: 'Mark Going on 20 shows' },
  { id: 'first_review', name: 'Voice Heard', description: 'Left your first show review', icon: 'MessageSquare', category: 'shows', requirement: 'Review a show' },
  { id: 'trade_pioneer', name: 'Trade Pioneer', description: 'Listed your first card for trade', icon: 'ArrowRightLeft', category: 'trading', requirement: 'Mark 1 card for trade' },
  { id: 'trade_master', name: 'Trade Master', description: 'Listed 10 cards for trade', icon: 'Repeat', category: 'trading', requirement: 'Mark 10 cards for trade' },
  { id: 'price_hunter', name: 'Price Hunter', description: 'Set 5 price alerts', icon: 'Bell', category: 'engagement', requirement: 'Set 5 price alerts' },
  { id: 'social_butterfly', name: 'Social Butterfly', description: 'Posted 10 times in show feeds', icon: 'MessageCircle', category: 'engagement', requirement: 'Post 10 feed messages' },
];

export const CATEGORY_LABELS: Record<Achievement['category'], string> = {
  collection: 'Collection',
  shows: 'Shows',
  trading: 'Trading',
  engagement: 'Engagement',
};

export const CATEGORY_COLORS: Record<Achievement['category'], string> = {
  collection: 'blue-500',
  shows: 'green-500',
  trading: 'orange-500',
  engagement: 'purple-500',
};
