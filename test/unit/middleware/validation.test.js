/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
const httpMocks = require('node-mocks-http');
const config = require('config');
const {
  validateApp,
  validateUpdateApp,
  validateEvent,
  validateUpdateEvent,
  validateNotification,
  validateUpdateNotification,
  validateMessage,
} = require('../../../middleware/validation');

jest.mock('config', () => ({
  get: jest.fn(),
}));

describe('validateApp', (_req, _res, _next) => {
  it('should return 400 if validation fails', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      url: '/api/applications',
      body: {
        name: 'Test Application',
        description: 'T',
      },
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();
    await validateApp(req, res, next);
    expect(res.statusCode).toBe(400);
    expect(res._isEndCalled()).toBeTruthy();
  });
  it('should call next if validation passes', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      url: '/api/applications',
      body: {
        name: 'Test Application',
        description: 'This is a test application',
      },
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();
    await validateApp(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('validateUpdateApp', (_req, _res, _next) => {
  it('should return 400 if validation fails', async () => {
    const req = httpMocks.createRequest({
      method: 'PUT',
      url: '/api/applications',
      body: {
        name: 'Test Application',
        description: 'T',
      },
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();
    await validateApp(req, res, next);
    expect(res.statusCode).toBe(400);
    expect(res._isEndCalled()).toBeTruthy();
  });
  it('should call next if validation passes', async () => {
    const req = httpMocks.createRequest({
      method: 'PUT',
      url: '/api/applications',
      body: {
        name: 'Test Application',
        description: 'This is a test application',
      },
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();
    await validateUpdateApp(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('validateEvent', (_req, _res, _next) => {
  it('should return 400 if validation fails', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      url: '/api/events',
      body: {
        name: 'Test Event',
      },
    });
    config.get.mockReturnValue('mongodb');
    const res = httpMocks.createResponse();
    const next = jest.fn();
    await validateApp(req, res, next);
    expect(res.statusCode).toBe(400);
    expect(res._isEndCalled()).toBeTruthy();
  });
  it('should call next if validation passes', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      url: '/api/events',
      body: {
        name: 'Test Event',
        description: 'This is a test event',
        applicationId: 'mockId',
      },
    });
    config.get.mockReturnValue('mongodb');
    const res = httpMocks.createResponse();
    const next = jest.fn();
    await validateEvent(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('validateUpdateEvent', (_req, _res, _next) => {
  it('should return 400 if validation fails', async () => {
    const req = httpMocks.createRequest({
      method: 'PUT',
      url: '/api/events',
      body: {
        name: 'Test Event',
        description: 'T',
      },
    });
    config.get.mockReturnValue('mongodb');
    const res = httpMocks.createResponse();
    const next = jest.fn();
    await validateApp(req, res, next);
    expect(res.statusCode).toBe(400);
    expect(res._isEndCalled()).toBeTruthy();
  });
  it('should call next if validation passes', async () => {
    const req = httpMocks.createRequest({
      method: 'PUT',
      url: '/api/events',
      body: {
        name: 'Test Event',
        description: 'This is a test event',
        applicationId: 'mockId',
      },
    });
    config.get.mockReturnValue('mongodb');
    const res = httpMocks.createResponse();
    const next = jest.fn();
    await validateUpdateEvent(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('validateNotification', () => {
  it('should return 400 if validation fails', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      url: '/api/notifications',
      body: {
        name: 'Test Notification',
        description: 'T',
        templatebody: 'Short',
      },
    });
    config.get.mockReturnValue('mongodb');
    const res = httpMocks.createResponse();
    const next = jest.fn();

    await validateNotification(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res._isEndCalled()).toBeTruthy();
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if validation passes', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      url: '/api/notifications',
      body: {
        name: 'Test Notification',
        description: 'This is a test notification',
        templatebody: 'Long enough template body',
        eventId: 'mockId',
      },
    });
    config.get.mockReturnValue('mongodb');
    const res = httpMocks.createResponse();
    const next = jest.fn();

    await validateNotification(req, res, next);

    expect(res.statusCode).not.toBe(400);
    expect(res._isEndCalled()).toBeFalsy();
    expect(next).toHaveBeenCalled();
  });
});

describe('validateUpdateNotification', () => {
  it('should return 400 if validation fails', async () => {
    const req = httpMocks.createRequest({
      method: 'PUT',
      url: '/api/notifications',
      body: {
        name: 'Test Notification',
        description: 'T',
        templatebody: 'Short',
      },
    });
    config.get.mockReturnValue('mongodb');
    const res = httpMocks.createResponse();
    const next = jest.fn();

    await validateUpdateNotification(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res._isEndCalled()).toBeTruthy();
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if validation passes', async () => {
    const req = httpMocks.createRequest({
      method: 'PUT',
      url: '/api/notifications',
      body: {
        name: 'Test Notification',
        description: 'This is a test notification',
        templatebody: 'Long enough template body',
        eventId: 'mockId',
      },
    });
    config.get.mockReturnValue('mongodb');
    const res = httpMocks.createResponse();
    const next = jest.fn();

    await validateUpdateNotification(req, res, next);

    expect(res.statusCode).not.toBe(400);
    expect(res._isEndCalled()).toBeFalsy();
    expect(next).toHaveBeenCalled();
  });
});

describe('validateMessage', () => {
  it('should return 400 if validation fails', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      url: '/api/messages',
      body: {
        name: 'Test Message',
        description: 'T',
        templatebody: 'Short',
      },
    });
    config.get.mockReturnValue('mongodb');
    const res = httpMocks.createResponse();
    const next = jest.fn();

    await validateMessage(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res._isEndCalled()).toBeTruthy();
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if validation passes', async () => {
    const validRequest = {
      method: 'POST',
      url: '/api/messages',
      body: {
        eventId: 'validEventId',
        applicationName: 'Test Application',
        eventName: 'Test Event',
        to: [
          {
            email: 'test@example.com',
            tags: {
              tag1: 'value1',
              tag2: 'value2',
            },
          },
        ],
      },
    };

    const req = httpMocks.createRequest(validRequest);
    const res = httpMocks.createResponse();
    const next = jest.fn();

    await validateMessage(req, res, next);

    expect(res.statusCode).not.toBe(400);
    expect(res._isEndCalled()).toBeFalsy();
    expect(next).toHaveBeenCalled();
  });
});
