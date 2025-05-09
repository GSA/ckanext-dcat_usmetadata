CKAN_VERSION ?= 2.11
COMPOSE_FILE ?= docker-compose.yml

build: 
	CKAN_VERSION=$(CKAN_VERSION) docker compose -f $(COMPOSE_FILE) build

up:
	CKAN_VERSION=$(CKAN_VERSION) docker compose -f $(COMPOSE_FILE) up

down:
	CKAN_VERSION=$(CKAN_VERSION) docker compose down

test_e2e:
	# CKAN_VERSION=$(CKAN_VERSION) docker compose -f docker-compose.yml -f docker-compose.cypress.yml run cypress /bin/bash -c "npx wait-on http://ckan:5000/api/action/status_show --timeout 120000 && npx cypress install && yarn && NODE_ENV=test npx cypress run --spec cypress/integration/required-metadata.spec.js"
	CKAN_VERSION=$(CKAN_VERSION) docker compose -f docker-compose.yml -f docker-compose.cypress.yml run cypress /bin/bash -c "npx wait-on http://ckan:5000/api/action/status_show --timeout 120000 && npx cypress install && yarn && NODE_ENV=test npx cypress run"

test_e2e_interactive:
	CKAN_VERSION=$(CKAN_VERSION) docker compose -f docker-compose.yml up -d && yarn && NODE_ENV=test npx cypress open
	

.DEFAULT_GOAL := help
.PHONY: build up

# Output documentation for top-level targets
# Thanks to https://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
help: ## This help
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-10s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
