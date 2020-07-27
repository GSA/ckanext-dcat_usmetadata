#!/bin/sh -e

echo "TESTING ckanext-dcat_usmetadata"
nosetests --ckan --with-pylons=subdir/test.ini ckanext/dcat_usmetadata
