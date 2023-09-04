const request = require('supertest');
const { Application } = require('../../../../models/application');
const { Event } = require('../../../../models/event');

let server;

beforeAll(() => {
  // eslint-disable-next-line global-require
  server = require('../../../../index');
});

afterAll(async () => {
  await Promise.all([
    Event.deleteMany({}),
    Application.deleteMany({}),
    server.close(),
  ]);
});

describe('/api/events', () => {
  let applicationId;

  beforeEach(async () => {
    const application = await Application.collection.insertOne({
      name: 'app1',
      description: 'app1 desc',
      is_active: true,
      is_deleted: false,
    });
    applicationId = application.insertedId;

    const eventsData = [
      {
        name: 'event1',
        description: 'event1 desc',
        applicationId,
        is_deleted: false,
      },
      {
        name: 'event2',
        description: 'event2 desc',
        applicationId,
        is_deleted: false,
      },
      {
        name: 'event3',
        description: 'event3 desc',
        applicationId,
        is_deleted: false,
      },
    ];

    await Event.collection.insertMany(eventsData);
  });

  afterEach(async () => {
    await Event.deleteMany({});
  });

  describe('GET /', () => {
    it('should return all events', async () => {
      const response = await request(server).get(
        `/api/events/?applicationId=${applicationId}`,
      );
      // console.log(response);
      const { events } = response.body;
      expect(response.status).toBe(200);
      expect(events.length).toBe(3);
      expect(events.some((event) => event.name === 'event1')).toBeTruthy();
      expect(events.some((event) => event.name === 'event2')).toBeTruthy();
      expect(events.some((event) => event.name === 'event3')).toBeTruthy();
    });

    it('should return 404 if application with the given id is not found', async () => {
      const response = await request(server).post('/api/events').send({
        name: 'event1',
        description: 'event1 desc',
        applicationId: '123456789012',
      });

      expect(response.status).toBe(404);
    });
    it('should test pagination with page =1 and limit = 1', async () => {
      const response = await request(server).get(
        `/api/events/?applicationId=${applicationId}&page=1&limit=1`,
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('events');
      expect(response.body.events.length).toEqual(1);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('pageSize');
    });
    it('should test filter by name incomplete', async () => {
      const response = await request(server).get(
        `/api/events/?applicationId=${applicationId}&name=ev`,
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('events');
      expect(response.body.events.length).toEqual(3);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('pageSize');
    });
    it('should test filter by name complete', async () => {
      const response = await request(server).get(
        `/api/events/?applicationId=${applicationId}&name=event1`,
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('events');
      expect(response.body.events.length).toEqual(1);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('pageSize');
    });
    it('should return empty array if no events are found', async () => {
      await Event.deleteMany({});

      const response = await request(server).get(
        `/api/events/?applicationId=${applicationId}`,
      );
      const { events } = response.body;

      expect(response.status).toBe(200);
      expect(events.length).toBe(0);
    });
  });

  describe('POST /api/events', () => {
    it('should return 201 if event is created', async () => {
      const response = await request(server).post('/api/events').send({
        name: 'event1 - creation',
        description: 'event1 desc',
        applicationId,
      });

      expect(response.status).toBe(201);
    });

    it('should return 404 if application with the given id is not found', async () => {
      const response = await request(server).post('/api/events').send({
        name: 'event1',
        description: 'event1 desc',
        applicationId: '123456789012',
      });

      expect(response.status).toBe(404);
    });

    it('should return 409 if event with the same name already exists in the application', async () => {
      await request(server).post('/api/events').send({
        name: 'event1',
        description: 'event1 desc',
        applicationId,
      });

      const response = await request(server).post('/api/events').send({
        name: 'event1',
        description: 'event1 desc',
        applicationId,
      });

      expect(response.status).toBe(409);
    });
  });

  describe('PATCH /api/events/:id', () => {
    let eventId;

    beforeEach(async () => {
      const event = await Event.collection.insertOne({
        name: 'event1',
        description: 'event1 desc',
        applicationId,
      });
      eventId = event.insertedId;

      await Event.collection.insertOne({
        name: 'event3',
        description: 'event3 desc',
        applicationId,
      });
    });

    it('should return 200 if event is updated', async () => {
      const response = await request(server)
        .patch(`/api/events/${eventId}`)
        .send({
          name: 'event2 updated',
          description: 'event2 desc',
        });

      expect(response.status).toBe(200);
    });

    it('should return 404 if event with the given id is not found', async () => {
      const response = await request(server)
        .patch('/api/events/123456789012')
        .send({
          name: 'event2',
          description: 'event2 desc',
        });

      expect(response.status).toBe(404);
    });

    it('should return 409 if event with the same name already exists in the application', async () => {
      const response = await request(server)
        .patch(`/api/events/${eventId}`)
        .send({
          name: 'event3',
          description: 'event2 desc',
        });

      expect(response.status).toBe(409);
    });
  });
});
