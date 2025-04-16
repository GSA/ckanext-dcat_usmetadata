CKAN_VERSION ?= 2.10
COMPOSE_FILE ?= docker-compose.yml

build: 
	CKAN_VERSION=$(CKAN_VERSION) docker compose -f $(COMPOSE_FILE) build

up:
	CKAN_VERSION=$(CKAN_VERSION) docker compose -f $(COMPOSE_FILE) up

down:
	docker compose down

.DEFAULT_GOAL := help
.PHONY: build up

# Output documentation for top-level targets
# Thanks to https://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
help: ## This help
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-10s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
