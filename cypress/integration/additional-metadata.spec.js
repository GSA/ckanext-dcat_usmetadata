import Chance from 'chance';
const chance = new Chance();

describe('Additional Metadata Page', () => {
  before(() => {
    cy.login();
    cy.deleteDataset('aaaaa');
    cy.deleteDataset('bbbbb');
    cy.deleteDataset('ccccc');
    cy.deleteDataset('ddddd');
    cy.deleteOrg('test-organization');
    cy.createOrg('test-organization', 'sample organization');
  });

  beforeEach(() => {
    cy.logout();
    cy.login();
    cy.visit('/dataset/new-metadata');
  });

  after(() => {
    cy.deleteDataset('aaaaa');
    cy.deleteDataset('bbbbb');
    cy.deleteDataset('ccccc');
    cy.deleteDataset('ddddd');
    cy.deleteOrg('test-organization');
  });

  it('Validates and submits Additional Metadata succesfully', () => {
    cy.requiredMetadata('aaaaa');
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

  it('Accrual Periodicity validation works ISO 8601 value', () => {
    cy.requiredMetadata('bbbbb');
    cy.get('select[name=accrualPeriodicity]').select('Other');
    cy.get('input[name=accrualPeriodicityOther]').should('be.enabled');
    cy.get('select[name=accrualPeriodicity]').select('Daily');
    cy.get('input[name=accrualPeriodicityOther]').should('be.disabled');
    cy.get('select[name=accrualPeriodicity]').select('Other');
    cy.get('input[name=accrualPeriodicityOther]').type('monthly');
    cy.get('button[type=button]').contains('Save and Continue').click();
    cy.contains('This form contains invalid entries');
    cy.contains('Data Publishing Frequency should be formatted as a proper ISO 8601 timestamp');
  });

  it('Radio field geospatial dataset works', () => {
    cy.requiredMetadata('ccccc');
    cy.get('#category-option-yes').parent('.form-group').click();
    cy.intercept('/api/3/action/package_update').as('packageUpdate');
    cy.get('button[type=button]').contains('Save and Continue').click();
    cy.wait('@packageUpdate');
    cy.get('button[type=button]').contains('Finish and publish').click();
    cy.contains('Theme (Category)');
    cy.contains('geospatial');
  });

  it('Goes back to previous page', () => {
    cy.requiredMetadata('ddddd');
    cy.get('button[type=button]')
      .contains('Back to previous page')
      .click()
      .then(() => {
        cy.contains('The following fields are required metadata');
      });
  });
});

describe('Parent Dataset', () => {
  const parentTitle = 'eeeee';
  const childTitle = 'eeeef';

  before(() => {
    cy.logout();
    cy.login();
    cy.deleteDataset(parentTitle);
    cy.deleteDataset(childTitle);
    cy.deleteOrg('test-organization');
    cy.createOrg('test-organization', 'sample organization');
    cy.visit('/dataset/new-metadata');
    cy.requiredMetadata(parentTitle);
    cy.additionalMetadata(true);
    cy.intercept('/api/3/action/package_update').as('packageUpdate');
    cy.get('button[type=button]').contains('Save and Continue').click();
    cy.wait('@packageUpdate');
    cy.resourceUploadWithUrlAndPublish();
  });

  beforeEach(() => {
    cy.logout();
    cy.login();
    cy.visit('/dataset/new-metadata');
  });

  after(() => {
    cy.deleteDataset(parentTitle);
    cy.deleteDataset(childTitle);
    cy.deleteOrg('test-organization');
  });

  it(
    'Able to select and displays parent dataset with a human-readable title',
    { requestTimeout: 20000 },
    () => {
      cy.visit('/dataset/new-metadata');
      cy.requiredMetadata(childTitle);
      cy.get('.react-autosuggest__container input').type(parentTitle);
      cy.get('.react-autosuggest__suggestion--first').click();
      cy.get('.react-autosuggest__container input').should('have.value', parentTitle);
      cy.intercept('/api/3/action/package_update').as('packageUpdate');
      cy.get('button[type=button]').contains('Save and Continue').click();
      cy.wait('@packageUpdate');
      cy.intercept('/api/3/action/package_patch').as('packagePatch');
      cy.resourceUploadWithUrlAndPublish();
      cy.wait('@packagePatch');
      // Go to edit mode and check if parent dataset title is displayed
      cy.visit('/dataset/edit-new/' + childTitle);
      cy.get('[role="link"]').contains('Additional Metadata').click();
      cy.get('.react-autosuggest__container input').should('have.value', parentTitle);
    }
  );
});

describe('Save draft functionality on Additional Metadata page', () => {
  before(() => {
    cy.login();
    cy.deleteDataset('fffff');
    cy.deleteOrg('test-organization');
    cy.createOrg('test-organization', 'sample organization');
  });

  beforeEach(() => {
    cy.logout();
    cy.login();
    cy.visit('/dataset/new-metadata');
  });

  after(() => {
    cy.deleteDataset('fffff');
    cy.deleteOrg('test-organization');
  });

  it('Saves dataset using "Save draft" button', () => {
    cy.requiredMetadata('fffff');
    cy.get('.usa-button--outline').contains('Save draft').click();
    cy.contains('Draft saved');

    cy.get('select[name=dataQuality]').select('Yes');
    cy.get('.usa-button--outline').contains('Save draft').click();
    cy.contains('Draft saved');
  });
});
