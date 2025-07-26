#!/bin/bash

# Simplified Cafe API Demo Script
# This script demonstrates the new simplified cafe workflow
# No authentication needed - just create, get ID, and manage cafes!

# Configuration
BASE_URL="http://localhost:3000"
CAFES_ENDPOINT="$BASE_URL/api/cafes"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${BLUE}  $1${NC}"
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_step() {
    echo -e "${CYAN}🔹 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}💡 $1${NC}"
}

# Function to extract cafe ID from response
extract_cafe_id() {
    echo "$1" | grep -o '"id":"[^"]*"' | cut -d'"' -f4
}

# Function to check if server is running
check_server() {
    echo -e "${BLUE}Checking server status...${NC}"
    if curl -s "$BASE_URL" > /dev/null 2>&1; then
        print_success "Server is running at $BASE_URL"
        return 0
    else
        print_error "Server is not running. Please start the server first:"
        echo -e "${YELLOW}   npm start${NC}"
        exit 1
    fi
}

# Demo the simplified workflow
demo_workflow() {
    print_header "🚀 SIMPLIFIED CAFE API DEMO"
    echo
    
    print_info "This demo shows the new simplified cafe workflow:"
    print_info "✨ No authentication required"
    print_info "📍 Flat, simple structure" 
    print_info "⚡ Direct API access"
    echo
    
    # Step 1: Create a cafe
    print_step "STEP 1: Create a cafe with basic info"
    echo -e "${YELLOW}Request:${NC}"
    echo '{
  "name": "Artisan Coffee Roasters",
  "lat": 37.7749,
  "lng": -122.4194,
  "totalSeats": 45,
  "url": "https://maps.google.com/maps?q=37.7749,-122.4194"
}'
    echo
    
    response=$(curl -s -X POST "$CAFES_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Artisan Coffee Roasters",
            "lat": 37.7749,
            "lng": -122.4194,
            "totalSeats": 45,
            "url": "https://maps.google.com/maps?q=37.7749,-122.4194"
        }')
    
    if [[ $response == *"id"* ]]; then
        CAFE_ID=$(extract_cafe_id "$response")
        print_success "Cafe created successfully!"
        echo -e "${GREEN}Response:${NC} $response"
        echo
        print_info "📝 Cafe ID: $CAFE_ID"
        print_info "🎯 Save this ID - you'll use it for all operations!"
    else
        print_error "Failed to create cafe"
        echo "Response: $response"
        exit 1
    fi
    echo
    
    # Step 2: Get cafe details
    print_step "STEP 2: Get cafe details using the cafe ID"
    echo -e "${YELLOW}Request: GET /api/cafes/$CAFE_ID${NC}"
    echo
    
    get_response=$(curl -s -X GET "$CAFES_ENDPOINT/$CAFE_ID")
    print_success "Retrieved cafe details!"
    echo -e "${GREEN}Response:${NC} $get_response"
    echo
    
    # Step 3: Update seat availability
    print_step "STEP 3: Update seat availability (public endpoint)"
    echo -e "${YELLOW}Request: PUT /api/cafes/$CAFE_ID/seats-availability${NC}"
    echo '{
  "totalSeats": 45,
  "availableSeats": 32
}'
    echo
    
    seats_response=$(curl -s -X PUT "$CAFES_ENDPOINT/$CAFE_ID/seats-availability" \
        -H "Content-Type: application/json" \
        -d '{
            "totalSeats": 45,
            "availableSeats": 32
        }')
    print_success "Seat availability updated!"
    echo -e "${GREEN}Response:${NC} $seats_response"
    echo
    
    # Step 4: Search nearby cafes
    print_step "STEP 4: Search for nearby cafes"
    echo -e "${YELLOW}Request: GET /api/cafes?lat=37.7749&lng=-122.4194&radius=5${NC}"
    echo
    
    search_response=$(curl -s -X GET "$CAFES_ENDPOINT?lat=37.7749&lng=-122.4194&radius=5")
    print_success "Found nearby cafes!"
    echo -e "${GREEN}Response:${NC} $search_response"
    echo
    
    # Step 5: Update entire cafe
    print_step "STEP 5: Update entire cafe information"
    echo -e "${YELLOW}Request: PUT /api/cafes/$CAFE_ID${NC}"
    echo '{
  "name": "Artisan Coffee Roasters - Downtown",
  "lat": 37.7750,
  "lng": -122.4195,
  "totalSeats": 50,
  "url": "https://maps.google.com/maps?q=37.7750,-122.4195"
}'
    echo
    
    update_response=$(curl -s -X PUT "$CAFES_ENDPOINT/$CAFE_ID" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Artisan Coffee Roasters - Downtown",
            "lat": 37.7750,
            "lng": -122.4195,
            "totalSeats": 50,
            "url": "https://maps.google.com/maps?q=37.7750,-122.4195"
        }')
    print_success "Cafe information updated!"
    echo -e "${GREEN}Response:${NC} $update_response"
    echo
    
    # Optional cleanup
    print_step "OPTIONAL: Clean up demo cafe"
    read -p "Do you want to delete the demo cafe? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        delete_response=$(curl -s -X DELETE "$CAFES_ENDPOINT/$CAFE_ID")
        if [[ $delete_response == *"true"* ]]; then
            print_success "Demo cafe deleted successfully!"
        else
            print_error "Failed to delete demo cafe"
            echo "Response: $delete_response"
        fi
    else
        print_info "Demo cafe kept. ID: $CAFE_ID"
        print_info "You can manage it using this ID"
    fi
    echo
}

# Summary of the new workflow
show_summary() {
    print_header "📋 WORKFLOW SUMMARY"
    echo
    echo -e "${GREEN}🎯 3-Step Process:${NC}"
    echo -e "${BLUE}1.${NC} Create cafe → Get cafe ID"
    echo -e "${BLUE}2.${NC} Use cafe ID for all operations"
    echo -e "${BLUE}3.${NC} No authentication needed!"
    echo
    echo -e "${GREEN}📋 Available Endpoints:${NC}"
    echo -e "${BLUE}•${NC} POST   /api/cafes                           → Create cafe"
    echo -e "${BLUE}•${NC} GET    /api/cafes?lat=X&lng=Y&radius=Z      → Find nearby"
    echo -e "${BLUE}•${NC} GET    /api/cafes/{cafeId}                  → Get cafe details"
    echo -e "${BLUE}•${NC} PUT    /api/cafes/{cafeId}                  → Update cafe"
    echo -e "${BLUE}•${NC} GET    /api/cafes/{cafeId}/seats-availability → Get seats"
    echo -e "${BLUE}•${NC} PUT    /api/cafes/{cafeId}/seats-availability → Update seats"
    echo -e "${BLUE}•${NC} DELETE /api/cafes/{cafeId}                  → Delete cafe"
    echo
    echo -e "${GREEN}🔧 Simple Request Format:${NC}"
    echo -e "${CYAN}{${NC}"
    echo -e "${CYAN}  \"name\": \"Coffee Shop Name\",${NC}"
    echo -e "${CYAN}  \"lat\": 37.7749,${NC}"
    echo -e "${CYAN}  \"lng\": -122.4194,${NC}"
    echo -e "${CYAN}  \"totalSeats\": 50,${NC}"
    echo -e "${CYAN}  \"url\": \"https://maps.google.com/...\"${NC}"
    echo -e "${CYAN}}${NC}"
    echo
}

# Main execution
main() {
    check_server
    echo
    demo_workflow
    show_summary
    
    print_header "🎉 DEMO COMPLETE"
    echo
    print_success "The new simplified cafe API is ready to use!"
    print_info "Visit http://localhost:3000/api/docs for full API documentation"
    echo
}

# Run the demo
main "$@" 