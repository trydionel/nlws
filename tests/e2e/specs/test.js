// https://docs.cypress.io/api/introduction/api.html

describe('Letter grid', () => {
  it('has a 12x12 letter grid', () => {
    cy.visit('/');
    cy.get('.letter-grid--table tr').should('have.length', 12);
    cy.get('.letter-grid--table tr:first-child td').should('have.length', 12);
  });

  it('shows a list of 10 words', () => {
    cy.visit('/');
    cy.contains('h3', 'Word list');
    cy.get('.letter-grid--word').should('have.length', 10);
  });

  it('contains a github link', () => {
    cy.visit('/');
    cy.get('.letter-grid--github')
      .should('have.attr', 'href', 'https://github.com/trydionel/nlws');
  });
});
