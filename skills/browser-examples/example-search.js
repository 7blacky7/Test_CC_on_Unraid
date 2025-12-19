#!/usr/bin/env node

/**
 * Example: Google Search with Shared Browser
 *
 * Demonstrates how to use BrowserAPI for complex interactions
 */

import { BrowserAPI } from '../lib/browser-api.js';

async function googleSearch(query) {
  console.log(`🔍 Searching Google for: "${query}"`);

  try {
    const browser = new BrowserAPI('http://localhost:8080');

    // 1. Navigate to Google
    console.log('\n📍 Step 1: Navigate to Google...');
    await browser.navigate('https://www.google.com');
    console.log('✅ Loaded Google homepage');

    // Wait a bit for page to fully load
    await browser.wait({ timeout: 2000 });

    // 2. Type search query
    console.log(`\n⌨️  Step 2: Type search query "${query}"...`);
    await browser.evaluate(`
      const input = document.querySelector('textarea[name="q"]') || document.querySelector('input[name="q"]');
      if (input) {
        input.value = '${query}';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    `);
    console.log('✅ Query typed');

    // Wait a bit
    await browser.wait({ timeout: 1000 });

    // 3. Submit search
    console.log('\n🚀 Step 3: Submit search...');
    await browser.evaluate(`
      const form = document.querySelector('form');
      if (form) {
        form.submit();
      }
    `);

    // Wait for navigation
    await browser.wait({ timeout: 3000 });

    // 4. Get results
    console.log('\n📊 Step 4: Extract results...');
    const content = await browser.getContent();
    console.log(`✅ Search completed!`);
    console.log(`   Title: ${content.title}`);
    console.log(`   URL: ${content.url}`);

    // 5. Take screenshot
    console.log('\n📸 Step 5: Take screenshot...');
    const screenshot = await browser.screenshot({ fullPage: false });
    console.log('✅ Screenshot captured (base64)');
    console.log(`   Size: ${screenshot.screenshot.length} chars`);

    console.log('\n✨ Done!');
    console.log('💡 Check the Browser Stream window to see the results!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Main
const query = process.argv[2] || 'Claude AI';
googleSearch(query);
