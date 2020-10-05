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

describe('Resource Page -- URL', () => {
  it('Creates resource and redirects to dataset page', () => {
    cy.requiredMetadata();
    cy.wait(5000);
    cy.additionalMetadata();
    cy.wait(15000);
    cy.get('label[for=url]').click();
    cy.get('input[name=resource\\.url]').type(chance.url());
    cy.get('input[name=resource\\.name]').type(chance.word());
    cy.get('textarea[name=resource\\.description]').type(chance.sentence({ words: 10 }));
    cy.get('select[name=resource\\.mimetype]').select('DOC -- Word Document');
    cy.get('input[name=resource\\.format]').type(chance.word());
    cy.get('button[type=button]').contains('Finish and publish').click();
    cy.wait(5000);
    cy.get('.resource-list').find('.resource-item').should('have.length', 1);
  });
});
