#!/bin/bash

# Cafe API Test Script
# This script tests all endpoints in the Cafe API

# Configuration
BASE_URL="http://localhost:3000"
CAFES_ENDPOINT="$BASE_URL/api/cafes"
OWNERS_ENDPOINT="$BASE_URL/api/owners"

# Test owner credentials (using timestamp to ensure uniqueness)
TIMESTAMP=$(date +%s)
TEST_OWNER_EMAIL="test-api-owner-${TIMESTAMP}@example.com"
TEST_OWNER_PASSWORD="testpassword123"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Global variables
CAFE_ID=""
ACCESS_TOKEN=""
OWNER_ID=""

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

# Function to extract cafe ID from response
extract_cafe_id() {
    echo "$1" | grep -o '"id":"[^"]*"' | cut -d'"' -f4
}

# Function to extract access token from response
extract_access_token() {
    echo "$1" | grep -o '"accessToken":"[^"]*"' | sed 's/"accessToken":"//' | sed 's/"//'
}

# Function to extract owner ID from response
extract_owner_id() {
    echo "$1" | grep -o '"ownerId":"[^"]*"' | sed 's/"ownerId":"//' | sed 's/"//'
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
    
    if [[ $response == *"ownerId"* ]] && [[ $response == *"accessToken"* ]]; then
        ACCESS_TOKEN=$(extract_access_token "$response")
        OWNER_ID=$(extract_owner_id "$response")
        print_success "Test owner created successfully"
        print_success "Owner ID: $OWNER_ID"
        print_success "Access Token: ${ACCESS_TOKEN:0:30}..."
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
        fi
    else
        print_warning "No test owner to cleanup"
    fi
    echo
}

# Test 1: Create a new cafe
test_create_cafe() {
    print_step "Test 1: Create a new cafe"
    
    if [[ -z "$OWNER_ID" ]]; then
        print_error "No owner ID available. Cannot create cafe."
        exit 1
    fi
    
    response=$(curl -s -X POST "$CAFES_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d '{
            "ownerId": "'$OWNER_ID'",
            "location": {
                "lat": 37.123,
                "lng": 127.456
            },
            "seatAvailability": {
                "totalSeats": 50,
                "availableSeats": 30
            },
            "storeInformation": {
                "name": "Test Cafe",
                "address": "123 Test Street",
                "hours": {
                    "startTime": "08:00",
                    "endTime": "22:00"
                },
                "links": {
                    "mapUrl": "https://maps.example.com/test-cafe"
                },
                "amenities": {
                    "noiseLevel": "quiet",
                    "hasWifi": true,
                    "hasOutlets": true
                }
            }
        }')
    
    if [[ $response == *"id"* ]]; then
        CAFE_ID=$(extract_cafe_id "$response")
        print_success "Cafe created successfully with ID: $CAFE_ID"
        echo "Response: $response"
    else
        print_error "Failed to create cafe"
        echo "Response: $response"
        exit 1
    fi
    echo
}

# Test 2: Get cafe by ID
test_get_cafe_by_id() {
    print_step "Test 2: Get cafe by ID"
    
    if [[ -z "$CAFE_ID" ]]; then
        print_error "No cafe ID available. Skipping test."
        return
    fi
    
    response=$(curl -s -X GET "$CAFES_ENDPOINT/$CAFE_ID")
    
    if [[ $response == *"$CAFE_ID"* ]]; then
        print_success "Retrieved cafe successfully"
        echo "Response: $response"
    else
        print_error "Failed to retrieve cafe"
        echo "Response: $response"
    fi
    echo
}

# Test 3: Get nearby cafes
test_get_nearby_cafes() {
    print_step "Test 3: Get nearby cafes"
    
    response=$(curl -s -X GET "$CAFES_ENDPOINT?lat=37.123&lng=127.456&radius=5")
    
    if [[ $response == *"["* ]]; then
        print_success "Retrieved nearby cafes successfully"
        echo "Response: $response"
    else
        print_error "Failed to retrieve nearby cafes"
        echo "Response: $response"
    fi
    echo
}

# Test 4: Get cafe seats availability
test_get_cafe_seats() {
    print_step "Test 4: Get cafe seats availability"
    
    if [[ -z "$CAFE_ID" ]]; then
        print_error "No cafe ID available. Skipping test."
        return
    fi
    
    response=$(curl -s -X GET "$CAFES_ENDPOINT/$CAFE_ID/seats-availability")
    
    if [[ $response == *"seatAvailability"* ]]; then
        print_success "Retrieved cafe seats availability successfully"
        echo "Response: $response"
    else
        print_error "Failed to retrieve cafe seats availability"
        echo "Response: $response"
    fi
    echo
}

# Test 5: Update cafe (full replacement)
test_update_cafe() {
    print_step "Test 5: Update cafe (full replacement)"
    
    if [[ -z "$CAFE_ID" ]]; then
        print_error "No cafe ID available. Skipping test."
        return
    fi
    
    if [[ -z "$OWNER_ID" ]] || [[ -z "$ACCESS_TOKEN" ]]; then
        print_error "No owner authentication available. Cannot update cafe."
        return
    fi
    
    response=$(curl -s -X PUT "$CAFES_ENDPOINT/$CAFE_ID" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d '{
            "ownerId": "'$OWNER_ID'",
            "location": {
                "lat": 37.124,
                "lng": 127.457
            },
            "seatAvailability": {
                "totalSeats": 60,
                "availableSeats": 40
            },
            "storeInformation": {
                "name": "Updated Test Cafe",
                "address": "456 Updated Street",
                "hours": {
                    "startTime": "07:00",
                    "endTime": "23:00"
                },
                "links": {
                    "mapUrl": "https://maps.example.com/updated-test-cafe"
                },
                "amenities": {
                    "noiseLevel": "moderate",
                    "hasWifi": true,
                    "hasOutlets": false
                }
            }
        }')
    
    # Check multiple conditions to ensure data actually changed
    if [[ $response == *"$CAFE_ID"* ]] && \
       [[ $response == *"Updated Test Cafe"* ]] && \
       [[ $response == *"456 Updated Street"* ]] && \
       [[ $response == *"\"totalSeats\":60"* ]] && \
       [[ $response == *"\"availableSeats\":40"* ]] && \
       [[ $response == *"07:00"* ]] && \
       [[ $response == *"23:00"* ]]; then
        print_success "Updated cafe successfully (full replacement)"
        echo "Response: $response"
    else
        print_error "Failed to update cafe (full replacement)"
        echo "Expected: Updated Test Cafe, 456 Updated Street, 60 total seats, 40 available seats"
        echo "Response: $response"
    fi
    echo
}

# Test 6: Update cafe seats availability (dedicated endpoint)
test_update_cafe_seats_availability() {
    print_step "Test 6: Update cafe seats availability (dedicated endpoint)"
    
    if [[ -z "$CAFE_ID" ]]; then
        print_error "No cafe ID available. Skipping test."
        return
    fi
    
    if [[ -z "$OWNER_ID" ]] || [[ -z "$ACCESS_TOKEN" ]]; then
        print_error "No owner authentication available. Cannot update cafe seats."
        return
    fi
    
    response=$(curl -s -X PUT "$CAFES_ENDPOINT/$CAFE_ID/seats-availability" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d '{
            "ownerId": "'$OWNER_ID'",
            "totalSeats": 70,
            "availableSeats": 50
        }')
    
    # Check that seats actually changed to the new values
    if [[ $response == *"\"totalSeats\":70"* ]] && \
       [[ $response == *"\"availableSeats\":50"* ]]; then
        print_success "Updated cafe seats availability successfully"
        echo "Response: $response"
    else
        print_error "Failed to update cafe seats availability"
        echo "Expected: totalSeats: 70, availableSeats: 50"
        echo "Response: $response"
    fi
    echo
}

# Test 7: Error handling - Invalid cafe ID
test_error_invalid_cafe_id() {
    print_step "Test 7: Error handling - Invalid cafe ID"
    
    response=$(curl -s -X GET "$CAFES_ENDPOINT/invalid-id")
    
    # Check for standardized error response format
    if [[ $response == *"statusCode"* ]] && \
       [[ $response == *"code"* ]] && \
       [[ $response == *"message"* ]]; then
        print_success "Error handling works correctly for invalid cafe ID"
        echo "Response: $response"
    else
        print_error "Error handling format is incorrect"
        echo "Expected: statusCode, code, message"
        echo "Response: $response"
    fi
    echo
}

# Test 8: Error handling - Invalid request body
test_error_invalid_request() {
    print_step "Test 8: Error handling - Invalid request body"
    
    response=$(curl -s -X POST "$CAFES_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d '{
            "ownerId": "'$OWNER_ID'",
            "location": {
                "lat": "invalid",
                "lng": 127.456
            },
            "seatAvailability": {
                "totalSeats": -10,
                "availableSeats": 100
            }
        }')
    
    # Check for standardized error response format
    if [[ $response == *"statusCode"* ]] && \
       [[ $response == *"code"* ]] && \
       [[ $response == *"message"* ]]; then
        print_success "Error handling works correctly for invalid request body"
        echo "Response: $response"
    else
        print_error "Error handling format is incorrect"
        echo "Expected: statusCode, code, message"
        echo "Response: $response"
    fi
    echo
}

# === VALIDATION PIPELINE & EXCEPTION FILTER TESTS ===
# The following tests verify that the validation pipeline and global exception filter
# work correctly with the new standardized error response format:
# { "statusCode": number, "code": string, "message": string }

# Test 8.1: Validation Error - Missing required fields
test_validation_missing_fields() {
    print_step "Test 8.1: Validation Error - Missing required fields"
    
    response=$(curl -s -X POST "$CAFES_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d '{
            "ownerId": "'$OWNER_ID'",
            "location": {
                "lat": 37.123
            },
            "seatAvailability": {
                "totalSeats": 50
            }
        }')
    
    # Check for standardized error response format
    if [[ $response == *"statusCode"* ]] && \
       [[ $response == *"code"* ]] && \
       [[ $response == *"message"* ]] && \
       [[ $response == *"BAD_REQUEST"* ]]; then
        print_success "Validation error for missing fields handled correctly"
        echo "Response: $response"
    else
        print_error "Validation error format is incorrect"
        echo "Expected: statusCode, code: 'BAD_REQUEST', message"
        echo "Response: $response"
    fi
    echo
}

# Test 8.2: Validation Error - Invalid data types
test_validation_invalid_types() {
    print_step "Test 8.2: Validation Error - Invalid data types"
    
    response=$(curl -s -X POST "$CAFES_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d '{
            "ownerId": "'$OWNER_ID'",
            "location": {
                "lat": "not_a_number",
                "lng": "also_not_a_number"
            },
            "seatAvailability": {
                "totalSeats": "fifty",
                "availableSeats": "thirty"
            },
            "storeInformation": {
                "name": 123,
                "address": true,
                "hours": {
                    "startTime": "invalid_time",
                    "endTime": "also_invalid"
                }
            }
        }')
    
    # Check for standardized error response format
    if [[ $response == *"statusCode"* ]] && \
       [[ $response == *"code"* ]] && \
       [[ $response == *"message"* ]]; then
        print_success "Validation error for invalid types handled correctly"
        echo "Response: $response"
    else
        print_error "Validation error format is incorrect"
        echo "Expected: statusCode, code, message"
        echo "Response: $response"
    fi
    echo
}

# Test 8.3: Validation Error - Invalid seat availability
test_validation_invalid_seats() {
    print_step "Test 8.3: Validation Error - Invalid seat availability"
    
    response=$(curl -s -X POST "$CAFES_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d '{
            "ownerId": "'$OWNER_ID'",
            "location": {
                "lat": 37.123,
                "lng": 127.456
            },
            "seatAvailability": {
                "totalSeats": -10,
                "availableSeats": 100
            },
            "storeInformation": {
                "name": "Test Cafe",
                "address": "123 Test Street"
            }
        }')
    
    # Check for standardized error response format
    if [[ $response == *"statusCode"* ]] && \
       [[ $response == *"code"* ]] && \
       [[ $response == *"message"* ]]; then
        print_success "Validation error for invalid seat numbers handled correctly"
        echo "Response: $response"
    else
        print_error "Validation error format is incorrect"
        echo "Expected: statusCode, code, message"
        echo "Response: $response"
    fi
    echo
}

# Test 8.4: Validation Error - Extra forbidden fields
test_validation_extra_fields() {
    print_step "Test 8.4: Validation Error - Extra forbidden fields"
    
    response=$(curl -s -X POST "$CAFES_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d '{
            "ownerId": "'$OWNER_ID'",
            "location": {
                "lat": 37.123,
                "lng": 127.456
            },
            "seatAvailability": {
                "totalSeats": 50,
                "availableSeats": 30
            },
            "storeInformation": {
                "name": "Test Cafe",
                "address": "123 Test Street",
                "hours": {
                    "startTime": "08:00",
                    "endTime": "22:00"
                }
            },
            "extraField": "should_not_be_allowed",
            "anotherExtraField": {
                "nested": "also_not_allowed"
            }
        }')
    
    # Check for standardized error response format
    if [[ $response == *"statusCode"* ]] && \
       [[ $response == *"code"* ]] && \
       [[ $response == *"message"* ]]; then
        print_success "Validation error for extra fields handled correctly"
        echo "Response: $response"
    else
        print_error "Validation error format is incorrect"
        echo "Expected: statusCode, code, message"
        echo "Response: $response"
    fi
    echo
}

# Test 8.5: Route Parameter Validation - Invalid UUID format
test_route_parameter_validation() {
    print_step "Test 8.5: Route Parameter Validation - Invalid UUID format"
    
    response=$(curl -s -X GET "$CAFES_ENDPOINT/nonexistent-cafe-id-12345")
    
    # Check for standardized error response format
    if [[ $response == *"statusCode"* ]] && \
       [[ $response == *"code"* ]] && \
       [[ $response == *"message"* ]]; then
        print_success "Route parameter validation handled correctly with standardized format"
        echo "Response: $response"
    else
        print_error "Route parameter validation format is incorrect"
        echo "Expected: statusCode, code, message"
        echo "Response: $response"
    fi
    echo
}

# Test 8.6: HTTP Exception - Not Found with valid UUID
test_http_exception_not_found() {
    print_step "Test 8.6: HTTP Exception - Not Found with valid UUID"
    
    # Use a valid UUID format but non-existent cafe ID
    response=$(curl -s -X GET "$CAFES_ENDPOINT/550e8400-e29b-41d4-a716-446655440000")
    
    # Check for standardized error response format
    if [[ $response == *"statusCode"* ]] && \
       [[ $response == *"code"* ]] && \
       [[ $response == *"message"* ]]; then
        print_success "HTTP Not Found exception handled correctly with standardized format"
        echo "Response: $response"
    else
        print_error "HTTP exception format is incorrect"
        echo "Expected: statusCode, code, message"
        echo "Response: $response"
    fi
    echo
}

# Test 8.7: Malformed JSON Error
test_malformed_json() {
    print_step "Test 8.7: Malformed JSON Error"
    
    response=$(curl -s -X POST "$CAFES_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d '{
            "ownerId": "'$OWNER_ID'",
            "location": {
                "lat": 37.123,
                "lng": 127.456
            },
            "seatAvailability": {
                "totalSeats": 50,
                "availableSeats": 30
            },
            "storeInformation": {
                "name": "Test Cafe",
                "address": "123 Test Street",
            }
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

# Test 9: Delete cafe
test_delete_cafe() {
    print_step "Test 9: Delete cafe"
    
    if [[ -z "$CAFE_ID" ]]; then
        print_error "No cafe ID available. Skipping test."
        return
    fi
    
    response=$(curl -s -X DELETE "$CAFES_ENDPOINT/$CAFE_ID")
    
    if [[ $response == *"true"* ]]; then
        print_success "Cafe deleted successfully"
        echo "Response: $response"
        
        # Verify the cafe is actually deleted by trying to retrieve it
        print_step "Verifying cafe deletion"
        verify_response=$(curl -s -X GET "$CAFES_ENDPOINT/$CAFE_ID")
        
        if [[ $verify_response == *"not found"* ]] || [[ $verify_response == *"Not Found"* ]] || [[ $verify_response == *"error"* ]]; then
            print_success "Cafe deletion verified - cafe no longer exists"
            echo "Verification response: $verify_response"
            # Clear the CAFE_ID since it's now deleted
            CAFE_ID=""
        else
            print_error "Cafe deletion verification failed - cafe still exists"
            echo "Verification response: $verify_response"
        fi
    else
        print_error "Failed to delete cafe"
        echo "Response: $response"
    fi
    echo
}

# Main execution
main() {
    echo -e "${BLUE}🚀 Starting Cafe API Tests${NC}"
    echo
    
    check_server
    echo
    
    # Setup: Create test owner for authentication
    setup_test_owner
    
    # Run all tests
    test_create_cafe
    test_get_cafe_by_id
    test_get_nearby_cafes
    test_get_cafe_seats
    test_update_cafe
    test_update_cafe_seats_availability
    test_error_invalid_cafe_id
    test_error_invalid_request
    test_validation_missing_fields
    test_validation_invalid_types
    test_validation_invalid_seats
    test_validation_extra_fields
    test_route_parameter_validation
    test_http_exception_not_found
    test_malformed_json
    test_delete_cafe
    
    # Cleanup: Delete test owner
    cleanup_test_owner
    
    echo -e "${GREEN}🎉 All tests completed!${NC}"
    echo
    
    if [[ -n "$CAFE_ID" ]]; then
        print_warning "Test cafe created with ID: $CAFE_ID"
        print_warning "You may want to clean up test data manually if needed."
    else
        print_success "All test data cleaned up automatically."
    fi
}

# Run the tests
main 