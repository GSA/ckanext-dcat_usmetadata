import 'chance';

Cypress.Commands.add('login', () => {
  cy.visit('/user/login');
  cy.get('#flHideToolBarButton').click(); // hide debug sidebar
  cy.get('input[name=login]').type('ckan_admin');
  cy.get('input[name=password]').type('test1234');
  cy.get('.module-content .btn-primary').click();
  cy.wait(2000);
});

Cypress.Commands.add('requiredMetadata', () => {
  cy.get('input[name=title]').type(chance.word({ length: 5 }));
  cy.get('textarea[name=description]').type(chance.sentence({ words: 4 }));
  cy.get('select[name=publisher]').select('Publisher 1');
  cy.get('select[name=subagency]').type('Sub Agency 1');
  cy.get('input[name=contactPoint]').type(chance.name());
  cy.get('input[name=contactEmail]').type(chance.email());
  cy.get('input[name=identifier]').type(chance.string({ length: 10 }));
  cy.get('select[name=accessLevel]').select('public');
  cy.get('select[name=dataQuality]').select('Yes');
  cy.get('select[name=license]').select('Others');
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
  cy.get('button[type=submit').click();
});
