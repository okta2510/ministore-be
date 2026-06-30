#!/bin/bash
# MiniStore API Test Script

API_URL="http://localhost:3001"

echo "🔐 Step 1: Login to get token..."
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/login \
  -H "Content-Type: application/json" \
  -d '{"username":"operator","password":"developer2510"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "✅ Login response:"
echo $LOGIN_RESPONSE | jq .

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token"
  exit 1
fi

echo ""
echo "🛍️ Step 2: Get all products..."
curl -s $API_URL/products \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""
echo "➕ Step 3: Create new product..."
curl -s -X POST $API_URL/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Monitor","price":300,"description":"4K UltraWide"}' | jq .

echo ""
echo "✅ All tests completed!"
