const name = 'test-editing';

const resourceToBeEdited = 'resource-to-be-edited';
const resourceToBeDeleted = 'resource-to-be-deleted';

describe('Editing an existing dataset', () => {
  before(() => {
    cy.login();
    cy.deleteDataset(name);
    cy.deleteOrg('test-organization');
    cy.createOrg('test-organization');
    cy.visit('/dataset/new-metadata');
    cy.requiredMetadata(name);
    cy.additionalMetadata(true);

    // Use custom value for "Data Publishing Frequency" field
    cy.get('select[name=accrualPeriodicity]').select('other');
    cy.get('input[name=accrualPeriodicityOther]').type('P1Y30DT15M39S');

    // Use custom value for "Data Dictionary Type" field
    cy.get('select[name=describedByType]').select('other');
    cy.get('input[name=otherDataDictionaryType]').type('something/else');

    cy.get('button[type=button]').contains('Save and Continue').click();
    cy.intercept('/api/3/action/package_patch').as('packagePatch');
    cy.intercept('/api/3/action/resource_create').as('resourceSaved');
    cy.resourceUploadWithUrlAndSave(null, resourceToBeDeleted);
    cy.wait('@resourceSaved');
    cy.resourceUploadWithUrlAndPublish(null, resourceToBeEdited);
    cy.wait('@packagePatch');
  });

  beforeEach(() => {
    cy.logout();
    cy.login();
    // Wait for list of organizations to be fetched:
    cy.intercept('/api/3/action/organization_list_for_user').as('listOfOrgs');
    cy.visit('/dataset/edit-new/' + name);
    cy.wait('@listOfOrgs');
  });

  after(() => {
    cy.deleteDataset(name);
  });

  it('Loads required metadata values into the form', () => {
    cy.contains('Required Metadata');
    cy.get('input[name=title]').invoke('val').should('eq', name);
    cy.get('.dataset_url').contains(name);
    cy.get('textarea[name=description]').should('not.be.empty');
    cy.get('.react-tags').contains('1234');
    cy.get('select[name=owner_org]')
      .find(':selected')
      .invoke('text')
      .should('eq', 'test-organization');
    cy.get('input[placeholder="Select publisher"]').should('have.value', 'top level publisher');
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
    cy.get('input[name=rights_desc]').should('be.disabled');
    cy.get('input[name=spatial_location_desc]').should('not.be.disabled');
    cy.get('input[name=spatial_location_desc]').invoke('val').should('not.be.empty');
    cy.get('input[name=temporal_start_date]').should('not.be.disabled');
    cy.get('input[name=temporal_start_date]').invoke('val').should('eq', '2010-11-11');
    cy.get('input[name=temporal_end_date]').should('not.be.disabled');
    cy.get('input[name=temporal_end_date]').invoke('val').should('eq', '2020-11-11');
  });

  it('Loads additional metadata values into the form', () => {
    cy.get('[role="link"]').contains('Additional Metadata').click();
    cy.get('select[name=dataQuality]').invoke('val').should('eq', 'Yes');
    cy.get('input[name=category]').invoke('val').should('not.be.empty');
    cy.get('input[name=data_dictionary]')
      .invoke('val')
      .should('match', /^(http|https):\/\//);

    cy.get('select[name=describedByType]').invoke('val').should('eq', 'other');
    cy.get('select[name=accrualPeriodicity]').invoke('val').should('eq', 'other');
    cy.get('input[name=accrualPeriodicityOther]').invoke('val').should('eq', 'R/P1Y30DT15M39S');
    cy.get('input[name=otherDataDictionaryType]').invoke('val').should('eq', 'something/else');

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

  it('Edits and saves all metadata', () => {
    const newMetadata = {
      title: 'Updated title',
      description: 'Updated description',
      tags: 'updated',
      publisher: 'top level publisher',
      contactName: 'Updated name',
      contactEmail: 'updated@mail.com',
      uniqueId: 'updated unique id',
      publicAccessLevel: 'non-public',
      license: 'https://opensource.org/licenses/MIT-0',
      rightsDesc: 'Updated rights',
      dataQuality: 'No',
      dataDictionary: 'https://www.dictionary.com',
      describedByType: 'text/tab-separated-values',
      accrualPeriodicity: 'irregular',
      homepageUrl: 'https://www.landingpage.com',
      languageSubTag: 'da',
      languageRegSubTag: 'DK',
      primaryItInvestmentUii: '111-111111111',
      relatedDocuments: 'test string',
      releaseDate: '2020-01-01',
      systemOfRecords: 'https://system_of_records.com',
      isParent: 'No',
    };
    cy.get('input[name=title]').clear().type(newMetadata.title);
    // Make sure URL hasn't been updated here:
    cy.get('.dataset_url').contains(name);
    cy.get('textarea[name=description]').clear().type(newMetadata.description);
    cy.get('.react-tags input').type(newMetadata.tags + '{enter}');
    cy.get('input[placeholder="Select publisher"]').clear().type(newMetadata.publisher);
    cy.get('input[placeholder="Select publisher"]').type('{downarrow}{enter}');
    cy.get('input[name=contact_name]').clear().type(newMetadata.contactName);
    cy.get('input[name=contact_email]').clear().type(newMetadata.contactEmail);
    cy.get('input[name=unique_id]').clear().type(newMetadata.uniqueId);
    cy.get('select[name=public_access_level]').select(newMetadata.publicAccessLevel);
    cy.get('select[name=license]').select(newMetadata.license);
    cy.get('#rights_option_2').parent('.form-group').click();
    cy.get('input[name=rights_desc]').type(newMetadata.rightsDesc);
    cy.get('#spatial_option_1').parent('.form-group').click();
    cy.get('#temporal_option_1').parent('.form-group').click();
    cy.get('button[type=button]').contains('Save and Continue').click();

    cy.get('select[name=dataQuality]').select(newMetadata.dataQuality);
    cy.get('#category-option-yes').parent('.form-group').click();
    cy.get('input[name=data_dictionary]').clear().type(newMetadata.dataDictionary);
    cy.get('select[name=describedByType]').select(newMetadata.describedByType);
    cy.get('select[name=accrualPeriodicity]').select(newMetadata.accrualPeriodicity);
    cy.get('input[name=homepage_url]').clear().type(newMetadata.homepageUrl);
    cy.get('select[name=languageSubTag]').select(newMetadata.languageSubTag);
    cy.get('select[name=languageRegSubTag]').select(newMetadata.languageRegSubTag);
    cy.get('input[name=primary_it_investment_uii]')
      .clear()
      .type(newMetadata.primaryItInvestmentUii);
    cy.get('input[name=related_documents]').clear().type(newMetadata.relatedDocuments);
    cy.get('input[name=release_date]').clear().type(newMetadata.releaseDate);
    cy.get('input[name=system_of_records]').clear().type(newMetadata.systemOfRecords);
    cy.get('select[name=isParent]').select(newMetadata.isParent);
    cy.get('button[type=button]').contains('Save and Continue').click();

    // Reload the page and wait for list of organizations to be fetched:
    cy.intercept('/api/3/action/organization_list_for_user').as('listOfOrgs');
    cy.visit('/dataset/edit-new/' + name);
    cy.wait('@listOfOrgs');
    // Now check updated values:
    cy.get('input[name=title]').invoke('val').should('eq', newMetadata.title);
    cy.get('.dataset_url').contains(name);
    cy.get('textarea[name=description]').invoke('val').should('eq', newMetadata.description);
    cy.get('.react-tags').contains(newMetadata.tags);
    cy.get('select[name=owner_org]')
      .find(':selected')
      .invoke('text')
      .should('eq', 'test-organization');
    cy.get('input[placeholder="Select publisher"]').should('have.value', newMetadata.publisher);
    cy.get('input[name=contact_name]').invoke('val').should('eq', newMetadata.contactName);
    cy.get('input[name=contact_email]').invoke('val').should('eq', newMetadata.contactEmail);
    cy.get('input[name=unique_id]').invoke('val').should('eq', newMetadata.uniqueId);
    cy.get('select[name=public_access_level]')
      .invoke('val')
      .should('eq', newMetadata.publicAccessLevel);
    cy.get('select[name=license]').invoke('val').should('eq', newMetadata.license);
    cy.get('input[name=rights_desc]').should('not.be.disabled');
    cy.get('input[name=rights_desc]').invoke('val').should('eq', newMetadata.rightsDesc);
    cy.get('input[name=spatial_location_desc]').should('be.disabled');
    cy.get('input[name=temporal_start_date]').should('be.disabled');
    cy.get('input[name=temporal_end_date]').should('be.disabled');

    cy.get('[role="link"]').contains('Additional Metadata').click();
    cy.get('select[name=dataQuality]').invoke('val').should('eq', newMetadata.dataQuality);
    cy.get('input[name=category]').invoke('val').should('eq', 'geospatial');
    cy.get('input[name=data_dictionary]').invoke('val').should('eq', newMetadata.dataDictionary);
    cy.get('select[name=describedByType]').invoke('val').should('eq', newMetadata.describedByType);
    cy.get('select[name=accrualPeriodicity]')
      .invoke('val')
      .should('eq', newMetadata.accrualPeriodicity);
    cy.get('input[name=homepage_url]').invoke('val').should('eq', newMetadata.homepageUrl);
    cy.get('select[name=languageSubTag]').invoke('val').should('eq', newMetadata.languageSubTag);
    cy.get('select[name=languageRegSubTag]')
      .invoke('val')
      .should('eq', newMetadata.languageRegSubTag);
    cy.get('input[name=primary_it_investment_uii]')
      .invoke('val')
      .should('eq', newMetadata.primaryItInvestmentUii);
    cy.get('input[name=related_documents]')
      .invoke('val')
      .should('eq', newMetadata.relatedDocuments);
    cy.get('input[name=release_date]').invoke('val').should('eq', newMetadata.releaseDate);
    cy.get('input[name=system_of_records]').invoke('val').should('eq', newMetadata.systemOfRecords);
    cy.get('select[name=isParent]').invoke('val').should('eq', newMetadata.isParent);
  });

  it('Able to edit resource', () => {
    cy.contains('Resource Upload').click();
    cy.contains(resourceToBeEdited);
    cy.get(`#edit-${resourceToBeEdited}`).click();
    cy.contains('Save');
    cy.get('input[name=resource\\.name]').type(`-updated`);
    cy.get('input[name=resource\\.url]').type(`-updated`);
    cy.contains('Save').click();
    cy.get('input[name=resource\\.name]').should('have.value', '');
    cy.get('button[type=button]').contains('Finish and publish').click();
    cy.contains(`${resourceToBeEdited}-updated`);
  });

  it('Pre-select n/a license if it absent', () => {
    cy.get('select[name=license]').select('n/a');
    cy.get('button[type=button]').contains('Save and Continue').click();

    // Reload the page and wait for list of organizations to be fetched:
    cy.intercept('/api/3/action/organization_list_for_user').as('listOfOrgs');
    cy.visit('/dataset/edit-new/' + name);
    cy.wait('@listOfOrgs');

    cy.get('select[name=license]').invoke('val').should('eq', 'n/a');
  });

  it('Able to delete resource', () => {
    cy.contains('Resource Upload').click();
    cy.intercept('/api/3/action/resource_delete').as('resourceDelete');
    cy.contains(resourceToBeDeleted);
    cy.get(`#delete-${resourceToBeDeleted}`).click();
    cy.get('.ds-c-button--primary').click();
    cy.wait('@resourceDelete');
    cy.contains(resourceToBeDeleted).should('not.exist');
    cy.contains('1 resources saved in total');
    cy.contains('Finish and publish').click();
    cy.contains(resourceToBeDeleted).should('not.exist');
  });

  it('Able to add another one', () => {
    cy.contains('Resource Upload').click();
    cy.resourceUploadWithUrlAndSave(null, 'new-resource');
    cy.contains('new-resource');
    cy.contains('Finish and publish').click();
    cy.contains('new-resource');
  });

  it('Hides "Save draft" button when in edit mode', () => {
    cy.contains('Save draft').should('not.exist');
  });

  it('Unsets publisher when owner org has changed', () => {
    cy.get('select[name=owner_org]').select('-Select-');
    cy.get('input[placeholder="Select publisher"]').should('have.value', '');
  });
});
