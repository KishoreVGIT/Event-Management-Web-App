describe('Organizer Event Management', () => {
  const timestamp = Date.now();
  const organizerEmail = `organizer_mgmt_${timestamp}@test.com`;
  const password = 'password123';
  const eventTitle = `Management Test Event ${timestamp}`;

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

  const goToDashboard = () => {
    cy.visit('/organizer/dashboard');
    cy.url({ timeout: 10000 }).should('include', '/organizer/dashboard');
  };

  const loginAsOrganizer = () => {
    cy.visit('/signin');
    cy.get('#email').type(organizerEmail);
    cy.get('#password').type(password);
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('include', '/events');
  };

  before(() => {
    createAndLoginOrganizer();
  });

  beforeEach(function() {
    if (this.currentTest.title !== 'should edit an event') {
      loginAsOrganizer();
    }
  });

  it('should edit an event', () => {
    const editEventTitle = `${eventTitle} - Edit Test`;
    createEvent(editEventTitle);
    goToDashboard();
    
    cy.contains(editEventTitle, { timeout: 10000 })
      .parents('tr')
      .within(() => {
        cy.get('[data-testid="edit-event-button"]').click();
      });
    
    cy.url({ timeout: 10000 }).should('include', '/organizer/events/edit/');
    
    const updatedTitle = `${editEventTitle} - Updated`;
    cy.get('#title').clear().type(updatedTitle);
    
    cy.get('#description').clear().type('This event has been updated.');
    
    cy.get('#location').clear().type('Updated Hall');
    
    cy.get('button[type="submit"]').click();
    
    cy.url({ timeout: 10000 }).should('not.include', '/edit');
    
    cy.visit('/organizer/dashboard');
    cy.contains(updatedTitle, { timeout: 10000 }).should('be.visible');
  });

  it('should postpone an event', () => {
    const postponeEventTitle = `${eventTitle} - Postpone Test`;
    createEvent(postponeEventTitle);
    
    goToDashboard();
    
    cy.contains(eventTitle, { timeout: 10000 })
      .parents('tr')
      .within(() => {
        cy.get('[data-testid="event-actions-menu"]').click();
      });
    
    cy.get('[data-testid="postpone-event-button"]').click();
    
    cy.contains('Postpone Event', { timeout: 5000 }).should('be.visible');
    cy.contains('All attendees will be notified').should('be.visible');
    
    cy.get('#start-time').clear().type('14:00');
    cy.get('#end-time').clear().type('16:00');
    
    cy.contains('button', 'Postpone Event').click();
    
    cy.contains('Event postponed successfully', { timeout: 10000 }).should('be.visible');
    
    cy.contains(postponeEventTitle).should('be.visible');
  });

  it('should cancel an event', () => {
    const cancelEventTitle = `${eventTitle} - Cancel Test`;
    createEvent(cancelEventTitle);
    
    goToDashboard();
    
    cy.contains(eventTitle, { timeout: 10000 })
      .parents('tr')
      .within(() => {
        cy.get('[data-testid="event-actions-menu"]').click();
      });
    
    cy.get('[data-testid="cancel-event-button"]').click();
    
    cy.contains('Cancel Event', { timeout: 5000 }).should('be.visible');
    
    cy.get('textarea').type('Event cancelled due to unforeseen circumstances.');
    
    cy.contains('button', 'Cancel Event').click();
    
    cy.contains('Event cancelled successfully', { timeout: 10000 }).should('be.visible');
    
    goToDashboard();
    
    cy.contains(cancelEventTitle, { timeout: 10000 })
      .parents('tr')
      .within(() => {
        cy.contains('cancelled', { timeout: 5000 }).should('be.visible');
      });
  });

  it('should delete an event', () => {
    const cancelEventTitle = `${eventTitle} - Cancel Test`;
    
    goToDashboard();
    
    cy.contains(cancelEventTitle, { timeout: 10000 })
      .parents('tr')
      .within(() => {
        cy.contains('cancelled').should('be.visible');
      });
    
    cy.contains(cancelEventTitle)
      .parents('tr')
      .within(() => {
        cy.get('[data-testid="event-actions-menu"]').click();
      });
    
    cy.get('[data-testid="delete-event-button"]').click();
    
    cy.contains('Are you absolutely sure?', { timeout: 5000 }).should('be.visible');
    cy.contains('This action cannot be undone').should('be.visible');
    
    cy.contains('button', 'Delete Event').click();
    
    cy.contains('Event deleted successfully', { timeout: 10000 }).should('be.visible');
    
    cy.contains(cancelEventTitle).should('not.exist');
  });

  it('should complete full event lifecycle: create → edit → postpone → cancel → delete', () => {
    const lifecycleEventTitle = `Lifecycle Event ${timestamp}`;
    
    createEvent(lifecycleEventTitle);
    goToDashboard();
    cy.contains(lifecycleEventTitle).should('be.visible');
    
    cy.contains(lifecycleEventTitle)
      .parents('tr')
      .within(() => {
        cy.get('[data-testid="edit-event-button"]').click();
      });
    cy.url().should('include', '/edit');
    cy.get('#description').clear().type('Updated description');
    cy.get('button[type="submit"]').click();
    
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
    
    cy.contains(lifecycleEventTitle)
      .parents('tr')
      .within(() => {
        cy.get('[data-testid="event-actions-menu"]').click();
      });
    cy.get('[data-testid="cancel-event-button"]').click();
    cy.get('textarea').type('Testing full lifecycle');
    cy.contains('button', 'Cancel Event').click();
    cy.contains('Event cancelled successfully', { timeout: 10000 }).should('be.visible');
    
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
