import Chance from 'chance';
const chance = new Chance();

before(() => {
  cy.login();
  cy.createOrg();
});

beforeEach(() => {
  cy.login();
  Cypress.Cookies.preserveOnce('ckan');
  cy.visit('/dataset/new-metadata');
});

describe('Resource Upload page', () => {
  it('Creates resource and redirects to dataset page', () => {
    cy.requiredMetadata();
    cy.wait(5000);
    cy.additionalMetadata();
    cy.wait(15000);
    cy.resourceUploadWithUrlAndPublish();
    cy.wait(10000);
    cy.get('.resource-list').find('.resource-item').should('have.length', 1);
  });

  it('Saves resource and displays expected message', () => {
    const exampleUrl = 'https://example.com/data.csv';
    const expectedMessage1 = `Resource saved: [${exampleUrl}] (1 resource saved in total).`;
    const expectedMessage2 = 'You can edit any saved resource after clicking "Finish and publish"';
    cy.requiredMetadata();
    cy.wait(5000);
    cy.additionalMetadata();
    cy.wait(15000);
    cy.resourceUploadWithUrlAndSave(exampleUrl);
    cy.wait(5000);
    cy.get(':nth-child(8) > .col-md-12 > :nth-child(1)').contains(expectedMessage1);
    cy.get(':nth-child(8) > .col-md-12 > :nth-child(3)').contains(expectedMessage2);
  })
});
