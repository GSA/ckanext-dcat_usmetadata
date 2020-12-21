const name = 'test-editing';

before(() => {
  cy.login();
  cy.createOrg();
  cy.visit('/dataset/new-metadata');
  cy.requiredMetadata(name);
});

after(() => {
  cy.request('POST', '/api/3/action/dataset_purge', { id: name });
});

describe('Editing an existing dataset', () => {
  it('Loads required metadata values into the form', () => {
    // Wait for list of organizations to be fetched:
    cy.intercept('/api/3/action/organization_list_for_user').as('listOfOrgs');
    cy.visit('/dataset/edit-new/' + name);
    cy.wait('@listOfOrgs');
    cy.contains('Required Metadata');
    cy.get('input[name=title]').invoke('val').should('eq', name);
    cy.get('.dataset_url').contains(name);
    cy.get('textarea[name=description]').should('not.be.empty');
    cy.get('.react-tags').contains('1234');
    cy.get('select[name=owner_org]').find(':selected').invoke('text').should('eq', 'test-123');
    cy.get('input[placeholder="Select publisher"]').should('have.value', 'Data.gov');
    cy.get('input[name=contact_name]').invoke('val').should('not.be.empty');
    cy.get('input[name=contact_email]')
      .invoke('val')
      .should(
        'match',
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
    cy.get('input[name=unique_id]').invoke('val').should('not.be.empty');
    cy.get('select[name=public_access_level]').invoke('val').should('eq', 'public');
    cy.get('select[name=license]').invoke('val').should('eq', 'other');
    cy.get('input[name=licenseOther]')
      .invoke('val')
      .should('match', /^(http|https):\/\//);
    cy.get('#rights_option_1').should('have.attr', 'checked');
    cy.get('#spatial_option_2').should('have.value', 'true');
    cy.get('input[name=spatial_location_desc]').invoke('val').should('not.be.empty');
    cy.get('#temporal_option_2').should('have.value', 'true');
    cy.get('input[name=temporal_start_date]').invoke('val').should('eq', '2010-11-11');
    cy.get('input[name=temporal_end_date]').invoke('val').should('eq', '2020-11-11');
  });
});
