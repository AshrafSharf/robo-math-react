#!/bin/bash

# Expression Parser Test Runner
# Runs all test files and reports results

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Test files
TEST_FILES=(
    "parsing.test.js"
    "variables.test.js"
    "point-operations.test.js"
    "math-functions.test.js"
    "line-expressions.test.js"
)

echo ""
echo "=========================================="
echo "Expression Parser Test Suite"
echo "=========================================="
echo ""

# Track results
TOTAL_FILES=0
PASSED_FILES=0
FAILED_FILES=0
TOTAL_TESTS=0
TOTAL_PASSED=0
TOTAL_FAILED=0

# Run each test file
for test_file in "${TEST_FILES[@]}"; do
    TOTAL_FILES=$((TOTAL_FILES + 1))

    echo -e "${BLUE}Running: $test_file${NC}"

    # Run the test and capture output
    if node "$SCRIPT_DIR/$test_file"; then
        PASSED_FILES=$((PASSED_FILES + 1))
        echo ""
    else
        FAILED_FILES=$((FAILED_FILES + 1))
        echo -e "${RED}✗ $test_file FAILED${NC}"
        echo ""
    fi
done

# Print overall summary
echo "=========================================="
echo -e "${BLUE}Overall Test Summary${NC}"
echo "=========================================="
echo "Test Files Run: $TOTAL_FILES"
echo -e "${GREEN}Passed: $PASSED_FILES${NC}"
if [ $FAILED_FILES -gt 0 ]; then
    echo -e "${RED}Failed: $FAILED_FILES${NC}"
fi
echo "=========================================="
echo ""

# Exit with appropriate code
if [ $FAILED_FILES -gt 0 ]; then
    exit 1
else
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
fi
