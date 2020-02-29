/// <reference types="cypress" />
/// <reference types="../src/game" />

describe('Word search in desktop mode', () => {
  const getStore = () => cy.window().its('app.$store');
  const getPath = (index = 0) => {
    // Something changed so that the Vuex state isn't ready as quickly as it
    // used to be. Just hack in a fix for now.
    cy.wait(10);
    return getStore().then(store => {
      return store.state.puzzle.paths[index]
    });
  };

  beforeEach(() => {
    cy.server();
    cy.route('GET', 'https://api.datamuse.com/words?*', 'fixtures:wordlist.json');
    cy.viewport('macbook-15');
    cy.visit('/game/999');
  });

  it('has a 12x12 letter grid', () => {
    cy.get('.game--table tr').should('have.length', 12);
    cy.get('.game--table tr:first-child td').should('have.length', 12);
  });

  it('shows a list of 12 words', () => {
    cy.get('.game--word').should('have.length', 12);
  });

  it('keeps track of the user\'s progress', () => {
    cy.get('.game--progress').should('have.text', '0 / 12 found');

    getPath().then(path => {
      cy.get('.game--table').drawPath(path);
    });

    cy.get('.game--progress').should('have.text', '1 / 12 found');
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
    getPath().then(path => {
      cy.get('.game--table').drawPath(path);

      const word = path.map(p => p.char).join('');
      cy.get('.game--word').contains(word).should('have.class', 'game--found-word');
    });
  });

  it('shows a circled path around candidate words', () => {
    // Start with no paths
    cy.get('.path-visualization').should('have.length', 0);

    getPath().then(path => {
      cy.get('.game--table').drawPath(path, { leaveOpen: true });
    });

    cy.get('.path-visualization').should('have.length', 1);
  });

  it('shows a circled path around found words', () => {
    // Start with no paths
    cy.get('.path-visualization').should('have.length', 0);

    getPath().then(path => {
      cy.get('.game--table').drawPath(path);
    });

    // And one path when found
    cy.get('.path-visualization').should('have.length', 1);
  });

  it('contains a github link', () => {
    cy.get('.game--github')
      .should('have.attr', 'href', 'https://github.com/trydionel/nlws');
  });
});
