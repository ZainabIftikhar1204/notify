const httpMocks = require('node-mocks-http');
const {
  listAllApplications,
  createApplication,
  updateApplication,
} = require('../../../../controllers/postgresdb/application');
const knex = require('../../../../startup/postgresdb/db');

jest.mock('../../../../startup/postgresdb/db');

describe('listAllApplications', () => {
  it('should return all applications', async () => {
    // Prepare a mock request and response
    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/api/applications',
      query: {
        page: 1,
        limit: 3,
      },
      filter: {},
    });
    const res = httpMocks.createResponse();

    // Mock the Knex query methods
    const mockApplications = [
      {
        id: 1,
        name: 'Test Application',
        description: 'This is a test application',
        is_deleted: false,
        is_active: true,
      },
      {
        id: 2,
        name: 'Test Application 2',
        description: 'This is a test application 2',
        is_deleted: false,
        is_active: true,
      },
    ];

    knex.mockReturnValue({
      count: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          first: jest.fn().mockReturnValue({
            totalDocuments: 2,
          }),
        }),
      }),

      select: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          offset: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue(mockApplications),
          }),
        }),
      }),
    });

    await listAllApplications(req, res);
    // Parse the response data
    const responseData = JSON.parse(res._getData());

    // Assertions
    expect(res.statusCode).toBe(200);
    expect(res._isEndCalled()).toBeTruthy();
    expect(responseData).toEqual({
      applications: mockApplications,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        pageSize: 3,
        totalCount: mockApplications.length,
      },
    });
  });
  it('should return 404 if no applications are found', async () => {
    // Prepare a mock request and response
    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/api/applications',
      query: {
        page: 1,
        limit: 3,
      },
      filter: {},
    });
    const res = httpMocks.createResponse();

    // Mock the Knex query methods
    knex.mockReturnValue({
      count: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          first: jest.fn().mockReturnValue({
            totalDocuments: 0,
          }),
        }),
      }),

      select: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          offset: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue([]),
          }),
        }),
      }),
    });

    await listAllApplications(req, res);
    // Parse the response data
    const responseData = JSON.parse(res._getData());

    // Assertions
    expect(res.statusCode).toBe(404);
    expect(res._isEndCalled()).toBeTruthy();
    expect(responseData).toEqual({
      error: 'Not Found',
      message: 'No applications found.',
    });
  });
});

describe('createApplication', () => {
  it('should return 409 if application with the name already exists', async () => {
    // Prepare a mock request and response
    const req = httpMocks.createRequest({
      method: 'POST',
      url: '/api/applications',
      body: {
        name: 'Test Application',
        description: 'This is a test application',
      },
    });
    const res = httpMocks.createResponse();

    // Mock the Knex query methods
    knex.mockReturnValue({
      insert: jest.fn().mockReturnValue([1]),
      where: jest.fn().mockReturnValue({
        first: jest.fn().mockReturnValue({
          name: 'Test Application',
        }),
      }),
    });

    await createApplication(req, res);
    // Parse the response data
    const responseData = JSON.parse(res._getData());

    // Assertions
    expect(res.statusCode).toBe(409);
    expect(res._isEndCalled()).toBeTruthy();
    expect(responseData).toEqual({
      error: 'Conflict',
      message: 'Application with the name already exists.',
    });
  });
  it('should return 201 if application is created successfully', async () => {
    // Prepare a mock request and response
    const req = httpMocks.createRequest({
      method: 'POST',
      url: '/api/applications',
      body: {
        name: 'Test Application',
        description: 'This is a test application',
      },
    });
    const res = httpMocks.createResponse();

    // Mock the Knex query methods
    knex.mockReturnValue({
      insert: jest.fn().mockReturnValue({
        returning: jest.fn().mockReturnValue([
          {
            id: 1,
            name: 'Test Application',
            description: 'This is a test application',
            is_deleted: false,
            is_active: true,
          },
        ]),
      }),
      where: jest.fn().mockReturnValue({
        first: jest.fn().mockReturnValue(null),
      }),
    });

    await createApplication(req, res);

    // Parse the response data
    const responseData = res._getData();

    // Assertions
    expect(res.statusCode).toBe(201);
    expect(res._isEndCalled()).toBeTruthy();
    expect(responseData).toEqual({
      id: 1,
      name: 'Test Application',
      description: 'This is a test application',
      is_deleted: false,
      is_active: true,
    });
  });
});

describe('updateApplication', () => {
  it('should return 404 if application is not found', async () => {
    // Prepare a mock request and response
    const req = httpMocks.createRequest({
      method: 'PATCH',
      url: '/api/applications/1',
      params: {
        id: 1,
      },
      body: {
        name: 'Test Application',
        description: 'This is a test application',
      },
    });
    const res = httpMocks.createResponse();

    // Mock the Knex query methods
    knex.mockReturnValue({
      where: jest.fn().mockReturnValue({
        update: jest.fn().mockReturnValue({
          returning: jest.fn().mockReturnValue([]),
        }),
        first: jest.fn().mockReturnValue(null),
      }),
    });

    await updateApplication(req, res);

    // Parse the response data
    const responseData = JSON.parse(res._getData());

    // Assertions
    expect(res.statusCode).toBe(404);
    expect(res._isEndCalled()).toBeTruthy();
    expect(responseData).toEqual({
      error: 'Not Found',
      message: 'The application with the given ID was not found.',
    });
  });
  it('should return 409 if application with the name already exists', async () => {
    // Prepare a mock request and response
    const req = httpMocks.createRequest({
      method: 'PATCH',
      url: '/api/applications/1',
      params: {
        id: 1,
      },
      body: {
        name: 'Test Application',
        description: 'This is a test application',
      },
    });
    const res = httpMocks.createResponse();

    // Mock the Knex query methods
    knex.mockReturnValue({
      where: jest.fn().mockReturnValue({
        update: jest.fn().mockReturnValue(1),
        first: jest.fn().mockReturnValue({
          returning: jest.fn().mockReturnValue({
            name: 'Test Application',
          }),
        }),
      }),
      first: jest.fn().mockReturnValue({
        name: 'Test Application',
      }),
    });

    await updateApplication(req, res);

    // Parse the response data
    const responseData = JSON.parse(res._getData());

    // Assertions
    expect(res.statusCode).toBe(409);
    expect(res._isEndCalled()).toBeTruthy();
    expect(responseData).toEqual({
      error: 'Conflict',
      message: 'Application with the name already exists.',
    });
  });
  it('should return 200 if application is updated successfully', async () => {
    // Prepare a mock request and response
    const req = httpMocks.createRequest({
      method: 'PATCH',
      url: '/api/applications/1',
      params: {
        id: 1,
      },
      body: {
        name: 'Test Application1',
        description: 'This is a test application',
      },
    });
    const res = httpMocks.createResponse();
    // Mock for existingApplication
    knex.mockReturnValueOnce({
      where: jest.fn().mockReturnValueOnce({
        first: jest.fn().mockResolvedValue({
          // Mocked data for an existing application
          id: 1,
          name: 'Existing Application',
          description: 'This is an existing application',
          is_deleted: false,
          is_active: true,
        }),
      }),
    });

    // Mock the Knex query methods
    knex.mockReturnValue({
      where: jest.fn().mockReturnValue({
        update: jest.fn().mockReturnValue({
          returning: jest.fn().mockReturnValue([
            {
              id: 1,
              name: 'Test Application is updated',
              description: 'This is a test application',
              is_deleted: false,
              is_active: true,
            },
          ]),
        }),
      }),
    });
    // Mock for application
    knex.mockReturnValueOnce({
      where: jest.fn().mockReturnValueOnce({
        first: jest.fn().mockResolvedValue(null),
      }),
    });

    await updateApplication(req, res);

    // Parse the response data
    const responseData = res._getData();

    // Assertions
    expect(res.statusCode).toBe(200);
    expect(res._isEndCalled()).toBeTruthy();
    expect(responseData).toEqual({
      id: 1,
      name: 'Test Application is updated',
      description: 'This is a test application',
      is_deleted: false,
      is_active: true,
    });
  });
});
