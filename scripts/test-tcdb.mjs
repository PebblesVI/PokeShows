import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteerExtra.use(StealthPlugin());

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

  let title = await page.title();
  console.log('Page title: ' + title);

  if (title.includes('Just a moment')) {
    console.log('Cloudflare challenge detected, waiting up to 30s...');
    try {
      await page.waitForFunction(
        'document.title.indexOf("Just a moment") === -1',
        { timeout: 30000 },
      );
      title = await page.title();
      console.log('After challenge, title: ' + title);
    } catch {
      console.log('Challenge timed out — still blocked');
    }
  }

  const html = await page.content();
  const isBlocked = html.includes('challenge-platform') || html.includes('Just a moment');
  console.log('Blocked: ' + isBlocked);
  console.log('HTML length: ' + html.length);

  const hasShows = html.includes('MODE=VIEW') || html.includes('col-md-8');
  console.log('Has show data: ' + hasShows);

  if (hasShows) {
    const showLinks = (html.match(/MODE=VIEW/g) || []).length;
    console.log('Show links found: ' + showLinks);

    // Extract a few show names
    const nameMatches = html.match(/MODE=VIEW[^"]*"[^>]*>([^<]+)/g) || [];
    for (const m of nameMatches.slice(0, 10)) {
      const name = m.match(/>([^<]+)$/)?.[1];
      if (name) console.log('  - ' + name);
    }
    if (nameMatches.length > 10) console.log('  ... and ' + (nameMatches.length - 10) + ' more');
  }

  await browser.close();
  process.exit(0);
}

main().catch(e => { console.error(e.message); process.exit(1); });
