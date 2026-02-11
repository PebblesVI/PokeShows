import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as cheerio from 'cheerio';
import { writeFileSync } from 'fs';

puppeteerExtra.use(StealthPlugin());

async function main() {
  const browser = await puppeteerExtra.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await page.goto('https://www.tcdb.com/CardShows.cfm', {
    waitUntil: 'networkidle2',
    timeout: 60000,
  });

  const title = await page.title();
  if (title.includes('Just a moment')) {
    await page.waitForFunction(
      'document.title.indexOf("Just a moment") === -1',
      { timeout: 30000 },
    );
  }

  const html = await page.content();
  await browser.close();

  // Save HTML for inspection
  writeFileSync('/tmp/tcdb-page.html', html);
  console.log('HTML saved to /tmp/tcdb-page.html (' + html.length + ' bytes)');

  const $ = cheerio.load(html);

  // Check structure
  console.log('\n--- Structure Analysis ---');
  console.log('col-md-8 elements:', $('.col-md-8').length);
  console.log('col-md-9 elements:', $('.col-md-9').length);
  console.log('col-md-10 elements:', $('.col-md-10').length);

  // Find all <strong> tags and their text
  const strongs = [];
  $('strong').each((_i, el) => {
    const text = $(el).text().trim();
    if (text.length > 5 && text.length < 100) strongs.push(text);
  });
  console.log('\nFirst 10 <strong> texts:');
  for (const s of strongs.slice(0, 10)) {
    console.log('  "' + s + '"');
  }

  // Find MODE=VIEW links
  const links = [];
  $('a[href*="MODE=VIEW"]').each((_i, el) => {
    links.push({
      text: $(el).text().trim(),
      href: $(el).attr('href'),
      parentTag: $(el).parent().prop('tagName'),
      grandparentTag: $(el).parent().parent().prop('tagName'),
    });
  });
  console.log('\nFirst 5 show links:');
  for (const l of links.slice(0, 5)) {
    console.log('  "' + l.text + '" parent=' + l.parentTag + ' grandparent=' + l.grandparentTag);
  }
  console.log('Total MODE=VIEW links:', links.length);

  // Find what container the shows are in
  if (links.length > 0) {
    const firstLink = $('a[href*="MODE=VIEW"]').first();
    let el = firstLink;
    const ancestry = [];
    for (let i = 0; i < 8; i++) {
      el = el.parent();
      const tag = el.prop('tagName');
      const cls = el.attr('class') || '';
      const id = el.attr('id') || '';
      ancestry.push(`${tag}${cls ? '.' + cls.replace(/\s+/g, '.') : ''}${id ? '#' + id : ''}`);
    }
    console.log('\nAncestry of first show link:');
    for (const a of ancestry) {
      console.log('  ' + a);
    }
  }

  // Get the actual HTML around the first few shows
  const firstLi = $('a[href*="MODE=VIEW"]').first().closest('li');
  if (firstLi.length) {
    console.log('\nFirst <li> HTML:');
    console.log(firstLi.html()?.substring(0, 300));
  } else {
    // Try getting parent
    const parent = $('a[href*="MODE=VIEW"]').first().parent();
    console.log('\nParent of first link (' + parent.prop('tagName') + '):');
    console.log(parent.html()?.substring(0, 500));
  }

  // What's before each group of shows?
  $('a[href*="MODE=VIEW"]').first().parent().parent().prevAll().slice(0, 3).each((_i, el) => {
    console.log('\nPreceding sibling (' + $(el).prop('tagName') + '):');
    console.log($(el).html()?.substring(0, 200));
  });

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
