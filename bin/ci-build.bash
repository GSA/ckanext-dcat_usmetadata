#!/bin/bash
set -e
echo "This is ci-build.bash..."

echo "-----------------------------------------------------------------"
echo "Installing the packages that CKAN requires..."
sudo apt-get update -qq
sudo apt-get install solr-jetty libcommons-fileupload-java libpq-dev postgresql postgresql-contrib swig

echo "-----------------------------------------------------------------"
echo "Installing CKAN and its Python dependencies..."

cd .. # CircleCI starts inside ckanext-dcat_usmetadata folder
pwd
ls -la

git clone --branch inventory https://github.com/GSA/ckan.git
cd ckan

pip install pip==20.3.3
pip install setuptools -U

python setup.py develop

# Fix for sqlalchemy-migrate issue. See https://gist.github.com/davidread/a6b47f2ebada39ed21fe66016702805b#file-gistfile1-txt-L102
pip install testrepository

pip install -r requirements.txt
pip install -r dev-requirements.txt

cd ..
echo "-----------------------------------------------------------------"
echo "Setting up Solr..."
# solr is multicore for tests on ckan master now, but it's easier to run tests
# on Travis single-core still.
# see https://github.com/ckan/ckan/issues/2972
sed -i -e 's/solr_url.*/solr_url = http:\/\/127.0.0.1:8983\/solr/' ckan/test-core.ini
printf "NO_START=0\nJETTY_HOST=127.0.0.1\nJETTY_PORT=8983\nJAVA_HOME=$JAVA_HOME" | sudo tee /etc/default/jetty
sudo cp ckan/ckan/config/solr/schema.xml /etc/solr/conf/schema.xml
sudo service jetty restart

echo "-----------------------------------------------------------------"
echo "Creating the PostgreSQL user and database..."
sudo -u postgres psql -c "CREATE USER ckan_default WITH PASSWORD 'pass';"
sudo -u postgres psql -c 'CREATE DATABASE ckan_test WITH OWNER ckan_default;'
sudo -u postgres psql -c 'CREATE DATABASE datastore_test WITH OWNER ckan_default;'

echo "-----------------------------------------------------------------"
echo "Initialising the database..."
cd ckan
paster db init -c test-core.ini

cd ..
echo "-----------------------------------------------------------------"
echo "Installing ckanext-dcat_usmetadata and its requirements..."
cd ckanext-dcat_usmetadata
pip install -r requirements.txt
python setup.py develop

echo "Moving test.ini into a subdir..."
mkdir subdir
mv test.ini subdir

echo "ci-build.bash is done."

