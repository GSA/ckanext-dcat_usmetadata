describe('DCAT Metadata App: New loads', () => {
  it('Loads', () => {
    cy.visit('/dataset/new-metadata')
  })

  it('Has a title', () => {
    cy.contains('Required Metadata')
  })
})
