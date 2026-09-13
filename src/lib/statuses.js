// Order here is the order shelves appear in the bookcase.
export const STATUSES = [
  {
    id: 'wishlist',
    label: 'Wishlist',
    shelf: 'Wishlist',
    color: '#b3489a',
    empty: 'Nothing on your wishlist yet.',
  },
  {
    id: 'playing',
    label: 'Playing',
    shelf: 'Currently playing',
    color: '#2f9c4f',
    empty: 'Nothing in progress right now.',
  },
  { id: 'paused', label: 'Paused', shelf: 'On pause', color: '#e0a526', empty: 'No paused games.' },
  {
    id: 'not-started',
    label: 'Not started',
    shelf: 'Up next',
    color: '#8d93b3',
    empty: 'Nothing up next. Search for a game above to add one.',
  },
  { id: 'finished', label: 'Finished', shelf: 'Finished', color: '#3452c9', empty: 'No finished games yet.' },
];

export const STATUS_BY_ID = Object.fromEntries(STATUSES.map((s) => [s.id, s]));

export const DEFAULT_STATUS = 'not-started';
