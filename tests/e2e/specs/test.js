// https://docs.cypress.io/api/introduction/api.html

describe('Letter grid', () => {
  beforeEach(() => {
    cy.server();
    cy.route('GET', 'https://api.datamuse.com/words?*', 'fixtures:wordlist.json');
  });

  it('has a 12x12 letter grid', () => {
    cy.visit('/game/999');
    cy.get('.game--table tr').should('have.length', 12);
    cy.get('.game--table tr:first-child td').should('have.length', 12);
  });

  it('shows a list of 10 words', () => {
    cy.visit('/game/999');
    cy.contains('h3', 'Word list');
    cy.get('.game--word').should('have.length', 10);
  });

  it('contains a github link', () => {
    cy.visit('/game/999');
    cy.get('.game--github')
      .should('have.attr', 'href', 'https://github.com/trydionel/nlws');
  });
});
