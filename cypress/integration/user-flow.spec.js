import Chance from 'chance';
const chance = new Chance();

describe('Access to the new metadata app', () => {
  it('Goes to new metadata app when I click on "Add Dataset"', () => {
    cy.login();
    cy.visit('/dataset');
    cy.get('.page_primary_action > .btn').click();
    cy.get('.navsec').contains('Required Metadata');
    // From organization page:
    cy.createOrg();
    cy.visit('/organization/test-123');
    cy.get('.page_primary_action > .btn-primary').first().click();
    cy.get('.navsec').contains('Required Metadata');
  });

  it('Has "Edit" button and it goes to new metadata app when clicked', () => {
    cy.login();
    cy.visit('/dataset/test-dataset-1');
    cy.get('.content_action > .btn-primary').contains('Edit').click();
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
    cy.url().should('include', '/user/login');
    cy.url().should('include', 'came_from=%2Fdataset%2Fnew-metadata');
    // Same for edit dataset page
    cy.visit('/dataset/edit-new/dataset-id', { failOnStatusCode: false });
    cy.get('.navsec').should('not.exist');
    cy.url().should('include', '/user/login');
    cy.url().should('include', 'came_from=%2Fdataset%2Fedit-new%2Fdataset-id');
  });

  it('Returns 404 when trying to edit non-existing dataset', () => {
    cy.login();
    cy.visit('/dataset/edit-new/dataset-id', { failOnStatusCode: false });
    cy.url().should('include', '/dataset/edit-new/dataset-id');
    cy.contains('404 Not Found');
  });
});

describe('Deleting a dataset', () => {
  it('Has "Delete" button', () => {
    cy.login();
    cy.visit('/dataset/test-dataset-1');
    cy.get('.btn-danger').should('exist').contains('Delete');
  });

  it('Displays confirmation page when clicked', () => {
    cy.login();
    cy.visit('/dataset/test-dataset-1');
    cy.get('.btn-danger').click();
    cy.contains('Are you sure you want to delete dataset - test-dataset-1?');
    cy.get('.btn-primary').contains('Confirm Delete');
  });
});

describe('List of organizations on new metadata form', () => {
  before(() => {
    cy.createUser('editor');
    cy.login();
    cy.visit('/organization/member_new/test-123');
    cy.get('input[name=username]').type('editor', { force: true });
    cy.get('select[name=role]').select('Editor', { force: true });
    cy.get('button[name=submit]').click({ force: true });
    cy.wait(2000);
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
    cy.get('select[name=owner_org]').select('test-123').should('contain.text', 'test-123');
  });
});

describe('Go back to dashboard page', () => {
  before(() => {
    cy.login();
    cy.createOrg();
  });

  beforeEach(() => {
    cy.logout();
    cy.login();
  });

  it('Goes to /dataset page on "Back to dashboard" clicked', () => {
    cy.visit('/dataset/new-metadata');
    cy.contains('Back to dashboard').click();
    cy.url().should('include', '/dataset'); // Ensure the URL is correct
    cy.contains('Add Dataset'); // Ensure the Add Dataset button exists
  });

  it('Goes to /organization/<organization-name> page on "Back to dashboard" clicked', () => {
    cy.visit('/organization/test-123');
    cy.get('.page_primary_action > .btn.btn-primary').first().click();

    cy.contains('Back to dashboard').click();
    cy.url().should('include', '/organization'); // Ensure the URL is correct
    cy.contains('Add Dataset'); // Ensure the Add Dataset button exists
  });

  it('Back button is above each headline', () => {
    cy.visit('/dataset/new-metadata');
    cy.contains('Back to dashboard');

    cy.requiredMetadata();
    cy.contains('Back to dashboard');

    cy.additionalMetadata();
    cy.contains('Back to dashboard');
  });

  after(() => {
    cy.logout();
  });
});
