import slugifyLib from 'slugify';

export function generateShowSlug(name: string, startDate: string): string {
  const nameSlug = slugifyLib(name, { lower: true, strict: true });
  return `${nameSlug}-${startDate}`;
}
