export const US_STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'District of Columbia',
};

export const US_STATES = Object.keys(US_STATE_NAMES);

export const SHOP_CATEGORIES = [
  {
    slug: 'booster-boxes',
    name: 'Sealed Booster Boxes',
    description: 'Factory sealed Pokemon booster boxes from the latest sets.',
    searchQuery: 'pokemon booster box sealed',
    ebayCategory: '183454',
  },
  {
    slug: 'elite-trainer-boxes',
    name: 'Elite Trainer Boxes',
    description: 'Pokemon ETBs with booster packs, sleeves, and dice.',
    searchQuery: 'pokemon elite trainer box sealed',
    ebayCategory: '183454',
  },
  {
    slug: 'graded-cards',
    name: 'Graded Cards (PSA/CGC)',
    description: 'Professionally graded Pokemon cards from PSA, CGC, and BGS.',
    searchQuery: 'pokemon PSA graded card',
    ebayCategory: '183454',
  },
  {
    slug: 'vintage-cards',
    name: 'Vintage Cards',
    description: 'Base Set, Jungle, Fossil, and other classic Pokemon cards.',
    searchQuery: 'pokemon vintage card base set holo',
    ebayCategory: '183454',
  },
  {
    slug: 'japanese-cards',
    name: 'Japanese Pokemon Cards',
    description: 'Authentic Japanese Pokemon TCG cards and sealed products.',
    searchQuery: 'pokemon card japanese',
    ebayCategory: '183454',
  },
  {
    slug: 'accessories',
    name: 'Card Supplies & Accessories',
    description: 'Sleeves, binders, top loaders, and card storage.',
    searchQuery: 'pokemon card supplies sleeves binder',
    ebayCategory: '183461',
  },
  {
    slug: 'tins-packs',
    name: 'Tins & Blister Packs',
    description: 'Pokemon tins, blister packs, and collection boxes.',
    searchQuery: 'pokemon tin sealed collection',
    ebayCategory: '183454',
  },
  {
    slug: 'singles',
    name: 'Single Cards',
    description: 'Individual Pokemon cards — chase your favorite pulls.',
    searchQuery: 'pokemon card single rare',
    ebayCategory: '183454',
  },
];

export const SITE_NAME = 'PokeShows';
export const SITE_DESCRIPTION = 'The ultimate directory of Pokemon and trading card shows across the United States.';
