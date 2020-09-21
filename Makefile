.PHONY: all build clean test up

CKAN_HOME := /usr/lib/ckan

########
# CKAN APP:
########

all: up

build:
	docker-compose build

clean:
	docker-compose down -v

test:
	docker-compose exec app /bin/bash -c "source $(CKAN_HOME)/bin/activate && nosetests --ckan --with-pylons=test.ini ckanext.dcat_usmetadata.tests"
up:
	docker-compose up

up-with-data:
	docker-compose -f docker-compose.yml -f docker-compose.seed.yml build
	docker-compose -f docker-compose.yml -f docker-compose.seed.yml up

lint:
	docker-compose exec app \
        bash -c "cd $(CKAN_HOME)/src/ckanext-dcat-usmetadata/ && \
                 pip install --upgrade pip  && \
                         pip install flake8 && \
                                 flake8 . --count --select=E9 --show-source --statistics"
########
# REACT APP:
########

app-up:
	cd metadata-app && yarn && yarn start

app-cosmos:
	cd metadata-app && yarn && yarn cosmos

app-lint:
	cd metadata-app && npx eslint src/*.js

