.PHONY: cypress

CKAN_VERSION ?= 2.9

cypress: ## Run all of the cypress tests invdividually
	CKAN_VERSION=${CKAN_VERSION} docker-compose -f docker-compose.yml -f docker-compose.cypress.yml run cypress /bin/bash -c "npx wait-on http://ckan:5000 && npx cypress install && NODE_ENV=test npx cypress run --spec cypress/integration/additional-metadata.spec.js"
	yarn clean
	CKAN_VERSION=${CKAN_VERSION} docker-compose -f docker-compose.yml -f docker-compose.cypress.yml run cypress /bin/bash -c "npx wait-on http://ckan:5000 && npx cypress install && NODE_ENV=test npx cypress run --spec cypress/integration/edit-dataset.spec.js"
	yarn clean
	CKAN_VERSION=${CKAN_VERSION} docker-compose -f docker-compose.yml -f docker-compose.cypress.yml run cypress /bin/bash -c "npx wait-on http://ckan:5000 && npx cypress install && NODE_ENV=test npx cypress run --spec cypress/integration/publishers.spec.js"
	yarn clean
	CKAN_VERSION=${CKAN_VERSION} docker-compose -f docker-compose.yml -f docker-compose.cypress.yml run cypress /bin/bash -c "npx wait-on http://ckan:5000 && npx cypress install && NODE_ENV=test npx cypress run --spec cypress/integration/required-metadata.spec.js"
	yarn clean
	CKAN_VERSION=${CKAN_VERSION} docker-compose -f docker-compose.yml -f docker-compose.cypress.yml run cypress /bin/bash -c "npx wait-on http://ckan:5000 && NODE_ENV=test cypress run --spec cypress/integration/resource-upload.spec.js"
	yarn clean
	CKAN_VERSION=${CKAN_VERSION} docker-compose -f docker-compose.yml -f docker-compose.cypress.yml run cypress /bin/bash -c "npx wait-on http://ckan:5000 && npx cypress install && NODE_ENV=test npx cypress run --spec cypress/integration/user-flow.spec.js"
