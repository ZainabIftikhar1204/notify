/* eslint-disable no-undef */
const httpMocks = require('node-mocks-http');

const error = require('../../../middleware/error');

describe('error', () => {
  it('should log the error', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/api/applications',
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    const err = new Error('Test error');
    await error(err, req, res, next);

    expect(next).not.toHaveBeenCalled();
  });
});
