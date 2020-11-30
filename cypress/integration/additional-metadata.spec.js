import Chance from 'chance';
const chance = new Chance();

before(() => {
  cy.login();
  cy.createOrg();
});

beforeEach(() => {
  cy.logout();
  cy.login();
  cy.visit('/dataset/new-metadata');
});

describe('Additional Metadata Page', () => {
  it('Validates and submits Additional Metadata succesfully', () => {
    cy.requiredMetadata();
    cy.get('input[name=data_dictionary]').type('www.invalid.url');
    cy.get('input[name=homepage_url]').type('www.invalid.url');
    cy.get('button[type=button]').contains('Save and Continue').click();
    cy.get('h3.usa-alert__heading').contains('This form contains invalid entries');
    cy.get('.usa-alert__text').contains('data_dictionary must be a valid URL');
    cy.get('.usa-alert__text').contains('homepage_url must be a valid URL');
    cy.additionalMetadata();
    cy.get('button[type=button]')
      .contains('Save and Continue')
      .click()
      .then(() => {
        cy.contains(
          'You can add the URL of the dataset where it is available on the agency website.'
        );
      });
  });

  it('Goes back to previous page', () => {
    cy.requiredMetadata();
    cy.get('button[type=button]')
      .contains('Back to previous page')
      .click()
      .then(() => {
        cy.contains('The following fields are required metadata');
      });
  });
});

describe('Parent Dataset', () => {
  it('Able to select', () => {
    const title = chance.word({ length: 5 });

    cy.requiredMetadata(title);
    cy.additionalMetadata();
    cy.get('button[type=button]').contains('Save and Continue').click();
    cy.resourceUploadWithUrlAndPublish();

    cy.visit('/dataset/new-metadata');
    cy.requiredMetadata();
    cy.get('.react-autosuggest__container input').type(title);
    cy.get('.react-autosuggest__suggestion--first').click();
    cy.additionalMetadata();
    cy.get('.react-autosuggest__container input').should('have.value', title);
  });
});
