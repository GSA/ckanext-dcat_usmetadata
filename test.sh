#!/bin/bash
# Setup and run extension tests. This script should be run in a _clean_ CKAN
# environment. e.g.:
#
#     $ docker-compose run --rm app ./test.sh
#

set -o errexit
set -o pipefail

TEST_CONFIG=/app/test.ini

# Database is listening, but still unavailable. Just keep trying...
while ! ckan -c $TEST_CONFIG db init; do 
  echo Retrying in 5 seconds...
  sleep 5
done

# start_ckan_development.sh &
pytest -s --ckan-ini=$TEST_CONFIG --cov=ckanext.dcat_usmetadata --disable-warnings /app/ckanext/dcat_usmetadata/tests/
