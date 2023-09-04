const httpStatus = require('http-status-codes');
const request = require('supertest');

describe('/api/events', () => {
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
        {
          name: 'event1',
          application_id: 1,
          description: 'event1 desc',
          is_active: true,
        },
        {
          name: 'event2',
          application_id: 1,
          description: 'event2 desc',
          is_active: false,
        },
        {
          name: 'event3',
          application_id: 2,
          description: 'event3 desc',
          is_active: true,
        },
      ]);
    });

    it('should return all events', async () => {
      const response = await request(server).get('/api/events').query({
        applicationId: 1,
      });
      const { events } = response.body;
      expect(response.status).toBe(httpStatus.StatusCodes.OK);
      expect(events.length).toBe(2);
      expect(events.some((event) => event.name === 'event1')).toBeTruthy();
      expect(events.some((event) => event.name === 'event2')).toBeTruthy();
    });
    it('should return all events with pagination', async () => {
      const response = await request(server)
        .get('/api/events')
        .query({ applicationId: 1, page: 1, limit: 1 });
      const { events, pagination } = response.body;
      expect(response.status).toBe(httpStatus.StatusCodes.OK);
      expect(events.length).toBe(1);
      expect(events.some((event) => event.name === 'event1')).toBeTruthy();
      expect(pagination.currentPage).toBe(1);
      expect(pagination.totalPages).toBe(2);
      expect(pagination.pageSize).toBe(1);
      expect(pagination.totalCount).toBe('2');
    });
    it('should return all events with sorting', async () => {
      const response = await request(server)
        .get('/api/events')
        .query({ applicationId: 1, sort: 'desc', sortby: 'name' });
      const { events } = response.body;
      expect(response.status).toBe(httpStatus.StatusCodes.OK);
      expect(events.length).toBe(2);
      expect(events[0].name).toBe('event2');
      expect(events[1].name).toBe('event1');
    });
    it('should return all events with filtering', async () => {
      const response = await request(server)
        .get('/api/events')
        .query({ applicationId: 1, is_active: true });
      const { events } = response.body;
      expect(response.status).toBe(httpStatus.StatusCodes.OK);
      expect(events.length).toBe(1);
      expect(events.some((event) => event.name === 'event1')).toBeTruthy();
    });

    it('should return 404 if no events are found', async () => {
      const response = await request(server).get('/api/events').query({
        applicationId: 101,
      });
      expect(response.status).toBe(httpStatus.StatusCodes.NOT_FOUND);
    });
  });

  describe('POST /', () => {
    beforeEach(async () => {
      await knex('applications').insert([
        { name: 'app1', description: 'app1 desc' },
      ]);
    });

    it('should create a new event if request is valid', async () => {
      const response = await request(server).post('/api/events').send({
        name: 'event1',
        applicationId: 1,
        description: 'event1 desc',
      });
      expect(response.status).toBe(httpStatus.StatusCodes.CREATED);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('name', 'event1');
    });

    it('should return 400 if name is not provided', async () => {
      const response = await request(server)
        .post('/api/events')
        .send({ applicationId: 1, description: 'event1 desc' });
      expect(response.status).toBe(httpStatus.StatusCodes.BAD_REQUEST);
    });

    it('should return 400 if application_id is not provided', async () => {
      const response = await request(server)
        .post('/api/events')
        .send({ name: 'event1', description: 'event1 desc' });
      expect(response.status).toBe(httpStatus.StatusCodes.BAD_REQUEST);
    });

    it('should return 400 if description is not provided', async () => {
      const response = await request(server)
        .post('/api/events')
        .send({ name: 'event1', applicationId: 1 });
      expect(response.status).toBe(httpStatus.StatusCodes.BAD_REQUEST);
    });

    it('should return 404 if application with the given ID does not exist', async () => {
      const response = await request(server).post('/api/events').send({
        name: 'event1',
        applicationId: 101,
        description: 'event1 desc',
      });

      expect(response.status).toBe(httpStatus.StatusCodes.NOT_FOUND);
    });
  });

  describe('PATCH /:id', () => {
    beforeEach(async () => {
      await knex('applications').insert([
        { name: 'app1', description: 'app1 desc' },
      ]);
      await knex('events').insert([
        { name: 'event1', application_id: 1, description: 'event1 desc' },
      ]);
    });

    it('should update the event if request is valid', async () => {
      const response = await request(server).patch('/api/events/1').send({
        name: 'event2',
        description: 'event2 desc',
      });
      expect(response.status).toBe(httpStatus.StatusCodes.OK);
      expect(response.body).toHaveProperty('name', 'event2');
    });

    it('should return 404 if event with the given ID does not exist', async () => {
      const response = await request(server).patch('/api/events/101').send({
        name: 'event2',
        description: 'event2 desc',
      });
      expect(response.status).toBe(httpStatus.StatusCodes.NOT_FOUND);
    });

    it('should return 400 if nothing is provided', async () => {
      const response = await request(server).patch('/api/events/1').send({});
      expect(response.status).toBe(httpStatus.StatusCodes.BAD_REQUEST);
    });

    it('should return 409 if name is already taken', async () => {
      await knex('events').insert([
        { name: 'event2', application_id: 1, description: 'event2 desc' },
      ]);
      const response = await request(server).patch('/api/events/1').send({
        name: 'event2',
      });
      expect(response.status).toBe(httpStatus.StatusCodes.CONFLICT);
    });
  });
});
