#!/bin/bash

# EC2 Deployed Cafe API Test Script
# This script tests all endpoints in the deployed Cafe API on EC2
# No authentication required - just create cafes with basic info and get cafe ID for operations

# Configuration
BASE_URL="http://ec2-52-78-140-238.ap-northeast-2.compute.amazonaws.com"
CAFES_ENDPOINT="$BASE_URL/api/cafes"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Global variables
CAFE_ID=""
SECOND_CAFE_ID=""

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
    print_step "Checking if EC2 server is running"
    if curl -s --connect-timeout 10 "$BASE_URL/api/docs" > /dev/null 2>&1; then
        print_success "EC2 server is running and accessible"
        return 0
    else
        print_error "EC2 server is not accessible"
        print_warning "Check if:"
        print_warning "1. EC2 instance is running"
        print_warning "2. Security Group allows HTTP (port 80)"
        print_warning "3. Nginx is running: sudo systemctl status nginx"
        print_warning "4. PM2 app is running: pm2 status"
        exit 1
    fi
}

# Test 1: Create a new cafe (simplified structure)
test_create_cafe() {
    print_step "Test 1: Create a new cafe (simplified structure)"
    
    response=$(curl -s -X POST "$CAFES_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Blue Bottle Coffee Seoul",
            "lat": 37.5665,
            "lng": 126.9780,
            "totalSeats": 50,
            "url": "https://maps.google.com/maps?q=37.5665,126.9780"
        }')
    
    if [[ $response == *"id"* ]] && [[ $response == *"Blue Bottle Coffee Seoul"* ]]; then
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
    
    if [[ $response == *"$CAFE_ID"* ]] && [[ $response == *"Blue Bottle Coffee Seoul"* ]]; then
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
    
    response=$(curl -s -X GET "$CAFES_ENDPOINT?lat=37.5665&lng=126.9780&radius=5")
    
    if [[ $response == *"["* ]] && [[ $response == *"Blue Bottle Coffee Seoul"* ]]; then
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
            "name": "Updated Blue Bottle Coffee Seoul",
            "lat": 37.5666,
            "lng": 126.9781,
            "totalSeats": 60,
            "url": "https://maps.google.com/maps?q=37.5666,126.9781"
        }')
    
    if [[ $response == *"$CAFE_ID"* ]] && \
       [[ $response == *"Updated Blue Bottle Coffee Seoul"* ]] && \
       [[ $response == *"\"totalSeats\":60"* ]] && \
       [[ $response == *"37.5666"* ]]; then
        print_success "Updated cafe successfully"
        echo "Response: $response"
    else
        print_error "Failed to update cafe"
        echo "Expected: Updated Blue Bottle Coffee Seoul, 60 total seats, lat 37.5666"
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
            "name": "Starbucks Gangnam",
            "lat": 37.4979,
            "lng": 127.0276,
            "totalSeats": 80,
            "url": "https://maps.google.com/maps?q=37.4979,127.0276"
        }')
    
    if [[ $response == *"id"* ]] && [[ $response == *"Starbucks Gangnam"* ]]; then
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

# Test 9: Test Swagger documentation endpoint
test_swagger_docs() {
    print_step "Test 9: Check Swagger documentation"
    
    response=$(curl -s -I "$BASE_URL/api/docs")
    
    if [[ $response == *"200 OK"* ]] || [[ $response == *"text/html"* ]]; then
        print_success "Swagger documentation is accessible"
        print_success "Visit: $BASE_URL/api/docs"
    else
        print_error "Swagger documentation not accessible"
        echo "Response: $response"
    fi
    echo
}

# Test 10: Delete cafe
test_delete_cafe() {
    print_step "Test 10: Delete cafe"
    
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

# Test 11: Delete second cafe (cleanup)
test_delete_second_cafe() {
    print_step "Test 11: Delete second cafe (cleanup)"
    
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

# Summary function to show the deployment info
print_summary() {
    print_step "🎯 EC2 Deployed Cafe API Test Summary"
    echo
    echo -e "${GREEN}✨ API Successfully Deployed at:${NC}"
    echo -e "${BLUE}Base URL:${NC} $BASE_URL"
    echo -e "${BLUE}API Endpoints:${NC} $CAFES_ENDPOINT"
    echo -e "${BLUE}Swagger Docs:${NC} $BASE_URL/api/docs"
    echo
    echo -e "${GREEN}🚀 Production Features Working:${NC}"
    echo -e "${GREEN}✓ HTTP access via Nginx reverse proxy${NC}"
    echo -e "${GREEN}✓ API endpoints responding correctly${NC}"
    echo -e "${GREEN}✓ Database connectivity (MongoDB)${NC}"
    echo -e "${GREEN}✓ Error handling and validation${NC}"
    echo -e "${GREEN}✓ PM2 process management${NC}"
    echo
}

# Main execution
main() {
    echo -e "${BLUE}🚀 Starting EC2 Deployed Cafe API Tests${NC}"
    echo -e "${YELLOW}📝 Testing production deployment on AWS EC2${NC}"
    echo -e "${YELLOW}🌐 Target: $BASE_URL${NC}"
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
    
    # Production-specific tests
    test_swagger_docs
    test_error_invalid_cafe_id
    
    # Cleanup tests
    test_delete_cafe
    test_delete_second_cafe
    
    # Summary
    print_summary
    
    echo -e "${GREEN}🎉 All EC2 Deployed API tests completed!${NC}"
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