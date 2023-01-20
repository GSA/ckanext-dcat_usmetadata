import 'cypress-file-upload';
import Chance from 'chance';
const chance = new Chance();

describe('Resource Upload page', () => {
  const titleAndName = 'link-to-data';
  const longNameResourceDataset = 'resource-list-edit-test';

  before(() => {
    cy.login();
    cy.deleteDataset('eeeee');
    cy.deleteOrg('test-organization');
    cy.createOrg('test-organization', 'sample organization');
  });

  beforeEach(() => {
    cy.login();
    Cypress.Cookies.preserveOnce('ckan');
    cy.visit('/dataset/new-metadata');
  });
  afterEach(() => {
    cy.request({
      method: 'POST',
      url: '/api/3/action/dataset_purge',
      body: { id: titleAndName },
      failOnStatusCode: false,
    });
  });

  after(() => {
    cy.request({
      method: 'POST',
      url: '/api/3/action/dataset_purge',
      body: { id: longNameResourceDataset },
      failOnStatusCode: false,
    });
  });

  it('Links to Data and redirects to dataset page on CKAN', () => {
    cy.requiredMetadata(titleAndName).then(() => {
      cy.additionalMetadata();
      cy.get('button[type=button]')
        .contains('Save and Continue')
        .click()
        .then(() => {
          cy.resourceUploadWithUrlAndPublish().then(() => {
            cy.get('.resource-list').find('.resource-item').should('have.length', 1);
            // Test that the dataset is private by default
            cy.request('/api/3/action/package_show?id=' + titleAndName).then((response) => {
              expect(response.status).to.eq(200);
              expect(response.body.result.private).to.equal(true);
            });
          });
        });
    });
  });

  it('Links to Data and has special character in metadata', () => {
    cy.requiredMetadata(titleAndName).then(() => {
      cy.additionalMetadata();
      cy.get('button[type=button]')
        .contains('Save and Continue')
        .click()
        .then(() => {
          cy.get('#resource-option-link-to-file').parent('.form-group').click();
          cy.get('input[name=resource\\.url]').type('https://example.com/data.csv');
          cy.get('input[name=resource\\.name]').type('With special $ character');
          cy.get('button[type=button]')
            .contains('Finish and publish')
            .click()
            .then(() => {
              cy.get('.resource-list').find('.resource-item').should('have.length', 1);
            });
        });
    });
  });

  it('Uploads data file and redirects to dataset page on CKAN', () => {
    cy.requiredMetadata(titleAndName).then(() => {
      cy.additionalMetadata();
      cy.get('button[type=button]')
        .contains('Save and Continue')
        .click()
        .then(() => {
          cy.get('#resource-option-upload-file').parent('.form-group').click();
          cy.get('label[for=upload]').click();
          const yourFixturePath = '../fixtures/example.json';
          cy.get('input#upload').attachFile(yourFixturePath);
          cy.get('button[type=button]')
            .contains('Finish and publish')
            .click()
            .then(() => {
              cy.get('.resource-list').find('.resource-item').should('have.length', 1);
              // Test that the dataset is non-private when uploading a file
              cy.request('/api/3/action/package_show?id=' + titleAndName).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.result.private).to.equal(false);
              });
            });
        });
    });
  });

  it('Uploads data file and has special character in metadata', () => {
    cy.requiredMetadata(titleAndName).then(() => {
      cy.additionalMetadata();
      cy.get('button[type=button]')
        .contains('Save and Continue')
        .click()
        .then(() => {
          cy.get('#resource-option-upload-file').parent('.form-group').click();
          cy.get('label[for=upload]').click();
          const yourFixturePath = '../fixtures/example.json';
          cy.get('input#upload').attachFile(yourFixturePath);
          cy.get('input[name=resource\\.name]').clear().type('With special & character');
          cy.get('button[type=button]')
            .contains('Finish and publish')
            .click()
            .then(() => {
              cy.get('.resource-list').find('.resource-item').should('have.length', 1);
            });
        });
    });
  });

  it('Saves resource and displays expected message', () => {
    const exampleUrl = 'https://example.com/data.csv';
    const resourceName = chance.word();
    const expectedMessage1 = `Resource saved: [${resourceName}] (1 resources saved in total).`;
    cy.requiredMetadata(titleAndName);
    cy.additionalMetadata();
    cy.get('button[type=button]')
      .contains('Save and Continue')
      .click()
      .then(() => {
        cy.resourceUploadWithUrlAndSave(exampleUrl, resourceName);
        cy.contains(expectedMessage1);
      });
  });

  it('List saved resources and truncates long names', () => {
    const exampleUrl = 'https://example.com/data.csv';
    const shortResourceName = 'First resource';
    const longResourceName =
      'Very oooooooooooooooooooooooooooooooooooooooooooooooooooooooo naaaame';
    cy.requiredMetadata(longNameResourceDataset);
    cy.additionalMetadata();
    cy.get('button[type=button]').contains('Save and Continue').click();
    cy.intercept('/api/3/action/resource_create').as('resourceCreate1');
    cy.resourceUploadWithUrlAndSave(exampleUrl, shortResourceName);
    cy.wait('@resourceCreate1');
    cy.intercept('/api/3/action/resource_create').as('resourceCreate2');
    cy.resourceUploadWithUrlAndSave(exampleUrl, longResourceName);
    cy.wait('@resourceCreate2');

    cy.visit(`/dataset/edit-new/${longNameResourceDataset}`);
    cy.contains('Resource Upload').click();

    cy.contains(shortResourceName);
    cy.get(longResourceName).should('not.exist');
    // Action buttons
    cy.contains('Delete');
    cy.contains('Edit');
    // Truncated the text, three dots
    cy.contains(/.../);
  });

  it('Fails to save resource if URL is invalid', () => {
    const invalidUrl = 'example.com/data.csv';
    cy.requiredMetadata(titleAndName);
    cy.additionalMetadata();
    cy.get('button[type=button]')
      .contains('Save and Continue')
      .click()
      .then(() => {
        cy.resourceUploadWithUrlAndSave(invalidUrl);
        cy.get('h3.usa-alert__heading').contains('This form contains invalid entries');
        cy.get('.usa-alert__text').contains(
          'If you are linking to a dataset, please include "https://" at the beginning of your URL.'
        );
      });
  });
});

describe('Save draft functionality on Resource Upload page', () => {
  before(() => {
    cy.login();
    cy.deleteDataset('eeeee');
    cy.deleteOrg('test-organization');
    cy.createOrg('test-organization', 'sample organization');
  });

  beforeEach(() => {
    cy.login();
    Cypress.Cookies.preserveOnce('ckan');
    cy.visit('/dataset/new-metadata');
  });

  after(() => {
    cy.deleteDataset('eeeee');
  });

  it('Saves draft', () => {
    cy.requiredMetadata('eeeee');
    cy.intercept('/api/3/action/package_update').as('packageUpdate');
    cy.get('button[type=button]').contains('Save and Continue').click();
    cy.wait('@packageUpdate');
    cy.contains('Save and add another resource');
    cy.get('.usa-button--outline').contains('Save draft').click();
    cy.contains('Draft saved');

    cy.intercept('/api/3/action/resource_create').as('resourceCreate');
    cy.get('#resource-option-link-to-file').parent('.form-group').click();
    cy.get('input[name=resource\\.url]').type(chance.url());
    cy.get('input[name=resource\\.name]').type(chance.word());
    cy.get('.usa-button--outline').contains('Save draft').click();
    cy.wait('@resourceCreate');
    cy.contains('Draft saved');
  });
});

describe('Editing resources', () => {
  const name = 'test-for-editing-resource';

  before(() => {
    cy.login();
    cy.deleteDataset(name);
    cy.deleteOrg('test-organization');
    cy.createOrg('test-organization', 'sample organization');
  });

  beforeEach(() => {
    cy.login();
    Cypress.Cookies.preserveOnce('ckan');
    cy.visit('/dataset/new-metadata');
  });

  afterEach(() => {
    cy.deleteDataset(name);
  });

  it('Works when editing a resource during dataset creation', () => {
    cy.requiredMetadata(name);
    cy.intercept('/api/3/action/package_update').as('packageUpdate');
    cy.get('button[type=button]').contains('Save and Continue').click();
    cy.wait('@packageUpdate');

    // Create 2 resources: 1 with link and 1 upload:
    cy.intercept('/api/3/action/resource_create').as('resourceCreate1');
    const resourceName = 'linked';
    const resourceUrl = 'https://www.example.com';
    cy.resourceUploadWithUrlAndSave(resourceUrl, resourceName);
    cy.wait('@resourceCreate1');

    cy.intercept('/api/3/action/package_patch').as('resourceCreate2');
    const filePath = '../fixtures/example.json';
    const resourceFileName = 'example';
    cy.resourceUploadWithFileAndSave(filePath, resourceFileName);
    cy.wait('@resourceCreate2');

    // Test editing linked resource url:
    cy.intercept('/api/3/action/resource_update').as('resourceUpdate1');
    cy.get('#edit-' + resourceName)
      .trigger('mouseover')
      .click();
    cy.get('input[name=resource\\.url]').type('-updated');
    cy.get('button[type=button]').contains('Save').click();
    cy.wait('@resourceUpdate1');
    cy.get('#edit-' + resourceName)
      .trigger('mouseover')
      .click();
    cy.get('input[name=resource\\.url]')
      .invoke('val')
      .should('eq', resourceUrl + '-updated');

    // Test re-uploading a file:
    cy.intercept('/api/3/action/package_patch').as('resourceUpdate2');
    cy.get('#edit-' + resourceFileName)
      .trigger('mouseover')
      .click();
    cy.get('.clear-button').click();
    cy.get('#resource-option-upload-file').parent('.form-group').click();
    cy.get('label[for=upload]').click();
    cy.get('input#upload').attachFile('../fixtures/example2.json');
    cy.get('button[type=button]').contains('Save').click();
    cy.wait('@resourceUpdate2');
    cy.get('#edit-' + resourceFileName)
      .trigger('mouseover')
      .click();
    cy.get('input[name=resource\\.url]')
      .invoke('val')
      .should('match', /\/download\/example2.json$/);
  });

  it('Works when editing a resource in "edit" mode', () => {
    cy.requiredMetadata(name);
    cy.intercept('/api/3/action/package_update').as('packageUpdate');
    cy.get('button[type=button]').contains('Save and Continue').click();
    cy.wait('@packageUpdate');

    // Create 2 resources: 1 with link and 1 upload:
    cy.intercept('/api/3/action/resource_create').as('resourceCreate');
    const resourceName = 'linked';
    const resourceUrl = 'https://www.example.com';
    cy.resourceUploadWithUrlAndSave(resourceUrl, resourceName);
    cy.wait('@resourceCreate');
    const filePath = '../fixtures/example.json';
    const resourceFileName = 'example';
    cy.resourceUploadWithFileAndSave(filePath, resourceFileName);
    cy.wait('@resourceCreate');
    cy.get('button[type=button]').contains('Finish and publish').click();

    // Go to edit mode and edit resources:
    cy.visit('/dataset/edit-new/' + name);
    cy.get('#app_navigation > :nth-child(3)').contains('Resource Upload').click();

    // Test editing linked resource url:
    cy.intercept('/api/3/action/resource_update').as('resourceUpdate1');
    cy.get('#edit-' + resourceName)
      .trigger('mouseover')
      .click();
    cy.get('input[name=resource\\.url]').type('-updated');
    cy.get('button[type=button]').contains('Save').click();
    cy.wait('@resourceUpdate1');
    cy.get('#edit-' + resourceName)
      .trigger('mouseover')
      .click();
    cy.get('input[name=resource\\.url]')
      .invoke('val')
      .should('eq', resourceUrl + '-updated');

    // Test re-uploading a file:
    cy.intercept('/api/3/action/package_patch').as('resourceUpdate2');

    cy.get('#edit-' + resourceFileName)
      .trigger('mouseover')
      .click();
    cy.get('.clear-button').click();
    cy.get('#resource-option-upload-file').parent('.form-group').click();
    cy.get('label[for=upload]').click();
    cy.get('input#upload').attachFile('../fixtures/example2.json');
    cy.get('button[type=button]').contains('Save').click();
    cy.wait('@resourceUpdate2');
    cy.get('#edit-' + resourceFileName)
      .trigger('mouseover')
      .click();
    cy.get('input[name=resource\\.url]')
      .invoke('val')
      .should('match', /\/download\/example2.json$/);
  });

  it('Resource radio buttons work', () => {
    cy.requiredMetadata(name);
    cy.intercept('/api/3/action/package_update').as('packageUpdate1');
    cy.get('button[type=button]').contains('Save and Continue').click();
    cy.wait('@packageUpdate1');

    const resourceWithLinkToApi = 'Link-to-an-API-Resource';
    const resourceWithAccessUrl = 'Access-URL-Resource';
    const resourceWithFile = 'File-Resource';
    const resourceWithLinkToFIle = 'Link-to-file-Resource';

    // Create a resource with  Link to an API
    cy.intercept('/api/3/action/resource_create').as('resourceCreate1');
    cy.get('#resource-option-link-to-api').parent('.form-group').click();
    cy.get('input[name=resource\\.url]').type('https://www.example.com');
    cy.get('input[name=resource\\.name]').type(resourceWithLinkToApi);
    cy.get('textarea[name=resource\\.description]').type(chance.sentence({ words: 10 }));
    cy.get('button[type=button]').contains('Save and add another resource').click();
    cy.wait('@resourceCreate1');

    // Create a resource with Access URL
    cy.intercept('/api/3/action/resource_create').as('resourceCreate2');
    cy.get('#resource-option-access-url').parent('.form-group').click();
    cy.get('input[name=resource\\.url]').type('https://www.example.com');
    cy.get('input[name=resource\\.name]').type(resourceWithAccessUrl);
    cy.get('textarea[name=resource\\.description]').type(chance.sentence({ words: 10 }));
    cy.get('button[type=button]').contains('Save and add another resource').click();
    cy.wait('@resourceCreate2');

    // Create a resource with file
    cy.intercept('/api/3/action/package_patch').as('resourceCreate3');
    cy.resourceUploadWithFileAndSave('../fixtures/example.json', resourceWithFile);
    cy.wait('@resourceCreate3');

    // Create a resource with link to file
    cy.intercept('/api/3/action/resource_create').as('resourceCreate4');
    cy.resourceUploadWithUrlAndSave('https://www.example.com', resourceWithLinkToFIle);
    cy.wait('@resourceCreate4');

    // Go to resource page
    cy.visit(`/dataset/edit-new/${name}`);
    cy.get('#app_navigation > :nth-child(3)').contains('Resource Upload').click();

    // Testing Link To an API
    cy.get('#edit-' + resourceWithLinkToApi)
      .trigger('mouseover')
      .click();
    cy.get('#resource-option-link-to-api').should('be.checked');
    cy.get('input[name=resource\\.format]').invoke('val').should('eq', 'API');
    cy.get('input[name=resource\\.name]').invoke('val').should('eq', resourceWithLinkToApi);

    // Testing Access URL
    cy.get('#edit-' + resourceWithAccessUrl)
      .trigger('mouseover')
      .click();
    cy.get('#resource-option-access-url').should('be.checked');
    cy.get('input[name=resource\\.format]').invoke('val').should('not.eq', 'API');
    cy.get('input[name=resource\\.name]').invoke('val').should('eq', resourceWithAccessUrl);

    // Testing Upload a File
    cy.get('#edit-' + resourceWithFile)
      .trigger('mouseover')
      .click();
    cy.get('#resource-option-upload-file').should('be.checked');
    cy.get('input[name=resource\\.format]').invoke('val').should('eq', 'JSON');
    cy.get('input[name=resource\\.name]').invoke('val').should('eq', resourceWithFile);

    // Testing Link to a File
    cy.get('#edit-' + resourceWithLinkToFIle)
      .trigger('mouseover')
      .click();
    cy.get('#resource-option-link-to-file').should('be.checked');
    cy.get('input[name=resource\\.name]').invoke('val').should('eq', resourceWithLinkToFIle);
  });
});
