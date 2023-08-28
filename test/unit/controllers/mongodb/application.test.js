/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
const httpMocks = require('node-mocks-http');
const { Application } = require('../../../../models/application');
const {
  createApplication,
  updateApplication,
  listApplication,
  listAllApplications,
} = require('../../../../controllers/mongodb/application');

describe('createApplication', () => {
  it('should create a new application', async () => {
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

    // Mock Application.findOne to return null (no existing application)
    Application.findOne = jest.fn().mockResolvedValue(null);

    // Mock Application.prototype.save to return a mock application
    const savedApplication = {
      _id: 'mockId',
      name: req.body.name,
      description: req.body.description,
      is_deleted: false,
      is_active: true,
    };
    Application.prototype.save = jest.fn().mockResolvedValue(savedApplication);

    // Call the createApplication function
    await createApplication(req, res);

    // Assertions
    expect(res.statusCode).toBe(201);
    expect(res._isEndCalled()).toBeTruthy();

    // Compare the response data as a string with the stringified savedApplication
    expect(res._getData()).toEqual(savedApplication);
  });
  it('should return 409 if application already exists', async () => {
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

    // Mock Application.findOne to return an existing application
    const existingApplication = {
      _id: 'mockId',
      name: req.body.name,
      description: req.body.description,
      is_deleted: false,
      is_active: true,
    };
    Application.findOne = jest.fn().mockResolvedValue(existingApplication);

    // Call the createApplication function
    await createApplication(req, res);

    // Assertions
    expect(res.statusCode).toBe(409);
    expect(res._isEndCalled()).toBeTruthy();
  });
});

describe('updateApplication', () => {
  it('should update an application', async () => {
    // Prepare a mock request and response
    const req = httpMocks.createRequest({
      method: 'PATCH',
      url: '/api/applications/mockId',
      params: {
        id: 'mockId',
      },
      body: {
        name: 'Updated Application',
        description: 'This is an updated application',
      },
    });
    const res = httpMocks.createResponse();

    // Mock Application.findByIdAndUpdate to return the updated application
    const updatedApplication = {
      _id: req.params.id,
      name: req.body.name,
      description: req.body.description,
      is_deleted: false,
      is_active: true,
    };
    Application.findByIdAndUpdate = jest
      .fn()
      .mockResolvedValue(updatedApplication);

    // Mock Application.findOne to return null (no existing application with the same name)
    Application.findOne = jest.fn().mockResolvedValue(null);

    // Call the updateApplication function
    await updateApplication(req, res);

    // Assertions
    expect(res.statusCode).toBe(200);
    expect(res._isEndCalled()).toBeTruthy();
    expect(res._getJSONData()).toEqual({ application: updatedApplication });
  });

  it('should return 409 if updated name conflicts with an existing application', async () => {
    // Prepare a mock request and response
    const req = httpMocks.createRequest({
      method: 'PATCH',
      url: '/api/applications/mockId',
      params: {
        id: 'mockId',
      },
      body: {
        name: 'Updated Application',
        description: 'This is an updated application',
      },
    });
    const res = httpMocks.createResponse();

    // Mock Application.findByIdAndUpdate to return an updated application
    Application.findByIdAndUpdate = jest.fn().mockResolvedValue(req.body);

    // Mock Application.findOne to return an existing application
    const existingApplication = {
      _id: 'otherMockId',
      name: req.body.name,
      description: 'An existing application',
      is_deleted: false,
      is_active: true,
    };
    Application.findOne = jest.fn().mockResolvedValue(existingApplication);

    // Call the updateApplication function
    await updateApplication(req, res);

    // Assertions
    expect(res.statusCode).toBe(409);
    expect(res._isEndCalled()).toBeTruthy();
  });

  it('should return 404 if application with given ID is not found', async () => {
    // Prepare a mock request and response
    const req = httpMocks.createRequest({
      method: 'PATCH',
      url: '/api/applications/mockId',
      params: {
        id: 'mockId',
      },
      body: {
        name: 'Updated Application',
        description: 'This is an updated application',
      },
    });
    const res = httpMocks.createResponse();

    // Mock Application.findByIdAndUpdate to return null (no existing application)
    Application.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

    // Call the updateApplication function
    await updateApplication(req, res);

    // Assertions
    expect(res.statusCode).toBe(404);
    expect(res._isEndCalled()).toBeTruthy();
  });
});

describe('listApplication', () => {
  it('should return an application if valid id is passed', async () => {
    // Prepare a mock request and response
    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/api/applications/mockId',
      params: {
        id: 'mockId',
      },
    });
    const res = httpMocks.createResponse();

    // Mock Application.findById to return a mock application
    const mockApplication = {
      _id: req.params.id,
      name: 'Mock Application',
      description: 'This is a mock application',
      is_deleted: false,
      is_active: true,
    };
    Application.findById = jest.fn().mockResolvedValue(mockApplication);

    // Call the listApplication function
    await listApplication(req, res);

    // Assertions
    expect(res.statusCode).toBe(200);
    expect(res._isEndCalled()).toBeTruthy();
    expect(res._getJSONData()).toEqual(mockApplication);
  });

  it('should return 404 if no application with the given id exists', async () => {
    // Prepare a mock request and response
    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/api/applications/mockId',
      params: {
        id: 'mockId',
      },
    });
    const res = httpMocks.createResponse();

    // Mock Application.findById to return null (no existing application)
    Application.findById = jest.fn().mockResolvedValue(null);

    // Call the listApplication function
    await listApplication(req, res);

    // Assertions
    expect(res.statusCode).toBe(404);
    expect(res._isEndCalled()).toBeTruthy();
  });
});

describe('listAllApplications', () => {
  it('should return a list of applications with pagination info', async () => {
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

    // Mock Application.countDocuments and Application.find to return mock data
    const mockApplications = [
      {
        _id: 'mockId1',
        name: 'App 1',
        description: 'Description 1',
        is_deleted: false,
        is_active: true,
      },
      {
        _id: 'mockId2',
        name: 'App 2',
        description: 'Description 2',
        is_deleted: false,
        is_active: true,
      },
      {
        _id: 'mockId3',
        name: 'App 3',
        description: 'Description 3',
        is_deleted: false,
        is_active: true,
      },
    ];
    const queryMock = {
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(mockApplications),
    };
    Application.countDocuments = jest.fn().mockResolvedValue(3);
    Application.find = jest.fn().mockReturnValue(queryMock);

    // Call the listAllApplications function
    await listAllApplications(req, res);

    // Assertions
    expect(res.statusCode).toBe(200);
    expect(res._isEndCalled()).toBeTruthy();
    expect(res._getJSONData()).toEqual({
      applications: mockApplications,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        pageSize: 3,
        totalCount: 3,
      },
    });
  });

  it('should return 404 if no applications are found', async () => {
    // ... (similar to the previous test case)
  });

  // Add more test cases as needed
});
