describe('Organization Page', () => {
  before(() => {
    cy.login();
    cy.deleteDataset(name);
    cy.deleteOrg('test-organization');
    cy.createOrg('test-organization');
  });

  after(() => {
    cy.deleteOrg('test-organization');
  });

  it('Has only one Add Dataset Button', () => {
    cy.login();
    cy.visit('/organization/test-organization');
    cy.get('.page_primary_action')
      .find('>a.btn-primary')
      .eq(0)
      .should('not.have.css', 'display', 'none');
    cy.get('.page_primary_action')
      .find('>a.btn-primary')
      .eq(1)
      .should('have.css', 'display', 'none');
  });
});
