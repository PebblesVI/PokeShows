import type { InferSelectModel } from 'drizzle-orm';
import type { shows } from '@/db/schema';

export type Show = InferSelectModel<typeof shows>;
