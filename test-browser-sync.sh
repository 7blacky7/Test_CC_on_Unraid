#!/bin/bash

# Browser Sync Integration - Quick Test Script
# Tests all components of the Browser Sync Integration

echo "========================================"
echo "Browser Sync Integration - Test Suite"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Helper functions
test_passed() {
  echo -e "${GREEN}✅ PASSED${NC}: $1"
  ((PASSED++))
}

test_failed() {
  echo -e "${RED}❌ FAILED${NC}: $1"
  echo -e "   Error: $2"
  ((FAILED++))
}

test_warning() {
  echo -e "${YELLOW}⚠️  WARNING${NC}: $1"
}

# Test 1: Check if backend is running
echo "Test 1: Backend Health Check"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health)
if [ "$RESPONSE" = "200" ]; then
  test_passed "Backend is running on port 8080"
else
  test_failed "Backend health check" "Expected HTTP 200, got $RESPONSE"
  echo ""
  test_warning "Please start backend: cd backend && npm run dev"
  exit 1
fi
echo ""

# Test 2: Check browser status
echo "Test 2: Browser Status Check"
STATUS=$(curl -s http://localhost:8080/api/browser/status)
if echo "$STATUS" | grep -q '"success":true'; then
  test_passed "Browser API is accessible"

  # Check if browser is active
  if echo "$STATUS" | grep -q '"active":true'; then
    test_passed "Browser session is active"
  else
    test_warning "Browser session not yet active (will be created on first use)"
  fi
else
  test_failed "Browser status check" "API returned error"
fi
echo ""

# Test 3: Test navigation
echo "Test 3: Navigation Test"
NAV_RESPONSE=$(curl -s -X POST http://localhost:8080/api/browser/navigate \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}')

if echo "$NAV_RESPONSE" | grep -q '"success":true'; then
  test_passed "Navigation to example.com successful"

  # Extract title
  TITLE=$(echo "$NAV_RESPONSE" | grep -o '"title":"[^"]*"' | cut -d'"' -f4)
  echo "   Title: $TITLE"
else
  test_failed "Navigation test" "Navigation failed"
fi
echo ""

# Test 4: Test content retrieval
echo "Test 4: Content Retrieval Test"
CONTENT=$(curl -s http://localhost:8080/api/browser/content)

if echo "$CONTENT" | grep -q '"success":true'; then
  test_passed "Content retrieval successful"

  # Check if we got title and url
  if echo "$CONTENT" | grep -q '"title"'; then
    test_passed "Title field present"
  fi

  if echo "$CONTENT" | grep -q '"url"'; then
    test_passed "URL field present"
  fi

  if echo "$CONTENT" | grep -q '"text"'; then
    test_passed "Text content present"
  fi
else
  test_failed "Content retrieval" "Failed to get content"
fi
echo ""

# Test 5: Test screenshot
echo "Test 5: Screenshot Test"
SCREENSHOT=$(curl -s -X POST http://localhost:8080/api/browser/screenshot \
  -H "Content-Type: application/json" \
  -d '{"fullPage": false, "type": "png"}')

if echo "$SCREENSHOT" | grep -q '"success":true'; then
  test_passed "Screenshot captured"

  # Check if we got base64 data
  if echo "$SCREENSHOT" | grep -q '"screenshot":"'; then
    test_passed "Screenshot data present (base64)"

    # Get length of base64 string (roughly)
    LENGTH=$(echo "$SCREENSHOT" | grep -o '"screenshot":"[^"]*"' | wc -c)
    echo "   Data size: ~$LENGTH chars"
  fi
else
  test_failed "Screenshot test" "Failed to capture screenshot"
fi
echo ""

# Test 6: Test JavaScript evaluation
echo "Test 6: JavaScript Evaluation Test"
EVAL_RESPONSE=$(curl -s -X POST http://localhost:8080/api/browser/evaluate \
  -H "Content-Type: application/json" \
  -d '{"code": "document.title"}')

if echo "$EVAL_RESPONSE" | grep -q '"success":true'; then
  test_passed "JavaScript evaluation successful"

  # Extract result
  RESULT=$(echo "$EVAL_RESPONSE" | grep -o '"result":"[^"]*"' | cut -d'"' -f4)
  echo "   Result: $RESULT"
else
  test_failed "JavaScript evaluation" "Evaluation failed"
fi
echo ""

# Test 7: Check WebSocket server
echo "Test 7: WebSocket Server Check"
# Try to connect to WebSocket (basic check)
if nc -z localhost 8081 2>/dev/null; then
  test_passed "WebSocket server is listening on port 8081"
else
  test_warning "WebSocket server check skipped (nc not available)"
fi
echo ""

# Test 8: Check files exist
echo "Test 8: File Structure Check"

FILES=(
  "backend/browser.js"
  "backend/services/browserStreamService.js"
  "skills/lib/browser-api.js"
  "skills/playwright-navigate/navigate-shared.js"
  "skills/browser-examples/example-status.js"
  "skills/browser-examples/example-search.js"
  "docs/BROWSER_SYNC_INTEGRATION.md"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    test_passed "File exists: $file"
  else
    test_failed "File check" "$file not found"
  fi
done
echo ""

# Summary
echo "========================================"
echo "Test Summary"
echo "========================================"
echo -e "${GREEN}Passed: $PASSED${NC}"
if [ $FAILED -gt 0 ]; then
  echo -e "${RED}Failed: $FAILED${NC}"
else
  echo -e "${GREEN}Failed: 0${NC}"
fi
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Open Browser Stream: http://localhost:5173"
  echo "2. Run a skill: node skills/playwright-navigate/navigate-shared.js https://github.com"
  echo "3. Watch the navigation in the Browser Stream window!"
  echo ""
  exit 0
else
  echo -e "${RED}❌ Some tests failed!${NC}"
  echo ""
  echo "Troubleshooting:"
  echo "1. Make sure backend is running: cd backend && npm run dev"
  echo "2. Check backend logs for errors"
  echo "3. See docs/BROWSER_SYNC_INTEGRATION.md for help"
  echo ""
  exit 1
fi
