.PHONY: cypress

CKAN_VERSION ?= 2.9

cypress: ## Run all of the cypress tests invdividually
	CKAN_VERSION=${CKAN_VERSION} docker-compose -f docker-compose.yml -f docker-compose.cypress.yml run cypress /bin/bash -c "npx wait-on http://ckan:5000/api/action/status_show && npx cypress install && yarn && NODE_ENV=test npx cypress run --spec cypress/integration/additional-metadata.spec.js"
	yarn clean
	CKAN_VERSION=${CKAN_VERSION} docker-compose -f docker-compose.yml -f docker-compose.cypress.yml run cypress /bin/bash -c "npx wait-on http://ckan:5000/api/action/status_show && npx cypress install && yarn && NODE_ENV=test npx cypress run --spec cypress/integration/edit-dataset.spec.js"
	yarn clean
	CKAN_VERSION=${CKAN_VERSION} docker-compose -f docker-compose.yml -f docker-compose.cypress.yml run cypress /bin/bash -c "npx wait-on http://ckan:5000/api/action/status_show && npx cypress install && yarn && NODE_ENV=test npx cypress run --spec cypress/integration/publishers.spec.js"
	yarn clean
	CKAN_VERSION=${CKAN_VERSION} docker-compose -f docker-compose.yml -f docker-compose.cypress.yml run cypress /bin/bash -c "npx wait-on http://ckan:5000/api/action/status_show && npx cypress install && yarn && NODE_ENV=test npx cypress run --spec cypress/integration/required-metadata.spec.js"
	yarn clean
	CKAN_VERSION=${CKAN_VERSION} docker-compose -f docker-compose.yml -f docker-compose.cypress.yml run cypress /bin/bash -c "npx wait-on http://ckan:5000/api/action/status_show && yarn && NODE_ENV=test cypress run --spec cypress/integration/resource-upload.spec.js"
	yarn clean
	CKAN_VERSION=${CKAN_VERSION} docker-compose -f docker-compose.yml -f docker-compose.cypress.yml run cypress /bin/bash -c "npx wait-on http://ckan:5000/api/action/status_show && npx cypress install && yarn && NODE_ENV=test npx cypress run --spec cypress/integration/user-flow.spec.js"

cypress-containers: ## Run all of the cypress tests in separate containers
	CKAN_VERSION=${CKAN_VERSION} docker-compose -f docker-compose.yml -f docker-compose.cypress.yml up --abort-on-container-exit cypress-additional-metadata
	CKAN_VERSION=${CKAN_VERSION} docker-compose -f docker-compose.yml -f docker-compose.cypress.yml up --abort-on-container-exit cypress-edit-dataset
	CKAN_VERSION=${CKAN_VERSION} docker-compose -f docker-compose.yml -f docker-compose.cypress.yml up --abort-on-container-exit cypress-organization
	CKAN_VERSION=${CKAN_VERSION} docker-compose -f docker-compose.yml -f docker-compose.cypress.yml up --abort-on-container-exit cypress-publishers
	CKAN_VERSION=${CKAN_VERSION} docker-compose -f docker-compose.yml -f docker-compose.cypress.yml up --abort-on-container-exit cypress-required-metadata
	CKAN_VERSION=${CKAN_VERSION} docker-compose -f docker-compose.yml -f docker-compose.cypress.yml up --abort-on-container-exit cypress-resource-upload
	CKAN_VERSION=${CKAN_VERSION} docker-compose -f docker-compose.yml -f docker-compose.cypress.yml up --abort-on-container-exit cypress-user-flow
