.PHONY: all build clean test up

########
# CKAN APP:
########

all: up

build:
	docker-compose build

clean:
	docker-compose down -v

test:
	docker-compose exec ckan /bin/bash -c "nosetests --ckan --with-pylons=/srv/app/src_extensions/dcat_usmetadata/docker_test.ini src_extensions/ckanext-react_usmetadata/"

up:
	docker-compose up

up-with-data:
	docker-compose -f docker-compose.yml -f docker-compose.seed.yml build
	docker-compose -f docker-compose.yml -f docker-compose.seed.yml up

########
# REACT APP:
########

app-up:
	cd metadata-app && yarn start
