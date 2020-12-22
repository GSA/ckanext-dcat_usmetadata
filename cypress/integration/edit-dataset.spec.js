const name = 'test-editing';

before(() => {
  cy.login();
  cy.createOrg();
  cy.visit('/dataset/new-metadata');
  cy.requiredMetadata(name);
  cy.additionalMetadata();
  // Set 'isParent' to "Yes" to confirm if values are saved correctly as by default
  // it is set to "No".
  cy.get('select[name=isParent]').select('Yes');
  cy.get('button[type=button]').contains('Save and Continue').click();
  cy.intercept('/api/3/action/package_patch').as('packagePatch');
  cy.resourceUploadWithUrlAndPublish();
  cy.wait('@packagePatch');
});

beforeEach(() => {
  cy.logout();
  cy.login();
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

  it('Loads additional metadata values into the form', () => {
    // Wait for list of organizations to be fetched:
    cy.intercept('/api/3/action/organization_list_for_user').as('listOfOrgs');
    cy.visit('/dataset/edit-new/' + name);
    cy.wait('@listOfOrgs');
    cy.get('[role="link"]').contains('Additional Metadata').click();
    cy.get('select[name=dataQuality]').invoke('val').should('eq', 'Yes');
    cy.get('input[name=category]').invoke('val').should('not.be.empty');
    cy.get('input[name=data_dictionary]')
      .invoke('val')
      .should('match', /^(http|https):\/\//);
    cy.get('select[name=describedByType]').invoke('val').should('eq', 'text/csv');
    cy.get('select[name=accrualPeriodicity]').invoke('val').should('eq', 'R/P7D');
    cy.get('input[name=homepage_url]')
      .invoke('val')
      .should('match', /^(http|https):\/\//);
    cy.get('select[name=languageSubTag]').invoke('val').should('eq', 'en');
    cy.get('select[name=languageRegSubTag]').invoke('val').should('eq', 'US');
    cy.get('input[name=primary_it_investment_uii]').invoke('val').should('not.be.empty');
    cy.get('input[name=related_documents]').invoke('val').should('not.be.empty');
    cy.get('input[name=release_date]').invoke('val').should('eq', '2020-08-08');
    cy.get('input[name=system_of_records]')
      .invoke('val')
      .should('match', /^(http|https):\/\//);
    cy.get('select[name=isParent]').invoke('val').should('eq', 'Yes');
  });
});
