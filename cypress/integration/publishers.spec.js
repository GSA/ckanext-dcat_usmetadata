describe('Publishers linked to CKAN org', () => {
  before(() => {
    cy.login();
    cy.deleteDataset(name);
    cy.deleteOrg('test-organization');
    cy.createOrg('test-organization');
  });

  after(() => {
    cy.deleteOrg('test-organization');
  });

  it('Has publishers extra in CKAN org metadata', () => {
    cy.login();
    cy.request('GET', '/api/3/action/organization_show?id=test-organization').then((response) => {
      expect(response.status).to.eq(200);
      const publisherExtra = response.body.result.extras.find((x) => x.key === 'publisher');
      assert.isObject(publisherExtra, 'extra is found');
      assert.isString(publisherExtra.value, 'its value is string');
      const publishers = JSON.parse(publisherExtra.value);
      expect(publishers.length).to.eq(2);
      expect(publishers[0].length).to.eq(3);
      expect(publishers[0][2].length).to.eq(19);
    });
  });
});
