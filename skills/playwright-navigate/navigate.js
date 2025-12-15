#!/usr/bin/env node

// Playwright Navigate & Interact Script für Docker
// Führt Browser-Automatisierung durch

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Verzeichnisse erstellen
const SCREENSHOTS_DIR = '/workspace/screenshots';
const LOGS_DIR = '/workspace/playwright-logs';
const DATA_DIR = '/workspace/data';

[SCREENSHOTS_DIR, LOGS_DIR, DATA_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Timestamp für Dateien
const timestamp = () => new Date().toISOString().replace(/[:.]/g, '-');

// Logging
function log(message) {
  const msg = `[${new Date().toISOString()}] ${message}`;
  console.log(msg);
  fs.appendFileSync(
    path.join(LOGS_DIR, `navigate-${timestamp().split('T')[0]}.log`),
    msg + '\n'
  );
}

// Main Funktion
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('❌ Verwendung: node navigate.js <url> [actions...]');
    console.log('');
    console.log('Beispiele:');
    console.log('  node navigate.js https://google.com');
    console.log('  node navigate.js https://google.com screenshot');
    console.log('  node navigate.js https://google.com title content');
    process.exit(1);
  }

  const url = args[0];
  const actions = args.slice(1);

  log(`🚀 Starte Playwright...`);
  log(`📍 URL: ${url}`);
  log(`⚡ Aktionen: ${actions.length > 0 ? actions.join(', ') : 'none'}`);

  let browser;

  try {
    // Browser starten
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage({
      viewport: { width: 1920, height: 1080 }
    });

    // Navigation
    log(`🌐 Navigiere zu ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    log(`✅ Seite geladen`);

    // Standard-Screenshot wenn keine Aktionen angegeben
    if (actions.length === 0 || actions.includes('screenshot')) {
      const screenshotPath = path.join(
        SCREENSHOTS_DIR,
        `${url.replace(/https?:\/\//, '').replace(/[^a-z0-9]/gi, '-')}-${timestamp()}.png`
      );
      await page.screenshot({ path: screenshotPath, fullPage: true });
      log(`📸 Screenshot: ${screenshotPath}`);
    }

    // Title extrahieren
    if (actions.includes('title')) {
      const title = await page.title();
      log(`📝 Title: ${title}`);
      console.log(`\nTitle: ${title}`);
    }

    // Content extrahieren
    if (actions.includes('content') || actions.includes('text')) {
      const content = await page.textContent('body');
      const contentPath = path.join(DATA_DIR, `content-${timestamp()}.txt`);
      fs.writeFileSync(contentPath, content);
      log(`📄 Content saved: ${contentPath}`);
      console.log(`\nContent (first 500 chars):\n${content.substring(0, 500)}...`);
    }

    // HTML extrahieren
    if (actions.includes('html')) {
      const html = await page.content();
      const htmlPath = path.join(DATA_DIR, `page-${timestamp()}.html`);
      fs.writeFileSync(htmlPath, html);
      log(`📄 HTML saved: ${htmlPath}`);
    }

    log(`✅ Fertig!`);

  } catch (error) {
    log(`❌ Fehler: ${error.message}`);
    console.error(`❌ Fehler: ${error.message}`);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Start
main().catch(console.error);
