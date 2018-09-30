// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add("drawPath", { prevSubject: 'element' }, (subject, path, options = {}) => {
  const len = path.length;
  const $subject = cy.wrap(subject);

  for (let i = 0; i < len; i++) {
    const x = path[i].x * 52 + 26;
    const y = path[i].y * 52 + 26;

    if (i === 0) {
      $subject.trigger('pointerdown', x, y);
    }

    $subject.trigger('pointermove', x, y);

    if (i === len - 1 && !options.leaveOpen) {
      $subject.trigger('pointerup', x, y);
    }
  }

  return $subject;
});