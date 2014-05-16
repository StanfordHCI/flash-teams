-- This script will dump the flash teams to a CSV file
-- The file is located at /foundry/flash_teams.csv
-- Command is the following
-- 	>> psql -d flashteamsdbdev -a -f DumpFlashTeams.sql

COPY flash_teams TO '/foundry/flash_teams.csv' DELIMITER '|' CSV HEADER;
