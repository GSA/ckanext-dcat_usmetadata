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
    cy.wait(10000);
    cy.additionalMetadata();
    cy.get('button[type=button]').contains('Save and Continue').click();
    cy.wait(15000);
    cy.resourceUploadWithUrlAndPublish();
    cy.wait(10000);
    cy.get('.resource-list').find('.resource-item').should('have.length', 1);
  });

  it('Saves resource and displays expected message', () => {
    const exampleUrl = 'https://example.com/data.csv';
    const expectedMessage1 = `Resource saved: [${exampleUrl}] (1 resources saved in total).`;
    const expectedMessage2 = 'You can edit any saved resource after clicking "Finish and publish"';
    cy.requiredMetadata();
    cy.wait(10000);
    cy.additionalMetadata();
    cy.get('button[type=button]').contains('Save and Continue').click();
    cy.wait(15000);
    cy.resourceUploadWithUrlAndSave(exampleUrl);
    cy.wait(5000);
    cy.get(':nth-child(8) > .col-md-12 > :nth-child(1)').contains(expectedMessage1);
    cy.get(':nth-child(8) > .col-md-12 > :nth-child(3)').contains(expectedMessage2);
  });

  it('Fails to save resource if URL is invalid', () => {
    const invalidUrl = 'example.com/data.csv';
    cy.requiredMetadata();
    cy.wait(10000);
    cy.additionalMetadata();
    cy.get('button[type=button]').contains('Save and Continue').click();
    cy.wait(5000);
    cy.resourceUploadWithUrlAndSave(invalidUrl);
    cy.wait(5000);
    cy.get('h3.usa-alert__heading').contains('This form contains invalid entries');
    cy.get('.usa-alert__text').contains('If you are linking to a dataset, please include "https://" at the beginning of your URL.');
  });
});
