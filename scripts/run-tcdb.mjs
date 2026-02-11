import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as cheerio from 'cheerio';
import { parse, format } from 'date-fns';
import { createClient } from '@libsql/client';

puppeteerExtra.use(StealthPlugin());

const STATE_NAMES = {
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

const STATE_CODE_SET = new Set(Object.keys(STATE_NAMES));

function tryParseDate(dateStr) {
  try {
    const cleaned = dateStr.replace(/^[A-Za-z]+,\s*/, '').trim();
    const parsed = parse(cleaned, 'MMMM d, yyyy', new Date());
    return format(parsed, 'yyyy-MM-dd');
  } catch {
    return null;
  }
}

/**
 * Parses TCDB's carousel items. Each item structure:
 * <br><strong><a href="...MODE=VIEW&ID=XXX">Show Name</a></strong><br><br>
 * DateLine<br>TimeLine<br><br>
 * VenueName<br>
 * City, State, Country
 */
function parseCarouselShows(html) {
  const $ = cheerio.load(html);
  const shows = [];

  $('.carousel-item').each((_i, el) => {
    try {
      const $item = $(el);
      const link = $item.find('a[href*="MODE=VIEW"]').first();
      if (!link.length) return;

      const name = link.text().trim();
      const href = link.attr('href') || '';
      const idMatch = href.match(/ID=(\d+)/i);
      if (!idMatch || !name) return;

      // Get all text content split by <br> tags
      const itemHtml = $item.html() || '';
      const parts = itemHtml
        .split(/<br\s*\/?>/gi)
        .map(s => s.replace(/<[^>]+>/g, '').trim())
        .filter(s => s.length > 0);

      // parts typically: [showName, date, time, venueName, "City, State, Country"]
      let dateStr = null;
      let startTime = null;
      let endTime = null;
      let venueName = null;
      let city = null;
      let stateCode = null;

      for (const part of parts) {
        // Skip the show name (already extracted)
        if (part === name) continue;

        // Match date: "Wednesday, February 11, 2026"
        if (/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),/.test(part)) {
          dateStr = tryParseDate(part);
          continue;
        }

        // Match time: "5:00 PM - 9:00 PM"
        const timeMatch = part.match(/^(\d{1,2}:\d{2}\s*[AP]M)\s*[-–]\s*(\d{1,2}:\d{2}\s*[AP]M)$/i);
        if (timeMatch) {
          startTime = timeMatch[1].trim();
          endTime = timeMatch[2].trim();
          continue;
        }

        // Match "City, ST, Country" or "City, State, Country"
        // US format: "Lakeland, FL, United States"
        const usLocationMatch = part.match(/^(.+?),\s*([A-Z]{2}),\s*United States$/);
        if (usLocationMatch) {
          city = usLocationMatch[1].trim();
          stateCode = usLocationMatch[2];
          continue;
        }

        // Skip non-US locations
        if (part.includes(', Canada') || part.includes(', United Kingdom') || part.includes(', Australia') || part.includes(', Germany')) {
          continue;
        }

        // If we haven't got a venue yet, and it's not a date or time, it's probably the venue
        if (!venueName && !dateStr) {
          // Skip, before date
        } else if (!venueName && dateStr && !timeMatch) {
          venueName = part;
        }
      }

      // Must be a US show
      if (!stateCode || !STATE_CODE_SET.has(stateCode)) return;
      if (!dateStr) return;
      if (!city) return;

      shows.push({
        name,
        venueName,
        city,
        state: stateCode,
        startDate: dateStr,
        startTime,
        endTime,
        sourceId: idMatch[1],
        sourceUrl: `https://www.tcdb.com${href.startsWith('/') ? '' : '/'}${href}`,
      });
    } catch (error) {
      // skip
    }
  });

  return shows;
}

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function main() {
  console.log('Launching stealth browser...');
  const browser = await puppeteerExtra.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log('Navigating to TCDB...');
  await page.goto('https://www.tcdb.com/CardShows.cfm', {
    waitUntil: 'networkidle2',
    timeout: 60000,
  });

  const title = await page.title();
  if (title.includes('Just a moment')) {
    console.log('Waiting for Cloudflare...');
    await page.waitForFunction(
      'document.title.indexOf("Just a moment") === -1',
      { timeout: 30000 },
    );
  }

  const html = await page.content();
  await browser.close();

  const shows = parseCarouselShows(html);
  console.log(`Parsed ${shows.length} US shows from TCDB`);

  // State breakdown
  const stateCounts = {};
  for (const s of shows) {
    stateCounts[s.state] = (stateCounts[s.state] || 0) + 1;
  }
  const sorted = Object.entries(stateCounts).sort((a, b) => b[1] - a[1]);
  console.log('By state:');
  for (const [st, cnt] of sorted) {
    console.log(`  ${st}: ${cnt}`);
  }

  // Insert into DB
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  let created = 0;
  let updated = 0;

  for (const show of shows) {
    const baseSlug = slugify(show.name) + '-' + show.startDate;
    const stateFullName = STATE_NAMES[show.state] || show.state;
    const now = new Date().toISOString();

    try {
      const existing = await client.execute({
        sql: 'SELECT id FROM shows WHERE source_name = ? AND source_id = ? LIMIT 1',
        args: ['tcdb', show.sourceId],
      });

      if (existing.rows.length > 0) {
        await client.execute({
          sql: `UPDATE shows SET name = ?, venue_name = COALESCE(?, venue_name), city = ?, state = ?, state_full_name = ?,
                start_date = ?, start_time = COALESCE(?, start_time), end_time = COALESCE(?, end_time),
                source_url = ?, updated_at = ?, last_scraped_at = ?, is_active = 1 WHERE id = ?`,
          args: [show.name, show.venueName || null, show.city, show.state, stateFullName,
                 show.startDate, show.startTime || null, show.endTime || null,
                 show.sourceUrl, now, now, existing.rows[0].id],
        });
        updated++;
      } else {
        // Use city+state in slug to avoid collisions for recurring shows in different locations
        const slug = baseSlug + '-' + show.city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        await client.execute({
          sql: `INSERT INTO shows (slug, name, venue_name, city, state, state_full_name, start_date, start_time, end_time,
                event_type, is_pokemon_specific, source_id, source_name, source_url, last_scraped_at, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          args: [slug, show.name, show.venueName || null, show.city, show.state, stateFullName,
                 show.startDate, show.startTime || null, show.endTime || null,
                 'card_show', /pok[eé]mon/i.test(show.name) ? 1 : 0,
                 show.sourceId, 'tcdb', show.sourceUrl, now],
        });
        created++;
      }
    } catch (err) {
      // Skip duplicates
      if (err.code === 'SQLITE_CONSTRAINT') {
        updated++;
      } else {
        console.error(`Error upserting "${show.name}":`, err.message);
      }
    }
  }

  console.log(`\nDB: ${created} created, ${updated} updated`);

  // Final stats
  const total = await client.execute('SELECT count(*) as cnt FROM shows WHERE is_active = 1');
  console.log(`Total active shows: ${total.rows[0].cnt}`);

  const upcoming = await client.execute(
    "SELECT state, count(*) as cnt FROM shows WHERE is_active = 1 AND start_date >= '2026-02-10' GROUP BY state ORDER BY cnt DESC"
  );
  let upcomingTotal = 0;
  console.log('Upcoming shows by state:');
  for (const r of upcoming.rows) {
    console.log(`  ${r.state}: ${r.cnt}`);
    upcomingTotal += Number(r.cnt);
  }
  console.log(`Total upcoming: ${upcomingTotal}`);

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
