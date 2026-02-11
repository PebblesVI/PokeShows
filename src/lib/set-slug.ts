export function setIdToSlug(setId: string): string {
  return setId.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function setNameToSearchQuery(setName: string): string {
  return `pokemon ${setName} cards`;
}
