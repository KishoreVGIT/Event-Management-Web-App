describe('Organizer Event Management', () => {
  const timestamp = Date.now();
  const organizerEmail = `organizer_mgmt_${timestamp}@test.com`;
  const password = 'password123';
  const eventTitle = `Management Test Event ${timestamp}`;

  // Helper function to create organizer and login
  const createAndLoginOrganizer = () => {
    cy.visit('/signup');
    cy.get('#firstName').type('Event');
    cy.get('#lastName').type('Manager');
    cy.get('#email').type(organizerEmail);
    cy.get('#password').type(password);
    cy.get('#confirmPassword').type(password);
    cy.get('#role').select('organizer');
    cy.get('#organizationName').type('Event Management Org');
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('include', '/events');
  };

  // Helper function to create an event
  const createEvent = (title) => {
    cy.visit('/organizer/events/new');
    cy.get('#title').type(title);
    cy.get('#description').type('Test event for management operations.');
    cy.get('#start-time').clear().type('10:00');
    cy.get('#end-time').clear().type('12:00');
    cy.get('#location').type('Test Hall');
    cy.get('#capacity').type('50');
    cy.get('#category').type('Testing');
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('not.include', '/new');
  };

  // Helper function to navigate to organizer dashboard
  const goToDashboard = () => {
    cy.visit('/organizer/dashboard');
    cy.url({ timeout: 10000 }).should('include', '/organizer/dashboard');
  };

  // Helper function to login as organizer
  const loginAsOrganizer = () => {
    cy.visit('/signin');
    cy.get('#email').type(organizerEmail);
    cy.get('#password').type(password);
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('include', '/events');
  };

  // Create organizer account once before all tests
  before(() => {
    createAndLoginOrganizer();
  });

  // Cypress clears localStorage between tests, so we need to log in again
  // We skip the first test since we're already logged in from before()
  beforeEach(function() {
    if (this.currentTest.title !== 'should edit an event') {
      loginAsOrganizer();
    }
  });

  it('should edit an event', () => {
    const editEventTitle = `${eventTitle} - Edit Test`;
    // Create an event
    createEvent(editEventTitle);
    
    // Go to dashboard
    goToDashboard();
    
    // Find the event and click edit button
    cy.contains(editEventTitle, { timeout: 10000 })
      .parents('tr')
      .within(() => {
        cy.get('[data-testid="edit-event-button"]').click();
      });
    
    // Should navigate to edit page
    cy.url({ timeout: 10000 }).should('include', '/organizer/events/edit/');
    
    // Edit the event title
    const updatedTitle = `${editEventTitle} - Updated`;
    cy.get('#title').clear().type(updatedTitle);
    
    // Edit the description
    cy.get('#description').clear().type('This event has been updated.');
    
    // Edit the location
    cy.get('#location').clear().type('Updated Hall');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Should redirect back and show updated event
    cy.url({ timeout: 10000 }).should('not.include', '/edit');
    
    // Verify the updated title appears
    cy.visit('/organizer/dashboard');
    cy.contains(updatedTitle, { timeout: 10000 }).should('be.visible');
  });

  it('should postpone an event', () => {
    const postponeEventTitle = `${eventTitle} - Postpone Test`;
    // Create an event
    createEvent(postponeEventTitle);
    
    // Go to dashboard
    goToDashboard();
    
    // Find the event row and open dropdown menu
    cy.contains(eventTitle, { timeout: 10000 })
      .parents('tr')
      .within(() => {
        // Click the more options button (three dots)
        cy.get('[data-testid="event-actions-menu"]').click();
      });
    
    // Click postpone button in dropdown
    cy.get('[data-testid="postpone-event-button"]').click();
    
    // Postpone dialog should open
    cy.contains('Postpone Event', { timeout: 5000 }).should('be.visible');
    cy.contains('All attendees will be notified').should('be.visible');
    
    // Change the start time
    cy.get('#start-time').clear().type('14:00');
    cy.get('#end-time').clear().type('16:00');
    
    // Submit postpone form
    cy.contains('button', 'Postpone Event').click();
    
    // Should show success message
    cy.contains('Event postponed successfully', { timeout: 10000 }).should('be.visible');
    
    // Verify event still exists in dashboard
    cy.contains(postponeEventTitle).should('be.visible');
  });

  it('should cancel an event', () => {
    const cancelEventTitle = `${eventTitle} - Cancel Test`;
    // Create an event
    createEvent(cancelEventTitle);
    
    // Go to dashboard
    goToDashboard();
    
    // Find the event row and open dropdown menu
    cy.contains(eventTitle, { timeout: 10000 })
      .parents('tr')
      .within(() => {
        // Click the more options button
        cy.get('[data-testid="event-actions-menu"]').click();
      });
    
    // Click cancel button in dropdown
    cy.get('[data-testid="cancel-event-button"]').click();
    
    // Cancel dialog should open
    cy.contains('Cancel Event', { timeout: 5000 }).should('be.visible');
    
    // Type cancellation reason
    cy.get('textarea').type('Event cancelled due to unforeseen circumstances.');
    
    // Confirm cancellation
    cy.contains('button', 'Cancel Event').click();
    
    // Should show success message
    cy.contains('Event cancelled successfully', { timeout: 10000 }).should('be.visible');
    
    // Reload dashboard to see updated status
    goToDashboard();
    
    // Verify event shows cancelled status
    cy.contains(cancelEventTitle, { timeout: 10000 })
      .parents('tr')
      .within(() => {
        cy.contains('cancelled', { timeout: 5000 }).should('be.visible');
      });
  });

  it('should delete an event', () => {
    // Use the event that was cancelled in the previous test
    const cancelEventTitle = `${eventTitle} - Cancel Test`;
    
    // Go to dashboard (event should already be cancelled from previous test)
    goToDashboard();
    
    // Verify event exists and is cancelled
    cy.contains(cancelEventTitle, { timeout: 10000 })
      .parents('tr')
      .within(() => {
        cy.contains('cancelled').should('be.visible');
      });
    
    // Find the event row and open dropdown menu
    cy.contains(cancelEventTitle)
      .parents('tr')
      .within(() => {
        // Click the more options button
        cy.get('[data-testid="event-actions-menu"]').click();
      });
    
    // Click delete button in dropdown
    cy.get('[data-testid="delete-event-button"]').click();
    
    // Delete confirmation dialog should open
    cy.contains('Are you absolutely sure?', { timeout: 5000 }).should('be.visible');
    cy.contains('This action cannot be undone').should('be.visible');
    
    // Confirm deletion
    cy.contains('button', 'Delete Event').click();
    
    // Should show success message
    cy.contains('Event deleted successfully', { timeout: 10000 }).should('be.visible');
    
    // Verify event no longer appears in dashboard
    cy.contains(cancelEventTitle).should('not.exist');
  });

  it('should complete full event lifecycle: create → edit → postpone → cancel → delete', () => {
    const lifecycleEventTitle = `Lifecycle Event ${timestamp}`;
    
    // 1. Create event
    createEvent(lifecycleEventTitle);
    goToDashboard();
    cy.contains(lifecycleEventTitle).should('be.visible');
    
    // 2. Edit event
    cy.contains(lifecycleEventTitle)
      .parents('tr')
      .within(() => {
        cy.get('[data-testid="edit-event-button"]').click();
      });
    cy.url().should('include', '/edit');
    cy.get('#description').clear().type('Updated description');
    cy.get('button[type="submit"]').click();
    
    // 3. Postpone event
    goToDashboard();
    cy.contains(lifecycleEventTitle)
      .parents('tr')
      .within(() => {
        cy.get('[data-testid="event-actions-menu"]').click();
      });
    cy.get('[data-testid="postpone-event-button"]').click();
    cy.get('#start-time').clear().type('15:00');
    cy.get('#end-time').clear().type('17:00');
    cy.contains('button', 'Postpone Event').click();
    cy.contains('Event postponed successfully', { timeout: 10000 }).should('be.visible');
    
    // 4. Cancel event
    cy.contains(lifecycleEventTitle)
      .parents('tr')
      .within(() => {
        cy.get('[data-testid="event-actions-menu"]').click();
      });
    cy.get('[data-testid="cancel-event-button"]').click();
    cy.get('textarea').type('Testing full lifecycle');
    cy.contains('button', 'Cancel Event').click();
    cy.contains('Event cancelled successfully', { timeout: 10000 }).should('be.visible');
    
    // 5. Delete event
    cy.contains(lifecycleEventTitle)
      .parents('tr')
      .within(() => {
        cy.get('[data-testid="event-actions-menu"]').click();
      });
    cy.get('[data-testid="delete-event-button"]').click();
    cy.contains('button', 'Delete').click();
    cy.contains('Event deleted successfully', { timeout: 10000 }).should('be.visible');
    cy.contains(lifecycleEventTitle).should('not.exist');
  });
});
