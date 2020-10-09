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
    cy.wait(5000);
    cy.contains('Resource Upload');
  });

  it('Test parent dataset', () => {
    const parentTitle = chance.word({ length: 5 });
    cy.requiredMetadata(parentTitle);
    cy.wait(5000);
    cy.get('select[name=isParent]').select('Yes');
    cy.additionalMetadata();
    cy.resourceUploadWithUrlAndPublish();
    cy.wait(10000);

    cy.requiredMetadata();
    cy.wait(5000);
    cy.get('.react-autosuggest__container input').type(parentTitle);
    cy.wait(5000);
    cy.get('.react-autosuggest__suggestion--first').click();
    cy.additionalMetadata();
    cy.wait(10000);
    cy.contains('Resource Upload');
  });
});
