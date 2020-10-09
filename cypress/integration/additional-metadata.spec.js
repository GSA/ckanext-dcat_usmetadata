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
  it('Validates and submits Additional Metadata succesfully', () => {
    cy.requiredMetadata();
    cy.wait(5000);
    cy.get('input[name=data_dictionary]').type('www.invalid.url');
    cy.get('input[name=homepage_url]').type('www.invalid.url');
    cy.get('button[type=button]').contains('Save and Continue').click();
    cy.get('h3.usa-alert__heading').contains('This form contains invalid entries');
    cy.get('.usa-alert__text').contains('data_dictionary must be a valid URL');
    cy.get('.usa-alert__text').contains('homepage_url must be a valid URL');
    cy.additionalMetadata();
    cy.get('button[type=button]').contains('Save and Continue').click();
    cy.wait(5000);
    cy.contains('You can add the URL of the dataset where it is available on the agency website.');
  });
});

// describe('Parent Dataset', () => {
//   it('Able to select', () => {
//     const title = chance.word({ length: 5 });
//     cy.login();
//     cy.visit('/dataset/new-metadata');
//     cy.requiredMetadata(title);
//     cy.wait(3000);
//     cy.additionalMetadata();
//     cy.get('button[type=button]').contains('Save and Continue').click();
//     cy.wait(3000);
//     cy.resourceUploadWithUrlAndPublish();

//     cy.visit('/dataset/new-metadata');
//     cy.requiredMetadata();
//     cy.wait(3000);
//     cy.get('.react-autosuggest__container input').type(title);
//     cy.wait(3000);
//     cy.get('.react-autosuggest__suggestion--first').click();
//     cy.additionalMetadata();
//   });
// });
