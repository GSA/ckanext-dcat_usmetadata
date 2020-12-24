import 'cypress-file-upload';
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
  it('Links to Data and redirects to dataset page on CKAN', () => {
    cy.requiredMetadata().then(() => {
      cy.additionalMetadata();
      cy.get('button[type=button]')
        .contains('Save and Continue')
        .click()
        .then(() => {
          cy.resourceUploadWithUrlAndPublish().then(() => {
            cy.get('.resource-list').find('.resource-item').should('have.length', 1);
          });
        });
    });
  });

  it('Links to Data and has special character in metadata', () => {
    cy.requiredMetadata().then(() => {
      cy.additionalMetadata();
      cy.get('button[type=button]')
        .contains('Save and Continue')
        .click()
        .then(() => {
          cy.get('label[for=url]').click();
          cy.get('input[name=resource\\.url]').type('https://example.com/data.csv');
          cy.get('input[name=resource\\.name]').type('With special & character');
          cy.get('button[type=button]')
            .contains('Finish and publish')
            .click()
            .then(() => {
              cy.get('.resource-list').find('.resource-item').should('have.length', 1);
            });
        });
    });
  });

  it('Uploads data file and redirects to dataset page on CKAN', () => {
    cy.requiredMetadata().then(() => {
      cy.additionalMetadata();
      cy.get('button[type=button]')
        .contains('Save and Continue')
        .click()
        .then(() => {
          cy.get('label[for=upload]').click();
          const yourFixturePath = '../fixtures/example.json';
          cy.get('input#upload').attachFile(yourFixturePath);
          cy.get('button[type=button]')
            .contains('Finish and publish')
            .click()
            .then(() => {
              cy.get('.resource-list').find('.resource-item').should('have.length', 1);
            });
        });
    });
  });

  it('Uploads data file and has special character in metadata', () => {
    cy.requiredMetadata().then(() => {
      cy.additionalMetadata();
      cy.get('button[type=button]')
        .contains('Save and Continue')
        .click()
        .then(() => {
          cy.get('label[for=upload]').click();
          const yourFixturePath = '../fixtures/example.json';
          cy.get('input#upload').attachFile(yourFixturePath);
          cy.get('input[name=resource\\.name]').clear().type('With special & character');
          cy.get('button[type=button]')
            .contains('Finish and publish')
            .click()
            .then(() => {
              cy.get('.resource-list').find('.resource-item').should('have.length', 1);
            });
        });
    });
  });

  it('Saves resource and displays expected message', () => {
    const exampleUrl = 'https://example.com/data.csv';
    const expectedMessage1 = `Resource saved: [${exampleUrl}] (1 resources saved in total).`;
    const expectedMessage2 = 'You can edit any saved resource after clicking "Finish and publish"';
    cy.requiredMetadata();
    cy.additionalMetadata();
    cy.get('button[type=button]').contains('Save and Continue').click();
    cy.wait(15000);
    cy.resourceUploadWithUrlAndSave(exampleUrl);
    cy.wait(5000);
    cy.contains(expectedMessage1);
    cy.contains(expectedMessage2);
  });

  it('List saved resources and truncates long names', () => {
    const title = 'resource-list-edit-test';
    const exampleUrl = 'https://example.com/data.csv';
    const shortResourceName = 'First resource';
    const longResourceName =
      'Very oooooooooooooooooooooooooooooooooooooooooooooooooooooooo naaaame';
    cy.requiredMetadata(title);
    cy.additionalMetadata();
    cy.get('button[type=button]').contains('Save and Continue').click();
    cy.intercept('/api/3/action/resource_create').as('resourceCreate');
    cy.resourceUploadWithUrlAndSave(exampleUrl, shortResourceName);
    cy.wait('@resourceCreate');
    cy.resourceUploadWithUrlAndSave(exampleUrl, longResourceName);
    cy.wait('@resourceCreate');

    cy.visit(`/dataset/edit-new/${title}`);
    cy.contains('Resource Upload').click();

    cy.contains(shortResourceName);
    cy.get(longResourceName).should('not.exist');
    // Action buttons
    cy.contains('Delete');
    cy.contains('Edit');
    // Truncated the text, three dots
    cy.contains(/.../);
    cy.request('POST', '/api/3/action/dataset_purge', { id: title });
  });

  it('Fails to save resource if URL is invalid', () => {
    const invalidUrl = 'example.com/data.csv';
    cy.requiredMetadata();
    cy.additionalMetadata();
    cy.get('button[type=button]').contains('Save and Continue').click();
    cy.wait(5000);
    cy.resourceUploadWithUrlAndSave(invalidUrl);
    cy.wait(5000);
    cy.get('h3.usa-alert__heading').contains('This form contains invalid entries');
    cy.get('.usa-alert__text').contains(
      'If you are linking to a dataset, please include "https://" at the beginning of your URL.'
    );
  });
});

describe('Save draft functionality on Resource Upload page', () => {
  it('Saves draft', () => {
    cy.requiredMetadata();
    cy.intercept('/api/3/action/package_update').as('packageUpdate');
    cy.get('button[type=button]').contains('Save and Continue').click();
    cy.wait('@packageUpdate');
    cy.contains('Save and add another resource');
    cy.get('.usa-button--outline').contains('Save draft').click();
    cy.contains('Draft saved');

    cy.intercept('/api/3/action/resource_create').as('resourceCreate');
    cy.get('label[for=url]').click();
    cy.get('input[name=resource\\.url]').type(chance.url());
    cy.get('input[name=resource\\.name]').type(chance.word());
    cy.get('.usa-button--outline').contains('Save draft').click();
    cy.wait('@resourceCreate');
    cy.contains('Draft saved');
  });
});
