#!/bin/bash
echo "------------------ start.sh --------------"

. $CKAN_HOME/bin/activate

export PATH="$CKAN_HOME/bin:$PATH"

set -o errexit
set -o pipefail
set -o nounset

function wait_for () {
  local host=$1
  local port=$2

  while ! nc -z -w 5 "$host" "$port"; do
    sleep 1
  done
}

wait_for solr 8983
wait_for db 5432

# Even though solr is listening, it needs a moment before the core status
# check will return successfully.
sleep 1

# Check if the solr core exists.
if ! (curl --get --fail --silent http://solr:8983/solr/admin/cores \
  --data-urlencode action=status \
  --data-urlencode core=inventory | grep -q segmentsFileSizeInBytes); then

  echo "Creating the SOLR core"
  # Create the solr core
  curl -v --get --fail --silent http://solr:8983/solr/admin/cores \
    --data-urlencode action=create \
    --data-urlencode name=inventory \
    --data-urlencode configSet=ckan2_5

  echo "Reloading the SOLR core"
  # Reload the core
  curl -v --get --fail --silent http://solr:8983/solr/admin/cores \
    --data-urlencode action=reload \
    --data-urlencode core=inventory
fi

# Run migrations
paster --plugin=ckan db upgrade -c /etc/ckan/production.ini

if [ "${1-}" = "seed" ]; then
  # Run seed script in new process
  echo running seed script...
  nohup /opt/inventory-app/seed.sh &> /tmp/nohup.out&
  # nohup some_command &> nohup2.out&
fi

# Work around https://github.com/GSA/catalog-app/issues/78
pip install -U repoze.who==2.0

echo starting ckan...
exec $CKAN_HOME/bin/gunicorn --paste /etc/ckan/production.ini -b 0.0.0.0:5000
