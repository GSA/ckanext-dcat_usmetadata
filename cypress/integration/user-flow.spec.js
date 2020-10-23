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

  it('Returns 403 if not authorized', () => {
    cy.logout();
    cy.visit('/dataset/new-metadata', {failOnStatusCode: false});
    cy.get('.navsec').should('not.exist');
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
    cy.get('select[name=owner_org]').select('test-123')
      .should('contain.text', 'test-123');
  })
})
