import 'chance';
import 'cypress-file-upload';

Cypress.Commands.add('login', (username = 'admin', password = 'password') => {
  /**
   * Method to fill and submit the CKAN Login form
   * :PARAM userName String: user name of that will be attempting to login
   * :PARAM password String: password for the user logging in
   * :RETURN null:
   */
  cy.logout();
  cy.visit('/user/login');

  // set the username and password for the defaults
  Cypress.env('USER', username);
  Cypress.env('USER_PASSWORD', password);

  // Hide flask debug toolbar
  cy.get('#flDebugHideToolBarButton').click();

  cy.get('#field-login').type(username);
  cy.get('#field-password').type(password);
  cy.get('.btn-primary').click();
});

Cypress.Commands.add('logout', () => {
  cy.clearCookies();
});

Cypress.Commands.add('create_token', (tokenName) => {
  // return if token already exists
  const token_data = Cypress.env('token_data');

  if (token_data) {
    cy.log('Token already exists. skipping token creation.');
    cy.log(token_data);
    return;
  }

  cy.login();

  if (!tokenName) {
    tokenName = 'cypress token';
  }

  const userName = Cypress.env('USER');
  // create an API token named 'cypress token'
  cy.visit('/user/' + userName + '/api-tokens');

  cy.get('body').then(($body) => {
    cy.get('#name').type('cypress token');
    cy.get('button[value="create"]').click();
    // find the token in <code> tag and save it for later use
    // find the token id (jti) somewhere in the form
    cy.get('div.alert-success code')
      .invoke('text')
      .then((text1) => {
        cy.get('form[action^="/user/' + userName + '/api-tokens/"]')
          .invoke('attr', 'action')
          .then((text2) => {
            const jti = text2.split('/')[4];
            Cypress.env('token_data', { api_token: text1, jti: jti });
          });
      });
    cy.log('cypress token created.');
  });
});

Cypress.Commands.add('revoke_token', (tokenName) => {
  const token_data = Cypress.env('token_data');

  if (!token_data) {
    return;
  }

  if (!tokenName) {
    tokenName = 'cypress token';
  }
  cy.log('Revoking cypress token.......');
  cy.request({
    url: '/api/3/action/api_token_revoke',
    method: 'POST',
    withCredentials: false,
    headers: {
      Authorization: token_data.api_token,
      'Content-Type': 'application/json',
    },
    body: { token: token_data.api_token },
  });
});

Cypress.Commands.add(
  'createOrg',
  (orgName = 'test-organization', orgDesc = 'sample organization') => {
    /**
     * Method to create organization via CKAN API
     * :PARAM orgName String: Name of the organization being created
     * :PARAM orgDesc String: Description of the organization being created
     * :PARAM orgTest Boolean: Control value to determine if to use UI to create organization
     *      for testing or to visit the organization creation page
     * :RETURN null:
     */
    const token_data = Cypress.env('token_data');

    let request_obj = {
      url: '/api/3/action/organization_create',
      method: 'POST',
      headers: {
        Authorization: token_data.api_token,
        'Content-Type': 'application/json',
      },
      // avoids sending cookie
      withCredentials: false,
      body: {
        name: orgName,
        title: orgName,
        description: orgDesc,
        approval_status: 'approved',
        state: 'active',
        extras: [
          {
            key: 'publisher',
            value: `[["${orgName}", "${orgName}", "top level publisher"], ["${orgName}", "${orgName}", "top level publisher", "first level publisher", "second level publisher"]]`,
          },
        ],
      },
    };

    cy.request(request_obj);
  }
);

Cypress.Commands.add('deleteOrg', (orgName) => {
  /**
   * Method to purge an organization from the current state
   * :PARAM orgName String: Name of the organization to purge from the current state
   * :RETURN null:
   */
  const token_data = Cypress.env('token_data');

  cy.request({
    url: '/api/action/organization_delete',
    method: 'POST',
    failOnStatusCode: false,
    headers: {
      Authorization: token_data.api_token,
      'Content-Type': 'application/json',
    },
    withCredentials: false,
    body: {
      id: orgName ? orgName : 'test-organization',
    },
  });

  cy.request({
    url: '/api/action/organization_purge',
    method: 'POST',
    failOnStatusCode: false,
    headers: {
      Authorization: token_data.api_token,
      'Content-Type': 'application/json',
    },
    withCredentials: false,
    body: {
      id: orgName ? orgName : 'test-organization',
    },
  });
});

Cypress.Commands.add('deleteDataset', (datasetName) => {
  /**
   ** Method to purge a dataset from the current state
   ** :PARAM datasetName String: Name of the dataset to purge from the current state
   ** :RETURN null:
   **/

  const token_data = Cypress.env('token_data');
  cy.request({
    url: '/api/action/dataset_purge',
    method: 'POST',
    failOnStatusCode: false,
    withCredentials: false,
    headers: {
      Authorization: token_data.api_token,
      'Content-Type': 'application/json',
    },
    body: {
      id: datasetName,
    },
  });
});

Cypress.Commands.add('createUser', (username) => {
  cy.clearCookies();
  cy.visit('/user/register');
  const name = username || chance.name({ length: 5 });
  cy.get('input[name=name]').type(name);
  cy.get('input[name=fullname]').type(name);
  cy.get('input[name=email]').type(chance.email());
  const password = 'test1234';
  cy.get('input[name=password1]').type(password);
  cy.get('input[name=password2]').type(password);
  cy.get('button[name=save]').click({ force: true });
  cy.wait(2000);
});

Cypress.Commands.add('requiredMetadata', (title) => {
  cy.intercept('/api/3/action/package_create').as('packageCreate');
  const datasetTitle = title || chance.word({ length: 5 });
  cy.get('input[name=title]').type(datasetTitle);
  cy.get('textarea[name=description]').type(chance.sentence({ words: 4 }));
  cy.get('.react-tags input').type('1234{enter}');
  cy.get('select[name=owner_org]').select('test-organization');
  cy.get('input[placeholder="Select publisher"]').type('top level publisher');
  cy.get('input[placeholder="Select publisher"]').type('{downarrow}{enter}');
  cy.get('input[name=contact_name]').type(chance.name());
  cy.get('input[name=contact_email]').type(chance.email());
  cy.get('input[name=unique_id]').type(chance.string({ length: 10 }));
  cy.get('select[name=public_access_level]').select('public');
  cy.get('select[name=license]').select('Other');
  cy.get('input[name=licenseOther]').type(chance.url());
  cy.get('#rights_option_1').parent('.form-group').click();
  cy.get('#spatial_option_2').parent('.form-group').click();
  cy.get('input[name=spatial_location_desc]').type(chance.sentence({ words: 2 }));
  cy.get('#temporal_option_2').parent('.form-group').click();
  cy.get('input[name=temporal_start_date]').type('2010-11-11');
  cy.get('input[name=temporal_end_date]').type('2020-11-11');
  cy.get('button[type=button]').contains('Save and Continue').click();
  cy.wait('@packageCreate');
});

Cypress.Commands.add('additionalMetadata', (isparent) => {
  cy.get('select[name=dataQuality]').select('Yes');
  cy.get('#category-option-yes').parent('.form-group').click();
  cy.get('input[name=data_dictionary]').clear().type(chance.url());
  cy.get('select[name=describedByType]').select('text/csv');
  cy.get('select[name=accrualPeriodicity]').select('R/P1W');
  cy.get('input[name=homepage_url]').clear().type(chance.url());
  cy.get('select[name=languageSubTag]').select('en');
  cy.get('select[name=languageRegSubTag]').select('US');
  cy.get('input[name=primary_it_investment_uii]').type('123-123456789');
  cy.get('input[name=related_documents]').type(chance.name());
  cy.get('input[name=release_date]').type('2020-08-08');
  cy.get('input[name=system_of_records]').type(chance.url());
  if (isparent) {
    cy.get('select[name=isParent]').select('Yes');
  } else {
    cy.get('select[name=isParent]').select('No');
  }
});

Cypress.Commands.add('resourceUploadWithUrlAndPublish', (url, name) => {
  const resourceUrl = url || chance.url();
  cy.get('#resource-option-link-to-file').parent('.form-group').click();
  cy.get('input[name=resource\\.url]').type(resourceUrl);
  cy.get('input[name=resource\\.name]').type(name || chance.word());
  cy.get('textarea[name=resource\\.description]').type(chance.sentence({ words: 10 }));
  cy.get('select[name=resource\\.mimetype]').select('DOC -- Word Document');
  cy.get('input[name=resource\\.format]').type(chance.word());
  cy.get('input[name=resource\\.conformsTo]').type(chance.url());
  cy.get('button[type=button]').contains('Finish and publish').click();
});

Cypress.Commands.add('resourceUploadWithUrlAndSave', (url, name) => {
  const resourceUrl = url || chance.url();
  cy.get('#resource-option-link-to-file').parent('.form-group').click();
  cy.get('input[name=resource\\.url]').type(resourceUrl);
  cy.get('input[name=resource\\.name]').type(name || chance.word());
  cy.get('textarea[name=resource\\.description]').type(chance.sentence({ words: 10 }));
  cy.get('select[name=resource\\.mimetype]').select('DOC -- Word Document');
  cy.get('input[name=resource\\.format]').type(chance.word());
  cy.get('input[name=resource\\.conformsTo]').type(chance.url());
  cy.get('button[type=button]').contains('Save and add another resource').click();
});

Cypress.Commands.add('resourceUploadWithFileAndSave', (path, name) => {
  cy.get('#resource-option-upload-file').parent('.form-group').click();
  cy.get('label[for=upload]').click();
  cy.get('input#upload').attachFile(path || '../fixtures/example.json');
  cy.get('input[name=resource\\.name]')
    .clear()
    .type(name || chance.word());
  cy.get('textarea[name=resource\\.description]').type(chance.sentence({ words: 10 }));
  cy.get('button[type=button]').contains('Save and add another resource').click();
});
