import Chance from 'chance';
const chance = new Chance();

describe('DCAT Metadata App', () => {
  before(() => {
    cy.login();
  });

  it('Loads and has an expected title', () => {
    cy.visit('/dataset/new-metadata');
    cy.contains('Required Metadata');
  });
});

describe('Required Metadata Page', () => {
  before(() => {
    cy.login();
    cy.deleteDataset('daaaa');
    cy.deleteDataset('dbbbb');
    cy.deleteDataset('dcccc');
    cy.deleteDataset('ddddd');
    cy.deleteDataset('deeee');
    cy.deleteDataset('my-default-title-edited');
    cy.deleteOrg('test-organization');
    cy.createOrg('test-organization', 'sample organization');
    cy.visit('/dataset/new-metadata');
  });

  beforeEach(() => {
    cy.logout();
    cy.login();
  });

  afterEach(() => {
    cy.deleteDataset('daaaa');
    cy.deleteDataset('dbbbb');
    cy.deleteDataset('dcccc');
    cy.deleteDataset('ddddd');
    cy.deleteDataset('deeee');
    cy.deleteDataset('my-default-title-edited');
  });

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
    cy.requiredMetadata('daaaa');
    cy.contains('Dataset saved successfully');
  });

  it('Populate publisher hierarchy from single publisher', () => {
    cy.visit('/dataset/new-metadata');
    cy.get('input[name=title]').type('ddddd');
    cy.get('textarea[name=description]').type('description');
    cy.get('.react-tags input').type('tag');
    cy.get('select[name=owner_org]').select('test-organization');
    cy.get('input[placeholder="Select publisher"]').type('second level publisher');
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
    cy.contains('top level publisher');
    cy.contains('first level publisher');
    cy.contains('second level publisher');
  });

  it('Able to add new tag without hiting Enter or Tab', () => {
    const tagName = 'tag0123';
    cy.visit('/dataset/new-metadata');
    cy.get('input[name=title]').type('dcccc');
    cy.get('textarea[name=description]').type('description');
    cy.get('.react-tags input').type(tagName);
    cy.get('select[name=owner_org]').select('test-organization');
    cy.get('input[placeholder="Select publisher"]').type('top level publisher');
    cy.get('input[placeholder="Select publisher"]').type('{downarrow}{enter}');
    cy.get('input[name=contact_name]').type('Person');
    cy.get('input[name=contact_email]').type('person@mail.com');
    cy.get('input[name=unique_id]').type('unique id');
    cy.get('select[name=public_access_level]').select('public');
    cy.get('select[name=license]').select('MIT');
    cy.get('button[type=button]').contains('Save and Continue').click();
    cy.contains(tagName);
  });

  it('Edit dataset URL works', () => {
    cy.visit('/dataset/new-metadata');
    cy.get('input[name=title]').type('my default title');
    cy.get('button.dataset_url_edit').click();
    cy.get('input[name=url]').type('-edited');
    cy.get('button.dataset_url_edit').click();
    cy.get('textarea[name=description]').type('description');
    cy.get('.react-tags input').type('1234{enter}');
    cy.get('select[name=owner_org]').select('test-organization');
    cy.get('input[placeholder="Select publisher"]').type('top level publisher');
    cy.get('input[placeholder="Select publisher"]').type('{downarrow}{enter}');
    cy.get('input[name=contact_name]').type('Person');
    cy.get('input[name=contact_email]').type('person@mail.com');
    cy.get('input[name=unique_id]').type('unique id');
    cy.get('select[name=public_access_level]').select('public');
    cy.get('select[name=license]').select('MIT');
    cy.get('button[type=button]').contains('Save and Continue').click();
    cy.get('h1[id=basic-mega-menu]').contains('Additional Metadata');
    cy.get('button[type=button]').contains('Save and Continue').click();
    cy.visit('/dataset/my-default-title-edited');
    cy.contains('my default title');
  });

  it('Organization is pre-selected in the dropdown if the form is loaded from organization page', () => {
    cy.visit('/organization/test-organization');
    cy.get('.page_primary_action > .btn.btn-primary').first().click();
    // wait until the organization list will be loaded
    cy.wait(3000);
    cy.get('select[name=owner_org]').find(':selected').contains('test-organization');
  });

  it('Organization is pre-selected in the dropdown if it that organization is the only one', () => {
    const username = 'editor-only-in-one-organization';
    cy.createUser(username);
    cy.login();
    cy.visit('/organization/member_new/test-organization');
    cy.get('input[name=username]').type(username, { force: true });
    cy.get('select[name=role]').select('Editor', { force: true });
    cy.get('button[name=submit]').click({ force: true });
    cy.wait(2000);

    cy.logout();
    cy.login(username, 'test1234');

    cy.visit('/dataset');
    cy.get('.page_primary_action > .btn').click();
    cy.wait(3000);
    cy.get('select[name=owner_org]').find(':selected').contains('test-organization');
  });
});

describe('Required Metadata Page errors', () => {
  before(() => {
    cy.login();
    cy.deleteDataset('dbbbb');
    cy.deleteOrg('test-organization');
    cy.createOrg('test-organization', 'sample organization');
    cy.visit('/dataset/new-metadata');
  });

  beforeEach(() => {
    cy.logout();
    cy.login();
  });

  after(() => {
    cy.deleteDataset('dbbbb');
  });

  it('Displays clear error message when fails to create dataset due to validation error', () => {
    // This dataset should already exist
    const title = 'dbbbb';
    cy.visit('/dataset/new-metadata');
    cy.requiredMetadata(title);
    cy.contains('Dataset saved successfully');
    cy.visit('/dataset/new-metadata');
    cy.requiredMetadata(title);
    cy.contains('That URL is already in use.');
  });
});

// TODO: Fix usmetadata validation to allow saving a draft without validation
// describe('Save draft functionality on Required Metadata page', () => {
//   const title = 'deeee';
//
//   after(() => {
//     cy.request('POST', '/api/3/action/dataset_purge', { id: title });
//   });
//
//   it('Saves dataset as draft and skips validation', () => {
//     // Wait for list of organizations to be fetched:
//     cy.intercept('/api/3/action/organization_list_for_user').as('listOfOrgs');
//     cy.visit('/dataset/new-metadata');
//     cy.wait('@listOfOrgs');
//
//     // Title and owner org properties are required to save a dataset in CKAN
//     // Unset org as it is automatically selected when user has only 1 org:
//     cy.get('select[name=owner_org]').select('-Select-');
//     cy.get('.usa-button--outline').contains('Save draft').click();
//     cy.contains('Title is required');
//     cy.contains('Organization is required');
//
//     // Add the title and try to save draft
//     cy.get('input[name=title]').type(title);
//     cy.get('select[name=owner_org]').select('test-organization');
//     cy.get('.usa-button--outline').contains('Save draft').click();
//     cy.contains('Draft saved');
//     cy.request('/api/3/action/package_show?id=' + title).then((response) => {
//       expect(response.status).to.eq(200);
//       const publishingStatusExtra = response.body.result.extras.find(
//         (x) => x.key === 'publishing_status'
//       );
//       expect(publishingStatusExtra).to.not.equal(undefined);
//       expect(publishingStatusExtra.value).to.equal('Draft');
//     });
//
//     // Continue adding more properties
//     cy.get('textarea[name=description]').type(chance.sentence({ words: 4 }));
//     cy.get('.react-tags input').type('1234{enter}');
//     cy.get('.usa-button--outline').contains('Save draft').click();
//     cy.contains('Draft saved');
//
//     // Add all required metadata and continue to next page
//     cy.get('input[placeholder="Select publisher"]').type('top level publisher');
//     cy.get('input[placeholder="Select publisher"]').type('{downarrow}{enter}');
//     cy.get('input[name=contact_name]').type(chance.name());
//     cy.get('input[name=contact_email]').type(chance.email());
//     cy.get('input[name=unique_id]').type(chance.string({ length: 10 }));
//     cy.get('select[name=public_access_level]').select('public');
//     cy.get('select[name=license]').select('MIT');
//     cy.get('button[type=button]').contains('Save and Continue').click();
//     cy.contains('Dataset saved successfully');
//     cy.get('button[type=button]').contains('Save and Continue').click();
//   });
// });
