#!/bin/sh
sudo mkdir /foundry
sudo touch /foundry/flash_teams.csv
sudo chown -R `whoami` /foundry/flash_teams.csv
echo "sep=|" >> /foundry/flash_teams.csv
psql -d flashteamsdbdev -a -f sql/CreateFlashTeamsLibrary.sql
