describe('Authentication Flow', () => {
  const timestamp = Date.now();
  const studentEmail = `student${timestamp}@test.com`;
  const organizerEmail = `organizer${timestamp}@test.com`;
  const password = 'password123';

  it('should sign up a new student', () => {
    cy.visit('/signup');
    cy.get('#firstName').type('Test');
    cy.get('#lastName').type('Student');
    cy.get('#email').type(studentEmail);
    cy.get('#password').type(password);
    cy.get('#confirmPassword').type(password);
    cy.get('#role').select('student');
    cy.get('button[type="submit"]').click();

    // Should redirect to events page
    cy.url({ timeout: 10000 }).should('include', '/events');
    
    // Verify user is logged in by checking for sign-out button
    cy.get('[data-testid="sign-out-button"]', { timeout: 10000 }).should('be.visible');
    
    // Optional: Also verify the user's name is displayed
    cy.get('[data-testid="user-name-display"]').should('contain', 'Test Student');
  });

  it('should sign out', () => {
    // First, log in
    cy.visit('/signin');
    cy.get('#email').type(studentEmail);
    cy.get('#password').type(password);
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('include', '/events');
    
    // Then sign out using test ID
    cy.get('[data-testid="sign-out-button"]').click();
    cy.url({ timeout: 10000 }).should('include', '/signin');
  });

  it('should sign in as student', () => {
    cy.visit('/signin');
    cy.get('#email').type(studentEmail);
    cy.get('#password').type(password);
    cy.get('button[type="submit"]').click();

    // Verify successful login
    cy.url({ timeout: 10000 }).should('include', '/events');
    cy.get('[data-testid="sign-out-button"]', { timeout: 10000 }).should('be.visible');
    
    // Clean up - sign out for next test
    cy.get('[data-testid="sign-out-button"]').click();
  });

  it('should sign up a new organizer', () => {
    // Logout first if logged in (check for sign out button)
    cy.visit('/events');
    cy.get('body').then($body => {
      if ($body.find('[data-testid="sign-out-button"]').length > 0) {
        cy.get('[data-testid="sign-out-button"]').click();
      }
    });
    
    cy.visit('/signup');
    cy.get('#firstName').type('Test');
    cy.get('#lastName').type('Organizer');
    cy.get('#email').type(organizerEmail);
    cy.get('#password').type(password);
    cy.get('#confirmPassword').type(password);
    cy.get('#role').select('organizer');
    
    // Organization name field should appear
    cy.get('#organizationName').should('be.visible').type('Test Org');
    
    cy.get('button[type="submit"]').click();

    cy.url({ timeout: 10000 }).should('include', '/events');
  });
});
