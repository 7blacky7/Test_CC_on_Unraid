#!/usr/bin/env node

/**
 * Playwright Navigate (Shared Browser Instance)
 *
 * Uses the shared browser instance via REST API instead of launching a new browser.
 * This ensures all navigation is visible in the Browser Stream UI.
 */

import { BrowserAPI } from '../lib/browser-api.js';
import fs from 'fs';
import path from 'path';

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
    console.log('❌ Verwendung: node navigate-shared.js <url> [actions...]');
    console.log('');
    console.log('Beispiele:');
    console.log('  node navigate-shared.js https://google.com');
    console.log('  node navigate-shared.js https://google.com screenshot');
    console.log('  node navigate-shared.js https://google.com title content');
    console.log('');
    console.log('💡 Dieser Befehl nutzt den geteilten Browser-Stream!');
    console.log('   Alle Aktionen sind im Browser-Fenster sichtbar.');
    process.exit(1);
  }

  const url = args[0];
  const actions = args.slice(1);

  log(`🚀 Starte Browser API Client...`);
  log(`📍 URL: ${url}`);
  log(`⚡ Aktionen: ${actions.length > 0 ? actions.join(', ') : 'none'}`);

  try {
    // Create browser API client
    const browser = new BrowserAPI();

    // Check browser status
    log('🔍 Überprüfe Browser-Status...');
    const status = await browser.getStatus();

    if (status.active) {
      log(`✅ Browser aktiv - Aktuelle URL: ${status.url}`);
    } else {
      log('⚠️ Browser nicht aktiv, wird beim Navigieren gestartet');
    }

    // Navigation
    log(`🌐 Navigiere zu ${url}...`);
    const navResult = await browser.navigate(url);
    log(`✅ Seite geladen - Status: ${navResult.status}`);
    log(`   Titel: ${navResult.title}`);

    // Standard-Screenshot wenn keine Aktionen angegeben
    if (actions.length === 0 || actions.includes('screenshot')) {
      log('📸 Erstelle Screenshot...');
      const screenshotResult = await browser.screenshot({
        fullPage: true,
        type: 'png'
      });

      // Save screenshot
      const screenshotPath = path.join(
        SCREENSHOTS_DIR,
        `${url.replace(/https?:\/\//, '').replace(/[^a-z0-9]/gi, '-')}-${timestamp()}.png`
      );

      const screenshotBuffer = Buffer.from(screenshotResult.screenshot, 'base64');
      fs.writeFileSync(screenshotPath, screenshotBuffer);

      log(`📸 Screenshot gespeichert: ${screenshotPath}`);
      console.log(`\n📸 Screenshot: ${screenshotPath}`);
    }

    // Title extrahieren
    if (actions.includes('title')) {
      const title = await browser.getTitle();
      log(`📝 Title: ${title}`);
      console.log(`\n📝 Title: ${title}`);
    }

    // Content extrahieren
    if (actions.includes('content') || actions.includes('text')) {
      log('📄 Extrahiere Textinhalt...');
      const text = await browser.getText();
      const contentPath = path.join(DATA_DIR, `content-${timestamp()}.txt`);
      fs.writeFileSync(contentPath, text);
      log(`📄 Content gespeichert: ${contentPath}`);
      console.log(`\n📄 Content (erste 500 Zeichen):\n${text.substring(0, 500)}...`);
    }

    // HTML extrahieren
    if (actions.includes('html')) {
      log('📄 Extrahiere HTML...');
      const html = await browser.getHtml();
      const htmlPath = path.join(DATA_DIR, `page-${timestamp()}.html`);
      fs.writeFileSync(htmlPath, html);
      log(`📄 HTML gespeichert: ${htmlPath}`);
    }

    // Info über den geteilten Browser
    console.log('\n💡 Hinweis:');
    console.log('   Diese Navigation wurde im GETEILTEN Browser durchgeführt.');
    console.log('   Öffne das Browser-Stream-Fenster, um die Seite live zu sehen!');
    console.log('   URL: http://localhost:5173 (oder deine Desktop-URL)');

    log(`✅ Fertig!`);

  } catch (error) {
    log(`❌ Fehler: ${error.message}`);
    console.error(`❌ Fehler: ${error.message}`);
    console.error('');
    console.error('💡 Stelle sicher, dass:');
    console.error('   - Backend Server läuft (npm run dev:backend)');
    console.error('   - Browser Stream Service aktiv ist');
    console.error('   - Port 8080 erreichbar ist');
    process.exit(1);
  }
}

// Start
main().catch(console.error);
