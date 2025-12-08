#!/bin/bash

# Database setup script for Campus Connect
# This script initializes the database with all necessary tables and migrations

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Database configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_NAME="${DB_NAME:-event_management}"

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}Campus Connect - Database Setup${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""

# Check if PostgreSQL is running
echo -e "${YELLOW}Checking PostgreSQL connection...${NC}"
if ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c '\q' 2>/dev/null; then
    echo -e "${RED}Error: Cannot connect to PostgreSQL${NC}"
    echo "Please ensure PostgreSQL is running and credentials are correct"
    exit 1
fi
echo -e "${GREEN}✓ PostgreSQL connection successful${NC}"
echo ""

# Check if database exists, create if not
echo -e "${YELLOW}Checking database existence...${NC}"
if ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo -e "${YELLOW}Database '$DB_NAME' does not exist. Creating...${NC}"
    PGPASSWORD=$DB_PASSWORD createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME
    echo -e "${GREEN}✓ Database created${NC}"
else
    echo -e "${GREEN}✓ Database exists${NC}"
fi
echo ""

# Ask if user wants to reset database
echo -e "${YELLOW}Do you want to reset the database? This will delete all existing data! (y/N)${NC}"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo -e "${YELLOW}Resetting database...${NC}"
    PGPASSWORD=$DB_PASSWORD dropdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME
    PGPASSWORD=$DB_PASSWORD createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME
    echo -e "${GREEN}✓ Database reset${NC}"
    echo ""
fi

# Run migrations
echo -e "${YELLOW}Running database schema setup...${NC}"
echo ""

# Execute complete schema
echo -e "${YELLOW}Applying complete database schema...${NC}"
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f complete_schema_with_updates.sql; then
    echo -e "${GREEN}✓ Schema applied successfully${NC}"
else
    echo -e "${RED}✗ Failed to apply schema${NC}"
    exit 1
fi
echo ""

# Verify tables
echo -e "${YELLOW}Verifying database tables...${NC}"
TABLES=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT tablename FROM pg_tables WHERE schemaname='public';" -t | tr -d ' ')

EXPECTED_TABLES=("users" "user_profiles" "events" "event_attendees" "event_time_slots")
for table in "${EXPECTED_TABLES[@]}"; do
    if echo "$TABLES" | grep -q "^$table$"; then
        echo -e "${GREEN}✓ Table '$table' exists${NC}"
    else
        echo -e "${RED}✗ Table '$table' missing${NC}"
        exit 1
    fi
done
echo ""

# Display database info
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}Database setup completed successfully!${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo -e "${YELLOW}Database Information:${NC}"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""
echo -e "${YELLOW}Connection String:${NC}"
echo "  postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
echo ""
echo -e "${GREEN}You can now start the backend server with:${NC}"
echo "  cd backend"
echo "  npm start"
echo ""
