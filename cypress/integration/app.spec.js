describe('DCAT Metadata App: New loads', () => {
  it('Loads', () => {
    cy.visit('/dataset/new-metadata')
  })

  it('Has a title', () => {
    cy.contains('Required Metadata')
  })
  
  it('Radios with optional fields work as expected', () => {
    cy.get('#rights_option_1').parent('.form-group').click()
    cy.get('input[name=rights_desc]').should('be.disabled')
    cy.get('#rights_option_2').parent('.form-group').click()
    cy.get('input[name=rights_desc]').should('be.enabled')
  })

  it('Select with optional fields work', () => {
    cy.get('select[name=license]').select('MIT')
    cy.get('input[name=license_others]').should('be.disabled')
    cy.get('select[name=license]').select('Others')
    cy.get('input[name=license_others]').should('be.enabled')
  })
  
  it('Submit Required Metadata works', () => {
    cy.requiredMetadata()
    cy.contains('Additional Metadata')
  })
})
