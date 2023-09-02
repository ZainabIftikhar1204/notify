const request = require('supertest');
const httpStatus = require('http-status-codes');
const { Application } = require('../../../../models/application');
const { Event } = require('../../../../models/event');
const { Notification } = require('../../../../models/notification');
const mongoose = require('mongoose');
const { Message } = require('../../../../models/message');

let server;

describe('/api/notifications', () => {
  let eventId;
  beforeAll(async () => {
    server = require('../../../../index');
  });

  afterAll(async () => {
    await Event.deleteMany({});
    await Application.deleteMany({});
    await Notification.deleteMany({});
  });

  beforeEach(async () => {
    const application = await Application.collection.insertOne({
      name: 'app1',
      description: 'app1 desc',
    });
    const applicationId = application.insertedId;

    const event = await Event.collection.insertOne({
      name: 'event1',
      description: 'event1 desc',
      applicationId,
    });
    eventId = event.insertedId;

    const notificationsData = [
      {
        name: 'notification1',
        description: 'notification1 desc',
        eventId,
      },
      {
        name: 'notification2',
        description: 'notification2 desc',
        eventId,
      },
      {
        name: 'notification3',
        description: 'notification3 desc',
        eventId,
      },
    ];
    await Notification.collection.insertMany(notificationsData);
  });

  afterEach(async () => {
    await Event.deleteMany({});
    await Application.deleteMany({});
    await Notification.deleteMany({});
  });

  describe('GET api/notifications', () => {
    it('should return all notifications of an event', async () => {
      const response = await request(server).get(
        `/api/notifications/?eventId=${eventId}`,
      );
      const { notifications } = response.body;

      expect(response.status).toBe(200);
      expect(notifications.length).toBe(3);
      expect(
        notifications.some((n) => n.name === 'notification1'),
      ).toBeTruthy();
      expect(
        notifications.some((n) => n.name === 'notification2'),
      ).toBeTruthy();
      expect(
        notifications.some((n) => n.name === 'notification3'),
      ).toBeTruthy();
    });

    it('should return 404 if event with the given id is not found', async () => {
      const response = await request(server).get(
        `/api/notifications/?eventId=123456789012`,
      );
      expect(response.status).toBe(404);
    });

    it('should return empty array if no notifications are found', async () => {
      const event = await Event.collection.insertOne({
        name: 'event1',
        description: 'event1 desc',
        applicationId: '123456789012',
      });
      eventId = event.insertedId;

      const response = await request(server).get(
        `/api/notifications/?eventId=${eventId}`,
      );
      const { notifications } = response.body;

      expect(response.status).toBe(200);
      expect(notifications.length).toBe(0);
    });
  });

  describe('POST api/notifications', () => {
    let testEvent;
    let notificationData;
    it('should create a new notification', async () => {
      //Create an application
      let application = new Application({
        name: 'sample Application',
        description: 'Test Application Description',
      });
      application=await application.save();
      // Create a test event
      testEvent = new Event({
        name: 'Test Event',
        description: 'Test Event Description',
        applicationId: application._id.toString(),
      });
      await testEvent.save();

      notificationData = {
        name: 'New Notification',
        description: 'Test Notification Description',
        templatebody: 'Notification body with {{tag}}',
        eventId: testEvent._id.toString(), // Convert ObjectId to string
      };

      const response = await request(server)
        .post('/api/notifications')
        .send(notificationData);

      expect(response.status).toBe(httpStatus.StatusCodes.CREATED);
      expect(response.body).toHaveProperty('name', notificationData.name);
      expect(response.body).toHaveProperty(
        'description',
        notificationData.description,
      );
      expect(response.body).toHaveProperty(
        'templatebody',
        notificationData.templatebody,
      );
      // Add more assertions for other properties as needed
    });

    it('should return a conflict error if a notification with the same name already exists', async () => {
      // Create a test event
      let application = new Application({
        name: 'sample Application',
        description: 'Test Application Description',
      });
      application=await application.save();
      // Create a test event
      testEvent = new Event({
        name: 'Test Event',
        description: 'Test Event Description',
        applicationId: application._id.toString(),
      });
      await testEvent.save();
      // Create an existing notification
      const existingNotification = new Notification({
        name: 'Existing Notification',
        description: 'Existing Notification Description',
        templatebody: 'Existing body with {{tag}}',
        eventId: testEvent._id,
      });
      await existingNotification.save();

      const notificationData = {
        name: 'Existing Notification', // Same name as existing notification
        description: 'New Notification Description',
        templatebody: 'Notification body with {{tag}}',
        eventId: testEvent._id.toString(),
      };

      const response = await request(server)
        .post('/api/notifications')
        .send(notificationData);

      expect(response.status).toEqual(httpStatus.StatusCodes.CONFLICT);
      // Add more assertions for the error response as needed
    });

    it('should return a not found error if the event does not exist', async () => {
      const notificationData = {
        name: 'New Notification',
        description: 'Test Notification Description',
        templatebody: 'Notification body with {{tag}}',
        eventId: '123456789012', // Invalid event ID
      };

      const response = await request(server)
        .post('/api/notifications')
        .send(notificationData);

      expect(response.status).toEqual(httpStatus.StatusCodes.NOT_FOUND);
      // Add more assertions for the error response as needed
    });
  });
  describe("PATCH api/notifications/:id", () => {
    let testNotification;
    let notificationData;
    it("should update the notification", async () => {
      //Create an application
      let application = new Application({
        name: "Application 4",
        description: "Test Application Description",
      });
      application = await application.save();
      // Create a test event
      testEvent = new Event({
        name: "Test Event",
        description: "Test Event Description",
        applicationId: application._id.toString(),
      });
      await testEvent.save();

      // Create a test notification
      testNotification = new Notification({
        name: "Test Notification",
        description: "Test Notification Description",
        templatebody: "Test Notification body with {{tag}}",
        eventId: testEvent._id.toString(), // Convert ObjectId to string
      });
      await testNotification.save();

      notificationData = {
        name: "Updated Notification4",
        description: "Updated Notification Description",
        templatebody: "Updated Notification body with {{tag}}",
      };

      const response = await request(server)
        .patch(`/api/notifications/${testNotification._id}`)
        .send(notificationData);

      expect(response.status).toEqual(httpStatus.StatusCodes.OK);
      expect(response.body).toHaveProperty("name", notificationData.name);
      expect(response.body).toHaveProperty(
        "description",
        notificationData.description
      );
      expect(response.body).toHaveProperty(
        "templatebody",
        notificationData.templatebody
      );
      // Add more assertions for other properties as needed
    });

    it("should return a not found error if the notification does not exist", async () => {
      const notificationData = {
        name: "Updated Notification",
        description: "Updated Notification Description",
        templatebody: "Updated Notification body with {{tag}}",
      };

      const response = await request(server)
        .patch(`/api/notifications/123456789012`)
        .send(notificationData);

      expect(response.status).toEqual(httpStatus.StatusCodes.NOT_FOUND);
      // Add more assertions for the error response as needed
    });

    it("should return conflict error if the notification name already exists", async () => {
      //Create an application
      let application = new Application({
        name: "Application 4",
        description: "Test Application Description",
      });
      application = await application.save();
      // Create a test event
      testEvent = new Event({
        name: "Test Event",
        description: "Test Event Description",
        applicationId: application._id.toString(),
      });
      await testEvent.save();

      // Create a test notification
      testNotification = new Notification({
        name: "Test Notification",
        description: "Test Notification Description",
        templatebody: "Test Notification body with {{tag}}",
        eventId: testEvent._id.toString(), // Convert ObjectId to string
      });
      await testNotification.save();

      // Create an existing notification
      const existingNotification = new Notification({
        name: "Existing Notification",
        description: "Existing Notification Description",
        templatebody: "Existing body with {{tag}}",
        eventId: testEvent._id,
      });
      await existingNotification.save();

      const notificationData = {
        name: "Existing Notification", // Same name as existing notification
        description: "New Notification Description",
        templatebody: "Notification body with {{tag}}",
      };

      const response = await request(server)
        .patch(`/api/notifications/${testNotification._id}`)
        .send(notificationData);

      expect(response.status).toEqual(httpStatus.StatusCodes.CONFLICT);
      // Add more assertions for the error response as needed
    })

   
  });
  describe('Notification API - previewNotificationMessage', () => {
    let testNotificationId;
    let eventId;
  
    beforeAll(async () => {
      server; // Start the server
    });
  
    afterAll(async () => {
      await Promise.all([
        Message.deleteMany({}),
        Notification.deleteMany({}),
        server.close(),
      ]);
    });
  
    beforeEach(async () => {
      // Create a test notification
      const testNotification = new Notification({
        name: 'Test Notification',
        description: 'Test Notification Description',
        templatebody: 'Notification body with {{tag}}',
        eventId: new mongoose.Types.ObjectId(),
        tags: [{ label: 'tag' }],
      });
      const savedNotification = await testNotification.save();
      testNotificationId = savedNotification._id;
  
      // Set eventId for comparison
      eventId = savedNotification.eventId.toString();
    });
  
    afterEach(async () => {
      await Message.deleteMany({});
      await Notification.deleteMany({});
    });
  
    it('should preview and save messages for recipients', async () => {
      const mockRecipients = [
        {
          email: 'recipient1@example.com',
          tags: { tag: 'TagValue1' },
        },
        {
          email: 'recipient2@example.com',
          tags: { tag: 'TagValue2' },
        },
      ];
  
      const mockRequestBody = {
        applicationName: 'Test Application',
        eventName: 'Test Event',
        to: mockRecipients,
      };
     
      const response = await request(server)
        .post(`/api/notifications/${testNotificationId}/message`)
        .send(mockRequestBody);


  
      expect(response.status).toBe(httpStatus.StatusCodes.OK);
      expect(response.text).toBe('Messages Saved in DB');
  
      // Check if messages are saved in the database
      const savedMessages = await Message.find({});
      expect(savedMessages).toHaveLength(mockRecipients.length);
  
      // Assert message content
      savedMessages.forEach((message, index) => {
        expect(message.email).toBe(mockRecipients[index].email);
        const expectedBody = `${mockRequestBody.applicationName}\n${mockRequestBody.eventName}\nTest Notification\nNotification body with ${mockRecipients[index].tags.tag}`;
        expect(message.body).toBe(expectedBody);
        expect(message.notificationId.toString()).toBe(testNotificationId.toString());
      });
    });
  
    it('should return not found error if notification id is invalid', async () => {
      const mockRequestBody = {
        applicationName: 'Test Application',
        eventName: 'Test Event',
        to:[
          {
            email: 'recipient1@example.com',
            tags: { tag: 'TagValue1' },
          },
          {
            email: 'recipient2@example.com',
            tags: { tag: 'TagValue2' },
          },
        ]
      };
  
      const response = await request(server)
        .post('/api/notifications/6123456789abcdef01234567/message')
        .send(mockRequestBody);
      expect(response.status).toBe(httpStatus.StatusCodes.NOT_FOUND);
      // Add more assertions for the error response as needed
    });
  
    // Add more test cases as needed
  });
});
