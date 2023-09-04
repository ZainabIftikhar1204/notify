/* eslint-disable no-undef */
const httpMocks = require('node-mocks-http');
const config = require('config');
const {
  getAppFilters,
  getEventFilters,
  getNotificationFilters,
} = require('../../../middleware/queryValidation');
// Adjust the path
jest.mock('config', () => ({
  get: jest.fn(),
}));

describe('getAppFilters', () => {
  it('should call next if validation passes', async () => {
    const validQuery = {
      is_active: false,
      name: 'Test App',
      description: 'This is a test app',
      sort: 'asc',
      sortby: 'name',
      page: 1,
      limit: 10,
    };

    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/api/applications',
      query: validQuery,
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    await getAppFilters(req, res, next);

    expect(res.statusCode).not.toBe(400);
    expect(res._isEndCalled()).toBeFalsy();
    expect(next).toHaveBeenCalled();

    // Check if the req.filter object is populated correctly
    expect(req.filter).toEqual({
      is_deleted: false,
      is_active: false,
      name: 'Test App',
      description: 'This is a test app',
    });
  });
});

describe('getEventFilters', () => {
  it('should call next if validation passes', async () => {
    // Create a valid query object based on your schema
    const validQuery = {
      is_active: true,
      name: 'Test Event',
      description: 'This is a test event',
      applicationId: 'mockId',
      sort: 'asc',
      sortby: 'name',
      page: 1,
      limit: 10,
    };

    // Mock the config.get function to return 'mongodb'
    config.get = jest.fn().mockReturnValue('mongodb');

    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/api/events',
      query: validQuery,
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    await getEventFilters(req, res, next);

    expect(res.statusCode).not.toBe(400);
    expect(res._isEndCalled()).toBeFalsy();
    expect(next).toHaveBeenCalled();

    // Check if the req.filter object is populated correctly
    expect(req.filter).toEqual({
      is_deleted: false,
      is_active: true,
      name: 'Test Event',
      description: 'This is a test event',
      applicationId: 'mockId',
    });
  });
});

describe('getNotificationFilters', () => {
  it('should call next if validation passes', async () => {
    // Create a valid query object based on your schema
    const validQuery = {
      is_active: true,
      name: 'Test Notification',
      description: 'This is a test notification',
      eventId: 'mockId',
      sort: 'asc',
      page: 1,
      limit: 10,
    };

    // Mock the config.get function to return 'mongodb'
    config.get = jest.fn().mockReturnValue('mongodb');

    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/api/notifications',
      query: validQuery,
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    await getNotificationFilters(req, res, next);

    expect(res.statusCode).not.toBe(400);
    expect(res._isEndCalled()).toBeFalsy();
    expect(next).toHaveBeenCalled();

    // Check if the req.filter object is populated correctly
    expect(req.filter).toEqual({
      is_deleted: false,
      is_active: true,
      name: 'Test Notification',
      description: 'This is a test notification',
      eventId: 'mockId',
    });
  });
});
