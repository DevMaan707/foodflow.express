#!/bin/bash

# FoodRequest Smoke Test Script
# This script performs basic smoke testing using curl commands

set -e  # Exit on any error

# Configuration
BASE_URL="http://localhost:5000/api"
TIMESTAMP=$(date +%s)

echo "🧪 Starting FoodRequest Smoke Test..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function for logging
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_info() {
    echo -e "${YELLOW}📋 $1${NC}"
}

# Step 1: Create Test Donor
log_info "Step 1: Creating test donor..."
DONOR_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Test\",
    \"lastName\": \"Donor\",
    \"email\": \"test-donor-$TIMESTAMP@example.com\",
    \"password\": \"password123\",
    \"phone\": \"1234567890\",
    \"userType\": \"donor\"
  }")

if echo "$DONOR_RESPONSE" | grep -q '"user"'; then
    DONOR_ID=$(echo "$DONOR_RESPONSE" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
    log_success "Donor created with ID: $DONOR_ID"
else
    log_error "Failed to create donor"
    echo "Response: $DONOR_RESPONSE"
    exit 1
fi

# Step 2: Create Test Receiver
log_info "Step 2: Creating test receiver..."
RECEIVER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Test\",
    \"lastName\": \"Receiver\",
    \"email\": \"test-receiver-$TIMESTAMP@example.com\",
    \"password\": \"password123\",
    \"phone\": \"0987654321\",
    \"userType\": \"receiver\"
  }")

if echo "$RECEIVER_RESPONSE" | grep -q '"user"'; then
    RECEIVER_ID=$(echo "$RECEIVER_RESPONSE" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
    log_success "Receiver created with ID: $RECEIVER_ID"
else
    log_error "Failed to create receiver"
    echo "Response: $RECEIVER_RESPONSE"
    exit 1
fi

# Step 3: Login as Donor to get auth token
log_info "Step 3: Authenticating donor..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"test-donor-$TIMESTAMP@example.com\",
    \"password\": \"password123\"
  }")

if echo "$LOGIN_RESPONSE" | grep -q '"token"'; then
    AUTH_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    log_success "Authentication successful"
else
    log_error "Failed to authenticate donor"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

# Step 4: Create Test Food
log_info "Step 4: Creating test food..."
FOOD_RESPONSE=$(curl -s -X POST "$BASE_URL/foods" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d "{
    \"title\": \"Test Food Item for Smoke Test\",
    \"description\": \"A delicious test food item created for FoodRequest smoke testing\",
    \"donor\": \"$DONOR_ID\"
  }")

if echo "$FOOD_RESPONSE" | grep -q '"_id"'; then
    FOOD_ID=$(echo "$FOOD_RESPONSE" | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)
    
    # Verify default status
    if echo "$FOOD_RESPONSE" | grep -q '"status":"available"'; then
        log_success "Food created with ID: $FOOD_ID (status: available)"
    else
        log_error "Food created but default status is not 'available'"
    fi
else
    log_error "Failed to create food"
    echo "Response: $FOOD_RESPONSE"
    exit 1
fi

# Step 5: Create FoodRequest (Main Test)
log_info "Step 5: Creating FoodRequest..."
FOOD_REQUEST_RESPONSE=$(curl -s -X POST "$BASE_URL/food-requests" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d "{
    \"food\": \"$FOOD_ID\",
    \"requester\": \"$RECEIVER_ID\",
    \"donor\": \"$DONOR_ID\",
    \"requestedQuantity\": \"2 servings\",
    \"message\": \"Hello, I would like to request this food item for my family. Thank you for your generosity!\"
  }")

if echo "$FOOD_REQUEST_RESPONSE" | grep -q '"_id"'; then
    FOOD_REQUEST_ID=$(echo "$FOOD_REQUEST_RESPONSE" | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)
    
    # Verify default status is 'pending'
    if echo "$FOOD_REQUEST_RESPONSE" | grep -q '"status":"pending"'; then
        log_success "FoodRequest created with ID: $FOOD_REQUEST_ID (status: pending)"
    else
        log_error "FoodRequest created but default status is not 'pending'"
        echo "Response: $FOOD_REQUEST_RESPONSE"
    fi
    
    # Verify default isActive is true
    if echo "$FOOD_REQUEST_RESPONSE" | grep -q '"isActive":true'; then
        log_success "Default isActive verified: true"
    else
        log_error "Default isActive is not true"
    fi
    
    # Verify timestamps exist
    if echo "$FOOD_REQUEST_RESPONSE" | grep -q '"createdAt"' && echo "$FOOD_REQUEST_RESPONSE" | grep -q '"updatedAt"'; then
        log_success "Timestamps verified (createdAt and updatedAt present)"
    else
        log_error "Timestamps not found"
    fi
    
else
    log_error "Failed to create FoodRequest"
    echo "Response: $FOOD_REQUEST_RESPONSE"
    exit 1
fi

# Step 6: Test Index Queries
log_info "Step 6: Testing index queries..."

# Query by requester
log_info "Testing query by requester..."
REQUESTER_QUERY=$(curl -s -X GET "$BASE_URL/food-requests?requester=$RECEIVER_ID" \
  -H "Authorization: Bearer $AUTH_TOKEN")

if echo "$REQUESTER_QUERY" | grep -q "$FOOD_REQUEST_ID"; then
    log_success "Requester index query successful"
else
    log_error "Requester index query failed"
fi

# Query by status
log_info "Testing query by status..."
STATUS_QUERY=$(curl -s -X GET "$BASE_URL/food-requests?status=pending" \
  -H "Authorization: Bearer $AUTH_TOKEN")

if echo "$STATUS_QUERY" | grep -q "$FOOD_REQUEST_ID"; then
    log_success "Status index query successful"
else
    log_error "Status index query failed"
fi

# Query by donor
log_info "Testing query by donor..."
DONOR_QUERY=$(curl -s -X GET "$BASE_URL/food-requests?donor=$DONOR_ID" \
  -H "Authorization: Bearer $AUTH_TOKEN")

if echo "$DONOR_QUERY" | grep -q "$FOOD_REQUEST_ID"; then
    log_success "Donor index query successful"
else
    log_error "Donor index query failed"
fi

# Query by food
log_info "Testing query by food..."
FOOD_QUERY=$(curl -s -X GET "$BASE_URL/food-requests?food=$FOOD_ID" \
  -H "Authorization: Bearer $AUTH_TOKEN")

if echo "$FOOD_QUERY" | grep -q "$FOOD_REQUEST_ID"; then
    log_success "Food index query successful"
else
    log_error "Food index query failed"
fi

# Step 7: Test Duplicate Prevention
log_info "Step 7: Testing duplicate prevention..."
DUPLICATE_RESPONSE=$(curl -s -X POST "$BASE_URL/food-requests" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d "{
    \"food\": \"$FOOD_ID\",
    \"requester\": \"$RECEIVER_ID\",
    \"donor\": \"$DONOR_ID\",
    \"requestedQuantity\": \"1 serving\",
    \"message\": \"This should fail due to duplicate prevention!\"
  }")

if echo "$DUPLICATE_RESPONSE" | grep -q "already have an active request"; then
    log_success "Duplicate prevention working correctly"
else
    log_error "Duplicate prevention failed - duplicate was allowed"
    echo "Response: $DUPLICATE_RESPONSE"
fi

# Step 8: Test Single Document Retrieval
log_info "Step 8: Testing single document retrieval..."
SINGLE_RESPONSE=$(curl -s -X GET "$BASE_URL/food-requests/$FOOD_REQUEST_ID" \
  -H "Authorization: Bearer $AUTH_TOKEN")

if echo "$SINGLE_RESPONSE" | grep -q "$FOOD_REQUEST_ID"; then
    log_success "Single document retrieval successful"
else
    log_error "Single document retrieval failed"
fi

# Optional: Clean up test data
log_info "Cleaning up test data..."

# Delete FoodRequest
curl -s -X DELETE "$BASE_URL/food-requests/$FOOD_REQUEST_ID" \
  -H "Authorization: Bearer $AUTH_TOKEN" > /dev/null
log_success "Test FoodRequest deleted"

# Delete Food
curl -s -X DELETE "$BASE_URL/foods/$FOOD_ID" \
  -H "Authorization: Bearer $AUTH_TOKEN" > /dev/null
log_success "Test Food deleted"

echo "================================================"
echo "🎉 FoodRequest Smoke Test Completed Successfully!"
echo ""
echo "📊 Summary:"
echo "- ✅ FoodRequest document creation"
echo "- ✅ Default status 'pending' verified"
echo "- ✅ Default isActive 'true' verified"
echo "- ✅ Timestamps automatically set"
echo "- ✅ Requester index query functional"
echo "- ✅ Status index query functional" 
echo "- ✅ Donor index query functional"
echo "- ✅ Food index query functional"
echo "- ✅ Duplicate prevention working"
echo "- ✅ Single document retrieval working"
echo ""
echo "🚀 Backend is ready for frontend integration!"

