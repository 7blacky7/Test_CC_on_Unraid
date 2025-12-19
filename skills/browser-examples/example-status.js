#!/usr/bin/env node

/**
 * Example: Browser Status Check
 *
 * Shows how to check browser status and get current page info
 */

import { BrowserAPI } from '../lib/browser-api.js';

async function checkStatus() {
  console.log('🔍 Checking Browser Status...\n');

  try {
    const browser = new BrowserAPI('http://localhost:8080');

    // Get status
    const status = await browser.getStatus();

    console.log('='.repeat(60));
    console.log('Browser Status');
    console.log('='.repeat(60));

    if (status.active) {
      console.log('✅ Status:       ACTIVE');
      console.log(`📍 URL:          ${status.url}`);
      console.log(`📄 Title:        ${status.title}`);
      console.log(`📐 Viewport:     ${status.viewport.width}x${status.viewport.height}`);
      console.log(`🆔 Session ID:   ${status.sessionId}`);
    } else {
      console.log('⚠️  Status:       INACTIVE');
      console.log('   Browser session not yet created');
      console.log('   Will be created on first navigation');
    }

    console.log('='.repeat(60));

    // If active, show more details
    if (status.active) {
      console.log('\n📄 Page Content Preview:\n');

      const content = await browser.getContent();
      const textPreview = content.text.substring(0, 200);

      console.log(textPreview);
      console.log('...');
      console.log(`\n(Total ${content.text.length} characters)`);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n💡 Make sure backend is running:');
    console.error('   cd backend && npm run dev');
    process.exit(1);
  }
}

// Main
checkStatus();
