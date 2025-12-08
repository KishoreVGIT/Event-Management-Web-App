describe('RSVP Functionality', () => {
  const timestamp = Date.now();
  const organizerEmail = `organizer_rsvp_${timestamp}@test.com`;
  const studentEmail = `student_rsvp_${timestamp}@test.com`;
  const password = 'password123';
  const eventTitle = `RSVP Event ${timestamp}`;

  it('should complete full RSVP flow', () => {
    cy.visit('/signup');
    cy.get('#firstName').type('Rsvp');
    cy.get('#lastName').type('Organizer');
    cy.get('#email').type(organizerEmail);
    cy.get('#password').type(password);
    cy.get('#confirmPassword').type(password);
    cy.get('#role').select('organizer');
    cy.get('#organizationName').type('RSVP Org');
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('include', '/events');

    cy.visit('/organizer/events/new');
    cy.get('#title').should('be.visible').type(eventTitle);
    cy.get('#description').type('Event for RSVP testing.');
    
    cy.get('#start-time').clear().type('14:00');
    cy.get('#end-time').clear().type('16:00');
    
    cy.get('#location').type('RSVP Hall');
    cy.get('#capacity').type('50');
    
    cy.get('button[type="submit"]').click();
    cy.contains(eventTitle, { timeout: 10000 }).should('be.visible');

    cy.get('[data-testid="sign-out-button"]').click();
    cy.visit('/signup');
    cy.get('#firstName').type('Rsvp');
    cy.get('#lastName').type('Student');
    cy.get('#email').type(studentEmail);
    cy.get('#password').type(password);
    cy.get('#confirmPassword').type(password);
    cy.get('#role').select('student');
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('include', '/events');
    
    cy.contains(eventTitle, { timeout: 10000 })
      .parents('.group')
      .within(() => {
        cy.contains('button', 'View').click();
      });
    
    cy.url({ timeout: 10000 }).should('include', '/events/');
    cy.contains(eventTitle, { timeout: 10000 }).should('exist');
    
    cy.get('[data-testid="rsvp-button"]', { timeout: 10000 }).scrollIntoView().should('be.visible').click();
    cy.contains('You have successfully RSVPed', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="cancel-rsvp-button"]').should('be.visible');
    
    cy.get('[data-testid="cancel-rsvp-button"]').click();
    cy.contains('button', 'Yes, Cancel RSVP').should('be.visible').click();
    cy.contains('Your RSVP has been cancelled', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="rsvp-button"]').should('be.visible');
  });
});
