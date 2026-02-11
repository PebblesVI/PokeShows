export function cardToSlug(cardName: string, setName: string): string {
  return `${cardName}-${setName}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function slugToSearchQuery(slug: string): string {
  return slug.replace(/-/g, ' ');
}
