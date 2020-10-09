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

describe('DCAT Metadata App', () => {
  it('Loads', () => {
    cy.visit('/dataset/new-metadata?group=test-123');
  });

  it('Has a title', () => {
    cy.contains('Required Metadata');
  });
});

describe('Additional Metadata Page', () => {
  it('Submit Additional Metadata works', () => {
    cy.requiredMetadata();
    cy.wait(5000);
    cy.additionalMetadata();
    cy.get('button[type=button]').contains('Save and Continue').click();
    cy.wait(5000);
    cy.contains('Resource Upload');
  });
});
