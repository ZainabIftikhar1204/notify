//integration test for my validation middleware file
const httpStatus = require('http-status-codes');
const request = require('supertest');
const {
    validateApp,
    validateUpdateApp,
    validateEvent,
    validateUpdateEvent,
    validateNotification,
    validateUpdateNotification,
    validateMessage
} = require('../../../middleware/validation');


let server;

describe('validateApp', () => {
   server=require('../../../index');
    afterEach(()=>{
        //delete all data from db

        server.close();
    }
    )
    it('should return 400 if name is missing', () => {
        const req = {
          body: {
            description: 'test description',
          },
        };
        const res = {
          status: jest.fn().mockReturnThis(), // Chainable mock
          json: jest.fn(),
        };
        validateApp(req, res, () => {});
        expect(res.status).toHaveBeenCalledWith(httpStatus.StatusCodes.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({
          error: '"name" is required',
        });
    });
    it('should return 400 if name is less than 3 characters', () => {
        const req = {
          body: {
            name: 'te',
            description: 'test description',
          },
        };
        const res = {
          status: jest.fn().mockReturnThis(), // Chainable mock
          json: jest.fn(),
        };
        validateApp(req, res, () => {});
        expect(res.status).toHaveBeenCalledWith(httpStatus.StatusCodes.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({
          error: '"name" length must be at least 3 characters long',
        });
    });      
    it('should return 400 if name is more than 25 characters', () => {
        const name='aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        const req = {
          body: {
           name,
        description: 'test description',
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(), // Chainable mock
            json: jest.fn(),
        };
        validateApp(req, res, () => {});
        expect(res.status).toHaveBeenCalledWith(httpStatus.StatusCodes.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({
            error: `"name" length must be less than or equal to 25 characters long`,
        });
    });
    it('should return 400 if description is missing', () => {
        const req = {
          body: {
            name: 'test name',
          },
        };
        const res = {
          status: jest.fn().mockReturnThis(), // Chainable mock
          json: jest.fn(),
        };
        validateApp(req, res, () => {});
        expect(res.status).toHaveBeenCalledWith(httpStatus.StatusCodes.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({
          error: '"description" is required',
        });
    });
    it ("should return 400 if anything else is sent in the body",()=>{
        const req = {
            body: {
              name: 'test name',
              description: 'test description',
              is_deleted: true,
              is_active: true,
            },
          };
          const res = {
            status: jest.fn().mockReturnThis(), // Chainable mock
            json: jest.fn(),
          };
          validateApp(req, res, () => {});
          expect(res.status).toHaveBeenCalledWith(httpStatus.StatusCodes.BAD_REQUEST);
          expect(res.json).toHaveBeenCalledWith({
            error: '"is_deleted" is not allowed',
          });
    });
 
});

describe('validateUpdateApp', () => {
    server=require('../../../index');
    afterEach(()=>{
        //delete all data from db

        server.close();
    }
    )
    it('should return 400 if name is less than 3 characters', () => {
        const req = {
          body: {
            name: 'te',
          },
        };
        const res = {
          status: jest.fn().mockReturnThis(), // Chainable mock
          json: jest.fn(),
        };
        validateUpdateApp(req, res, () => {});
        expect(res.status).toHaveBeenCalledWith(httpStatus.StatusCodes.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({
          error: '"name" length must be at least 3 characters long',
        });
    });      
    it('should return 400 if name is more than 25 characters', () => {
        const name='aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        const req = {
          body: {
           name,
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(), // Chainable mock
            json: jest.fn(),
        };
        validateUpdateApp(req, res, () => {});
        expect(res.status).toHaveBeenCalledWith(httpStatus.StatusCodes.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({
            error: `"name" length must be less than or equal to 25 characters long`,
        });
    });
    it ("should return 400 if anything else is sent in the body",()=>{
        const req = {
            body: {
              name: 'test name',
              description: 'test description',
              is_deleted: true,
              is_active: true,
              gucci: 'gucci',

            },
          };
          const res = {
            status: jest.fn().mockReturnThis(), // Chainable mock
            json: jest.fn(),
          };
          validateUpdateApp(req, res, () => {});
          expect(res.status).toHaveBeenCalledWith(httpStatus.StatusCodes.BAD_REQUEST);
          expect(res.json).toHaveBeenCalledWith({
            error: '"gucci" is not allowed',
          });
    });
    it ("should return 400 if nothing is sent in the body",()=>{
        const req = {
            body: {
            },
          };
          const res = {
            status: jest.fn().mockReturnThis(), // Chainable mock
            json: jest.fn(),
          };
          validateUpdateApp(req, res, () => {});
          expect(res.status).toHaveBeenCalledWith(httpStatus.StatusCodes.BAD_REQUEST);
          expect(res.json).toHaveBeenCalledWith({
            error: '"value" must contain at least one of [name, description, is_deleted, is_active]',
          });
    });
 
});

describe('validateEvent', () => {
    server=require('../../../index');
    afterEach(()=>{
        //delete all data from db

        server.close();
    }
    )
    it('should return 400 if name is missing', () => {
        const req = {
          body: {
            description: 'test description',
          },
        };
        const res = {
          status: jest.fn().mockReturnThis(), // Chainable mock
          json: jest.fn(),
        };
        validateEvent(req, res, () => {});
        expect(res.status).toHaveBeenCalledWith(httpStatus.StatusCodes.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({
          error: '"name" is required',
        });
    });
    it('should return 400 if name is less than 3 characters', () => {
        const req = {
          body: {
            name: 'te',
            description: 'test description',
          },
        };
        const res = {
          status: jest.fn().mockReturnThis(), // Chainable mock
          json: jest.fn(),
        };
        validateEvent(req, res, () => {});
        expect(res.status).toHaveBeenCalledWith(httpStatus.StatusCodes.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({
          error: '"name" length must be at least 3 characters long',
        });
    });      
    it('should return 400 if name is more than 50 characters', () => {
        const name= "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
        const req = {
            body: {
             name,
            description: 'test description',
                },
            };
        const res = {
            status: jest.fn().mockReturnThis(), // Chainable mock
            json: jest.fn(),
        };
        validateEvent(req, res, () => {});
        expect(res.status).toHaveBeenCalledWith(httpStatus.StatusCodes.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({
            error: `"name" length must be less than or equal to 50 characters long`,
        });
    });
    it('should return 400 if description is missing', () => {
        const req = {
          body: {
            name: 'test name',
          },
        };
        const res = {
          status: jest.fn().mockReturnThis(), // Chainable mock
          json: jest.fn(),
        };
        validateEvent(req, res, () => {});
        expect(res.status).toHaveBeenCalledWith(httpStatus.StatusCodes.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({
          error: '"description" is required',
        });
    }
    );
    it('should return 400 if description is less than 5 characters', () => {
        const req = {
          body: {
            name: 'test name',
            description: 'test',
          },
        };
        const res = {
          status: jest.fn().mockReturnThis(), // Chainable mock
          json: jest.fn(),
        };
        validateEvent(req, res, () => {});
        expect(res.status).toHaveBeenCalledWith(httpStatus.StatusCodes.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({
          error: '"description" length must be at least 5 characters long',
        });
    }
    );
    it('should return 400 if description is more than 50 characters', () => {
        const description= 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        const req = {
            body: {
             name: 'test name',
            description,
                },
            };
        const res = {
            status: jest.fn().mockReturnThis(), // Chainable mock
            json: jest.fn(),
        };
        validateEvent(req, res, () => {});
        expect(res.status).toHaveBeenCalledWith(httpStatus.StatusCodes.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({
            error: `"description" length must be less than or equal to 50 characters long`,
        });
    }
    );
    it('should return 400 if applicationId is missing', () => {
        const req = {
          body: {
            name: 'test name',
            description: 'test description',
          },
        };
        const res = {
          status: jest.fn().mockReturnThis(), // Chainable mock
          json: jest.fn(),
        };
        validateEvent(req, res, () => {});
        expect(res.status).toHaveBeenCalledWith(httpStatus.StatusCodes.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({
          error: '"applicationId" is required',
        });
    }
    );

});

describe('validateUpdateEvent', () => {
    server=require('../../../index');
    afterEach(()=>{
        //delete all data from db

        server.close();
    }
    )
    it("should retun 400 if any thing else is sent in the body",()=>{
        const req = {
            body: {
              name: 'test name',
              description: 'test description',
              is_deleted: true,
              is_active: true,
              gucci: 'gucci',

            },
          };
          const res = {
            status: jest.fn().mockReturnThis(), // Chainable mock
            json: jest.fn(),
          };
          validateUpdateEvent(req, res, () => {});
          expect(res.status).toHaveBeenCalledWith(httpStatus.StatusCodes.BAD_REQUEST);
          expect(res.json).toHaveBeenCalledWith({
            error: '"gucci" is not allowed',
          });
    });
    it("should retun 400 if nothing is sent in the body",()=>{
        const req = {
            body: {
            },
          };
          const res = {
            status: jest.fn().mockReturnThis(), // Chainable mock
            json: jest.fn(),
          };
          validateUpdateEvent(req, res, () => {});
          expect(res.status).toHaveBeenCalledWith(httpStatus.StatusCodes.BAD_REQUEST);
          expect(res.json).toHaveBeenCalledWith({
            error: '"value" must contain at least one of [name, description, is_deleted, is_active]',
          });
    });
});

describe('validateNotification', () => {
    server=require('../../../index');
    afterEach(()=>{
        //delete all data from db

        server.close();
    }
    )
    it('should return 400 if name is missing', () => {
        const req = {
          body: {
            description: 'test description',
            templatebody: 'test templatebody',
          },
        };
        const res = {
          status: jest.fn().mockReturnThis(), // Chainable mock
          json: jest.fn(),
        };
        validateNotification(req, res, () => {});
        expect(res.status).toHaveBeenCalledWith(httpStatus.StatusCodes.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({
          error: '"name" is required',
        });
    });
    it('should return 400 if name is less than 3 characters', () => {
        const req = {
          body: {
            name: 'te',
            description: 'test description',
            templatebody: 'test templatebody',
          },
        };
        const res = {
          status: jest.fn().mockReturnThis(), // Chainable mock
          json: jest.fn(),
        };
        validateNotification(req, res, () => {});
        expect(res.status).toHaveBeenCalledWith(httpStatus.StatusCodes.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({
          error: '"name" length must be at least 3 characters long',
        });
    });
    it('should retun 400 if eventid is missing',()=>{
        const req = {
            body: {
              name: 'test name',
              description: 'test description',
              templatebody: 'test templatebody',
            },
          };
          const res = {
            status: jest.fn().mockReturnThis(), // Chainable mock
            json: jest.fn(),
          };
          validateNotification(req, res, () => {});
          expect(res.status).toHaveBeenCalledWith(httpStatus.StatusCodes.BAD_REQUEST);
          expect(res.json).toHaveBeenCalledWith({
            error: '"eventId" is required',
          });
    });
    it('should return 400 if description is missing', () => {
        const req = {
          body: {
            name: 'test name',
            templatebody: 'test templatebody',
            eventid: 1,
          },
        };
        const res = {
          status: jest.fn().mockReturnThis(), // Chainable mock
          json: jest.fn(),
        };
        validateNotification(req, res, () => {});
        expect(res.status).toHaveBeenCalledWith(httpStatus.StatusCodes.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({
          error: '"description" is required',
        });
    });
});

describe('validateUpdateNotification', () => {
    server=require('../../../index');
    afterEach(()=>{
        //delete all data from db

        server.close();
    }
    )
    it("should retun 400 if any thing else is sent in the body",()=>{
        const req = {
            body: {
              name: 'test name',
              description: 'test description',
              templatebody: 'test templatebody',
              is_deleted: true,
              is_active: true,
              gucci: 'gucci',

            },
          };
          const res = {
            status: jest.fn().mockReturnThis(), // Chainable mock
            json: jest.fn(),
          };
          validateUpdateNotification(req, res, () => {});
          expect(res.status).toHaveBeenCalledWith(httpStatus.StatusCodes.BAD_REQUEST);
          expect(res.json).toHaveBeenCalledWith({
            error: '"gucci" is not allowed',
          });
    });
    it("should retun 400 if nothing is sent in the body",()=>{
        const req = {
            body: {
            },
          };
          const res = {
            status: jest.fn().mockReturnThis(), // Chainable mock
            json: jest.fn(),
          };
          validateUpdateNotification(req, res, () => {});
          expect(res.status).toHaveBeenCalledWith(httpStatus.StatusCodes.BAD_REQUEST);
          expect(res.json).toHaveBeenCalledWith({
            error: '"value" must contain at least one of [name, description, templatebody, is_active, is_deleted]',
          });
    });
});

describe('validateMessage', () => {
    server=require('../../../index');
    afterEach(()=>{
        //delete all data from db

        server.close();
    }
    )
    it('should return 400 if applicationName is missing', () => {
        const req = {
          body: {
            eventName: 'test event',
            to: [
                {
                    email: 'abc@gmail.com',
                    tags: {
                        name: 'abc',
                    },
                },
            ],
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(), // Chainable mock
            json: jest.fn(),
            };
        validateMessage(req, res, () => {});
        expect(res.status).toHaveBeenCalledWith(httpStatus.StatusCodes.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({
            error: '"applicationName" is required',
        });
    });
    it('should return 400 if eventName is missing', () => {
        const req = {
          body: {
            applicationName: 'test app',
            to: [
                {
                    email: 'abc@gmail.com',
                    tags: {
                        name: 'abc',
                    },
                },
            ],
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(), // Chainable mock
            json: jest.fn(),
            };
        validateMessage(req, res, () => {});
        expect(res.status).toHaveBeenCalledWith(httpStatus.StatusCodes.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({
            error: '"eventName" is required',
        });
    });
    it('should return 400 if to is missing', () => {
        const req = {
          body: {
            applicationName: 'test app',
            eventName: 'test event',
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(), // Chainable mock
            json: jest.fn(),
            };
        validateMessage(req, res, () => {});
        expect(res.status).toHaveBeenCalledWith(httpStatus.StatusCodes.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({
            error: '"to" is required',
        });
    }
    );
    it('should return 400 if email is missing', () => {
        const req = {
          body: {
            applicationName: 'test app',
            eventName: 'test event',
            to: [
                {
                    tags: {
                        name: 'abc',
                    },
                },
            ],
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(), // Chainable mock
            json: jest.fn(),
            };
        validateMessage(req, res, () => {});
        expect(res.status).toHaveBeenCalledWith(httpStatus.StatusCodes.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith({
            error: '"to[0].email" is required',
        });
    }
    );
});