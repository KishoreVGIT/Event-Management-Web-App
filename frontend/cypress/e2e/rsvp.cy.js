describe('RSVP Functionality', () => {
  const timestamp = Date.now();
  const organizerEmail = `organizer_rsvp_${timestamp}@test.com`;
  const studentEmail = `student_rsvp_${timestamp}@test.com`;
  const password = 'password123';
  const eventTitle = `RSVP Event ${timestamp}`;

  it('should complete full RSVP flow', () => {
    // 1. Register Organizer
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

    // 2. Create Event
    cy.visit('/organizer/events/new');
    cy.get('#title').should('be.visible').type(eventTitle);
    cy.get('#description').type('Event for RSVP testing.');
    
    // Set time directly
    cy.get('#start-time').clear().type('14:00');
    cy.get('#end-time').clear().type('16:00');
    
    cy.get('#location').type('RSVP Hall');
    cy.get('#capacity').type('50');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    cy.contains(eventTitle, { timeout: 10000 }).should('be.visible');

    // 3. Logout Organizer using test ID
    cy.get('[data-testid="sign-out-button"]').click();

    // 4. Register Student
    cy.visit('/signup');
    cy.get('#firstName').type('Rsvp');
    cy.get('#lastName').type('Student');
    cy.get('#email').type(studentEmail);
    cy.get('#password').type(password);
    cy.get('#confirmPassword').type(password);
    cy.get('#role').select('student');
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('include', '/events');
    
    // 5. Find event card and click View button
    cy.contains(eventTitle, { timeout: 10000 })
      .parents('.group') // Find the card container
      .within(() => {
        cy.contains('button', 'View').click();
      });
    
    // Wait for event detail page to load
    cy.url({ timeout: 10000 }).should('include', '/events/');
    cy.contains(eventTitle, { timeout: 10000 }).should('exist'); // Just check existence, not visibility due to CSS overflow
    
    // 6. RSVP using test ID - scroll into view and wait for button to be visible
    cy.get('[data-testid="rsvp-button"]', { timeout: 10000 }).scrollIntoView().should('be.visible').click();
    cy.contains('You have successfully RSVPed', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="cancel-rsvp-button"]').should('be.visible');
    
    // 7. Cancel RSVP using test ID
    cy.get('[data-testid="cancel-rsvp-button"]').click();
    cy.contains('Your RSVP has been cancelled', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="rsvp-button"]').should('be.visible');
  });
});
