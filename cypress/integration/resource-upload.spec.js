import Chance from 'chance';
const chance = new Chance();

before(() => {
  cy.login();
  cy.createOrg();
  cy.visit('/dataset/new-metadata');
});

beforeEach(() => {
  Cypress.Cookies.preserveOnce('ckan');
});

describe('Resource Upload', () => {
  it('Creates resource and redirects to dataset page', () => {
    cy.requiredMetadata();
    cy.wait(5000);
    cy.additionalMetadata();
    cy.wait(15000);
    cy.resourceUploadWithUrlAndPublish();
    cy.wait(10000);
    cy.get('.resource-list').find('.resource-item').should('have.length', 1);
  });
});
