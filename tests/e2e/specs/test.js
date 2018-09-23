/// <reference types="cypress" />

describe('Game', () => {
  beforeEach(() => {
    cy.server();
    cy.route('GET', 'https://api.datamuse.com/words?*', 'fixtures:wordlist.json');
    cy.visit('/game/999');
  });

  it('has a 12x12 letter grid', () => {
    cy.get('.game--table tr').should('have.length', 12);
    cy.get('.game--table tr:first-child td').should('have.length', 12);
  });

  it('shows a list of 10 words', () => {
    cy.get('.game--word').should('have.length', 10);
  });

  it('keeps track of the user\'s progress', () => {
    cy.get('.game--progress').should('have.text', '0 / 10 found');

    cy.get('.game--table tr:nth-child(10) td:nth-child(5)').trigger('mousedown');
    cy.get('.game--table tr:nth-child(10) td:nth-child(6)').trigger('mouseover');
    cy.get('.game--table tr:nth-child(9) td:nth-child(6)').trigger('mouseover');
    cy.get('.game--table tr:nth-child(8) td:nth-child(6)').trigger('mouseover');
    cy.get('.game--table tr:nth-child(7) td:nth-child(6)').trigger('mouseover');
    cy.get('.game--table tr:nth-child(6) td:nth-child(6)').trigger('mouseover');
    cy.get('.game--table tr:nth-child(5) td:nth-child(6)').trigger('mouseover');
    cy.get('.game--table tr:nth-child(5) td:nth-child(6)').trigger('mouseup');

    cy.get('.game--progress').should('have.text', '1 / 10 found');
  });

  it('shows a play timer', () => {
    cy.get('.game--timer').then(timer => {
      expect(timer.text()).to.match(/\d:\d{2}/);

      cy.wait(1000).then(() => {
        expect(timer.text()).to.match(/\d:\d{2}/);
      });
    });
  });

  it('marks words off the list when found', () => {
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
    cy.get('.game--github')
      .should('have.attr', 'href', 'https://github.com/trydionel/nlws');
  });
});
