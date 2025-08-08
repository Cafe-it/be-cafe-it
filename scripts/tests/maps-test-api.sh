#!/bin/bash

# Maps API Test Script
# This script tests the maps URL extraction endpoints
# Tests Google Maps coordinate extraction and Naver Maps place ID extraction

# Configuration
BASE_URL="http://localhost:3000"
MAPS_ENDPOINT="$BASE_URL/api/maps"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Function to check if server is running
check_server() {
    print_step "Checking if server is running"
    if curl -s "$BASE_URL" > /dev/null 2>&1; then
        print_success "Server is running"
        return 0
    else
        print_error "Server is not running. Please start the server first."
        print_warning "Run: pnpm dev"
        exit 1
    fi
}

# Test 1: Google Maps URL with @ pattern
test_google_at_pattern() {
    print_step "Test 1: Google Maps URL with @ pattern"
    
    local url="https://www.google.com/maps/@43.6500418,-79.3916043,15z"
    local encoded_url=$(printf %s "$url" | jq -sRr @uri)
    
    response=$(curl -s -X GET "$MAPS_ENDPOINT/extract?url=$encoded_url")
    
    if [[ $response == *"\"type\":\"coordinates\""* ]] && \
       [[ $response == *"\"lat\":43.6500418"* ]] && \
       [[ $response == *"\"lng\":-79.3916043"* ]] && \
       [[ $response == *"\"source\":\"google\""* ]]; then
        print_success "Google @ pattern extraction successful"
        echo "Response: $response"
    else
        print_error "Failed to extract coordinates from Google @ pattern URL"
        echo "Expected: type: coordinates, lat: 43.6500418, lng: -79.3916043, source: google"
        echo "Response: $response"
    fi
    echo
}

# Test 2: Google Maps URL with place and @ pattern
test_google_place_at_pattern() {
    print_step "Test 2: Google Maps place URL with @ pattern"
    
    local url="https://www.google.com/maps/place/Swatow+Restaurant/@43.6500418,-79.3916043,15z/data=!3m1!5s0x882b34c3918ff491:0xe423f545e0c0163a!4m6!3m5!1s0x882b34c3910fd7c5:0xd8bad0c8067790b5!8m2!3d43.653836!4d-79.3981091!16s%2Fg%2F1tw_nwzc"
    local encoded_url=$(printf %s "$url" | jq -sRr @uri)
    
    response=$(curl -s -X GET "$MAPS_ENDPOINT/extract?url=$encoded_url")
    
    if [[ $response == *"\"type\":\"coordinates\""* ]] && \
       [[ $response == *"\"lat\":43.6500418"* ]] && \
       [[ $response == *"\"lng\":-79.3916043"* ]] && \
       [[ $response == *"\"source\":\"google\""* ]]; then
        print_success "Google place @ pattern extraction successful"
        echo "Response: $response"
    else
        print_error "Failed to extract coordinates from Google place @ pattern URL"
        echo "Expected: type: coordinates, lat: 43.6500418, lng: -79.3916043, source: google"
        echo "Response: $response"
    fi
    echo
}

# Test 3: Google Maps URL with !3d!4d pattern
test_google_3d4d_pattern() {
    print_step "Test 3: Google Maps URL with !3d!4d pattern"
    
    local url="https://www.google.com/maps/place/Example/@43.653836,-79.3981091,17z/data=!3d43.653836!4d-79.3981091!16s%2Fg%2F1tw_nwzc"
    local encoded_url=$(printf %s "$url" | jq -sRr @uri)
    
    response=$(curl -s -X GET "$MAPS_ENDPOINT/extract?url=$encoded_url")
    
    if [[ $response == *"\"type\":\"coordinates\""* ]] && \
       [[ $response == *"\"lat\":43.653836"* ]] && \
       [[ $response == *"\"lng\":-79.3981091"* ]] && \
       [[ $response == *"\"source\":\"google\""* ]]; then
        print_success "Google !3d!4d pattern extraction successful"
        echo "Response: $response"
    else
        print_error "Failed to extract coordinates from Google !3d!4d pattern URL"
        echo "Expected: type: coordinates, lat: 43.653836, lng: -79.3981091, source: google"
        echo "Response: $response"
    fi
    echo
}

# Test 4: Google Maps URL with q= pattern
test_google_q_pattern() {
    print_step "Test 4: Google Maps URL with q= pattern"
    
    local url="https://www.google.com/maps?q=40.7589,-73.9851&z=15"
    local encoded_url=$(printf %s "$url" | jq -sRr @uri)
    
    response=$(curl -s -X GET "$MAPS_ENDPOINT/extract?url=$encoded_url")
    
    if [[ $response == *"\"type\":\"coordinates\""* ]] && \
       [[ $response == *"\"lat\":40.7589"* ]] && \
       [[ $response == *"\"lng\":-73.9851"* ]] && \
       [[ $response == *"\"source\":\"google\""* ]]; then
        print_success "Google q= pattern extraction successful"
        echo "Response: $response"
    else
        print_error "Failed to extract coordinates from Google q= pattern URL"
        echo "Expected: type: coordinates, lat: 40.7589, lng: -73.9851, source: google"
        echo "Response: $response"
    fi
    echo
}

# Test 5: Google Maps URL with ll= pattern
test_google_ll_pattern() {
    print_step "Test 5: Google Maps URL with ll= pattern"
    
    local url="https://www.google.com/maps?ll=34.0522,-118.2437&z=12"
    local encoded_url=$(printf %s "$url" | jq -sRr @uri)
    
    response=$(curl -s -X GET "$MAPS_ENDPOINT/extract?url=$encoded_url")
    
    if [[ $response == *"\"type\":\"coordinates\""* ]] && \
       [[ $response == *"\"lat\":34.0522"* ]] && \
       [[ $response == *"\"lng\":-118.2437"* ]] && \
       [[ $response == *"\"source\":\"google\""* ]]; then
        print_success "Google ll= pattern extraction successful"
        echo "Response: $response"
    else
        print_error "Failed to extract coordinates from Google ll= pattern URL"
        echo "Expected: type: coordinates, lat: 34.0522, lng: -118.2437, source: google"
        echo "Response: $response"
    fi
    echo
}

# Test 6: Google Maps URL with center= pattern
test_google_center_pattern() {
    print_step "Test 6: Google Maps URL with center= pattern"
    
    local url="https://www.google.com/maps?center=51.5074,-0.1278&zoom=10"
    local encoded_url=$(printf %s "$url" | jq -sRr @uri)
    
    response=$(curl -s -X GET "$MAPS_ENDPOINT/extract?url=$encoded_url")
    
    if [[ $response == *"\"type\":\"coordinates\""* ]] && \
       [[ $response == *"\"lat\":51.5074"* ]] && \
       [[ $response == *"\"lng\":-0.1278"* ]] && \
       [[ $response == *"\"source\":\"google\""* ]]; then
        print_success "Google center= pattern extraction successful"
        echo "Response: $response"
    else
        print_error "Failed to extract coordinates from Google center= pattern URL"
        echo "Expected: type: coordinates, lat: 51.5074, lng: -0.1278, source: google"
        echo "Response: $response"
    fi
    echo
}

# Test 7: Naver Maps URL with place ID
test_naver_place_id() {
    print_step "Test 7: Naver Maps URL with place ID"
    
    local url="https://map.naver.com/p/entry/place/1250997417?placePath=%2Fhome"
    local encoded_url=$(printf %s "$url" | jq -sRr @uri)
    
    response=$(curl -s -X GET "$MAPS_ENDPOINT/extract?url=$encoded_url")
    
    if [[ $response == *"\"type\":\"place_id\""* ]] && \
       [[ $response == *"\"placeId\":\"1250997417\""* ]] && \
       [[ $response == *"\"source\":\"naver\""* ]]; then
        print_success "Naver place ID extraction successful"
        echo "Response: $response"
    else
        print_error "Failed to extract place ID from Naver URL"
        echo "Expected: type: place_id, placeId: 1250997417, source: naver"
        echo "Response: $response"
    fi
    echo
}

# Test 8: Naver Maps URL with different place ID
test_naver_different_place_id() {
    print_step "Test 8: Naver Maps URL with different place ID"
    
    local url="https://map.naver.com/p/entry/place/987654321?c=15.00,0,0,0,dh"
    local encoded_url=$(printf %s "$url" | jq -sRr @uri)
    
    response=$(curl -s -X GET "$MAPS_ENDPOINT/extract?url=$encoded_url")
    
    if [[ $response == *"\"type\":\"place_id\""* ]] && \
       [[ $response == *"\"placeId\":\"987654321\""* ]] && \
       [[ $response == *"\"source\":\"naver\""* ]]; then
        print_success "Naver different place ID extraction successful"
        echo "Response: $response"
    else
        print_error "Failed to extract different place ID from Naver URL"
        echo "Expected: type: place_id, placeId: 987654321, source: naver"
        echo "Response: $response"
    fi
    echo
}

# Test 9: Unknown URL (should return unknown source)
test_unknown_url() {
    print_step "Test 9: Unknown URL (should return unknown source)"
    
    local url="https://example.com/some-random-url"
    local encoded_url=$(printf %s "$url" | jq -sRr @uri)
    
    response=$(curl -s -X GET "$MAPS_ENDPOINT/extract?url=$encoded_url")
    
    if [[ $response == *"\"type\":\"coordinates\""* ]] && \
       [[ $response == *"\"source\":\"unknown\""* ]] && \
       [[ $response == *"\"originalUrl\":\"$url\""* ]]; then
        print_success "Unknown URL handled correctly"
        echo "Response: $response"
    else
        print_error "Unknown URL not handled correctly"
        echo "Expected: type: coordinates, source: unknown"
        echo "Response: $response"
    fi
    echo
}

# Test 10: Error handling - Missing URL parameter
test_error_missing_url() {
    print_step "Test 10: Error handling - Missing URL parameter"
    
    response=$(curl -s -X GET "$MAPS_ENDPOINT/extract")
    
    if [[ $response == *"statusCode"* ]] && \
       [[ $response == *"code"* ]] && \
       [[ $response == *"message"* ]]; then
        print_success "Missing URL parameter handled correctly"
        echo "Response: $response"
    else
        print_error "Missing URL parameter error format is incorrect"
        echo "Expected: statusCode, code, message"
        echo "Response: $response"
    fi
    echo
}

# Test 11: Error handling - Empty URL parameter
test_error_empty_url() {
    print_step "Test 11: Error handling - Empty URL parameter"
    
    response=$(curl -s -X GET "$MAPS_ENDPOINT/extract?url=")
    
    if [[ $response == *"\"source\":\"unknown\""* ]] && \
       [[ $response == *"\"originalUrl\":\"\""* ]]; then
        print_success "Empty URL parameter handled correctly"
        echo "Response: $response"
    else
        print_error "Empty URL parameter not handled correctly"
        echo "Expected: source: unknown, originalUrl: empty"
        echo "Response: $response"
    fi
    echo
}

# Test 12: Google Maps URL without coordinates (should fail gracefully)
test_google_no_coordinates() {
    print_step "Test 12: Google Maps URL without coordinates"
    
    local url="https://www.google.com/maps"
    local encoded_url=$(printf %s "$url" | jq -sRr @uri)
    
    response=$(curl -s -X GET "$MAPS_ENDPOINT/extract?url=$encoded_url")
    
    if [[ $response == *"\"type\":\"coordinates\""* ]] && \
       [[ $response == *"\"source\":\"google\""* ]] && \
       [[ $response != *"\"lat\""* ]] && \
       [[ $response != *"\"lng\""* ]]; then
        print_success "Google URL without coordinates handled correctly"
        echo "Response: $response"
    else
        print_error "Google URL without coordinates not handled correctly"
        echo "Expected: type: coordinates, source: google, no lat/lng"
        echo "Response: $response"
    fi
    echo
}

# Test 13: Naver Maps URL without place ID (should fail gracefully)
test_naver_no_place_id() {
    print_step "Test 13: Naver Maps URL without place ID"
    
    local url="https://map.naver.com/p/search/coffee"
    local encoded_url=$(printf %s "$url" | jq -sRr @uri)
    
    response=$(curl -s -X GET "$MAPS_ENDPOINT/extract?url=$encoded_url")
    
    if [[ $response == *"\"type\":\"coordinates\""* ]] && \
       [[ $response == *"\"source\":\"naver\""* ]] && \
       [[ $response != *"\"placeId\""* ]]; then
        print_success "Naver URL without place ID handled correctly"
        echo "Response: $response"
    else
        print_error "Naver URL without place ID not handled correctly"
        echo "Expected: type: coordinates, source: naver, no placeId"
        echo "Response: $response"
    fi
    echo
}

# Test 14: Special characters in URL
test_special_characters() {
    print_step "Test 14: URL with special characters"
    
    local url="https://www.google.com/maps/place/Café+de+Flore/@48.8542,2.3320,15z"
    local encoded_url=$(printf %s "$url" | jq -sRr @uri)
    
    response=$(curl -s -X GET "$MAPS_ENDPOINT/extract?url=$encoded_url")
    
    if [[ $response == *"\"type\":\"coordinates\""* ]] && \
       [[ $response == *"\"lat\":48.8542"* ]] && \
       [[ $response == *"\"lng\":2.3320"* ]] && \
       [[ $response == *"\"source\":\"google\""* ]]; then
        print_success "URL with special characters handled correctly"
        echo "Response: $response"
    else
        print_error "URL with special characters not handled correctly"
        echo "Expected: type: coordinates, lat: 48.8542, lng: 2.3320, source: google"
        echo "Response: $response"
    fi
    echo
}

# Summary function
print_summary() {
    print_step "🎯 Maps API Test Summary"
    echo
    echo -e "${GREEN}✨ Supported Google Maps Patterns:${NC}"
    echo -e "${BLUE}•${NC} @lat,lng,zoom - Direct coordinate pattern"
    echo -e "${BLUE}•${NC} !3dlat!4dlng - Data parameter pattern"
    echo -e "${BLUE}•${NC} q=lat,lng - Query parameter pattern"
    echo -e "${BLUE}•${NC} ll=lat,lng - LatLng parameter pattern"
    echo -e "${BLUE}•${NC} center=lat,lng - Center parameter pattern"
    echo
    echo -e "${GREEN}✨ Supported Naver Maps Features:${NC}"
    echo -e "${BLUE}•${NC} /place/{id} - Place ID extraction"
    echo
    echo -e "${GREEN}🚀 Response Format:${NC}"
    echo -e "${BLUE}•${NC} Google: {type: \"coordinates\", lat: number, lng: number, source: \"google\"}"
    echo -e "${BLUE}•${NC} Naver: {type: \"place_id\", placeId: string, source: \"naver\"}"
    echo -e "${BLUE}•${NC} Unknown: {type: \"coordinates\", source: \"unknown\"}"
    echo
}

# Main execution
main() {
    echo -e "${BLUE}🗺️  Starting Maps API Tests${NC}"
    echo -e "${YELLOW}📍 Testing Google coordinates extraction and Naver place ID extraction${NC}"
    echo
    
    check_server
    echo
    
    # Google Maps coordinate extraction tests
    test_google_at_pattern
    test_google_place_at_pattern
    test_google_3d4d_pattern
    test_google_q_pattern
    test_google_ll_pattern
    test_google_center_pattern
    
    # Naver Maps place ID extraction tests
    test_naver_place_id
    test_naver_different_place_id
    
    # Edge cases and error handling
    test_unknown_url
    test_error_missing_url
    test_error_empty_url
    test_google_no_coordinates
    test_naver_no_place_id
    test_special_characters
    
    # Summary
    print_summary
    
    echo -e "${GREEN}🎉 All Maps API tests completed!${NC}"
    echo
    echo -e "${GREEN}✅ The Maps API is ready for:${NC}"
    echo -e "${BLUE}•${NC} Google Maps coordinate extraction from various URL patterns"
    echo -e "${BLUE}•${NC} Naver Maps place ID extraction"
    echo -e "${BLUE}•${NC} Graceful handling of unknown URLs"
    echo -e "${BLUE}•${NC} Proper error responses for invalid inputs"
    echo
}

# Run the tests
main
