#!/bin/bash

# Auth API Test Script
# This script tests the Auth API endpoints
# It creates a test owner to get tokens, tests auth endpoints, then cleans up

# Configuration
BASE_URL="http://localhost:3000"
AUTH_ENDPOINT="$BASE_URL/api/auth"
OWNERS_ENDPOINT="$BASE_URL/api/owners"

# Test owner credentials (using timestamp to ensure uniqueness)
TIMESTAMP=$(date +%s)
TEST_OWNER_EMAIL="test-auth-owner-${TIMESTAMP}@example.com"
TEST_OWNER_PASSWORD="testAuthPassword123"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Global variables
OWNER_ID=""
ACCESS_TOKEN=""
REFRESH_TOKEN=""
EXPIRES_IN=""

# Function to print colored output
print_step() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Function to extract values from JSON response
extract_owner_id() {
    echo "$1" | grep -o '"ownerId":"[^"]*"' | cut -d'"' -f4
}

extract_access_token() {
    echo "$1" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4
}

extract_refresh_token() {
    echo "$1" | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4
}

extract_expires_in() {
    echo "$1" | grep -o '"expiresIn":[0-9]*' | cut -d':' -f2
}

# Function to check if server is running
check_server() {
    print_step "Checking if server is running"
    if curl -s "$BASE_URL" > /dev/null 2>&1; then
        print_success "Server is running"
        return 0
    else
        print_error "Server is not running. Please start the server first."
        print_warning "Run: npm run dev"
        exit 1
    fi
}

# Setup: Create test owner for authentication
setup_test_owner() {
    print_step "Setup: Creating test owner for authentication"
    
    response=$(curl -s -X POST "$OWNERS_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "'$TEST_OWNER_EMAIL'",
            "password": "'$TEST_OWNER_PASSWORD'"
        }')
    
    if [[ $response == *"ownerId"* ]] && [[ $response == *"accessToken"* ]] && [[ $response == *"refreshToken"* ]]; then
        ACCESS_TOKEN=$(extract_access_token "$response")
        REFRESH_TOKEN=$(extract_refresh_token "$response")
        OWNER_ID=$(extract_owner_id "$response")
        EXPIRES_IN=$(extract_expires_in "$response")
        print_success "Test owner created successfully"
        print_success "Owner ID: $OWNER_ID"
        print_success "Access Token: ${ACCESS_TOKEN:0:30}..."
        print_success "Refresh Token: ${REFRESH_TOKEN:0:30}..."
        print_success "Expires In: $EXPIRES_IN seconds"
    else
        print_error "Failed to create test owner"
        echo "Response: $response"
        exit 1
    fi
    echo
}

# Cleanup: Delete test owner
cleanup_test_owner() {
    print_step "Cleanup: Deleting test owner"
    
    if [[ -n "$OWNER_ID" ]] && [[ -n "$ACCESS_TOKEN" ]]; then
        response=$(curl -s -X DELETE "$OWNERS_ENDPOINT/$OWNER_ID" \
            -H "Authorization: Bearer $ACCESS_TOKEN")
        
        if [[ $response == *"\"success\":true"* ]]; then
            print_success "Test owner deleted successfully"
        else
            print_warning "Failed to delete test owner (may have been cleaned up already)"
            echo "Response: $response"
        fi
    else
        print_warning "No test owner to cleanup"
    fi
    echo
}

# Test 1: Refresh token with valid refresh token
test_refresh_token_valid() {
    print_step "Test 1: Refresh token with valid refresh token"
    
    if [[ -z "$REFRESH_TOKEN" ]]; then
        print_error "No refresh token available. Skipping test."
        return
    fi
    
    response=$(curl -s -X POST "$AUTH_ENDPOINT/refresh" \
        -H "Content-Type: application/json" \
        -d '{
            "refreshToken": "'$REFRESH_TOKEN'"
        }')
    
    if [[ $response == *"accessToken"* ]] && [[ $response == *"refreshToken"* ]] && [[ $response == *"expiresIn"* ]]; then
        # Extract new tokens
        NEW_ACCESS_TOKEN=$(extract_access_token "$response")
        NEW_REFRESH_TOKEN=$(extract_refresh_token "$response")
        NEW_EXPIRES_IN=$(extract_expires_in "$response")
        
        print_success "Token refreshed successfully"
        print_success "New Access Token: ${NEW_ACCESS_TOKEN:0:30}..."
        print_success "New Refresh Token: ${NEW_REFRESH_TOKEN:0:30}..."
        print_success "New Expires In: $NEW_EXPIRES_IN seconds"
        
        # Update tokens for cleanup
        ACCESS_TOKEN=$NEW_ACCESS_TOKEN
        REFRESH_TOKEN=$NEW_REFRESH_TOKEN
        
        echo "Response: $response"
    else
        print_error "Failed to refresh token"
        echo "Response: $response"
    fi
    echo
}

# Test 2: Refresh token with invalid refresh token
test_refresh_token_invalid() {
    print_step "Test 2: Refresh token with invalid refresh token"
    
    response=$(curl -s -X POST "$AUTH_ENDPOINT/refresh" \
        -H "Content-Type: application/json" \
        -d '{
            "refreshToken": "invalid_refresh_token_12345"
        }')
    
    if [[ $response == *"Invalid refresh token"* ]] && [[ $response == *"401"* ]]; then
        print_success "Invalid refresh token handled correctly"
        echo "Response: $response"
    else
        print_error "Invalid refresh token error not handled properly"
        echo "Response: $response"
    fi
    echo
}

# Test 3: Refresh token with empty refresh token
test_refresh_token_empty() {
    print_step "Test 3: Refresh token with empty refresh token"
    
    response=$(curl -s -X POST "$AUTH_ENDPOINT/refresh" \
        -H "Content-Type: application/json" \
        -d '{
            "refreshToken": ""
        }')
    
    if [[ $response == *"error"* ]] || [[ $response == *"validation"* ]] || [[ $response == *"400"* ]]; then
        print_success "Empty refresh token handled correctly"
        echo "Response: $response"
    else
        print_error "Empty refresh token error not handled properly"
        echo "Response: $response"
    fi
    echo
}

# Test 4: Refresh token with missing refresh token field
test_refresh_token_missing() {
    print_step "Test 4: Refresh token with missing refresh token field"
    
    response=$(curl -s -X POST "$AUTH_ENDPOINT/refresh" \
        -H "Content-Type: application/json" \
        -d '{}')
    
    if [[ $response == *"error"* ]] || [[ $response == *"validation"* ]] || [[ $response == *"400"* ]]; then
        print_success "Missing refresh token field handled correctly"
        echo "Response: $response"
    else
        print_error "Missing refresh token field error not handled properly"
        echo "Response: $response"
    fi
    echo
}

# Test 5: Refresh token with malformed JSON
test_refresh_token_malformed_json() {
    print_step "Test 5: Refresh token with malformed JSON"
    
    response=$(curl -s -X POST "$AUTH_ENDPOINT/refresh" \
        -H "Content-Type: application/json" \
        -d '{
            "refreshToken": "valid_token",
        }')
    
    if [[ $response == *"error"* ]] || [[ $response == *"400"* ]]; then
        print_success "Malformed JSON handled correctly"
        echo "Response: $response"
    else
        print_error "Malformed JSON error not handled properly"
        echo "Response: $response"
    fi
    echo
}

# Test 6: Refresh token without Content-Type header
test_refresh_token_no_content_type() {
    print_step "Test 6: Refresh token without Content-Type header"
    
    if [[ -z "$REFRESH_TOKEN" ]]; then
        print_error "No refresh token available. Skipping test."
        return
    fi
    
    response=$(curl -s -X POST "$AUTH_ENDPOINT/refresh" \
        -d '{
            "refreshToken": "'$REFRESH_TOKEN'"
        }')
    
    if [[ $response == *"error"* ]] || [[ $response == *"400"* ]]; then
        print_success "Missing Content-Type header handled correctly"
        echo "Response: $response"
    else
        print_warning "Missing Content-Type header may have been handled by server defaults"
        echo "Response: $response"
    fi
    echo
}

# Test 7: Multiple refresh token requests (to test token rotation)
test_multiple_refresh_requests() {
    print_step "Test 7: Multiple refresh token requests"
    
    if [[ -z "$REFRESH_TOKEN" ]]; then
        print_error "No refresh token available. Skipping test."
        return
    fi
    
    # First refresh
    response1=$(curl -s -X POST "$AUTH_ENDPOINT/refresh" \
        -H "Content-Type: application/json" \
        -d '{
            "refreshToken": "'$REFRESH_TOKEN'"
        }')
    
    if [[ $response1 == *"accessToken"* ]] && [[ $response1 == *"refreshToken"* ]]; then
        NEW_REFRESH_TOKEN=$(extract_refresh_token "$response1")
        print_success "First refresh successful"
        
        # Second refresh with new token
        response2=$(curl -s -X POST "$AUTH_ENDPOINT/refresh" \
            -H "Content-Type: application/json" \
            -d '{
                "refreshToken": "'$NEW_REFRESH_TOKEN'"
            }')
        
        if [[ $response2 == *"accessToken"* ]] && [[ $response2 == *"refreshToken"* ]]; then
            print_success "Second refresh successful - token rotation working"
            # Update tokens for cleanup
            ACCESS_TOKEN=$(extract_access_token "$response2")
            REFRESH_TOKEN=$(extract_refresh_token "$response2")
        else
            print_error "Second refresh failed"
            echo "Response: $response2"
        fi
    else
        print_error "First refresh failed"
        echo "Response: $response1"
    fi
    echo
}

# Trap to ensure cleanup on script exit
trap cleanup_test_owner EXIT

# Main execution
main() {
    echo -e "${BLUE}🚀 Starting Auth API Tests${NC}"
    echo
    
    check_server
    echo
    
    # Setup
    setup_test_owner
    
    # Success case tests
    test_refresh_token_valid
    test_multiple_refresh_requests
    
    # Error case tests
    test_refresh_token_invalid
    test_refresh_token_empty
    test_refresh_token_missing
    test_refresh_token_malformed_json
    test_refresh_token_no_content_type
    
    echo -e "${GREEN}🎉 All Auth API tests completed!${NC}"
    echo
    
    print_warning "Test owner will be cleaned up automatically."
}

# Run the tests
main "$@" 