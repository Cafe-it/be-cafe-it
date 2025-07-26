#!/bin/bash

# Simplified Cafe API Test Script
# This script tests all endpoints in the simplified Cafe API
# No authentication required - just create cafes with basic info and get cafe ID for operations

# Configuration
BASE_URL="http://localhost:3000"
CAFES_ENDPOINT="$BASE_URL/api/cafes"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Global variables
CAFE_ID=""

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

# Function to check if server is running
check_server() {
    print_step "Checking if server is running"
    if curl -s "$BASE_URL" > /dev/null 2>&1; then
        print_success "Server is running"
        return 0
    else
        print_error "Server is not running. Please start the server first."
        print_warning "Run: npm start"
        exit 1
    fi
}

# Test 1: Create a new cafe (simplified structure)
test_create_cafe() {
    print_step "Test 1: Create a new cafe (simplified structure)"
    
    response=$(curl -s -X POST "$CAFES_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Blue Bottle Coffee",
            "lat": 37.7749,
            "lng": -122.4194,
            "totalSeats": 50,
            "url": "https://maps.google.com/maps?q=37.7749,-122.4194"
        }')
    
    if [[ $response == *"id"* ]] && [[ $response == *"Blue Bottle Coffee"* ]]; then
        CAFE_ID=$(extract_cafe_id "$response")
        print_success "Cafe created successfully with ID: $CAFE_ID"
        print_success "✨ This is the cafe ID to use for all future operations"
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
    
    if [[ $response == *"$CAFE_ID"* ]] && [[ $response == *"Blue Bottle Coffee"* ]]; then
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
    
    response=$(curl -s -X GET "$CAFES_ENDPOINT?lat=37.7749&lng=-122.4194&radius=5")
    
    if [[ $response == *"["* ]] && [[ $response == *"Blue Bottle Coffee"* ]]; then
        print_success "Retrieved nearby cafes successfully (found our test cafe)"
        echo "Response: $response"
    else
        print_warning "Retrieved nearby cafes but may not include our test cafe"
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
    
    if [[ $response == *"totalSeats"* ]] && [[ $response == *"availableSeats"* ]]; then
        print_success "Retrieved cafe seats availability successfully"
        echo "Response: $response"
    else
        print_error "Failed to retrieve cafe seats availability"
        echo "Response: $response"
    fi
    echo
}

# Test 5: Update cafe seats availability (no authentication required)
test_update_cafe_seats_availability() {
    print_step "Test 5: Update cafe seats availability (public endpoint)"
    
    if [[ -z "$CAFE_ID" ]]; then
        print_error "No cafe ID available. Skipping test."
        return
    fi
    
    response=$(curl -s -X PUT "$CAFES_ENDPOINT/$CAFE_ID/seats-availability" \
        -H "Content-Type: application/json" \
        -d '{
            "totalSeats": 50,
            "availableSeats": 35
        }')
    
    if [[ $response == *"\"totalSeats\":50"* ]] && [[ $response == *"\"availableSeats\":35"* ]]; then
        print_success "Updated cafe seats availability successfully"
        echo "Response: $response"
    else
        print_error "Failed to update cafe seats availability"
        echo "Expected: totalSeats: 50, availableSeats: 35"
        echo "Response: $response"
    fi
    echo
}

# Test 6: Update entire cafe (simplified structure)
test_update_cafe() {
    print_step "Test 6: Update entire cafe (simplified structure)"
    
    if [[ -z "$CAFE_ID" ]]; then
        print_error "No cafe ID available. Skipping test."
        return
    fi
    
    response=$(curl -s -X PUT "$CAFES_ENDPOINT/$CAFE_ID" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Updated Blue Bottle Coffee",
            "lat": 37.7750,
            "lng": -122.4195,
            "totalSeats": 60,
            "url": "https://maps.google.com/maps?q=37.7750,-122.4195"
        }')
    
    if [[ $response == *"$CAFE_ID"* ]] && \
       [[ $response == *"Updated Blue Bottle Coffee"* ]] && \
       [[ $response == *"\"totalSeats\":60"* ]] && \
       [[ $response == *"37.775"* ]]; then
        print_success "Updated cafe successfully"
        echo "Response: $response"
    else
        print_error "Failed to update cafe"
        echo "Expected: Updated Blue Bottle Coffee, 60 total seats, lat 37.775"
        echo "Response: $response"
    fi
    echo
}

# Test 7: Create second cafe for testing multiple cafes
test_create_second_cafe() {
    print_step "Test 7: Create second cafe for testing multiple cafes"
    
    response=$(curl -s -X POST "$CAFES_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Starbucks Reserve",
            "lat": 37.7849,
            "lng": -122.4094,
            "totalSeats": 80,
            "url": "https://maps.google.com/maps?q=37.7849,-122.4094"
        }')
    
    if [[ $response == *"id"* ]] && [[ $response == *"Starbucks Reserve"* ]]; then
        SECOND_CAFE_ID=$(extract_cafe_id "$response")
        print_success "Second cafe created successfully with ID: $SECOND_CAFE_ID"
        echo "Response: $response"
    else
        print_error "Failed to create second cafe"
        echo "Response: $response"
    fi
    echo
}

# Test 8: Error handling - Invalid cafe ID
test_error_invalid_cafe_id() {
    print_step "Test 8: Error handling - Invalid cafe ID"
    
    response=$(curl -s -X GET "$CAFES_ENDPOINT/invalid-id")
    
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

# Test 9: Error handling - Invalid request body (missing required fields)
test_error_missing_fields() {
    print_step "Test 9: Error handling - Missing required fields"
    
    response=$(curl -s -X POST "$CAFES_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Incomplete Cafe",
            "lat": 37.7749
        }')
    
    if [[ $response == *"statusCode"* ]] && \
       [[ $response == *"code"* ]] && \
       [[ $response == *"message"* ]]; then
        print_success "Error handling works correctly for missing required fields"
        echo "Response: $response"
    else
        print_error "Error handling format is incorrect"
        echo "Expected: statusCode, code, message"
        echo "Response: $response"
    fi
    echo
}

# Test 10: Error handling - Invalid data types
test_error_invalid_types() {
    print_step "Test 10: Error handling - Invalid data types"
    
    response=$(curl -s -X POST "$CAFES_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d '{
            "name": 123,
            "lat": "not_a_number",
            "lng": "also_not_a_number",
            "totalSeats": "fifty",
            "url": "not_a_valid_url"
        }')
    
    if [[ $response == *"statusCode"* ]] && \
       [[ $response == *"code"* ]] && \
       [[ $response == *"message"* ]]; then
        print_success "Error handling works correctly for invalid data types"
        echo "Response: $response"
    else
        print_error "Error handling format is incorrect"
        echo "Expected: statusCode, code, message"
        echo "Response: $response"
    fi
    echo
}

# Test 11: Error handling - Invalid seat availability (negative seats)
test_error_invalid_seats() {
    print_step "Test 11: Error handling - Invalid seat availability"
    
    response=$(curl -s -X POST "$CAFES_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Bad Seats Cafe",
            "lat": 37.7749,
            "lng": -122.4194,
            "totalSeats": -10,
            "url": "https://maps.google.com/maps?q=37.7749,-122.4194"
        }')
    
    if [[ $response == *"statusCode"* ]] && \
       [[ $response == *"code"* ]] && \
       [[ $response == *"message"* ]]; then
        print_success "Error handling works correctly for invalid seat numbers"
        echo "Response: $response"
    else
        print_error "Error handling format is incorrect"
        echo "Expected: statusCode, code, message"
        echo "Response: $response"
    fi
    echo
}

# Test 12: Error handling - Seat availability validation (available > total)
test_error_seat_availability_logic() {
    print_step "Test 12: Error handling - Available seats > total seats"
    
    if [[ -z "$CAFE_ID" ]]; then
        print_error "No cafe ID available. Skipping test."
        return
    fi
    
    response=$(curl -s -X PUT "$CAFES_ENDPOINT/$CAFE_ID/seats-availability" \
        -H "Content-Type: application/json" \
        -d '{
            "totalSeats": 50,
            "availableSeats": 100
        }')
    
    if [[ $response == *"statusCode"* ]] && \
       [[ $response == *"code"* ]] && \
       [[ $response == *"message"* ]] && \
       [[ $response == *"Available seats cannot exceed total seats"* ]]; then
        print_success "Seat availability validation works correctly"
        echo "Response: $response"
    else
        print_error "Seat availability validation error format is incorrect"
        echo "Expected: error about available seats exceeding total seats"
        echo "Response: $response"
    fi
    echo
}

# Test 13: Error handling - Malformed JSON
test_error_malformed_json() {
    print_step "Test 13: Error handling - Malformed JSON"
    
    response=$(curl -s -X POST "$CAFES_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Test Cafe",
            "lat": 37.7749,
            "lng": -122.4194,
            "totalSeats": 50,
            "url": "https://maps.google.com/...",
        }')
    
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

# Test 14: Delete cafe
test_delete_cafe() {
    print_step "Test 14: Delete cafe"
    
    if [[ -z "$CAFE_ID" ]]; then
        print_error "No cafe ID available. Skipping test."
        return
    fi
    
    response=$(curl -s -X DELETE "$CAFES_ENDPOINT/$CAFE_ID")
    
    if [[ $response == *"true"* ]]; then
        print_success "Cafe deleted successfully"
        echo "Response: $response"
        
        # Verify the cafe is actually deleted
        print_step "Verifying cafe deletion"
        verify_response=$(curl -s -X GET "$CAFES_ENDPOINT/$CAFE_ID")
        
        if [[ $verify_response == *"not found"* ]] || [[ $verify_response == *"Not Found"* ]] || [[ $verify_response == *"error"* ]]; then
            print_success "Cafe deletion verified - cafe no longer exists"
            echo "Verification response: $verify_response"
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

# Test 15: Delete second cafe (cleanup)
test_delete_second_cafe() {
    print_step "Test 15: Delete second cafe (cleanup)"
    
    if [[ -z "$SECOND_CAFE_ID" ]]; then
        print_warning "No second cafe ID available. Skipping cleanup."
        return
    fi
    
    response=$(curl -s -X DELETE "$CAFES_ENDPOINT/$SECOND_CAFE_ID")
    
    if [[ $response == *"true"* ]]; then
        print_success "Second cafe deleted successfully"
        echo "Response: $response"
        SECOND_CAFE_ID=""
    else
        print_error "Failed to delete second cafe"
        echo "Response: $response"
    fi
    echo
}

# Summary function to show the simplified workflow
print_summary() {
    print_step "🎯 Simplified Cafe API Workflow Summary"
    echo
    echo -e "${GREEN}✨ Simple 3-Step Process:${NC}"
    echo -e "${BLUE}1.${NC} Create cafe with: name, lat, lng, totalSeats, url"
    echo -e "${BLUE}2.${NC} Get cafe ID from response"
    echo -e "${BLUE}3.${NC} Use cafe ID for all operations (get, update, delete)"
    echo
    echo -e "${GREEN}🚀 No Authentication Required!${NC}"
    echo -e "${GREEN}📍 Flat Structure - No Complex Nesting${NC}"
    echo -e "${GREEN}⚡ Direct API Access${NC}"
    echo
}

# Main execution
main() {
    echo -e "${BLUE}🚀 Starting Simplified Cafe API Tests${NC}"
    echo -e "${YELLOW}📝 Testing the new authentication-free, simplified cafe flow${NC}"
    echo
    
    check_server
    echo
    
    # Core functionality tests
    test_create_cafe
    test_get_cafe_by_id
    test_get_nearby_cafes
    test_get_cafe_seats
    test_update_cafe_seats_availability
    test_update_cafe
    test_create_second_cafe
    
    # Error handling tests
    test_error_invalid_cafe_id
    test_error_missing_fields
    test_error_invalid_types
    test_error_invalid_seats
    test_error_seat_availability_logic
    test_error_malformed_json
    
    # Cleanup tests
    test_delete_cafe
    test_delete_second_cafe
    
    # Summary
    print_summary
    
    echo -e "${GREEN}🎉 All Simplified Cafe API tests completed!${NC}"
    echo
    
    if [[ -n "$CAFE_ID" ]] || [[ -n "$SECOND_CAFE_ID" ]]; then
        print_warning "Some test cafes may still exist:"
        [[ -n "$CAFE_ID" ]] && print_warning "Cafe ID: $CAFE_ID"
        [[ -n "$SECOND_CAFE_ID" ]] && print_warning "Second Cafe ID: $SECOND_CAFE_ID"
        print_warning "You may want to clean up test data manually if needed."
    else
        print_success "All test data cleaned up automatically."
    fi
}

# Run the tests
main 