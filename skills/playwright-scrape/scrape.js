#!/usr/bin/env node

// Playwright Web Scraping Script für Docker
// Extrahiert strukturierte Daten von Webseiten

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const DATA_DIR = '/workspace/data';
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const timestamp = () => new Date().toISOString().replace(/[:.]/g, '-');

async function scrape(url, type = 'all') {
  console.log(`🕷️  Scraping ${url}...`);
  console.log(`📊 Type: ${type}`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    const data = {
      url,
      scraped_at: new Date().toISOString(),
      title: await page.title()
    };

    // Links extrahieren
    if (type === 'all' || type === 'links') {
      data.links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]')).map(a => ({
          text: a.textContent.trim(),
          url: a.href
        }));
      });
      console.log(`🔗 ${data.links.length} Links gefunden`);
    }

    // Überschriften extrahieren
    if (type === 'all' || type === 'headings') {
      data.headings = await page.evaluate(() => {
        const result = {};
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
          result[tag] = Array.from(document.querySelectorAll(tag)).map(h => h.textContent.trim());
        });
        return result;
      });
      const headingCount = Object.values(data.headings).flat().length;
      console.log(`📑 ${headingCount} Überschriften gefunden`);
    }

    // Bilder extrahieren
    if (type === 'all' || type === 'images') {
      data.images = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('img')).map(img => ({
          src: img.src,
          alt: img.alt || '',
          title: img.title || ''
        }));
      });
      console.log(`🖼️  ${data.images.length} Bilder gefunden`);
    }

    // Meta-Tags extrahieren
    if (type === 'all' || type === 'meta') {
      data.meta = await page.evaluate(() => {
        const metas = {};
        document.querySelectorAll('meta').forEach(meta => {
          const name = meta.getAttribute('name') || meta.getAttribute('property');
          const content = meta.getAttribute('content');
          if (name && content) {
            metas[name] = content;
          }
        });
        return metas;
      });
      console.log(`📝 ${Object.keys(data.meta).length} Meta-Tags gefunden`);
    }

    // Speichern
    const filename = `scrape-${url.replace(/https?:\/\//, '').replace(/[^a-z0-9]/gi, '-')}-${timestamp()}.json`;
    const filepath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));

    console.log(`✅ Daten gespeichert: ${filepath}`);
    console.log(`📁 Größe: ${(fs.statSync(filepath).size / 1024).toFixed(2)} KB`);

    return filepath;

  } catch (error) {
    console.error(`❌ Fehler: ${error.message}`);
    throw error;
  } finally {
    await browser.close();
  }
}

// CLI
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('❌ Verwendung: node scrape.js <url> [type]');
  console.log('');
  console.log('Types: all (default), links, headings, images, meta');
  console.log('');
  console.log('Beispiele:');
  console.log('  node scrape.js https://example.com');
  console.log('  node scrape.js https://github.com links');
  process.exit(1);
}

scrape(args[0], args[1] || 'all').catch(console.error);
