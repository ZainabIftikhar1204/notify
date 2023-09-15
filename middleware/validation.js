/* eslint-disable consistent-return */
const Joi = require('joi');
const config = require('config');
const httpStatus = require('http-status-codes');

const validateApp = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    description: Joi.string().min(5).required(),
    // is_deleted: Joi.boolean().default(false),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res
      .status(httpStatus.StatusCodes.BAD_REQUEST)
      .json({ error: error.details[0].message });
  }

  next(); // If validation passes, proceed to the next middleware/controller
};

const validateUpdateApp = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50),
    description: Joi.string().min(5),
    is_deleted: Joi.boolean(),
    is_active: Joi.boolean(),
  }).or('name', 'description', 'is_deleted', 'is_active'); // At least one of these fields is required;
  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};

const validateEvent = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    description: Joi.string().max(50).min(5).required(),
    applicationId:
      config.get('database.dbName') === 'mongodb'
        ? Joi.string().required() // For MongoDB
        : Joi.number().integer().required(), // For PostgreSQL
  });
  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};

const validateUpdateEvent = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50),
    description: Joi.string().min(5).max(50),
    is_deleted: Joi.boolean(),
    is_active: Joi.boolean(),
  }).or('name', 'description', 'is_deleted', 'is_active'); // At least one of these fields is required;
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};

const validateNotification = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    description: Joi.string().min(5).required(),
    templatebody: Joi.string().min(10).max(250).required(),
    templatesubject: Joi.string().min(10).max(50).required(),
    eventId:
      config.get('database.dbName') === 'mongodb'
        ? Joi.string().required() // For MongoDB
        : Joi.number().integer().required(), // For PostgreSQL
  });
  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};
const validateUpdateNotification = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3),
    description: Joi.string().min(5),
    templatebody: Joi.string().min(10).max(250),
    templatesubject: Joi.string().min(10).max(50),
    is_active: Joi.boolean(),
    is_deleted: Joi.boolean(),
  }).or('name', 'description', 'templatebody', 'is_active', 'is_deleted'); // At least one of these fields is required
  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};

// different tags for different messages tackel krny
const validateMessage = (req, res, next) => {
  const recipientSchema = Joi.object({
    email: Joi.string().email().required(),
    tags: Joi.object().pattern(Joi.string(), Joi.string()),
  });

  const previewNotificationSchema = Joi.object({
    applicationName: Joi.string().required(),
    eventName: Joi.string().required(),
    to: Joi.array().items(recipientSchema).required(),
  });

  const { error } = previewNotificationSchema.validate(req.body);

  if (error) {
    return res
      .status(httpStatus.StatusCodes.BAD_REQUEST)
      .json({ error: error.details[0].message });
  }

  next();
};

const validateAuth = (req, res, next) => {
  const requestAuthSchema = Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    created_at: Joi.date().default(new Date(Date.now())),
    modified_at: Joi.date().default(new Date(Date.now())),
    created_by: Joi.string().optional(),
    modified_by: Joi.string().optional(),
    is_active: Joi.boolean().default(true).optional(),
  });

  const { error } = requestAuthSchema.validate(req.body);

  if (error) {
    return res
      .status(httpStatus.StatusCodes.BAD_REQUEST)
      .json({ error: error.details[0].message });
  }

  next();
};

const validateUser = (req, res, next) => {
  const requestUserSchema = Joi.object().keys({
    name: Joi.string().required().min(3).max(255),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(8).max(1000),
    created_at: Joi.date().default(new Date(Date.now())),
    modified_at: Joi.date().default(new Date(Date.now())),
    created_by: Joi.string().optional(),
    modified_by: Joi.string().optional(),
    is_active: Joi.boolean().default(true).optional(),
  });

  const { error } = requestUserSchema.validate(req.body);

  if (error) {
    return res
      .status(httpStatus.StatusCodes.BAD_REQUEST)
      .json({ error: error.details[0].message });
  }
  next();
};

module.exports = {
  validateApp,
  validateUpdateApp,
  validateEvent,
  validateUpdateEvent,
  validateNotification,
  validateUpdateNotification,
  validateMessage,
  validateAuth,
  validateUser,
};
