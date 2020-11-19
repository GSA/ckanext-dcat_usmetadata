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
    cy.visit('/dataset/new-metadata');
  });

  it('Has a title', () => {
    cy.contains('Required Metadata');
  });
});

describe('Required Metadata Page', () => {
  it('Radios with optional fields work as expected', () => {
    cy.get('#rights_option_1').parent('.form-group').click();
    cy.get('input[name=rights_desc]').should('be.disabled');
    cy.get('#rights_option_2').parent('.form-group').click();
    cy.get('input[name=rights_desc]').should('be.enabled');
  });

  it('Select with optional fields work', () => {
    cy.get('select[name=license]').select('MIT');
    cy.get('input[name=licenseOther]').should('be.disabled');
    cy.get('select[name=license]').select('Other');
    cy.get('input[name=licenseOther]').should('be.enabled');
    cy.get('select[name=modified]').select('Custom');
    cy.get('input[name=modifiedOther]').should('be.enabled');
    cy.get('select[name=modified]').select('Yearly');
    cy.get('input[name=modifiedOther]').should('be.disabled');
  });

  it('Form validation works', () => {
    cy.get('button[type=button]').contains('Save and Continue').click();
    cy.contains('This form contains invalid entries');
    cy.contains('Description is required');
  });

  it('Submit Required Metadata works', () => {
    cy.requiredMetadata();
    cy.wait(5000);
    cy.contains('Dataset saved successfully');
  });

  it('Able to add new tag without hiting Enter or Tab', () => {
    const tagName = 'tag0123';
    cy.login();
    cy.visit('/dataset/new-metadata');
    cy.get('input[name=title]').type('A title for tag tab test1');
    cy.get('textarea[name=description]').type('description');
    cy.get('.react-tags input').type(tagName);
    cy.get('select[name=owner_org]').select('test-123');
    cy.get('select[name=publisher]').select('Other');
    cy.get('input[name=publisher_other]').type('Other publisher');
    cy.get('input[name=subagency]').type('Sub Agency 1');
    cy.get('input[name=contact_name]').type('Person');
    cy.get('input[name=contact_email]').type('person@mail.com');
    cy.get('input[name=unique_id]').type('unique id');
    cy.get('select[name=public_access_level]').select('public');
    cy.get('select[name=license]').select('MIT');
    cy.get('select[name=modified]').select('Yearly');
    cy.get('button[type=button]')
      .contains('Save and Continue')
      .click()
      .then(() => {
        cy.visit('/dataset/a-title-for-tag-tab-test1');
        cy.contains(tagName);
      });
  });

  it('Edit dataset URL works', () => {
    cy.login();
    cy.visit('/dataset/new-metadata');
    cy.get('input[name=title]').type('my default title');
    cy.get('button.dataset_url_edit').click();
    cy.get('input[name=url]').type('-edited');
    cy.get('textarea[name=description]').type('description');
    cy.get('.react-tags input').type('1234{enter}');
    cy.get('select[name=owner_org]').select('test-123');
    cy.get('select[name=publisher]').select('Other');
    cy.get('input[name=publisher_other]').type('Other publisher');
    cy.get('input[name=subagency]').type('Sub Agency 1');
    cy.get('input[name=contact_name]').type('Person');
    cy.get('input[name=contact_email]').type('person@mail.com');
    cy.get('input[name=unique_id]').type('unique id');
    cy.get('select[name=public_access_level]').select('public');
    cy.get('select[name=license]').select('MIT');
    cy.get('select[name=modified]').select('Yearly');
    cy.get('button[type=button]')
      .contains('Save and Continue')
      .click()
      .then(() => {
        cy.visit('/dataset/my-default-title-edited');
        cy.contains('my default title');
      });
  });

  it('Organization is pre-selected in the dropdown if the form is loaded from organization page', () => {
    cy.login();
    cy.visit('/organization/test-123');
    cy.get('.page_primary_action > .btn.btn-primary').click();
    // wait until the organization list will be loaded
    cy.wait(3000);
    cy.get('select[name=owner_org]').find(':selected').contains('test-123');
  });
});

describe('Required Metadata Page errors', () => {
  it('Displays clear error message when fails to create dataset due to validation error', () => {
    const title = 'this dataset should already exist';
    cy.login();
    cy.visit('/dataset/new-metadata');
    cy.requiredMetadata(title);
    cy.wait(5000);
    cy.contains('Dataset saved successfully');
    cy.visit('/dataset/new-metadata');
    cy.requiredMetadata(title);
    cy.wait(3000);
    cy.contains('That URL is already in use.');
  });
});
