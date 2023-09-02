// eslint-disable-next-line import/no-extraneous-dependencies
const httpStatus = require('http-status-codes');
const knex = require('../../startup/postgresdb/db');

async function listAllEvents(req, res) {
  const { applicationId } = req.query;
  const { filter } = req; // Default to empty filter if not specified
  const { page, limit } = req.query; // Destructure page and limit from req.query

  // Convert page and limit to integers with default values
  const currentPage = parseInt(page, 10) || 1;
  const pageSize = parseInt(limit, 10) || 3;

  // Calculate startIndex for pagination
  const startIndex = (currentPage - 1) * pageSize;

  // Check if the application with the given ID exists
  const application = await knex('applications')
    .where('id', applicationId)
    .first();

  if (!application) {
    return res.status(httpStatus.StatusCodes.NOT_FOUND).json({
      error: httpStatus.getReasonPhrase(httpStatus.StatusCodes.NOT_FOUND),
      message: 'No applications found.',
    });
  }

  // Build a query for getting total count of events associated with the application
  const totalDocumentsQuery = knex('events')
    .where('application_id', applicationId)
    .where(filter)
    .count('* as totalDocuments')
    .first();

  // Fetch the total count
  const { totalDocuments } = await totalDocumentsQuery;

  const totalPages = Math.ceil(totalDocuments / pageSize);

  // Fetch events associated with the application
  const events = await knex('events')
    .select('*')
    .where('application_id', applicationId)
    .where(filter)
    .offset(startIndex)
    .limit(pageSize);

  const paginationInfo = {
    currentPage,
    totalPages,
    pageSize,
    totalCount: totalDocuments,
  };

  return res
    .status(httpStatus.StatusCodes.OK)
    .json({ events, pagination: paginationInfo });
}

async function createEvent(req, res) {
  const { applicationId } = req.body;

  // Check if the application with the given ID exists
  const application = await knex('applications')
    .where('id', applicationId)
    .first();

  if (!application) {
    return res.status(httpStatus.StatusCodes.NOT_FOUND).json({
      error: httpStatus.getReasonPhrase(httpStatus.StatusCodes.NOT_FOUND),
      message: 'Invalid application or Application Id not given',
    });
  }

  const { name, description } = req.body;
  // check if event with same name already exists for the application
  const event = await knex('events')
    .where({ name })
    .where({ application_id: applicationId })
    .first();
  if (event) {
    return res.status(httpStatus.StatusCodes.CONFLICT).json({
      error: httpStatus.getReasonPhrase(httpStatus.StatusCodes.CONFLICT),
      message: 'Event with the name already exists.',
    });
  }

  // Insert the new event record
  const [newEvent] = await knex('events')
    .insert({
      name,
      description,
      is_deleted: false,
      is_active: true,
      application_id: applicationId,
    })
    .returning('*');

  return res.status(httpStatus.StatusCodes.CREATED).send(newEvent);
}

async function updateEvent(req, res) {
  const rest = req.body;
  const eventId = req.params.id;

  // Fetch the event by ID and application association
  let event = await knex('events').where('id', eventId).first();

  if (!event) {
    return res.status(httpStatus.StatusCodes.NOT_FOUND).json({
      error: httpStatus.getReasonPhrase(httpStatus.StatusCodes.NOT_FOUND),
      message: 'Invalid Event or Event Id not given',
    });
  }
  if (req.body.name) {
    // check if event with same name already exists for the application
    event = await knex('events').where({ name: req.body.name }).first();
    if (event) {
      return res.status(httpStatus.StatusCodes.CONFLICT).json({
        error: httpStatus.getReasonPhrase(httpStatus.StatusCodes.CONFLICT),
        message: 'Event with the name already exists.',
      });
    }
  }

  const updatedEvent = rest;

  // Update the event record
  const [updatedCount] = await knex('events')
    .where('id', eventId)
    .update(updatedEvent)
    .returning('*');
  if (updatedCount === 0) {
    return res.status(httpStatus.StatusCodes.NOT_FOUND).json({
      error: httpStatus.getReasonPhrase(httpStatus.StatusCodes.NOT_FOUND),
      message: 'Event with the name already exists.',
    });
  }

  return res.status(httpStatus.StatusCodes.OK).json(updatedCount);
}

exports.listAllEvents = listAllEvents;
exports.createEvent = createEvent;
exports.updateEvent = updateEvent;
