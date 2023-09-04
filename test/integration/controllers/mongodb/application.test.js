/* eslint-disable global-require */
/* eslint-disable no-shadow */
const request = require('supertest');
const mongoose = require('mongoose');
const httpStatus = require('http-status-codes');
const { Application } = require('../../../../models/application');

let server;

describe('/api/applications', () => {
  describe('GET /', () => {
    beforeAll(async () => {
      // eslint-disable-next-line global-require
      server = require('../../../../index');
      // populate db
      await Application.collection.insertMany([
        {
          name: 'app1',
          description: 'app1 desc',
          is_deleted: false,
          is_active: true,
        },
        {
          name: 'app2',
          description: 'app2 desc',
          is_deleted: false,
          is_active: false,
        },
        {
          name: 'app3',
          description: 'app3 desc',
          is_deleted: false,
          is_active: true,
        },
      ]);
    });

    afterAll(async () => {
      // clean up db
      await Application.deleteMany({});
      await server.close();
    });
    it('should return all applications', async () => {
      const response = await request(server).get('/api/applications');
      const { applications } = response.body; // Extract the array of applications from the response body
      expect(response.status).toBe(200);
      expect(applications.length).toBe(3); // Assuming you're expecting 3 applications

      // Check if specific applications are present
      expect(applications.some((app) => app.name === 'app1')).toBeTruthy();
      expect(applications.some((app) => app.name === 'app2')).toBeTruthy();
      expect(applications.some((app) => app.name === 'app3')).toBeTruthy();
    });
    it('should test pagination  with page =1 and limit = 1', async () => {
      const response = await request(server).get(
        '/api/applications?page=1&limit=1',
      );
      expect(response.status).toBe(httpStatus.StatusCodes.OK);
      expect(response.body).toHaveProperty('applications');
      expect(response.body.applications.length).toEqual(1);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('pageSize');
    });
    it('should test filter by name incomplete', async () => {
      const response = await request(server).get('/api/applications?name=ap');
      expect(response.status).toBe(httpStatus.StatusCodes.OK);
      expect(response.body).toHaveProperty('applications');
      expect(response.body.applications.length).toEqual(3);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('pageSize');
    });
    it('should test filter by name complete', async () => {
      const response = await request(server).get('/api/applications?name=app1');
      expect(response.status).toBe(httpStatus.StatusCodes.OK);
      expect(response.body).toHaveProperty('applications');
      expect(response.body.applications.length).toEqual(1);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('pageSize');
    });
    it('should test filter by is_active', async () => {
      const response = await request(server).get(
        '/api/applications?is_active=true',
      );
      expect(response.status).toBe(httpStatus.StatusCodes.OK);
      expect(response.body).toHaveProperty('applications');
      expect(response.body.applications.length).toEqual(2);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('pageSize');
    });
    it('should test filter by is_active and name', async () => {
      const response = await request(server).get(
        '/api/applications?is_active=true&name=app1',
      );
      expect(response.status).toBe(httpStatus.StatusCodes.OK);
      expect(response.body).toHaveProperty('applications');
      expect(response.body.applications.length).toEqual(1);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('pageSize');
    });
    it('should test sort by name', async () => {
      const response = await request(server).get(
        '/api/applications?sort=desc&sortby=name',
      );
      expect(response.status).toBe(httpStatus.StatusCodes.OK);
      expect(response.body).toHaveProperty('applications');
      expect(response.body.applications.length).toEqual(3);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('pageSize');
      expect(response.body.applications[0]).toHaveProperty('name', 'app3');
    });
    it('should test sort by is_active', async () => {
      const response = await request(server).get(
        '/api/applications?sort=asc&sortby=is_active',
      );
      expect(response.status).toBe(httpStatus.StatusCodes.OK);
      expect(response.body).toHaveProperty('applications');
      expect(response.body.applications.length).toEqual(3);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('pageSize');
      expect(response.body.applications[0]).toHaveProperty('name', 'app2');
    });
    it('should return 404 if no applications are found', async () => {
      // clean up db
      await Application.deleteMany({});
      const response = await request(server).get('/api/applications');
      expect(response.status).toBe(404);
    });
  });
  describe('GET /:id', () => {
    beforeAll(async () => {
      // eslint-disable-next-line global-require
      server = require('../../../../index');
      // populate db
      await Application.collection.insertMany([
        { name: 'app1', description: 'app1 desc' },
        { name: 'app2', description: 'app2 desc' },
        { name: 'app3', description: 'app3 desc' },
      ]);
    });

    afterAll(async () => {
      // clean up db
      await Application.deleteMany({});
      await server.close();
    });
    it('should return an application if valid id is passed', async () => {
      const app = await Application.findOne({ name: 'app1' }); // Use findOne instead of find
      const response = await request(server).get(`/api/applications/${app.id}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', app.name);
    });

    it('should return 500 if invalid id is passed', async () => {
      const response = await request(server).get('/api/applications/1');
      expect(response.status).toBe(500);
    });

    it('should return 404 if no application with the given id exists', async () => {
      const id = new mongoose.Types.ObjectId(); // Make sure mongoose is imported and initialized
      const response = await request(server).get(`/api/applications/${id}`);
      expect(response.status).toBe(404);
    });
  });
  describe('POST /', () => {
    let name;
    let description;
    let server;
    beforeEach(() => {
      server = require('../../../../index');
      name = 'app1';
      description = 'app1 desc';
    });
    afterEach(async () => {
      await Application.deleteMany({});
      await server.close();
    });
    const exec = async () =>
      // eslint-disable-next-line no-return-await
      await request(server)
        .post('/api/applications')
        .send({ name, description });
    it('should return 400 if name is less than 3 characters', async () => {
      name = '12';
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it('should return 400 if name is more than 50 characters', async () => {
      name = new Array(52).join('a');
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it('should save the application if it is valid', async () => {
      await exec();
      const application = await Application.find({ name: 'app1' });
      expect(application).not.toBeNull();
    });
    it('should return the application if it is valid', async () => {
      const res = await exec();
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'app1');
      expect(res.body).toHaveProperty('description', 'app1 desc');
    });
    it('should return 409 if application with the same name already exists', async () => {
      await exec();
      const res = await exec();
      expect(res.status).toBe(409);
    });
  });
  describe('PATCH /:id', () => {
    let name;
    let description;
    let server;
    let id;
    beforeEach(async () => {
      server = require('../../../../index');
      name = 'app1';
      description = 'app1 desc';
      let app = new Application({ name, description });
      app = await app.save();
      id = app.id;
    });
    afterEach(async () => {
      await Application.deleteMany({});
      await server.close();
    });
    const exec = async () =>
      // eslint-disable-next-line no-return-await
      await request(server)
        .patch(`/api/applications/${id}`)
        .send({ name, description });
    it('should return 400 if name is less than 3 characters', async () => {
      name = '12';
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it('should return 404 if no application with the given id exists', async () => {
      id = new mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });
    it('should return 409 if application with the same name already exists', async () => {
      await exec();
      const res = await exec();
      expect(res.status).toBe(409);
    });
    it('should update the application if input is valid', async () => {
      await exec();
      const updatedApplication = await Application.findOne({ name: 'app1' });
      expect(updatedApplication).not.toBeNull();
      expect(updatedApplication).toHaveProperty('name', 'app1');
      expect(updatedApplication).toHaveProperty('description', 'app1 desc');
    });
  });
});
