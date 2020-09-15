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

describe('DCAT Metadata App', () => {
  it('Loads', () => {
    cy.visit('/dataset/new-metadata?group=test-123');
  });

  it('Has a title', () => {
    cy.contains('Required Metadata');
  });
});

describe('Required Metadata Page', () => {
  it('Radios with optional fields work as expected', () => {
    cy.get('#rights_option_1')
      .parent('.form-group')
      .click();
    cy.get('input[name=rights_desc]').should('be.disabled');
    cy.get('#rights_option_2')
      .parent('.form-group')
      .click();
    cy.get('input[name=rights_desc]').should('be.enabled');
  });

  it('Select with optional fields work', () => {
    cy.get('select[name=license]').select('MIT');
    cy.get('input[name=license_others]').should('be.disabled');
    cy.get('select[name=license]').select('Others');
    cy.get('input[name=license_others]').should('be.enabled');
  });

  it('Form validation works', () => {
    cy.get('button[type=submit').click();
    cy.contains('This form contains invalid entries');
    cy.contains('Description is required');
  })

  it('Submit Required Metadata works', () => {
    cy.requiredMetadata();
    cy.wait(10000);
    cy.contains('Dataset saved successfully');
  });
});
