import type { InferSelectModel } from 'drizzle-orm';
import type { cardOfTheDay } from '@/db/schema';

export type CardOfTheDay = InferSelectModel<typeof cardOfTheDay>;
