#!/bin/sh
sudo mkdir /foundry
sudo chown -R `whoami` /foundry
touch /foundry/flash_teams.csv
chown -R `whoami` /foundry/flash_teams.csv
echo "sep=|" >> /foundry/flash_teams.csv
psql -d flashteamsdbdev -a -f sql/DumpFlashTeams.sql
