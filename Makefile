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
	docker-compose exec ckan /bin/bash -c "nosetests --ckan --with-pylons=/srv/app/src_extensions/dcat_usmetadata/docker_test.ini src_extensions/dcat_usmetadata/"

up:
	docker-compose up

up-with-data:
	docker-compose -f docker-compose.yml -f docker-compose.seed.yml build
	docker-compose -f docker-compose.yml -f docker-compose.seed.yml up

lint-all:
	docker-compose up -d
	docker-compose exec ckan \
        bash -c "cd $(CKAN_HOME) && \
                 pip install --upgrade pip  && \
                         pip install flake8 && \
                                 flake8 . --count --select=E9 --show-source --statistics"
########
# REACT APP:
########

app-up:
	cd metadata-app && yarn start

app-cosmos:
	cd metadata-app && yarn cosmos

app-lint:
	cd metadata-app && npx eslint src/*.js

app-test:
	cd metadata-app && yarn test 

