import Chance from 'chance';
const chance = new Chance();

before(() => {
  cy.login();
  cy.createOrg();
  cy.visit('/dataset/new-metadata');
});

beforeEach(() => {
  cy.logout();
  cy.login();
});

describe('DCAT Metadata App', () => {
  it('Loads and has an expected title', () => {
    cy.visit('/dataset/new-metadata');
    cy.contains('Required Metadata');
  });
});

describe('Required Metadata Page', () => {
  it('Radios with optional fields work as expected', () => {
    cy.visit('/dataset/new-metadata');
    cy.get('#rights_option_1').parent('.form-group').click();
    cy.get('input[name=rights_desc]').should('be.disabled');
    cy.get('#rights_option_2').parent('.form-group').click();
    cy.get('input[name=rights_desc]').should('be.enabled');
  });

  it('Select with optional fields work', () => {
    cy.visit('/dataset/new-metadata');
    cy.get('select[name=license]').select('MIT');
    cy.get('input[name=licenseOther]').should('be.disabled');
    cy.get('select[name=license]').select('Other');
    cy.get('input[name=licenseOther]').should('be.enabled');
  });

  it('Form validation works', () => {
    cy.visit('/dataset/new-metadata');
    cy.get('button[type=button]').contains('Save and Continue').click();
    cy.contains('This form contains invalid entries');
    cy.contains('Description is required');
  });

  it('Submit Required Metadata works', () => {
    cy.visit('/dataset/new-metadata');
    cy.requiredMetadata();
    cy.contains('Dataset saved successfully');
  });

  it('Populate publisher hierarchy from single publisher', () => {
    cy.visit('/dataset/new-metadata');
    cy.get('input[name=title]').type('A title for publisher hierarchy test');
    cy.get('textarea[name=description]').type('description');
    cy.get('.react-tags input').type('tag');
    cy.get('select[name=owner_org]').select('test-123');
    cy.get('input[placeholder="Select publisher"]').type('Data.gov');
    cy.get('input[placeholder="Select publisher"]').type('{downarrow}{enter}');
    cy.get('input[name=contact_name]').type('Person');
    cy.get('input[name=contact_email]').type('person@mail.com');
    cy.get('input[name=unique_id]').type('unique-id-for-publisher-hierarchy-test');
    cy.get('select[name=public_access_level]').select('public');
    cy.get('select[name=license]').select('MIT');

    cy.get('button[type=button]').contains('Save and Continue').click();
    cy.additionalMetadata();
    cy.get('button[type=button]').contains('Save and Continue').click();
    cy.resourceUploadWithUrlAndPublish();
    cy.contains('General Services Administration');
    cy.contains('Technology Transformation Service');
    cy.contains('Data.gov');
  });

  it('Able to add new tag without hiting Enter or Tab', () => {
    const tagName = 'tag0123';
    cy.visit('/dataset/new-metadata');
    cy.get('input[name=title]').type('A title for tag tab test1');
    cy.get('textarea[name=description]').type('description');
    cy.get('.react-tags input').type(tagName);
    cy.get('select[name=owner_org]').select('test-123');
    cy.get('input[placeholder="Select publisher"]').type('Data.gov');
    cy.get('input[placeholder="Select publisher"]').type('{downarrow}{enter}');
    cy.get('input[name=contact_name]').type('Person');
    cy.get('input[name=contact_email]').type('person@mail.com');
    cy.get('input[name=unique_id]').type('unique id');
    cy.get('select[name=public_access_level]').select('public');
    cy.get('select[name=license]').select('MIT');
    cy.get('button[type=button]')
      .contains('Save and Continue')
      .click()
      .then(() => {
        const name = 'a-title-for-tag-tab-test1';
        cy.visit(`/dataset/${name}`);
        cy.contains(tagName);
        cy.request('POST', '/api/3/action/dataset_purge', { id: name });
      });
  });

  it('Edit dataset URL works', () => {
    cy.visit('/dataset/new-metadata');
    cy.get('input[name=title]').type('my default title');
    cy.get('button.dataset_url_edit').click();
    cy.get('input[name=url]').type('-edited');
    cy.get('textarea[name=description]').type('description');
    cy.get('.react-tags input').type('1234{enter}');
    cy.get('select[name=owner_org]').select('test-123');
    cy.get('input[placeholder="Select publisher"]').type('Data.gov');
    cy.get('input[placeholder="Select publisher"]').type('{downarrow}{enter}');
    cy.get('input[name=contact_name]').type('Person');
    cy.get('input[name=contact_email]').type('person@mail.com');
    cy.get('input[name=unique_id]').type('unique id');
    cy.get('select[name=public_access_level]').select('public');
    cy.get('select[name=license]').select('MIT');
    cy.get('button[type=button]')
      .contains('Save and Continue')
      .click()
      .then(() => {
        const name = 'my-default-title-edited';
        cy.visit(`/dataset/${name}`);
        cy.contains('my default title');
        cy.request('POST', '/api/3/action/dataset_purge', { id: name });
      });
  });

  it('Organization is pre-selected in the dropdown if the form is loaded from organization page', () => {
    cy.visit('/organization/test-123');
    cy.get('.page_primary_action > .btn.btn-primary').first().click();
    // wait until the organization list will be loaded
    cy.wait(3000);
    cy.get('select[name=owner_org]').find(':selected').contains('test-123');
  });

  it('Organization is pre-selected in the dropdown if it that organization is the only one', () => {
    const username = 'editor-only-in-one-organization';
    cy.createUser(username);
    cy.login();
    cy.visit('/organization/member_new/test-123');
    cy.get('input[name=username]').type(username, { force: true });
    cy.get('select[name=role]').select('Editor', { force: true });
    cy.get('button[name=submit]').click({ force: true });
    cy.wait(2000);

    cy.logout();
    cy.login(username, 'test1234');

    cy.visit('/dataset');
    cy.get('.page_primary_action > .btn').click();
    cy.wait(3000);
    cy.get('select[name=owner_org]').find(':selected').contains('test-123');
  });
});

describe('Required Metadata Page errors', () => {
  it('Displays clear error message when fails to create dataset due to validation error', () => {
    const title = 'this dataset should already exist';
    cy.visit('/dataset/new-metadata');
    cy.requiredMetadata(title);
    cy.contains('Dataset saved successfully');
    cy.visit('/dataset/new-metadata');
    cy.requiredMetadata(title);
    cy.contains('That URL is already in use.');
    cy.request('POST', '/api/3/action/dataset_purge', { id: 'this-dataset-should-already-exist' });
  });
});
