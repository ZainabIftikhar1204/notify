const request = require('supertest');
const httpStatus = require('http-status-codes');

describe('/api/applications', () => {
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
    try {
      await knex.migrate.rollback(); // Rollback migrations after all tests
    } catch (error) {
      // console.log(error);
    }
  });

  describe('GET /', () => {
    beforeEach(async () => {
      await knex('applications').insert([
        { name: 'app1', description: 'app1 desc' },
        { name: 'app2', description: 'app2 desc' },
        { name: 'app3', description: 'app3 desc' },
      ]);
    });

    it('should return all applications', async () => {
      const response = await request(server).get('/api/applications');
      const { applications } = response.body;
      expect(response.status).toBe(httpStatus.OK);
      expect(applications.length).toBe(3);
      expect(applications.some((app) => app.name === 'app1')).toBeTruthy();
      expect(applications.some((app) => app.name === 'app2')).toBeTruthy();
      expect(applications.some((app) => app.name === 'app3')).toBeTruthy();
    });

    it('should return 404 if no applications are found', async () => {
      await knex('applications').del(); // Simulate no applications
      const response = await request(server).get('/api/applications');
      expect(response.status).toBe(httpStatus.StatusCodes.NOT_FOUND);
    });
  });

  describe('GET /:id', () => {
    beforeEach(async () => {
      await knex('applications').insert([
        { name: 'app1', description: 'app1 desc' },
        { name: 'app2', description: 'app2 desc' },
        { name: 'app3', description: 'app3 desc' },
      ]);
    });

    it('should return an application if valid id is passed', async () => {
      const application = await knex('applications')
        .where({ name: 'app1' })
        .first();
      const response = await request(server).get(
        `/api/applications/${application.id}`,
      );
      expect(response.status).toBe(httpStatus.StatusCodes.OK);
      expect(response.body).toHaveProperty('name', application.name);
    });

    it('should return 404 if invalid id is passed', async () => {
      const response = await request(server).get('/api/applications/101');
      expect(response.status).toBe(httpStatus.StatusCodes.NOT_FOUND);
    });
  });

  describe('POST /', () => {
    let name = 'app1';
    const description = 'app1 desc';

    const exec = () =>
      request(server).post('/api/applications').send({
        name,
        description,
      });

    it('should return 201 if application is valid', async () => {
      const response = await exec();
      expect(response.status).toBe(httpStatus.StatusCodes.CREATED);
      expect(response.body).toHaveProperty('name', 'app1');
      expect(response.body).toHaveProperty('description', 'app1 desc');
    });

    it('should return 409 if application with same name already exists', async () => {
      await knex('applications').insert({ name, description });
      const response = await exec();
      expect(response.status).toBe(httpStatus.StatusCodes.CONFLICT);
    });

    it('should return 400 if name is less than 3 characters', async () => {
      name = '12';
      const response = await exec();
      expect(response.status).toBe(httpStatus.StatusCodes.BAD_REQUEST);
    });

    // Other test cases...
  });

  describe('PATCH /:id', () => {
    let name;
    let description;
    let id;

    beforeEach(async () => {
      name = 'app3';
      description = 'app1 desc';
      let app = await knex('applications')
        .insert({ name, description })
        .returning('*');
      app = app[0]; //eslint-disable-line
      id = app.id;
    });

    it('should return 200 if application is valid', async () => {
      const response = await request(server)
        .patch(`/api/applications/${id}`)
        .send({
          name: 'app2',
          description,
        });
      expect(response.status).toBe(httpStatus.StatusCodes.OK);
      expect(response.body).toHaveProperty('name', 'app2');
      expect(response.body).toHaveProperty('description', description);
    });

    it('should return 404 if application is not found', async () => {
      id = 12;
      const response = await await request(server)
        .patch(`/api/applications/${id}`)
        .send({
          name,
          description,
        });
      expect(response.status).toBe(httpStatus.StatusCodes.NOT_FOUND);
    });

    it('should return 409 if application with same name already exists', async () => {
      await knex('applications').insert({ name: 'app_conflict', description });
      const response = await await request(server)
        .patch(`/api/applications/${id}`)
        .send({
          name: 'app_conflict',
          description,
        });
      expect(response.status).toBe(httpStatus.StatusCodes.CONFLICT);
    });

    it('should return 400 if invalid id is passed in string format', async () => {
      id = 'abc';
      const response = await await request(server)
        .patch(`/api/applications/${id}`)
        .send({
          name,
          description,
        });
      expect(response.status).toBe(httpStatus.StatusCodes.BAD_REQUEST);
    });
  });
});
