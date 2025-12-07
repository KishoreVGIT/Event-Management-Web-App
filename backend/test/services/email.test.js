import { expect } from 'chai';
import sinon from 'sinon';
import { transporter, sendEmail, sendRsvpConfirmationEmail, sendEventUpdateEmail, sendEventCancellationEmail, sendEventReminderEmail } from '../../src/services/email.js';

describe('Email Service', () => {
  let sendMailStub;

  beforeEach(() => {
    // Stub the sendMail method of the exported transporter object
    sendMailStub = sinon.stub(transporter, 'sendMail').resolves({ messageId: 'test-message-id' });
  });

  afterEach(() => {
    // Restore the stub to ensures other tests aren't affected
    sendMailStub.restore();
  });

  describe('sendEmail', () => {
    it('should send an email successfully', async () => {
      const options = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
        text: 'Test Text',
      };

      const result = await sendEmail(options);

      expect(result.success).to.be.true;
      expect(result.messageId).to.equal('test-message-id');
      expect(sendMailStub.calledOnce).to.be.true;
      
      const callArgs = sendMailStub.firstCall.args[0];
      expect(callArgs.to).to.equal('test@example.com');
      expect(callArgs.subject).to.equal('Test Subject');
    });

    it('should handle errors gracefully', async () => {
      // Force the stub to reject
      sendMailStub.rejects(new Error('SMTP Error'));

      const options = {
        to: 'test@example.com',
        subject: 'Test',
        html: 'Content',
      };

      const result = await sendEmail(options);

      expect(result.success).to.be.false;
      expect(result.error).to.equal('SMTP Error');
    });
  });

  describe('sendRsvpConfirmationEmail', () => {
    it('should generate correct content and send email', async () => {
      const user = { name: 'John Doe', email: 'john@example.com' };
      const event = {
        id: 1,
        title: 'Tech Talk',
        startDate: new Date('2023-12-25T10:00:00Z'),
        endDate: new Date('2023-12-25T11:00:00Z'),
        location: 'Conference Room A',
        category: 'Workshop',
        description: 'Learn about testing',
      };

      await sendRsvpConfirmationEmail(user, event);

      expect(sendMailStub.calledOnce).to.be.true;
      const callArgs = sendMailStub.firstCall.args[0];

      expect(callArgs.to).to.equal('john@example.com');
      expect(callArgs.subject).to.contain('RSVP Confirmed: Tech Talk');
      expect(callArgs.html).to.contain('Tech Talk');
      expect(callArgs.html).to.contain('John Doe');
      expect(callArgs.html).to.contain('Conference Room A');
      
      // Should have attachment
      expect(callArgs.attachments).to.be.an('array');
      expect(callArgs.attachments[0].filename).to.contain('.ics');
      expect(callArgs.attachments[0].contentType).to.equal('text/calendar');
    });
  });

  describe('sendEventUpdateEmail', () => {
     it('should send update email with correct details', async () => {
      const user = { name: 'Jane Smith', email: 'jane@example.com' };
      const event = {
        id: 2,
        title: 'Project Demo',
      };

      await sendEventUpdateEmail(user, event);

      expect(sendMailStub.calledOnce).to.be.true;
      const callArgs = sendMailStub.firstCall.args[0];

      expect(callArgs.to).to.equal('jane@example.com');
      expect(callArgs.subject).to.contain('Event Updated: Project Demo');
      expect(callArgs.html).to.contain('has been updated');
     });
  });

  describe('sendEventCancellationEmail', () => {
    it('should send cancellation email', async () => {
      const user = { name: 'Bob Wilson', email: 'bob@example.com' };
      const event = {
        id: 3,
        title: 'Cancelled Party',
      };

      await sendEventCancellationEmail(user, event);

      expect(sendMailStub.calledOnce).to.be.true;
      const callArgs = sendMailStub.firstCall.args[0];

      expect(callArgs.to).to.equal('bob@example.com');
      expect(callArgs.subject).to.contain('Event Cancelled: Cancelled Party');
      expect(callArgs.html).to.contain('regret to inform you');
    });
  });

  describe('sendEventReminderEmail', () => {
    it('should send reminder email', async () => {
       const user = { name: 'Alice', email: 'alice@example.com' };
       const event = {
        id: 4,
        title: 'Tomorrow Session',
        startDate: new Date(),
      };

      await sendEventReminderEmail(user, event);

      expect(sendMailStub.calledOnce).to.be.true;
      const callArgs = sendMailStub.firstCall.args[0];

      expect(callArgs.to).to.equal('alice@example.com');
      expect(callArgs.subject).to.contain('Reminder: Tomorrow Session is Tomorrow');
    });
  });

});
