// https://docs.cypress.io/api/introduction/api.html

describe('Game', () => {
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

  it('marks words off the list when found', () => {
    cy.visit('/game/999');

    // FIXME: figure out how/where to extract this common logic
    //
    cy.get('.game--table tr:nth-child(10) td:nth-child(5)').trigger('mousedown');
    cy.get('.game--table tr:nth-child(10) td:nth-child(6)').trigger('mouseover');
    cy.get('.game--table tr:nth-child(9) td:nth-child(6)').trigger('mouseover');
    cy.get('.game--table tr:nth-child(8) td:nth-child(6)').trigger('mouseover');
    cy.get('.game--table tr:nth-child(7) td:nth-child(6)').trigger('mouseover');
    cy.get('.game--table tr:nth-child(6) td:nth-child(6)').trigger('mouseover');
    cy.get('.game--table tr:nth-child(5) td:nth-child(6)').trigger('mouseover');
    cy.get('.game--table tr:nth-child(5) td:nth-child(6)').trigger('mouseup');

    cy.get('.game--word').contains('quantum').should('have.class', 'game--found-word');
  });

  it('shows a circled path around candidate words', () => {
    cy.visit('/game/999');

    // Start with no paths
    cy.get('.path-visualization').should('have.length', 0);

    // FIXME: figure out how/where to extract this common logic
    //
    cy.get('.game--table tr:nth-child(10) td:nth-child(5)').trigger('mousedown');
    cy.get('.game--table tr:nth-child(10) td:nth-child(6)').trigger('mouseover');
    cy.get('.game--table tr:nth-child(9) td:nth-child(6)').trigger('mouseover');
    cy.get('.game--table tr:nth-child(8) td:nth-child(6)').trigger('mouseover');

    cy.get('.path-visualization').should('have.length', 1);
  });

  it('shows a circled path around found words', () => {
    cy.visit('/game/999');

    // Start with no paths
    cy.get('.path-visualization').should('have.length', 0);

    // FIXME: figure out how/where to extract this common logic
    //
    cy.get('.game--table tr:nth-child(10) td:nth-child(5)').trigger('mousedown');
    cy.get('.game--table tr:nth-child(10) td:nth-child(6)').trigger('mouseover');
    cy.get('.game--table tr:nth-child(9) td:nth-child(6)').trigger('mouseover');
    cy.get('.game--table tr:nth-child(8) td:nth-child(6)').trigger('mouseover');
    cy.get('.game--table tr:nth-child(7) td:nth-child(6)').trigger('mouseover');
    cy.get('.game--table tr:nth-child(6) td:nth-child(6)').trigger('mouseover');
    cy.get('.game--table tr:nth-child(5) td:nth-child(6)').trigger('mouseover');
    cy.get('.game--table tr:nth-child(5) td:nth-child(6)').trigger('mouseup');

    // And one path when found
    cy.get('.path-visualization').should('have.length', 1);
  });

  it('contains a github link', () => {
    cy.visit('/game/999');
    cy.get('.game--github')
      .should('have.attr', 'href', 'https://github.com/trydionel/nlws');
  });
});
