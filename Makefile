.PHONY: all app-up app-cosmos app-lint app-test build clean setup test up

########
# CKAN APP:
########

all: up

build:
	docker-compose build

package:
	# create a source distribution
	python setup.py sdist
	# create a wheel
	python setup.py bdist_wheel

clean:
	docker-compose down -v

setup:
	npm install -g yarn

test:
	docker-compose run --rm app nosetests --ckan --with-pylons=/srv/app/src_extensions/dcat_usmetadata/docker_test.ini src_extensions/dcat_usmetadata/

up:
	docker-compose up

up-with-data:
	docker-compose -f docker-compose.yml -f docker-compose.seed.yml build
	docker-compose -f docker-compose.yml -f docker-compose.seed.yml up

lint-all:
	docker-compose up -d
	docker-compose run --rm app \
	  bash -c "cd $(CKAN_HOME) && \
	  pip install --upgrade pip  && \
	  pip install flake8 && \
	  flake8 . --count --select=E9 --show-source --statistics"
########
# REACT APP:
########

app-up:
	yarn && yarn start:metadata-app

app-cosmos:
	yarn && yarn cosmos

app-lint:
	npx eslint metadata-app/src && npx prettier --check metadata-app/src
app-test:
	yarn && yarn test
