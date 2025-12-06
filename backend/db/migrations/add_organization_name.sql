-- Add organization_name column to users table
-- This allows organizers to specify their organization name
-- which will be displayed instead of their personal name

ALTER TABLE users
ADD COLUMN organization_name VARCHAR(200);

COMMENT ON COLUMN users.organization_name IS 'Organization name for organizers. If set, this will be displayed instead of the user name.';
