import Chance from 'chance';
const chance = new Chance();

before(() => {
  cy.login();
  cy.createOrg();
  cy.visit('/dataset/new-metadata?group=test-123');
});

beforeEach(() => {
  Cypress.Cookies.preserveOnce('ckan');
});

describe('Resource Page -- URL', () => {
  it('Submit Additional Metadata works', () => {
    cy.requiredMetadata();
    cy.wait(5000);
    cy.additionalMetadata();
    cy.wait(5000);
    cy.get('label[for=url]').click();
    cy.get('input[name=url]').type(chance.url());
    cy.get('input[name=name]').type(chance.word());
    cy.get('textarea[name=description]').type(chance.sentence({ words: 10 }));
    cy.get('select[name=mimetype]').select('Type 1');
    cy.get('input[name=format]').type(chance.word());
    cy.get('button[type=submit]').click();
    cy.wait(5000);
    cy.visit('/dataset');
    cy.get('.dataset-list .dataset-item:first-child .dataset-content h3 > a').click();
    cy.get('.resource-list').find('.resource-item').should('have.length', 1);
  });
});
