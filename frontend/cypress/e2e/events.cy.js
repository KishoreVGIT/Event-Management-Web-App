describe('Event Management', () => {
  const timestamp = Date.now();
  const organizerEmail = `organizer_events_${timestamp}@test.com`;
  const password = 'password123';
  const eventTitle = `Test Event ${timestamp}`;

  it('should create organizer and event', () => {
    // Create an organizer account
    cy.visit('/signup');
    cy.get('#firstName').type('Event');
    cy.get('#lastName').type('Organizer');
    cy.get('#email').type(organizerEmail);
    cy.get('#password').type(password);
    cy.get('#confirmPassword').type(password);
    cy.get('#role').select('organizer');
    cy.get('#organizationName').type('Cypress Events Org');
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('include', '/events');
    
    // Create event
    cy.visit('/organizer/events/new');
    
    cy.get('#title').type(eventTitle);
    cy.get('#description').type('This is a test event created by Cypress.');
    
    // Set time directly
    cy.get('#start-time').clear().type('10:00');
    cy.get('#end-time').clear().type('12:00');
    
    cy.get('#location').type('Test Location');
    cy.get('#capacity').type('100');
    cy.get('#category').type('Testing');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Should redirect and show event
    cy.url({ timeout: 10000 }).should('not.include', '/new');
    cy.contains(eventTitle, { timeout: 10000 }).should('be.visible');
  });
});
