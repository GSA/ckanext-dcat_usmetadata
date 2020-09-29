import 'chance';

Cypress.Commands.add('login', () => {
  cy.clearCookies();
  cy.visit('/user/login');
  cy.get('input[name=login]').type('admin');
  cy.get('input[name=password]').type('admin');
  cy.get('.form-actions > .btn').click({force: true});
  cy.wait(2000);
});

Cypress.Commands.add('createOrg', () => {
  cy.visit('/organization/new');
  cy.get('input[name=title]').type('test-123');
  cy.get('.form-actions .btn-primary').click();
})

Cypress.Commands.add('requiredMetadata', () => {
  cy.get('input[name=title]').type(chance.word({ length: 5 }));
  cy.get('textarea[name=description]').type(chance.sentence({ words: 4 }));
  cy.get('.react-tags input').type('1234{enter}');
  cy.get('select[name=owner_org]').select('test-123');
  cy.get('select[name=publisher]').select('Other');
  cy.get('input[name=publisher_other]').type('Other publisher');
  cy.get('input[name=subagency]').type('Sub Agency 1');
  cy.get('input[name=contact_name]').type(chance.name());
  cy.get('input[name=contact_email]').type(chance.email());
  cy.get('input[name=unique_id]').type(chance.string({ length: 10 }));
  cy.get('select[name=public_access_level]').select('public');
  cy.get('select[name=license_new]').select('Others');
  cy.get('input[name=license_others]').type(chance.sentence({ words: 3 }));
  cy.get('#rights_option_1')
    .parent('.form-group')
    .click();
  cy.get('#spatial_option_2')
    .parent('.form-group')
    .click();
  cy.get('input[name=spatial_location_desc]').type(chance.sentence({ words: 2 }));
  cy.get('#temporal_option_2')
    .parent('.form-group')
    .click();
  cy.get('input[name=temporal_start_date]').type('2010-11-11');
  cy.get('input[name=temporal_end_date]').type('2020-11-11');
  cy.get('button[type=button]').contains('Save and Continue').click();
});

Cypress.Commands.add('additionalMetadata', () => {
  // cy.get('select[name=dataQualityUSG]').select('Yes');
  // cy.get('input[name=category]').type(chance.name());
  // cy.get('input[name=data_dictionary]').type(chance.url());
  // cy.get('input[name=data_dictionary_type]').type(chance.name());
  // cy.get('select[name=accrual_periodicity]').select('Weekly');
  // cy.get('input[name=homepage_url]').type(chance.url());
  // cy.get('input[name=primary_it_investment_uii]').type('123-123456789');
  // cy.get('input[name=related_documents]').type(chance.name());
  // cy.get('input[name=release_date]').type('2020-08-08');
  // cy.get('input[name=system_of_records]').type(chance.url());
  cy.get('button[type=button]').contains('Save and Continue').click();
});
