#!/bin/bash

# Owner API Test Script
# This script tests all endpoints in the Owner API

# Configuration
BASE_URL="http://localhost:3000"
OWNERS_ENDPOINT="$BASE_URL/api/owners"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Global variables to store test data
OWNER_ID=""
ACCESS_TOKEN=""
REFRESH_TOKEN=""
TEST_EMAIL="test@example.com"
TEST_PASSWORD="testPassword123"

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

# Function to extract owner ID from response
extract_owner_id() {
    echo "$1" | grep -o '"ownerId":"[^"]*"' | cut -d'"' -f4
}

# Function to extract access token from response
extract_access_token() {
    echo "$1" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4
}

# Function to extract refresh token from response
extract_refresh_token() {
    echo "$1" | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4
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

# Test 1: Create a new owner
test_create_owner() {
    print_step "Test 1: Create a new owner"
    
    response=$(curl -s -X POST "$OWNERS_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "'$TEST_EMAIL'",
            "password": "'$TEST_PASSWORD'"
        }')
    
    if [[ $response == *"ownerId"* ]] && [[ $response == *"accessToken"* ]] && [[ $response == *"refreshToken"* ]]; then
        OWNER_ID=$(extract_owner_id "$response")
        ACCESS_TOKEN=$(extract_access_token "$response")
        REFRESH_TOKEN=$(extract_refresh_token "$response")
        print_success "Owner created successfully with ID: $OWNER_ID"
        echo "Response: $response"
    else
        print_error "Failed to create owner"
        echo "Response: $response"
        exit 1
    fi
    echo
}

# Test 2: Get owner by ID
test_get_owner_by_id() {
    print_step "Test 2: Get owner by ID"
    
    if [[ -z "$OWNER_ID" ]]; then
        print_error "No owner ID available. Skipping test."
        return
    fi
    
    if [[ -z "$ACCESS_TOKEN" ]]; then
        print_error "No access token available. Skipping test."
        return
    fi
    
    response=$(curl -s -X GET "$OWNERS_ENDPOINT/$OWNER_ID" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    
    if [[ $response == *"$OWNER_ID"* ]] && [[ $response == *"$TEST_EMAIL"* ]]; then
        print_success "Retrieved owner successfully"
        echo "Response: $response"
    else
        print_error "Failed to retrieve owner"
        echo "Response: $response"
    fi
    echo
}

# Test 3: Login owner
test_login_owner() {
    print_step "Test 3: Login owner"
    
    response=$(curl -s -X POST "$OWNERS_ENDPOINT/login" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "'$TEST_EMAIL'",
            "password": "'$TEST_PASSWORD'"
        }')
    
    if [[ $response == *"ownerId"* ]] && [[ $response == *"accessToken"* ]] && [[ $response == *"refreshToken"* ]]; then
        # Update tokens with new ones from login
        ACCESS_TOKEN=$(extract_access_token "$response")
        REFRESH_TOKEN=$(extract_refresh_token "$response")
        print_success "Owner logged in successfully"
        echo "Response: $response"
    else
        print_error "Failed to login owner"
        echo "Response: $response"
    fi
    echo
}

# Test 4: Update owner
test_update_owner() {
    print_step "Test 4: Update owner"
    
    if [[ -z "$OWNER_ID" ]]; then
        print_error "No owner ID available. Skipping test."
        return
    fi
    
    if [[ -z "$ACCESS_TOKEN" ]]; then
        print_error "No access token available. Skipping test."
        return
    fi
    
    response=$(curl -s -X PUT "$OWNERS_ENDPOINT/$OWNER_ID" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d '{
            "cafeIds": ["b3b6a8e2-1c2d-4e5f-9a7b-c1d2e3f4a5b6", "c4d5e6f7-2b3c-4d5e-8f9a-abcdef123456", "e7f8a9b0-3c4d-4e6f-8a8b-fedcba987654"]
        }')
    
    if [[ $response == *"$OWNER_ID"* ]] && [[ $response == *"b3b6a8e2-1c2d-4e5f-9a7b-c1d2e3f4a5b6"* ]] && [[ $response == *"c4d5e6f7-2b3c-4d5e-8f9a-abcdef123456"* ]] && [[ $response == *"e7f8a9b0-3c4d-4e6f-8a8b-fedcba987654"* ]]; then
        print_success "Updated owner successfully"
        echo "Response: $response"
    else
        print_error "Failed to update owner"
        echo "Response: $response"
    fi
    echo
}

# Test 5: Delete owner
test_delete_owner() {
    print_step "Test 5: Delete owner"
    
    if [[ -z "$OWNER_ID" ]]; then
        print_error "No owner ID available. Skipping test."
        return
    fi
    
    if [[ -z "$ACCESS_TOKEN" ]]; then
        print_error "No access token available. Skipping test."
        return
    fi
    
    response=$(curl -s -X DELETE "$OWNERS_ENDPOINT/$OWNER_ID" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    
    if [[ $response == *"success"* ]] && [[ $response == *"true"* ]]; then
        print_success "Owner deleted successfully"
        echo "Response: $response"
        
        # Verify the owner is actually deleted by trying to retrieve it
        print_step "Verifying owner deletion"
        verify_response=$(curl -s -X GET "$OWNERS_ENDPOINT/$OWNER_ID" \
            -H "Authorization: Bearer $ACCESS_TOKEN")
        
        if [[ $verify_response == *"not found"* ]] || [[ $verify_response == *"Not Found"* ]] || [[ $verify_response == *"error"* ]]; then
            print_success "Owner deletion verified - owner no longer exists"
            echo "Verification response: $verify_response"
            # Clear the OWNER_ID since it's now deleted
            OWNER_ID=""
        else
            print_error "Owner deletion verification failed - owner still exists"
            echo "Verification response: $verify_response"
        fi
    else
        print_error "Failed to delete owner"
        echo "Response: $response"
    fi
    echo
}

# === FAILURE CASE TESTS ===

# Test 6: Error handling - Invalid owner ID
test_error_invalid_owner_id() {
    print_step "Test 6: Error handling - Invalid owner ID"
    
    if [[ -z "$ACCESS_TOKEN" ]]; then
        print_error "No access token available. Skipping test."
        return
    fi
    
    response=$(curl -s -X GET "$OWNERS_ENDPOINT/invalid-id" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    
    # Check for standardized error response format
    if [[ $response == *"statusCode"* ]] && \
       [[ $response == *"code"* ]] && \
       [[ $response == *"message"* ]]; then
        print_success "Error handling works correctly for invalid owner ID"
        echo "Response: $response"
    else
        print_error "Error handling format is incorrect"
        echo "Expected: statusCode, code, message"
        echo "Response: $response"
    fi
    echo
}

# Test 7: Error handling - Create owner with wrong email format
test_error_invalid_email() {
    print_step "Test 7: Error handling - Create owner with wrong email format"
    
    response=$(curl -s -X POST "$OWNERS_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "invalid-email-format",
            "password": "testPassword123"
        }')
    
    # Check for standardized error response format
    if [[ $response == *"statusCode"* ]] && \
       [[ $response == *"code"* ]] && \
       [[ $response == *"message"* ]]; then
        print_success "Error handling works correctly for invalid email format"
        echo "Response: $response"
    else
        print_error "Error handling format is incorrect"
        echo "Expected: statusCode, code, message"
        echo "Response: $response"
    fi
    echo
}

# Test 8: Error handling - Login with non-existing user
test_error_login_nonexistent() {
    print_step "Test 8: Error handling - Login with non-existing user"
    
    response=$(curl -s -X POST "$OWNERS_ENDPOINT/login" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "nonexistent@example.com",
            "password": "anyPassword123"
        }')
    
    # Check for standardized error response format
    if [[ $response == *"statusCode"* ]] && \
       [[ $response == *"code"* ]] && \
       [[ $response == *"message"* ]] && \
       [[ $response == *"401"* ]]; then
        print_success "Error handling works correctly for non-existing user login"
        echo "Response: $response"
    else
        print_error "Error handling format is incorrect"
        echo "Expected: statusCode: 401, code, message"
        echo "Response: $response"
    fi
    echo
}

# Test 9: Error handling - Login with wrong password
test_error_login_wrong_password() {
    print_step "Test 9: Error handling - Login with wrong password"
    
    # Clean up any existing test2@example.com owner first
    cleanup_response=$(curl -s -X POST "$OWNERS_ENDPOINT/login" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "test2@example.com",
            "password": "correctPassword123"
        }' 2>/dev/null)
    
    if [[ $cleanup_response == *"ownerId"* ]]; then
        cleanup_owner_id=$(extract_owner_id "$cleanup_response")
        cleanup_access_token=$(extract_access_token "$cleanup_response")
        curl -s -X DELETE "$OWNERS_ENDPOINT/$cleanup_owner_id" \
            -H "Authorization: Bearer $cleanup_access_token" > /dev/null 2>&1
    fi
    
    # Create a new owner first for this test
    setup_response=$(curl -s -X POST "$OWNERS_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "test2@example.com",
            "password": "correctPassword123"
        }')
    
    if [[ $setup_response == *"ownerId"* ]]; then
        print_success "Setup owner created for wrong password test"
        
        # Try to login with wrong password
        response=$(curl -s -X POST "$OWNERS_ENDPOINT/login" \
            -H "Content-Type: application/json" \
            -d '{
                "email": "test2@example.com",
                "password": "wrongPassword456"
            }')
        
        if [[ $response == *"statusCode"* ]] && \
           [[ $response == *"code"* ]] && \
           [[ $response == *"message"* ]] && \
           [[ $response == *"401"* ]]; then
            print_success "Error handling works correctly for wrong password"
            echo "Response: $response"
        else
            print_error "Error handling format is incorrect"
            echo "Expected: statusCode: 401, code, message"
            echo "Response: $response"
        fi
        
        # Clean up the test owner
        test_owner_id=$(extract_owner_id "$setup_response")
        test_access_token=$(extract_access_token "$setup_response")
        curl -s -X DELETE "$OWNERS_ENDPOINT/$test_owner_id" \
            -H "Authorization: Bearer $test_access_token" > /dev/null
    else
        print_error "Failed to create setup owner for wrong password test"
        echo "Response: $setup_response"
    fi
    echo
}

# Test 10: Error handling - Delete non-existing owner
test_error_delete_nonexistent() {
    print_step "Test 10: Error handling - Delete non-existing owner"
    
    # Clean up any existing temp_test@example.com owner first
    cleanup_response=$(curl -s -X POST "$OWNERS_ENDPOINT/login" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "temp_test@example.com",
            "password": "tempPassword123"
        }' 2>/dev/null)
    
    if [[ $cleanup_response == *"ownerId"* ]]; then
        cleanup_owner_id=$(extract_owner_id "$cleanup_response")
        cleanup_access_token=$(extract_access_token "$cleanup_response")
        curl -s -X DELETE "$OWNERS_ENDPOINT/$cleanup_owner_id" \
            -H "Authorization: Bearer $cleanup_access_token" > /dev/null 2>&1
    fi
    
    # Create a temporary owner to get a valid access token and owner ID
    temp_response=$(curl -s -X POST "$OWNERS_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "temp_test@example.com",
            "password": "tempPassword123"
        }')
    
    if [[ $temp_response == *"ownerId"* ]]; then
        temp_owner_id=$(extract_owner_id "$temp_response")
        temp_access_token=$(extract_access_token "$temp_response")
        
        # Delete the owner first to make it non-existent
        curl -s -X DELETE "$OWNERS_ENDPOINT/$temp_owner_id" \
            -H "Authorization: Bearer $temp_access_token" > /dev/null
        
        # Now try to delete the already deleted owner (should get 404)
        response=$(curl -s -X DELETE "$OWNERS_ENDPOINT/$temp_owner_id" \
            -H "Authorization: Bearer $temp_access_token")
        
        # Check for standardized error response format
        if [[ $response == *"statusCode"* ]] && \
           [[ $response == *"code"* ]] && \
           [[ $response == *"message"* ]] && \
           [[ $response == *"404"* ]]; then
            print_success "Error handling works correctly for non-existing owner deletion"
            echo "Response: $response"
        else
            print_error "Error handling format is incorrect"
            echo "Expected: statusCode: 404, code, message"
            echo "Response: $response"
        fi
    else
        print_error "Failed to create temporary owner for non-existing owner deletion test"
        echo "Response: $temp_response"
    fi
    echo
}

# === ADDITIONAL VALIDATION TESTS ===

# Test 11: Validation Error - Missing required fields
test_validation_missing_fields() {
    print_step "Test 11: Validation Error - Missing required fields"
    
    response=$(curl -s -X POST "$OWNERS_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "test@example.com"
        }')
    
    # Check for standardized error response format
    if [[ $response == *"statusCode"* ]] && \
       [[ $response == *"code"* ]] && \
       [[ $response == *"message"* ]] && \
       [[ $response == *"BAD_REQUEST"* ]]; then
        print_success "Validation error for missing password handled correctly"
        echo "Response: $response"
    else
        print_error "Validation error format is incorrect"
        echo "Expected: statusCode, code: 'BAD_REQUEST', message"
        echo "Response: $response"
    fi
    echo
}

# Test 12: Validation Error - Empty email and password
test_validation_empty_fields() {
    print_step "Test 12: Validation Error - Empty email and password"
    
    response=$(curl -s -X POST "$OWNERS_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "",
            "password": ""
        }')
    
    # Check for standardized error response format
    if [[ $response == *"statusCode"* ]] && \
       [[ $response == *"code"* ]] && \
       [[ $response == *"message"* ]]; then
        print_success "Validation error for empty fields handled correctly"
        echo "Response: $response"
    else
        print_error "Validation error format is incorrect"
        echo "Expected: statusCode, code, message"
        echo "Response: $response"
    fi
    echo
}

# Test 13: Duplicate owner creation
test_duplicate_owner_creation() {
    print_step "Test 13: Duplicate owner creation"
    
    # Clean up any existing duplicate@example.com owner first
    cleanup_response=$(curl -s -X POST "$OWNERS_ENDPOINT/login" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "duplicate@example.com",
            "password": "testPassword123"
        }' 2>/dev/null)
    
    if [[ $cleanup_response == *"ownerId"* ]]; then
        cleanup_owner_id=$(extract_owner_id "$cleanup_response")
        cleanup_access_token=$(extract_access_token "$cleanup_response")
        curl -s -X DELETE "$OWNERS_ENDPOINT/$cleanup_owner_id" \
            -H "Authorization: Bearer $cleanup_access_token" > /dev/null 2>&1
    fi
    
    # Create first owner
    first_response=$(curl -s -X POST "$OWNERS_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "duplicate@example.com",
            "password": "testPassword123"
        }')
    
    if [[ $first_response == *"ownerId"* ]]; then
        print_success "First owner created successfully"
        first_owner_id=$(extract_owner_id "$first_response")
        first_access_token=$(extract_access_token "$first_response")
        
        # Try to create second owner with same email
        second_response=$(curl -s -X POST "$OWNERS_ENDPOINT" \
            -H "Content-Type: application/json" \
            -d '{
                "email": "duplicate@example.com",
                "password": "anotherPassword456"
            }')
        
        if [[ $second_response == *"statusCode"* ]] && \
           [[ $second_response == *"code"* ]] && \
           [[ $second_response == *"message"* ]] && \
           [[ $second_response == *"409"* ]]; then
            print_success "Duplicate owner creation properly rejected"
            echo "Response: $second_response"
        else
            print_error "Duplicate owner creation error format is incorrect"
            echo "Expected: statusCode: 409, code, message"
            echo "Response: $second_response"
        fi
        
        # Clean up the first owner
        curl -s -X DELETE "$OWNERS_ENDPOINT/$first_owner_id" \
            -H "Authorization: Bearer $first_access_token" > /dev/null
    else
        print_error "Failed to create first owner for duplicate test"
        echo "Response: $first_response"
    fi
    echo
}

# Test 14: Malformed JSON Error
test_malformed_json() {
    print_step "Test 14: Malformed JSON Error"
    
    response=$(curl -s -X POST "$OWNERS_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "test@example.com",
            "password": "testPassword123",
        }')
    
    # Check for standardized error response format
    if [[ $response == *"statusCode"* ]] && \
       [[ $response == *"code"* ]] && \
       [[ $response == *"message"* ]]; then
        print_success "Malformed JSON error handled correctly"
        echo "Response: $response"
    else
        print_error "Malformed JSON error format is incorrect"
        echo "Expected: statusCode, code, message"
        echo "Response: $response"
    fi
    echo
}

# Main execution
main() {
    echo -e "${BLUE}🚀 Starting Owner API Tests${NC}"
    echo
    
    check_server
    echo
    
    # Success case tests
    test_create_owner
    test_get_owner_by_id
    test_login_owner
    test_update_owner
    test_delete_owner
    
    # Failure case tests
    test_error_invalid_owner_id
    test_error_invalid_email
    test_error_login_nonexistent
    test_error_login_wrong_password
    test_error_delete_nonexistent
    
    # Validation tests
    test_validation_missing_fields
    test_validation_empty_fields
    test_duplicate_owner_creation
    test_malformed_json
    
    echo -e "${GREEN}🎉 All Owner API tests completed!${NC}"
    echo
    
    if [[ -n "$OWNER_ID" ]]; then
        print_warning "Test owner created with ID: $OWNER_ID"
        print_warning "You may want to clean up test data manually if needed."
    else
        print_success "All test data cleaned up automatically."
    fi
}

# Run the tests
main 