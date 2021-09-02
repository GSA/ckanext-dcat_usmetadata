import Chance from 'chance';
const chance = new Chance();

describe('Access to the new metadata app', () => {
  after(() => {
    cy.deleteDataset('test-dataset-1');
    cy.logout();
  });

  it('Goes to new metadata app when I click on "Add Dataset"', () => {
    cy.login();
    cy.visit('/dataset');
    cy.get('.page_primary_action > .btn').click();
    cy.get('.navsec').contains('Required Metadata');
    // From organization page:
    cy.deleteDataset('test-dataset-1');
    cy.deleteOrg('test-organization');
    cy.createOrg('test-organization', 'sample organization');
    cy.visit('/organization/test-organization');
    cy.get('.page_primary_action > .btn-primary').first().click();
    cy.location('pathname', { timeout: 10000 }).should('include', '/dataset/new-metadata');
    cy.get('.navsec').contains('Required Metadata');
  });

  it('Has "Edit" button and it goes to new metadata app when clicked', () => {
    cy.login();
    cy.visit('/dataset/new-metadata');
    cy.requiredMetadata('test-dataset-1');
    cy.visit('/dataset/test-dataset-1');
    cy.get('.content_action > .btn-primary').contains('Edit').click({ force: true });
    cy.location('pathname', { timeout: 10000 }).should('include', '/dataset/edit-new/');
    cy.get('.navsec').contains('Required Metadata');
  });

  it('Does not expose API key in the HTML', () => {
    cy.login();
    cy.visit('/dataset/new-metadata');
    cy.get('#root').should('have.attr', 'data-apiUrl');
    cy.get('#root').should('not.have.attr', 'data-apiKey');
  });

  it('Returns 403 if not authorized', () => {
    cy.logout();
    cy.visit('/dataset/new-metadata', { failOnStatusCode: false });
    cy.get('.navsec').should('not.exist');
    cy.contains('Unauthorized to create a package');
    // Same for edit dataset page
    cy.visit('/dataset/edit-new/dataset-id', { failOnStatusCode: false });
    cy.get('.navsec').should('not.exist');
    cy.contains('Dataset not found');
  });

  it('Returns 404 when trying to edit non-existing dataset', () => {
    cy.login();
    cy.visit('/dataset/edit-new/dataset-id', { failOnStatusCode: false });
    cy.url().should('include', '/dataset/edit-new/dataset-id');
    cy.contains('Dataset not found');
  });
});

describe('Deleting a dataset', () => {
  before(() => {
    cy.login();
    cy.deleteDataset('test-dataset-1');
    cy.deleteOrg('test-organization');
    cy.createOrg('test-organization', 'sample organization');
  });

  afterEach(() => {
    cy.deleteDataset('test-dataset-1');
  });

  it('Has "Delete" button', () => {
    cy.visit('/dataset/new-metadata');
    cy.requiredMetadata('test-dataset-1');
    cy.visit('/dataset/test-dataset-1');
    cy.get('.btn-danger').should('exist').contains('Delete');
  });

  it('Displays confirmation page when clicked', () => {
    cy.login();
    cy.visit('/dataset/new-metadata');
    cy.requiredMetadata('test-dataset-1');
    cy.visit('/dataset/test-dataset-1');
    cy.get('.btn-danger').click({ force: true });
    cy.contains('Are you sure you want to delete dataset -');
  });
});

describe('List of organizations on new metadata form', () => {
  before(() => {
    cy.createUser('editor');
    cy.login();
    cy.visit('/organization/member_new/test-organization');
    cy.get('input[name=username]').type('editor', { force: true });
    cy.get('select[name=role]').select('Editor', { force: true });
    cy.get('button[name=submit]').click({ force: true });
    cy.wait(2000);
  });

  after(() => {
    cy.deleteDataset('test-dataset-1');
    cy.logout();
  });

  it('Displays expected organizations for the editor role', () => {
    cy.logout();
    cy.visit('/user/login');
    cy.get('input[name=login]').type('editor');
    cy.get('input[name=password]').type('test1234');
    cy.get('.form-actions > .btn').click({ force: true });
    cy.wait(2000);
    cy.visit('/dataset');
    cy.get('.page_primary_action > .btn').click();
    cy.get('.navsec').contains('Required Metadata');
    cy.get('select[name=owner_org]')
      .select('test-organization')
      .should('contain.text', 'test-organization');
  });
});

describe('Go back to dashboard page', () => {
  before(() => {
    cy.login();
    cy.deleteOrg('test-organization');
    cy.createOrg('test-organization', 'sample organization');
  });

  beforeEach(() => {
    cy.logout();
    cy.login();
  });

  after(() => {
    cy.deleteDataset('fffff');
    cy.deleteDataset('test-dataset-1');
    cy.logout();
  });

  it('Goes to /dataset page on "Back to dashboard" clicked', () => {
    cy.visit('/dataset/new-metadata');
    cy.contains('Back to dashboard').click();
    cy.url().should('include', '/dataset'); // Ensure the URL is correct
    cy.contains('Add Dataset'); // Ensure the Add Dataset button exists
  });

  it('Goes to /organization/<organization-name> page on "Back to dashboard" clicked', () => {
    cy.visit('/organization/test-organization');
    cy.get('.page_primary_action > .btn.btn-primary').first().click();

    cy.contains('Back to dashboard').click();
    cy.url().should('include', '/organization'); // Ensure the URL is correct
    cy.contains('Add Dataset'); // Ensure the Add Dataset button exists
  });

  it('Back button is above each headline', () => {
    cy.visit('/dataset/new-metadata');
    cy.contains('Back to dashboard');

    cy.requiredMetadata('fffff');
    cy.contains('Back to dashboard');

    cy.additionalMetadata();
    cy.contains('Back to dashboard');
  });
});
