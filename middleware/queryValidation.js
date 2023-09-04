/* eslint-disable consistent-return */
const Joi = require('joi');
const config = require('config');

const getAppFilters = (req, res, next) => {
  const schema = Joi.object({
    // is_deleted: Joi.boolean(),
    is_active: Joi.boolean(),
    name: Joi.string(),
    description: Joi.string(),
    sort: Joi.string().valid('asc', 'desc'),
    sortby: Joi.string().valid('name', 'is_active', 'created_at', 'updated_at'),
    page: Joi.number(), // Allow the page parameter
    limit: Joi.number(), // Allow the limit parameter
  });

  const validatedData = schema.validate(req.query);
  if (validatedData.error) {
    return res
      .status(400)
      .json({ error: validatedData.error.details[0].message });
  }
  const { page, limit, sort, sortby, ...filter } = validatedData.value; // Destructure to exclude page, limit, and sort
  filter.is_deleted = false;
  req.filter = filter;
  next();
};

const getEventFilters = (req, res, next) => {
  const schema = Joi.object({
    is_active: Joi.boolean(),
    name: Joi.string(),
    description: Joi.string(),
    applicationId:
      config.get('database.dbName') === 'mongodb'
        ? Joi.string().required() // For MongoDB
        : Joi.number().integer().required(), // For PostgreSQL
    sort: Joi.string().valid('asc', 'desc'),
    sortby: Joi.string().valid('name', 'is_active', 'created_at', 'updated_at'),
    page: Joi.number(),
    limit: Joi.number(),
  });
  const validatedData = schema.validate(req.query);
  if (validatedData.error) {
    return res
      .status(400)
      .json({ error: validatedData.error.details[0].message });
  }
  const { page, limit, sort, sortby, ...filter } = validatedData.value; // Destructure to exclude page, limit, and sort
  filter.is_deleted = false;
  req.filter = filter;
  next();
};
const getNotificationFilters = (req, res, next) => {
  const schema = Joi.object({
    is_deleted: Joi.boolean(),
    is_active: Joi.boolean(),
    name: Joi.string(),
    description: Joi.string(),
    eventId:
      config.get('database.dbName') === 'mongodb'
        ? Joi.string().required() // For MongoDB
        : Joi.number().integer().required(), // For PostgreSQL
    sort: Joi.string(),
    page: Joi.number(),
    limit: Joi.number(),
  });
  const validatedData = schema.validate(req.query);
  if (validatedData.error) {
    return res
      .status(400)
      .json({ error: validatedData.error.details[0].message });
  }
  const { page, limit, sort, eventId, ...filter } = validatedData.value; // Destructure to exclude page, limit, and sort
  req.filter = filter;
  next();
};

exports.getAppFilters = getAppFilters;
exports.getEventFilters = getEventFilters;
exports.getNotificationFilters = getNotificationFilters;
