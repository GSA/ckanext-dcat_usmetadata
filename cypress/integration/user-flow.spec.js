import Chance from 'chance';
const chance = new Chance();

describe('Access to the new metadata app', () => {
  it('Goes to new metadata app when I click on "Add Dataset"', () => {
    cy.login();
    cy.visit('/dataset');
    cy.get('.page_primary_action > .btn').click();
    cy.get('.navsec').contains('Required Metadata');
  });

  it('Returns 403 if not authorized', () => {
    cy.logout();
    cy.visit('/dataset/new-metadata', {failOnStatusCode: false});
    cy.get('.navsec').should('not.exist');
  })
});
