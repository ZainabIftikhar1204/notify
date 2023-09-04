const httpStatus = require('http-status-codes');
const request = require('supertest');

describe('/api/notifications', () => {
  let server;
  let knex;

  beforeAll(async () => {
        server = require('../../../../index'); // eslint-disable-line 
        knex = require('../../../../startup/postgresdb/db'); // eslint-disable-line
  });

  afterAll(async () => {
    if (server) {
      await server.close();
    }
    await knex.destroy();
  });

  beforeEach(async () => {
    await knex.migrate.latest(); // Apply migrations
  });

  afterEach(async () => {
    await knex.migrate.rollback(); // Rollback migrations after all tests
  });

  describe('GET /', () => {
    beforeEach(async () => {
      await knex('applications').insert([
        { name: 'app1', description: 'app1 desc' },
        { name: 'app2', description: 'app2 desc' },
        { name: 'app3', description: 'app3 desc' },
      ]);
      await knex('events').insert([
        { name: 'event1', application_id: 1, description: 'event1 desc' },
        { name: 'event2', application_id: 1, description: 'event2 desc' },
        { name: 'event3', application_id: 2, description: 'event3 desc' },
      ]);
      await knex('notifications').insert([
        {
          name: 'notification1',
          event_id: 1,
          description: 'notification1 desc',
          templatebody: 'notification1 template {{name}}',
        },
        {
          name: 'notification2',
          event_id: 1,
          description: 'notification2 desc',
          templatebody: 'notification1 template {{name}}',
        },
        {
          name: 'notification3',
          event_id: 2,
          description: 'notification3 desc',
          templatebody: 'notification1 template {{name}}',
        },
      ]);
    });

    it('should return all notifications', async () => {
      const response = await request(server).get('/api/notifications').query({
        eventId: 1,
      });
      const { notifications } = response.body;
      expect(response.status).toBe(httpStatus.StatusCodes.OK);
      expect(notifications.length).toBe(2);
      expect(
        notifications.some(
          (notification) => notification.name === 'notification1',
        ),
      ).toBeTruthy();
      expect(
        notifications.some(
          (notification) => notification.name === 'notification2',
        ),
      ).toBeTruthy();
    });

    it('should return 404 if no notifications are found', async () => {
      const response = await request(server).get('/api/notifications').query({
        eventId: 101,
      });
      expect(response.status).toBe(httpStatus.StatusCodes.NOT_FOUND);
    });

    it('should return 400 if eventId is not provided', async () => {
      const response = await request(server).get('/api/notifications');
      expect(response.status).toBe(httpStatus.StatusCodes.BAD_REQUEST);
    });
  });

  describe('POST /', () => {
    beforeEach(async () => {
      await knex('applications').insert([
        { name: 'app1', description: 'app1 desc' },
        { name: 'app2', description: 'app2 desc' },
        { name: 'app3', description: 'app3 desc' },
      ]);
      await knex('events').insert([
        { name: 'event1', application_id: 1, description: 'event1 desc' },
        { name: 'event2', application_id: 1, description: 'event2 desc' },
        { name: 'event3', application_id: 2, description: 'event3 desc' },
      ]);
    });

    it('should return 201 if notification is created', async () => {
      const response = await request(server).post('/api/notifications').send({
        name: 'notification1',
        eventId: 1,
        description: 'notification1 desc',
        templatebody: 'notification1 template {{name}}',
      });
      expect(response.status).toBe(httpStatus.StatusCodes.CREATED);
    });

    it('should return 400 if notification name is not provided', async () => {
      const response = await request(server).post('/api/notifications').send({
        eventId: 1,
        description: 'notification1 desc',
        templatebody: 'notification1 template {{name}}',
      });
      expect(response.status).toBe(httpStatus.StatusCodes.BAD_REQUEST);
    });

    it('should return 400 if notification event_id is not provided', async () => {
      const response = await request(server).post('/api/notifications').send({
        name: 'notification1',
        description: 'notification1 desc',
        templatebody: 'notification1 template {{name}}',
      });
      expect(response.status).toBe(httpStatus.StatusCodes.BAD_REQUEST);
    });

    it('should return 400 if notification templatebody is not provided', async () => {
      const response = await request(server).post('/api/notifications').send({
        name: 'notification1',
        eventId: 1,
        description: 'notification1 desc',
      });
      expect(response.status).toBe(httpStatus.StatusCodes.BAD_REQUEST);
    });

    it('should return 409 if notification name already exists', async () => {
      await knex('notifications').insert({
        name: 'notification1',
        event_id: 1,
        description: 'notification1 desc',
        templatebody: 'notification1 template {{name}}',
      });
      const response = await request(server).post('/api/notifications').send({
        name: 'notification1',
        eventId: 1,
        description: 'notification1 desc',
        templatebody: 'notification1 template {{name}}',
      });
      expect(response.status).toBe(httpStatus.StatusCodes.CONFLICT);
    });

    it('should return 200 if tagArray is created', async () => {
      const response = await request(server).post('/api/notifications').send({
        name: 'notification1',
        eventId: 1,
        description: 'notification1 desc',
        templatebody: 'notification1 template {{name}}',
      });
      expect(response.status).toBe(httpStatus.StatusCodes.CREATED);
      expect(response.body.tags[0].label).toEqual('name');
    });
  });

  describe('PATCH /:id', () => {
    beforeEach(async () => {
      await knex('applications').insert([
        { name: 'app1', description: 'app1 desc' },
        { name: 'app2', description: 'app2 desc' },
        { name: 'app3', description: 'app3 desc' },
      ]);
      await knex('events').insert([
        { name: 'event1', application_id: 1, description: 'event1 desc' },
        { name: 'event2', application_id: 1, description: 'event2 desc' },
        { name: 'event3', application_id: 2, description: 'event3 desc' },
      ]);
      await knex('notifications').insert({
        name: 'notification1',
        event_id: 1,
        description: 'notification1 desc',
        templatebody: 'notification1 template {{name}}',
      });
    });

    it('should return 200 if notification is updated', async () => {
      const response = await request(server)
        .patch('/api/notifications/1')
        .send({
          name: 'notification1-updated',

          description: 'notification1 desc',
          templatebody: 'notification1 template {{name}}',
        });
      // console.log(response);
      expect(response.status).toBe(httpStatus.StatusCodes.OK);
    });

    it('should return 404 if notification is not found', async () => {
      const response = await request(server)
        .patch('/api/notifications/101')
        .send({
          name: 'notification1',

          description: 'notification1 desc',
          templatebody: 'notification1 template {{name}}',
        });
      expect(response.status).toBe(httpStatus.StatusCodes.NOT_FOUND);
    });

    it('should return 200 if tagArray is updated', async () => {
      const response = await request(server)
        .patch('/api/notifications/1')
        .send({
          name: 'notification1-updated',
          description: 'notification1 desc',
          templatebody: 'notification1 template {{name}}',
        });

      expect(response.status).toBe(httpStatus.StatusCodes.OK);
      expect(response.body.tags[0].label).toEqual('name');
    });

    it('should rerurn 200 if the tag array is updated based on the tags in new template body passed', async () => {
      const response = await request(server)
        .patch('/api/notifications/1')
        .send({
          name: 'notification1-updated',
          description: 'notification1 desc',
          templatebody: 'notification1 template {{age}}',
        });
      expect(response.status).toBe(httpStatus.StatusCodes.OK);
      expect(response.body.tags[0].label).toEqual('age');
    });
  });

  describe('POST/:id/message', () => {
    beforeEach(async () => {
      await knex('applications').insert([
        { name: 'app1', description: 'app1 desc' },
        { name: 'app2', description: 'app2 desc' },
        { name: 'app3', description: 'app3 desc' },
      ]);
      await knex('events').insert({
        name: 'event1',
        application_id: 1,
        description: 'event1 desc',
      });
    });

    it('should return 200 if message is sent', async () => {
      let response = await request(server).post('/api/notifications').send({
        name: 'notification1',
        eventId: 1,
        description: 'notification1 desc',
        templatebody: 'notification1 template {{name}}',
      });
      response = await request(server)
        .post('/api/notifications/1/message')
        .send({
          applicationName: 'Application 1',
          eventName: 'Event 1',
          to: [
            {
              email: 'hassanNaeem@gmail.com',
              tags: {
                name: 'Hassan Naeem',
              },
            },
          ],
        });

      expect(response.status).toBe(httpStatus.StatusCodes.OK);
      expect(response.body.message).toEqual('Messages Saved in DB');
    });
    it('should return 404 if notification id is not valid and isnt found', async () => {
      const response = await request(server)
        .post('/api/notifications/100/message')
        .send({
          applicationName: 'Application 1',
          eventName: 'Event 1',
          to: [
            {
              email: 'hassan@gmail.com',
              tags: {
                name: 'Hassan Naeem',
              },
            },
          ],
        });

      expect(response.status).toBe(httpStatus.StatusCodes.NOT_FOUND);
    });
  });
});
