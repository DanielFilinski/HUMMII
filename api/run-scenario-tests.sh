#!/bin/bash

# 🎯 Hummii API - Scenario Tests Runner
# Run all test scenarios with detailed reporting

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
REPORT_DIR="test-reports/scenarios"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$REPORT_DIR/test-run-$TIMESTAMP.log"

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🎯 Hummii API - Scenario Tests Runner                  ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Create report directory
mkdir -p "$REPORT_DIR"

# Function to run a scenario
run_scenario() {
    local name=$1
    local pattern=$2
    
    echo -e "${YELLOW}▶ Running: $name${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if npm run test:scenarios:$pattern 2>&1 | tee -a "$LOG_FILE"; then
        echo -e "${GREEN}✅ $name - PASSED${NC}"
        echo ""
        return 0
    else
        echo -e "${RED}❌ $name - FAILED${NC}"
        echo ""
        return 1
    fi
}

# Check if API is running
echo -e "${BLUE}🔍 Checking if API is running...${NC}"
if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${RED}❌ API is not running!${NC}"
    echo -e "${YELLOW}💡 Start the API first:${NC}"
    echo -e "   cd api && npm run start:dev"
    echo ""
    exit 1
fi
echo -e "${GREEN}✅ API is running${NC}"
echo ""

# Initialize counters
TOTAL=0
PASSED=0
FAILED=0

# Start timer
START_TIME=$(date +%s)

echo -e "${BLUE}📊 Starting Test Scenarios...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Run scenarios
scenarios=(
    "🚀 Quick Health Check:health"
    "📧 Email Verification Flow:verification"
    "👤 Complete User Journey:user"
    "📦 Order Lifecycle:order"
)

for scenario in "${scenarios[@]}"; do
    IFS=':' read -r name pattern <<< "$scenario"
    TOTAL=$((TOTAL + 1))
    
    if run_scenario "$name" "$pattern"; then
        PASSED=$((PASSED + 1))
    else
        FAILED=$((FAILED + 1))
    fi
done

# End timer
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# Generate summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📊 Test Summary${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Total Scenarios:  ${TOTAL}"
echo -e "${GREEN}Passed:          ${PASSED}${NC}"
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}Failed:          ${FAILED}${NC}"
else
    echo -e "Failed:          ${FAILED}"
fi
echo -e "Duration:         ${DURATION}s"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Report generation
echo -e "${BLUE}📄 Generating Reports...${NC}"
echo ""

if [ -f "$REPORT_DIR/scenario-tests-report.html" ]; then
    echo -e "${GREEN}✅ HTML Report:${NC} $REPORT_DIR/scenario-tests-report.html"
fi

if [ -f "$REPORT_DIR/junit-scenarios.xml" ]; then
    echo -e "${GREEN}✅ JUnit Report:${NC} $REPORT_DIR/junit-scenarios.xml"
fi

echo -e "${GREEN}✅ Log File:${NC} $LOG_FILE"
echo ""

# Final status
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   🎉 ALL SCENARIOS PASSED!                                ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${RED}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║   ❌ SOME SCENARIOS FAILED                                ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}💡 Check the reports for details:${NC}"
    echo -e "   - HTML: $REPORT_DIR/scenario-tests-report.html"
    echo -e "   - Log:  $LOG_FILE"
    exit 1
fi
