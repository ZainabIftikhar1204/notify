const httpMocks = require('node-mocks-http');
const uuid = require('uuid');
const logger = require('../../../startup/logger'); // Adjust the path

const traceIdMiddleware = require('../../../middleware/traceIdMiddleware'); // Adjust the path

describe('traceIdMiddleware', () => {
  it('should call next if trace ID is set in request header', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/api/applications',
      headers: {
        'X-Trace-ID': uuid.v4(),
      },
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();
    await traceIdMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
  it('should call next if trace ID is set in response header', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/api/applications',
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();
    await traceIdMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
  it('should set trace ID in request header if not set', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/api/applications',
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();
    await traceIdMiddleware(req, res, next);
    expect(req.headers['X-Trace-ID']).toBeDefined();
  });
  it('should set trace ID in response header if not set', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/api/applications',
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();
    await traceIdMiddleware(req, res, next);
    expect(res.getHeader('X-Trace-ID')).toBeDefined();
  });
  it('should set trace ID in request object', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/api/applications',
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();
    await traceIdMiddleware(req, res, next);
    expect(req.traceId).toBeDefined();
  });
});
